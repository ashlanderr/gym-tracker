#!/bin/bash
set -euo pipefail

SCRIPT_PATH=$(realpath "${BASH_SOURCE[0]}")
cd "$(dirname "$SCRIPT_PATH")"

export APP_ENV=$1
export ENV_FILE=".env.$APP_ENV"
echo "[DEPLOY] Injecting environment variables from [$ENV_FILE]..."

secrets_json="$(dotenvx get -f $ENV_FILE --format json)"
for x in $(echo "$secrets_json" | jq -r 'keys[]' | tr -d '\r'); do
    [ -z "$x" ] && continue
    VALUE=$(echo "$secrets_json" | jq -r ".$x" | tr -d '\r')
    export "$x"="$VALUE"
done

PRIVATE_KEY_NAME="DOTENV_PRIVATE_KEY_${APP_ENV^^}"
export DOTENV_PRIVATE_KEY=$(dotenvx get $PRIVATE_KEY_NAME -f ".env.keys")
echo "[DEPLOY] Using private key: [$PRIVATE_KEY_NAME]"

echo "[DEPLOY] Deploying to [$DOMAIN_NAME]..."
SSH_HOST="root@$DOMAIN_NAME"
DOCKER_HOST="ssh://$SSH_HOST"

APP_COMPOSE="-f docker-compose.app.yml -p $PREFIX_NAME"
echo "[DEPLOY] App Compose Files: [$APP_COMPOSE]"

PROXY_COMPOSE="-f docker-compose.proxy.yml -p proxy"
echo "[DEPLOY] Proxy Compose Files: [$PROXY_COMPOSE]"

REMOTE_DIR="/opt/$PREFIX_NAME"
echo "[DEPLOY] Remote dir: [$REMOTE_DIR]..."

# --no-interpolate: the resolved config would print decrypted secrets to the log
printf "\n[DEPLOY] Compose Config:\n"
printf "==================================================\n"
docker compose $APP_COMPOSE config --no-interpolate
printf "==================================================\n\n"

echo "[DEPLOY] Building images..."
docker compose $APP_COMPOSE build

echo "[DEPLOY] Pulling third-party images..."
docker compose $APP_COMPOSE pull --ignore-buildable

echo "[DEPLOY] Installing docker..."
ssh $SSH_HOST apt-get update
ssh $SSH_HOST apt-get install -y docker.io docker-compose-v2 rsync

echo "[DEPLOY] Deploying proxy..."
DOCKER_HOST=$DOCKER_HOST docker compose $PROXY_COMPOSE up -d --remove-orphans

echo "[DEPLOY] Syncing images to server..."
IMAGES=$(docker compose $APP_COMPOSE config --images)
echo "[DEPLOY] Images: [$IMAGES]"
ssh $SSH_HOST mkdir -p "$REMOTE_DIR"
TAR_FILE=$(mktemp -u)
trap 'rm -f "$TAR_FILE"' EXIT
docker save -o "$TAR_FILE" $IMAGES
# No --inplace: rsync can then build the new file from any block of the old one,
# so layers that merely moved inside the tar are not re-sent
rsync -az -e ssh "$TAR_FILE" "$SSH_HOST:$REMOTE_DIR/images.tar"
rm -f "$TAR_FILE"
trap - EXIT

echo "[DEPLOY] Loading images on server..."
ssh $SSH_HOST docker load -i "$REMOTE_DIR/images.tar"

echo "[DEPLOY] Deploying app..."
DOCKER_HOST=$DOCKER_HOST docker compose $APP_COMPOSE up -d --remove-orphans

echo "[DEPLOY] Pruning old images..."
DOCKER_HOST=$DOCKER_HOST docker image prune -af

#!/bin/sh
set -euo pipefail

target="s3:$BACKUP_S3_BUCKET/postgres"
name="$(date -u +%Y-%m-%dT%H-%M-%SZ).dump.gpg"
file="/tmp/$name"
trap 'rm -f "$file"' EXIT

pg_dump --format=custom \
  | gpg --batch --pinentry-mode loopback --passphrase "$BACKUP_PASSPHRASE" \
    --symmetric --cipher-algo AES256 --output "$file"
rclone copyto "$file" "$target/$name"
echo "backup: uploaded $name"

rclone delete --min-age "${BACKUP_KEEP_DAYS}d" "$target"

#!/bin/sh
set -euo pipefail

source="s3:$BACKUP_S3_BUCKET/postgres"
name="${1:-$(rclone lsf "$source" | sort | tail -n 1)}"
echo "restore: $name"

rclone cat "$source/$name" \
  | gpg --batch --pinentry-mode loopback --passphrase "$BACKUP_PASSPHRASE" --decrypt \
  | pg_restore --clean --if-exists --no-owner --dbname "$PGDATABASE"

FROM postgres:17-alpine
RUN apk add --no-cache rclone gnupg supercronic
ENV RCLONE_CONFIG=/dev/null \
    RCLONE_CONFIG_S3_TYPE=s3 \
    RCLONE_CONFIG_S3_PROVIDER=Other \
    RCLONE_CONFIG_S3_ENV_AUTH=false
COPY backup.sh restore.sh /usr/local/bin/
COPY crontab /etc/backup.crontab
ENTRYPOINT []
CMD ["sh", "-c", "backup.sh && exec supercronic /etc/backup.crontab"]

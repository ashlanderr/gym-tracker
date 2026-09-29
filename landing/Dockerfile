FROM caddy:2-alpine
COPY index.html /srv/
CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":80"]

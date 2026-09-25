# syntax=docker/dockerfile:1

# Only the Yjs sync server goes into the image: the frontend is deployed to GitHub Pages.
# server/ has its own lockfile so the image doesn't carry the frontend toolchain.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
# node_modules goes first as a separate layer: it only changes with the lockfile,
# so incremental image sync ships just the small server.js layer on most deploys.
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server/server.js ./
ENV HOST=0.0.0.0 PORT=1234 YPERSISTENCE=/data
VOLUME /data
EXPOSE 1234
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD ["node", "-e", "fetch('http://localhost:1234/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "server.js"]

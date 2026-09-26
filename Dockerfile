# syntax=docker/dockerfile:1

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
# The npm cache stays out of the layer, it would ship to the server on every lockfile change
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npm run db:generate
COPY src/server ./src/server
EXPOSE 5000
CMD ["sh", "-c", "npm run db:deploy && exec node src/server/main.ts"]

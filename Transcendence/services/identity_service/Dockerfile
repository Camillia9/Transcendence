FROM node:22-alpine
WORKDIR /app

COPY identity_service/package.json identity_service/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY identity_service/ ./identity_service/

RUN npx prisma generate --schema prisma/schema.prisma

EXPOSE 3001
CMD ["node", "identity_service/srcs/server.js"]

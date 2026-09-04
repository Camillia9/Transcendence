FROM node:22-alpine
WORKDIR /app

COPY chat_service/package.json chat_service/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY chat_service/ ./chat_service/

RUN npx prisma generate --schema prisma/schema.prisma

EXPOSE 3002
CMD ["node", "chat_service/srcs/server.js"]

FROM node:22-alpine
WORKDIR /app

COPY workspace_service/package.json workspace_service/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY workspace_service/ ./workspace_service/

RUN npx prisma generate --schema prisma/schema.prisma

EXPOSE 3003
CMD ["npm", "run", "start"]

FROM node:22-alpine
WORKDIR /app

COPY workspace_service/package.json ./package.json
RUN npm install

COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY workspace_service/ ./workspace_service/

RUN npx prisma generate --schema prisma/schema.prisma

EXPOSE 3003
CMD ["node", "workspace_service/srcs/server.js"]

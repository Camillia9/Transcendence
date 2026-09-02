FROM node:22-alpine
WORKDIR /app

COPY chat_service/package.json ./package.json
RUN npm install

COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY chat_service/ ./chat_service/

RUN npx prisma generate --schema prisma/schema.prisma

EXPOSE 3002
CMD ["node", "chat_service/srcs/server.js"]

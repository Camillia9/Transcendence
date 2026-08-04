FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY chat_service/ ./chat_service/

RUN npx prisma generate --schema prisma/schema.prisma

EXPOSE 3002
CMD ["node", "chat_service/srcs/server.js"]

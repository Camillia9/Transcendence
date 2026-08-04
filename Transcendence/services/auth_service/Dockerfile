FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY auth_service/ ./auth_service/

EXPOSE 3001
CMD ["node", "auth_service/srcs/server.js"]

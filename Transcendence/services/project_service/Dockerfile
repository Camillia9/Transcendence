FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY project_service/ ./project_service/

EXPOSE 3003
CMD ["node", "project_service/srcs/server.js"]

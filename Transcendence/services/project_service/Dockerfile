FROM node:20-alpine
WORKDIR /app

COPY project_service/package.json ./package.json
RUN npm install

COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY project_service/ ./project_service/

RUN npx prisma generate --schema prisma/schema.prisma

EXPOSE 3003
CMD ["node", "project_service/srcs/server.js"]

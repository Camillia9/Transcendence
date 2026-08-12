FROM node:20-alpine
WORKDIR /app

COPY identity_service/package.json ./package.json
RUN npm install

COPY shared/ ./shared/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY identity_service/ ./identity_service/

RUN npx prisma generate --schema prisma/schema.prisma

EXPOSE 3001
CMD ["node", "identity_service/srcs/server.js"]

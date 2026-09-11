FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "start"]

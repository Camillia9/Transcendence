FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 3000 pour npm run start. 
EXPOSE 3000 
CMD ["npm", "run", "start"]
FROM node:alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm install && npm run build
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public
COPY .env ./.env  || true

EXPOSE 3001
CMD ["npm", "start"]

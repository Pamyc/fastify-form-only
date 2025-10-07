FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/next/.next ./next/.next
COPY --from=builder /app/next/next.config.mjs ./next/next.config.mjs
COPY --from=builder /app/next/public ./next/public
COPY --from=builder /app/package*.json ./
EXPOSE 3001
CMD ["npm", "start"]

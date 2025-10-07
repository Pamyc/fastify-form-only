# Production container for single-process Fastify + Next.js
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN --mount=type=cache,target=/root/.npm     --mount=type=cache,target=/root/.pnpm     if [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile;     elif [ -f package-lock.json ]; then npm ci;     elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile;     else npm i; fi

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/web/.next ./web/.next
COPY web/public ./web/public
COPY package.json .
EXPOSE 3000
CMD ["node", "dist/server/index.js"]

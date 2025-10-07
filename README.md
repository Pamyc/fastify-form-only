# Fastify + Next.js (интегрировано) — один сервис

## Запуск локально
```bash
cp .env.example .env
npm ci
npm run build
npm start
# http://localhost:3001
```

## Маршруты
- `/` — Next.js
- `/dashboard`, `/chat`, `/timeline`
- `/api/health`, `/api/feedback`, `/api/chat`, `/api/events`, `/api/stats`

## Timeweb Cloud
- Тип: Backend → Node.js → Fastify
- Node: 22
- Install: `npm ci`
- Build: `npm run build`
- Start: `npm start`
- ENV: `PORT=3001`, `CORS_ORIGIN=`

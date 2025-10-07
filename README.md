# Fastify (Node.js 22) — форма + API в одном приложении (Timeweb Cloud-ready)

## Запуск локально
```bash
cp .env.example .env
npm ci
npm run dev
# откройте http://localhost:3001
```

## Маршруты
- `/` — статическая страница с HTML-формой
- `GET /api/health` — проверка
- `POST /api/feedback` — body: `{ name, email, message }`

## Деплой на Timeweb Cloud (как на шаблоне Backend → Fastify)
- Версия Node: 22
- Install: `npm ci`
- Start: `npm start`
- Переменные окружения:
  - `PORT` (например 3001 или порт, который отдаёт платформа)
  - `CORS_ORIGIN` (оставьте пустым, если фронт тот же домен; задавайте `*` или regex только для кросс-доменных запросов)

## Docker (опционально)
```bash
docker build -t fastify-form-only .
docker run -p 3001:3001 --env PORT=3001 fastify-form-only
```

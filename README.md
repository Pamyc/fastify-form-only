# Fastify + Next (final)
- Импорт компонентов из архива в `next/components/**`
- Страница `/event-analysis` импортирует `../components/_page/page`
- Файл-адаптер `next/components/_page/page.tsx` внутри уже импортирует лучший найденный компонент из архива

## Запуск
cp .env.example .env
npm ci
npm run build
npm start
# http://localhost:3001

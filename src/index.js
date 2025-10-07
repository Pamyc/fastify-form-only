import Fastify from 'fastify';
import dotenv from 'dotenv';
import next from 'next';
import cors from '@fastify/cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || ''; // empty => same-origin

const server = Fastify({ logger: true });

if (CORS_ORIGIN) {
  await server.register(cors, {
    origin: CORS_ORIGIN === '*' ? true : new RegExp(CORS_ORIGIN),
    methods: ['GET','POST','OPTIONS']
  });
}

// API routes
server.get('/api/health', async () => ({ ok: true, service: 'fastify-next-integrated' }));

server.post('/api/feedback', async (request, reply) => {
  const { name, email, message } = request.body ?? {};
  if (!name || !email || !message) {
    reply.code(400);
    return { error: 'name, email, and message are required' };
  }
  server.log.info({ name, email, message }, 'Received feedback');
  reply.code(201);
  return { ok: true, received: { name, email, message } };
});

server.get('/api/stats', async () => ({
  users: 1280,
  active: 342,
  conversion: 12.5,
  ticketsOpen: 17
}));

server.get('/api/events', async () => ([
  { id: 1, title: 'Запуск релиза 1.2', date: '2025-10-01', desc: 'Основные багфиксы и улучшения UI' },
  { id: 2, title: 'Демо заказчику', date: '2025-10-03', desc: 'Показали ключевые фичи' },
  { id: 3, title: 'Инцидент #542', date: '2025-10-05', desc: 'Кратковременная деградация API' },
  { id: 4, title: 'Планирование Q4', date: '2025-10-08', desc: 'Сформирован роадмап квартала' }
]));

server.post('/api/chat', async (request, reply) => {
  const { message } = request.body ?? {};
  if (!message) { reply.code(400); return { error: 'message is required' }; }
  return { reply: `🤖 Мок-бот: принял "${message}". Здесь будет ответ от модели.` };
});

// Next.js integration
const nextApp = next({
  dev,
  dir: join(__dirname, '..', 'next')
});
await nextApp.prepare();
const handle = nextApp.getRequestHandler();

server.all('/*', (req, reply) => {
  reply.hijack();
  handle(req.raw, reply.raw);
});

const start = async () => {
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    server.log.info(`Server listening on ${PORT} (dev=${dev})`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

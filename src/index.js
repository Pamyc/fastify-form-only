import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ logger: true });

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || null; // null => same-origin only

if (CORS_ORIGIN) {
  await fastify.register(cors, {
    origin: CORS_ORIGIN === '*' ? true : new RegExp(CORS_ORIGIN),
    methods: ['GET', 'POST', 'OPTIONS']
  });
}

// Serve static files (index.html) from /public
await fastify.register(fastifyStatic, {
  root: join(__dirname, '..', 'public'),
  prefix: '/', // index.html will be served on '/'
});

// Health route
fastify.get('/api/health', async () => {
  return { ok: true, service: 'fastify-backend' };
});

// Form handler
fastify.post('/api/feedback', async (request, reply) => {
  const { name, email, message } = request.body ?? {};
  if (!name || !email || !message) {
    reply.code(400);
    return { error: 'name, email, and message are required' };
  }
  fastify.log.info({ name, email, message }, 'Received feedback');
  reply.code(201);
  return { ok: true, received: { name, email, message } };
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

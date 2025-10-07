import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';

export function buildFastify() {
  const app = Fastify({ logger: true });

  // Security & cookies
  app.register(helmet);
  app.register(cookie, { secret: process.env.COOKIE_SECRET });

  // Health check
  app.get('/api/healthz', async () => ({ ok: true }));

  return app;
}

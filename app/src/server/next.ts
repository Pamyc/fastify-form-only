import next from 'next';
import type { FastifyInstance } from 'fastify';

export async function registerNext(app: FastifyInstance) {
  const dev = process.env.NODE_ENV !== 'production';
  const nextApp = next({ dev, dir: './web' });
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  // Catch-all handler that forwards to Next for all non-API routes
  app.all('/*', async (req, reply) => {
    // If the path starts with /api, we let Fastify handle (no forwarding)
    if (req.url.startsWith('/api/')) return;

    // Delegate to Next.js
    // @ts-ignore Fastify req/res are compatible with Node's interfaces here
    await handle(req.raw, reply.raw);
    reply.hijack();
  });
}

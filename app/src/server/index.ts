import { buildFastify } from './fastify.js';
import { registerNext } from './next.js';
import { registerTodoRoutes } from '../routes/todos.js';

const app = buildFastify();

// Register API routes first
await app.register(registerTodoRoutes);

// Then hand off everything else to Next.js
await registerNext(app);

const port = Number(process.env.PORT ?? 3000);
const host = '0.0.0.0';

app
  .listen({ port, host })
  .then(() => app.log.info(`🚀 Server listening on http://${host}:${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });

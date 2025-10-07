import type { FastifyInstance } from 'fastify';

export async function registerTodoRoutes(app: FastifyInstance) {
  app.get('/api/todos', async () => {
    return [
      { id: 1, text: 'Ship single-process starter', done: false },
      { id: 2, text: 'Add auth', done: false },
    ];
  });
}

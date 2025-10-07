export default async function Home() {
  // Next.js server component fetching Fastify API
  const res = await fetch('/api/todos', { cache: 'no-store' });
  const todos = await res.json();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Fastify + Next.js (Single Process)</h1>
      <p>Below data is fetched from Fastify API route <code>/api/todos</code>.</p>
      <pre>{JSON.stringify(todos, null, 2)}</pre>
    </main>
  );
}

export default function Page() {
  return (
    <main style={{ display:'grid', gap: 12 }}>
      <h1>Приложение на Fastify + Next.js</h1>
      <p>Единый сервис: API на Fastify и UI на Next.js под одним доменом.</p>
      <ul>
        <li><a href="/dashboard">Дашборд</a></li>
        <li><a href="/chat">Чат</a></li>
        <li><a href="/timeline">Таймлайн</a></li>
      </ul>
      <p>Health-check: <code>/api/health</code></p>
    </main>
  );
}

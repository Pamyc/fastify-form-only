export const metadata = {
  title: 'Fastify + Next.js',
  description: 'Демо: дашборд, чат, таймлайн'
};
export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
          <header style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16 }}>
            <a href="/" style={{ fontWeight:700, textDecoration:'none' }}>Fastify + Next</a>
            <nav style={{ display:'flex', gap:12 }}>
              <a href="/dashboard">Дашборд</a>
              <a href="/chat">Чат</a>
              <a href="/timeline">Таймлайн</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

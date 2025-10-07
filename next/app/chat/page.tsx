'use client';
import { useState } from 'react';
type Msg = { role: 'user' | 'bot'; text: string };
export default function Chat() {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  async function send() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setMsgs(m => [...m, { role:'user', text }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      setMsgs(m => [...m, { role:'bot', text: data.reply ?? '...' }]);
    } catch (e) {
      setMsgs(m => [...m, { role:'bot', text: 'Ошибка запроса' }]);
    } finally {
      setLoading(false);
    }
  }
  return (
    <main style={{ display:'grid', gap: 12 }}>
      <h1>Чат</h1>
      <div style={{ border:'1px solid #ddd', borderRadius:12, padding:16, minHeight:280 }}>
        {msgs.length === 0 && <p style={{ color:'#666' }}>Начни диалог…</p>}
        {msgs.map((m, i) => (
          <p key={i} style={{ textAlign: m.role==='user'?'right':'left' }}>
            <span style={{ display:'inline-block', padding:'8px 12px', borderRadius:12, background: m.role==='user'?'#eef':'#eee' }}>
              {m.text}
            </span>
          </p>
        ))}
        {loading && <p style={{ color:'#666' }}>Бот печатает…</p>}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Напиши сообщение…" style={{ padding:10, borderRadius:8, border:'1px solid #ccc' }} />
        <button onClick={send} disabled={loading} style={{ padding:'10px 16px', borderRadius:8, border:'1px solid #333' }}>Отправить</button>
      </div>
    </main>
  );
}

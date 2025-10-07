'use client';

import { useState } from 'react';
import { sendChat } from '../../lib/chatClient';

type Msg = { role: 'user'|'assistant', content: string };

export default function ChatPage(){
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSend(){
    if(!input.trim()) return;
    const content = input.trim();
    setInput('');
    setMessages(m => [...m, { role:'user', content }]);
    setBusy(true);
    try{
      const data = await sendChat(content);
      const reply = typeof data === 'string' ? data : (data.reply ?? JSON.stringify(data));
      setMessages(m => [...m, { role:'assistant', content: reply }]);
    }catch(e:any){
      setMessages(m => [...m, { role:'assistant', content: 'Ошибка: ' + (e?.message || 'unknown') }]);
    }finally{
      setBusy(false);
    }
  }

  return (
    <main style={{padding:24, display:'grid', gap:16}}>
      <h1 style={{margin:0}}>Чат с нейросетью</h1>
      <div style={{border:'1px solid #e5e7eb', borderRadius:12}}>
        <div style={{padding:12, height:360, overflow:'auto', display:'grid', gap:8}}>
          {messages.map((m,i)=>(
            <div key={i} style={{
              justifySelf: m.role==='user' ? 'end' : 'start',
              background: m.role==='user' ? '#e0f2fe' : '#f1f5f9',
              border:'1px solid #e5e7eb', borderRadius:12, padding:'8px 12px', maxWidth:'80%'
            }}>{m.content}</div>
          ))}
          {!messages.length && (
            <div style={{color:'#6b7280'}}>Напишите сообщение ниже и нажмите Отправить…</div>
          )}
        </div>
        <div style={{display:'flex', gap:8, padding:12, borderTop:'1px solid #e5e7eb'}}>
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); } }}
            placeholder="Ваш запрос…"
            style={{flex:1, padding:'10px 12px', borderRadius:10, border:'1px solid #e5e7eb'}}
          />
          <button disabled={busy} onClick={handleSend} style={{padding:'10px 14px', borderRadius:10, border:'1px solid #e5e7eb', background: busy?'#e5e7eb':'white'}}>
            {busy ? 'Отправка…' : 'Отправить'}
          </button>
        </div>
      </div>
      <p style={{color:'#6b7280', fontSize:12}}>Ожидается Fastify эндпоинт <code>POST /api/chat</code> со схемой {`{ prompt: string }`} и ответом {`{ reply: string }`}.</p>
    </main>
  );
}

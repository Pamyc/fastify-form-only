'use client';
import { useEffect, useState } from 'react';
type EventItem = { id:number; title:string; date:string; desc:string };
export default function Timeline() {
  const [items, setItems] = useState<EventItem[]>([]);
  useEffect(() => { fetch('/api/events').then(r=>r.json()).then(setItems).catch(console.error); }, []);
  return (
    <main style={{ display:'grid', gap: 12 }}>
      <h1>Таймлайн</h1>
      <div style={{ overflowX:'auto', paddingBottom:8 }}>
        <div style={{ display:'grid', gridAutoFlow:'column', gap:12, scrollSnapType:'x mandatory' }}>
          {items.map(it => (
            <article key={it.id} style={{ minWidth:260, border:'1px solid #ddd', borderRadius:12, padding:16, scrollSnapAlign:'start' }}>
              <div style={{ fontSize:12, color:'#666' }}>{it.date}</div>
              <h3 style={{ margin:'6px 0' }}>{it.title}</h3>
              <p style={{ margin:0 }}>{it.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

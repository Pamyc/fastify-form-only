'use client';
import { useEffect, useState } from 'react';
type Stats = { users:number; active:number; conversion:number; ticketsOpen:number };
export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { fetch('/api/stats').then(r=>r.json()).then(setStats).catch(console.error); }, []);
  return (
    <main style={{ display:'grid', gap: 12 }}>
      <h1>Дашборд</h1>
      {!stats ? <p>Загрузка…</p> : (
        <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(2,minmax(0,1fr))' }}>
          <Card title="Пользователи" value={stats.users} />
          <Card title="Активные" value={stats.active} />
          <Card title="Конверсия, %" value={stats.conversion} suffix="%" />
          <Card title="Открытые тикеты" value={stats.ticketsOpen} />
        </div>
      )}
    </main>
  );
}
function Card({ title, value, suffix='' }: { title:string; value:number; suffix?:string }) {
  return (
    <div style={{ border:'1px solid #ddd', borderRadius:12, padding:16 }}>
      <div style={{ fontSize:12, color:'#666' }}>{title}</div>
      <div style={{ fontSize:28, fontWeight:700 }}>{value}{suffix}</div>
      <div style={{ marginTop:8, height:8, borderRadius:8, background:'#eee', overflow:'hidden' }}>
        <div style={{ width: Math.min(100, Number(value)) + '%', height:'100%' }} />
      </div>
    </div>
  );
}

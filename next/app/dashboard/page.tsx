'use client';

import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function genData(n=24){
  const arr = [];
  for (let i=0;i<n;i++){
    arr.push({ hour: `${i}:00`, value: Math.round(40 + Math.random()*60) });
  }
  return arr;
}

export default function DashboardPage(){
  const [points] = useState(genData());
  const avg = useMemo(()=> Math.round(points.reduce((s,p)=>s+p.value,0)/points.length),[points]);

  return (
    <main style={{padding:24, display:'grid', gap:16}}>
      <h1 style={{margin:0}}>Интерактивный дашборд</h1>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:16}}>
        <div style={{padding:16, border:'1px solid #e5e7eb', borderRadius:12}}>
          <div style={{fontSize:12, color:'#6b7280'}}>Среднее</div>
          <div style={{fontSize:28, fontWeight:600}}>{avg}</div>
        </div>
        <div style={{padding:16, border:'1px solid #e5e7eb', borderRadius:12}}>
          <div style={{fontSize:12, color:'#6b7280'}}>Точек</div>
          <div style={{fontSize:28, fontWeight:600}}>{points.length}</div>
        </div>
      </div>

      <div style={{height:320, border:'1px solid #e5e7eb', borderRadius:12, padding:8}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}

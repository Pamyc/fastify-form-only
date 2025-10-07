// next/lib/event-analysis-client.ts
export type EventItem = { id: string|number; title: string; date: string; desc?: string };
export async function listEvents(){ const r = await fetch('/api/events', {cache:'no-store'}); if(!r.ok) throw new Error(await r.text()); return r.json(); }
export async function sendChat(message: string){ const r = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({ message })}); if(!r.ok) throw new Error(await r.text()); return r.json(); }
const client = { listEvents, sendChat };
export default client;

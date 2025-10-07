// next/lib/event-analysis-client.ts
// Универсальный клиент для страницы Event Analysis.
// Работает с Fastify API: GET /api/events, POST /api/chat { message } -> { reply }.
export type EventItem = {
  id: string | number;
  title: string;
  date: string; // ISO или YYYY-MM-DD
  desc?: string;
};

// ---- EVENTS ---------------------------------------------------------
export async function listEvents(): Promise<EventItem[]> {
  const res = await fetch('/api/events', { cache: 'no-store' });
  if (!res.ok) throw new Error(`events: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function createEvent(payload: Omit<EventItem, 'id'>) {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`createEvent: ${res.status} ${await res.text()}`);
  return res.json();
}

// ---- CHAT -----------------------------------------------------------
export async function sendChat(message: string): Promise<{ reply: string }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`chat: ${res.status} ${await res.text()}`);
  return res.json();
}

// ---- DEFAULT EXPORT -------------------------------------------------
const client = { listEvents, createEvent, sendChat };
export default client;

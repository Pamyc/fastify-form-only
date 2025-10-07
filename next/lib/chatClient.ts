export async function sendChat(prompt: string){
  const res = await fetch('/api/chat', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ prompt })
  });
  if(!res.ok){
    const text = await res.text();
    throw new Error(text || 'Chat API error');
  }
  return res.json();
}

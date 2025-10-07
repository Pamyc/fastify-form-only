// next/lib/event-analysis-client.ts

// Типы данных, которые ожидает фронтенд
export type ReferenceStats = {
  users: number;
  pipelines: number;
  statuses: number;
};

// Поскольку бэкенд не реализован, мы создаем мок-функции,
// которые имитируют обращение к API.

export async function fetchLeadTimeline(leadId: string) {
  console.log(`[mock] Запрос таймлайна для сделки ${leadId}`);
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Возвращаем пустой массив, так как реальных данных нет.
  // Фронтенд обработает это корректно.
  return [];
}

export async function fetchReferenceStats() {
  console.log(`[mock] Запрос справочников`);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Возвращаем мок-объект со статистикой
  return { users: 10, pipelines: 3, statuses: 15 };
}

export async function requestGemini(prompt: string) {
  console.log(`[mock] Запрос к нейросети с промптом: "${prompt}"`);
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Имитируем ответ от нейросети.
  // Важно, чтобы объект содержал поле `text`, как ожидает фронтенд.
  return { text: "Это мок-ответ от нейросети. Бэкенд для этой функции еще не реализован." };
}

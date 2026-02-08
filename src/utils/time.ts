// src/utils/time.ts
// Utilitários de tempo centralizados

/**
 * Converte string "HH:MM" em minutos totais do dia
 * Ex: "08:30" => 510
 */
export const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Retorna data de HOJE no formato YYYY-MM-DD
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Retorna data de ONTEM no formato YYYY-MM-DD
 */
export const getYesterdayDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

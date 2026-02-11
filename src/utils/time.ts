// src/utils/time.ts

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
 * Formata data local como YYYY-MM-DD sem conversão para UTC.
 * Usa getFullYear/getMonth/getDate para respeitar o fuso do dispositivo.
 */
const formatLocalDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Retorna data de HOJE no formato YYYY-MM-DD (local)
 */
export const getTodayDate = (): string => {
  return formatLocalDate(new Date());
};

/**
 * Retorna data de ONTEM no formato YYYY-MM-DD (local)
 */
export const getYesterdayDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatLocalDate(date);
};

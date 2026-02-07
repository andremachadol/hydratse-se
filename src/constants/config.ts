// src/constants/config.ts
// Configurações centralizadas do app

// Fórmula de hidratação
export const ML_PER_KG = 35;

// Peso
export const DEFAULT_WEIGHT = 70;
export const MIN_WEIGHT = 20;
export const MAX_WEIGHT = 650;
export const HEALTH_WARNING_WEIGHT = 200;

// Horários padrão
export const DEFAULT_START_TIME = '08:00';
export const DEFAULT_END_TIME = '22:00';

// Intervalo de lembretes (minutos)
export const DEFAULT_INTERVAL_MINUTES = 60;

// Arredondamento do copo (ml)
export const ROUNDING_STEP = 10;

// Notificações
export const REMINDER_COUNT = 5;
export const REMINDER_INTERVAL_HOURS = 1;

// Fallback para quantidade de água
export const FALLBACK_DRINK_AMOUNT = 250;

// Calculado: meta padrão
export const DEFAULT_DAILY_GOAL = DEFAULT_WEIGHT * ML_PER_KG;

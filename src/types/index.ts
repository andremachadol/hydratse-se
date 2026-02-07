// src/types/index.ts

// Define o formato de um "gole" de água
export interface Drink {
  id: number;
  amount: number;
  timestamp: Date; // ou string, dependendo de como salvamos, mas Date na memória é melhor
}

// Define as configurações do usuário
export interface UserConfig {
  dailyGoalMl: number;
  perDrinkMl: number;
}

// Define o progresso do dia
export interface DayProgress {
  consumedMl: number;
  drinks: Drink[];
  streak: number;
  lastDrinkDate: string; // YYYY-MM-DD
}

// Define o que o nosso Hook retorna (a interface pública dele)
export interface WaterTrackerReturn {
  config: UserConfig;
  progress: DayProgress;
  saveConfig: (newConfig: UserConfig) => Promise<void>;
  addDrink: () => Promise<void>;
  undoLastDrink: () => Promise<void>;
  resetDay: () => void;
}
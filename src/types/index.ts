// src/types/index.ts

export interface Drink {
  id: number;
  amount: number;
  timestamp: string; // ISO string format
}

// A Configuração agora reflete a Rotina do usuário
export interface UserConfig {
  weight: number;        // Peso em Kg (base do cálculo)
  startTime: string;     // Hora de acordar "08:00"
  endTime: string;       // Hora de dormir "22:00"
  intervalMinutes: number; // 30 ou 60 minutos
  // O dailyGoal ainda existe, mas é calculado baseado no peso
  dailyGoalMl: number; 
}

export interface DayProgress {
  consumedMl: number;
  drinks: Drink[];
  streak: number;
  lastDrinkDate: string;
}

export interface WaterTrackerReturn {
  config: UserConfig;
  progress: DayProgress;
  nextDrinkAmount: number; // <--- O novo valor dinâmico
  isLoading: boolean;
  saveConfig: (newConfig: UserConfig) => Promise<void>;
  addDrink: () => Promise<void>;
  undoLastDrink: () => Promise<void>;
  resetDay: () => void;
}
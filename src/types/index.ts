// src/types/index.ts

export type CalculationMode = 'auto' | 'manual';

export interface Drink {
  id: string;
  amount: number;
  timestamp: string;
}

export interface UserConfig {
  weight: number;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  dailyGoalMl: number;
  notificationsEnabled: boolean;
  mode: CalculationMode;
  manualCupSize: number;
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
  nextDrinkAmount: number;
  isLoading: boolean;
  saveConfig: (newConfig: UserConfig) => Promise<void>;
  addDrink: () => Promise<void>;
  undoLastDrink: () => Promise<void>;
  resetDay: () => void;
}

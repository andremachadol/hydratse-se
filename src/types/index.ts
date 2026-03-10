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

export interface DayHistoryEntry {
  date: string;
  consumedMl: number;
}

export interface BestDayRecord {
  date: string;
  consumedMl: number;
}

export interface DayProgress {
  consumedMl: number;
  drinks: Drink[];
  streak: number;
  lastDrinkDate: string;
  dayHistory?: DayHistoryEntry[];
  bestDay?: BestDayRecord;
  goalOverrideMl?: number;
  goalOverrideDate?: string;
}

export interface TrackerPersistence {
  config: UserConfig;
  progress: DayProgress;
  isLoading: boolean;
  persistProgress: (newProgress: DayProgress) => Promise<boolean>;
  persistConfig: (newConfig: UserConfig) => Promise<boolean>;
}

export interface WaterTrackerReturn {
  config: UserConfig;
  progress: DayProgress;
  todayGoalMl: number;
  nextDrinkAmount: number;
  goalReached: boolean;
  isLoading: boolean;
  saveConfig: (newConfig: UserConfig) => Promise<boolean>;
  addDrink: () => Promise<void>;
  undoLastDrink: () => Promise<void>;
  resetDay: () => Promise<void>;
}

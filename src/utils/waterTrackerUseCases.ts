import type { BestDayRecord, DayProgress, UserConfig } from '../types/index.ts';
import {
  DEFAULT_DAILY_GOAL,
  DEFAULT_END_TIME,
  DEFAULT_INTERVAL_MINUTES,
  DEFAULT_MANUAL_CUP_SIZE,
  DEFAULT_MODE,
  DEFAULT_NOTIFICATIONS_ENABLED,
  DEFAULT_START_TIME,
  DEFAULT_WEIGHT,
  ML_PER_KG,
} from '../constants/config.ts';
import { resolveEffectiveDailyGoal } from './dailyGoal.ts';
import { computeBestDay } from './dayHistory.ts';
import { normalizeProgressForToday } from './progress.ts';
import {
  buildProgressAfterDrink,
  buildProgressAfterReset,
  buildProgressAfterUndo,
  calculateNextDrinkAmount,
  generateDrinkId,
} from './waterTrackerDomain.ts';

export type RegisterDrinkResult = {
  activeGoalMl: number;
  amountToDrink: number;
  newProgress: DayProgress;
  isNewDay: boolean;
  previousStreak: number;
  reachedGoalToday: boolean;
  bestDayEvent?: {
    kind: 'matched' | 'surpassed';
    previousBestDay: BestDayRecord;
  };
};

export const createDefaultConfig = (): UserConfig => {
  return {
    weight: DEFAULT_WEIGHT,
    startTime: DEFAULT_START_TIME,
    endTime: DEFAULT_END_TIME,
    intervalMinutes: DEFAULT_INTERVAL_MINUTES,
    dailyGoalMl: DEFAULT_DAILY_GOAL,
    notificationsEnabled: DEFAULT_NOTIFICATIONS_ENABLED,
    mode: DEFAULT_MODE,
    manualCupSize: DEFAULT_MANUAL_CUP_SIZE,
  };
};

export const createEmptyProgress = (): DayProgress => {
  return {
    consumedMl: 0,
    drinks: [],
    streak: 0,
    lastDrinkDate: '',
    dayHistory: [],
    bestDay: undefined,
  };
};

export const buildPersistableConfig = (config: UserConfig): UserConfig => {
  if (config.mode !== 'auto') {
    return config;
  }

  return {
    ...config,
    dailyGoalMl: config.weight * ML_PER_KG,
  };
};

export const hydrateProgressState = (progress: DayProgress, today: string): DayProgress => {
  const history = progress.dayHistory ?? [];
  const currentDayCandidate =
    progress.lastDrinkDate === today && progress.consumedMl > 0
      ? { date: today, consumedMl: progress.consumedMl }
      : undefined;

  return {
    ...progress,
    dayHistory: history,
    bestDay: computeBestDay(history, currentDayCandidate),
  };
};

export const loadTrackerState = ({
  savedConfig,
  savedProgress,
  today,
  defaultConfig,
}: {
  savedConfig: Partial<UserConfig> | null;
  savedProgress: DayProgress | null;
  today: string;
  defaultConfig?: UserConfig;
}): {
  config: UserConfig;
  progress: DayProgress;
  shouldPersistProgress: boolean;
} => {
  const fallbackConfig = defaultConfig ?? createDefaultConfig();
  const config = savedConfig ? { ...fallbackConfig, ...savedConfig } : fallbackConfig;

  if (!savedProgress) {
    return {
      config,
      progress: createEmptyProgress(),
      shouldPersistProgress: false,
    };
  }

  const normalizedProgress = normalizeProgressForToday(savedProgress, today);
  const hydratedProgress = hydrateProgressState(normalizedProgress, today);
  const hasBestDayChanged =
    savedProgress.bestDay?.date !== hydratedProgress.bestDay?.date ||
    savedProgress.bestDay?.consumedMl !== hydratedProgress.bestDay?.consumedMl;
  const hasHistoryChanged = savedProgress.dayHistory !== hydratedProgress.dayHistory;

  return {
    config,
    progress: hydratedProgress,
    shouldPersistProgress:
      normalizedProgress !== savedProgress || hasBestDayChanged || hasHistoryChanged,
  };
};

export const getTodayGoalMl = (
  config: UserConfig,
  progress: DayProgress,
  today: string,
): number => {
  return resolveEffectiveDailyGoal(config.dailyGoalMl, progress, today);
};

export const getSuggestedDrinkAmount = (
  config: UserConfig,
  progress: DayProgress,
  today: string,
): number => {
  const activeGoalMl = getTodayGoalMl(config, progress, today);
  return calculateNextDrinkAmount(config, progress.consumedMl, activeGoalMl);
};

export const registerDrink = ({
  progress,
  config,
  amountToDrink,
  today,
  yesterday,
  timestamp,
}: {
  progress: DayProgress;
  config: UserConfig;
  amountToDrink: number;
  today: string;
  yesterday: string;
  timestamp?: string;
}): RegisterDrinkResult => {
  const activeGoalMl = getTodayGoalMl(config, progress, today);
  const previousBestDay = progress.bestDay;

  const { newProgress, isNewDay, previousStreak } = buildProgressAfterDrink(
    progress,
    {
      id: generateDrinkId(),
      amount: amountToDrink,
      timestamp: timestamp ?? new Date().toISOString(),
    },
    today,
    yesterday,
  );

  const reachedGoalToday =
    progress.consumedMl < activeGoalMl && newProgress.consumedMl >= activeGoalMl;
  const reachedBestDayFromHistory =
    !!previousBestDay &&
    previousBestDay.date !== today &&
    progress.consumedMl < previousBestDay.consumedMl &&
    newProgress.consumedMl >= previousBestDay.consumedMl;

  return {
    activeGoalMl,
    amountToDrink,
    newProgress,
    isNewDay,
    previousStreak,
    reachedGoalToday,
    bestDayEvent:
      reachedBestDayFromHistory && previousBestDay
        ? {
            kind: newProgress.consumedMl > previousBestDay.consumedMl ? 'surpassed' : 'matched',
            previousBestDay,
          }
        : undefined,
  };
};

export const undoTrackedDrink = (progress: DayProgress) => {
  return buildProgressAfterUndo(progress);
};

export const resetTrackedDay = (progress: DayProgress): DayProgress => {
  return buildProgressAfterReset(progress);
};

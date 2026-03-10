import type { DayProgress, Drink, UserConfig } from '../types';
import { archiveDayIfNeeded, computeBestDay } from './dayHistory.ts';
import { calculateNextStreak } from './progress.ts';
import { timeToMinutes } from './time.ts';

const ROUNDING_STEP = 10;

export const generateDrinkId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

export const calculateNextDrinkAmount = (
  config: UserConfig,
  consumedMl: number,
  activeGoalMl: number
): number => {
  const remainingMl = Math.max(0, activeGoalMl - consumedMl);
  if (remainingMl <= 0) return 0;

  if (config.mode === 'manual') {
    const cupSize = config.manualCupSize || 500;
    if (remainingMl < cupSize) return remainingMl;
    return cupSize;
  }

  const startMins = timeToMinutes(config.startTime);
  const endMins = timeToMinutes(config.endTime);
  const totalDayMinutes = endMins - startMins;
  const totalSlots = Math.floor(totalDayMinutes / config.intervalMinutes) + 1;
  const safeSlots = Math.max(1, totalSlots);

  const standardCupSize = activeGoalMl / safeSlots;
  const roundedStandardCup = Math.ceil(standardCupSize / ROUNDING_STEP) * ROUNDING_STEP;

  if (remainingMl < standardCupSize) return remainingMl;
  return roundedStandardCup;
};

export const buildProgressAfterDrink = (
  progress: DayProgress,
  newDrink: Drink,
  today: string,
  yesterday: string
): { newProgress: DayProgress; isNewDay: boolean; previousStreak: number } => {
  const isNewDay = progress.lastDrinkDate !== today;
  const previousStreak = progress.streak;
  const historyWithArchive = isNewDay
    ? archiveDayIfNeeded(progress.dayHistory, progress.lastDrinkDate, progress.consumedMl)
    : (progress.dayHistory ?? []);

  let newStreak = progress.streak;
  if (isNewDay) {
    newStreak = calculateNextStreak(progress.streak, progress.lastDrinkDate, today, yesterday);
  }

  const newTotal = isNewDay ? newDrink.amount : progress.consumedMl + newDrink.amount;
  const newProgressBase: DayProgress = {
    ...progress,
    consumedMl: newTotal,
    drinks: isNewDay ? [newDrink] : [...progress.drinks, newDrink],
    streak: newStreak,
    lastDrinkDate: today,
    dayHistory: historyWithArchive,
  };
  const newProgress: DayProgress = {
    ...newProgressBase,
    bestDay: computeBestDay(historyWithArchive, { date: today, consumedMl: newTotal }),
  };

  return { newProgress, isNewDay, previousStreak };
};

export const buildProgressAfterUndo = (
  progress: DayProgress
): { newProgress: DayProgress; removedDrink: Drink } | null => {
  if (progress.drinks.length === 0) return null;

  const lastDrink = progress.drinks[progress.drinks.length - 1];
  const newDrinks = progress.drinks.slice(0, -1);
  const newTotal = Math.max(0, progress.consumedMl - lastDrink.amount);

  let newStreak = progress.streak;
  if (newDrinks.length === 0 && progress.streak > 0) {
    newStreak = progress.streak - 1;
  }

  const history = progress.dayHistory ?? [];
  const newProgressBase: DayProgress = {
    ...progress,
    consumedMl: newTotal,
    drinks: newDrinks,
    streak: newStreak,
    dayHistory: history,
  };
  const currentDayCandidate =
    newProgressBase.lastDrinkDate && newProgressBase.consumedMl > 0
      ? { date: newProgressBase.lastDrinkDate, consumedMl: newProgressBase.consumedMl }
      : undefined;

  return {
    removedDrink: lastDrink,
    newProgress: {
      ...newProgressBase,
      bestDay: computeBestDay(history, currentDayCandidate),
    },
  };
};

export const buildProgressAfterReset = (progress: DayProgress): DayProgress => {
  let newStreak = progress.streak;
  if (progress.drinks.length > 0 && progress.streak > 0) {
    newStreak = progress.streak - 1;
  }

  const history = progress.dayHistory ?? [];
  return {
    ...progress,
    consumedMl: 0,
    drinks: [],
    streak: newStreak,
    dayHistory: history,
    bestDay: computeBestDay(history),
  };
};

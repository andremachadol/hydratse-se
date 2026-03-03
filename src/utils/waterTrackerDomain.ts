import type { DayProgress, Drink, UserConfig } from '../types';

const ROUNDING_STEP = 10;

const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const calculateNextStreak = (
  currentStreak: number,
  lastDrinkDate: string,
  today: string,
  yesterday: string
): number => {
  if (lastDrinkDate === today) return currentStreak;
  if (lastDrinkDate === yesterday) return currentStreak + 1;
  return 1;
};

export const generateDrinkId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

export const calculateNextDrinkAmount = (
  config: UserConfig,
  consumedMl: number,
  activeGoalMl: number
): number => {
  const remainingMl = Math.max(0, activeGoalMl - consumedMl);

  if (config.mode === 'manual') {
    const cupSize = config.manualCupSize || 500;
    if (consumedMl >= activeGoalMl) return cupSize;
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

  if (consumedMl >= activeGoalMl) return roundedStandardCup;
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

  let newStreak = progress.streak;
  if (isNewDay) {
    newStreak = calculateNextStreak(progress.streak, progress.lastDrinkDate, today, yesterday);
  }

  const newTotal = isNewDay ? newDrink.amount : progress.consumedMl + newDrink.amount;
  const newProgress: DayProgress = {
    ...progress,
    consumedMl: newTotal,
    drinks: isNewDay ? [newDrink] : [...progress.drinks, newDrink],
    streak: newStreak,
    lastDrinkDate: today,
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

  return {
    removedDrink: lastDrink,
    newProgress: {
      ...progress,
      consumedMl: newTotal,
      drinks: newDrinks,
      streak: newStreak,
    },
  };
};

export const buildProgressAfterReset = (progress: DayProgress): DayProgress => {
  let newStreak = progress.streak;
  if (progress.drinks.length > 0 && progress.streak > 0) {
    newStreak = progress.streak - 1;
  }

  return {
    ...progress,
    consumedMl: 0,
    drinks: [],
    streak: newStreak,
  };
};

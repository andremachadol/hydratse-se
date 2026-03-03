import type { DayProgress } from '../types';

export const normalizeProgressForToday = (
  progress: DayProgress,
  today: string
): DayProgress => {
  const shouldResetDay = progress.lastDrinkDate !== today;
  const shouldClearOverride = !!progress.goalOverrideDate && progress.goalOverrideDate !== today;

  if (!shouldResetDay && !shouldClearOverride) return progress;

  return {
    ...progress,
    consumedMl: shouldResetDay ? 0 : progress.consumedMl,
    drinks: shouldResetDay ? [] : progress.drinks,
    goalOverrideMl: shouldClearOverride ? undefined : progress.goalOverrideMl,
    goalOverrideDate: shouldClearOverride ? undefined : progress.goalOverrideDate,
  };
};

export const calculateNextStreak = (
  currentStreak: number,
  lastDrinkDate: string,
  today: string,
  yesterday: string
): number => {
  if (lastDrinkDate === today) return currentStreak;
  if (lastDrinkDate === yesterday) return currentStreak + 1;
  return 1;
};

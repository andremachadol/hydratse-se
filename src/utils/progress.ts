import type { DayProgress } from '../types';
import { archiveDayIfNeeded, computeBestDay } from './dayHistory.ts';

export const normalizeProgressForToday = (progress: DayProgress, today: string): DayProgress => {
  const shouldResetDay = progress.lastDrinkDate !== today;
  const shouldClearOverride = !!progress.goalOverrideDate && progress.goalOverrideDate !== today;

  if (!shouldResetDay && !shouldClearOverride) return progress;

  const normalizedConsumedMl = shouldResetDay ? 0 : progress.consumedMl;
  const normalizedLastDrinkDate = progress.lastDrinkDate;
  const historyAfterArchive = shouldResetDay
    ? archiveDayIfNeeded(progress.dayHistory, progress.lastDrinkDate, progress.consumedMl)
    : (progress.dayHistory ?? []);
  const currentDayCandidate =
    normalizedLastDrinkDate === today && normalizedConsumedMl > 0
      ? { date: today, consumedMl: normalizedConsumedMl }
      : undefined;

  return {
    ...progress,
    consumedMl: normalizedConsumedMl,
    drinks: shouldResetDay ? [] : progress.drinks,
    dayHistory: historyAfterArchive,
    bestDay: computeBestDay(historyAfterArchive, currentDayCandidate),
    goalOverrideMl: shouldClearOverride ? undefined : progress.goalOverrideMl,
    goalOverrideDate: shouldClearOverride ? undefined : progress.goalOverrideDate,
  };
};

export const calculateNextStreak = (
  currentStreak: number,
  lastDrinkDate: string,
  today: string,
  yesterday: string,
): number => {
  if (lastDrinkDate === today) return currentStreak;
  if (lastDrinkDate === yesterday) return currentStreak + 1;
  return 1;
};

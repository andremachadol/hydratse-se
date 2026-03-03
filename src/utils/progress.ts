import type { DayProgress } from '../types';

export const normalizeProgressForToday = (
  progress: DayProgress,
  today: string
): DayProgress => {
  if (progress.lastDrinkDate === today) return progress;

  return {
    ...progress,
    consumedMl: 0,
    drinks: [],
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

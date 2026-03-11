import type { DayProgress } from '../types';

const SAFE_ROUNDING_STEP_ML = 50;

export const resolveEffectiveDailyGoal = (
  baseDailyGoalMl: number,
  progress: DayProgress,
  today: string,
): number => {
  if (
    progress.goalOverrideDate === today &&
    typeof progress.goalOverrideMl === 'number' &&
    progress.goalOverrideMl > 0
  ) {
    return progress.goalOverrideMl;
  }

  return baseDailyGoalMl;
};

export const isLateStartToday = (nowMins: number, startMins: number, endMins: number): boolean => {
  return nowMins > startMins && nowMins < endMins;
};

export const calculateSafeGoalForRemainingWindow = (
  baseDailyGoalMl: number,
  nowMins: number,
  endMins: number,
  safeMaxMlPerHour: number,
): number => {
  const remainingMinutes = Math.max(0, endMins - nowMins);
  const safeMaxMl = Math.floor((remainingMinutes / 60) * safeMaxMlPerHour);
  const roundedSafeMaxMl = Math.floor(safeMaxMl / SAFE_ROUNDING_STEP_ML) * SAFE_ROUNDING_STEP_ML;

  return Math.max(0, Math.min(baseDailyGoalMl, roundedSafeMaxMl));
};

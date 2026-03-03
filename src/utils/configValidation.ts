import type { UserConfig } from '../types';

const isPositiveNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
};

const isValidMode = (value: unknown): value is UserConfig['mode'] => {
  return value === 'auto' || value === 'manual';
};

export const hasCompleteUserConfig = (
  config: Partial<UserConfig> | null
): config is UserConfig => {
  if (!config) return false;

  return (
    isPositiveNumber(config.weight) &&
    typeof config.startTime === 'string' &&
    config.startTime.length > 0 &&
    typeof config.endTime === 'string' &&
    config.endTime.length > 0 &&
    isPositiveNumber(config.intervalMinutes) &&
    isPositiveNumber(config.dailyGoalMl) &&
    typeof config.notificationsEnabled === 'boolean' &&
    isValidMode(config.mode) &&
    isPositiveNumber(config.manualCupSize)
  );
};

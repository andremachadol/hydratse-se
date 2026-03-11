import type { DayProgress, Drink } from '../types/index.ts';

export const STORAGE_SCHEMA_VERSION = 1;

type PersistedEnvelope<T> = {
  version: number;
  value: T;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object';
};

const isNonNegativeNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
};

const isPositiveNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
};

const isValidDayHistoryEntry = (value: unknown): boolean => {
  if (!isRecord(value)) return false;

  return (
    typeof value.date === 'string' && value.date.length > 0 && isNonNegativeNumber(value.consumedMl)
  );
};

export const isValidDrink = (value: unknown): value is Drink => {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    isPositiveNumber(value.amount) &&
    typeof value.timestamp === 'string' &&
    value.timestamp.length > 0
  );
};

export const wrapStoredValue = <T>(value: T): PersistedEnvelope<T> => {
  return {
    version: STORAGE_SCHEMA_VERSION,
    value,
  };
};

export const unwrapStoredValue = (value: unknown): unknown => {
  if (isRecord(value) && typeof value.version === 'number' && 'value' in value) {
    return value.value;
  }

  return value;
};

export const parseStoredProgress = (value: unknown): DayProgress | null => {
  const parsed = unwrapStoredValue(value);
  if (!isRecord(parsed)) return null;

  const history = parsed.dayHistory;
  const bestDay = parsed.bestDay;

  if (!isNonNegativeNumber(parsed.consumedMl)) return null;
  if (!Array.isArray(parsed.drinks) || !parsed.drinks.every(isValidDrink)) return null;
  if (!isNonNegativeNumber(parsed.streak)) return null;
  if (typeof parsed.lastDrinkDate !== 'string') return null;
  if (history !== undefined && (!Array.isArray(history) || !history.every(isValidDayHistoryEntry)))
    return null;
  if (bestDay !== undefined && !isValidDayHistoryEntry(bestDay)) return null;
  if (parsed.goalOverrideMl !== undefined && !isPositiveNumber(parsed.goalOverrideMl)) return null;
  if (parsed.goalOverrideDate !== undefined && typeof parsed.goalOverrideDate !== 'string')
    return null;

  return parsed as unknown as DayProgress;
};

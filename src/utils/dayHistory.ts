import type { BestDayRecord, DayHistoryEntry } from '../types';

export const MAX_DAY_HISTORY_ITEMS = 30;

export const upsertDayHistoryEntry = (
  history: DayHistoryEntry[] | undefined,
  entry: DayHistoryEntry
): DayHistoryEntry[] => {
  const withoutSameDate = (history ?? []).filter((item) => item.date !== entry.date);
  const merged = [...withoutSameDate, entry];
  merged.sort((a, b) => b.date.localeCompare(a.date));
  return merged.slice(0, MAX_DAY_HISTORY_ITEMS);
};

export const archiveDayIfNeeded = (
  history: DayHistoryEntry[] | undefined,
  date: string,
  consumedMl: number
): DayHistoryEntry[] => {
  if (!date || consumedMl <= 0) return history ?? [];
  return upsertDayHistoryEntry(history, { date, consumedMl });
};

export const computeBestDay = (
  history: DayHistoryEntry[] | undefined,
  currentDay?: DayHistoryEntry
): BestDayRecord | undefined => {
  const candidates: DayHistoryEntry[] = [...(history ?? [])];
  if (currentDay && currentDay.consumedMl > 0) {
    candidates.push(currentDay);
  }

  if (candidates.length === 0) return undefined;

  return candidates.reduce((best, candidate) => {
    if (candidate.consumedMl > best.consumedMl) return candidate;
    if (candidate.consumedMl === best.consumedMl && candidate.date > best.date) return candidate;
    return best;
  });
};

export const buildDisplayHistory = (
  history: DayHistoryEntry[] | undefined,
  currentDate: string,
  currentConsumedMl: number
): DayHistoryEntry[] => {
  if (!currentDate || currentConsumedMl <= 0) return history ?? [];
  return upsertDayHistoryEntry(history, { date: currentDate, consumedMl: currentConsumedMl });
};

const parseDateKey = (dateKey: string): Date | null => {
  const [yearStr, monthStr, dayStr] = dateKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const filterHistoryByPeriod = (
  history: DayHistoryEntry[] | undefined,
  currentDate: string,
  periodDays: number
): DayHistoryEntry[] => {
  const entries = history ?? [];
  if (!currentDate || periodDays <= 0) return entries;

  const current = parseDateKey(currentDate);
  if (!current) return entries;

  const start = new Date(current);
  start.setDate(start.getDate() - (periodDays - 1));
  const startKey = formatDateKey(start);

  return entries.filter((entry) => entry.date >= startKey && entry.date <= currentDate);
};

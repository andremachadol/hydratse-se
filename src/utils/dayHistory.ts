import type { BestDayRecord, DayHistoryEntry } from '../types';

export const MAX_DAY_HISTORY_ITEMS = 30;
const TREND_THRESHOLD_ML = 120;

export type HistoryTrend = 'up' | 'down' | 'stable';

export interface HistorySummary {
  trackedDays: number;
  totalMl: number;
  averageMl: number;
  goalHitDays: number;
  goalHitRate: number;
  lowestDay?: DayHistoryEntry;
  trend: HistoryTrend;
  trendDeltaMl: number;
}

export const upsertDayHistoryEntry = (
  history: DayHistoryEntry[] | undefined,
  entry: DayHistoryEntry,
): DayHistoryEntry[] => {
  const withoutSameDate = (history ?? []).filter((item) => item.date !== entry.date);
  const merged = [...withoutSameDate, entry];
  merged.sort((a, b) => b.date.localeCompare(a.date));
  return merged.slice(0, MAX_DAY_HISTORY_ITEMS);
};

export const archiveDayIfNeeded = (
  history: DayHistoryEntry[] | undefined,
  date: string,
  consumedMl: number,
): DayHistoryEntry[] => {
  if (!date || consumedMl <= 0) return history ?? [];
  return upsertDayHistoryEntry(history, { date, consumedMl });
};

export const computeBestDay = (
  history: DayHistoryEntry[] | undefined,
  currentDay?: DayHistoryEntry,
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
  currentConsumedMl: number,
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
  periodDays: number,
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

const averageConsumedMl = (entries: DayHistoryEntry[]): number => {
  if (entries.length === 0) return 0;
  const totalMl = entries.reduce((sum, entry) => sum + entry.consumedMl, 0);
  return Math.round(totalMl / entries.length);
};

export const summarizeHistory = (
  history: DayHistoryEntry[] | undefined,
  currentGoalMl: number,
): HistorySummary => {
  const entries = history ?? [];
  if (entries.length === 0) {
    return {
      trackedDays: 0,
      totalMl: 0,
      averageMl: 0,
      goalHitDays: 0,
      goalHitRate: 0,
      lowestDay: undefined,
      trend: 'stable',
      trendDeltaMl: 0,
    };
  }

  const totalMl = entries.reduce((sum, entry) => sum + entry.consumedMl, 0);
  const goalHitDays =
    currentGoalMl > 0 ? entries.filter((entry) => entry.consumedMl >= currentGoalMl).length : 0;
  const lowestDay = entries.reduce((lowest, candidate) => {
    if (candidate.consumedMl < lowest.consumedMl) return candidate;
    if (candidate.consumedMl === lowest.consumedMl && candidate.date > lowest.date)
      return candidate;
    return lowest;
  });

  const recentWindowSize = Math.ceil(entries.length / 2);
  const recentEntries = entries.slice(0, recentWindowSize);
  const previousEntries = entries.slice(recentWindowSize);
  const recentAverageMl = averageConsumedMl(recentEntries);
  const previousAverageMl = averageConsumedMl(previousEntries);
  const trendDeltaMl = recentAverageMl - previousAverageMl;

  let trend: HistoryTrend = 'stable';
  if (previousEntries.length > 0 && Math.abs(trendDeltaMl) >= TREND_THRESHOLD_ML) {
    trend = trendDeltaMl > 0 ? 'up' : 'down';
  }

  return {
    trackedDays: entries.length,
    totalMl,
    averageMl: Math.round(totalMl / entries.length),
    goalHitDays,
    goalHitRate: Math.round((goalHitDays / entries.length) * 100),
    lowestDay,
    trend,
    trendDeltaMl,
  };
};

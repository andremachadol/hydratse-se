import { useMemo } from 'react';
import type { DayProgress } from '../types/index.ts';
import {
  buildDisplayHistory,
  filterHistoryByPeriod,
  summarizeHistory,
} from '../utils/dayHistory.ts';
import { formatHistoryDate, formatMl, getTrendCopy } from '../utils/homePresentation.ts';
import { getTodayDate } from '../utils/time.ts';

export const HISTORY_PERIODS = [7, 14, 30] as const;

export type HistoryPeriod = (typeof HISTORY_PERIODS)[number];

export interface HomeHistoryHighlight {
  label: string;
  value: string;
  caption: string;
}

type UseHomeDashboardOptions = {
  progress: DayProgress;
  todayGoalMl: number;
  goalReached: boolean;
  historyPeriod: HistoryPeriod;
};

export const useHomeDashboard = ({
  progress,
  todayGoalMl,
  goalReached,
  historyPeriod,
}: UseHomeDashboardOptions) => {
  const percentage = useMemo(() => {
    return todayGoalMl > 0 ? Math.round((progress.consumedMl / todayGoalMl) * 100) : 0;
  }, [progress.consumedMl, todayGoalMl]);

  const todayDate = getTodayDate();

  const historyEntries = useMemo(() => {
    const consumedToday = progress.lastDrinkDate === todayDate ? progress.consumedMl : 0;
    const displayHistory = buildDisplayHistory(progress.dayHistory, todayDate, consumedToday);
    return filterHistoryByPeriod(displayHistory, todayDate, historyPeriod);
  }, [historyPeriod, progress.consumedMl, progress.dayHistory, progress.lastDrinkDate, todayDate]);

  const historySummary = useMemo(
    () => summarizeHistory(historyEntries, todayGoalMl),
    [historyEntries, todayGoalMl],
  );

  const trendCopy = useMemo(
    () => getTrendCopy(historySummary.trend, historySummary.trendDeltaMl),
    [historySummary.trend, historySummary.trendDeltaMl],
  );

  const historyReferenceMl = useMemo(() => {
    const reference = historyEntries.reduce(
      (maxValue, entry) => Math.max(maxValue, entry.consumedMl),
      todayGoalMl,
    );
    return Math.max(1, reference);
  }, [historyEntries, todayGoalMl]);

  const bestDayLabel = useMemo(() => {
    if (!progress.bestDay) return 'Nenhum dia registrado ainda';
    return `${formatHistoryDate(progress.bestDay.date)} • ${formatMl(progress.bestDay.consumedMl)}`;
  }, [progress.bestDay]);

  const historyHighlights = useMemo<HomeHistoryHighlight[]>(
    () => [
      {
        label: 'Média',
        value: historySummary.trackedDays > 0 ? formatMl(historySummary.averageMl) : '—',
        caption: `${historySummary.trackedDays} dia(s) ativos`,
      },
      {
        label: 'Na meta atual',
        value:
          historySummary.trackedDays > 0
            ? `${historySummary.goalHitDays}/${historySummary.trackedDays}`
            : '—',
        caption:
          historySummary.trackedDays > 0
            ? `${historySummary.goalHitRate}% do período`
            : 'Sem base ainda',
      },
      {
        label: 'Tendência',
        value: trendCopy.label,
        caption: trendCopy.caption,
      },
      {
        label: 'Menor dia',
        value: historySummary.lowestDay ? formatMl(historySummary.lowestDay.consumedMl) : '—',
        caption: historySummary.lowestDay
          ? formatHistoryDate(historySummary.lowestDay.date)
          : 'Sem registros',
      },
    ],
    [historySummary, trendCopy],
  );

  return {
    percentage,
    historyEntries,
    historySummary,
    historyReferenceMl,
    bestDayLabel,
    historyHighlights,
    todayDate,
    goalStatusLabel: goalReached
      ? 'Meta concluída'
      : percentage >= 75
        ? 'No ritmo'
        : 'Em andamento',
  };
};

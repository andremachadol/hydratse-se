import type { BestDayRecord, DayHistoryEntry, DayProgress } from '../types/index.ts';
import {
  buildDisplayHistory,
  filterHistoryByPeriod,
  summarizeHistory,
  type HistorySummary,
} from './dayHistory.ts';
import { formatHistoryDate, formatMl, getTrendCopy } from './homePresentation.ts';

export const HISTORY_PERIODS = [7, 14, 30] as const;

export type HistoryPeriod = (typeof HISTORY_PERIODS)[number];

export interface HomeHistoryHighlight {
  label: string;
  value: string;
  caption: string;
}

export interface HomeDashboardData {
  percentage: number;
  historyEntries: DayHistoryEntry[];
  historySummary: HistorySummary;
  historyReferenceMl: number;
  bestDayLabel: string;
  historyHighlights: HomeHistoryHighlight[];
  todayDate: string;
  goalStatusLabel: string;
}

type BuildHomeDashboardOptions = {
  progress: DayProgress;
  todayGoalMl: number;
  goalReached: boolean;
  historyPeriod: HistoryPeriod;
  todayDate: string;
};

const getDashboardPercentage = (consumedMl: number, todayGoalMl: number): number => {
  return todayGoalMl > 0 ? Math.round((consumedMl / todayGoalMl) * 100) : 0;
};

const getHistoryReferenceMl = (historyEntries: DayHistoryEntry[], todayGoalMl: number): number => {
  const reference = historyEntries.reduce(
    (maxValue, entry) => Math.max(maxValue, entry.consumedMl),
    todayGoalMl,
  );
  return Math.max(1, reference);
};

const getBestDayLabel = (bestDay?: BestDayRecord): string => {
  if (!bestDay) return 'Nenhum dia registrado ainda';
  return `${formatHistoryDate(bestDay.date)} • ${formatMl(bestDay.consumedMl)}`;
};

const buildHistoryHighlights = (
  historySummary: HistorySummary,
  trendCopy: ReturnType<typeof getTrendCopy>,
): HomeHistoryHighlight[] => {
  return [
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
  ];
};

const getGoalStatusLabel = (goalReached: boolean, percentage: number): string => {
  if (goalReached) return 'Meta concluída';
  return percentage >= 75 ? 'No ritmo' : 'Em andamento';
};

export const buildHomeDashboard = ({
  progress,
  todayGoalMl,
  goalReached,
  historyPeriod,
  todayDate,
}: BuildHomeDashboardOptions): HomeDashboardData => {
  const percentage = getDashboardPercentage(progress.consumedMl, todayGoalMl);
  const consumedToday = progress.lastDrinkDate === todayDate ? progress.consumedMl : 0;
  const displayHistory = buildDisplayHistory(progress.dayHistory, todayDate, consumedToday);
  const historyEntries = filterHistoryByPeriod(displayHistory, todayDate, historyPeriod);
  const historySummary = summarizeHistory(historyEntries, todayGoalMl);
  const trendCopy = getTrendCopy(historySummary.trend, historySummary.trendDeltaMl);

  return {
    percentage,
    historyEntries,
    historySummary,
    historyReferenceMl: getHistoryReferenceMl(historyEntries, todayGoalMl),
    bestDayLabel: getBestDayLabel(progress.bestDay),
    historyHighlights: buildHistoryHighlights(historySummary, trendCopy),
    todayDate,
    goalStatusLabel: getGoalStatusLabel(goalReached, percentage),
  };
};

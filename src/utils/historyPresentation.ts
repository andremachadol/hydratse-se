import type { BestDayRecord, DayHistoryEntry } from '../types/index.ts';
import type { HistoryPeriod } from './homeDashboard.ts';
import { formatHistoryDate, formatMl } from './homePresentation.ts';

export interface HistoryRowPresentation {
  key: string;
  dateLabel: string;
  valueLabel: string;
  fillWidth: `${number}%`;
  isToday: boolean;
  isBestDay: boolean;
}

export const getHistorySubtitle = (trackedDays: number, historyPeriod: HistoryPeriod): string => {
  return trackedDays > 0
    ? `${trackedDays} dia(s) com registro neste filtro`
    : `Sem dados nos \u00faltimos ${historyPeriod} dias`;
};

export const getHistoryFilterAccessibilityLabel = (period: HistoryPeriod): string => {
  return `Filtrar hist\u00f3rico para ${period} dias`;
};

export const getHistoryEmptyMessage = (): string => {
  return 'Nenhum registro apareceu nesta janela ainda.';
};

export const getHistoryTotalLabel = (totalMl: number): string => {
  return `Total no per\u00edodo: ${formatMl(totalMl)}`;
};

export const buildHistoryRows = ({
  historyEntries,
  bestDay,
  todayDate,
  historyReferenceMl,
}: {
  historyEntries: DayHistoryEntry[];
  bestDay?: BestDayRecord;
  todayDate: string;
  historyReferenceMl: number;
}): HistoryRowPresentation[] => {
  const safeReferenceMl = Math.max(1, historyReferenceMl);

  return historyEntries.map((entry) => {
    const isBestDay = bestDay?.date === entry.date && bestDay.consumedMl === entry.consumedMl;
    const isToday = entry.date === todayDate;
    const fillWidth =
      `${Math.min(100, Math.round((entry.consumedMl / safeReferenceMl) * 100))}%` as const;

    return {
      key: entry.date,
      dateLabel: isToday ? 'Hoje' : formatHistoryDate(entry.date),
      valueLabel: formatMl(entry.consumedMl),
      fillWidth,
      isToday,
      isBestDay,
    };
  });
};

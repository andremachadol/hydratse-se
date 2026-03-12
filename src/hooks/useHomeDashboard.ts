import { useMemo } from 'react';
import type { DayProgress } from '../types/index.ts';
import { buildHomeDashboard, type HistoryPeriod } from '../utils/homeDashboard.ts';
import { getTodayDate } from '../utils/time.ts';

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
  const todayDate = getTodayDate();

  return useMemo(
    () =>
      buildHomeDashboard({
        progress,
        todayGoalMl,
        goalReached,
        historyPeriod,
        todayDate,
      }),
    [goalReached, historyPeriod, progress, todayDate, todayGoalMl],
  );
};

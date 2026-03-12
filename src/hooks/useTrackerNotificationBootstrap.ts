import { useEffect, useRef } from 'react';
import { syncHydrationNotifications } from '../services/hydrationNotifications';
import type { DayProgress, UserConfig } from '../types';

type UseTrackerNotificationBootstrapOptions = {
  config: UserConfig;
  progress: DayProgress;
  todayGoalMl: number;
  isLoading: boolean;
};

export const useTrackerNotificationBootstrap = ({
  config,
  progress,
  todayGoalMl,
  isLoading,
}: UseTrackerNotificationBootstrapOptions) => {
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      hasSyncedRef.current = false;
      return;
    }

    if (hasSyncedRef.current) {
      return;
    }

    hasSyncedRef.current = true;
    void syncHydrationNotifications(progress.consumedMl, todayGoalMl, config);
  }, [config, isLoading, progress.consumedMl, todayGoalMl]);
};

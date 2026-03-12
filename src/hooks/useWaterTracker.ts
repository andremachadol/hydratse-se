import { useCallback } from 'react';
import {
  addTrackerDrink,
  resetTrackerDay,
  saveTrackerConfig,
  undoTrackerDrink,
} from '../application/waterTrackerMutations.ts';
import type { UserConfig, UserNotice, WaterTrackerReturn } from '../types';
import { Logger } from '../services/logger';
import { syncHydrationNotifications } from '../services/hydrationNotifications';
import { ensureNotificationPermission } from '../utils/notifications';
import { getTodayDate, getYesterdayDate } from '../utils/time';
import { getSuggestedDrinkAmount, getTodayGoalMl } from '../utils/waterTrackerUseCases';
import { useTrackerNotificationBootstrap } from './useTrackerNotificationBootstrap';
import { useTrackerPersistence } from './useTrackerPersistence';

const RESET_DAY_PROMPT: UserNotice = {
  title: 'Zerar o dia?',
  message: 'O histórico de hoje será apagado.',
};

export const useWaterTracker = (): WaterTrackerReturn => {
  const { config, progress, isLoading, persistProgress, persistConfig } = useTrackerPersistence();

  const today = getTodayDate();
  const todayGoalMl = getTodayGoalMl(config, progress, today);
  const goalReached = progress.consumedMl >= todayGoalMl;
  const nextDrinkAmount = getSuggestedDrinkAmount(config, progress, today);

  useTrackerNotificationBootstrap({
    config,
    progress,
    todayGoalMl,
    isLoading,
  });

  const handleNotifications = useCallback(
    async (currentProgressMl: number, currentConfig: UserConfig, currentGoalMl: number) => {
      await syncHydrationNotifications(currentProgressMl, currentGoalMl, currentConfig);
    },
    [],
  );

  const trackerDependencies = {
    persistConfig,
    persistProgress,
    requestNotificationPermission: ensureNotificationPermission,
    syncNotifications: handleNotifications,
    logger: Logger,
  };

  const saveConfigData = async (newConfig: UserConfig) =>
    saveTrackerConfig(
      {
        newConfig,
        progress,
        today: getTodayDate(),
      },
      trackerDependencies,
    );

  const addDrink = async () =>
    addTrackerDrink(
      {
        config,
        progress,
        amountToDrink: nextDrinkAmount,
        today: getTodayDate(),
        yesterday: getYesterdayDate(),
      },
      trackerDependencies,
    );

  const undoLastDrink = async () =>
    undoTrackerDrink(
      {
        config,
        progress,
        today: getTodayDate(),
      },
      trackerDependencies,
    );

  const resetDay = async () =>
    resetTrackerDay(
      {
        config,
        progress,
        today: getTodayDate(),
      },
      trackerDependencies,
    );

  return {
    config,
    progress,
    todayGoalMl,
    nextDrinkAmount,
    goalReached,
    isLoading,
    resetDayPrompt: RESET_DAY_PROMPT,
    saveConfig: saveConfigData,
    addDrink,
    undoLastDrink,
    resetDay,
  };
};

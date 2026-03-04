// src/hooks/useWaterTracker.ts
import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { requestNotificationPermission } from '../utils/notifications';
import { getTodayDate, getYesterdayDate } from '../utils/time';
import { normalizeProgressForToday } from '../utils/progress';
import { resolveEffectiveDailyGoal } from '../utils/dailyGoal';
import { computeBestDay } from '../utils/dayHistory';
import {
  buildProgressAfterDrink,
  buildProgressAfterReset,
  buildProgressAfterUndo,
  calculateNextDrinkAmount,
  generateDrinkId,
} from '../utils/waterTrackerDomain';
import { DayProgress, UserConfig, Drink, WaterTrackerReturn } from '../types';
import * as Storage from '../services/storage';
import { syncHydrationNotifications } from '../services/hydrationNotifications';
import { Logger } from '../services/logger';
import {
  DEFAULT_WEIGHT,
  DEFAULT_START_TIME,
  DEFAULT_END_TIME,
  DEFAULT_INTERVAL_MINUTES,
  DEFAULT_DAILY_GOAL,
  DEFAULT_NOTIFICATIONS_ENABLED,
  DEFAULT_MODE,
  DEFAULT_MANUAL_CUP_SIZE,
  ML_PER_KG,
  FALLBACK_DRINK_AMOUNT,
} from '../constants/config';

const DEFAULT_CONFIG: UserConfig = {
  weight: DEFAULT_WEIGHT,
  startTime: DEFAULT_START_TIME,
  endTime: DEFAULT_END_TIME,
  intervalMinutes: DEFAULT_INTERVAL_MINUTES,
  dailyGoalMl: DEFAULT_DAILY_GOAL,
  notificationsEnabled: DEFAULT_NOTIFICATIONS_ENABLED,
  mode: DEFAULT_MODE,
  manualCupSize: DEFAULT_MANUAL_CUP_SIZE,
};

const getEffectiveGoal = (cfg: UserConfig, p: DayProgress, today: string = getTodayDate()): number => {
  return resolveEffectiveDailyGoal(cfg.dailyGoalMl, p, today);
};

const hydrateProgressState = (progress: DayProgress, today: string): DayProgress => {
  const history = progress.dayHistory ?? [];
  const currentDayCandidate =
    progress.lastDrinkDate === today && progress.consumedMl > 0
      ? { date: today, consumedMl: progress.consumedMl }
      : undefined;

  return {
    ...progress,
    dayHistory: history,
    bestDay: computeBestDay(history, currentDayCandidate),
  };
};

export const useWaterTracker = (): WaterTrackerReturn => {
  const [config, setConfig] = useState<UserConfig>(DEFAULT_CONFIG);
  const [progress, setProgress] = useState<DayProgress>({
    consumedMl: 0,
    drinks: [],
    streak: 0,
    lastDrinkDate: '',
    dayHistory: [],
    bestDay: undefined,
  });

  const [nextDrinkAmount, setNextDrinkAmount] = useState(250);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const activeGoalMl = getEffectiveGoal(config, progress);
    const nextAmount = calculateNextDrinkAmount(config, progress.consumedMl, activeGoalMl);
    setNextDrinkAmount(nextAmount);
  }, [config, progress.consumedMl, progress.goalOverrideMl, progress.goalOverrideDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let currentConfig = DEFAULT_CONFIG;
      let currentProgress: DayProgress = {
        consumedMl: 0,
        drinks: [],
        streak: 0,
        lastDrinkDate: '',
        dayHistory: [],
        bestDay: undefined,
      };

      const savedConfig = await Storage.loadConfig();
      if (savedConfig) {
        currentConfig = { ...DEFAULT_CONFIG, ...savedConfig };
        setConfig(currentConfig);
      }

      const savedProgress = await Storage.loadProgress();
      if (savedProgress) {
        const today = getTodayDate();
        const normalizedProgress = normalizeProgressForToday(savedProgress, today);
        const hydratedProgress = hydrateProgressState(normalizedProgress, today);
        const hasBestDayChanged =
          savedProgress.bestDay?.date !== hydratedProgress.bestDay?.date ||
          savedProgress.bestDay?.consumedMl !== hydratedProgress.bestDay?.consumedMl;
        const hasHistoryChanged = savedProgress.dayHistory !== hydratedProgress.dayHistory;
        const shouldPersistMigration = normalizedProgress !== savedProgress || hasBestDayChanged || hasHistoryChanged;

        currentProgress = hydratedProgress;
        setProgress(hydratedProgress);

        if (shouldPersistMigration) {
          await Storage.saveProgress(hydratedProgress);
        }
      }

      await requestNotificationPermission();
      const todayGoalMl = getEffectiveGoal(currentConfig, currentProgress);
      await handleNotifications(currentProgress.consumedMl, currentConfig, todayGoalMl);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotifications = useCallback(
    async (currentProgressMl: number, currentConfig: UserConfig, currentGoalMl: number) => {
      await syncHydrationNotifications(currentProgressMl, currentGoalMl, currentConfig);
    },
    []
  );

  const saveConfigData = async (newConfig: UserConfig) => {
    const previousConfig = config;
    let updatedConfig = { ...newConfig };

    if (newConfig.mode === 'auto') {
      updatedConfig.dailyGoalMl = newConfig.weight * ML_PER_KG;
    }

    setConfig(updatedConfig);
    const saved = await Storage.saveConfig(updatedConfig);
    if (!saved) {
      setConfig(previousConfig);
      Alert.alert('Erro', 'Nao foi possivel salvar as configuracoes.');
      return;
    }

    Logger.configSaved(updatedConfig.weight, updatedConfig.dailyGoalMl);
    const todayGoalMl = getEffectiveGoal(updatedConfig, progress);
    await handleNotifications(progress.consumedMl, updatedConfig, todayGoalMl);
  };

  const saveProgressData = async (newProgress: DayProgress) => {
    const previousProgress = progress;
    setProgress(newProgress);
    const saved = await Storage.saveProgress(newProgress);
    if (!saved) {
      setProgress(previousProgress);
      console.error('Falha ao persistir progresso, estado revertido');
    }
  };

  const addDrink = async () => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    const activeGoalMl = getEffectiveGoal(config, progress, today);
    const amountToDrink = nextDrinkAmount > 0 ? nextDrinkAmount : FALLBACK_DRINK_AMOUNT;
    const previousBestDay = progress.bestDay;

    const newDrink: Drink = {
      id: generateDrinkId(),
      amount: amountToDrink,
      timestamp: new Date().toISOString(),
    };

    const { newProgress, isNewDay, previousStreak } = buildProgressAfterDrink(progress, newDrink, today, yesterday);
    const newTotal = newProgress.consumedMl;

    if (isNewDay) {
      if (progress.lastDrinkDate === yesterday) {
        Logger.streakUpdated(previousStreak, newProgress.streak, 'continued');
      } else {
        Logger.streakUpdated(previousStreak, newProgress.streak, 'reset');
      }
    }

    await saveProgressData(newProgress);
    Logger.drink(amountToDrink, newTotal, activeGoalMl);

    const reachedGoalToday = progress.consumedMl < activeGoalMl && newProgress.consumedMl >= activeGoalMl;
    const reachedBestDayFromHistory =
      !!previousBestDay &&
      previousBestDay.date !== today &&
      progress.consumedMl < previousBestDay.consumedMl &&
      newProgress.consumedMl >= previousBestDay.consumedMl;

    if (reachedGoalToday) {
      Logger.goalReached(newTotal, activeGoalMl);
      Alert.alert('Meta batida!', 'Voce atingiu 100% da sua hidratacao hoje.');
    }

    if (reachedBestDayFromHistory && previousBestDay) {
      const surpassedBestDay = newProgress.consumedMl > previousBestDay.consumedMl;
      Alert.alert(
        surpassedBestDay ? 'Novo melhor dia!' : 'Melhor dia alcancado!',
        surpassedBestDay
          ? `Voce bateu seu recorde com ${newProgress.consumedMl}ml hoje.`
          : `Voce igualou seu recorde de ${previousBestDay.consumedMl}ml.`
      );
    }

    await handleNotifications(newTotal, config, activeGoalMl);
  };

  const undoLastDrink = async () => {
    const undoResult = buildProgressAfterUndo(progress);
    if (!undoResult) return;

    const { newProgress, removedDrink } = undoResult;
    const newTotal = newProgress.consumedMl;

    await saveProgressData(newProgress);
    Logger.undo(removedDrink.amount, newTotal);

    const todayGoalMl = getEffectiveGoal(config, newProgress);
    await handleNotifications(newTotal, config, todayGoalMl);
  };

  const resetDay = async () => {
    const doReset = async () => {
      const previousTotal = progress.consumedMl;
      const newProgress = buildProgressAfterReset(progress);
      await saveProgressData(newProgress);
      Logger.reset(previousTotal);

      const todayGoalMl = getEffectiveGoal(config, newProgress);
      await handleNotifications(0, config, todayGoalMl);
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Reiniciar o dia?');
      if (confirmed) await doReset();
    } else {
      Alert.alert('Reiniciar o dia?', 'O historico de hoje sera apagado.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, zerar', style: 'destructive', onPress: () => void doReset() },
      ]);
    }
  };

  const todayGoalMl = getEffectiveGoal(config, progress);

  return {
    config,
    progress,
    todayGoalMl,
    nextDrinkAmount,
    isLoading,
    saveConfig: saveConfigData,
    addDrink,
    undoLastDrink,
    resetDay,
  };
};

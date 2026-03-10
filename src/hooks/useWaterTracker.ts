import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import type { DayProgress, UserConfig, WaterTrackerReturn } from '../types';
import * as Storage from '../services/storage';
import { Logger } from '../services/logger';
import { syncHydrationNotifications } from '../services/hydrationNotifications';
import { ensureNotificationPermission } from '../utils/notifications';
import { getTodayDate, getYesterdayDate } from '../utils/time';
import {
  buildPersistableConfig,
  createDefaultConfig,
  createEmptyProgress,
  getSuggestedDrinkAmount,
  getTodayGoalMl,
  loadTrackerState,
  registerDrink,
  resetTrackedDay,
  undoTrackedDrink,
} from '../utils/waterTrackerUseCases';

const DEFAULT_CONFIG = createDefaultConfig();

export const useWaterTracker = (): WaterTrackerReturn => {
  const [config, setConfig] = useState<UserConfig>(DEFAULT_CONFIG);
  const [progress, setProgress] = useState<DayProgress>(createEmptyProgress());
  const [nextDrinkAmount, setNextDrinkAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const today = getTodayDate();
  const todayGoalMl = getTodayGoalMl(config, progress, today);
  const goalReached = progress.consumedMl >= todayGoalMl;

  const handleNotifications = useCallback(
    async (currentProgressMl: number, currentConfig: UserConfig, currentGoalMl: number) => {
      await syncHydrationNotifications(currentProgressMl, currentGoalMl, currentConfig);
    },
    []
  );

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setNextDrinkAmount(getSuggestedDrinkAmount(config, progress, getTodayDate()));
  }, [config, progress.consumedMl, progress.goalOverrideMl, progress.goalOverrideDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const loadedState = loadTrackerState({
        savedConfig: await Storage.loadConfig(),
        savedProgress: await Storage.loadProgress(),
        today: getTodayDate(),
        defaultConfig: DEFAULT_CONFIG,
      });

      setConfig(loadedState.config);
      setProgress(loadedState.progress);

      if (loadedState.shouldPersistProgress) {
        await Storage.saveProgress(loadedState.progress);
      }

      const currentGoalMl = getTodayGoalMl(loadedState.config, loadedState.progress, getTodayDate());
      await handleNotifications(loadedState.progress.consumedMl, loadedState.config, currentGoalMl);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
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

  const resolveNotificationsForConfig = async (candidateConfig: UserConfig): Promise<UserConfig> => {
    if (!candidateConfig.notificationsEnabled) {
      return candidateConfig;
    }

    const granted = await ensureNotificationPermission();
    if (granted) {
      return candidateConfig;
    }

    Alert.alert(
      'Lembretes desativados',
      'A permissão de notificações não foi concedida. Você pode ativar depois nas configurações do dispositivo.'
    );

    return {
      ...candidateConfig,
      notificationsEnabled: false,
    };
  };

  const saveConfigData = async (newConfig: UserConfig) => {
    const previousConfig = config;
    let updatedConfig = buildPersistableConfig(newConfig);
    updatedConfig = await resolveNotificationsForConfig(updatedConfig);

    setConfig(updatedConfig);
    const saved = await Storage.saveConfig(updatedConfig);
    if (!saved) {
      setConfig(previousConfig);
      Alert.alert('Erro', 'Não foi possível salvar as configurações.');
      return;
    }

    Logger.configSaved(updatedConfig.weight, updatedConfig.dailyGoalMl);
    const currentGoalMl = getTodayGoalMl(updatedConfig, progress, getTodayDate());
    await handleNotifications(progress.consumedMl, updatedConfig, currentGoalMl);
  };

  const addDrink = async () => {
    if (goalReached || nextDrinkAmount <= 0) return;

    const result = registerDrink({
      progress,
      config,
      amountToDrink: nextDrinkAmount,
      today: getTodayDate(),
      yesterday: getYesterdayDate(),
    });

    if (result.isNewDay) {
      if (progress.lastDrinkDate === getYesterdayDate()) {
        Logger.streakUpdated(result.previousStreak, result.newProgress.streak, 'continued');
      } else {
        Logger.streakUpdated(result.previousStreak, result.newProgress.streak, 'reset');
      }
    }

    await saveProgressData(result.newProgress);
    Logger.drink(result.amountToDrink, result.newProgress.consumedMl, result.activeGoalMl);

    if (result.reachedGoalToday) {
      Logger.goalReached(result.newProgress.consumedMl, result.activeGoalMl);
      Alert.alert('Meta batida!', 'Você atingiu 100% da sua hidratação hoje.');
    }

    if (result.bestDayEvent) {
      Alert.alert(
        result.bestDayEvent.kind === 'surpassed' ? 'Novo melhor dia!' : 'Melhor dia igualado!',
        result.bestDayEvent.kind === 'surpassed'
          ? `Você bateu seu recorde com ${result.newProgress.consumedMl} ml hoje.`
          : `Você igualou seu recorde de ${result.bestDayEvent.previousBestDay.consumedMl} ml.`
      );
    }

    await handleNotifications(result.newProgress.consumedMl, config, result.activeGoalMl);
  };

  const undoLastDrink = async () => {
    const undoResult = undoTrackedDrink(progress);
    if (!undoResult) return;

    await saveProgressData(undoResult.newProgress);
    Logger.undo(undoResult.removedDrink.amount, undoResult.newProgress.consumedMl);

    const currentGoalMl = getTodayGoalMl(config, undoResult.newProgress, getTodayDate());
    await handleNotifications(undoResult.newProgress.consumedMl, config, currentGoalMl);
  };

  const resetDay = async () => {
    const doReset = async () => {
      const previousTotal = progress.consumedMl;
      const newProgress = resetTrackedDay(progress);
      await saveProgressData(newProgress);
      Logger.reset(previousTotal);

      const currentGoalMl = getTodayGoalMl(config, newProgress, getTodayDate());
      await handleNotifications(0, config, currentGoalMl);
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Zerar o dia?');
      if (confirmed) await doReset();
      return;
    }

    Alert.alert('Zerar o dia?', 'O histórico de hoje será apagado.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sim, zerar', style: 'destructive', onPress: () => void doReset() },
    ]);
  };

  return {
    config,
    progress,
    todayGoalMl,
    nextDrinkAmount,
    goalReached,
    isLoading,
    saveConfig: saveConfigData,
    addDrink,
    undoLastDrink,
    resetDay,
  };
};

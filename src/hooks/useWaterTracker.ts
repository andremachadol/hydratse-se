import { useCallback, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import type { WaterTrackerReturn } from '../types';
import { Logger } from '../services/logger';
import { syncHydrationNotifications } from '../services/hydrationNotifications';
import { ensureNotificationPermission } from '../utils/notifications';
import { getTodayDate, getYesterdayDate } from '../utils/time';
import {
  buildPersistableConfig,
  getSuggestedDrinkAmount,
  getTodayGoalMl,
  registerDrink,
  resetTrackedDay,
  undoTrackedDrink,
} from '../utils/waterTrackerUseCases';
import { useTrackerPersistence } from './useTrackerPersistence';
import type { UserConfig } from '../types';

export const useWaterTracker = (): WaterTrackerReturn => {
  const { config, progress, isLoading, persistProgress, persistConfig } = useTrackerPersistence();

  const today = getTodayDate();
  const todayGoalMl = getTodayGoalMl(config, progress, today);
  const goalReached = progress.consumedMl >= todayGoalMl;

  const nextDrinkAmount = useMemo(
    () => getSuggestedDrinkAmount(config, progress, getTodayDate()),
    [config, progress.consumedMl, progress.goalOverrideMl, progress.goalOverrideDate]
  );

  const handleNotifications = useCallback(
    async (currentProgressMl: number, currentConfig: UserConfig, currentGoalMl: number) => {
      await syncHydrationNotifications(currentProgressMl, currentGoalMl, currentConfig);
    },
    []
  );

  const showProgressSaveError = useCallback(() => {
    Alert.alert('Erro', 'Não foi possível salvar seu progresso agora.');
  }, []);

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

  const saveConfigData = async (newConfig: UserConfig): Promise<boolean> => {
    let updatedConfig = buildPersistableConfig(newConfig);
    updatedConfig = await resolveNotificationsForConfig(updatedConfig);

    const saved = await persistConfig(updatedConfig);
    if (!saved) {
      Alert.alert('Erro', 'Não foi possível salvar as configurações.');
      return false;
    }

    Logger.configSaved(updatedConfig.weight, updatedConfig.dailyGoalMl);
    const currentGoalMl = getTodayGoalMl(updatedConfig, progress, getTodayDate());
    await handleNotifications(progress.consumedMl, updatedConfig, currentGoalMl);
    return true;
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

    const saved = await persistProgress(result.newProgress);
    if (!saved) {
      showProgressSaveError();
      return;
    }

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

    const saved = await persistProgress(undoResult.newProgress);
    if (!saved) {
      showProgressSaveError();
      return;
    }

    Logger.undo(undoResult.removedDrink.amount, undoResult.newProgress.consumedMl);

    const currentGoalMl = getTodayGoalMl(config, undoResult.newProgress, getTodayDate());
    await handleNotifications(undoResult.newProgress.consumedMl, config, currentGoalMl);
  };

  const resetDay = async () => {
    const doReset = async () => {
      const previousTotal = progress.consumedMl;
      const newProgress = resetTrackedDay(progress);
      const saved = await persistProgress(newProgress);
      if (!saved) {
        showProgressSaveError();
        return;
      }

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

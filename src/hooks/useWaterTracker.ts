// src/hooks/useWaterTracker.ts
import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { requestNotificationPermission } from '../utils/notifications';
import { getTodayDate, getYesterdayDate } from '../utils/time';
import { normalizeProgressForToday } from '../utils/progress';
import { resolveEffectiveDailyGoal } from '../utils/dailyGoal';
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

// Configuração Padrão (Agora com suporte a Modo Manual)
const DEFAULT_CONFIG: UserConfig = {
  weight: DEFAULT_WEIGHT,
  startTime: DEFAULT_START_TIME,
  endTime: DEFAULT_END_TIME,
  intervalMinutes: DEFAULT_INTERVAL_MINUTES,
  dailyGoalMl: DEFAULT_DAILY_GOAL,
  notificationsEnabled: DEFAULT_NOTIFICATIONS_ENABLED,
  mode: DEFAULT_MODE,                   // 'auto' ou 'manual'
  manualCupSize: DEFAULT_MANUAL_CUP_SIZE, // Ex: 500ml
};

const getEffectiveGoal = (cfg: UserConfig, p: DayProgress, today: string = getTodayDate()): number => {
  return resolveEffectiveDailyGoal(cfg.dailyGoalMl, p, today);
};

export const useWaterTracker = (): WaterTrackerReturn => {
  const [config, setConfig] = useState<UserConfig>(DEFAULT_CONFIG);
  const [progress, setProgress] = useState<DayProgress>({ 
    consumedMl: 0, 
    drinks: [], 
    streak: 0, 
    lastDrinkDate: '' 
  });
  
  const [nextDrinkAmount, setNextDrinkAmount] = useState(250);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Carregar dados ao abrir
  useEffect(() => {
    loadData();
  }, []);

  // 2. Recalcular o copo sempre que beber ou mudar config
  useEffect(() => {
    recalculateNextDrink();
  }, [config, progress.consumedMl]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let currentConfig = DEFAULT_CONFIG;
      let currentProgress: DayProgress = {
        consumedMl: 0,
        drinks: [],
        streak: 0,
        lastDrinkDate: '',
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
        const wasOutdatedDay = normalizedProgress !== savedProgress;

        if (wasOutdatedDay) {
          currentProgress = normalizedProgress;
          setProgress(currentProgress);
          await Storage.saveProgress(currentProgress);
        } else {
          currentProgress = savedProgress;
          setProgress(savedProgress);
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

  const recalculateNextDrink = useCallback(() => {
    const activeGoalMl = getEffectiveGoal(config, progress);
    const nextAmount = calculateNextDrinkAmount(config, progress.consumedMl, activeGoalMl);
    setNextDrinkAmount(nextAmount);
  }, [config, progress.consumedMl]);

  const handleNotifications = useCallback(async (
    currentProgressMl: number,
    currentConfig: UserConfig,
    currentGoalMl: number
  ) => {
    await syncHydrationNotifications(currentProgressMl, currentGoalMl, currentConfig);
  }, []);

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
      Alert.alert("Erro", "Não foi possível salvar as configurações.");
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

  // --- BEBER ÁGUA ---
  const addDrink = async () => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    const activeGoalMl = getEffectiveGoal(config, progress, today);
    const amountToDrink = nextDrinkAmount > 0 ? nextDrinkAmount : FALLBACK_DRINK_AMOUNT;

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

    // Feedback Visual: Meta Batida
    if (progress.consumedMl < activeGoalMl && newProgress.consumedMl >= activeGoalMl) {
      Logger.goalReached(newTotal, activeGoalMl);
      Alert.alert("🎉 Meta Batida!", "Você atingiu 100% da sua hidratação hoje!");
    }

    // Feedback Sonoro/Notificação: Atualiza status
    await handleNotifications(newTotal, config, activeGoalMl);
  };

  // --- DESFAZER ---
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

  // --- ZERAR DIA ---
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
      Alert.alert(
        "Reiniciar o dia?",
        "O histórico de hoje será apagado.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sim, Zerar", style: "destructive", onPress: doReset }
        ]
      );
    }
  };

  const todayGoalMl = getEffectiveGoal(config, progress);

  return { config, progress, todayGoalMl, nextDrinkAmount, isLoading, saveConfig: saveConfigData, addDrink, undoLastDrink, resetDay };
};

// src/hooks/useWaterTracker.ts
import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { scheduleHydrationReminders, requestNotificationPermission } from '../utils/notifications';
import { timeToMinutes, getTodayDate, getYesterdayDate } from '../utils/time';
import { normalizeProgressForToday, calculateNextStreak } from '../utils/progress';
import { DayProgress, UserConfig, Drink, WaterTrackerReturn } from '../types';
import * as Storage from '../services/storage';
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
  ROUNDING_STEP,
  FALLBACK_DRINK_AMOUNT,
} from '../constants/config';

// Gera ID único
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

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
      await handleNotifications(currentProgress.consumedMl, currentConfig);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE CÁLCULO DO COPO (AUTO vs MANUAL) ---
  const recalculateNextDrink = useCallback(() => {
    const remainingMl = Math.max(0, config.dailyGoalMl - progress.consumedMl);
    let finalAmount = 0;

    // ⚙️ MODO MANUAL: Respeita o tamanho da garrafa do usuário
    if (config.mode === 'manual') {
        const cupSize = config.manualCupSize || 500;
        
        // Se já bateu a meta (Modo Infinito) -> Sugere garrafa cheia
        if (progress.consumedMl >= config.dailyGoalMl) {
            finalAmount = cupSize;
        } 
        // Se falta pouquinho (menos que uma garrafa) -> Sugere o resto exato
        else if (remainingMl < cupSize) {
            finalAmount = remainingMl;
        } 
        // Dia normal -> Garrafa cheia
        else {
            finalAmount = cupSize;
        }
    } 
    // 🤖 MODO AUTOMÁTICO: Calcula baseado no tempo (Lógica Original)
    else {
        const startMins = timeToMinutes(config.startTime);
        const endMins = timeToMinutes(config.endTime);
        const totalDayMinutes = endMins - startMins;
        const totalSlots = Math.floor(totalDayMinutes / config.intervalMinutes) + 1;
        const safeSlots = Math.max(1, totalSlots);
        
        const standardCupSize = config.dailyGoalMl / safeSlots;
        const roundedStandardCup = Math.ceil(standardCupSize / ROUNDING_STEP) * ROUNDING_STEP;

        if (progress.consumedMl >= config.dailyGoalMl) {
            finalAmount = roundedStandardCup;
        } else if (remainingMl < standardCupSize) {
            finalAmount = remainingMl;
        } else {
            finalAmount = roundedStandardCup;
        }
    }
    
    setNextDrinkAmount(finalAmount);
  }, [config, progress.consumedMl]);

  const handleNotifications = useCallback(async (currentProgressMl: number, currentConfig: UserConfig) => {
    try {
      // 1. Se desligado globalmente: CANCELA
      if (!currentConfig.notificationsEnabled) {
        Logger.info("NOTIFICATIONS_DISABLED_BY_USER");
        await Notifications.cancelAllScheduledNotificationsAsync();
        return;
      }

      // 2. Se meta batida: CANCELA (Silêncio merecido)
      if (currentProgressMl >= currentConfig.dailyGoalMl) {
        Logger.info("GOAL_REACHED_SILENCING_NOTIFICATIONS");
        await Notifications.cancelAllScheduledNotificationsAsync();
        return;
      }

      // 3. Caso contrário: AGENDA/REAGENDA
      const reminderConfig = {
        startTime: currentConfig.startTime,
        endTime: currentConfig.endTime,
        intervalMinutes: currentConfig.intervalMinutes,
      };
      await scheduleHydrationReminders(reminderConfig);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      Logger.error('NOTIFICATION_UPDATE_FAILED', { message });
    }
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
    await handleNotifications(progress.consumedMl, updatedConfig);
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
    const amountToDrink = nextDrinkAmount > 0 ? nextDrinkAmount : FALLBACK_DRINK_AMOUNT;
    
    const newDrink: Drink = {
      id: generateId(),
      amount: amountToDrink,
      timestamp: new Date().toISOString(),
    };
    
    // Streak Logic
    const isNewDay = progress.lastDrinkDate !== today;
    let newStreak = progress.streak;

    if (isNewDay) {
      const oldStreak = progress.streak;
      newStreak = calculateNextStreak(oldStreak, progress.lastDrinkDate, today, yesterday);

      if (progress.lastDrinkDate === yesterday) {
        Logger.streakUpdated(oldStreak, newStreak, 'continued');
      } else {
        Logger.streakUpdated(oldStreak, newStreak, 'reset');
      }
    }

    const newTotal = isNewDay ? amountToDrink : progress.consumedMl + amountToDrink;
    const newProgress: DayProgress = {
      consumedMl: newTotal,
      drinks: isNewDay ? [newDrink] : [...progress.drinks, newDrink],
      streak: newStreak,
      lastDrinkDate: today
    };

    await saveProgressData(newProgress);
    Logger.drink(amountToDrink, newTotal, config.dailyGoalMl);

    // Feedback Visual: Meta Batida
    if (progress.consumedMl < config.dailyGoalMl && newProgress.consumedMl >= config.dailyGoalMl) {
      Logger.goalReached(newTotal, config.dailyGoalMl);
      Alert.alert("🎉 Meta Batida!", "Você atingiu 100% da sua hidratação hoje!");
    }

    // Feedback Sonoro/Notificação: Atualiza status
    await handleNotifications(newTotal, config);
  };

  // --- DESFAZER ---
  const undoLastDrink = async () => {
    if (progress.drinks.length === 0) return;
    
    const lastDrink = progress.drinks[progress.drinks.length - 1];
    const newDrinks = progress.drinks.slice(0, -1);
    const newTotal = Math.max(0, progress.consumedMl - lastDrink.amount);
    
    let newStreak = progress.streak;
    if (newDrinks.length === 0 && progress.streak > 0) {
      newStreak = progress.streak - 1;
    }

    const newProgress = {
      ...progress,
      consumedMl: newTotal,
      drinks: newDrinks,
      streak: newStreak,
    };

    await saveProgressData(newProgress);
    Logger.undo(lastDrink.amount, newTotal);
    
    // Ao desfazer, verifica se precisa voltar a notificar
    await handleNotifications(newTotal, config);
  };

  // --- ZERAR DIA ---
  const resetDay = async () => {
    const doReset = async () => {
      const previousTotal = progress.consumedMl;
      let newStreak = progress.streak;
      if (progress.drinks.length > 0 && progress.streak > 0) {
        newStreak = progress.streak - 1;
      }

      const newProgress = { ...progress, consumedMl: 0, drinks: [], streak: newStreak };
      await saveProgressData(newProgress);
      Logger.reset(previousTotal);
      
      // Ao zerar, volta a notificar (se estiver ativado)
      await handleNotifications(0, config);
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

  return { config, progress, nextDrinkAmount, isLoading, saveConfig: saveConfigData, addDrink, undoLastDrink, resetDay };
};

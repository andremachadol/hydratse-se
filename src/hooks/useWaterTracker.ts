// src/hooks/useWaterTracker.ts
import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { scheduleHydrationReminders, requestNotificationPermission } from '../utils/notifications';
import { DayProgress, UserConfig, Drink, WaterTrackerReturn } from '../types';
import * as Storage from '../services/storage';
import { Logger } from '../services/logger';
import {
  DEFAULT_WEIGHT,
  DEFAULT_START_TIME,
  DEFAULT_END_TIME,
  DEFAULT_INTERVAL_MINUTES,
  DEFAULT_DAILY_GOAL,
  ML_PER_KG,
  ROUNDING_STEP,
  FALLBACK_DRINK_AMOUNT,
} from '../constants/config';

// ==========================================
// HELPERS (Funções Auxiliares)
// ==========================================

// Gera ID único (timestamp + random para evitar colisões)
const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomPart}`;
};

// Retorna YYYY-MM-DD de HOJE
const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Retorna YYYY-MM-DD de ONTEM (Para checar sequência/streak)
const getYesterdayDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

// Converte "08:30" em minutos totais do dia (ex: 510)
const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// Configuração Padrão (Evita crash se não tiver nada salvo)
const DEFAULT_CONFIG: UserConfig = {
  weight: DEFAULT_WEIGHT,
  startTime: DEFAULT_START_TIME,
  endTime: DEFAULT_END_TIME,
  intervalMinutes: DEFAULT_INTERVAL_MINUTES,
  dailyGoalMl: DEFAULT_DAILY_GOAL,
};

// ==========================================
// HOOK PRINCIPAL
// ==========================================

export const useWaterTracker = (): WaterTrackerReturn => {
  const [config, setConfig] = useState<UserConfig>(DEFAULT_CONFIG);
  const [progress, setProgress] = useState<DayProgress>({ 
    consumedMl: 0, 
    drinks: [], 
    streak: 0, 
    lastDrinkDate: '' 
  });
  
  // Estado para o tamanho do próximo copo (Dinâmico)
  const [nextDrinkAmount, setNextDrinkAmount] = useState(250);

  // Estado de carregamento
  const [isLoading, setIsLoading] = useState(true);

  // 1. Carregar dados ao abrir o app
  useEffect(() => {
    loadData();
  }, []);

  // 2. Recalcular o copo sempre que beber algo ou mudar a config
  useEffect(() => {
    recalculateNextDrink();
  }, [config, progress.consumedMl]);

  // --- CARREGAMENTO DE DADOS (COM VACINA ANTI-CRASH) ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carrega config com validação via Storage service
      const savedConfig = await Storage.loadConfig();
      if (savedConfig) {
        // Merge: Garante que campos novos existam mesmo em usuários antigos
        setConfig({ ...DEFAULT_CONFIG, ...savedConfig });
      }

      // Carrega progress com validação via Storage service
      const savedProgress = await Storage.loadProgress();
      if (savedProgress) {
        setProgress(savedProgress);
      }

      // Solicita permissão de notificação ao carregar o app
      await requestNotificationPermission();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar dados:', message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE CÁLCULO DO COPO (DISTRIBUIÇÃO UNIFORME) ---
  const recalculateNextDrink = useCallback(() => {
    // Cálculo do saldo restante (pode ficar negativo se passar da meta, mas para UI usamos 0)
    const remainingMl = Math.max(0, config.dailyGoalMl - progress.consumedMl);
    
    // 1. Calcular a Jornada TOTAL (Planejada)
    const startMins = timeToMinutes(config.startTime);
    const endMins = timeToMinutes(config.endTime);
    const totalDayMinutes = endMins - startMins;

    // Slots totais do dia
    const totalSlots = Math.floor(totalDayMinutes / config.intervalMinutes) + 1;
    const safeSlots = Math.max(1, totalSlots);

    // 2. O Copo Padrão (Standard Cup) - A nossa "Régua"
    // Ex: 3185 / 10 = 318.5ml
    const standardCupSize = config.dailyGoalMl / safeSlots;
    
    // Arredonda para ficar bonito (318.5 -> 320ml)
    const roundedStandardCup = Math.ceil(standardCupSize / ROUNDING_STEP) * ROUNDING_STEP;

    // 3. Definição do Próximo Gole
    let finalAmount = 0;

    if (progress.consumedMl >= config.dailyGoalMl) {
      // --- MODO INFINITO ---
      // Se já bateu a meta, continua sugerindo o ritmo padrão!
      // O usuário pode continuar clicando e somando +320ml indefinidamente.
      finalAmount = roundedStandardCup;
    } else if (remainingMl < standardCupSize) {
      // Reta final: Falta pouco? Bebe só o que falta para fechar a conta exata.
      finalAmount = remainingMl;
    } else {
      // Ritmo normal: Copo padrão
      finalAmount = roundedStandardCup;
    }

    setNextDrinkAmount(finalAmount);

  }, [config, progress.consumedMl])

  // --- SALVAR CONFIGURAÇÃO ---
  const saveConfigData = async (newConfig: UserConfig) => {
    // Recalcula a meta total baseada no peso automaticamente
    const updatedConfig = {
      ...newConfig,
      dailyGoalMl: newConfig.weight * ML_PER_KG,
    };
    setConfig(updatedConfig);
    await Storage.saveConfig(updatedConfig);
    Logger.configSaved(updatedConfig.weight, updatedConfig.dailyGoalMl);
    // O useEffect vai disparar o recalculateNextDrink automaticamente
  };

  // --- SALVAR PROGRESSO ---
  const saveProgressData = async (newProgress: DayProgress) => {
    setProgress(newProgress);
    await Storage.saveProgress(newProgress);
  };

  // --- BEBER ÁGUA (ADD DRINK) ---
  const addDrink = async () => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    
    // Usa o valor calculado dinamicamente. Se for 0 (meta batida), usa fallback.
    const amountToDrink = nextDrinkAmount > 0 ? nextDrinkAmount : FALLBACK_DRINK_AMOUNT;
    
    const newDrink: Drink = {
      id: generateId(),
      amount: amountToDrink,
      timestamp: new Date().toISOString(),
    };
    
    // Lógica de Streak (Sequência) - Simplificada
    const isNewDay = progress.lastDrinkDate !== today;
    const isFirstDrinkOfDay = progress.drinks.length === 0;
    let newStreak = progress.streak;

    if (isFirstDrinkOfDay) {
      const continuedStreak = progress.lastDrinkDate === yesterday || progress.lastDrinkDate === today;
      const oldStreak = progress.streak;
      newStreak = continuedStreak ? oldStreak + 1 : 1;
      Logger.streakUpdated(oldStreak, newStreak, continuedStreak ? 'continued' : 'reset');
    }

    const newTotal = isNewDay ? amountToDrink : progress.consumedMl + amountToDrink;

    const newProgress: DayProgress = {
      consumedMl: newTotal,
      drinks: isNewDay ? [newDrink] : [...progress.drinks, newDrink],
      streak: newStreak,
      lastDrinkDate: today
    };

await saveProgressData(newProgress);

    // Log do drink
    Logger.drink(amountToDrink, newTotal, config.dailyGoalMl);

    // FEEDBACK INTELIGENTE
    const reminderConfig = {
      startTime: config.startTime,
      endTime: config.endTime,
      intervalMinutes: config.intervalMinutes,
    };

    if (isNewDay) {
      scheduleHydrationReminders(reminderConfig);
    }
    // Se acabou de bater a meta EXATAMENTE agora (cruzou a linha de chegada)
    else if (progress.consumedMl < config.dailyGoalMl && newProgress.consumedMl >= config.dailyGoalMl) {
      Logger.goalReached(newTotal, config.dailyGoalMl);
      Alert.alert("🎉 Meta Batida!", "Você atingiu 100% da sua hidratação hoje!");
    }
    // Se JÁ TINHA batido a meta e continua bebendo (Modo Infinito)
    else if (newProgress.consumedMl > config.dailyGoalMl) {
      // Modo infinito - silencioso
    }
    else {
      scheduleHydrationReminders(reminderConfig);
    }
  };

  // --- DESFAZER (UNDO) ---
  const undoLastDrink = async () => {
    if (progress.drinks.length === 0) return;

    const lastDrink = progress.drinks[progress.drinks.length - 1];
    const newDrinks = progress.drinks.slice(0, -1);
    const newTotal = Math.max(0, progress.consumedMl - lastDrink.amount);

    // Se zerou os drinks do dia, volta o streak
    let newStreak = progress.streak;
    if (newDrinks.length === 0 && progress.streak > 0) {
      const oldStreak = progress.streak;
      newStreak = oldStreak - 1;
      Logger.streakUpdated(oldStreak, newStreak, 'undo_empty_day');
    }

    const newProgress = {
      ...progress,
      consumedMl: newTotal,
      drinks: newDrinks,
      streak: newStreak,
    };

    await saveProgressData(newProgress);
    Logger.undo(lastDrink.amount, newTotal);
  };

  // --- ZERAR O DIA (RESET) ---
  const resetDay = async () => {
    const doReset = async () => {
      const previousTotal = progress.consumedMl;

      // Se zerar e tinha drinks, perde o streak do dia
      let newStreak = progress.streak;
      if (progress.drinks.length > 0 && progress.streak > 0) {
        const oldStreak = progress.streak;
        newStreak = oldStreak - 1;
        Logger.streakUpdated(oldStreak, newStreak, 'day_reset');
      }

      const newProgress = { ...progress, consumedMl: 0, drinks: [], streak: newStreak };
      await saveProgressData(newProgress);
      Logger.reset(previousTotal);
    };

    // Na web, usar window.confirm pois Alert.alert não funciona corretamente
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Reiniciar o dia?\n\nO histórico de hoje será apagado.');
      if (confirmed) {
        await doReset();
      }
    } else {
      Alert.alert(
        "Reiniciar o dia?",
        "O histórico de hoje será apagado.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sim, Zerar",
            style: "destructive",
            onPress: doReset
          }
        ]
      );
    }
  };

  return { config, progress, nextDrinkAmount, isLoading, saveConfig: saveConfigData, addDrink, undoLastDrink, resetDay };
};
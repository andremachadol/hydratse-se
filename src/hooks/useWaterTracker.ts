// src/hooks/useWaterTracker.ts
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleHydrationReminders } from '../utils/notifications';
import { DayProgress, UserConfig, Drink, WaterTrackerReturn } from '../types';

// ==========================================
// HELPERS (Funções Auxiliares)
// ==========================================

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
  weight: 70,
  startTime: '08:00',
  endTime: '22:00',
  intervalMinutes: 60,
  dailyGoalMl: 2450 // 70kg * 35ml
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
    try {
      const savedConfig = await AsyncStorage.getItem('@config');
      const savedProgress = await AsyncStorage.getItem('@progress');

      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        // Merge: Garante que campos novos (startTime) existam mesmo em usuários antigos
        setConfig({ ...DEFAULT_CONFIG, ...parsedConfig });
      }
      
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (e) {
      console.error("Erro ao carregar dados", e);
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
    const roundedStandardCup = Math.ceil(standardCupSize / 10) * 10;

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
  const saveConfig = async (newConfig: UserConfig) => {
    // Recalcula a meta total baseada no peso automaticamente (35ml/kg)
    const updatedConfig = {
      ...newConfig,
      dailyGoalMl: newConfig.weight * 35
    };
    setConfig(updatedConfig);
    await AsyncStorage.setItem('@config', JSON.stringify(updatedConfig));
    // O useEffect vai disparar o recalculateNextDrink automaticamente
  };

  // --- SALVAR PROGRESSO ---
  const saveProgress = async (newProgress: DayProgress) => {
    setProgress(newProgress);
    await AsyncStorage.setItem('@progress', JSON.stringify(newProgress));
  };

  // --- BEBER ÁGUA (ADD DRINK) ---
  const addDrink = async () => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    
    // Usa o valor calculado dinamicamente. Se for 0 (meta batida), usa 250 de fallback.
    const amountToDrink = nextDrinkAmount > 0 ? nextDrinkAmount : 250;
    
    const newDrink: Drink = { 
      id: Date.now(), 
      amount: amountToDrink, 
      timestamp: new Date() 
    };
    
    // Lógica de Streak (Sequência)
    let newStreak = progress.streak;

    // Só mexe no streak se for o primeiro registro válido do dia
    if (progress.drinks.length === 0) {
      if (progress.lastDrinkDate === yesterday) {
        newStreak += 1; // Manteve a sequência
      } else if (progress.lastDrinkDate === today) {
        newStreak += 1; // Caso de Undo e Refazer no mesmo dia
      } else {
        newStreak = 1; // Quebrou a sequência ou dia 1
      }
    }

    const isNewDay = progress.lastDrinkDate !== today;
    const newTotal = isNewDay ? amountToDrink : progress.consumedMl + amountToDrink;

    const newProgress: DayProgress = {
      consumedMl: newTotal,
      drinks: isNewDay ? [newDrink] : [...progress.drinks, newDrink],
      streak: newStreak,
      lastDrinkDate: today
    };

await saveProgress(newProgress);
    
    // FEEDBACK INTELIGENTE
    if (isNewDay) {
       scheduleHydrationReminders();
    } 
    // Se acabou de bater a meta EXATAMENTE agora (cruzou a linha de chegada)
    else if (progress.consumedMl < config.dailyGoalMl && newProgress.consumedMl >= config.dailyGoalMl) {
      Alert.alert("🎉 Meta Batida!", "Você atingiu 100% da sua hidratação hoje!");
    } 
    // Se JÁ TINHA batido a meta e continua bebendo (Modo Infinito)
    else if (newProgress.consumedMl > config.dailyGoalMl) {
       // Opcional: Não faz nada (silencioso) ou dá um toast simples.
       // Vamos deixar sem Alert para não ser chato, o usuário vê o número subir.
    } 
    else {
      scheduleHydrationReminders();
    }
  };

  // --- DESFAZER (UNDO) ---
  const undoLastDrink = async () => {
    if (progress.drinks.length === 0) return;
    
    const lastDrink = progress.drinks[progress.drinks.length - 1];
    const newDrinks = progress.drinks.slice(0, -1);
    
    // Se zerou os drinks do dia, volta o streak (se possível)
    let newStreak = progress.streak;
    if (newDrinks.length === 0) {
       newStreak = Math.max(0, progress.streak - 1);
    }

    const newProgress = {
      ...progress,
      consumedMl: Math.max(0, progress.consumedMl - lastDrink.amount),
      drinks: newDrinks,
      streak: newStreak
    };

    await saveProgress(newProgress);
  };

  // --- ZERAR O DIA (RESET) ---
  const resetDay = () => {
    Alert.alert(
      "Reiniciar o dia?",
      "O histórico de hoje será apagado.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Zerar", 
          style: "destructive",
          onPress: async () => {
            // Se zerar, perde o streak do dia
            const newStreak = progress.drinks.length > 0 ? Math.max(0, progress.streak - 1) : progress.streak;
            const newProgress = { ...progress, consumedMl: 0, drinks: [], streak: newStreak };
            await saveProgress(newProgress);
          }
        }
      ]
    );
  };

  return { config, progress, nextDrinkAmount, saveConfig, addDrink, undoLastDrink, resetDay };
};
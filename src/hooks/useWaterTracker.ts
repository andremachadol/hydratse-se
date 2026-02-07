// src/hooks/useWaterTracker.ts
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleHydrationReminders } from '../utils/notifications';
import { DayProgress, UserConfig, Drink, WaterTrackerReturn } from '../types'; // Importando tipos

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const useWaterTracker = (): WaterTrackerReturn => {
  // Agora o useState sabe o formato dos dados!
  const [config, setConfig] = useState<UserConfig>({ dailyGoalMl: 2500, perDrinkMl: 250 });
  const [progress, setProgress] = useState<DayProgress>({ 
    consumedMl: 0, 
    drinks: [], 
    streak: 0, 
    lastDrinkDate: '' 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem('@config');
      const savedProgress = await AsyncStorage.getItem('@progress');

      if (savedConfig) setConfig(JSON.parse(savedConfig));
      if (savedProgress) setProgress(JSON.parse(savedProgress));
    } catch (e) {
      console.error("Erro ao carregar dados", e);
    }
  };

  const saveProgress = async (newProgress: DayProgress) => {
    setProgress(newProgress);
    await AsyncStorage.setItem('@progress', JSON.stringify(newProgress));
  };

  const saveConfig = async (newConfig: UserConfig) => {
    setConfig(newConfig);
    await AsyncStorage.setItem('@config', JSON.stringify(newConfig));
  };

  const addDrink = async () => {
    const today = getTodayDate();
    // Tipando o novo drink
    const newDrink: Drink = { id: Date.now(), amount: config.perDrinkMl, timestamp: new Date() };
    
    const isNewDay = progress.lastDrinkDate !== today;
    const newStreak = isNewDay ? (progress.streak || 0) + 1 : (progress.streak || 1);
    const newTotal = isNewDay ? config.perDrinkMl : progress.consumedMl + config.perDrinkMl;

    const newProgress: DayProgress = {
      consumedMl: newTotal,
      drinks: isNewDay ? [newDrink] : [...progress.drinks, newDrink],
      streak: newStreak,
      lastDrinkDate: today
    };

    await saveProgress(newProgress);
    
    if (progress.consumedMl >= config.dailyGoalMl && !isNewDay) {
      Alert.alert("⚠️ Cuidado", "Meta já batida! Excesso de água pode fazer mal.");
    } else if (newProgress.consumedMl >= config.dailyGoalMl) {
      Alert.alert("🎉 Meta Batida!", "Parabéns! Hidratação completa.");
    } else {
      scheduleHydrationReminders();
    }
  };

  const undoLastDrink = async () => {
    if (progress.drinks.length === 0) return;
    const lastDrink = progress.drinks[progress.drinks.length - 1];
    
    const newProgress: DayProgress = {
      ...progress,
      consumedMl: Math.max(0, progress.consumedMl - lastDrink.amount),
      drinks: progress.drinks.slice(0, -1)
    };
    await saveProgress(newProgress);
  };

  const resetDay = () => {
    Alert.alert(
      "Reiniciar o dia?",
      "O histórico de hoje será apagado, mas seu fogo (streak) continua.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Zerar", 
          style: "destructive",
          onPress: async () => {
            const newProgress = { ...progress, consumedMl: 0, drinks: [] };
            await saveProgress(newProgress);
          }
        }
      ]
    );
  };

  return { config, progress, saveConfig, addDrink, undoLastDrink, resetDay };
};
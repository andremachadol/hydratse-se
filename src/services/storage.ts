// src/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserConfig, DayProgress } from '../types';

// Chaves centralizadas
const STORAGE_KEYS = {
  CONFIG: '@config',
  PROGRESS: '@progress',
} as const;

// Validadores de schema
const isValidProgress = (data: unknown): data is DayProgress => {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.consumedMl === 'number' &&
    Array.isArray(d.drinks) &&
    typeof d.streak === 'number' &&
    typeof d.lastDrinkDate === 'string'
  );
};

const isValidConfig = (data: unknown): data is Partial<UserConfig> => {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    (d.weight === undefined || typeof d.weight === 'number') &&
    (d.startTime === undefined || typeof d.startTime === 'string') &&
    (d.endTime === undefined || typeof d.endTime === 'string') &&
    (d.intervalMinutes === undefined || typeof d.intervalMinutes === 'number') &&
    (d.dailyGoalMl === undefined || typeof d.dailyGoalMl === 'number')
  );
};

// Salvar configuração
export const saveConfig = async (config: UserConfig): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao salvar config:', message);
    return false;
  }
};

// Carregar configuração
export const loadConfig = async (): Promise<Partial<UserConfig> | null> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!saved) return null;

    const parsed: unknown = JSON.parse(saved);
    if (isValidConfig(parsed)) {
      return parsed;
    }
    console.warn('Config com formato inválido');
    return null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao carregar config:', message);
    return null;
  }
};

// Salvar progresso
export const saveProgress = async (progress: DayProgress): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao salvar progress:', message);
    return false;
  }
};

// Carregar progresso
export const loadProgress = async (): Promise<DayProgress | null> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!saved) return null;

    const parsed: unknown = JSON.parse(saved);
    if (isValidProgress(parsed)) {
      return parsed;
    }
    console.warn('Progress com formato inválido');
    return null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao carregar progress:', message);
    return null;
  }
};

// Limpar todos os dados (útil para debug/reset)
export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.CONFIG, STORAGE_KEYS.PROGRESS]);
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao limpar dados:', message);
    return false;
  }
};

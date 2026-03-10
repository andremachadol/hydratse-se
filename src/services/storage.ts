import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DayProgress, UserConfig } from '../types/index.ts';
import { parseStoredUserConfig } from '../utils/configValidation.ts';
import { parseStoredProgress, wrapStoredValue } from '../utils/storageValidation.ts';

const STORAGE_KEYS = {
  CONFIG: '@config',
  PROGRESS: '@progress',
} as const;

export const saveConfig = async (config: UserConfig): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(wrapStoredValue(config)));
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao salvar config:', message);
    return false;
  }
};

export const loadConfig = async (): Promise<Partial<UserConfig> | null> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!saved) return null;

    const parsed: unknown = JSON.parse(saved);
    const validConfig = parseStoredUserConfig(parsed);
    if (validConfig) {
      return validConfig;
    }

    console.warn('Config com formato invalido');
    return null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao carregar config:', message);
    return null;
  }
};

export const saveProgress = async (progress: DayProgress): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(wrapStoredValue(progress)));
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao salvar progress:', message);
    return false;
  }
};

export const loadProgress = async (): Promise<DayProgress | null> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!saved) return null;

    const parsed: unknown = JSON.parse(saved);
    const validProgress = parseStoredProgress(parsed);
    if (validProgress) {
      return validProgress;
    }

    console.warn('Progress com formato invalido');
    return null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao carregar progress:', message);
    return null;
  }
};

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

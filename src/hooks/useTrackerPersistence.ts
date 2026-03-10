import { useCallback, useEffect, useRef, useState } from 'react';
import type { DayProgress, TrackerPersistence, UserConfig } from '../types';
import * as Storage from '../services/storage';
import { syncHydrationNotifications } from '../services/hydrationNotifications';
import { getTodayDate } from '../utils/time';
import {
  createDefaultConfig,
  createEmptyProgress,
  getTodayGoalMl,
  loadTrackerState,
} from '../utils/waterTrackerUseCases';

const DEFAULT_CONFIG = createDefaultConfig();

export const useTrackerPersistence = (): TrackerPersistence => {
  const [config, setConfig] = useState<UserConfig>(DEFAULT_CONFIG);
  const [progress, setProgress] = useState<DayProgress>(() => createEmptyProgress());
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const configRef = useRef(config);
  const progressRef = useRef(progress);

  const updateConfigState = useCallback((nextConfig: UserConfig) => {
    configRef.current = nextConfig;
    if (isMountedRef.current) {
      setConfig(nextConfig);
    }
  }, []);

  const updateProgressState = useCallback((nextProgress: DayProgress) => {
    progressRef.current = nextProgress;
    if (isMountedRef.current) {
      setProgress(nextProgress);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (isMountedRef.current) {
      setIsLoading(true);
    }

    try {
      const loadedState = loadTrackerState({
        savedConfig: await Storage.loadConfig(),
        savedProgress: await Storage.loadProgress(),
        today: getTodayDate(),
        defaultConfig: DEFAULT_CONFIG,
      });

      updateConfigState(loadedState.config);
      updateProgressState(loadedState.progress);

      if (loadedState.shouldPersistProgress) {
        const saved = await Storage.saveProgress(loadedState.progress);
        if (!saved) {
          console.error('Falha ao persistir progresso normalizado');
        }
      }

      const currentGoalMl = getTodayGoalMl(loadedState.config, loadedState.progress, getTodayDate());
      await syncHydrationNotifications(loadedState.progress.consumedMl, currentGoalMl, loadedState.config);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [updateConfigState, updateProgressState]);

  useEffect(() => {
    isMountedRef.current = true;
    void loadData();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadData]);

  const persistProgress = useCallback(async (newProgress: DayProgress): Promise<boolean> => {
    const previousProgress = progressRef.current;
    updateProgressState(newProgress);

    const saved = await Storage.saveProgress(newProgress);
    if (!saved) {
      updateProgressState(previousProgress);
      console.error('Falha ao persistir progresso, estado revertido');
      return false;
    }

    return true;
  }, [updateProgressState]);

  const persistConfig = useCallback(async (newConfig: UserConfig): Promise<boolean> => {
    const previousConfig = configRef.current;
    updateConfigState(newConfig);

    const saved = await Storage.saveConfig(newConfig);
    if (!saved) {
      updateConfigState(previousConfig);
      return false;
    }

    return true;
  }, [updateConfigState]);

  return { config, progress, isLoading, persistProgress, persistConfig };
};

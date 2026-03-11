import { useCallback, useEffect, useState } from 'react';
import { resolveStoredConfigPresence } from '../application/appBootstrap.ts';
import * as Storage from '../services/storage.ts';

export const useAppBootstrap = () => {
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);

  const loadBootstrapState = useCallback(async () => {
    const nextHasConfig = await resolveStoredConfigPresence({
      loadConfig: Storage.loadConfig,
    });
    setHasConfig(nextHasConfig);
  }, []);

  useEffect(() => {
    void loadBootstrapState();
  }, [loadBootstrapState]);

  return {
    hasConfig,
    isLoadingConfig: hasConfig === null,
    isSplashFinished,
    finishSplash: () => setIsSplashFinished(true),
    finishOnboarding: () => setHasConfig(true),
  };
};

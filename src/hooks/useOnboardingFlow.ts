import { useCallback } from 'react';
import {
  completeOnboardingSetup,
  type CompleteOnboardingSetupInput,
} from '../application/onboardingFlow.ts';
import * as Storage from '../services/storage.ts';
import { ensureNotificationPermission } from '../utils/notifications.ts';
import { getTodayDate } from '../utils/time.ts';

type SubmitSetupOptions = {
  askLateStartStrategy: () => Promise<'keep' | 'adjust'>;
};

export const useOnboardingFlow = () => {
  const submitSetup = useCallback(
    async (input: CompleteOnboardingSetupInput, options: SubmitSetupOptions) => {
      return completeOnboardingSetup(input, {
        requestLateStartStrategy: options.askLateStartStrategy,
        requestNotificationPermission: ensureNotificationPermission,
        saveConfig: Storage.saveConfig,
        saveProgress: Storage.saveProgress,
        now: new Date(),
        todayDate: getTodayDate(),
      });
    },
    [],
  );

  return { submitSetup };
};

import { useCallback } from 'react';
import {
  completeOnboardingSetup,
  type CompleteOnboardingSetupInput,
} from '../application/onboardingFlow.ts';
import * as Storage from '../services/storage.ts';
import { ensureNotificationPermission } from '../utils/notifications.ts';
import { getTodayDate } from '../utils/time.ts';

type UseOnboardingFlowOptions = {
  askLateStartStrategy: () => Promise<'keep' | 'adjust'>;
};

export const useOnboardingFlow = ({ askLateStartStrategy }: UseOnboardingFlowOptions) => {
  const submitSetup = useCallback(
    async (input: CompleteOnboardingSetupInput) => {
      return completeOnboardingSetup(input, {
        requestLateStartStrategy: askLateStartStrategy,
        requestNotificationPermission: ensureNotificationPermission,
        saveConfig: Storage.saveConfig,
        saveProgress: Storage.saveProgress,
        now: new Date(),
        todayDate: getTodayDate(),
      });
    },
    [askLateStartStrategy],
  );

  return { submitSetup };
};

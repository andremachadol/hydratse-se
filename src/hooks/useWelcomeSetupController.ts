import { useCallback, useMemo, useState } from 'react';
import type { AppActionResult, CalculationMode } from '../types';
import { formatAutoGoalPreview } from '../utils/autoGoalPreview.ts';
import { submitWelcomeSetup } from '../utils/onboarding';
import { formatIntegerInput, formatWeightInput } from '../utils/configValidation';
import { useOnboardingFlow } from './useOnboardingFlow';

const INPUT_ACCESSORY_VIEW_ID = 'doneButtonID';

export const useWelcomeSetupController = () => {
  const [mode, setMode] = useState<CalculationMode>('auto');
  const [weight, setWeight] = useState('');
  const [manualGoal, setManualGoal] = useState('3000');
  const [manualCup, setManualCup] = useState('500');
  const { submitSetup } = useOnboardingFlow();

  const handleWeightChange = useCallback((value: string) => {
    setWeight(formatWeightInput(value));
  }, []);

  const handleManualGoalChange = useCallback((value: string) => {
    setManualGoal(formatIntegerInput(value));
  }, []);

  const handleManualCupChange = useCallback((value: string) => {
    setManualCup(formatIntegerInput(value));
  }, []);

  const autoGoalPreview = useMemo(() => formatAutoGoalPreview(weight), [weight]);

  const handleStart = useCallback(
    async (askLateStartStrategy: () => Promise<'keep' | 'adjust'>): Promise<AppActionResult> => {
      return submitWelcomeSetup(
        {
          mode,
          weight,
          manualGoal,
          manualCup,
        },
        {
          submitSetup,
          askLateStartStrategy,
        },
      );
    },
    [manualCup, manualGoal, mode, submitSetup, weight],
  );

  return {
    mode,
    weight,
    manualGoal,
    manualCup,
    autoGoalPreview,
    inputAccessoryViewID: INPUT_ACCESSORY_VIEW_ID,
    setMode,
    handleWeightChange,
    handleManualGoalChange,
    handleManualCupChange,
    handleStart,
  };
};

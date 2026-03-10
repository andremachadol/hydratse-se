import type { CalculationMode, DayProgress } from '../types/index.ts';
import {
  DEFAULT_END_TIME,
  DEFAULT_INTERVAL_MINUTES,
  DEFAULT_NOTIFICATIONS_ENABLED,
  DEFAULT_START_TIME,
} from '../constants/config.ts';
import { resolveUserConfigForm } from './configValidation.ts';

type OnboardingResolved = {
  weight: number;
  goalMl: number;
  cupMl: number;
};

type OnboardingResult =
  | { ok: true; value: OnboardingResolved; warningMessage?: string }
  | { ok: false; errorMessage: string };

type OnboardingConstraints = {
  minWeight: number;
  maxWeight: number;
};

export const resolveOnboardingInputs = (
  mode: CalculationMode,
  weightInput: string,
  manualGoalInput: string,
  manualCupInput: string,
  mlPerKg: number,
  constraints: OnboardingConstraints
): OnboardingResult => {
  if (mode === 'auto') {
    const parsedWeight = Number.parseFloat(weightInput.replace(',', '.'));
    if (!Number.isFinite(parsedWeight) || parsedWeight < constraints.minWeight || parsedWeight > constraints.maxWeight) {
      return { ok: false, errorMessage: 'Informe um peso valido (kg).' };
    }
  }

  const result = resolveUserConfigForm({
    mode,
    weightInput,
    manualGoalInput,
    manualCupInput,
    startTime: DEFAULT_START_TIME,
    endTime: DEFAULT_END_TIME,
    intervalMinutes: DEFAULT_INTERVAL_MINUTES,
    notificationsEnabled: DEFAULT_NOTIFICATIONS_ENABLED,
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    value: {
      weight: result.value.weight,
      goalMl: result.value.mode === 'auto' ? result.value.weight * mlPerKg : result.value.dailyGoalMl,
      cupMl: result.value.manualCupSize,
    },
    warningMessage: result.warningMessage,
  };
};

export const buildInitialProgress = (
  todayGoalOverrideMl?: number,
  todayDate?: string
): DayProgress => {
  return {
    consumedMl: 0,
    drinks: [],
    streak: 0,
    lastDrinkDate: '',
    dayHistory: [],
    bestDay: undefined,
    goalOverrideMl: todayGoalOverrideMl,
    goalOverrideDate: todayGoalOverrideMl ? todayDate : undefined,
  };
};

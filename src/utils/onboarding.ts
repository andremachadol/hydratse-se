import type { AppActionResult, CalculationMode, DayProgress } from '../types/index.ts';
import {
  DEFAULT_END_TIME,
  DEFAULT_INTERVAL_MINUTES,
  DEFAULT_NOTIFICATIONS_ENABLED,
  DEFAULT_START_TIME,
  MAX_WEIGHT,
  MIN_WEIGHT,
  ML_PER_KG,
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
  constraints: OnboardingConstraints,
): OnboardingResult => {
  if (mode === 'auto') {
    const parsedWeight = Number.parseFloat(weightInput.replace(',', '.'));
    if (
      !Number.isFinite(parsedWeight) ||
      parsedWeight < constraints.minWeight ||
      parsedWeight > constraints.maxWeight
    ) {
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
      goalMl:
        result.value.mode === 'auto' ? result.value.weight * mlPerKg : result.value.dailyGoalMl,
      cupMl: result.value.manualCupSize,
    },
    warningMessage: result.warningMessage,
  };
};

export const buildInitialProgress = (
  todayGoalOverrideMl?: number,
  todayDate?: string,
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

export interface WelcomeSetupDraft {
  mode: CalculationMode;
  weight: string;
  manualGoal: string;
  manualCup: string;
}

type SubmitWelcomeSetupDependencies = {
  submitSetup: (
    input: {
      mode: CalculationMode;
      finalWeight: number;
      finalGoal: number;
      finalCup: number;
    },
    options: {
      askLateStartStrategy: () => Promise<'keep' | 'adjust'>;
    },
  ) => Promise<AppActionResult>;
  askLateStartStrategy: () => Promise<'keep' | 'adjust'>;
};

export const submitWelcomeSetup = async (
  draft: WelcomeSetupDraft,
  dependencies: SubmitWelcomeSetupDependencies,
): Promise<AppActionResult> => {
  const resolvedInputs = resolveOnboardingInputs(
    draft.mode,
    draft.weight,
    draft.manualGoal,
    draft.manualCup,
    ML_PER_KG,
    {
      minWeight: MIN_WEIGHT,
      maxWeight: MAX_WEIGHT,
    },
  );

  if (!resolvedInputs.ok) {
    return {
      ok: false,
      notices: [],
      errorTitle: 'Ops',
      errorMessage: resolvedInputs.errorMessage,
    };
  }

  try {
    const result = await dependencies.submitSetup(
      {
        mode: draft.mode,
        finalWeight: resolvedInputs.value.weight,
        finalGoal: resolvedInputs.value.goalMl,
        finalCup: resolvedInputs.value.cupMl,
      },
      { askLateStartStrategy: dependencies.askLateStartStrategy },
    );

    return {
      ...result,
      warningMessage: resolvedInputs.warningMessage,
    };
  } catch {
    return {
      ok: false,
      notices: [],
      errorTitle: 'Erro',
      errorMessage: 'Não foi possível concluir a configuração inicial.',
      warningMessage: resolvedInputs.warningMessage,
    };
  }
};

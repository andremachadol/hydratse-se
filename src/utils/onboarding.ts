import type { CalculationMode, DayProgress } from '../types';

type OnboardingResolved = {
  weight: number;
  goalMl: number;
  cupMl: number;
};

type OnboardingResult =
  | { ok: true; value: OnboardingResolved }
  | { ok: false; errorMessage: string };

const MIN_WEIGHT = 20;
const MAX_WEIGHT = 650;

export const resolveOnboardingInputs = (
  mode: CalculationMode,
  weightInput: string,
  manualGoalInput: string,
  manualCupInput: string,
  mlPerKg: number
): OnboardingResult => {
  if (mode === 'auto') {
    const weight = parseFloat(weightInput.replace(',', '.'));
    if (!weight || weight < MIN_WEIGHT || weight > MAX_WEIGHT) {
      return { ok: false, errorMessage: 'Informe um peso valido (kg).' };
    }

    return {
      ok: true,
      value: {
        weight,
        goalMl: weight * mlPerKg,
        cupMl: 500,
      },
    };
  }

  const cleanGoal = manualGoalInput.replace(/[^0-9]/g, '');
  const cleanCup = manualCupInput.replace(/[^0-9]/g, '');

  const goalMl = parseInt(cleanGoal, 10);
  const cupMl = parseInt(cleanCup, 10);

  if (!goalMl || goalMl < 500) {
    return { ok: false, errorMessage: 'Meta minima: 500ml.' };
  }
  if (!cupMl || cupMl < 50) {
    return { ok: false, errorMessage: 'Copo invalido.' };
  }

  return {
    ok: true,
    value: {
      weight: 70,
      goalMl,
      cupMl,
    },
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
    goalOverrideMl: todayGoalOverrideMl,
    goalOverrideDate: todayGoalOverrideMl ? todayDate : undefined,
  };
};

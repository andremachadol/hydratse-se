import type {
  AppActionResult,
  CalculationMode,
  DayProgress,
  UserConfig,
  UserNotice,
} from '../types/index.ts';
import {
  DEFAULT_END_TIME,
  DEFAULT_INTERVAL_MINUTES,
  DEFAULT_NOTIFICATIONS_ENABLED,
  DEFAULT_START_TIME,
  SAFE_MAX_ML_PER_HOUR,
} from '../constants/config.ts';
import { calculateSafeGoalForRemainingWindow, isLateStartToday } from '../utils/dailyGoal.ts';
import { buildInitialProgress } from '../utils/onboarding.ts';
import { timeToMinutes } from '../utils/time.ts';

export type CompleteOnboardingSetupInput = {
  mode: CalculationMode;
  finalWeight: number;
  finalGoal: number;
  finalCup: number;
};

type CompleteOnboardingSetupDependencies = {
  requestLateStartStrategy: () => Promise<'keep' | 'adjust'>;
  requestNotificationPermission: () => Promise<boolean>;
  saveConfig: (config: UserConfig) => Promise<boolean>;
  saveProgress: (progress: DayProgress) => Promise<boolean>;
  now: Date;
  todayDate: string;
};

export const completeOnboardingSetup = async (
  input: CompleteOnboardingSetupInput,
  dependencies: CompleteOnboardingSetupDependencies,
): Promise<AppActionResult> => {
  const notices: UserNotice[] = [];
  const nowMins = dependencies.now.getHours() * 60 + dependencies.now.getMinutes();
  const startMins = timeToMinutes(DEFAULT_START_TIME);
  const endMins = timeToMinutes(DEFAULT_END_TIME);

  let todayGoalOverrideMl: number | undefined;
  if (isLateStartToday(nowMins, startMins, endMins)) {
    const strategy = await dependencies.requestLateStartStrategy();
    if (strategy === 'adjust') {
      const safeGoalToday = calculateSafeGoalForRemainingWindow(
        input.finalGoal,
        nowMins,
        endMins,
        SAFE_MAX_ML_PER_HOUR,
      );

      if (safeGoalToday > 0 && safeGoalToday < input.finalGoal) {
        todayGoalOverrideMl = safeGoalToday;
        notices.push({
          title: 'Meta de hoje ajustada',
          message: `Hoje sua meta ser\u00e1 ${safeGoalToday} ml. Amanh\u00e3 volta para a meta normal automaticamente.`,
        });
      } else {
        notices.push({
          title: 'Sem ajuste necess\u00e1rio',
          message:
            'N\u00e3o foi necess\u00e1rio ajustar a meta de hoje. A meta normal ser\u00e1 mantida.',
        });
      }
    }
  }

  let notificationsEnabled = DEFAULT_NOTIFICATIONS_ENABLED;
  if (notificationsEnabled) {
    const granted = await dependencies.requestNotificationPermission();
    if (!granted) {
      notificationsEnabled = false;
      notices.push({
        title: 'Lembretes desativados',
        message:
          'A permiss\u00e3o de notifica\u00e7\u00f5es n\u00e3o foi concedida. Voc\u00ea pode ativar depois nas configura\u00e7\u00f5es do dispositivo.',
      });
    }
  }

  const newConfig: UserConfig = {
    weight: input.finalWeight,
    startTime: DEFAULT_START_TIME,
    endTime: DEFAULT_END_TIME,
    intervalMinutes: DEFAULT_INTERVAL_MINUTES,
    dailyGoalMl: input.finalGoal,
    notificationsEnabled,
    mode: input.mode,
    manualCupSize: input.finalCup,
  };

  const savedConfig = await dependencies.saveConfig(newConfig);
  if (!savedConfig) {
    return {
      ok: false,
      notices,
      errorTitle: 'Erro',
      errorMessage:
        'N\u00e3o foi poss\u00edvel salvar suas configura\u00e7\u00f5es. Tente novamente.',
    };
  }

  const initialProgress = buildInitialProgress(todayGoalOverrideMl, dependencies.todayDate);
  const savedProgress = await dependencies.saveProgress(initialProgress);
  if (!savedProgress) {
    return {
      ok: false,
      notices,
      errorTitle: 'Erro',
      errorMessage: 'N\u00e3o foi poss\u00edvel preparar o progresso inicial. Tente novamente.',
    };
  }

  return { ok: true, notices };
};

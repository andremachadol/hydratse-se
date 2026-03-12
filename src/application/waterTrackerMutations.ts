import type { DayProgress, TrackerMutationResult, UserConfig, UserNotice } from '../types/index.ts';
import {
  buildPersistableConfig,
  getTodayGoalMl,
  registerDrink,
  resetTrackedDay,
  undoTrackedDrink,
} from '../utils/waterTrackerUseCases.ts';

type TrackerLogger = {
  configSaved: (weight: number, goal: number) => void;
  drink: (amount: number, total: number, goal: number) => void;
  undo: (amount: number, newTotal: number) => void;
  reset: (previousTotal: number) => void;
  streakUpdated: (oldStreak: number, newStreak: number, reason: string) => void;
  goalReached: (total: number, goal: number) => void;
};

type TrackerMutationDependencies = {
  persistConfig: (config: UserConfig) => Promise<boolean>;
  persistProgress: (progress: DayProgress) => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;
  syncNotifications: (
    currentProgressMl: number,
    currentConfig: UserConfig,
    currentGoalMl: number,
  ) => Promise<void>;
  logger: TrackerLogger;
};

const buildSuccessResult = (
  changed: boolean,
  notices: UserNotice[] = [],
): TrackerMutationResult => ({
  ok: true,
  changed,
  notices,
});

const buildErrorResult = (
  errorMessage: string,
  notices: UserNotice[] = [],
): TrackerMutationResult => ({
  ok: false,
  changed: false,
  notices,
  errorTitle: 'Erro',
  errorMessage,
});

const resolveNotificationsForConfig = async (
  candidateConfig: UserConfig,
  requestNotificationPermission: TrackerMutationDependencies['requestNotificationPermission'],
): Promise<{ updatedConfig: UserConfig; notices: UserNotice[] }> => {
  if (!candidateConfig.notificationsEnabled) {
    return { updatedConfig: candidateConfig, notices: [] };
  }

  const granted = await requestNotificationPermission();
  if (granted) {
    return { updatedConfig: candidateConfig, notices: [] };
  }

  return {
    updatedConfig: {
      ...candidateConfig,
      notificationsEnabled: false,
    },
    notices: [
      {
        title: 'Lembretes desativados',
        message:
          'A permiss\u00e3o de notifica\u00e7\u00f5es n\u00e3o foi concedida. Voc\u00ea pode ativar depois nas configura\u00e7\u00f5es do dispositivo.',
      },
    ],
  };
};

export const saveTrackerConfig = async (
  {
    newConfig,
    progress,
    today,
  }: {
    newConfig: UserConfig;
    progress: DayProgress;
    today: string;
  },
  dependencies: TrackerMutationDependencies,
): Promise<TrackerMutationResult> => {
  let updatedConfig = buildPersistableConfig(newConfig);
  const resolvedNotifications = await resolveNotificationsForConfig(
    updatedConfig,
    dependencies.requestNotificationPermission,
  );
  updatedConfig = resolvedNotifications.updatedConfig;

  const saved = await dependencies.persistConfig(updatedConfig);
  if (!saved) {
    return buildErrorResult(
      'N\u00e3o foi poss\u00edvel salvar as configura\u00e7\u00f5es.',
      resolvedNotifications.notices,
    );
  }

  dependencies.logger.configSaved(updatedConfig.weight, updatedConfig.dailyGoalMl);

  const currentGoalMl = getTodayGoalMl(updatedConfig, progress, today);
  await dependencies.syncNotifications(progress.consumedMl, updatedConfig, currentGoalMl);

  return buildSuccessResult(true, resolvedNotifications.notices);
};

export const addTrackerDrink = async (
  {
    config,
    progress,
    amountToDrink,
    today,
    yesterday,
  }: {
    config: UserConfig;
    progress: DayProgress;
    amountToDrink: number;
    today: string;
    yesterday: string;
  },
  dependencies: TrackerMutationDependencies,
): Promise<TrackerMutationResult> => {
  const activeGoalMl = getTodayGoalMl(config, progress, today);
  if (progress.consumedMl >= activeGoalMl || amountToDrink <= 0) {
    return buildSuccessResult(false);
  }

  const result = registerDrink({
    progress,
    config,
    amountToDrink,
    today,
    yesterday,
  });

  const saved = await dependencies.persistProgress(result.newProgress);
  if (!saved) {
    return buildErrorResult('N\u00e3o foi poss\u00edvel salvar seu progresso agora.');
  }

  if (result.isNewDay) {
    dependencies.logger.streakUpdated(
      result.previousStreak,
      result.newProgress.streak,
      progress.lastDrinkDate === yesterday ? 'continued' : 'reset',
    );
  }

  dependencies.logger.drink(
    result.amountToDrink,
    result.newProgress.consumedMl,
    result.activeGoalMl,
  );

  const notices: UserNotice[] = [];
  if (result.reachedGoalToday) {
    dependencies.logger.goalReached(result.newProgress.consumedMl, result.activeGoalMl);
    notices.push({
      title: 'Meta batida!',
      message: 'Voc\u00ea atingiu 100% da sua hidrata\u00e7\u00e3o hoje.',
    });
  }

  if (result.bestDayEvent) {
    notices.push({
      title: result.bestDayEvent.kind === 'surpassed' ? 'Novo melhor dia!' : 'Melhor dia igualado!',
      message:
        result.bestDayEvent.kind === 'surpassed'
          ? `Voc\u00ea bateu seu recorde com ${result.newProgress.consumedMl} ml hoje.`
          : `Voc\u00ea igualou seu recorde de ${result.bestDayEvent.previousBestDay.consumedMl} ml.`,
    });
  }

  await dependencies.syncNotifications(result.newProgress.consumedMl, config, result.activeGoalMl);
  return buildSuccessResult(true, notices);
};

export const undoTrackerDrink = async (
  {
    config,
    progress,
    today,
  }: {
    config: UserConfig;
    progress: DayProgress;
    today: string;
  },
  dependencies: TrackerMutationDependencies,
): Promise<TrackerMutationResult> => {
  const undoResult = undoTrackedDrink(progress);
  if (!undoResult) {
    return buildSuccessResult(false);
  }

  const saved = await dependencies.persistProgress(undoResult.newProgress);
  if (!saved) {
    return buildErrorResult('N\u00e3o foi poss\u00edvel salvar seu progresso agora.');
  }

  dependencies.logger.undo(undoResult.removedDrink.amount, undoResult.newProgress.consumedMl);

  const currentGoalMl = getTodayGoalMl(config, undoResult.newProgress, today);
  await dependencies.syncNotifications(undoResult.newProgress.consumedMl, config, currentGoalMl);

  return buildSuccessResult(true);
};

export const resetTrackerDay = async (
  {
    config,
    progress,
    today,
  }: {
    config: UserConfig;
    progress: DayProgress;
    today: string;
  },
  dependencies: TrackerMutationDependencies,
): Promise<TrackerMutationResult> => {
  const previousTotal = progress.consumedMl;
  const newProgress = resetTrackedDay(progress);
  const saved = await dependencies.persistProgress(newProgress);
  if (!saved) {
    return buildErrorResult('N\u00e3o foi poss\u00edvel salvar seu progresso agora.');
  }

  dependencies.logger.reset(previousTotal);

  const currentGoalMl = getTodayGoalMl(config, newProgress, today);
  await dependencies.syncNotifications(0, config, currentGoalMl);

  return buildSuccessResult(true);
};

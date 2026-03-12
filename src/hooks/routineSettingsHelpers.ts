import type { CalculationMode, TrackerMutationResult, UserConfig } from '../types';
import { formatAutoGoalPreview } from '../utils/autoGoalPreview.ts';
import { resolveUserConfigForm } from '../utils/configValidation.ts';

export interface RoutineSettingsDraft {
  mode: CalculationMode;
  weight: string;
  manualGoal: string;
  manualCup: string;
  startTime: string;
  endTime: string;
  interval: number;
  notificationsEnabled: boolean;
}

export const createRoutineSettingsDraft = (config: UserConfig): RoutineSettingsDraft => ({
  mode: config.mode || 'auto',
  weight: config.weight.toString(),
  manualGoal: config.dailyGoalMl.toString(),
  manualCup: config.manualCupSize?.toString() || '500',
  startTime: config.startTime,
  endTime: config.endTime,
  interval: config.intervalMinutes,
  notificationsEnabled: config.notificationsEnabled ?? true,
});

export const getRoutineSettingsAutoGoalPreview = formatAutoGoalPreview;

export const submitRoutineSettingsDraft = async (
  draft: RoutineSettingsDraft,
  onSave: (newConfig: UserConfig) => Promise<TrackerMutationResult>,
): Promise<TrackerMutationResult> => {
  const resolvedConfig = resolveUserConfigForm({
    mode: draft.mode,
    weightInput: draft.weight,
    manualGoalInput: draft.manualGoal,
    manualCupInput: draft.manualCup,
    startTime: draft.startTime,
    endTime: draft.endTime,
    intervalMinutes: draft.interval,
    notificationsEnabled: draft.notificationsEnabled,
  });

  if (!resolvedConfig.ok) {
    return {
      ok: false,
      changed: false,
      notices: [],
      errorTitle: 'Erro',
      errorMessage: resolvedConfig.errorMessage,
    };
  }

  try {
    const result = await onSave(resolvedConfig.value);
    return {
      ...result,
      warningMessage: resolvedConfig.warningMessage,
    };
  } catch {
    return {
      ok: false,
      changed: false,
      notices: [],
      errorTitle: 'Erro',
      errorMessage: 'Não foi possível atualizar as configurações.',
    };
  }
};

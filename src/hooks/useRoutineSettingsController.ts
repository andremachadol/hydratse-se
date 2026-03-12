import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CalculationMode, TrackerMutationResult, UserConfig } from '../types';
import { formatIntegerInput, formatTimeInput, formatWeightInput } from '../utils/configValidation';
import { formatAutoGoalPreview } from '../utils/autoGoalPreview.ts';
import {
  createRoutineSettingsDraft,
  submitRoutineSettingsDraft,
  type RoutineSettingsDraft,
} from './routineSettingsHelpers';

type UseRoutineSettingsControllerOptions = {
  visible: boolean;
  currentConfig: UserConfig;
  onSave: (newConfig: UserConfig) => Promise<TrackerMutationResult>;
};

export const useRoutineSettingsController = ({
  visible,
  currentConfig,
  onSave,
}: UseRoutineSettingsControllerOptions) => {
  const [draft, setDraft] = useState<RoutineSettingsDraft>(() =>
    createRoutineSettingsDraft(currentConfig),
  );

  useEffect(() => {
    if (!visible) return;

    setDraft(createRoutineSettingsDraft(currentConfig));
  }, [currentConfig, visible]);

  const updateDraft = useCallback((partial: Partial<RoutineSettingsDraft>) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      ...partial,
    }));
  }, []);

  const handleSave = useCallback(
    async (): Promise<TrackerMutationResult> => submitRoutineSettingsDraft(draft, onSave),
    [draft, onSave],
  );

  const autoGoalPreview = useMemo(() => formatAutoGoalPreview(draft.weight), [draft.weight]);

  return {
    mode: draft.mode,
    weight: draft.weight,
    manualGoal: draft.manualGoal,
    manualCup: draft.manualCup,
    startTime: draft.startTime,
    endTime: draft.endTime,
    interval: draft.interval,
    notificationsEnabled: draft.notificationsEnabled,
    autoGoalPreview,
    setMode: (mode: CalculationMode) => updateDraft({ mode }),
    handleWeightChange: (text: string) => updateDraft({ weight: formatWeightInput(text) }),
    handleManualGoalChange: (text: string) => updateDraft({ manualGoal: formatIntegerInput(text) }),
    handleManualCupChange: (text: string) => updateDraft({ manualCup: formatIntegerInput(text) }),
    handleStartTimeChange: (text: string) => updateDraft({ startTime: formatTimeInput(text) }),
    handleEndTimeChange: (text: string) => updateDraft({ endTime: formatTimeInput(text) }),
    handleIntervalChange: (interval: number) => updateDraft({ interval }),
    handleNotificationsChange: (notificationsEnabled: boolean) =>
      updateDraft({ notificationsEnabled }),
    handleSave,
  };
};

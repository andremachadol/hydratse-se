import type { UserNotice } from '../types/index.ts';
import type { ShowConfirmAsyncOptions } from '../utils/showConfirmAsync.ts';

export const DEFAULT_WARNING_TITLE = 'Atenção';
export const DEFAULT_ACKNOWLEDGE_LABEL = 'OK';
export const ONBOARDING_SUCCESS_ACKNOWLEDGE_LABEL = 'Continuar';

export const buildResetDayConfirmationDescriptor = (
  prompt: UserNotice,
): ShowConfirmAsyncOptions<boolean> => ({
  title: prompt.title,
  message: prompt.message,
  cancelChoice: {
    label: 'Cancelar',
    value: false,
    style: 'cancel',
  },
  confirmChoice: {
    label: 'Sim, zerar',
    value: true,
    style: 'destructive',
  },
});

export const LATE_START_GOAL_CONFIRMATION_DESCRIPTOR: ShowConfirmAsyncOptions<'keep' | 'adjust'> = {
  title: 'Jornada já iniciada',
  message:
    'Sua janela de hidratação já começou hoje. Deseja ajustar somente a meta de hoje por segurança?',
  cancelChoice: {
    label: 'Manter meta normal',
    value: 'keep',
  },
  confirmChoice: {
    label: 'Ajustar meta de hoje',
    value: 'adjust',
  },
};

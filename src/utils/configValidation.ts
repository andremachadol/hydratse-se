import type { CalculationMode, UserConfig } from '../types/index.ts';
import {
  DEFAULT_MANUAL_CUP_SIZE,
  DEFAULT_WEIGHT,
  HEALTH_WARNING_WEIGHT,
  MAX_WEIGHT,
  MIN_WEIGHT,
  ML_PER_KG,
} from '../constants/config.ts';
import { unwrapStoredValue } from './storageValidation.ts';
import { timeToMinutes } from './time.ts';

const MANUAL_GOAL_MIN_ML = 500;
const MANUAL_CUP_MIN_ML = 50;
const SUPPORTED_INTERVALS = new Set([30, 60]);
const TIME_REGEX = /^([0-1]?\d|2[0-3]):[0-5]\d$/;

export type ConfigFormValidationResult =
  | {
      ok: true;
      value: UserConfig;
      warningMessage?: string;
    }
  | {
      ok: false;
      errorMessage: string;
    };

export interface UserConfigFormInput {
  mode: CalculationMode;
  weightInput: string;
  manualGoalInput: string;
  manualCupInput: string;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  notificationsEnabled: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object';
};

const isPositiveNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
};

const isValidMode = (value: unknown): value is UserConfig['mode'] => {
  return value === 'auto' || value === 'manual';
};

const isValidIntervalMinutes = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isInteger(value) && SUPPORTED_INTERVALS.has(value);
};

const parseWeight = (weightInput: string): number | null => {
  const weight = Number.parseFloat(weightInput.replace(',', '.'));
  return Number.isFinite(weight) ? weight : null;
};

const parseMlInteger = (value: string): number | null => {
  const digits = formatIntegerInput(value);
  if (!digits) return null;

  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export const formatIntegerInput = (text: string): string => {
  return text.replace(/\D/g, '');
};

export const formatWeightInput = (text: string): string => {
  const normalized = text.replace('.', ',');
  const cleaned = normalized.replace(/[^0-9,]/g, '');
  const [rawInt = '', rawDecimal = ''] = cleaned.split(',');

  const intPart = rawInt.slice(0, 3);
  const decimalPart = rawDecimal.slice(0, 2);
  const hasComma = cleaned.includes(',');

  if (!intPart && !hasComma) {
    return '';
  }

  return hasComma ? `${intPart},${decimalPart}` : intPart;
};

export const formatTimeInput = (text: string): string => {
  const digits = text.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

export const validateTimeWindow = (startTime: string, endTime: string): string | null => {
  if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
    return 'Use o formato HH:MM (ex: 08:00).';
  }

  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    return 'O horario de acordar deve ser antes do horario de dormir.';
  }

  return null;
};

export const resolveUserConfigForm = ({
  mode,
  weightInput,
  manualGoalInput,
  manualCupInput,
  startTime,
  endTime,
  intervalMinutes,
  notificationsEnabled,
}: UserConfigFormInput): ConfigFormValidationResult => {
  const timeError = validateTimeWindow(startTime, endTime);
  if (timeError) {
    return { ok: false, errorMessage: timeError };
  }

  if (!isValidIntervalMinutes(intervalMinutes)) {
    return { ok: false, errorMessage: 'Escolha um intervalo valido de lembretes.' };
  }

  if (typeof notificationsEnabled !== 'boolean') {
    return { ok: false, errorMessage: 'Estado de notificacoes invalido.' };
  }

  const parsedWeight = parseWeight(weightInput);
  const persistedWeight =
    parsedWeight && parsedWeight >= MIN_WEIGHT && parsedWeight <= MAX_WEIGHT ? parsedWeight : DEFAULT_WEIGHT;

  if (mode === 'auto') {
    if (!parsedWeight || parsedWeight < MIN_WEIGHT || parsedWeight > MAX_WEIGHT) {
      return { ok: false, errorMessage: 'Informe um peso valido (kg).' };
    }

    return {
      ok: true,
      value: {
        mode,
        weight: parsedWeight,
        startTime,
        endTime,
        intervalMinutes,
        notificationsEnabled,
        dailyGoalMl: parsedWeight * ML_PER_KG,
        manualCupSize: DEFAULT_MANUAL_CUP_SIZE,
      },
      warningMessage:
        parsedWeight > HEALTH_WARNING_WEIGHT ? 'Peso muito elevado, considere consultar um medico.' : undefined,
    };
  }

  const goalMl = parseMlInteger(manualGoalInput);
  if (!goalMl || goalMl < MANUAL_GOAL_MIN_ML) {
    return { ok: false, errorMessage: 'Meta minima: 500ml.' };
  }

  const cupMl = parseMlInteger(manualCupInput);
  if (!cupMl || cupMl < MANUAL_CUP_MIN_ML) {
    return { ok: false, errorMessage: 'Copo invalido.' };
  }

  return {
    ok: true,
    value: {
      mode,
      weight: persistedWeight,
      startTime,
      endTime,
      intervalMinutes,
      notificationsEnabled,
      dailyGoalMl: goalMl,
      manualCupSize: cupMl,
    },
    warningMessage:
      persistedWeight > HEALTH_WARNING_WEIGHT ? 'Peso muito elevado, considere consultar um medico.' : undefined,
  };
};

export const parseStoredUserConfig = (config: unknown): Partial<UserConfig> | null => {
  const parsed = unwrapStoredValue(config);
  if (!isRecord(parsed)) return null;

  if ('weight' in parsed && !isPositiveNumber(parsed.weight)) return null;
  if ('startTime' in parsed && (typeof parsed.startTime !== 'string' || !TIME_REGEX.test(parsed.startTime))) return null;
  if ('endTime' in parsed && (typeof parsed.endTime !== 'string' || !TIME_REGEX.test(parsed.endTime))) return null;
  if ('intervalMinutes' in parsed && !isValidIntervalMinutes(parsed.intervalMinutes)) return null;
  if ('dailyGoalMl' in parsed && !isPositiveNumber(parsed.dailyGoalMl)) return null;
  if ('notificationsEnabled' in parsed && typeof parsed.notificationsEnabled !== 'boolean') return null;
  if ('mode' in parsed && !isValidMode(parsed.mode)) return null;
  if ('manualCupSize' in parsed && !isPositiveNumber(parsed.manualCupSize)) return null;

  if (
    typeof parsed.startTime === 'string' &&
    typeof parsed.endTime === 'string' &&
    validateTimeWindow(parsed.startTime, parsed.endTime)
  ) {
    return null;
  }

  return parsed as Partial<UserConfig>;
};

export const hasCompleteUserConfig = (config: Partial<UserConfig> | null): config is UserConfig => {
  const parsed = parseStoredUserConfig(config);
  if (!parsed) return false;

  return (
    isPositiveNumber(parsed.weight) &&
    typeof parsed.startTime === 'string' &&
    typeof parsed.endTime === 'string' &&
    isValidIntervalMinutes(parsed.intervalMinutes) &&
    isPositiveNumber(parsed.dailyGoalMl) &&
    typeof parsed.notificationsEnabled === 'boolean' &&
    isValidMode(parsed.mode) &&
    isPositiveNumber(parsed.manualCupSize)
  );
};

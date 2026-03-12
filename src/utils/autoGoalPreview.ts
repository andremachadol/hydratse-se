import { ML_PER_KG } from '../constants/config.ts';

export const formatAutoGoalPreview = (weight: string): string => {
  return `${(parseFloat(weight.replace(',', '.') || '0') * ML_PER_KG).toFixed(0)} ml`;
};

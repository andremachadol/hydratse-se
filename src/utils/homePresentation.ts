export type HistoryTrendCopy = {
  label: string;
  caption: string;
};

const WEEKDAY_LABELS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const MONTH_LABELS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

export const formatHistoryDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}`;
};

export const formatLongDate = (date: string): string => {
  const [yearStr, monthStr, dayStr] = date.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day) return date;

  const parsedDate = new Date(year, month - 1, day);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return `${WEEKDAY_LABELS[parsedDate.getDay()]}, ${String(day).padStart(2, '0')} ${MONTH_LABELS[month - 1]}`;
};

export const formatMl = (value: number): string => {
  return `${value.toLocaleString('pt-BR')} ml`;
};

export const getTrendCopy = (
  trend: 'up' | 'down' | 'stable',
  deltaMl: number,
): HistoryTrendCopy => {
  if (trend === 'up') {
    return {
      label: 'Subindo',
      caption: `+${Math.abs(deltaMl)} ml`,
    };
  }

  if (trend === 'down') {
    return {
      label: 'Caindo',
      caption: `-${Math.abs(deltaMl)} ml`,
    };
  }

  return {
    label: 'Estável',
    caption: 'Sem virada forte',
  };
};

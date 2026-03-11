export type HistoryTrendCopy = {
  label: string;
  caption: string;
};

export const formatHistoryDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}`;
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

export const buildReminderSlots = (startMins: number, endMins: number, intervalMinutes: number): number[] => {
  if (intervalMinutes <= 0 || startMins >= endMins) return [];

  const scheduleTimes: number[] = [];
  for (let mins = startMins + intervalMinutes; mins <= endMins; mins += intervalMinutes) {
    scheduleTimes.push(mins);
  }

  return scheduleTimes;
};

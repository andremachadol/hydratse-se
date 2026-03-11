export const buildReminderSlots = (
  startMins: number,
  endMins: number,
  intervalMinutes: number,
): number[] => {
  if (intervalMinutes <= 0 || startMins >= endMins) return [];

  const scheduleTimes: number[] = [];
  for (let mins = startMins; mins <= endMins; mins += intervalMinutes) {
    scheduleTimes.push(mins);
  }

  return scheduleTimes;
};

export const getUpcomingSlotsForToday = (slots: number[], nowMins: number): number[] => {
  return slots.filter((slot) => slot > nowMins);
};

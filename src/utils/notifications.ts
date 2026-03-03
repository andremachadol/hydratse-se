import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDateWithOffset, timeToMinutes } from './time';
import { buildReminderSlots, getUpcomingSlotsForToday } from './reminderSlots';
import { UserConfig } from '../types';

type ReminderConfig = Pick<UserConfig, 'startTime' | 'endTime' | 'intervalMinutes'>;
type ReminderIdsByDate = Record<string, string[]>;

const STORAGE_KEY_REMINDER_IDS = '@hydration_reminder_ids_by_date';
const HYDRATION_REMINDER_TYPE = 'hydration_reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to request notification permission:', message);
    return false;
  }
};

const loadReminderIdsByDate = async (): Promise<ReminderIdsByDate> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_REMINDER_IDS);
    if (!saved) return {};

    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return {};

    return parsed as ReminderIdsByDate;
  } catch {
    return {};
  }
};

const saveReminderIdsByDate = async (value: ReminderIdsByDate): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY_REMINDER_IDS, JSON.stringify(value));
};

const cancelReminderIds = async (ids: string[]): Promise<void> => {
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // Ignore stale/non-existing ids.
    }
  }
};

const cancelHydrationRemindersForDate = async (dateKey: string): Promise<void> => {
  const remindersByDate = await loadReminderIdsByDate();
  const ids = remindersByDate[dateKey] || [];

  await cancelReminderIds(ids);
  delete remindersByDate[dateKey];
  await saveReminderIdsByDate(remindersByDate);
};

export const cancelHydrationRemindersForToday = async (): Promise<void> => {
  await cancelHydrationRemindersForDate(getDateWithOffset(0));
};

export const cancelAllHydrationReminders = async (): Promise<void> => {
  const remindersByDate = await loadReminderIdsByDate();
  const allIds = Object.values(remindersByDate).flat();

  await cancelReminderIds(allIds);
  await saveReminderIdsByDate({});
};

/**
 * Schedule hydration reminders as DATE triggers for today and tomorrow.
 * This allows canceling only today's reminders while keeping tomorrow intact.
 */
export const scheduleHydrationReminders = async (config?: ReminderConfig): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return false;
    }

    const startTime = config?.startTime || '08:00';
    const endTime = config?.endTime || '22:00';
    const intervalMinutes = config?.intervalMinutes || 60;

    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const todayKey = getDateWithOffset(0);
    const tomorrowKey = getDateWithOffset(1);

    const scheduleTimes = buildReminderSlots(startMins, endMins, intervalMinutes);
    if (scheduleTimes.length === 0) {
      console.warn('Invalid reminder schedule configuration');
      return false;
    }

    await cancelHydrationRemindersForDate(todayKey);
    await cancelHydrationRemindersForDate(tomorrowKey);

    const remindersByDate = await loadReminderIdsByDate();
    remindersByDate[todayKey] = [];
    remindersByDate[tomorrowKey] = [];

    let scheduled = 0;

    for (const dayOffset of [0, 1] as const) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);

      const dateKey = dayOffset === 0 ? todayKey : tomorrowKey;
      const slots = dayOffset === 0 ? getUpcomingSlotsForToday(scheduleTimes, nowMins) : scheduleTimes;

      for (const slotMins of slots) {
        const triggerDate = new Date(date);
        triggerDate.setHours(Math.floor(slotMins / 60), slotMins % 60, 0, 0);

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Hora da agua! 💧',
            body: 'Mantenha o foco e beba mais um gole.',
            sound: true,
            data: {
              type: HYDRATION_REMINDER_TYPE,
              dateKey,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });

        remindersByDate[dateKey].push(notificationId);
        scheduled++;
      }
    }

    await saveReminderIdsByDate(remindersByDate);
    return scheduled > 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to schedule notifications:', message);
    return false;
  }
};

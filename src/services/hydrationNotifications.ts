import type { UserConfig } from '../types';
import { cancelAllHydrationReminders, cancelHydrationRemindersForToday, scheduleHydrationReminders } from '../utils/notifications';
import { Logger } from './logger';

export const syncHydrationNotifications = async (
  currentProgressMl: number,
  currentGoalMl: number,
  currentConfig: UserConfig
): Promise<void> => {
  try {
    if (!currentConfig.notificationsEnabled) {
      Logger.info('NOTIFICATIONS_DISABLED_BY_USER');
      await cancelAllHydrationReminders();
      return;
    }

    if (currentProgressMl >= currentGoalMl) {
      Logger.info('GOAL_REACHED_SILENCING_NOTIFICATIONS');
      await cancelHydrationRemindersForToday();
      return;
    }

    await scheduleHydrationReminders({
      startTime: currentConfig.startTime,
      endTime: currentConfig.endTime,
      intervalMinutes: currentConfig.intervalMinutes,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('NOTIFICATION_UPDATE_FAILED', { message });
  }
};

import type { UserConfig } from '../types/index.ts';
import { cancelAllHydrationReminders, cancelHydrationRemindersForToday, scheduleHydrationReminders } from '../utils/notifications.ts';
import { Logger } from './logger.ts';

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

    const scheduled = await scheduleHydrationReminders({
      startTime: currentConfig.startTime,
      endTime: currentConfig.endTime,
      intervalMinutes: currentConfig.intervalMinutes,
    });

    if (!scheduled) {
      Logger.warn('NOTIFICATION_SCHEDULE_SKIPPED');
      await cancelAllHydrationReminders();
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('NOTIFICATION_UPDATE_FAILED', { message });
  }
};

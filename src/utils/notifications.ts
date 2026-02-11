// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import { timeToMinutes } from './time';
import { UserConfig } from '../types';

type ReminderConfig = Pick<UserConfig, 'startTime' | 'endTime' | 'intervalMinutes'>;

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
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao solicitar permissão de notificação:', message);
    return false;
  }
};

/**
 * Agenda lembretes de hidratação usando DATE triggers com horários fixos reais.
 * Calcula os próximos horários baseado no intervalo e agenda apenas os que
 * ainda não passaram no dia de hoje.
 */
export const scheduleHydrationReminders = async (config?: ReminderConfig): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('Permissão de notificação não concedida');
      return false;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    const startTime = config?.startTime || '08:00';
    const endTime = config?.endTime || '22:00';
    const intervalMinutes = config?.intervalMinutes || 60;

    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);

    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    // Gera todos os horários do dia (ex: 08:00, 09:00, ..., 22:00)
    const scheduleTimes: number[] = [];
    for (let mins = startMins + intervalMinutes; mins <= endMins; mins += intervalMinutes) {
      scheduleTimes.push(mins);
    }

    // Agenda apenas os horários que ainda não passaram
    let scheduled = 0;
    for (const targetMins of scheduleTimes) {
      if (targetMins <= nowMins) continue;

      const triggerDate = new Date();
      triggerDate.setHours(Math.floor(targetMins / 60), targetMins % 60, 0, 0);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hora da água! 💧',
          body: 'Mantenha o foco e beba mais um gole.',
          sound: true,
        },
        trigger: {
          date: triggerDate,
          type: Notifications.SchedulableTriggerInputTypes.DATE,
        },
      });
      scheduled++;
    }

    return scheduled > 0;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao agendar notificações:', message);
    return false;
  }
};

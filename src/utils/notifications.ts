// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import { timeToMinutes } from './time';
import { buildReminderSlots } from './reminderSlots';
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
 * Agenda lembretes de hidratação com recorrência diária.
 * Cada horário gerado vira um trigger diário fixo (hora/minuto),
 * funcionando mesmo sem reabrir o app no dia seguinte.
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

    const scheduleTimes = buildReminderSlots(startMins, endMins, intervalMinutes);
    if (scheduleTimes.length === 0) {
      console.warn('Configuração de lembretes inválida para agendamento');
      return false;
    }

    // Agenda todos os horários como recorrência diária
    let scheduled = 0;
    for (const targetMins of scheduleTimes) {
      const hour = Math.floor(targetMins / 60);
      const minute = targetMins % 60;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hora da água! 💧',
          body: 'Mantenha o foco e beba mais um gole.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
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

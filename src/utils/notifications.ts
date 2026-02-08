// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import { timeToMinutes } from './time';
import { UserConfig } from '../types';

// Usa apenas os campos necessários de UserConfig
type ReminderConfig = Pick<UserConfig, 'startTime' | 'endTime' | 'intervalMinutes'>;

// Configura como o celular reage quando chega notificação com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Solicita permissão para enviar notificações
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

// Função para agendar os lembretes baseado na config do usuário
export const scheduleHydrationReminders = async (config?: ReminderConfig): Promise<boolean> => {
  try {
    // Verifica permissão antes de agendar
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('Permissão de notificação não concedida');
      return false;
    }

    // Cancela os anteriores para não duplicar
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Se não tiver config, usa valores padrão
    const startTime = config?.startTime || '08:00';
    const endTime = config?.endTime || '22:00';
    const intervalMinutes = config?.intervalMinutes || 60;

    // Calcula quantos lembretes baseado na jornada
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    const totalDayMinutes = endMins - startMins;
    const reminderCount = Math.max(1, Math.floor(totalDayMinutes / intervalMinutes));

    // Agenda lembretes baseado no intervalo do usuário
    for (let i = 1; i <= reminderCount; i++) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hora da água! 💧',
          body: 'Mantenha o foco e beba mais um gole.',
          sound: true,
        },
        trigger: {
          seconds: i * intervalMinutes * 60,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });
    }

    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao agendar notificações:', message);
    return false;
  }
};

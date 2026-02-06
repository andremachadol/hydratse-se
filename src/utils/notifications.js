// src/utils/notifications.js
import * as Notifications from 'expo-notifications';

// Configura como o celular reage quando chega notificação com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Função para agendar os lembretes
export const scheduleHydrationReminders = async () => {
  // Cancela os anteriores para não duplicar
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Agenda 5 lembretes (de 1h em 1h)
  for (let i = 1; i <= 5; i++) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hora da água! 💧",
        body: "Mantenha o foco e beba mais um gole.",
        sound: true,
      },
      trigger: {
        seconds: i * 60 * 60, // 1 hora, 2 horas, etc.
      },
    });
  }
};
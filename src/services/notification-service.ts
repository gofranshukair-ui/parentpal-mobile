import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import { fetchDailyNotificationFromSupabase } from '@/services/supabase';

export const isNotificationSupported = !(isRunningInExpoGo() && Platform.OS === 'android');

export interface NotificationConfig {
  title: string;
  body: string;
  hour: number;
  minute: number;
  enabled: boolean;
}

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null = null;

async function getNotifications(): Promise<NotificationsModule> {
  if (!isNotificationSupported) {
    throw new Error(
      'Notifications are not available in Expo Go on Android. Run `npx expo run:android` to use a development build.'
    );
  }

  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  return notificationsModule;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isNotificationSupported) {
    return false;
  }

  const Notifications = await getNotifications();
  const current = await Notifications.getPermissionsAsync();
  const granted = current.granted || current.status === 'granted';

  if (granted) {
    return true;
  }

  const asked = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return asked.granted || asked.status === 'granted';
}

export async function sendImmediateNotification(
  title = 'SOS Alert',
  body = 'The button was pressed and this is your notification.'
): Promise<string> {
  const Notifications = await getNotifications();
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: null,
  });

  return notificationId;
}

export async function scheduleDailyNotificationFromRemote(): Promise<NotificationConfig> {
  const config = await fetchDailyNotificationFromSupabase();
  if (!config.enabled) {
    throw new Error('Daily notifications are disabled in the data store.');
  }

  const Notifications = await getNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const trigger = {
    hour: config.hour ?? 9,
    minute: config.minute ?? 0,
    repeats: true,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: config.title,
      body: config.body,
      sound: 'default',
    },
    trigger,
  });

  return config;
}

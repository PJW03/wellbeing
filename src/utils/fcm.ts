import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { updateFcmToken } from '../api/notification';

export async function requestNotificationPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

let tokenRefreshUnsubscribe: (() => void) | null = null;

export async function registerFcmToken(userId: string): Promise<void> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    const token = await messaging().getToken();
    console.log('[FCM] 토큰:', token);
    await updateFcmToken(userId, token);

    // 기존 리스너 해제 후 재등록 (로그인 반복 시 누적 방지)
    tokenRefreshUnsubscribe?.();
    tokenRefreshUnsubscribe = messaging().onTokenRefresh(async (newToken) => {
      await updateFcmToken(userId, newToken);
    });
  } catch (e) {
    console.warn('[FCM] 토큰 등록 실패:', e);
  }
}

export function unregisterFcmListeners(): void {
  tokenRefreshUnsubscribe?.();
  tokenRefreshUnsubscribe = null;
}

async function displayNotification(title: string, body: string) {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: '기본 알림',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title,
    body,
    android: { channelId, pressAction: { id: 'default' } },
  });
}

// 포그라운드 알림 리스너 (앱이 열려있을 때)
export function setupForegroundNotification() {
  return messaging().onMessage(async (remoteMessage) => {
    const title = remoteMessage.notification?.title ?? '알림';
    const body  = remoteMessage.notification?.body  ?? '';
    await displayNotification(title, body);
  });
}

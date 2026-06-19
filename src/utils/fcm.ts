import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import { updateFcmToken } from '../api/notification';

export async function requestNotificationPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function registerFcmToken(userId: string): Promise<void> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    const token = await messaging().getToken();
    console.log('[FCM] 토큰:', token);
    await updateFcmToken(userId, token);

    // 토큰 갱신 시 서버에 재등록
    messaging().onTokenRefresh(async (newToken) => {
      await updateFcmToken(userId, newToken);
    });
  } catch (e) {
    console.warn('[FCM] 토큰 등록 실패:', e);
  }
}

// 포그라운드 알림 리스너 (앱이 열려있을 때)
export function setupForegroundNotification() {
  return messaging().onMessage(async (remoteMessage) => {
    const title = remoteMessage.notification?.title ?? '알림';
    const body  = remoteMessage.notification?.body  ?? '';
    Alert.alert(title, body);
  });
}

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
let foregroundUnsubscribe: (() => void) | null = null;
// 로그아웃마다 증가 — 등록 도중 로그아웃되면 이후 단계를 중단하기 위한 세대 번호
let generation = 0;
// 로그아웃 시 진행 중인 토큰 삭제 — 다음 로그인은 삭제가 끝난 뒤 새 토큰을 발급받음
let pendingDelete: Promise<void> | null = null;

// 로그인 후 호출 — 토큰 등록, 토큰 갱신 리스너, 포그라운드 알림 리스너까지 설정
export async function registerFcmToken(userId: string): Promise<void> {
  const gen = generation;
  const loggedOut = () => gen !== generation;
  try {
    await pendingDelete;
    const granted = await requestNotificationPermission();
    if (loggedOut()) return;
    if (granted) {
      const token = await messaging().getToken();
      if (loggedOut()) return;
      console.log('[FCM] 토큰:', token);
      await updateFcmToken(userId, token);
      if (loggedOut()) return;

      // 기존 리스너 해제 후 재등록 (로그인 반복 시 누적 방지)
      tokenRefreshUnsubscribe?.();
      tokenRefreshUnsubscribe = messaging().onTokenRefresh(async (newToken) => {
        await updateFcmToken(userId, newToken);
      });
    }
  } catch (e) {
    console.warn('[FCM] 토큰 등록 실패:', e);
  }
  if (!loggedOut()) setupForegroundNotification();
}

// 로그아웃 시 호출 — 리스너를 모두 해제하고 기기 토큰을 폐기해 이 기기로 이전 사용자 푸시가 오지 않게 함
// (서버 쪽 토큰은 App의 로그아웃 API가 비움 — 기기 토큰도 폐기해 다음 로그인 때 새 토큰이 등록됨)
export function unregisterFcm(): Promise<void> {
  generation += 1;
  tokenRefreshUnsubscribe?.();
  tokenRefreshUnsubscribe = null;
  foregroundUnsubscribe?.();
  foregroundUnsubscribe = null;
  pendingDelete = messaging()
    .deleteToken()
    .catch(e => console.warn('[FCM] 토큰 삭제 실패:', e));
  return pendingDelete;
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

// 포그라운드 알림 리스너 (앱이 열려있을 때) — 로그인 반복 시 누적되지 않게 기존 리스너 해제 후 등록
export function setupForegroundNotification(): void {
  foregroundUnsubscribe?.();
  foregroundUnsubscribe = messaging().onMessage(async (remoteMessage) => {
    const title = remoteMessage.notification?.title ?? '알림';
    const body  = remoteMessage.notification?.body  ?? '';
    await displayNotification(title, body);
  });
}

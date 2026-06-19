import { BASE_URL } from '../config/api';

export interface Notification {
  notiNo: number;
  recNo: number;
  deviceNo: number;
  sensorType: string;
  category: string;
  message: string;
  isRead: boolean;
  sentAt: string;
}

export async function getNotifications(userNo: number): Promise<Notification[]> {
  const res = await fetch(`${BASE_URL}/api/notifications?userNo=${userNo}`);
  if (!res.ok) throw new Error('알림 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function markNotificationRead(notiNo: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notifications/${notiNo}/read`, {
    method: 'PATCH',
  });
  if (res.status === 404) throw new Error('해당 알림을 찾을 수 없습니다.');
  if (!res.ok) throw new Error('읽음 처리에 실패했습니다.');
}

export async function updateFcmToken(userId: string, fcmToken: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/fcm-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, fcmToken }),
  });
  if (res.status === 404) throw new Error('사용자를 찾을 수 없습니다.');
  if (!res.ok) throw new Error('FCM 토큰 업데이트에 실패했습니다.');
}

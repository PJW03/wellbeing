import { ApiError, request } from './client';

// NotificationResponseDto
export interface Notification {
  notiNo: number;
  recNo: number;
  deviceNo: number;
  sensorType: string;
  category: string;
  message: string;
  // 추천(recommendation_log) 상세 문구 — 서버 응답에 없을 수 있음
  detail?: string;
  isRead: boolean;
  sentAt: string;
}

const failWith = (e: unknown, message: string, notFound?: string): never => {
  if (e instanceof ApiError && e.code !== 'NETWORK_ERROR') {
    throw new ApiError(e.status, e.code, notFound && e.status === 404 ? notFound : message);
  }
  throw e;
};

// 11. 사용자 알림 목록
export async function getNotifications(userNo: number): Promise<Notification[]> {
  try {
    return (await request<Notification[]>('/api/notifications', { query: { userNo } })) ?? [];
  } catch (e) {
    return failWith(e, '알림 목록을 불러오지 못했습니다.');
  }
}

// 12. 알림 읽음 처리
export async function markNotificationRead(notiNo: number): Promise<void> {
  try {
    await request(`/api/notifications/${notiNo}/read`, { method: 'PATCH' });
  } catch (e) {
    failWith(e, '읽음 처리에 실패했습니다.', '해당 알림을 찾을 수 없습니다.');
  }
}

// 10. FCM 푸시 토큰 등록/갱신
export async function updateFcmToken(userId: string, fcmToken: string): Promise<void> {
  try {
    await request('/api/fcm-token', { method: 'POST', body: { userId, fcmToken } });
  } catch (e) {
    failWith(e, 'FCM 토큰 업데이트에 실패했습니다.', '사용자를 찾을 수 없습니다.');
  }
}

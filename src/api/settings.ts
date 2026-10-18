import { ApiError, request } from './client';

// 알림 센서 종류 — 알림 목록(sensorType)과 같은 값 사용
export type SensorType = 'TEMP' | 'HUMIDITY' | 'DUST' | 'CO2' | 'POSTURE';

// NotificationSettingRequestDto
export interface NotificationSettingRequest {
  userNo: number;
  sensorType: SensorType;
  setValue: number;
  isAlarm: boolean;
}

export interface NotificationSetting {
  sensorType: SensorType;
  setValue: number;
  isAlarm: boolean;
}

// 알림 설정 조회 — 서버는 isAlarm을 'Y'/'N'으로 내려줌
export async function getNotificationSettings(userNo: number): Promise<NotificationSetting[]> {
  try {
    const result = await request<{ sensorType: SensorType; setValue: number; isAlarm: string | boolean }[]>('/api/settings', { query: { userNo } });
    return (Array.isArray(result) ? result : []).map(r => ({
      sensorType: r.sensorType,
      setValue: Number(r.setValue),
      isAlarm: r.isAlarm === true || r.isAlarm === 'Y',
    }));
  } catch (e) {
    if (e instanceof ApiError && e.code !== 'NETWORK_ERROR') throw new ApiError(e.status, e.code, '알림 설정을 불러오지 못했습니다.');
    throw e;
  }
}

// 13. 센서별 알림 임계값 저장/수정 (Upsert)
export async function upsertNotificationSetting(data: NotificationSettingRequest): Promise<void> {
  try {
    const result = await request('/api/settings/upsert', { method: 'POST', body: data });
    // 서버가 실패를 200 + 에러 코드 문자열로 내려줄 수 있어 성공 문자열을 확인
    if (result !== 'USER_SETTING_SAVED_OR_UPDATED_SUCCESS') {
      throw new ApiError(200, typeof result === 'string' ? result : '', '알림 설정 저장에 실패했습니다.');
    }
  } catch (e) {
    if (e instanceof ApiError && e.code !== 'NETWORK_ERROR') throw new ApiError(e.status, e.code, '알림 설정 저장에 실패했습니다.');
    throw e;
  }
}

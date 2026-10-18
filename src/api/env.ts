import { ApiError, request } from './client';

export interface EnvLatest {
  logNo: number;
  deviceNo: number;
  temp: number;
  humid: number;
  dust: number;
  co2: number;
  lux: number;
  mTime: string;
  motionDetected: boolean;
}

// 2. 메인화면용 최신 센서 데이터
export async function getLatestEnv(deviceNo: number): Promise<EnvLatest> {
  try {
    return await request<EnvLatest>('/api/env/latest', { query: { deviceNo } });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) throw new ApiError(404, e.code, '센서 데이터가 없습니다.');
    if (e instanceof ApiError && e.code !== 'NETWORK_ERROR') throw new ApiError(e.status, e.code, '센서 데이터를 불러오지 못했습니다.');
    throw e;
  }
}

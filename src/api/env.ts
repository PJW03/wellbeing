import { BASE_URL } from '../config/api';

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

export async function getLatestEnv(deviceNo: number): Promise<EnvLatest> {
  const url = `${BASE_URL}/api/env/latest?deviceNo=${deviceNo}`;
  console.log('[ENV] 요청 URL:', url);

  const res = await fetch(url);
  console.log('[ENV] 응답 status:', res.status);

  if (res.status === 404) {
    console.warn('[ENV] 404 - 데이터 없음');
    throw new Error('센서 데이터가 없습니다.');
  }
  if (!res.ok) {
    const text = await res.text();
    console.error('[ENV] 오류 응답:', text);
    throw new Error('센서 데이터를 불러오지 못했습니다.');
  }

  const data = await res.json();
  console.log('[ENV] 응답 데이터:', JSON.stringify(data));
  return data;
}

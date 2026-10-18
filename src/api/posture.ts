import { ApiError, request } from './client';

// PostureLogResponseDto
// TODO: 명세서에 필드 정의가 없어 하드웨어 응답(pType, severity, message) 기준으로 추정 — 실제 응답 확인 후 맞추기
export interface PostureLog {
  pType: string;
  severity: number;
  message?: string;
  createdAt?: string;
  [key: string]: unknown;
}

// 16. 일별/월별 통합 리포트 (자세+환경) — date: 'YYYY-MM-DD' 또는 month: 'YYYY-MM' 중 하나
export async function getPostureHistory(deviceNo: number, period: { date: string } | { month: string }): Promise<PostureLog[]> {
  try {
    return (await request<PostureLog[]>('/api/ai/posture/history', { query: { deviceNo, ...period } })) ?? [];
  } catch (e) {
    if (e instanceof ApiError && e.code !== 'NETWORK_ERROR') throw new ApiError(e.status, e.code, '리포트를 불러오지 못했습니다.');
    throw e;
  }
}

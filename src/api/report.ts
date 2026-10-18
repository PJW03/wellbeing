import { ApiError, request } from './client';

// TODO: 월간/일별 리포트 응답 필드명이 명세에 없어(설명만 있음) 예상되는 이름 후보 중 먼저 있는 값을 사용
//       실제 응답을 확인하면 아래 후보 목록을 실제 필드명 하나로 정리하기
type Raw = Record<string, any>;

const pick = (raw: Raw | null | undefined, keys: string[]) => {
  for (const k of keys) if (raw?.[k] != null) return raw[k];
  return undefined;
};
const num = (raw: Raw | null | undefined, keys: string[]) => {
  const v = Number(pick(raw, keys));
  return Number.isFinite(v) ? v : null;
};
const str = (raw: Raw | null | undefined, keys: string[]) => {
  const v = pick(raw, keys);
  return typeof v === 'string' && v.trim() ? v.trim() : null;
};
const list = (raw: Raw | null | undefined, keys: string[]): Raw[] => {
  const v = pick(raw, keys);
  return Array.isArray(v) ? v : [];
};

const fail = (e: unknown, message: string): never => {
  if (e instanceof ApiError && e.code !== 'NETWORK_ERROR') throw new ApiError(e.status, e.code, message);
  throw e;
};

export interface PostureRank {
  label: string;
  count: number;
}

export interface MonthlyReport {
  envAlertCount: number;
  postureAlertCount: number;
  comment: string | null;
  top3: PostureRank[];
}

// 월간 리포트 — month: 'YYYY-MM'
export async function getMonthlyReport(deviceNo: number, month: string): Promise<MonthlyReport> {
  try {
    const raw = await request<Raw>('/api/ai/report/monthly', { query: { deviceNo, month } });
    return {
      envAlertCount: num(raw, ['envAlertCount', 'envCount', 'environmentAlertCount', 'totalEnvAlerts']) ?? 0,
      postureAlertCount: num(raw, ['postureAlertCount', 'postureCount', 'totalPostureAlerts']) ?? 0,
      comment: str(raw, ['comment', 'aiComment', 'message']),
      top3: list(raw, ['top3', 'postureTop3', 'topPostures', 'top3Postures'])
        .map(item => ({
          label: str(item, ['label', 'pType', 'postureType', 'behavior', 'name']) ?? '-',
          count: num(item, ['count', 'cnt', 'total']) ?? 0,
        }))
        .slice(0, 3),
    };
  } catch (e) {
    return fail(e, '월간 리포트를 불러오지 못했습니다.');
  }
}

export interface DailyAlert {
  id: string;
  message: string;
  detail: string | null;
  sentAt: string | null;
}

export interface DailyReport {
  temp: number | null;
  humid: number | null;
  dust: number | null;
  co2: number | null;
  comment: string | null;
  alerts: DailyAlert[];
}

// 일별 리포트 — date: 'YYYY-MM-DD'
export async function getDailyReport(deviceNo: number, date: string): Promise<DailyReport> {
  try {
    const raw = await request<Raw>('/api/ai/report/daily', { query: { deviceNo, date } });
    return {
      temp: num(raw, ['avgTemp', 'temp', 'avg_temp']),
      humid: num(raw, ['avgHumid', 'avgHumidity', 'humid', 'humidity']),
      dust: num(raw, ['avgDust', 'dust']),
      co2: num(raw, ['avgCo2', 'co2']),
      comment: str(raw, ['comment', 'aiComment']),
      alerts: list(raw, ['notifications', 'alerts', 'alertList', 'notificationList']).map((n, i) => ({
        id: String(pick(n, ['notiNo', 'id']) ?? i),
        message: str(n, ['message', 'content']) ?? '',
        detail: str(n, ['detail', 'category', 'sensorType']),
        sentAt: str(n, ['sentAt', 'createdAt', 'time']),
      })),
    };
  } catch (e) {
    return fail(e, '일별 리포트를 불러오지 못했습니다.');
  }
}

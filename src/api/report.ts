import { ApiError, request } from './client';
import type { Notification } from './notification';

const fail = (e: unknown, message: string): never => {
  if (e instanceof ApiError && e.code !== 'NETWORK_ERROR') throw new ApiError(e.status, e.code, message);
  throw e;
};

const toNum = (v: unknown) => {
  const n = Number(v);
  return v != null && Number.isFinite(n) ? n : null;
};
const toStr = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

interface MonthlyReportDto {
  environmentAlertCount?: number;
  postureAlertCount?: number;
  monthlyMessage?: string;
  // pType: 영문 코드(SLEEP 등), category: 화면 표시용 한글 이름(졸음 감지 등)
  postureTop3?: { pType: string; category: string; count: number }[];
}

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
    const raw = await request<MonthlyReportDto | null>('/api/ai/report/monthly', { query: { deviceNo, month } });
    return {
      envAlertCount: toNum(raw?.environmentAlertCount) ?? 0,
      postureAlertCount: toNum(raw?.postureAlertCount) ?? 0,
      comment: toStr(raw?.monthlyMessage),
      top3: (raw?.postureTop3 ?? [])
        .map(item => ({ label: toStr(item.category) ?? item.pType ?? '-', count: toNum(item.count) ?? 0 }))
        .slice(0, 3),
    };
  } catch (e) {
    return fail(e, '월간 리포트를 불러오지 못했습니다.');
  }
}

interface DailyReportDto {
  dailyMessage?: string;
  avgTemp?: number;
  avgHumid?: number;
  avgDust?: number;
  avgCo2?: number;
  notificationList?: Notification[];
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
    const raw = await request<DailyReportDto | null>('/api/ai/report/daily', { query: { deviceNo, date } });
    return {
      temp: toNum(raw?.avgTemp),
      humid: toNum(raw?.avgHumid),
      dust: toNum(raw?.avgDust),
      co2: toNum(raw?.avgCo2),
      comment: toStr(raw?.dailyMessage),
      alerts: (raw?.notificationList ?? []).map(n => ({
        id: String(n.notiNo),
        message: n.message ?? '',
        detail: toStr(n.category),
        sentAt: toStr(n.sentAt),
      })),
    };
  } catch (e) {
    return fail(e, '일별 리포트를 불러오지 못했습니다.');
  }
}

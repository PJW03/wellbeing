// 서버 시각 문자열 → Date ('yyyy-MM-dd HH:mm:ss'처럼 공백 구분이면 Hermes가 못 읽어 'T'로 바꿔 파싱), 실패 시 null
export const parseServerTime = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(value.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
};

const pad = (n: number) => n.toString().padStart(2, '0');

// 로컬 날짜 기준 'YYYY-MM' / 'YYYY-MM-DD' (toISOString은 UTC라 자정 무렵 날짜가 하루 밀릴 수 있음)
export const toMonthParam = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const toDateParam = (d: Date) => `${toMonthParam(d)}-${pad(d.getDate())}`;

import { BASE_URL, REQUEST_TIMEOUT } from '../config/api';

// 서버가 실패 시 내려주는 문자열 코드(예: EXIST_ID, EMAIL_NOT_FOUND)를 code에 담아 화면에서 메시지로 변환
export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// 로그인 시 받은 JWT — 이후 모든 요청의 Authorization 헤더에 실음
let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  // 'text': 본문을 JSON으로 파싱하지 않고 문자열 그대로 받음 (아이디처럼 숫자·true 등으로 보일 수 있는 문자열 응답용)
  responseType?: 'json' | 'text';
}

const buildUrl = (path: string, query?: RequestOptions['query']) => {
  const params = Object.entries(query ?? {})
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `${BASE_URL}${path}${params ? `?${params}` : ''}`;
};

// 응답 본문: JSON이면 파싱, 아니면 문자열 그대로 (서버가 "SUCCESS" 같은 문자열을 반환하는 API가 많음)
const parseBody = (text: string): unknown => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export async function request<T = unknown>(path: string, { method = 'GET', query, body, responseType = 'json' }: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  // 본문 수신까지 타임아웃을 유지 — 헤더만 오고 본문이 멈춰도 무한 대기하지 않게 함
  let res: Response;
  let text: string;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    text = await res.text();
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
  } finally {
    clearTimeout(timer);
  }

  const data = responseType === 'text' ? text : parseBody(text);
  if (!res.ok) {
    const code = typeof data === 'string' ? data : (data as any)?.code ?? (data as any)?.message ?? '';
    throw new ApiError(res.status, String(code), `요청에 실패했습니다. (${res.status})`);
  }
  return data as T;
}

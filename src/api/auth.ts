import { ApiError, request } from './client';

export interface SignupRequest {
  userId: string;
  userPw: string;
  userEmail: string;
  nickname: string;
}

export interface LoginRequest {
  userId: string;
  userPw: string;
}

export interface User {
  userNo: number;
  userId: string;
  userEmail: string;
  nickname: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// 서버 문자열 코드 → 사용자 메시지
const ERROR_MESSAGES: Record<string, string> = {
  EXIST_ID: '이미 사용 중인 아이디입니다.',
  EXIST_EMAIL: '이미 사용 중인 이메일입니다.',
  EMAIL_NOT_FOUND: '해당 이메일로 가입된 계정이 없습니다.',
  USER_ID_NOT_FOUND: '존재하지 않는 아이디입니다.',
};

// 서버가 실패를 200 + 에러 코드 문자열로 내려주는 경우도 있어, 기대한 성공 값이 아니면 실패로 처리
const expect = (result: unknown, success: string, fallback: string) => {
  if (result !== success) {
    const code = typeof result === 'string' ? result : '';
    throw new ApiError(200, code, ERROR_MESSAGES[code] ?? fallback);
  }
};

// 에러 코드를 사용자 메시지로 바꿔 다시 던짐 (네트워크 오류 메시지는 그대로 유지)
const rethrow = (e: unknown, fallback: string): never => {
  if (e instanceof ApiError && e.code !== 'NETWORK_ERROR') {
    throw new ApiError(e.status, e.code, ERROR_MESSAGES[e.code] ?? fallback);
  }
  throw e;
};

// 3. 회원가입
export async function signup(data: SignupRequest): Promise<void> {
  try {
    const result = await request('/api/login/signup', { method: 'POST', body: data });
    expect(result, 'SUCCESS', '회원가입에 실패했습니다.');
  } catch (e) {
    rethrow(e, '회원가입에 실패했습니다.');
  }
}

// 4. 로그인 (JWT 발급)
export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const result = await request<LoginResponse | string>('/api/login/login', { method: 'POST', body: data });
    // 200 + 에러 코드 문자열로 실패가 오는 경우 — token/user가 없으면 실패로 처리
    if (typeof result !== 'object' || !result?.token || !result.user) {
      throw new ApiError(200, typeof result === 'string' ? result : '', '아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    return result;
  } catch (e) {
    return rethrow(e, '아이디 또는 비밀번호가 올바르지 않습니다.');
  }
}

// 5. 아이디 찾기 — 이메일로 인증코드 발송
export async function sendFindIdCode(userEmail: string): Promise<void> {
  try {
    const result = await request('/api/login/find-id/send', { method: 'POST', body: { userEmail } });
    expect(result, 'SENT', '인증코드 발송에 실패했습니다.');
  } catch (e) {
    rethrow(e, '인증코드 발송에 실패했습니다.');
  }
}

const FIND_ID_ERROR = /^[A-Z_]*(INVALID|FAIL|NOT_FOUND|EXPIRED|MISMATCH|WRONG|ERROR)[A-Z_]*$/;

// 6. 아이디 찾기 — 인증코드 확인 후 아이디 반환
export async function verifyFindIdCode(userEmail: string, code: string): Promise<string> {
  try {
    const raw = await request<string>('/api/login/find-id/verify', { method: 'POST', body: { userEmail, code }, responseType: 'text' });
    // 숫자로만 된 아이디(12345)가 숫자로 바뀌지 않게 문자열로 받음 — JSON 문자열("abc")로 올 때만 따옴표 제거
    const result = /^".*"$/.test(raw.trim()) ? JSON.parse(raw.trim()) : raw.trim();
    // 명세상 실패도 문자열(에러 코드)로 옴 — 대문자 아이디(ADMIN 등)와 구분하려고 에러 코드 형태의 키워드로만 판별
    if (typeof result !== 'string' || !result || FIND_ID_ERROR.test(result)) {
      throw new ApiError(200, String(result ?? ''), '인증코드가 올바르지 않습니다.');
    }
    return result;
  } catch (e) {
    return rethrow(e, '인증코드가 올바르지 않습니다.');
  }
}

// 7. 비밀번호 재설정 1단계 — 가입 이메일로 인증코드 발송
export async function sendResetPwCode(userId: string): Promise<void> {
  try {
    const result = await request('/api/login/reset-pw/send', { method: 'POST', body: { userId } });
    expect(result, 'SENT', '인증코드 발송에 실패했습니다.');
  } catch (e) {
    rethrow(e, '인증코드 발송에 실패했습니다.');
  }
}

// 8. 비밀번호 재설정 2단계 — 인증코드 확인 후 10분짜리 리셋 토큰 발급
export async function verifyResetPwCode(userId: string, code: string): Promise<string> {
  try {
    const result = await request<{ resetToken?: string } | string>('/api/login/reset-pw/verify-code', {
      method: 'POST',
      body: { userId, code },
    });
    const resetToken = typeof result === 'object' ? result?.resetToken : undefined;
    if (!resetToken) throw new ApiError(200, typeof result === 'string' ? result : '', '인증코드가 올바르지 않습니다.');
    return resetToken;
  } catch (e) {
    return rethrow(e, '인증코드가 올바르지 않습니다.');
  }
}

// 회원정보 수정·탈퇴는 성공 응답 문자열이 명세에 없어, 에러 코드 형태의 문자열이 오면 실패로 처리
const USER_ERROR = /(INVALID|FAIL|NOT_FOUND|MISMATCH|WRONG|ERROR|EXIST|NOT_MATCH)/;

const checkUserResult = (result: unknown, fallback: string) => {
  if (typeof result === 'string' && USER_ERROR.test(result)) throw new ApiError(200, result, fallback);
};

// 현재 비밀번호 검증 실패 코드는 명세에 없어 PASSWORD가 들어간 코드로 판별
const rethrowUser = (e: unknown, fallback: string): never => {
  if (e instanceof ApiError && e.code !== 'NETWORK_ERROR' && /PASSWORD|PW/.test(e.code)) {
    throw new ApiError(e.status, e.code, '현재 비밀번호가 올바르지 않습니다.');
  }
  return rethrow(e, fallback);
};

export interface UpdateUserRequest {
  userNo: number;
  currentPw: string;
  // 바꾸려는 필드만 보냄 (부분 수정)
  nickname?: string;
  userEmail?: string;
  newPw?: string;
}

// 회원정보 수정 (현재 비밀번호 검증)
export async function updateUser(data: UpdateUserRequest): Promise<void> {
  try {
    const result = await request('/api/user', { method: 'PATCH', body: data });
    checkUserResult(result, '회원정보 수정에 실패했습니다.');
  } catch (e) {
    rethrowUser(e, '회원정보 수정에 실패했습니다.');
  }
}

// 회원 탈퇴 (현재 비밀번호 검증)
export async function deleteUser(userNo: number, currentPw: string): Promise<void> {
  try {
    const result = await request('/api/user', { method: 'DELETE', body: { userNo, currentPw } });
    checkUserResult(result, '회원 탈퇴에 실패했습니다.');
  } catch (e) {
    rethrowUser(e, '회원 탈퇴에 실패했습니다.');
  }
}

// 로그아웃 — 서버에 저장된 이 사용자의 FCM 토큰을 비워 더 이상 푸시가 오지 않게 함
export async function logout(userId: string): Promise<void> {
  try {
    await request('/api/login/logout', { method: 'POST', body: { userId } });
  } catch (e) {
    rethrow(e, '로그아웃 처리에 실패했습니다.');
  }
}

// 9. 비밀번호 재설정 3단계 — 리셋 토큰으로 새 비밀번호 저장
export async function changePassword(resetToken: string, newPw: string): Promise<void> {
  try {
    const result = await request('/api/login/reset-pw/change', { method: 'POST', body: { resetToken, newPw } });
    expect(result, 'PASSWORD_RESET_SUCCESS', '비밀번호 변경에 실패했습니다.');
  } catch (e) {
    rethrow(e, '비밀번호 변경에 실패했습니다. 처음부터 다시 시도해주세요.');
  }
}

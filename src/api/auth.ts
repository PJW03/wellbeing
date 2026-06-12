import { BASE_URL } from '../config/api';

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

export interface LoginResponse {
  token: string;
  user: {
    userNo: number;
    userId: string;
    userEmail: string;
    nickname: string;
    createdAt: string;
  };
}

export async function signup(data: SignupRequest): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/login/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    if (text === 'EXIST_ID') throw new Error('이미 사용 중인 아이디입니다.');
    if (text === 'EXIST_EMAIL') throw new Error('이미 사용 중인 이메일입니다.');
    throw new Error('회원가입에 실패했습니다.');
  }
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/login/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  return res.json();
}

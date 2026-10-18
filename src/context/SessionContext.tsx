import React, { createContext, useContext, useMemo } from 'react';
import { User } from '../api/auth';
import { DEFAULT_DEVICE_NO } from '../config/api';

export interface Session {
  token: string;
  user: User;
  deviceNo: number;
}

interface SessionValue extends Session {
  // 회원정보 수정 후 화면(사이드바 닉네임 등)에 바로 반영
  updateUser: (changes: Partial<User>) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export const SessionProvider: React.FC<{
  session: Session | null;
  onUpdateUser: (changes: Partial<User>) => void;
  onLogout: () => void;
  children: React.ReactNode;
}> = ({ session, onUpdateUser, onLogout, children }) => {
  const value = useMemo(
    () => (session ? { ...session, updateUser: onUpdateUser, logout: onLogout } : null),
    [session, onUpdateUser, onLogout],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

// 로그인 이후 화면에서만 사용 (App이 로그인 전에는 이 화면들을 렌더하지 않음)
export const useSession = (): SessionValue => {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession은 로그인 이후 화면에서만 사용할 수 있습니다.');
  return session;
};

export const createSession = (token: string, user: User): Session => ({ token, user, deviceNo: DEFAULT_DEVICE_NO });

/**
 * Wellbeing App
 * React Native 건강 관리 애플리케이션
 *
 * @format
 */

import React, { useCallback, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen, { LoginScreenProps } from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import SignupCompleteScreen from './src/screens/SignupCompleteScreen';
import FindIdScreen from './src/screens/FindIdScreen';
import FindPasswordScreen from './src/screens/FindPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ReportScreen from './src/screens/ReportScreen';
import ReportDailyScreen from './src/screens/ReportDailyScreen';
import AccountSettingsScreen from './src/screens/AccountSettingsScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import {
  Session,
  SessionProvider,
  createSession,
} from './src/context/SessionContext';
import { setAuthToken } from './src/api/client';
import { logout, User } from './src/api/auth';
import { unregisterFcm } from './src/utils/fcm';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  SignupComplete: undefined;
  FindID: undefined;
  FindPassword: undefined;
  Home: undefined;
  Notifications: undefined;
  Report: undefined;
  ReportDaily: { dateISO?: string };
  AccountSettings: undefined;
  NotificationSettings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null);

  const handleLogin: LoginScreenProps['onLoginSuccess'] = (token, user) => {
    setAuthToken(token);
    setSession(createSession(token, user));
  };

  const handleLogout = useCallback(() => {
    // 서버 FCM 토큰 초기화 — 토큰을 지우기 전에 요청을 보내 인증 헤더가 실리게 함, 실패해도 로그아웃은 진행
    if (session) logout(session.user.userId).catch(e => console.warn('[LOGOUT]', e.message));
    unregisterFcm();
    setAuthToken(null);
    setSession(null);
  }, [session]);

  const handleUpdateUser = useCallback((changes: Partial<User>) => {
    setSession(prev => (prev ? { ...prev, user: { ...prev.user, ...changes } } : prev));
  }, []);

  return (
    <SafeAreaProvider>
      <SessionProvider session={session} onUpdateUser={handleUpdateUser} onLogout={handleLogout}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'none',
            }}
          >
            {!session ? (
              <>
                <Stack.Screen name="Login">
                  {props => (
                    <LoginScreen {...props} onLoginSuccess={handleLogin} />
                  )}
                </Stack.Screen>
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen
                  name="SignupComplete"
                  component={SignupCompleteScreen}
                />
                <Stack.Screen name="FindID" component={FindIdScreen} />
                <Stack.Screen
                  name="FindPassword"
                  component={FindPasswordScreen}
                />
              </>
            ) : (
              <>
                <Stack.Screen name="Home">
                  {() => <HomeScreen onLogout={handleLogout} />}
                </Stack.Screen>
                <Stack.Screen
                  name="Notifications"
                  component={NotificationsScreen}
                />
                <Stack.Screen name="Report" component={ReportScreen} />
                <Stack.Screen
                  name="ReportDaily"
                  component={ReportDailyScreen}
                />
                <Stack.Screen
                  name="AccountSettings"
                  component={AccountSettingsScreen}
                />
                <Stack.Screen
                  name="NotificationSettings"
                  component={NotificationSettingsScreen}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

export default App;

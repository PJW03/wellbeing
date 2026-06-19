import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { styles } from '../styles/loginScreenStyles';
import { login } from '../api/auth';
import { registerFcmToken, setupForegroundNotification } from '../utils/fcm';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps & any> = ({ onLoginSuccess, navigation }) => {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userId.trim() || !password.trim()) return;
    setLoading(true);
    try {
      const result = await login({ userId: userId.trim(), userPw: password });
      console.log('로그인 성공:', result.user);
      onLoginSuccess?.();
      // FCM 등록은 로그인 완료 후 백그라운드에서 처리
      registerFcmToken(result.user.userId).then(() => {
        setupForegroundNotification();
      });
    } catch (e: any) {
      Alert.alert('로그인 실패', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Svg
        pointerEvents="none"
        style={styles.radialBackground}
      >
        <Defs>
          <RadialGradient id="bgGradient" cx="90%" cy="60%" rx="90%" ry="90%">
            <Stop offset="0%" stopColor="#00C5B9" stopOpacity="0.38" />
            <Stop offset="35%" stopColor="#66D9CE" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGradient)" />
      </Svg>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
        <View style={styles.content}>
          {/* 제목 */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>로그인</Text>
            <View style={styles.titleUnderline} />
          </View>

          {/* 입력 필드 */}
          <View style={styles.inputSection}>
            {/* 아이디 입력 */}
            <TextInput
              style={styles.input}
              placeholder="아이디"
              placeholderTextColor="#B8B8B8"
              value={userId}
              onChangeText={setUserId}
              autoCapitalize="none"
            />

            {/* 비밀번호 입력 */}
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor="#B8B8B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* 링크 섹션 */}
          <View style={styles.linkSection}>
            <View style={styles.leftLinks}>
              <TouchableOpacity onPress={() => navigation?.navigate('FindID')}>
                <Text style={styles.linkText}>아이디 찾기</Text>
              </TouchableOpacity>
              <Text style={styles.linkDivider}> / </Text>
              <TouchableOpacity onPress={() => navigation?.navigate('FindPassword')}>
                <Text style={styles.linkText}>비밀번호 찾기</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation?.navigate('Signup')}>
              <Text style={styles.linkText}>회원가입</Text>
            </TouchableOpacity>
          </View>

          {/* 로그인 버튼 */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.loginButtonText}>로그인</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

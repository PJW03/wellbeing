import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { createLoginStyles } from '../styles/loginScreenStyles';
import { useFitLayout, Gap } from '../utils/figmaScale';
// TODO: API 임시 비활성화 — 복구 시 아래 두 줄과 handleLogin 내부 주석 참고
// import { login } from '../api/auth';
// import { registerFcmToken, setupForegroundNotification } from '../utils/fcm';

// ─── 화면 맞춤 레이아웃 (Figma px 기준, 프레임 높이 639) ─────
const BLOCKS = ['welcome', 'form'];
const TOP: Gap = { design: 106.5, min: 0, max: 160, safeTop: true };
const MASCOT_GAP: Gap = { design: 3, min: 3, max: 12 };
const BOTTOM: Gap = { design: 128, min: 16, max: 250 };
const GAPS = [TOP, MASCOT_GAP, BOTTOM];

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

const PersonIcon: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path
      d="M9 8.5C9.69223 8.5 10.3689 8.29473 10.9445 7.91015C11.5201 7.52556 11.9687 6.97894 12.2336 6.33939C12.4985 5.69985 12.5678 4.99612 12.4327 4.31719C12.2977 3.63825 11.9644 3.01461 11.4749 2.52513C10.9854 2.03564 10.3618 1.7023 9.68282 1.56725C9.00388 1.4322 8.30015 1.50152 7.66061 1.76642C7.02107 2.03133 6.47444 2.47993 6.08986 3.05551C5.70527 3.63108 5.5 4.30777 5.5 5C5.5 5.92826 5.86875 6.8185 6.52513 7.47487C7.1815 8.13125 8.07174 8.5 9 8.5ZM9 2.5C9.49445 2.5 9.9778 2.64662 10.3889 2.92133C10.8 3.19603 11.1205 3.58648 11.3097 4.04329C11.4989 4.50011 11.5484 5.00277 11.452 5.48773C11.3555 5.97268 11.1174 6.41814 10.7678 6.76777C10.4181 7.1174 9.97268 7.3555 9.48773 7.45196C9.00277 7.54843 8.50011 7.49892 8.04329 7.3097C7.58648 7.12048 7.19603 6.80005 6.92133 6.38893C6.64662 5.9778 6.5 5.49445 6.5 5C6.5 4.33696 6.76339 3.70108 7.23223 3.23223C7.70107 2.76339 8.33696 2.5 9 2.5Z"
      fill="#7B8794"
    />
    <Path
      d="M15.235 12.1849C14.4332 11.3374 13.4669 10.6624 12.3953 10.201C11.3237 9.73966 10.1692 9.50171 9.0025 9.50171C7.83579 9.50171 6.68135 9.73966 5.60973 10.201C4.53811 10.6624 3.57185 11.3374 2.77 12.1849C2.59616 12.3706 2.49961 12.6155 2.5 12.8699V15.4999C2.5 15.7651 2.60536 16.0195 2.79289 16.207C2.98043 16.3945 3.23478 16.4999 3.5 16.4999H14.5C14.7652 16.4999 15.0196 16.3945 15.2071 16.207C15.3946 16.0195 15.5 15.7651 15.5 15.4999V12.8699C15.5018 12.6162 15.407 12.3714 15.235 12.1849ZM14.5 15.4999H3.5V12.8649C4.20862 12.1187 5.06165 11.5246 6.00718 11.1185C6.95271 10.7125 7.97098 10.5031 9 10.5031C10.029 10.5031 11.0473 10.7125 11.9928 11.1185C12.9384 11.5246 13.7914 12.1187 14.5 12.8649V15.4999Z"
      fill="#7B8794"
    />
  </Svg>
);

const KeyIcon: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 15 15" fill="none">
    <Path
      d="M5.41582 3.48653L3.14424 5.75811C2.98152 5.92083 2.98152 6.18464 3.14424 6.34736L3.31217 6.5153C3.47489 6.67802 3.73871 6.67802 3.90143 6.5153L6.17301 4.24372C6.33573 4.081 6.33573 3.81718 6.17301 3.65446L6.00507 3.48653C5.84236 3.32381 5.57854 3.32381 5.41582 3.48653Z"
      fill="#7B8794"
    />
    <Path
      d="M9.72913 7.00021L9.99163 6.73771C10.3833 6.34813 10.6042 5.81894 10.6058 5.26651C10.6073 4.71409 10.3894 4.18366 9.99996 3.79187L7.79579 1.60021C7.40511 1.20964 6.8753 0.990234 6.32288 0.990234C5.77045 0.990234 5.24064 1.20964 4.84996 1.60021L1.28746 5.16271C0.896897 5.55339 0.67749 6.0832 0.67749 6.63562C0.67749 7.18805 0.896897 7.71786 1.28746 8.10854L3.47913 10.3002C3.86981 10.6908 4.39962 10.9102 4.95205 10.9102C5.50447 10.9102 6.03428 10.6908 6.42496 10.3002L6.59163 10.1335L7.49996 11.0335H8.9333V12.2835H10.4708V12.9627L11.6666 14.1669H14.1666V11.4377L9.72913 7.00021ZM13.3333 13.3335H12.025L11.2875 12.6002V11.4335H9.75413V10.1835H7.8333L6.5833 8.93354L5.8333 9.71271C5.59892 9.94679 5.28121 10.0783 4.94996 10.0783C4.61871 10.0783 4.301 9.94679 4.06663 9.71271L1.87496 7.50021C1.64088 7.26583 1.5094 6.94812 1.5094 6.61687C1.5094 6.28562 1.64088 5.96792 1.87496 5.73354L5.44163 2.16687C5.676 1.93279 5.99371 1.80131 6.32496 1.80131C6.65621 1.80131 6.97392 1.93279 7.2083 2.16687L9.39996 4.35854C9.63405 4.59292 9.76553 4.91062 9.76553 5.24187C9.76553 5.57312 9.63405 5.89083 9.39996 6.12521L8.56663 6.95854L13.3333 11.7835V13.3335Z"
      fill="#7B8794"
    />
  </Svg>
);

const LoginScreen: React.FC<LoginScreenProps & any> = ({ onLoginSuccess, navigation }) => {
  const { f, fx, areaHeight, bottomInset, onAreaLayout, measure, spacer, ready } = useFitLayout({ blocks: BLOCKS, gaps: GAPS, safeBottom: true });
  // 스타일 값은 393dp 기준 dp → Figma px(×0.75)로 환산해 스케일 적용
  const d = (v: number) => f(v * 0.75);
  const dx = (v: number) => fx(v * 0.75);
  const scale = f(1);
  const scaleX = fx(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const styles = useMemo(() => createLoginStyles(d, dx), [scale, scaleX]);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  // TODO: API 임시 비활성화 — 버튼 클릭 시 바로 홈으로 이동만 함. 복구 시 아래처럼 되돌리기:
  // const result = await login({ userId: userId.trim(), userPw: password });
  // registerFcmToken(result.user.userId).then(() => setupForegroundNotification());
  const handleLogin = () => {
    onLoginSuccess?.();
  };

  return (
    <View style={[styles.container, styles.screenBg]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        {/* 본문 높이는 키보드가 열리기 전 화면 높이로 고정 — 키보드가 가리면 스크롤로 입력칸까지 이동 */}
        <ScrollView
          onLayout={onAreaLayout}
          contentContainerStyle={{ height: areaHeight ?? undefined, paddingBottom: bottomInset, opacity: ready ? 1 : 0 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {spacer(TOP)}
          {/* 인사말 */}
          <View style={styles.welcomeSection} onLayout={measure('welcome')}>
            <Text style={styles.welcomeTitle}>
              다시 만나서{'\n'}
              <Text style={styles.welcomeAccent}>반가워요! 👋</Text>
            </Text>
            <Text style={styles.welcomeSubtitle}>오늘도 건강한 하루를 시작해볼까요?</Text>
          </View>

          {spacer(MASCOT_GAP)}
          <View style={styles.cardScreenContent} onLayout={measure('form')}>
            {/* 마스코트 (카드가 아래쪽을 살짝 덮음) */}
            <Image
              source={require('../image/mascot_robot.png')}
              style={styles.mascotImage}
              resizeMode="contain"
            />

            {/* 입력 카드 */}
            <View style={styles.card}>
              <View style={styles.cardInputRow}>
                <View style={styles.cardInputIcon}>
                  <PersonIcon size={d(16)} />
                </View>
                <TextInput
                  style={styles.cardInput}
                  placeholder="아이디를 입력해주세요."
                  placeholderTextColor="#B0BFC2"
                  value={userId}
                  onChangeText={setUserId}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.cardInputRow}>
                <View style={styles.cardInputIcon}>
                  <KeyIcon size={d(16)} />
                </View>
                <TextInput
                  style={styles.cardInput}
                  placeholder="비밀번호를 입력해주세요."
                  placeholderTextColor="#B0BFC2"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.cardButton}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.cardButtonText}>로그인</Text>
              </TouchableOpacity>

              <View style={styles.cardLinksRow}>
                <TouchableOpacity onPress={() => navigation?.navigate('FindID')}>
                  <Text style={styles.cardLinkText}>아이디 찾기</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation?.navigate('FindPassword')}>
                  <Text style={styles.cardLinkText}>비밀번호 찾기</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardSignupRow}>
                <Text style={styles.cardSignupText}>아직 계정이 없으신가요?</Text>
                <TouchableOpacity onPress={() => navigation?.navigate('Signup')}>
                  <Text style={styles.cardSignupLink}>회원가입</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {spacer(BOTTOM)}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

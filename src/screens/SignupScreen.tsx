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
  StyleSheet,
} from 'react-native';
import ChevronLeftIcon from '../icon/chevron_left_auth.svg';
import { useFitLayout, Gap } from '../utils/figmaScale';
// TODO: API 임시 비활성화 — 복구 시 아래 줄과 handleComplete 내부 주석 참고
// import { signup } from '../api/auth';

// Figma(Pretendard) 기본 줄 높이 — 안드로이드 기본 줄 높이가 더 커서 글자가 아래로 밀리는 것 방지
const LH = 1.2;

// ─── 색상 상수 (Figma 회원가입-1/2) ─────────────────────────
const SCREEN_BG   = '#F7FFFE';
const CARD_BG     = '#F7FAFA';
const TEAL        = '#18B8AE';
const TEXT        = '#172033';
const TEXT_S      = '#7B8794';
const BORDER      = '#EDF2F2';
const BORDER_SOFT = 'rgba(231,241,243,0.9)';
const INACTIVE    = 'rgba(123,135,148,0.5)';

// ─── 화면 맞춤 레이아웃 (Figma px 기준, 프레임 높이 639) ─────
const BLOCKS = ['back', 'progress', 'title', 'card', 'button'];
const TOP: Gap = { design: 39.75, min: 0, max: 60, safeTop: true };
const PROGRESS_GAP: Gap = { design: 9.75, min: 4.5, max: 15 };
const TITLE_GAP: Gap = { design: 31.5, min: 12, max: 48 };
// 1단계(계정 만들기) / 2단계(기본 정보)는 Figma 간격이 다름
const STEP_GAPS: Record<1 | 2, { card: Gap; button: Gap; bottom: Gap }> = {
  1: {
    card: { design: 28.5, min: 12, max: 40 },
    button: { design: 26.25, min: 12, max: 36 },
    bottom: { design: 52, min: 16, max: 300 },
  },
  2: {
    card: { design: 21, min: 12, max: 40 },
    button: { design: 24.75, min: 12, max: 36 },
    bottom: { design: 188, min: 16, max: 300 },
  },
};

interface Field {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address';
}

const SignupScreen: React.FC<any> = ({ navigation }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const gaps = STEP_GAPS[step];
  const { f, fx, areaHeight, bottomInset, onAreaLayout, measure, spacer, ready } = useFitLayout({
    blocks: BLOCKS,
    gaps: [TOP, PROGRESS_GAP, TITLE_GAP, gaps.card, gaps.button, gaps.bottom],
    safeBottom: true,
  });

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');

  const handleNext = () => {
    if (!id.trim() || !password || !passwordConfirm) {
      Alert.alert('알림', '아이디와 비밀번호를 입력해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    setStep(2);
  };

  // TODO: API 임시 비활성화 — 버튼 클릭 시 바로 완료 화면으로 이동만 함. 복구 시 아래처럼 되돌리기:
  // await signup({ userId: id.trim(), userPw: password, userEmail: email.trim(), nickname: nickname.trim() });
  const handleComplete = () => {
    navigation.replace('SignupComplete');
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigation.goBack();
    }
  };

  const fields: Field[] = step === 1
    ? [
        { label: '아이디', placeholder: '영문, 숫자 4자 이상', value: id, onChange: setId },
        { label: '비밀번호', placeholder: '영문, 숫자 포함 8자 이상', value: password, onChange: setPassword, secure: true },
        { label: '비밀번호 확인', placeholder: '비밀번호를 다시 입력해주세요.', value: passwordConfirm, onChange: setPasswordConfirm, secure: true },
      ]
    : [
        { label: '닉네임', placeholder: '앱에서 사용할 닉네임을 입력해주세요.', value: nickname, onChange: setNickname },
        { label: '이메일', placeholder: '이메일을 입력해주세요.', value: email, onChange: setEmail, keyboardType: 'email-address' },
      ];

  const smallShadow = {
    shadowColor: '#526A73',
    shadowOffset: { width: f(3), height: f(3) },
    shadowOpacity: 0.07,
    shadowRadius: f(3),
    elevation: 2,
  };
  const stepColor = step === 2 ? TEAL : INACTIVE;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}>
        {/* 본문 높이는 키보드가 열리기 전 화면 높이로 고정 — 키보드가 가리면 스크롤로 입력칸까지 이동 */}
        <ScrollView
          onLayout={onAreaLayout}
          contentContainerStyle={{ height: areaHeight ?? undefined, paddingBottom: bottomInset, opacity: ready ? 1 : 0 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {spacer(TOP)}
          {/* ── 뒤로가기 ── */}
          <TouchableOpacity onLayout={measure('back')} onPress={handleBack} hitSlop={8} style={{ marginLeft: fx(5.25), alignSelf: 'flex-start' }}>
            <ChevronLeftIcon width={f(25.5)} height={f(25.5)} />
          </TouchableOpacity>

          {/* ── 진행 표시 (●──●) ── */}
          {spacer(PROGRESS_GAP)}
          <View onLayout={measure('progress')} style={[s.row, { alignSelf: 'center' }]}>
            <View style={{ width: f(9), height: f(9), borderRadius: f(4.5), backgroundColor: TEAL }} />
            <View style={{ width: f(44.25), height: f(2.25), backgroundColor: stepColor, marginHorizontal: f(-0.75) }} />
            <View style={{ width: f(9), height: f(9), borderRadius: f(4.5), backgroundColor: stepColor }} />
          </View>

          {/* ── 타이틀 ── */}
          {spacer(TITLE_GAP)}
          <View onLayout={measure('title')} style={{ marginLeft: fx(18) }}>
            {step === 1 ? (
              <>
                <Text style={{ fontSize: f(22.5), lineHeight: f(22.5 * LH), fontWeight: '700', color: TEXT }}>계정 만들기</Text>
                <Text style={{ marginTop: f(6.75), fontSize: f(12.75), lineHeight: f(12.75 * LH), fontWeight: '500', color: TEXT_S }}>
                  Well-being과 함께할{'\n'}계정을 만들어주세요.
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: f(22.5), lineHeight: f(22.5 * LH), fontWeight: '700', color: TEXT }}>
                  기본 정보를{'\n'}
                  <Text style={{ color: TEAL }}>알려주세요.</Text>
                </Text>
                <Text style={{ marginTop: f(3), fontSize: f(12.75), lineHeight: f(12.75 * LH), fontWeight: '500', color: TEXT_S }}>
                  아이디, 비밀번호 찾기에 필요합니다.
                </Text>
              </>
            )}
          </View>

          {spacer(gaps.card)}
          {/* ── 입력 카드 ── */}
          <View
            onLayout={measure('card')}
            style={{
              position: 'relative',
              marginHorizontal: fx(20.25),
              paddingTop: f(15.75),
              paddingBottom: f(21.75),
              paddingHorizontal: fx(15),
              backgroundColor: CARD_BG,
              borderWidth: f(0.75),
              borderColor: BORDER_SOFT,
              borderRadius: f(15),
              shadowColor: '#54717A',
              shadowOffset: { width: 0, height: f(3) },
              shadowOpacity: 0.1,
              shadowRadius: f(7.5),
              elevation: 3,
            }}
          >
            {fields.map((field, idx) => (
              <View key={field.label} style={{ marginTop: idx === 0 ? 0 : f(14) }}>
                <Text style={{ marginLeft: f(4.5), fontSize: f(12.75), lineHeight: f(12.75 * LH), fontWeight: '700', color: TEXT }}>{field.label}</Text>
                <TextInput
                  style={[
                    smallShadow,
                    {
                      marginTop: f(5),
                      height: f(41.25),
                      paddingHorizontal: f(12.75),
                      paddingVertical: 0,
                      backgroundColor: '#FFFFFF',
                      borderWidth: f(0.75),
                      borderColor: BORDER,
                      borderRadius: f(12),
                      fontSize: f(10.5),
                      fontWeight: '500',
                      color: TEXT,
                    },
                  ]}
                  placeholder={field.placeholder}
                  placeholderTextColor={TEXT_S}
                  value={field.value}
                  onChangeText={field.onChange}
                  secureTextEntry={field.secure}
                  autoCapitalize="none"
                  keyboardType={field.keyboardType ?? 'default'}
                />
              </View>
            ))}
          </View>

          {spacer(gaps.button)}
          {/* ── 다음 / 완료 버튼 ── */}
          <TouchableOpacity
            onLayout={measure('button')}
            style={[
              s.center,
              smallShadow,
              {
                marginLeft: fx(35.25),
                marginRight: fx(34.5),
                height: f(41.25),
                borderRadius: f(12),
                borderWidth: f(0.75),
                borderColor: BORDER,
                backgroundColor: TEAL,
              },
            ]}
            onPress={step === 1 ? handleNext : handleComplete}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: f(13.5), lineHeight: f(13.5 * LH), fontWeight: '800', color: '#FFFFFF' }}>{step === 1 ? '다음' : '완료'}</Text>
          </TouchableOpacity>
          {spacer(gaps.bottom)}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: SCREEN_BG },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default SignupScreen;

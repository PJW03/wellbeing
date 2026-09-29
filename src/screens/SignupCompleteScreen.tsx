import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, StyleSheet } from 'react-native';
import SproutSmallIcon from '../icon/sprout_small.svg';
import MascotImage from '../image/home_mascot.png';
import { useFigmaScale } from '../utils/figmaScale';

// Figma(Pretendard) 기본 줄 높이 — 안드로이드 기본 줄 높이가 더 커서 글자가 아래로 밀리는 것 방지
const LH = 1.2;

// ─── 색상 상수 (Figma 가입완료) ─────────────────────────────
const SCREEN_BG = '#F7FFFE';
const TEAL      = '#18B8AE';
const TEXT      = '#172033';
const TEXT_S    = '#7B8794';
const BORDER    = '#EDF2F2';

const SignupCompleteScreen: React.FC<any> = ({ navigation }) => {
  const f = useFigmaScale();

  const circle = (left: number, top: number, size: number, color: string) => (
    <View
      style={{
        position: 'absolute',
        left: f(left),
        top: f(top),
        width: f(size),
        height: f(size),
        borderRadius: f(size / 2),
        backgroundColor: color,
      }}
    />
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── 마스코트 + 배경 원 ── */}
      <View style={{ height: f(360) }}>
        {circle(63, 180, 165, 'rgba(223,246,244,0.72)')}
        {circle(75, 203.25, 141, 'rgba(210,242,238,0.75)')}
        <Image
          source={MascotImage}
          style={{ position: 'absolute', left: f(62.25), top: f(194.25), width: f(170.25), height: f(157.5) }}
          resizeMode="cover"
        />
        {circle(198, 270.75, 48.75, 'rgba(207,242,237,0.4)')}
        {circle(62.25, 192, 48.75, 'rgba(207,242,237,0.4)')}
      </View>

      <Text style={{ marginTop: f(7.5), textAlign: 'center', fontSize: f(22.5), lineHeight: f(22.5 * LH), fontWeight: '700', color: TEXT }}>
        가입이 완료됐어요! 🎉
      </Text>
      <Text style={{ marginTop: f(10.5), textAlign: 'center', fontSize: f(12.75), lineHeight: f(12.75 * LH), fontWeight: '600', color: TEXT_S }}>
        이제 Well-being과 함께{'\n'}건강한 작업 습관을 만들어봐요.
      </Text>

      <TouchableOpacity
        style={[
          s.center,
          {
            alignSelf: 'center',
            marginTop: f(13.5),
            width: f(225),
            height: f(41.25),
            borderRadius: f(12),
            borderWidth: f(0.75),
            borderColor: BORDER,
            backgroundColor: TEAL,
            shadowColor: '#526A73',
            shadowOffset: { width: f(3), height: f(3) },
            shadowOpacity: 0.07,
            shadowRadius: f(3),
            elevation: 2,
          },
        ]}
        onPress={() => navigation.popToTop()}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: f(13.5), lineHeight: f(13.5 * LH), fontWeight: '800', color: '#FFFFFF' }}>시작하기</Text>
      </TouchableOpacity>

      <View
        style={[
          s.row,
          s.center,
          {
            alignSelf: 'center',
            marginTop: f(15.75),
            width: f(216),
            height: f(31.5),
            borderRadius: f(15),
            backgroundColor: '#FFFFFF',
          },
        ]}
      >
        <SproutSmallIcon width={f(9.75)} height={f(11.64)} />
        <Text style={{ marginLeft: f(9.75), fontSize: f(9.75), lineHeight: f(9.75 * LH), fontWeight: '500', color: TEXT }}>
          좋은 습관이, 더 좋은 하루를 만들어요.
        </Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: SCREEN_BG },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default SignupCompleteScreen;

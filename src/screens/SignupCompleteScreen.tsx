import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, StyleSheet } from 'react-native';
import SproutSmallIcon from '../icon/sprout_small.svg';
import MascotImage from '../image/home_mascot.png';
import { useFitLayout, Gap, FIGMA_WIDTH } from '../utils/figmaScale';

// Figma(Pretendard) 기본 줄 높이 — 안드로이드 기본 줄 높이가 더 커서 글자가 아래로 밀리는 것 방지
const LH = 1.2;

// ─── 색상 상수 (Figma 가입완료) ─────────────────────────────
const SCREEN_BG = '#F7FFFE';
const TEAL      = '#18B8AE';
const TEXT      = '#172033';
const TEXT_S    = '#7B8794';
const BORDER    = '#EDF2F2';

// ─── 화면 맞춤 레이아웃 (Figma px 기준, 가입완료 프레임 높이 639) ───
// 마스코트 영역은 Figma y 180(배경 원 시작)부터 351.75(마스코트 끝)까지
const HERO_TOP = 180;
const HERO_HEIGHT = 171.75;
const BLOCKS = ['hero', 'title', 'subtitle', 'button', 'pill'];
const TOP: Gap = { design: HERO_TOP, min: 0, max: 260, safeTop: true };
const HERO_GAP: Gap = { design: 15.75, min: 9, max: 30 };
const TITLE_GAP: Gap = { design: 10.5, min: 6, max: 18 };
const BUTTON_GAP: Gap = { design: 13.5, min: 9, max: 24 };
const PILL_GAP: Gap = { design: 15.75, min: 9, max: 24 };
const BOTTOM: Gap = { design: 101.25, min: 12, max: 180 };
const GAPS = [TOP, HERO_GAP, TITLE_GAP, BUTTON_GAP, PILL_GAP, BOTTOM];

const SignupCompleteScreen: React.FC<any> = ({ navigation }) => {
  const { f, fx, width, bottomInset, onAreaLayout, measure, spacer, ready } = useFitLayout({ blocks: BLOCKS, gaps: GAPS, safeBottom: true });
  // 마스코트 그룹은 크기 비율을 유지한 채 화면 가운데 기준으로 배치
  const heroX = (x: number) => width / 2 + f(x - FIGMA_WIDTH / 2);
  const heroY = (y: number) => f(y - HERO_TOP);

  const circle = (left: number, top: number, size: number, color: string) => (
    <View
      style={{
        position: 'absolute',
        left: heroX(left),
        top: heroY(top),
        width: f(size),
        height: f(size),
        borderRadius: f(size / 2),
        backgroundColor: color,
      }}
    />
  );

  return (
    <View style={[s.root, { paddingBottom: bottomInset, opacity: ready ? 1 : 0 }]} onLayout={onAreaLayout}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {spacer(TOP)}
      {/* ── 마스코트 + 배경 원 ── */}
      <View style={{ height: f(HERO_HEIGHT) }} onLayout={measure('hero')}>
        {circle(63, 180, 165, 'rgba(223,246,244,0.72)')}
        {circle(75, 203.25, 141, 'rgba(210,242,238,0.75)')}
        <Image
          source={MascotImage}
          style={{ position: 'absolute', left: heroX(62.25), top: heroY(194.25), width: f(170.25), height: f(157.5) }}
          resizeMode="cover"
        />
        {circle(198, 270.75, 48.75, 'rgba(207,242,237,0.4)')}
        {circle(62.25, 192, 48.75, 'rgba(207,242,237,0.4)')}
      </View>

      {spacer(HERO_GAP)}
      <Text onLayout={measure('title')} style={{ textAlign: 'center', fontSize: f(22.5), lineHeight: f(22.5 * LH), fontWeight: '700', color: TEXT }}>
        가입이 완료됐어요! 🎉
      </Text>
      {spacer(TITLE_GAP)}
      <Text onLayout={measure('subtitle')} style={{ textAlign: 'center', fontSize: f(12.75), lineHeight: f(12.75 * LH), fontWeight: '600', color: TEXT_S }}>
        이제 Well-being과 함께{'\n'}건강한 작업 습관을 만들어봐요.
      </Text>

      {spacer(BUTTON_GAP)}
      <TouchableOpacity
        onLayout={measure('button')}
        style={[
          s.center,
          {
            alignSelf: 'center',
            width: fx(225),
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

      {spacer(PILL_GAP)}
      <View
        onLayout={measure('pill')}
        style={[
          s.row,
          s.center,
          {
            alignSelf: 'center',
            width: fx(216),
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
      {spacer(BOTTOM)}
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: SCREEN_BG },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default SignupCompleteScreen;

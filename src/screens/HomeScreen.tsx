import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { G, Path } from 'react-native-svg';
import EditIcon from '../icon/edit.svg';
import ChevronRightIcon from '../icon/chevron_right_small.svg';
import BellBoxIcon from '../icon/bell_box.svg';
import CardEnvIcon from '../icon/card_env.svg';
import CardCalendarIcon from '../icon/card_calendar.svg';
import CardSeatIcon from '../icon/card_seat.svg';
import SensorTempIcon from '../icon/sensor_temp.svg';
import SensorHumidityIcon from '../icon/sensor_humidity.svg';
import SensorDustIcon from '../icon/sensor_dust.svg';
import SproutIcon from '../icon/sprout.svg';
import TabBar from '../components/TabBar';
import { useFigmaScale, useFitLayout, Gap } from '../utils/figmaScale';
import ProfileImage from '../image/image.png';
import HomeBgImage from '../image/home_bg.png';
import MascotImage from '../image/home_mascot.png';
import SpeechBubbleImage from '../image/speech_bubble.png';
import PostureImage from '../image/posture_sitting_figma.png';
// TODO: API 임시 비활성화 — 복구 시 아래 두 줄과 useEffect의 fetchEnv 주석 참고
// import { unregisterFcmListeners } from '../utils/fcm';
// import { getLatestEnv } from '../api/env';

// Figma(Pretendard) 기본 줄 높이 — 안드로이드 기본 줄 높이가 더 커서 글자가 아래로 밀리는 것 방지
const LH = 1.2;

// ─── 색상 상수 (Figma 홈화면 - 메인) ─────────────────────────
const BG          = '#F7FAFA';
const TEAL        = '#18B8AE';
const TEAL_LIGHT  = '#DDF7F4';
const TEXT        = '#172033';
const TEXT_S      = '#7B8794';
const TEXT_TIME   = '#4E5761';
const BORDER      = '#EDF2F2';
const BORDER_SOFT = 'rgba(231,241,243,0.9)';
const GOOD        = '#20C997';
const WARN        = '#EF5350';
const WHITE       = '#FFFFFF';

// 본문 좌우 여백(dp) — Figma 카드 영역(x 9 ~ 285.75)을 이 여백 안쪽에 맞춰 배치
const SIDE_MARGIN = 18;
const CONTENT_LEFT = 9;
const CONTENT_WIDTH = 276.75;

// ─── 화면 맞춤 레이아웃 (Figma px 기준) ──────────────────────
// 헤더+히어로 영역: Figma y 42(인사말) ~ 243(마스코트 끝). 배경 사진도 이 영역 위치를 기준으로 배치
const HERO_TOP = 42;
const HERO_HEIGHT = 201;
const BLOCKS = ['hero', 'env', 'cards', 'banner'];
const TOP: Gap = { design: HERO_TOP, min: 0, max: 60, safeTop: true };
const ENV_GAP: Gap = { design: 4.5, min: 3, max: 12 };
const CARDS_GAP: Gap = { design: 10.5, min: 6, max: 21 };
const BANNER_GAP: Gap = { design: 12.75, min: 6, max: 21 };
const BOTTOM: Gap = { design: 7.5, min: 6, max: 12 };
const GAPS = [TOP, ENV_GAP, CARDS_GAP, BANNER_GAP, BOTTOM];

// 유저 이름 — TODO: API 임시 비활성화, 복구 시 프로필 API의 닉네임으로 교체
const USER_NICKNAME = '초코';

interface SensorData {
  label: string;
  key: 'temp' | 'humidity' | 'dust' | 'co2';
  rawValue: number;
  unit: string;
}

// Figma에서 이산화탄소 칸도 온도계 아이콘을 사용함 (디자인 그대로 반영)
const sensorIcons: Record<SensorData['key'], React.FC<any>> = {
  temp: SensorTempIcon,
  humidity: SensorHumidityIcon,
  dust: SensorDustIcon,
  co2: SensorTempIcon,
};

// 센서별 실제 수치 → 게이지 비율(0~1)
// 온도: 0~40°C, 습도: 0~100%, 미세먼지: 0~150 μg/m³, CO₂: 400~2000 ppm
const toGaugeRatio = (key: string, raw: number): number => {
  let ratio: number;
  switch (key) {
    case 'temp':     ratio = raw / 40;            break;
    case 'humidity': ratio = raw / 100;           break;
    case 'dust':     ratio = raw / 150;           break;
    case 'co2':      ratio = (raw - 400) / 1600; break;
    default:         ratio = raw / 100;
  }
  return Math.min(Math.max(ratio, 0), 1);
};

// 말풍선 메시지: "{subject} {highlight}" + 두 줄 안내
interface HeroMessage {
  subject: string;
  highlight: string;
  body: string;
}

const getHeroMessages = (sensors: SensorData[]): HeroMessage[] => {
  const get = (key: SensorData['key']) => sensors.find(s => s.key === key)?.rawValue;
  const temp = get('temp');
  const humidity = get('humidity');
  const co2 = get('co2');
  const dust = get('dust');

  const messages: HeroMessage[] = [];
  if (temp !== undefined) {
    if (temp > 30)      messages.push({ subject: '온도가', highlight: '높아요!', body: '냉방을 켜서 실내를\n시원하게 해주세요!' });
    else if (temp < 18) messages.push({ subject: '온도가', highlight: '낮아요!', body: '난방을 켜서 실내를\n따뜻하게 해주세요!' });
  }
  if (humidity !== undefined) {
    if (humidity > 70)      messages.push({ subject: '습도가', highlight: '높아요!', body: '창문을 열고 환기\n시켜주세요!!' });
    else if (humidity < 30) messages.push({ subject: '습도가', highlight: '낮아요!', body: '가습기를 틀어\n습도를 올려주세요!' });
  }
  if (co2 !== undefined && co2 > 1000) messages.push({ subject: 'CO₂가', highlight: '높아요!', body: '창문을 열고 환기\n시켜주세요!!' });
  if (dust !== undefined && dust > 80) messages.push({ subject: '미세먼지가', highlight: '나빠요!', body: '공기청정기를\n켜 주세요!' });

  return messages;
};

const NORMAL_MESSAGE: HeroMessage = { subject: '환경이', highlight: '쾌적해요!', body: '지금처럼 바른 자세를\n유지해 주세요!' };

// ─── 오늘의 기록 (자세 습관 도넛차트) ──────────────────────
// TODO: 자세 습관 통계 API가 아직 없어 임시(mock) 데이터입니다.
// Figma 도넛은 12시 방향부터 시계방향으로 고정 → 턱괴기 → 비대칭 → 졸음 순서
const RECORD_SEGMENTS = [
  { label: '고정',   count: 1, color: '#EF5350' },
  { label: '턱괴기', count: 4, color: '#F4923C' },
  { label: '비대칭', count: 2, color: '#F4B740' },
  { label: '졸음',   count: 3, color: TEAL },
];
// 범례는 Figma 배치(졸음·고정 / 턱괴기·비대칭) 순서
const LEGEND_ORDER = ['졸음', '고정', '턱괴기', '비대칭'];
const RECORD_TOTAL = RECORD_SEGMENTS.reduce((sum, seg) => sum + seg.count, 0);

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

// Figma Donut: 바깥 반지름 37.5, 안쪽 반지름 18.75, 조각 사이 흰색 1.5 테두리
const DonutChart: React.FC<{ size: number }> = ({ size }) => {
  const c = 38.25;
  const rOut = 37.5;
  const rIn = 18.75;
  let angle = 0;

  return (
    <Svg width={size} height={size} viewBox="0 0 76.5 76.5">
      <G>
        {RECORD_SEGMENTS.map(seg => {
          const sweep = (seg.count / RECORD_TOTAL) * 360;
          const start = angle;
          const end = angle + sweep;
          angle = end;
          const large = sweep > 180 ? 1 : 0;
          const o1 = polar(c, c, rOut, start);
          const o2 = polar(c, c, rOut, end);
          const i1 = polar(c, c, rIn, end);
          const i2 = polar(c, c, rIn, start);
          const d = [
            `M${o1.x} ${o1.y}`,
            `A${rOut} ${rOut} 0 ${large} 1 ${o2.x} ${o2.y}`,
            `L${i1.x} ${i1.y}`,
            `A${rIn} ${rIn} 0 ${large} 0 ${i2.x} ${i2.y}`,
            'Z',
          ].join(' ');
          return <Path key={seg.label} d={d} fill={seg.color} stroke={WHITE} strokeWidth={1.5} />;
        })}
      </G>
    </Svg>
  );
};

// ─── 메인 ──────────────────────────────────────────────────
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const F = useFigmaScale(); // 전체 폭 기준 (배경 사진, 사이드바)
  const { f, fx, kWidth, k, width, onAreaLayout, measure, spacer, ready } = useFitLayout({
    blocks: BLOCKS,
    gaps: GAPS,
    sideMargin: SIDE_MARGIN,
    contentWidth: CONTENT_WIDTH,
  });
  // Figma x → 화면 x: 왼쪽 기준 요소는 본문 왼쪽 끝, 오른쪽 기준 요소(말풍선·알림·상태)는 본문 오른쪽 끝에 붙여서
  // 화면이 넓거나 세로 때문에 크기가 줄어도 좌우 배치가 Figma처럼 유지되게 함
  const X = (v: number) => SIDE_MARGIN + fx(v - CONTENT_LEFT);
  const XR = (v: number) => width - SIDE_MARGIN - f(CONTENT_LEFT + CONTENT_WIDTH - v);
  // 배경은 가로로 화면을 꽉 채우고, 세로는 본문과 같은 비율로 줄어들며 히어로 영역 위치를 따라감
  const bgV = (v: number) => F(v) * (k / kWidth);
  const [heroY, setHeroY] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // TODO: API 임시 비활성화 — 목업 고정값 사용. 복구 시 아래처럼 useEffect에서 fetchEnv 재구성:
  // const data = await getLatestEnv(1); setSensors([...]);
  const [sensors] = useState<SensorData[]>([
    { label: '온도',       key: 'temp',     rawValue: 24,  unit: '°C'    },
    { label: '습도',       key: 'humidity', rawValue: 43,  unit: '%'     },
    { label: '미세먼지',   key: 'dust',     rawValue: 18,  unit: '㎍/㎥' },
    { label: '이산화탄소', key: 'co2',      rawValue: 742, unit: 'ppm'   },
  ]);

  const warnings = getHeroMessages(sensors);
  const isNormal = warnings.length === 0;
  const hero = isNormal ? NORMAL_MESSAGE : warnings[0];
  const statusColor = isNormal ? GOOD : WARN;
  const lastCheckedLabel = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

  // 히어로 영역 안 Figma 좌표 → absolute 스타일 (left는 화면 좌표, 세로는 히어로 영역 위쪽 기준)
  const heroAt = (left: number, top: number, w?: number, h?: number) => ({
    position: 'absolute' as const,
    left,
    top: f(top - HERO_TOP),
    ...(w !== undefined && { width: f(w) }),
    ...(h !== undefined && { height: f(h) }),
  });

  // 배경처럼 화면 전체 폭에 걸치는 요소용 (세로는 히어로 영역 위치 기준)
  const full = (top: number, h: number) => ({
    position: 'absolute' as const,
    left: 0,
    top: heroY + bgV(top - HERO_TOP),
    width: F(300),
    height: bgV(h),
  });

  const cardShadow = {
    shadowColor: '#526A73',
    shadowOffset: { width: f(3), height: f(3) },
    shadowOpacity: 0.07,
    shadowRadius: f(3),
    elevation: 2,
  };
  const softShadow = {
    shadowColor: '#54717A',
    shadowOffset: { width: 0, height: f(3) },
    shadowOpacity: 0.1,
    shadowRadius: f(7.5),
    elevation: 3,
  };
  // 카드 좌상단 아이콘 + 제목 (카드 기준 Figma 오프셋)
  const cardTitle = (Icon: React.FC<any>, title: string, left: number, titleLeft: number, top: number) => (
    <>
      <Icon width={f(13.5)} height={f(13.5)} style={{ position: 'absolute', left: f(left), top: f(top) }} />
      <Text style={[s.cardTitle, { position: 'absolute', left: f(titleLeft), top: f(top), fontSize: f(12), lineHeight: f(12 * LH) }]}>
        {title}
      </Text>
    </>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={[s.body, { opacity: ready ? 1 : 0 }]} onLayout={onAreaLayout}>
        {/* ── 배경 사진 (아래로 갈수록 배경색으로 페이드) ── */}
        <Image source={HomeBgImage} style={full(-44.25, 399.75)} resizeMode="cover" />
        <LinearGradient colors={['rgba(247,250,250,0)', BG]} style={full(-35.25, 381.75)} />
        <View style={[full(346.5, 20), { backgroundColor: BG }]} />

        {spacer(TOP)}

        {/* ── 헤더 + 히어로 (마스코트 · 말풍선 · 상태) ── */}
        <View
          style={{ height: f(HERO_HEIGHT) }}
          onLayout={e => {
            measure('hero')(e);
            setHeroY(e.nativeEvent.layout.y);
          }}
        >
          <Image source={MascotImage} style={heroAt(X(9), 96.75, 158.25, 146.25)} resizeMode="cover" />
          <Image source={SpeechBubbleImage} style={heroAt(XR(116.25), 65.25, 189.75, 130.5)} resizeMode="cover" />

          {/* 햄버거는 인사말 첫 줄과 같은 행에 두어 폰트 렌더링 차이와 무관하게 세로 중앙 정렬 */}
          <View style={[heroAt(X(0.75), 42), s.row]}>
            <TouchableOpacity
              style={[s.center, { width: f(30), height: f(21.75) }]}
              activeOpacity={0.7}
              hitSlop={8}
              onPress={() => setIsSidebarOpen(true)}
            >
              {[0, 1, 2].map(i => (
                <View
                  key={i}
                  style={{ width: f(13.5), height: f(1.5), backgroundColor: '#49454F', marginVertical: f(1.125) }}
                />
              ))}
            </TouchableOpacity>
            <Text style={{ marginLeft: f(1.5), fontSize: f(18), lineHeight: f(18 * LH), fontWeight: '700', color: TEXT }}>
              안녕하세요, <Text style={{ color: TEAL }}>{USER_NICKNAME}</Text>님! ✨
            </Text>
          </View>
          <Text style={[heroAt(X(0.75) + f(31.5), 66), { fontSize: f(12.75), lineHeight: f(12.75 * LH), fontWeight: '500', color: TEXT_S }]}>
            오늘도 건강한 하루 되세요.
          </Text>
          <TouchableOpacity
            style={heroAt(XR(255.75), 43.5)}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notifications')}
          >
            <BellBoxIcon width={f(36)} height={f(36)} />
          </TouchableOpacity>

          <Text style={[heroAt(XR(167.25), 103.5), { fontSize: f(15), lineHeight: f(15 * LH), fontWeight: '600', color: TEXT }]}>
            {hero.subject} <Text style={{ color: TEAL }}>{hero.highlight}</Text>
          </Text>
          <Text style={[heroAt(XR(167.25), 126), { fontSize: f(12), lineHeight: f(12 * LH), fontWeight: '500', color: TEXT_S }]}>
            {hero.body}
          </Text>

          <View
            style={[
              heroAt(XR(162.75), 180.75, 63, 28.5),
              s.row,
              softShadow,
              {
                backgroundColor: WHITE,
                borderWidth: f(0.75),
                borderColor: BORDER_SOFT,
                borderRadius: f(15),
                paddingLeft: f(6.75),
                gap: f(6.75),
              },
            ]}
          >
            <View style={{ width: f(13.5), height: f(13.5), borderRadius: f(6.75), backgroundColor: statusColor }} />
            <Text style={{ fontSize: f(14.25), lineHeight: f(14.25 * LH), fontWeight: '600', color: statusColor }}>
              {isNormal ? '정상' : '주의'}
            </Text>
          </View>
          <Text style={[heroAt(XR(165), 213.75), { fontSize: f(9), lineHeight: f(9 * LH), fontWeight: '500', color: TEXT_TIME }]}>
            최근 분석 {lastCheckedLabel}
          </Text>
        </View>

        {spacer(ENV_GAP)}

        {/* ── 작업 환경 카드 (센서 타일 4개가 카드 폭을 나눠 가짐) ── */}
        <View
          onLayout={measure('env')}
          style={[
            softShadow,
            {
              marginHorizontal: SIDE_MARGIN,
              height: f(122.25),
              backgroundColor: BG,
              borderWidth: f(0.75),
              borderColor: BORDER_SOFT,
              borderRadius: f(15),
            },
          ]}
        >
          {cardTitle(CardEnvIcon, '작업 환경', 12, 34.5, 9.75)}
          <View style={[s.row, { position: 'absolute', left: fx(7.5), right: fx(7.5), top: f(30.75), height: f(83.25), gap: fx(5.25) }]}>
            {sensors.map(item => {
              const Icon = sensorIcons[item.key];
              const ratio = toGaugeRatio(item.key, item.rawValue);
              return (
                <View
                  key={item.key}
                  style={[
                    cardShadow,
                    { flex: 1, height: '100%', backgroundColor: WHITE, borderWidth: f(0.75), borderColor: BORDER, borderRadius: f(12) },
                  ]}
                >
                  <View style={{ position: 'absolute', left: f(2.25), top: f(6), width: f(18), height: f(18), alignItems: 'center' }}>
                    <Icon width={item.key === 'temp' || item.key === 'co2' ? f(7.875) : f(18)} height={f(18)} />
                  </View>
                  <Text
                    style={{ position: 'absolute', left: f(4.5), top: f(28.5), fontSize: f(12), lineHeight: f(12 * LH), fontWeight: '600', color: TEXT }}
                    numberOfLines={1}
                  >
                    {item.rawValue}{item.unit}
                  </Text>
                  <Text style={{ position: 'absolute', left: f(4.5), top: f(45), fontSize: f(9), lineHeight: f(9 * LH), fontWeight: '500', color: TEXT_S }}>
                    {item.label}
                  </Text>
                  <View
                    style={{
                      position: 'absolute',
                      left: fx(6.75),
                      right: fx(9.75),
                      top: f(62.25),
                      height: f(11.25),
                      borderRadius: f(11.25),
                      backgroundColor: TEAL_LIGHT,
                      overflow: 'hidden',
                    }}
                  >
                    <View style={{ width: `${ratio * 100}%`, height: '100%', borderRadius: f(11.25), backgroundColor: TEAL }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {spacer(CARDS_GAP)}

        {/* ── 오늘의 기록 · 현재 자세 (Figma 폭 비율대로 나눠 가짐) ── */}
        <View onLayout={measure('cards')} style={[s.row, { marginHorizontal: SIDE_MARGIN, height: f(159.75), gap: fx(9.75) }]}>
          <View
            style={[
              cardShadow,
              { flex: 135.75, height: '100%', backgroundColor: '#FDFDFD', borderWidth: f(0.75), borderColor: BORDER, borderRadius: f(12) },
            ]}
          >
            {cardTitle(CardCalendarIcon, '오늘의 기록', 12, 34.5, 9)}
            <View style={{ position: 'absolute', left: 0, right: 0, top: f(32.25), alignItems: 'center' }}>
              <DonutChart size={f(76.5)} />
              <View style={[StyleSheet.absoluteFill, s.center, s.row]}>
                <Text style={{ fontSize: f(13.5), lineHeight: f(13.5 * LH), fontWeight: '500', color: TEXT }}>{RECORD_TOTAL}</Text>
                <Text style={{ fontSize: f(10.5), lineHeight: f(10.5 * LH), fontWeight: '500', color: TEXT, marginTop: f(2) }}>회</Text>
              </View>
            </View>
            {LEGEND_ORDER.map((label, idx) => {
              const seg = RECORD_SEGMENTS.find(sg => sg.label === label)!;
              // Figma: 왼쪽 열은 카드 왼쪽에서 13.5, 오른쪽 열은 카드 폭의 약 55% 지점
              const left = idx % 2 === 0 ? f(13.5) : '55%';
              const top = idx < 2 ? 123 : 139.5;
              return (
                <View key={label} style={[s.row, { position: 'absolute', left, top: f(top) }]}>
                  <View style={{ width: f(7.5), height: f(7.5), borderRadius: f(3.75), backgroundColor: seg.color, marginRight: f(4.5) }} />
                  <Text style={{ width: f(27), fontSize: f(9), lineHeight: f(9 * LH), fontWeight: '500', color: TEXT }}>{seg.label}</Text>
                  <Text style={{ fontSize: f(9), lineHeight: f(9 * LH), fontWeight: '500', color: TEXT }}>{seg.count}</Text>
                </View>
              );
            })}
          </View>

          <View
            style={[
              cardShadow,
              { flex: 131.25, height: '100%', backgroundColor: '#FDFDFD', borderWidth: f(0.75), borderColor: BORDER, borderRadius: f(12) },
            ]}
          >
            <View style={{ position: 'absolute', left: 0, right: 0, top: f(15.75), alignItems: 'center' }}>
              <Image source={PostureImage} style={{ width: f(105.75), height: f(105.75) }} resizeMode="cover" />
            </View>
            {cardTitle(CardSeatIcon, '현재 자세', 9, 29.25, 9)}
            <Text style={{ position: 'absolute', left: 0, right: 0, top: f(128.25), fontSize: f(9), lineHeight: f(9 * LH), fontWeight: '600', color: TEXT, textAlign: 'center' }}>
              앉은 자세가 안정적이에요.
            </Text>
            <Text style={{ position: 'absolute', left: 0, right: 0, top: f(141), fontSize: f(7.5), lineHeight: f(7.5 * LH), fontWeight: '500', color: TEXT_S, textAlign: 'center' }}>
              가끔씩 스트레칭으로 더 건강하게!
            </Text>
          </View>
        </View>

        {spacer(BANNER_GAP)}

        {/* ── 응원 배너 ── */}
        <View
          onLayout={measure('banner')}
          style={[
            s.row,
            {
              marginHorizontal: SIDE_MARGIN,
              height: f(24.75),
              backgroundColor: TEAL_LIGHT,
              borderRadius: f(7.5),
              paddingLeft: fx(9),
              paddingRight: fx(9),
            },
          ]}
        >
          <SproutIcon width={f(12)} height={f(12)} />
          <Text style={{ marginLeft: f(6.75), flex: 1, fontSize: f(8.25), lineHeight: f(8.25 * LH), fontWeight: '500', color: TEXT }}>
            “작은 습관이, 더 건강한 내일을 만들어요.”
          </Text>
          <Text style={{ fontSize: f(7.5), lineHeight: f(7.5 * LH), fontWeight: '500', color: TEXT_S }}>Well-being Together</Text>
        </View>

        {spacer(BOTTOM)}
      </View>

      <TabBar active="Home" />

      {/* ── 사이드바 (Figma 홈화면 - 햄버거: 왼쪽에서 열리는 패널) ── */}
      {isSidebarOpen && (
        <View style={s.sidebarOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsSidebarOpen(false)} />
          <View
            style={[
              s.sidebarPanel,
              { top: F(42.75), width: F(153.75), borderTopRightRadius: F(24), borderBottomRightRadius: F(24) },
            ]}
          >
            <Image
              source={ProfileImage}
              style={{ position: 'absolute', left: F(30), top: F(48), width: F(85.5), height: F(85.5), borderRadius: F(42.75) }}
            />
            <View style={[s.row, { position: 'absolute', left: F(59.25), top: F(144.75) }]}>
              <Text style={{ fontSize: F(15), lineHeight: F(15 * LH), fontWeight: '700', color: TEXT_TIME }}>{USER_NICKNAME}</Text>
              <EditIcon width={F(13.5)} height={F(13.5)} style={{ marginLeft: F(2.25) }} />
            </View>
            {[
              { label: '계정설정', top: 204 },
              { label: '알림설정', top: 249 },
              { label: '도움말', top: 293.25 },
            ].map(item => (
              <TouchableOpacity
                key={item.label}
                style={[s.row, { position: 'absolute', left: F(22.5), top: F(item.top), width: F(107.25), height: F(18) }]}
                activeOpacity={0.7}
              >
                <Text style={{ flex: 1, fontSize: F(12.75), lineHeight: F(12.75 * LH), fontWeight: '700', color: TEXT }}>{item.label}</Text>
                <ChevronRightIcon width={F(18)} height={F(18)} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                s.center,
                {
                  position: 'absolute',
                  left: F(18),
                  top: F(501),
                  width: F(117.75),
                  height: F(41.25),
                  borderRadius: F(12),
                  borderWidth: F(0.75),
                  borderColor: BORDER,
                  backgroundColor: TEAL,
                  shadowColor: '#526A73',
                  shadowOffset: { width: F(3), height: F(3) },
                  shadowOpacity: 0.07,
                  shadowRadius: F(3),
                  elevation: 2,
                },
              ]}
              activeOpacity={0.85}
              onPress={() => {}}
            >
              <Text style={{ fontSize: F(13.5), lineHeight: F(13.5 * LH), fontWeight: '800', color: WHITE }}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// ─── 스타일 ────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  body: { flex: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontWeight: '500', color: TEXT },

  // 사이드바
  sidebarOverlay: { ...StyleSheet.absoluteFill, zIndex: 20 },
  sidebarPanel: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(247, 255, 254, 0.985)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 4, height: 0 },
    elevation: 8,
  },
});

export default HomeScreen;

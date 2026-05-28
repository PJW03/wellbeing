import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import ReportIcon from '../icon/report.svg';
import HomeIcon from '../icon/home.svg';

// ─── 색상 상수 ─────────────────────────────────────────────
const TEAL       = '#4ECBA0';
const TEAL_LIGHT = '#C8EDE5';
const BG         = '#E8F5F2';
const WHITE      = '#FFFFFF';
const GRAY       = '#A8B8B4';
const TEXT       = '#2C3E50';
const TEXT_S     = '#7F8C8D';
const VALUE      = '#1B9B92';
const GAUGE_BG   = '#E8E8E8';
const GAUGE_GOOD = '#58C77A';
const GAUGE_MID  = '#4FA3D9';
const GAUGE_HIGH = '#E06A6A';

const STATUS_BAR_HEIGHT = (StatusBar.currentHeight as number) || 20;

// ─── 타입 ──────────────────────────────────────────────────
interface SensorData {
  label: string;
  key: string;
  value: number;
  display: string;
}

// ─── 게이지 바 ─────────────────────────────────────────────
const getGaugeColor = (value: number) => {
  if (value <= 40) return GAUGE_GOOD;
  if (value <= 70) return GAUGE_MID;
  return GAUGE_HIGH;
};

const GaugeBar: React.FC<{ value: number }> = ({ value }) => (
  <View style={gs.track}>
    <View
      style={[
        gs.fill,
        { width: `${value}%` as any, backgroundColor: getGaugeColor(value) },
      ]}
    />
  </View>
);

const gs = StyleSheet.create({
  track: {
    width: '100%',
    height: 16,
    borderRadius: 8,
    backgroundColor: GAUGE_BG,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
  },
});

// ─── 메인 ──────────────────────────────────────────────────
const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'home'>('home');

  const sensors: SensorData[] = [
    { label: '온도', key: 'temp',     value: 72, display: '24°C'    },
    { label: '습도', key: 'humidity', value: 40, display: '40%'     },
    { label: '미세', key: 'dust',     value: 55, display: '좋음: 35' },
    { label: 'CO₂', key: 'co2',      value: 44, display: '좋음: 35' },
    { label: 'Item', key: 'item',     value: 50, display: '좋음: 35' },
  ];

  const alerts = [
    '실내 온도가 낮으니 난방을 켜 주세요!',
    '습도가 높으니 환기를 해보세요!',
  ];

  return (
    <SafeAreaView style={s.safeArea}>
      <Svg pointerEvents="none" style={s.radialBackground}>
        <Defs>
          <RadialGradient id="homeBgGradient" cx="10%" cy="10%" rx="90%" ry="90%">
            <Stop offset="0%" stopColor="#00C5B9" stopOpacity="0.18" />
            <Stop offset="45%" stopColor="#66D9CE" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#homeBgGradient)" />
      </Svg>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* ── 헤더 ── */}
      <View style={s.header}>
        <TouchableOpacity activeOpacity={0.7}>
          <View style={s.menuLine} />
          <View style={s.menuLine} />
          <View style={s.menuLine} />
        </TouchableOpacity>
        <TouchableOpacity style={s.settingBtn} activeOpacity={0.8}>
          <Text style={s.settingIcon}>⚙︎</Text>
        </TouchableOpacity>
      </View>

      

      <ScrollView contentContainerStyle={s.content}>
        {/* 캐릭터 박스 (외곽선) */}
        <View style={s.charGroup}>
          <View style={s.charBox}>
            <Text style={s.charText}>{'( ¯ ﹃ ¯ )zzz'}</Text>
          </View>
          <Text style={s.charSubCenter}>졸려요...</Text>
        </View>

        {/* 센서/통계 영역: 좌우 정렬 */}
        <View style={s.rowWrap}>
          <View style={[s.card, s.leftSensorCard]}>
            {sensors.map((item, idx) => (
              <View key={item.key} style={[s.sensorRow, idx < sensors.length - 1 && s.sensorDivider]}> 
                <Text style={s.sensorLabel}>{item.label}</Text>
                <View style={s.gaugeWrapper}>
                  <GaugeBar value={item.value} />
                </View>
              </View>
            ))}
          </View>

          <View style={[s.card, s.rightStatCard]}>
            {sensors.map((it) => (
              <View key={it.key} style={s.statRow}>
                <Text style={s.statText} numberOfLines={1}>{it.display}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 알림 박스 (테두리) */}
        <View style={s.alertOuter}>
          {alerts.map((msg, i) => (
            <Text key={i} style={s.alertText}>{msg}</Text>
          ))}
        </View>
      </ScrollView>

      {/* ── 하단 탭바 ── */}
      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tabItem, activeTab === 'report' && s.tabItemActive]}
          onPress={() => setActiveTab('report')}
          activeOpacity={0.8}
        >
          <ReportIcon width={26} height={26} />
          {activeTab === 'report' && <Text style={s.tabLabel}>Report</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.tabItem, activeTab === 'home' && s.tabItemActive]}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.8}
        >
          <HomeIcon width={22} height={22} />
          {activeTab === 'home' && <Text style={s.tabLabel}>Home</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── 스타일 ────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: STATUS_BAR_HEIGHT + 6,
    paddingBottom: 16,
  },
  menuLine: {
    width: 22,
    height: 2,
    borderRadius: 2,
    backgroundColor: TEXT,
    marginBottom: 5,
  },
  settingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  settingIcon: {
    fontSize: 22,
    color: WHITE,
  },

  // 바디: 3카드가 균등하게 공간 차지
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 30,
  },

  // 카드 공통 — 테두리 없음, 그림자만
  card: {
    backgroundColor: WHITE,
    borderRadius: 22,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },

  // 캐릭터 카드
  charCard: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charText: {
    fontSize: 32,
    color: TEXT,
    fontWeight: '300',
    letterSpacing: 3,
    marginBottom: 8,
  },
  charSub: {
    fontSize: 14,
    color: TEXT_S,
  },

  // 센서 카드
  sensorCard: {
    flex: 4,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sensorRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  sensorDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF5F3',
  },
  sensorLabel: {
    width: 38,
    fontSize: 12,
    color: TEXT_S,
    fontWeight: '600',
  },
  gaugeWrapper: {
    flex: 1,
    marginHorizontal: 12,
  },

  // 알림 카드
  alertCard: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 6,
  },
  

  // 탭바
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 32,
    paddingBottom: 16,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: '#E0EEEB',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 24,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: 'rgba(83, 157, 243, 0.37)',
  },
  tabLabel: {
    fontSize: 14,
    color: '#539DF3',
    fontWeight: '700',
  },
  content: {
    paddingTop: 12,
    paddingBottom: 36,
    rowGap: 26,
  },
  radialBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  charBox: {
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: TEAL_LIGHT,
    borderRadius: 14,
    paddingVertical: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  charGroup: {
    gap: 8,
  },
  charSubCenter: {
    textAlign: 'center',
    color: TEXT_S,
    fontSize: 14,
    marginTop: 10,
    marginBottom: 6,
  },
  rowWrap: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'stretch',
    marginTop: 8,
  },
  leftSensorCard: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rightStatCard: {
    width: 96,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 0,
  },
  statText: {
    fontSize: 14,
    color: VALUE,
    fontWeight: '800',
    letterSpacing: 0.2,
    height: 18,
    lineHeight: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  statSub: {
    fontSize: 14,
    color: TEXT_S,
    marginTop: 6,
  },
  statDivider: {
    width: '70%',
    height: 1,
    backgroundColor: '#EEF5F3',
    marginVertical: 10,
  },
  statItem: {
    fontSize: 12,
    color: TEXT,
    marginTop: 2,
  },
  statRow: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 0,
  },
  alertOuter: {
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: TEAL_LIGHT,
    borderRadius: 14,
    padding: 22,
    backgroundColor: WHITE,
    marginTop: 18,
    marginBottom: 26,
  },
  alertText: {
    fontSize: 16,
    color: TEXT,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 0.6,
  },
});

export default HomeScreen;
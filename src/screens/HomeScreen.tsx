import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { unregisterFcmListeners } from '../utils/fcm';
import ReportIcon from '../icon/report.svg';
import HomeIcon from '../icon/home.svg';
import EditIcon from '../icon/edit.svg';
import NoticeIcon from '../icon/noticeicon.svg';
import ArrowIcon from '../icon/rightarrow.svg';
import ExitIcon from '../icon/exit.svg';
import ProfileImage from '../image/image.png';
import { getLatestEnv } from '../api/env';

// ─── 색상 상수 ─────────────────────────────────────────────
const TEAL       = '#4ECBA0';
const TEAL_LIGHT = '#C8EDE5';
const WHITE      = '#FFFFFF';
const TEXT       = '#2C3E50';
const TEXT_S     = '#7F8C8D';
const VALUE      = '#1B9B92';
const GAUGE_BG   = '#E8E8E8';
const GAUGE_GOOD = '#58C77A';
const GAUGE_MID  = '#4FA3D9';
const GAUGE_HIGH = '#E06A6A';

const STATUS_BAR_HEIGHT = (StatusBar.currentHeight as number) || 20;

// ─── 상태 이미지 매핑 ──────────────────────────────────────
const statusImages: Record<string, ImageSourcePropType> = {
  normal:       require('../image/normal.png'),
  temp_high:    require('../image/temp_high.png'),
  temp_low:     require('../image/temp_low.png'),
  humid_high:   require('../image/humid_high.png'),
  humid_low:    require('../image/humid_low.png'),
  co2_high:     require('../image/co2_high.png'),
  dust_bad:     require('../image/dust_bad.png'),
  posture_bad:  require('../image/posture_bad.png'),
  posture_warn: require('../image/posture_warn.png'),
  touch:        require('../image/touch.png'),
  voice:        require('../image/voice.png'),
};

interface SensorData {
  label: string;
  key: string;
  rawValue: number;
  unit: string;
}

// 센서별 실제 수치 → 게이지 % 변환
// 온도: 0~40°C, 습도: 0~100%, 미세먼지: 0~150 μg/m³, CO₂: 400~2000 ppm
const toGaugeValue = (key: string, raw: number): number => {
  let ratio: number;
  switch (key) {
    case 'temp':     ratio = raw / 40;              break;
    case 'humidity': ratio = raw / 100;             break;
    case 'dust':     ratio = raw / 150;             break;
    case 'co2':      ratio = (raw - 400) / 1600;   break;
    default:         ratio = raw / 100;
  }
  return Math.min(Math.max(ratio * 100, 0), 100);
};

const getGaugeColor = (pct: number) => {
  if (pct <= 40) return GAUGE_GOOD;
  if (pct <= 70) return GAUGE_MID;
  return GAUGE_HIGH;
};

const getAlerts = (sensors: SensorData[]): string[] => {
  const temp     = sensors.find(s => s.key === 'temp');
  const humidity = sensors.find(s => s.key === 'humidity');
  const co2      = sensors.find(s => s.key === 'co2');
  const dust     = sensors.find(s => s.key === 'dust');

  const messages: string[] = [];

  if (temp) {
    if (temp.rawValue > 30)      messages.push('실내 온도가 높으니 냉방을 켜 주세요!');
    else if (temp.rawValue < 18) messages.push('실내 온도가 낮으니 난방을 켜 주세요!');
  }
  if (humidity) {
    if (humidity.rawValue > 70)      messages.push('습도가 높으니 제습기를 사용하세요!');
    else if (humidity.rawValue < 30) messages.push('습도가 낮으니 가습기를 사용하세요!');
  }
  if (co2 && co2.rawValue > 1000)  messages.push('CO₂ 농도가 높으니 환기를 해보세요!');
  if (dust && dust.rawValue > 80)  messages.push('미세먼지가 나쁘니 공기청정기를 켜 주세요!');

  if (messages.length === 0) messages.push('실내 환경이 쾌적합니다 😊');

  return messages;
};

const getStatusImage = (sensors: SensorData[]): ImageSourcePropType => {
  const temp     = sensors.find(s => s.key === 'temp');
  const humidity = sensors.find(s => s.key === 'humidity');
  const co2      = sensors.find(s => s.key === 'co2');
  const dust     = sensors.find(s => s.key === 'dust');

  if (temp     && temp.rawValue     > 30)   return statusImages.temp_high;
  if (temp     && temp.rawValue     < 18)   return statusImages.temp_low;
  if (co2      && co2.rawValue      > 1000) return statusImages.co2_high;
  if (dust     && dust.rawValue     > 80)   return statusImages.dust_bad;
  if (humidity && humidity.rawValue > 70)   return statusImages.humid_high;
  if (humidity && humidity.rawValue < 30)   return statusImages.humid_low;
  return statusImages.normal;
};

// ─── 작은 게이지 바 ────────────────────────────────────────
const MiniGaugeBar: React.FC<{ value: number }> = ({ value }) => (
  <View style={gs.track}>
    <View style={[gs.fill, { width: `${value}%` as any, backgroundColor: getGaugeColor(value) }]} />
  </View>
);

const gs = StyleSheet.create({
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: GAUGE_BG,
    overflow: 'hidden',
    marginTop: 4,
  },
  fill: { height: '100%', borderRadius: 3 },
});

// ─── 메인 ──────────────────────────────────────────────────
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab]         = useState<'report' | 'home'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sensors, setSensors] = useState<SensorData[]>([
    { label: '온도', key: 'temp',     rawValue: 0, unit: '°C'  },
    { label: '습도', key: 'humidity', rawValue: 0, unit: '%'   },
    { label: '미세', key: 'dust',     rawValue: 0, unit: 'μg'  },
    { label: 'CO₂', key: 'co2',      rawValue: 0, unit: 'ppm' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    const fetchEnv = async () => {
      try {
        setError(null);
        const data = await getLatestEnv(1);
        setSensors([
          { label: '온도', key: 'temp',     rawValue: data.temp,  unit: '°C'  },
          { label: '습도', key: 'humidity', rawValue: data.humid, unit: '%'   },
          { label: '미세', key: 'dust',     rawValue: data.dust,  unit: 'μg'  },
          { label: 'CO₂', key: 'co2',      rawValue: data.co2,   unit: 'ppm' },
        ]);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnv();
    const interval = setInterval(fetchEnv, 10000);
    return () => clearInterval(interval);
  }, []);

  const alerts = getAlerts(sensors);

  const statusImage = getStatusImage(sensors);

  return (
    <SafeAreaView style={s.safeArea}>
      <Svg pointerEvents="none" style={s.radialBackground}>
        <Defs>
          <RadialGradient id="homeBgGradient" cx="10%" cy="10%" rx="90%" ry="90%">
            <Stop offset="0%"   stopColor="#00C5B9" stopOpacity="0.18" />
            <Stop offset="45%"  stopColor="#66D9CE" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1"    />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#homeBgGradient)" />
      </Svg>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── 헤더 ── */}
      <View style={s.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => setIsSidebarOpen(true)}>
          <View style={s.menuLine} />
          <View style={s.menuLine} />
          <View style={s.menuLine} />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.settingBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Notifications')}
        >
          <NoticeIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* ── 사이드바 ── */}
      {isSidebarOpen && (
        <View style={s.sidebarOverlay}>
          <TouchableOpacity style={s.sidebarBackdrop} activeOpacity={1} onPress={() => setIsSidebarOpen(false)} />
          <View style={s.sidebarPanel}>
            <View style={s.sidebarProfile}>
              <View style={s.avatarRing}>
                <Image source={ProfileImage} style={s.avatarImage} />
              </View>
              <View style={s.profileNameRow}>
                <Text style={s.profileName}>초코</Text>
                <EditIcon width={16} height={16} style={s.profileEditIcon} />
              </View>
            </View>
            <View style={s.sidebarMenu}>
              <TouchableOpacity style={s.sidebarMenuItem} activeOpacity={0.8}>
                <Text style={s.sidebarMenuText}>계정 설정</Text>
                <ArrowIcon width={14} height={14} color={TEXT_S} />
              </TouchableOpacity>
              <TouchableOpacity style={s.sidebarMenuItem} activeOpacity={0.8}>
                <Text style={s.sidebarMenuText}>알림 설정</Text>
                <ArrowIcon width={14} height={14} color={TEXT_S} />
              </TouchableOpacity>
              <TouchableOpacity style={s.sidebarMenuItem} activeOpacity={0.8}>
                <Text style={s.sidebarMenuText}>도움말</Text>
                <ArrowIcon width={14} height={14} color={TEXT_S} />
              </TouchableOpacity>
            </View>
            <View style={s.sidebarFooter}>
              <TouchableOpacity style={s.logoutButton} activeOpacity={0.85} onPress={() => { unregisterFcmListeners(); }}>
                <ExitIcon width={16} height={16} color="#F0808B" />
                <Text style={s.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={s.content}>
        {/* ── 상단: 센서 수치 (작게) ── */}
        <View style={s.statsCard}>
          {error ? (
            <Text style={s.errorText}>{error}</Text>
          ) : (
            <View style={s.statsRow}>
              {sensors.map((item, idx) => (
                <View key={item.key} style={[s.statItem, idx < sensors.length - 1 && s.statItemBorder]}>
                  <Text style={s.statLabel}>{item.label}</Text>
                  <Text style={s.statValue}>
                    {isLoading ? '-' : `${item.rawValue}${item.unit}`}
                  </Text>
                  <MiniGaugeBar value={isLoading ? 0 : toGaugeValue(item.key, item.rawValue)} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── 가운데: 상태 이미지 (크게) ── */}
        <View style={s.imageCard}>
          <Image source={statusImage} style={s.statusImage} resizeMode="contain" />
        </View>

        {/* ── 하단: 알림 박스 ── */}
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
  safeArea: { flex: 1, backgroundColor: WHITE },

  radialBackground: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: STATUS_BAR_HEIGHT + 6,
    paddingBottom: 12,
  },
  menuLine: {
    width: 22,
    height: 2,
    borderRadius: 2,
    backgroundColor: TEXT,
    marginBottom: 5,
  },
  settingBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },

  // 스크롤 컨텐츠
  content: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 36,
    gap: 60,
  },

  // 상단 센서 수치 카드
  statsCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  statItemBorder: {
    borderRightWidth: 1,
    borderRightColor: '#EEF5F3',
  },
  statLabel: {
    fontSize: 10,
    color: TEXT_S,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    color: VALUE,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  errorText: {
    fontSize: 13,
    color: '#E06A6A',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // 가운데 이미지 카드
  imageCard: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: TEAL_LIGHT,
    backgroundColor: '#EFEFEF',
    overflow: 'hidden',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  statusImage: {
    width: '90%',
    height: '90%',
  },

  // 알림 박스
  alertOuter: {
    borderWidth: 2,
    borderColor: TEAL_LIGHT,
    borderRadius: 14,
    padding: 22,
    backgroundColor: WHITE,
  },
  alertText: {
    fontSize: 16,
    color: TEXT,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 0.6,
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
  tabItemActive: { backgroundColor: 'rgba(83, 157, 243, 0.37)' },
  tabLabel: { fontSize: 14, color: '#539DF3', fontWeight: '700' },

  // 사이드바
  sidebarOverlay: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row-reverse',
    zIndex: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  sidebarBackdrop: { flex: 1, backgroundColor: 'transparent' },
  sidebarPanel: {
    width: '60%',
    height: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingTop: STATUS_BAR_HEIGHT + 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderRadius: 24,
    marginTop: STATUS_BAR_HEIGHT + 60,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: -4, height: 0 },
    elevation: 8,
  },
  sidebarProfile: { alignItems: 'center', gap: 12 },
  sidebarMenu: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#E8E8E8' },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  sidebarMenuText: {
    fontSize: 15,
    color: TEXT,
    fontWeight: '600',
    textAlign: 'center',
    width: 96,
  },
  sidebarFooter: { marginTop: 'auto', alignItems: 'center' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: '#F0F1F1',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 160,
  },
  logoutText: { fontSize: 14, color: '#F0808B', fontWeight: '700' },
  avatarRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#EEF5F3',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 120, height: 120, borderRadius: 60 },
  profileNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileName: { fontSize: 18, color: TEXT, fontWeight: '700' },
  profileEditIcon: { marginTop: 2 },
});

export default HomeScreen;

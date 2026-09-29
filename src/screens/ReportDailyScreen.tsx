import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ChevronLeftIcon from '../icon/chevron_left_small.svg';
import BellBoxIcon from '../icon/bell_box.svg';
import SunIcon from '../icon/sun.svg';
import LeafIcon from '../icon/leaf.svg';
import UserLineIcon from '../icon/user_line.svg';
import SensorTempIcon from '../icon/sensor_temp.svg';
import SensorHumidityIcon from '../icon/sensor_humidity.svg';
import SensorDustIcon from '../icon/sensor_dust.svg';
import SensorCo2Icon from '../icon/sensor_co2.svg';
import TabBar from '../components/TabBar';
import { useFitLayout, Gap } from '../utils/figmaScale';
// TODO: API 임시 비활성화 — 복구 시 아래 줄과 env/notifications 관련 주석 참고
// import { getLatestEnv, EnvLatest } from '../api/env';
// import { getNotifications, Notification } from '../api/notification';

// Figma(Pretendard) 기본 줄 높이 — 안드로이드 기본 줄 높이가 더 커서 글자가 아래로 밀리는 것 방지
const LH = 1.2;

interface Notification {
  notiNo: number;
  message: string;
  detail: string;
  category: string;
  sentAt: string;
}

// ─── 색상 상수 (Figma 리포트-일별) ──────────────────────────
const BG          = '#F7FAFA';
const TEAL        = '#18B8AE';
const TEAL_LIGHT  = '#DDF7F4';
const TEAL_BADGE  = 'rgba(0,200,179,0.1)';
const TEXT        = '#172033';
const TEXT_S      = '#7B8794';
const GRAY        = '#8E8E93';
const BORDER_SOFT = 'rgba(231,241,243,0.9)';

// ─── 반응형 레이아웃 (Figma px 기준) ──────────────────────────
// 알림 개수에 따라 길이가 달라지는 화면이라 스크롤 유지 — 화면이 남으면 간격이 max까지 늘어나 채움
const TOP: Gap = { design: 39.75, min: 39.75, max: 52.5 };
const INTRO_GAP: Gap = { design: 20.25, min: 20.25, max: 36 };
const DAY_GAP: Gap = { design: 17.25, min: 17.25, max: 30 };
const METRIC_GAP: Gap = { design: 14.25, min: 14.25, max: 27 };
const ALERT_GAP: Gap = { design: 12, min: 12, max: 24 };
const BOTTOM: Gap = { design: 4, min: 4, max: 4 };
const GAPS = [TOP, INTRO_GAP, DAY_GAP, METRIC_GAP, ALERT_GAP, BOTTOM];

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

const formatTime = (sentAt: string) => {
  const d = new Date(sentAt);
  const isAm = d.getHours() < 12;
  const hour12 = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12;
  return `${isAm ? '오전' : '오후'} ${hour12}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// TODO: API 임시 비활성화 — 목업 센서/알림 데이터
const MOCK_ENV = { temp: 24, humid: 43, dust: 18, co2: 742 };
const MOCK_DAY_NOTIFICATIONS: Notification[] = [
  { notiNo: 1, message: '어깨 비대칭 주의!', detail: '스트레칭과 함께 바른 자세를 유지해요.', category: '자세', sentAt: '2026-01-01T10:12:00' },
  { notiNo: 2, message: '미세먼지 나쁨! 창문을 닫아주세요.', detail: '지금은 실내 공기 관리가 중요해요.', category: '미세먼지', sentAt: '2026-01-01T13:35:00' },
  { notiNo: 3, message: '습도가 높으니 환기를 해보세요!', detail: '쾌적한 실내 환경이 집중력을 높여줘요.', category: '습도', sentAt: '2026-01-01T15:20:00' },
  { notiNo: 4, message: 'Co2 농도 up! 환기를 시켜주세요.', detail: '지금 환기하면 더 맑은 공기를 마실 수 있어요.', category: 'CO2', sentAt: '2026-01-01T17:18:00' },
];

const ReportDailyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { f, fx, spacer } = useFitLayout({ blocks: [], gaps: GAPS, mode: 'scroll' });
  const dateISO: string | undefined = route.params?.dateISO;
  const date = useMemo(() => (dateISO ? new Date(dateISO) : new Date()), [dateISO]);

  // TODO: API 임시 비활성화 — 복구 시 getLatestEnv(1) / getNotifications(1)로 교체
  const env = MOCK_ENV;
  const dayNotifications = MOCK_DAY_NOTIFICATIONS;

  const metrics = [
    { key: 'TEMP',     label: '온도',       value: `${env.temp}°C`,    ratio: env.temp / 40,             Icon: SensorTempIcon,     iconW: 7.875, iconH: 18 },
    { key: 'HUMIDITY', label: '습도',       value: `${env.humid}%`,    ratio: env.humid / 100,           Icon: SensorHumidityIcon, iconW: 18,    iconH: 18 },
    { key: 'DUST',     label: '미세먼지',   value: `${env.dust}㎍/㎥`, ratio: env.dust / 150,            Icon: SensorDustIcon,     iconW: 18,    iconH: 18 },
    { key: 'CO2',      label: '이산화탄소', value: `${env.co2}ppm`,    ratio: (env.co2 - 400) / 1600,    Icon: SensorCo2Icon,      iconW: 20,    iconH: 20 },
  ];

  const dayComment = env.humid > 70
    ? '습한 하루였어요 💧'
    : env.temp > 28
    ? '더운 하루였어요 ☀️'
    : '쾌적한 하루였어요 🌿';

  const dateLabel = `${date.getMonth() + 1}월 ${date.getDate()}일`;

  const card = {
    backgroundColor: BG,
    borderWidth: f(0.75),
    borderColor: BORDER_SOFT,
    borderRadius: f(10),
    shadowColor: '#54717A',
    shadowOffset: { width: 0, height: f(3) },
    shadowOpacity: 0.1,
    shadowRadius: f(7.5),
    elevation: 3,
  };
  const badge = (size: number) => ({
    width: f(size),
    height: f(size),
    borderRadius: f(size / 2),
    backgroundColor: TEAL_BADGE,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: fx(9.13) }}
        showsVerticalScrollIndicator={false}
      >
        {spacer(TOP)}
        {/* ── 헤더 ── */}
        <View style={[s.row, { height: f(25.5) }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={{ marginLeft: fx(-3.88) }}>
            <ChevronLeftIcon width={f(25.5)} height={f(25.5)} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { fontSize: f(13.5), lineHeight: f(13.5 * LH) }]} pointerEvents="none">
            {dateLabel} 리포트
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Notifications')} style={{ position: 'absolute', right: fx(-3.88), top: f(3.75) }}>
            <BellBoxIcon width={f(36)} height={f(36)} />
          </TouchableOpacity>
        </View>

        {/* ── 인트로 ── */}
        {spacer(INTRO_GAP)}
        <View style={{ marginLeft: fx(6.62) }}>
          <Text style={{ fontSize: f(18), lineHeight: f(18 * LH), fontWeight: '700', color: '#000' }}>오늘도</Text>
          <Text style={{ fontSize: f(18), lineHeight: f(18 * LH), fontWeight: '700', color: TEAL }}>수고했어요!</Text>
          <Text style={{ marginTop: f(3.75), fontSize: f(10.5), lineHeight: f(10.5 * LH), fontWeight: '500', color: GRAY }}>
            작은 습관이 큰 변화를 만들어요.
          </Text>
        </View>

        {/* ── 이 날의 한마디 ── */}
        {spacer(DAY_GAP)}
        <View style={[card, s.row, { height: f(62.25), paddingLeft: fx(7.13) }]}>
          <View style={badge(42)}>
            <SunIcon width={f(28)} height={f(28)} />
          </View>
          <View style={{ marginLeft: f(10), marginTop: f(-4) }}>
            <Text style={{ fontSize: f(10.5), lineHeight: f(10.5 * LH), fontWeight: '500', color: TEXT }}>이 날의 한마디</Text>
            <Text style={{ marginTop: f(3), fontSize: f(14), lineHeight: f(14 * LH), fontWeight: '600', color: TEXT }}>{dayComment}</Text>
          </View>
          <LeafIcon width={f(34.17)} height={f(30.74)} style={{ position: 'absolute', right: fx(15.5), bottom: f(-1) }} />
        </View>

        {/* ── 주요 지표 ── */}
        {spacer(METRIC_GAP)}
        <View style={[s.sectionHeader, { marginBottom: f(4) }]}>
          <Text style={{ fontSize: f(11), lineHeight: f(11 * LH), fontWeight: '600', color: TEXT }}>주요 지표</Text>
          <Text style={{ fontSize: f(7.5), lineHeight: f(7.5 * LH), fontWeight: '500', color: TEXT_S }}>
            {dateLabel} ({WEEKDAY[date.getDay()]}) 기준
          </Text>
        </View>
        <View style={[card, { paddingTop: f(2), paddingBottom: f(1), paddingLeft: fx(8), paddingRight: fx(6) }]}>
          {metrics.map(m => (
            <View key={m.key} style={[s.row, { height: f(39) }]}>
              <View style={badge(27)}>
                <m.Icon width={f(m.iconW)} height={f(m.iconH)} />
              </View>
              <Text style={{ width: f(59), marginLeft: f(7), fontSize: f(10.5), lineHeight: f(10.5 * LH), fontWeight: '500', color: TEXT }}>{m.label}</Text>
              <View style={{ flex: 1, height: f(6.5), borderRadius: f(6.5), backgroundColor: TEAL_LIGHT, overflow: 'hidden' }}>
                <View
                  style={{
                    width: `${Math.min(Math.max(m.ratio, 0), 1) * 100}%`,
                    height: '100%',
                    borderRadius: f(6.5),
                    backgroundColor: TEAL,
                  }}
                />
              </View>
              <Text style={{ width: f(41.5), marginLeft: fx(12), fontSize: f(10.5), lineHeight: f(10.5 * LH), fontWeight: '600', color: TEXT }}>{m.value}</Text>
            </View>
          ))}
        </View>

        {/* ── 주요 알림 기록 ── */}
        {spacer(ALERT_GAP)}
        <View style={[s.sectionHeader, { marginBottom: f(4) }]}>
          <Text style={{ fontSize: f(11), lineHeight: f(11 * LH), fontWeight: '600', color: TEXT }}>주요 알림 기록</Text>
          <Text style={{ fontSize: f(7.5), lineHeight: f(7.5 * LH), fontWeight: '500', color: TEXT_S }}>총 {dayNotifications.length}회 {'>'}</Text>
        </View>
        {dayNotifications.length === 0 ? (
          <View style={[card, s.center, { height: f(34) }]}>
            <Text style={{ fontSize: f(9), lineHeight: f(9 * LH), color: TEXT_S }}>이 날은 알림이 없었어요.</Text>
          </View>
        ) : (
          dayNotifications.map(n => (
            <View key={n.notiNo} style={[card, s.row, { height: f(34), marginBottom: f(5) }]}>
              <Text style={{ width: f(49), paddingLeft: fx(7), fontSize: f(7.5), lineHeight: f(7.5 * LH), fontWeight: '500', color: TEXT_S }}>
                {formatTime(n.sentAt)}
              </Text>
              <View style={badge(27)}>
                <UserLineIcon width={f(18)} height={f(18)} />
              </View>
              <View style={{ flex: 1, marginLeft: fx(10) }}>
                <Text style={{ fontSize: f(9), lineHeight: f(9 * LH), fontWeight: '600', color: '#000' }} numberOfLines={1}>{n.message}</Text>
                <Text style={{ marginTop: f(2), fontSize: f(7.5), lineHeight: f(7.5 * LH), fontWeight: '600', color: GRAY }} numberOfLines={1}>{n.detail}</Text>
              </View>
            </View>
          ))
        )}
        {spacer(BOTTOM)}
      </ScrollView>

      <TabBar active="Report" />
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: '700',
    color: TEXT,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
});

export default ReportDailyScreen;

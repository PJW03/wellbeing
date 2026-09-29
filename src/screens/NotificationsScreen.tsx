import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ChevronLeftIcon from '../icon/chevron_left_small.svg';
import DropletIcon from '../icon/noti_droplet.svg';
import ThermometerIcon from '../icon/noti_thermometer.svg';
import FrownIcon from '../icon/noti_frown.svg';
import CloudIcon from '../icon/noti_cloud.svg';
import UserIcon from '../icon/noti_user.svg';
import { useFigmaScale } from '../utils/figmaScale';
// TODO: API 임시 비활성화 — 복구 시 아래 줄과 아래 mock 데이터 대신 fetchNotifications 사용
// import { getNotifications, markNotificationRead, Notification } from '../api/notification';

// Figma(Pretendard) 기본 줄 높이 — 안드로이드 기본 줄 높이가 더 커서 글자가 아래로 밀리는 것 방지
const LH = 1.2;

interface Notification {
  notiNo: number;
  sensorType: string;
  category: string;
  message: string;
  detail: string;
  isRead: boolean;
  sentAt: string;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 3600 * 1000).toISOString();

// TODO: API 임시 비활성화 — 목업 알림 데이터
const MOCK_NOTIFICATIONS: Notification[] = [
  { notiNo: 1, sensorType: 'HUMIDITY', category: '습도', message: '습도가 높으니 환기를 해보세요!', detail: '쾌적한 실내 환경이 집중력을 높여줘요.', isRead: false, sentAt: hoursAgo(2) },
  { notiNo: 2, sensorType: 'TEMP', category: '온도', message: '실내 온도가 낮으니 난방을 켜 주세요.', detail: '적정 실내 온도는 20~24℃예요.', isRead: false, sentAt: hoursAgo(4) },
  { notiNo: 3, sensorType: 'DUST', category: '미세먼지', message: '미세먼지 나쁨! 창문을 닫아주세요.', detail: '지금은 실내 공기 관리가 중요해요.', isRead: true, sentAt: daysAgo(2) },
  { notiNo: 4, sensorType: 'CO2', category: 'CO2', message: 'CO2 농도 up! 환기를 시켜주세요.', detail: '지금 환기하면 더 맑은 공기를 마실 수 있어요.', isRead: true, sentAt: daysAgo(3) },
  { notiNo: 5, sensorType: 'POSTURE', category: '자세', message: '어깨 비대칭 주의!', detail: '스트레칭과 함께 바른 자세를 유지해요.', isRead: true, sentAt: daysAgo(9) },
];

// ─── 색상 상수 (Figma 리포트-누적알림) ──────────────────────
const BG         = '#F7FAFA';
const TEAL       = '#18B8AE';
const TEAL_BADGE = 'rgba(0,200,179,0.1)';
const UNREAD     = '#00C8B3';
const TEXT       = '#172033';
const GRAY       = '#8E8E93';
const BORDER     = '#EDF2F2';
const WHITE      = '#FFFFFF';

// sensorType → 아이콘 매핑 (Figma: 습도-물방울, 온도-온도계, 미세먼지-찡그린 얼굴, CO2-구름, 자세-사람)
const iconMap: Record<string, React.FC<any>> = {
  HUMIDITY: DropletIcon,
  TEMP:     ThermometerIcon,
  DUST:     FrownIcon,
  CO2:      CloudIcon,
  POSTURE:  UserIcon,
};

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const formatFullDate = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY[d.getDay()]})`;
const formatShortDate = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const formatRange = (from: Date, to: Date) => `${formatFullDate(from)} ~  ${formatShortDate(to)} (${WEEKDAY[to.getDay()]})`;

const formatTime = (sentAt: string) => {
  const d = new Date(sentAt);
  const isAm = d.getHours() < 12;
  const hour12 = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12;
  return `${isAm ? '오전' : '오후'} ${hour12}:${d.getMinutes().toString().padStart(2, '0')}`;
};

interface Group {
  key: 'today' | 'thisWeek' | 'lastWeek' | 'older';
  title: string;
  dateLabel: string;
  items: Notification[];
}

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const f = useFigmaScale();
  // TODO: API 임시 비활성화 — 목업 데이터 사용. 복구 시 getNotifications(1)로 fetch, markNotificationRead로 읽음 처리
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const handleRead = (notiNo: number) => {
    setNotifications(prev =>
      prev.map(n => n.notiNo === notiNo ? { ...n, isRead: true } : n)
    );
  };

  // Figma 기준: 이번주 = 오늘을 뺀 최근 7일, 저번주 = 그 이전 7일
  const groups = useMemo<Group[]>(() => {
    const today = startOfDay(new Date());
    const thisWeekFrom = addDays(today, -7);
    const lastWeekFrom = addDays(today, -14);

    const todayItems: Notification[] = [];
    const thisWeekItems: Notification[] = [];
    const lastWeekItems: Notification[] = [];
    const olderItems: Notification[] = [];

    notifications
      .slice()
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .forEach(n => {
        const d = startOfDay(new Date(n.sentAt));
        if (isSameDay(d, today)) todayItems.push(n);
        else if (d >= thisWeekFrom) thisWeekItems.push(n);
        else if (d >= lastWeekFrom) lastWeekItems.push(n);
        else olderItems.push(n);
      });

    const result: Group[] = [
      { key: 'today', title: '오늘', dateLabel: formatFullDate(today), items: todayItems },
      { key: 'thisWeek', title: '이번주', dateLabel: formatRange(thisWeekFrom, addDays(today, -1)), items: thisWeekItems },
      { key: 'lastWeek', title: '저번주', dateLabel: formatRange(lastWeekFrom, addDays(today, -8)), items: lastWeekItems },
    ];
    // 2주보다 오래된 알림 — Figma에 없는 그룹이라 있을 때만 노출
    if (olderItems.length > 0) {
      result.push({ key: 'older', title: '이전', dateLabel: `~ ${formatFullDate(addDays(lastWeekFrom, -1))}`, items: olderItems });
    }
    return result;
  }, [notifications]);

  const cardStyle = [
    s.row,
    {
      height: f(43.5),
      marginBottom: f(6),
      paddingLeft: f(8.25),
      borderRadius: f(12),
      borderWidth: f(0.75),
      borderColor: BORDER,
      backgroundColor: WHITE,
      shadowColor: '#526A73',
      shadowOffset: { width: f(3), height: f(3) },
      shadowOpacity: 0.07,
      shadowRadius: f(3),
      elevation: 2,
    },
  ];
  const badge = [s.center, { width: f(27), height: f(27), borderRadius: f(13.5), backgroundColor: TEAL_BADGE }];

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={{ paddingLeft: f(12), paddingRight: f(12.75), paddingTop: f(45), paddingBottom: f(24) }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 헤더 ── */}
        <View style={[s.row, { height: f(25.5) }]}>
          <Text style={[s.headerTitle, { fontSize: f(18), lineHeight: f(18 * LH) }]}>누적 알림</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <ChevronLeftIcon width={f(25.5)} height={f(25.5)} />
          </TouchableOpacity>
        </View>

        {/* ── 인트로 ── */}
        <View style={{ marginTop: f(15), marginLeft: f(9.45) }}>
          <Text style={{ fontSize: f(18), lineHeight: f(18 * LH), fontWeight: '700', color: '#000' }}>지금도</Text>
          <Text style={{ fontSize: f(18), lineHeight: f(18 * LH), fontWeight: '700', color: TEAL }}>잘하고 있어요!</Text>
          <Text style={{ marginTop: f(3.75), fontSize: f(10.5), lineHeight: f(10.5 * LH), fontWeight: '500', color: GRAY }}>
            작은 알림들이 모여, 더 건강한 하루가 돼요.
          </Text>
        </View>

        {groups.map((group, gi) => (
          <View key={group.key} style={{ marginTop: gi === 0 ? f(10.5) : f(16.5) }}>
            <View style={[s.row, { justifyContent: 'space-between', paddingLeft: f(6), marginBottom: f(3) }]}>
              <Text style={{ fontSize: f(10.5), lineHeight: f(10.5 * LH), fontWeight: '600', color: '#000' }}>{group.title}</Text>
              <Text style={{ fontSize: f(7.5), lineHeight: f(7.5 * LH), fontWeight: '600', color: GRAY }}>{group.dateLabel}</Text>
            </View>

            {group.items.length === 0 ? (
              <View style={cardStyle}>
                <View style={badge}>
                  <UserIcon width={f(18)} height={f(18)} />
                </View>
                <Text style={{ marginLeft: f(8.25), fontSize: f(9), lineHeight: f(9 * LH), fontWeight: '600', color: GRAY }}>알림이 없어요.</Text>
              </View>
            ) : (
              group.items.map(item => {
                const Icon = iconMap[item.sensorType.toUpperCase()] ?? UserIcon;
                const timeLabel = group.key === 'today' ? formatTime(item.sentAt) : formatShortDate(new Date(item.sentAt));
                return (
                  <TouchableOpacity
                    key={item.notiNo}
                    style={cardStyle}
                    activeOpacity={0.75}
                    onPress={() => !item.isRead && handleRead(item.notiNo)}
                  >
                    <View style={badge}>
                      <Icon width={f(18)} height={f(18)} />
                    </View>
                    <View style={{ flex: 1, marginLeft: f(8.25) }}>
                      <Text style={{ fontSize: f(9.75), lineHeight: f(9.75 * LH), fontWeight: '600', color: '#000' }} numberOfLines={1}>
                        {item.message}
                      </Text>
                      <Text style={{ marginTop: f(3), fontSize: f(7.5), lineHeight: f(7.5 * LH), fontWeight: '600', color: GRAY }} numberOfLines={1}>
                        {item.detail}
                      </Text>
                    </View>
                    <Text style={{ width: f(46.5), fontSize: f(7.5), lineHeight: f(7.5 * LH), fontWeight: '500', color: GRAY }}>{timeLabel}</Text>
                    {!item.isRead && (
                      <View
                        style={{
                          position: 'absolute',
                          right: f(-4.5),
                          width: f(7.5),
                          height: f(7.5),
                          borderRadius: f(3.75),
                          backgroundColor: UNREAD,
                        }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        ))}
      </ScrollView>
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
});

export default NotificationsScreen;

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BellBoxIcon from '../icon/bell_box.svg';
import BellSmallIcon from '../icon/bell_small.svg';
import CardEnvIcon from '../icon/card_env.svg';
import StatBarChartIcon from '../icon/stat_bar_chart.svg';
import ArrowDownSmallIcon from '../icon/arrow_down_small.svg';
import StarSquareIcon from '../icon/star_square.svg';
import Rank1Icon from '../icon/rank_1.svg';
import Rank2Icon from '../icon/rank_2.svg';
import Rank3Icon from '../icon/rank_3.svg';
import SproutIcon from '../icon/sprout.svg';
import MascotWaveImage from '../image/report_mascot_wave.png';
import TabBar from '../components/TabBar';
import { useFitLayout, Gap } from '../utils/figmaScale';
// TODO: API 임시 비활성화 — 복구 시 아래 줄과 monthlyAlertCount 주석 참고
// import { getNotifications, Notification } from '../api/notification';

// Figma(Pretendard) 기본 줄 높이 — 안드로이드 기본 줄 높이가 더 커서 글자가 아래로 밀리는 것 방지
const LH = 1.2;

// ─── 색상 상수 (Figma 리포트-메인) ──────────────────────────
const BG          = '#F7FAFA';
const TEAL        = '#18B8AE';
const TEAL_LIGHT  = '#DDF7F4';
const MINT        = '#EDF9F7';
const TEXT        = '#172033';
const TEXT_S      = '#7B8794';
const BORDER      = '#EDF2F2';
const BORDER_SOFT = 'rgba(231,241,243,0.9)';
const IOS_BLUE    = '#0088FF';
const IOS_LABEL_3 = 'rgba(60,60,67,0.3)';
const WHITE       = '#FFFFFF';

const WEEKDAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// TODO: 자세 통계 API가 아직 없어 임시(mock) 데이터입니다. 백엔드 연동 시 교체 필요.
const POSTURE_TOP3 = [
  { label: '장시간 고정', count: 12, Rank: Rank1Icon, color: '#EF5350' },
  { label: '턱 괴기',     count: 8,  Rank: Rank2Icon, color: '#F4923C' },
  { label: '어깨 비대칭', count: 6,  Rank: Rank3Icon, color: '#F4B740' },
];
const POSTURE_ALERT_COUNT = 10;
const POSTURE_ALERT_DELTA = '25%';
const MASCOT_MOOD = '졸려요...';
// TODO: API 임시 비활성화 — 목업 알림 수
const MOCK_MONTHLY_ALERT_COUNT = 20;
const ENV_ALERT_DELTA = '25%';

// ─── 화면 맞춤 레이아웃 (Figma px 기준) ──────────────────────
// 캘린더 날짜 영역은 Figma의 5주 높이로 고정 — 4·6주인 달은 행 높이만 조정해 전체 레이아웃이 달마다 흔들리지 않게 함
const CAL_ROWS_HEIGHT = 26.25 * 5;
const BLOCKS = ['header', 'calendar', 'mood', 'stats', 'top3', 'banner'];
// 섹션 간격: Figma 값 → 좁은 화면에서 줄어들 수 있는 최소값 / 넓은 화면에서 늘어날 수 있는 최대값
const TOP_PAD: Gap = { design: 43.5, min: 0, max: 52.5, safeTop: true };
const GAP: Gap = { design: 9, min: 5.25, max: 18 };
const BANNER_GAP: Gap = { design: 6, min: 4.5, max: 12 };
const BOTTOM_PAD: Gap = { design: 8.25, min: 8.25, max: 8.25 };
const GAPS = [TOP_PAD, GAP, GAP, GAP, GAP, BANNER_GAP, BOTTOM_PAD];

const ReportScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { f, fx, onAreaLayout, measure, spacer, ready } = useFitLayout({ blocks: BLOCKS, gaps: GAPS });
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // TODO: API 임시 비활성화 — 복구 시 getNotifications(1)로 fetch 후 viewDate 기준 월별 필터링
  const monthlyAlertCount = MOCK_MONTHLY_ALERT_COUNT;

  // 7칸씩 끊은 주 단위 배열
  const calendarWeeks = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) cells.push(null);
    for (let d = 1; d <= lastDate; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }, [viewDate]);

  const changeMonth = useCallback((delta: number) => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }, []);

  const handlePickDay = (day: number) => {
    const picked = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(picked);
    navigation.navigate('ReportDaily', { dateISO: picked.toISOString() });
  };

  const today = startOfDay(new Date());
  // 주 수에 따라 행 높이 조정 (5주 = Figma 그대로), 6주인 달은 날짜 원도 행에 맞게 살짝 작게
  const calRowHeight = CAL_ROWS_HEIGHT / calendarWeeks.length;
  const dayCircle = Math.min(24, calRowHeight - 1.5);

  const softCard = {
    backgroundColor: BG,
    borderWidth: f(0.75),
    borderColor: BORDER_SOFT,
    borderRadius: f(15),
    shadowColor: '#54717A',
    shadowOffset: { width: 0, height: f(3) },
    shadowOpacity: 0.1,
    shadowRadius: f(7.5),
    elevation: 3,
  };
  const smallShadow = {
    shadowColor: '#526A73',
    shadowOffset: { width: f(3), height: f(3) },
    shadowOpacity: 0.07,
    shadowRadius: f(3),
    elevation: 2,
  };
  const iconBadge = [
    s.center,
    smallShadow,
    { width: f(18.75), height: f(18.75), borderRadius: f(9.375), backgroundColor: MINT, borderWidth: f(0.75), borderColor: BORDER },
  ];

  const renderStatCard = (
    title: string,
    Icon: React.FC<any>,
    value: number,
    delta: string,
    caption: string,
  ) => (
    <View style={[softCard, { flex: 1, height: f(74.25) }]}>
      <View style={[s.row, { position: 'absolute', left: f(6.75), top: f(4.5) }]}>
        <View style={iconBadge}>
          <Icon width={f(13.5)} height={f(13.5)} />
        </View>
        <Text style={{ marginLeft: f(11.25), fontSize: f(9), lineHeight: f(9 * LH), fontWeight: '600', color: TEXT }}>{title}</Text>
      </View>
      <View style={[s.row, { position: 'absolute', left: f(16.5), top: f(31.5) }]}>
        <Text style={{ width: f(47.25), fontSize: f(16.5), lineHeight: f(16.5 * LH), fontWeight: '700', color: TEXT }}>{value}회</Text>
        <View style={[s.row, s.center, { width: f(33.75), height: f(16.5), borderRadius: f(7.5), backgroundColor: TEAL_LIGHT }]}>
          <ArrowDownSmallIcon width={f(10.5)} height={f(10.5)} />
          <Text style={{ fontSize: f(7.5), lineHeight: f(7.5 * LH), fontWeight: '700', color: TEAL }}>{delta}</Text>
        </View>
      </View>
      <Text style={{ position: 'absolute', left: f(16.5), top: f(57), fontSize: f(7.5), lineHeight: f(7.5 * LH), fontWeight: '500', color: TEXT_S }}>
        {caption}
      </Text>
    </View>
  );

  const maxTop3 = Math.max(...POSTURE_TOP3.map(p => p.count));

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={s.body} onLayout={onAreaLayout}>
                {/* 섹션 높이를 재기 전 첫 프레임(폭 기준 크기)은 숨겨서 크기가 튀는 것이 보이지 않게 함 */}
        <View style={{ flex: 1, paddingHorizontal: fx(9), opacity: ready ? 1 : 0 }}>
          {spacer(TOP_PAD)}
          {/* ── 헤더 ── */}
          <View style={[s.row, { height: f(36) }]} onLayout={measure('header')}>
            <Text style={{ flex: 1, alignSelf: 'flex-start', marginTop: f(3.75), marginLeft: f(2.25), fontSize: f(18), lineHeight: f(18 * LH), fontWeight: '700', color: TEXT }}>리포트</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Notifications')}>
              <BellBoxIcon width={f(36)} height={f(36)} style={{ marginRight: f(-3.75) }} />
            </TouchableOpacity>
          </View>

          {spacer(GAP)}

          {/* ── 월간 리포트 캘린더 ── */}
          <View style={[softCard, { paddingBottom: f(14.25) }]} onLayout={measure('calendar')}>
            <View style={[s.row, { height: f(34.5), paddingLeft: f(12), paddingRight: f(4.5) }]}>
              <CardEnvIcon width={f(13.5)} height={f(13.5)} />
              <Text style={{ flex: 1, marginLeft: f(9), fontSize: f(12), lineHeight: f(12 * LH), fontWeight: '600', color: TEXT }}>월간 리포트</Text>
              <Text style={{ fontSize: f(12.75), lineHeight: f(12.75 * LH), fontWeight: '600', color: '#000', letterSpacing: f(-0.32) }}>
                {MONTH_EN[viewDate.getMonth()]} {viewDate.getFullYear()}
              </Text>
              <Text style={{ marginLeft: f(3), fontSize: f(13), lineHeight: f(13 * LH), fontWeight: '600', color: IOS_BLUE }}>›</Text>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={{ paddingHorizontal: f(7.5) }} hitSlop={8}>
                <Text style={{ fontSize: f(19), lineHeight: f(19 * LH), fontWeight: '500', color: '#000' }}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeMonth(1)} style={{ paddingHorizontal: f(7.5) }} hitSlop={8}>
                <Text style={{ fontSize: f(19), lineHeight: f(19 * LH), fontWeight: '500', color: '#000' }}>›</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                marginHorizontal: fx(11.25),
                paddingHorizontal: f(3),
                paddingTop: f(6),
                paddingBottom: f(4.5),
                borderRadius: f(13.5),
                backgroundColor: WHITE,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: f(6) },
                shadowOpacity: 0.12,
                shadowRadius: f(15),
                elevation: 6,
              }}
            >
              <View style={s.row}>
                {WEEKDAY.map(w => (
                  <Text key={w} style={{ flex: 1, textAlign: 'center', fontSize: f(9.75), lineHeight: f(9.75 * LH), fontWeight: '600', color: IOS_LABEL_3 }}>
                    {w}
                  </Text>
                ))}
              </View>
              {calendarWeeks.map((week, wi) => (
                <View key={wi} style={[s.row, { height: f(calRowHeight) }]}>
                  {week.map((day, di) => {
                    if (day === null) return <View key={di} style={{ flex: 1 }} />;
                    const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                    const isToday = isSameDay(cellDate, today);
                    const isSelected = isSameDay(cellDate, selectedDate);
                    return (
                      <TouchableOpacity key={di} style={[s.center, { flex: 1 }]} activeOpacity={0.7} onPress={() => handlePickDay(day)}>
                        <View
                          style={[
                            s.center,
                            { width: f(dayCircle), height: f(dayCircle), borderRadius: f(dayCircle / 2) },
                            isToday && !isSelected && { backgroundColor: 'rgba(0,136,255,0.12)' },
                            isSelected && { backgroundColor: '#000' },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: f(13.5), lineHeight: f(13.5 * LH),
                              fontWeight: isSelected ? '700' : '400',
                              color: isSelected ? WHITE : isToday ? IOS_BLUE : '#000',
                            }}
                          >
                            {day}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {spacer(GAP)}

          {/* ── 이 달의 초코는.. ── */}
          <View style={[softCard, { height: f(74.25) }]} onLayout={measure('mood')}>
            <View
              style={[
                smallShadow,
                {
                  position: 'absolute',
                  left: fx(12),
                  top: f(6),
                  // 오른쪽 마스코트 이미지와 Figma처럼 9.75만큼 겹치도록 이미지 기준으로 폭 결정
                  right: fx(3) + f(101.25 - 9.75),
                  height: f(60),
                  borderRadius: f(13.5),
                  backgroundColor: MINT,
                  borderWidth: f(0.75),
                  borderColor: BORDER,
                },
              ]}
            >
              <Text style={{ position: 'absolute', left: f(8.25), top: f(6), fontSize: f(9), lineHeight: f(9 * LH), fontWeight: '600', color: TEXT }}>
                {viewDate.getMonth() + 1}월의 초코는..
              </Text>
              <Text style={{ position: 'absolute', left: 0, right: 0, top: f(25.5), textAlign: 'center', fontSize: f(13.5), lineHeight: f(13.5 * LH), fontWeight: '700', color: TEXT }}>
                <Text style={{ color: TEAL }}>“</Text>  {MASCOT_MOOD}  <Text style={{ color: TEAL }}>“</Text>
              </Text>
            </View>
            <Image
              source={MascotWaveImage}
              style={{ position: 'absolute', right: fx(3), top: f(7.5), width: f(101.25), height: f(67.5) }}
              resizeMode="cover"
            />
          </View>

          {spacer(GAP)}

          {/* ── 통계 카드 2개 ── */}
          <View style={[s.row, { gap: fx(9), paddingLeft: fx(2.25) }]} onLayout={measure('stats')}>
            {renderStatCard('환경 알림', BellSmallIcon, monthlyAlertCount, ENV_ALERT_DELTA, '지난달보다 줄었어요!')}
            {renderStatCard('자세 알림', StatBarChartIcon, POSTURE_ALERT_COUNT, POSTURE_ALERT_DELTA, '꾸준히 좋아지고 있어요!')}
          </View>

          {spacer(GAP)}

          {/* ── 주요 자세 행동 TOP 3 ── */}
          <View style={[softCard, { height: f(85.5) }]} onLayout={measure('top3')}>
            <StarSquareIcon width={f(18)} height={f(18)} style={{ position: 'absolute', left: f(9), top: f(6) }} />
            <Text style={{ position: 'absolute', left: f(32.25), top: f(8.25), fontSize: f(10.5), lineHeight: f(10.5 * LH), fontWeight: '600', color: TEXT }}>
              주요 자세 행동 TOP 3
            </Text>
            {POSTURE_TOP3.map((item, idx) => {
              const top = 29.25 + idx * 18.75;
              // Figma 기준: 1위 막대가 트랙의 약 70%를 채움
              const ratio = (item.count / maxTop3) * 0.7;
              return (
                <View key={item.label} style={[s.row, { position: 'absolute', left: fx(11.25), top: f(top), right: 0, height: f(12) }]}>
                  <item.Rank width={f(12)} height={f(12)} />
                  <Text style={{ width: f(51), marginLeft: f(9), fontSize: f(8.25), lineHeight: f(8.25 * LH), fontWeight: '600', color: TEXT }}>{item.label}</Text>
                  <View style={{ flex: 1, height: f(7.5), borderRadius: f(7.5), backgroundColor: 'rgba(123,135,148,0.3)', overflow: 'hidden' }}>
                    <View style={{ width: `${ratio * 100}%`, height: '100%', borderRadius: f(7.5), backgroundColor: item.color }} />
                  </View>
                  <Text style={{ width: f(27), marginLeft: f(16.5), fontSize: f(8.25), lineHeight: f(8.25 * LH), fontWeight: '600', color: TEXT }}>{item.count}회</Text>
                </View>
              );
            })}
          </View>

          {spacer(BANNER_GAP)}

          {/* ── 응원 배너 ── */}
          <View style={[s.row, { height: f(24.75), borderRadius: f(7.5), backgroundColor: TEAL_LIGHT, paddingLeft: f(9) }]} onLayout={measure('banner')}>
            <SproutIcon width={f(12)} height={f(12)} />
            <Text style={{ marginLeft: f(6.75), fontSize: f(8.25), lineHeight: f(8.25 * LH), fontWeight: '500', color: TEXT }}>
              “오늘도, 더 건강한 내일을 위해”
            </Text>
          </View>
          {spacer(BOTTOM_PAD)}
        </View>
      </View>

      <TabBar active="Report" />
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  body: { flex: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default ReportScreen;

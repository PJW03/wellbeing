import React, { useEffect, useRef, useState } from 'react';
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
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ChevronLeftIcon from '../icon/chevron_left_small.svg';
import BellIcon from '../icon/setting_bell.svg';
import ThermometerIcon from '../icon/setting_thermometer.svg';
import DropletIcon from '../icon/setting_droplet.svg';
import FrownIcon from '../icon/setting_frown.svg';
import CloudIcon from '../icon/setting_cloud.svg';
import MascotImage from '../image/report_mascot_wave.png';
import { useFitLayout, Gap } from '../utils/figmaScale';
import { getNotificationSettings, upsertNotificationSetting, SensorType } from '../api/settings';
import { useSession } from '../context/SessionContext';

// Figma(Pretendard) 기본 줄 높이 — 안드로이드 기본 줄 높이가 더 커서 글자가 아래로 밀리는 것 방지
const LH = 1.2;

// ─── 색상 상수 (Figma 설정-알림설정) ─────────────────────────
const BG          = '#F7FAFA';
const TEAL        = '#18B8AE';
const TEAL_LIGHT  = '#DDF7F4';
const TEAL_BADGE  = 'rgba(0,200,179,0.1)';
const TEXT        = '#172033';
const TEXT_S      = '#7B8794';
const GRAY        = '#8E8E93';
const DIVIDER     = '#E2E2E2';
const INPUT_BG    = '#F6F6F6';
const INPUT_LINE  = '#E8E8E8';
const INPUT_HINT  = '#BDBDBD';
const BUTTON      = '#5FCDC6';
const BORDER_SOFT = 'rgba(237,242,242,0.9)';

// ─── 화면 맞춤 레이아웃 (Figma px 기준, 프레임 높이 639) ─────
const BLOCKS = ['header', 'banner', 'list', 'button'];
const TOP: Gap = { design: 45, min: 0, max: 60, safeTop: true };
const BANNER_GAP: Gap = { design: 10.5, min: 8, max: 24 };
const LIST_GAP: Gap = { design: 28, min: 12, max: 40 };
const BUTTON_GAP: Gap = { design: 68.25, min: 16, max: 200 };
const BOTTOM: Gap = { design: 51.25, min: 12, max: 120 };
const GAPS = [TOP, BANNER_GAP, LIST_GAP, BUTTON_GAP, BOTTOM];

type ToggleKey = 'push' | 'posture';
type ThresholdKey = 'temp' | 'humidity' | 'dust' | 'co2';

const SENSOR_TYPES: Record<ThresholdKey, SensorType> = { temp: 'TEMP', humidity: 'HUMIDITY', dust: 'DUST', co2: 'CO2' };
const THRESHOLD_KEYS = Object.keys(SENSOR_TYPES) as ThresholdKey[];
// 저장된 설정이 없을 때의 기본값
const INITIAL_TOGGLES: Record<ToggleKey, boolean> = { push: true, posture: true };
const EMPTY_THRESHOLDS: Record<ThresholdKey, string> = { temp: '', humidity: '', dust: '', co2: '' };

type Row =
  | { kind: 'toggle'; key: ToggleKey; title: string; desc: string; Icon: React.FC<any> }
  | { kind: 'input'; key: ThresholdKey; title: string; desc: string; Icon: React.FC<any>; unit: string };

// Figma 순서: 푸시 → 온도 → 습도 → 미세먼지 → 이산화탄소 → 자세
// (Figma에서 자세 알림도 종 아이콘을 사용함 — 디자인 그대로 반영)
const ROWS: Row[] = [
  { kind: 'toggle', key: 'push', title: '푸시 알림 설정', desc: '중요한 알림을 알려드려요.', Icon: BellIcon },
  { kind: 'input', key: 'temp', title: '온도 알림 설정', desc: '설정한 온도 이상/이하일 때 알려드려요.', Icon: ThermometerIcon, unit: 'ºC' },
  { kind: 'input', key: 'humidity', title: '습도 알림 설정', desc: '설정한 습도 이상/이하일 때 알려드려요.', Icon: DropletIcon, unit: '%' },
  { kind: 'input', key: 'dust', title: '미세먼지 알림 설정', desc: '실내 공기 질이 나쁠 때 알려드려요.', Icon: FrownIcon, unit: 'PM' },
  { kind: 'input', key: 'co2', title: '이산화탄소 알림 설정', desc: 'CO₂ 농도가 높을 때 알려드려요.', Icon: CloudIcon, unit: 'CO₂' },
  { kind: 'toggle', key: 'posture', title: '자세 알림 설정', desc: '잘못된 자세가 감지되면 알려드려요.', Icon: BellIcon },
];

// Figma "on" 토글 (33 × 18, 흰 원이 오른쪽) — 꺼짐 상태는 Figma에 없어 회색 트랙 + 왼쪽 원으로 표현
const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; f: (v: number) => number }> = ({ value, onChange, f }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    hitSlop={8}
    onPress={() => onChange(!value)}
    style={{
      width: f(33),
      height: f(18),
      borderRadius: f(9),
      justifyContent: 'center',
      paddingHorizontal: f(1.5),
      alignItems: value ? 'flex-end' : 'flex-start',
      backgroundColor: value ? BUTTON : INPUT_LINE,
      shadowColor: '#000000',
      shadowOpacity: 0.1,
      shadowRadius: f(1.125),
      shadowOffset: { width: 0, height: 0 },
      elevation: 1,
    }}
  >
    <View style={{ width: f(15), height: f(15), borderRadius: f(7.5), backgroundColor: BG }} />
  </TouchableOpacity>
);

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { f, fx, areaHeight, bottomInset, onAreaLayout, measure, spacer, ready } = useFitLayout({ blocks: BLOCKS, gaps: GAPS, safeBottom: true });
  const { user } = useSession();
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>(INITIAL_TOGGLES);
  const [thresholds, setThresholds] = useState<Record<ThresholdKey, string>>(EMPTY_THRESHOLDS);
  // 서버에 저장된 값 — 저장 시 바뀐 항목만 보내기 위한 기준 (저장 성공한 항목은 갱신)
  const saved = useRef<{ toggles: Record<ToggleKey, boolean>; thresholds: Record<ThresholdKey, string> }>({
    toggles: INITIAL_TOGGLES,
    thresholds: EMPTY_THRESHOLDS,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getNotificationSettings(user.userNo)
      .then(list => {
        if (!active) return;
        const nextThresholds = { ...EMPTY_THRESHOLDS };
        const envAlarms: boolean[] = [];
        let posture = INITIAL_TOGGLES.posture;
        list.forEach(item => {
          if (item.sensorType === 'POSTURE') {
            posture = item.isAlarm;
            return;
          }
          const key = THRESHOLD_KEYS.find(k => SENSOR_TYPES[k] === item.sensorType);
          if (!key) return;
          nextThresholds[key] = String(item.setValue);
          envAlarms.push(item.isAlarm);
        });
        // 푸시 알림 = 환경 센서 4종의 알림 여부 — 저장된 센서 중 하나라도 켜져 있으면 켜짐으로 표시
        const nextToggles = { push: envAlarms.length ? envAlarms.some(Boolean) : INITIAL_TOGGLES.push, posture };
        saved.current = { toggles: nextToggles, thresholds: nextThresholds };
        setToggles(nextToggles);
        setThresholds(nextThresholds);
      })
      .catch(e => active && Alert.alert('알림설정', e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user.userNo]);

  // 센서별로 upsert — 바뀐 항목만 보냄 (푸시 토글이 바뀌면 값이 있는 환경 센서 전체에 반영)
  const handleSave = async () => {
    if (saving || loading) return;
    const entered = THRESHOLD_KEYS.filter(k => thresholds[k].trim() !== '');
    if (entered.some(k => Number.isNaN(Number(thresholds[k])))) {
      Alert.alert('알림설정', '임계값은 숫자로 입력해주세요.');
      return;
    }
    const base = saved.current;
    const pushChanged = toggles.push !== base.toggles.push;
    // 푸시 on/off는 센서별 행에 저장되므로, 임계값이 없는 센서에는 반영할 수 없음
    if (pushChanged && entered.length < THRESHOLD_KEYS.length) {
      Alert.alert('알림설정', '푸시 알림 설정을 바꾸려면 온도·습도·미세먼지·이산화탄소 임계값을 모두 입력해주세요.');
      return;
    }
    const changed = entered.filter(k => pushChanged || Number(thresholds[k]) !== Number(base.thresholds[k] || NaN));
    const postureChanged = toggles.posture !== base.toggles.posture;
    if (changed.length === 0 && !postureChanged) {
      navigation.goBack();
      return;
    }

    const jobs: { label: string; run: () => Promise<void>; onSuccess: () => void }[] = changed.map(k => ({
      label: ROWS.find(r => r.key === k)!.title.replace(' 알림 설정', ''),
      run: () => upsertNotificationSetting({ userNo: user.userNo, sensorType: SENSOR_TYPES[k], setValue: Number(thresholds[k]), isAlarm: toggles.push }),
      onSuccess: () => {
        saved.current.thresholds = { ...saved.current.thresholds, [k]: thresholds[k] };
      },
    }));
    if (postureChanged) {
      // 자세 알림은 임계값 개념이 없어 setValue 0으로 저장
      jobs.push({
        label: '자세',
        run: () => upsertNotificationSetting({ userNo: user.userNo, sensorType: 'POSTURE', setValue: 0, isAlarm: toggles.posture }),
        onSuccess: () => {
          saved.current.toggles = { ...saved.current.toggles, posture: toggles.posture };
        },
      });
    }

    setSaving(true);
    try {
      // 일부만 실패해도 성공한 항목은 기준값에 반영 — 다시 저장하면 실패한 항목만 재전송됨
      const results = await Promise.allSettled(jobs.map(j => j.run()));
      const failed: string[] = [];
      results.forEach((r, i) => (r.status === 'fulfilled' ? jobs[i].onSuccess() : failed.push(jobs[i].label)));
      if (failed.length === 0) {
        navigation.goBack();
        return;
      }
      // 푸시 토글 기준값은 그대로 두어, 다시 저장하면 푸시 설정이 전체 센서에 다시 반영되게 함
      const reason = (results.find(r => r.status === 'rejected') as PromiseRejectedResult).reason;
      Alert.alert('알림설정', `${failed.join('·')} 알림 설정을 저장하지 못했어요.\n${reason?.message ?? ''}`.trim());
    } finally {
      setSaving(false);
    }
  };

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
          {/* ── 헤더 ── */}
          <View onLayout={measure('header')} style={[s.center, { height: f(25.5) }]}>
            <Text style={{ fontSize: f(18), lineHeight: f(18 * LH), fontWeight: '700', color: TEXT }}>알림설정</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={{ position: 'absolute', left: fx(12), top: 0 }}>
              <ChevronLeftIcon width={f(25.5)} height={f(25.5)} />
            </TouchableOpacity>
          </View>

          {spacer(BANNER_GAP)}
          {/* ── 안내 배너 ── */}
          <View
            onLayout={measure('banner')}
            style={{
              marginLeft: fx(9),
              marginRight: fx(8.75),
              height: f(96),
              backgroundColor: TEAL_LIGHT,
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
            <Image
              source={MascotImage}
              style={{ position: 'absolute', right: f(4.25), top: f(13.25), width: f(120), height: f(80) }}
              resizeMode="cover"
            />
            <View style={{ position: 'absolute', left: f(23.25), top: f(8.25) }}>
              <Text style={{ fontSize: f(18), lineHeight: f(18 * LH), fontWeight: '700', color: TEXT }}>필요한 알림만</Text>
              <Text style={{ fontSize: f(20), lineHeight: f(20 * LH), fontWeight: '700', color: TEAL }}>알려드릴게요!</Text>
            </View>
            <Text style={{ position: 'absolute', left: f(23.25), top: f(60.25), fontSize: f(10.5), lineHeight: f(10.5 * LH), fontWeight: '500', color: TEXT_S }}>
              맞춤형 알림으로{'\n'}더 건강한 습관을 만들어봐요.
            </Text>
          </View>

          {spacer(LIST_GAP)}
          {/* ── 알림 항목 ── */}
          <View onLayout={measure('list')} style={{ borderTopWidth: f(0.75), borderTopColor: DIVIDER }}>
            {ROWS.map(row => (
              <View
                key={row.key}
                style={[
                  s.row,
                  {
                    height: f(46.5),
                    paddingLeft: fx(13),
                    borderBottomWidth: f(0.75),
                    borderBottomColor: DIVIDER,
                  },
                ]}
              >
                <View style={[s.center, { width: f(27), height: f(27), borderRadius: f(13.5), backgroundColor: TEAL_BADGE }]}>
                  <row.Icon width={f(18)} height={f(18)} />
                </View>
                <View style={{ flex: 1, marginLeft: f(12) }}>
                  <Text style={{ fontSize: f(11), lineHeight: f(16.5), fontWeight: '600', color: '#000000' }}>{row.title}</Text>
                  <Text style={{ marginTop: f(1.5), fontSize: f(7.5), lineHeight: f(7.5 * LH), fontWeight: '600', color: GRAY }}>{row.desc}</Text>
                </View>
                {row.kind === 'toggle' ? (
                  <View style={{ marginRight: fx(31.5) }}>
                    <Toggle f={f} value={toggles[row.key]} onChange={v => setToggles(prev => ({ ...prev, [row.key]: v }))} />
                  </View>
                ) : (
                  <TextInput
                    style={{
                      marginRight: fx(13.5),
                      width: f(75),
                      height: f(26.25),
                      paddingVertical: 0,
                      paddingHorizontal: f(11.25),
                      backgroundColor: INPUT_BG,
                      borderWidth: f(0.75),
                      borderColor: INPUT_LINE,
                      borderRadius: f(6),
                      fontSize: f(12),
                      fontWeight: '500',
                      color: TEXT,
                    }}
                    value={thresholds[row.key]}
                    onChangeText={v => setThresholds(prev => ({ ...prev, [row.key]: v }))}
                    placeholder={row.unit}
                    placeholderTextColor={INPUT_HINT}
                    keyboardType="numeric"
                  />
                )}
              </View>
            ))}
          </View>

          {spacer(BUTTON_GAP)}
          <TouchableOpacity
            onLayout={measure('button')}
            style={[
              s.center,
              {
                marginLeft: fx(19.13),
                marginRight: fx(18.62),
                height: f(35),
                borderRadius: f(100),
                backgroundColor: BUTTON,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: f(1.5) },
                shadowOpacity: 0.3,
                shadowRadius: f(1.5),
                elevation: 3,
              },
            ]}
            onPress={handleSave}
            disabled={saving || loading}
            activeOpacity={0.8}
          >
            {saving || loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ fontSize: f(9), lineHeight: f(9 * LH), fontWeight: '600', color: '#FFFFFF' }}>변경사항 저장하기</Text>
            )}
          </TouchableOpacity>
          {spacer(BOTTOM)}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default NotificationSettingsScreen;

import React from 'react';
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
} from 'react-native';
import ChevronLeftIcon from '../icon/chevron_left_auth.svg';
import { useFitLayout, Gap } from '../utils/figmaScale';

// Figma(Pretendard) 기본 줄 높이 — 안드로이드 기본 줄 높이가 더 커서 글자가 아래로 밀리는 것 방지
const LH = 1.2;

// ─── 색상 상수 (Figma 아이디찾기 / 비밀번호찾기) ─────────────
const SCREEN_BG   = '#F7FFFE';
const CARD_BG     = '#F7FAFA';
const TEAL        = '#18B8AE';
const TEXT        = '#172033';
const TEXT_S      = '#7B8794';
const BORDER      = '#EDF2F2';
const BORDER_SOFT = 'rgba(231,241,243,0.9)';

// ─── 화면 맞춤 레이아웃 (Figma px 기준, 프레임 높이 639) ─────
const BLOCKS = ['back', 'title', 'card', 'button'];
const TOP: Gap = { design: 39.75, min: 0, max: 60, safeTop: true };
const TITLE_GAP: Gap = { design: 50.25, min: 20, max: 80 };
const CARD_GAP: Gap = { design: 42, min: 18, max: 64 };
const BUTTON_GAP: Gap = { design: 20.25, min: 12, max: 30 };
const BOTTOM: Gap = { design: 283, min: 16, max: 400 };
const GAPS = [TOP, TITLE_GAP, CARD_GAP, BUTTON_GAP, BOTTOM];

interface Props {
  title: string;
  subtitle: string;
  Icon: React.FC<any>;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'email-address';
  buttonLabel: string;
  onSubmit: () => void;
  onBack: () => void;
}

// 아이디 찾기 · 비밀번호 찾기 공통 레이아웃 (타이틀 + 입력 카드 + 버튼 + 하단 잎사귀 배경)
const FindAccountLayout: React.FC<Props> = ({
  title,
  subtitle,
  Icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  buttonLabel,
  onSubmit,
  onBack,
}) => {
  const { f, fx, areaHeight, bottomInset, onAreaLayout, measure, spacer, ready } = useFitLayout({ blocks: BLOCKS, gaps: GAPS, safeBottom: true });
  const smallShadow = {
    shadowColor: '#526A73',
    shadowOffset: { width: f(3), height: f(3) },
    shadowOpacity: 0.07,
    shadowRadius: f(3),
    elevation: 2,
  };

  return (
    <View style={s.root}>
      <Image
        source={require('../image/find_leaves_bg.png')}
        // 잎사귀 배경은 화면 하단에 붙이고 폭 기준으로 비율 유지
        style={{ position: 'absolute', left: 0, bottom: 0, width: fx(292.5), height: fx(430.5) }}
        resizeMode="cover"
      />
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
          <TouchableOpacity onLayout={measure('back')} onPress={onBack} hitSlop={8} style={{ marginLeft: fx(9), alignSelf: 'flex-start' }}>
            <ChevronLeftIcon width={f(25.5)} height={f(25.5)} />
          </TouchableOpacity>

          {spacer(TITLE_GAP)}
          <View onLayout={measure('title')} style={{ marginLeft: fx(18) }}>
            <Text style={{ fontSize: f(22.5), lineHeight: f(22.5 * LH), fontWeight: '800', color: TEAL }}>{title}</Text>
            <Text style={{ marginTop: f(6.75), fontSize: f(12.75), lineHeight: f(12.75 * LH), fontWeight: '500', color: TEXT_S }}>{subtitle}</Text>
          </View>

          {spacer(CARD_GAP)}
          {/* ── 입력 카드 ── */}
          <View
            onLayout={measure('card')}
            style={{
              marginHorizontal: fx(20.25),
              height: f(87.75),
              paddingLeft: fx(17.25),
              paddingRight: fx(12),
              justifyContent: 'center',
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
            <View
              style={[
                s.row,
                smallShadow,
                {
                  height: f(41.25),
                  paddingLeft: f(12),
                  backgroundColor: '#FFFFFF',
                  borderWidth: f(0.75),
                  borderColor: BORDER,
                  borderRadius: f(12),
                },
              ]}
            >
              <Icon width={f(18)} height={f(18)} />
              <TextInput
                style={{ flex: 1, marginLeft: f(8.25), paddingVertical: 0, fontSize: f(10.5), fontWeight: '500', color: TEXT }}
                placeholder={placeholder}
                placeholderTextColor={TEXT_S}
                value={value}
                onChangeText={onChangeText}
                autoCapitalize="none"
                keyboardType={keyboardType}
              />
            </View>
          </View>

          {spacer(BUTTON_GAP)}
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
            onPress={onSubmit}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: f(13.5), lineHeight: f(13.5 * LH), fontWeight: '800', color: '#FFFFFF' }}>{buttonLabel}</Text>
          </TouchableOpacity>
          {spacer(BOTTOM)}
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

export default FindAccountLayout;

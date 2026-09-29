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
import { useFigmaScale } from '../utils/figmaScale';

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
  const f = useFigmaScale();
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
        style={{ position: 'absolute', left: 0, top: f(210), width: f(292.5), height: f(430.5) }}
        resizeMode="cover"
      />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}>
        <ScrollView contentContainerStyle={{ paddingBottom: f(40) }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={onBack} hitSlop={8} style={{ marginTop: f(39.75), marginLeft: f(9), alignSelf: 'flex-start' }}>
            <ChevronLeftIcon width={f(25.5)} height={f(25.5)} />
          </TouchableOpacity>

          <View style={{ marginTop: f(50.25), marginLeft: f(18) }}>
            <Text style={{ fontSize: f(22.5), lineHeight: f(22.5 * LH), fontWeight: '800', color: TEAL }}>{title}</Text>
            <Text style={{ marginTop: f(6.75), fontSize: f(12.75), lineHeight: f(12.75 * LH), fontWeight: '500', color: TEXT_S }}>{subtitle}</Text>
          </View>

          {/* ── 입력 카드 ── */}
          <View
            style={{
              marginTop: f(42),
              marginHorizontal: f(20.25),
              height: f(87.75),
              paddingLeft: f(17.25),
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
                  width: f(225),
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

          <TouchableOpacity
            style={[
              s.center,
              smallShadow,
              {
                marginTop: f(20.25),
                marginLeft: f(35.25),
                width: f(225),
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

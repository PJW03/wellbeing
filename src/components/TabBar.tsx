import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabHomeIcon from '../icon/tab_home.svg';
import TabReportIcon from '../icon/tab_report.svg';
import { useFigmaScale } from '../utils/figmaScale';

// Figma(Pretendard) 기본 줄 높이 — 안드로이드 기본 줄 높이가 더 커서 글자가 아래로 밀리는 것 방지
const LH = 1.2;

const TEAL = '#18B8AE';
const TEAL_LIGHT = '#DDF7F4';
const TEXT_S = '#7B8794';

type Tab = 'Home' | 'Report';

// Figma 하단 탭바 (홈 · 리포트)
const TabBar: React.FC<{ active: Tab }> = ({ active }) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const f = useFigmaScale();

  const tabs: { key: Tab; label: string; left: number; Icon: React.FC<any>; iconW: number; iconH: number }[] = [
    { key: 'Home', label: '홈', left: 47.25, Icon: TabHomeIcon, iconW: 20.25, iconH: 20.25 },
    { key: 'Report', label: '리포트', left: 186.75, Icon: TabReportIcon, iconW: 20.25, iconH: 21 },
  ];

  return (
    <View style={[s.bar, { height: f(54) + insets.bottom, borderTopWidth: f(0.75) }]}>
      {tabs.map(({ key, label, left, Icon, iconW, iconH }) => {
        const isActive = key === active;
        const color = isActive ? TEAL : TEXT_S;
        return (
          <TouchableOpacity
            key={key}
            style={[s.item, { left: f(left), top: f(8.25), width: f(51) }]}
            activeOpacity={0.8}
            onPress={() => !isActive && navigation.popTo(key)}
          >
            <View
              style={[
                s.iconBox,
                { width: f(51), height: f(28.5), borderRadius: f(7.5) },
                isActive && { backgroundColor: TEAL_LIGHT },
              ]}
            >
              <Icon width={f(iconW)} height={f(iconH)} color={color} />
            </View>
            <Text style={{ marginTop: f(1.5), fontSize: f(9), lineHeight: f(9 * LH), fontWeight: '600', color }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  bar: { backgroundColor: '#FFFFFF', borderTopColor: '#EDF2F2' },
  item: { position: 'absolute', alignItems: 'center' },
  iconBox: { justifyContent: 'center', alignItems: 'center' },
});

export default TabBar;

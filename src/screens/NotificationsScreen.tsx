import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NoticeIcon from '../icon/noticeicon.svg';
import TempIcon from '../icon/temp.svg';
import HumidityIcon from '../icon/humidity.svg';
import DustIcon from '../icon/dust.svg';
import Co2Icon from '../icon/co2.svg';
import StretchIcon from '../icon/stretch.svg';
import LeftArrowIcon from '../icon/leftarrow.svg';

const WHITE = '#FFFFFF';
const BG = '#F7FAFA';
const TEXT = '#2C3E50';
const TEXT_M = '#5A6B73';
const BORDER = '#D9E6E3';
const CHIP = '#8ECFC6';
const WHITE_ICON = '#FFFFFF';

const iconMap = {
  temp: TempIcon,
  humidity: HumidityIcon,
  dust: DustIcon,
  co2: Co2Icon,
  stretch: StretchIcon,
};

const notifications = [
  { id: '1', type: 'humidity', text: '습도가 높으니 환기를 해보세요!', date: '6, June' },
  { id: '2', type: 'temp', text: '실내 온도가 낮으니 난방을 켜 주세요!', date: '5, June' },
  { id: '3', type: 'dust', text: '미세먼지 나쁨! 창문을 닫아주세요', date: '5, June' },
  { id: '4', type: 'co2', text: 'CO2농도 up! 환기를 시켜주세요', date: '4, June' },
  { id: '5', type: 'stretch', text: '턱 괴기 대신, 스트레칭을 해보세요!', date: '4, June' },
  { id: '6', type: 'temp', text: '실내 온도가 낮으니 난방을 켜 주세요!', date: '3, June' },
  { id: '7', type: 'humidity', text: '습도가 높으니 환기를 해보세요!', date: '2, June' },
];

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}>
          <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
            <LeftArrowIcon width={32} height={32} />
          </TouchableOpacity>
          <Text style={s.title}>누적 알림</Text>
          <View style={s.headerSpacer} />
        </View>
        {notifications.map((item) => {
          const Icon = iconMap[item.type as keyof typeof iconMap] ?? NoticeIcon;
          return (
          <View key={item.id} style={s.card}>
            <View style={s.iconWrap}>
              <Icon width={20} height={20} />
            </View>
            <Text style={s.text} numberOfLines={1}>
              {item.text}
            </Text>
            <Text style={s.date}>{item.date}</Text>
          </View>
        );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 44,
    paddingBottom: 24,
    rowGap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_M,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CHIP,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeIcon: {
    color: WHITE_ICON,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: TEXT_M,
  },
});

export default NotificationsScreen;

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NoticeIcon from '../icon/noticeicon.svg';
import TempIcon from '../icon/temp.svg';
import HumidityIcon from '../icon/humidity.svg';
import DustIcon from '../icon/dust.svg';
import Co2Icon from '../icon/co2.svg';
import StretchIcon from '../icon/stretch.svg';
import LeftArrowIcon from '../icon/leftarrow.svg';
import { getNotifications, markNotificationRead, Notification } from '../api/notification';

const WHITE    = '#FFFFFF';
const BG       = '#F7FAFA';
const TEXT     = '#2C3E50';
const TEXT_M   = '#5A6B73';
const BORDER   = '#D9E6E3';
const CHIP     = '#8ECFC6';
const CHIP_READ = '#D0E8E4';
const TEAL     = '#1B9B92';

// sensorType → 아이콘 매핑
const iconMap: Record<string, React.FC<any>> = {
  TEMP:     TempIcon,
  HUMIDITY: HumidityIcon,
  DUST:     DustIcon,
  CO2:      Co2Icon,
  POSTURE:  StretchIcon,
};

const formatDate = (sentAt: string) => {
  const d = new Date(sentAt);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const data = await getNotifications(1);
      setNotifications(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRead = async (notiNo: number) => {
    try {
      await markNotificationRead(notiNo);
      setNotifications(prev =>
        prev.map(n => n.notiNo === notiNo ? { ...n, isRead: true } : n)
      );
    } catch (_) {}
  };

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

        {isLoading && (
          <ActivityIndicator size="large" color={TEAL} style={s.loader} />
        )}

        {error && (
          <Text style={s.errorText}>{error}</Text>
        )}

        {!isLoading && !error && notifications.length === 0 && (
          <Text style={s.emptyText}>알림이 없습니다.</Text>
        )}

        {notifications.map((item) => {
          const Icon = iconMap[item.sensorType.toUpperCase()] ?? NoticeIcon;
          return (
            <TouchableOpacity
              key={item.notiNo}
              style={[s.card, item.isRead && s.cardRead]}
              activeOpacity={0.75}
              onPress={() => !item.isRead && handleRead(item.notiNo)}
            >
              <View style={[s.iconWrap, item.isRead && s.iconWrapRead]}>
                <Icon width={20} height={20} />
              </View>
              <View style={s.textWrap}>
                <Text style={[s.text, item.isRead && s.textRead]}>{item.message}</Text>
                <Text style={s.category}>{item.category}</Text>
              </View>
              <Text style={s.date}>{formatDate(item.sentAt)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
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
  backButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  headerSpacer: { width: 32, height: 32 },
  title: { fontSize: 20, fontWeight: '700', color: TEXT_M },
  loader: { marginTop: 40 },
  errorText: { fontSize: 14, color: '#E06A6A', textAlign: 'center', marginTop: 40 },
  emptyText: { fontSize: 14, color: TEXT_M, textAlign: 'center', marginTop: 40 },
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
  cardRead: {
    backgroundColor: '#F5F9F8',
    borderColor: '#E0EDEA',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CHIP,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapRead: {
    backgroundColor: CHIP_READ,
  },
  textWrap: { flex: 1 },
  text: { fontSize: 14, color: TEXT, fontWeight: '600' },
  textRead: { color: TEXT_M, fontWeight: '400' },
  category: { fontSize: 11, color: TEAL, marginTop: 2 },
  date: { fontSize: 11, color: TEXT_M },
});

export default NotificationsScreen;

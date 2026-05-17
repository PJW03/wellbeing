import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeScreenProps {}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>Wellbeing</Text>
          <Text style={styles.subtitle}>
            당신의 건강한 삶을 위한 앱
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🏃</Text>
            <Text style={styles.cardName}>활동</Text>
            <Text style={styles.cardDescription}>
              일일 활동량을 추적하세요
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>💤</Text>
            <Text style={styles.cardName}>수면</Text>
            <Text style={styles.cardDescription}>
              숙면을 기록하세요
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧘</Text>
            <Text style={styles.cardName}>명상</Text>
            <Text style={styles.cardDescription}>
              마음을 챙기세요
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊</Text>
            <Text style={styles.cardName}>통계</Text>
            <Text style={styles.cardDescription}>
              진행상황을 확인하세요
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>앱 정보</Text>
          <Text style={styles.infoText}>
            이 앱은 React Native로 개발되었습니다.
          </Text>
          <Text style={styles.infoText}>
            버전: 0.0.1
          </Text>
          <Text style={styles.infoText}>
            플랫폼: Android
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerSection: {
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  cardsContainer: {
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 18,
  },
});

export default HomeScreen;

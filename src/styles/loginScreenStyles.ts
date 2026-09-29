import { StyleSheet } from 'react-native';

// 로그인 화면 스타일 — 값은 393dp 폭 기준 dp.
// d: 크기(세로·글자, 화면 높이에 맞춰 축소될 수 있음), dx: 가로 여백(항상 화면 폭 기준)
export const createLoginStyles = (d: (v: number) => number, dx: (v: number) => number) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardAvoid: {
      flex: 1,
    },

    // --- Figma 로그인 화면 (카드형) ---
    screenBg: {
      backgroundColor: '#F7FFFE',
    },
    cardScreenContent: {
      alignSelf: 'stretch',
      paddingHorizontal: dx(24),
      alignItems: 'center',
    },
    welcomeSection: {
      alignSelf: 'stretch',
      paddingHorizontal: dx(24),
    },
    welcomeTitle: {
      fontSize: d(20),
      fontWeight: '700',
      color: '#1E2A32',
      lineHeight: d(28),
    },
    welcomeAccent: {
      color: '#18B8AE',
    },
    welcomeSubtitle: {
      fontSize: d(13),
      color: '#8A9A9E',
      marginTop: d(4),
    },
    mascotImage: {
      width: d(150),
      height: d(147),
      transform: [{ rotate: '-6deg' }],
    },
    card: {
      alignSelf: 'stretch',
      backgroundColor: '#F7FAFA',
      borderWidth: 0.75,
      borderColor: 'rgba(231,241,243,0.9)',
      borderRadius: d(20),
      paddingHorizontal: dx(20),
      paddingVertical: d(24),
      marginTop: d(-20),
      zIndex: 1,
      shadowColor: '#3A4A4E',
      shadowOffset: { width: 0, height: d(6) },
      shadowOpacity: 0.08,
      shadowRadius: d(16),
      elevation: 4,
    },
    cardInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      height: d(60),
      backgroundColor: '#FFFFFF',
      borderRadius: d(12),
      paddingHorizontal: d(14),
      marginBottom: d(12),
      shadowColor: '#3A4A4E',
      shadowOffset: { width: 0, height: d(2) },
      shadowOpacity: 0.06,
      shadowRadius: d(6),
      elevation: 2,
    },
    cardInputIcon: {
      marginRight: d(8),
    },
    cardInput: {
      flex: 1,
      paddingVertical: 0,
      fontSize: d(13),
      color: '#333333',
    },
    cardButton: {
      alignSelf: 'stretch',
      backgroundColor: '#5DBAAD',
      borderRadius: d(14),
      paddingVertical: d(14),
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: d(8),
      marginBottom: d(16),
    },
    cardButtonText: {
      fontSize: d(14),
      fontWeight: '600',
      color: '#FFFFFF',
    },
    cardLinksRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: dx(28),
      marginBottom: d(14),
    },
    cardLinkText: {
      fontSize: d(12),
      color: '#6B7A7E',
    },
    cardSignupRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'stretch',
      backgroundColor: '#EAF6F3',
      borderRadius: d(12),
      paddingVertical: d(10),
    },
    cardSignupText: {
      fontSize: d(12),
      color: '#8A9A9E',
    },
    cardSignupLink: {
      fontSize: d(12),
      fontWeight: '700',
      color: '#1B9B92',
      marginLeft: d(4),
    },
  });

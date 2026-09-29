import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },





  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },






















  // --- Figma 로그인 화면 (카드형) ---
  screenBg: {
    backgroundColor: '#F7FFFE',
  },
  scrollContentTop: {
    justifyContent: 'flex-start',
  },
  cardScreenContent: {
    alignSelf: 'stretch',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  welcomeSection: {
    alignSelf: 'stretch',
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E2A32',
    lineHeight: 28,
  },
  welcomeAccent: {
    color: '#18B8AE',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#8A9A9E',
    marginTop: 4,
  },
  mascotImage: {
    width: 150,
    height: 147,
    transform: [{ rotate: '-6deg' }],
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: '#F7FAFA',
    borderWidth: 0.75,
    borderColor: 'rgba(231,241,243,0.9)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: -20,
    zIndex: 1,
    shadowColor: '#3A4A4E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
    shadowColor: '#3A4A4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardInputIcon: {
    marginRight: 8,
  },
  cardInput: {
    flex: 1,
    fontSize: 13,
    color: '#333333',
  },
  cardButton: {
    alignSelf: 'stretch',
    backgroundColor: '#5DBAAD',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  cardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
    marginBottom: 14,
  },
  cardLinkText: {
    fontSize: 12,
    color: '#6B7A7E',
  },
  cardSignupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#EAF6F3',
    borderRadius: 12,
    paddingVertical: 10,
  },
  cardSignupText: {
    fontSize: 12,
    color: '#8A9A9E',
  },
  cardSignupLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B9B92',
    marginLeft: 4,
  },
});

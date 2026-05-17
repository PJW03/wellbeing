import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  radialBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 26,
    color: '#1B9B92',
    fontWeight: '600',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: 6,
    paddingLeft: 20,
  },
  containerHeader: {
    // placeholder if needed for future
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignSelf: 'stretch',
    paddingHorizontal: 30,
    alignItems: 'flex-start',
  },
  titleSection: {
    marginBottom: 40,
    alignItems: 'flex-start',
    paddingLeft: 6,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#1B9B92',
    letterSpacing: 1,
  },
  titleUnderline: {
    alignSelf: 'flex-start',
    borderBottomWidth: 4,
    borderBottomColor: '#1B9B92',
    paddingRight: 64,
    marginTop: 6,
    opacity: 0.9,
  },
  inputSection: {
    alignSelf: 'stretch',
    marginBottom: 25,
  },
  input: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 16,
    fontSize: 14,
    color: '#333333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  linkSection: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  leftLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '400',
  },
  buttonSection: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#5DBAAD',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

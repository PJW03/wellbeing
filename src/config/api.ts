import { Platform } from 'react-native';

// Android 에뮬레이터: 10.0.2.2 → 호스트 PC의 localhost
// iOS 시뮬레이터: localhost
// 실기기: PC의 실제 IP 주소 (예: 192.168.0.x)
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const BASE_URL = __DEV__
  ? `http://${DEV_HOST}:8080`
  : 'https://your-production-server.com';

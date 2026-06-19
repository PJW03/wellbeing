/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// 백그라운드/종료 상태에서 알림 수신
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[FCM] 백그라운드 메시지:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);

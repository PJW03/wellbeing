/**
 * Wellbeing App
 * React Native 건강 관리 애플리케이션
 *
 * @format
 */

import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import FindIdScreen from './src/screens/FindIdScreen';
import FindPasswordScreen from './src/screens/FindPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'none',
          }}
        >
          {!isLoggedIn ? (
            <>
              <Stack.Screen
                name="Login"
              >
                {(props) => (
                  <LoginScreen
                    {...props}
                    onLoginSuccess={() => setIsLoggedIn(true)}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="FindID" component={FindIdScreen} />
              <Stack.Screen name="FindPassword" component={FindPasswordScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;

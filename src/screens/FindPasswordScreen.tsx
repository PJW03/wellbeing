import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { styles } from '../styles/loginScreenStyles';
import Header from '../components/Header';

const FindPasswordScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  const handleSendCode = () => {
    console.log('인증번호 전송', { userId, email });
    // API 호출 시뮬레이션
    setIsCodeSent(true);
  };

  const handleVerifyCode = () => {
    console.log('인증번호 확인', { userId, email, code });
    // API 호출 시뮬레이션
    setIsCodeVerified(true);
  };

  const handleResetPassword = () => {
    console.log('비밀번호 재설정', { userId, email, code, newPassword });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Svg pointerEvents="none" style={styles.radialBackground}>
        <Defs>
          <RadialGradient id="bgGradient" cx="90%" cy="60%" rx="90%" ry="90%">
            <Stop offset="0%" stopColor="#00C5B9" stopOpacity="0.38" />
            <Stop offset="35%" stopColor="#66D9CE" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGradient)" />
      </Svg>

      <Header title="비밀번호 찾기" onBack={() => navigation.goBack()} />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>

            <View style={styles.titleSection}>
              <Text style={styles.title}>비밀번호 찾기</Text>
              <View style={styles.titleUnderline} />
            </View>

            <View style={styles.inputSection}>
              <TextInput style={styles.input} placeholder="아이디" placeholderTextColor="#B8B8B8" value={userId} onChangeText={setUserId} />
              
              <View style={styles.rowContainer}>
                <TextInput style={styles.rowInput} placeholder="이메일" placeholderTextColor="#B8B8B8" value={email} onChangeText={setEmail} />
                <TouchableOpacity style={styles.smallButton} onPress={handleSendCode} activeOpacity={0.8}>
                  <Text style={styles.smallButtonText}>전송</Text>
                </TouchableOpacity>
              </View>

              {isCodeSent && (
                <View style={styles.rowContainer}>
                  <TextInput style={styles.rowInput} placeholder="인증번호 6자리" placeholderTextColor="#B8B8B8" value={code} onChangeText={setCode} maxLength={6} />
                  <TouchableOpacity style={styles.smallButton} onPress={handleVerifyCode} activeOpacity={0.8}>
                    <Text style={styles.smallButtonText}>확인</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isCodeVerified && (
                <TextInput style={styles.input} placeholder="새 비밀번호" placeholderTextColor="#B8B8B8" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              )}
            </View>

            <View style={styles.buttonSection}>
              <TouchableOpacity style={styles.loginButton} onPress={isCodeVerified ? handleResetPassword : () => {}} activeOpacity={0.8} disabled={!isCodeVerified}>
                <Text style={styles.loginButtonText}>{isCodeVerified ? '비밀번호 재설정' : '인증 필요'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default FindPasswordScreen;

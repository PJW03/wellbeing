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
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { styles } from '../styles/loginScreenStyles';
import Header from '../components/Header';

const FindIdScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [foundId, setFoundId] = useState('');

  const handleSendCode = () => {
    console.log('인증번호 전송', { nickname, email });
    // API 호출 시뮬레이션
    setIsCodeSent(true);
  };

  const handleVerifyCode = () => {
    console.log('인증번호 확인', { nickname, email, code });
    // API 호출 시뮬레이션
    setFoundId('user123');
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

      <Header title="아이디 찾기" onBack={() => navigation.goBack()} />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>

            <View style={styles.titleSection}>
              <Text style={styles.title}>아이디 찾기</Text>
              <View style={styles.titleUnderline} />
            </View>

          <View style={styles.inputSection}>
            <TextInput style={styles.input} placeholder="닉네임" placeholderTextColor="#B8B8B8" value={nickname} onChangeText={setNickname} />
            
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

            {foundId && (
              <View style={[styles.input, styles.resultBox, styles.resultBoxContent]}>
                <Svg pointerEvents="none" style={styles.resultBoxGradient}>
                  <Defs>
                    <LinearGradient id="resultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                      <Stop offset="55%" stopColor="#CFF4EF" stopOpacity="0.95" />
                      <Stop offset="100%" stopColor="#A8E8E1" stopOpacity="0.98" />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width="100%" height="100%" fill="url(#resultGradient)" />
                </Svg>
                <Text style={styles.resultText}>찾은 아이디: {foundId}</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={styles.loginButtonText}>이전으로</Text>
            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default FindIdScreen;

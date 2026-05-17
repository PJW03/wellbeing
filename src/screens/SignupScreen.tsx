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

const SignupScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [id, setId] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSignup = () => {
    console.log('회원가입', { id, nickname, email });
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

      <Header title="회원 가입" onBack={() => navigation.goBack()} />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>회원 가입</Text>
              <View style={styles.titleUnderline} />
            </View>

            <View style={styles.inputSection}>
              <TextInput style={styles.input} placeholder="아이디" placeholderTextColor="#B8B8B8" value={id} onChangeText={setId} />
              <TextInput style={styles.input} placeholder="닉네임" placeholderTextColor="#B8B8B8" value={nickname} onChangeText={setNickname} />
              <TextInput style={styles.input} placeholder="이메일" placeholderTextColor="#B8B8B8" value={email} onChangeText={setEmail} />
              <TextInput style={styles.input} placeholder="비밀번호" placeholderTextColor="#B8B8B8" value={password} onChangeText={setPassword} secureTextEntry />
              <TextInput style={styles.input} placeholder="비밀번호 확인" placeholderTextColor="#B8B8B8" value={passwordConfirm} onChangeText={setPasswordConfirm} secureTextEntry />
            </View>

            <View style={styles.buttonSection}>
              <TouchableOpacity style={styles.loginButton} onPress={handleSignup} activeOpacity={0.8}>
                <Text style={styles.loginButtonText}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignupScreen;

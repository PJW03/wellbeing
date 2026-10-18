import React, { useState } from 'react';
import { Alert } from 'react-native';
import MailIcon from '../icon/mail_outlined.svg';
import FindAccountLayout from '../components/FindAccountLayout';
import { sendFindIdCode, verifyFindIdCode } from '../api/auth';

// 1단계: 이메일 입력 → 인증코드 발송 / 2단계: 인증코드 입력 → 아이디 확인
const FindIdScreen: React.FC<any> = ({ navigation }) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (task: () => Promise<void>) => {
    if (loading) return;
    setLoading(true);
    try {
      await task();
    } catch (e: any) {
      Alert.alert('아이디 찾기', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = () => {
    if (!email.trim()) return;
    run(async () => {
      await sendFindIdCode(email.trim());
      setStep('code');
    });
  };

  const handleVerify = () => {
    if (!code.trim()) return;
    run(async () => {
      const userId = await verifyFindIdCode(email.trim(), code.trim());
      Alert.alert('아이디 찾기', `회원님의 아이디는 ${userId} 입니다.`, [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    });
  };

  const handleBack = () => {
    if (step === 'code') {
      setCode('');
      setStep('email');
    } else {
      navigation.goBack();
    }
  };

  return step === 'email' ? (
    <FindAccountLayout
      title="아이디 찾기"
      subtitle="회원가입 시 사용한 이메일을 입력해주세요."
      Icon={MailIcon}
      placeholder="이메일을 입력해주세요."
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      buttonLabel="인증코드 받기"
      loading={loading}
      onSubmit={handleSendCode}
      onBack={handleBack}
    />
  ) : (
    <FindAccountLayout
      title="아이디 찾기"
      subtitle="이메일로 받은 인증코드를 입력해주세요."
      Icon={MailIcon}
      placeholder="인증코드를 입력해주세요."
      value={code}
      onChangeText={setCode}
      buttonLabel="아이디 찾기"
      loading={loading}
      onSubmit={handleVerify}
      onBack={handleBack}
    />
  );
};

export default FindIdScreen;

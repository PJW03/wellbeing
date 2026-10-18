import React, { useState } from 'react';
import { Alert } from 'react-native';
import UserLineIcon from '../icon/user_line_gray.svg';
import MailIcon from '../icon/mail_outlined.svg';
import FindAccountLayout from '../components/FindAccountLayout';
import { sendResetPwCode, verifyResetPwCode, changePassword } from '../api/auth';

type Step = 'id' | 'code' | 'newPw';

// 1단계: 아이디 입력 → 인증코드 발송 / 2단계: 인증코드 확인 → 리셋 토큰 / 3단계: 새 비밀번호 저장
const FindPasswordScreen: React.FC<any> = ({ navigation }) => {
  const [step, setStep] = useState<Step>('id');
  const [userId, setUserId] = useState('');
  const [code, setCode] = useState('');
  const [newPw, setNewPw] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (task: () => Promise<void>) => {
    if (loading) return;
    setLoading(true);
    try {
      await task();
    } catch (e: any) {
      Alert.alert('비밀번호 찾기', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (step === 'id') {
      if (!userId.trim()) return;
      run(async () => {
        await sendResetPwCode(userId.trim());
        setStep('code');
      });
    } else if (step === 'code') {
      if (!code.trim()) return;
      run(async () => {
        setResetToken(await verifyResetPwCode(userId.trim(), code.trim()));
        setStep('newPw');
      });
    } else {
      if (!newPw) return;
      run(async () => {
        await changePassword(resetToken, newPw);
        Alert.alert('비밀번호 찾기', '비밀번호가 변경되었어요. 새 비밀번호로 로그인해주세요.', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      });
    }
  };

  const handleBack = () => {
    if (step === 'id') {
      navigation.goBack();
      return;
    }
    // 리셋 토큰은 10분만 유효하므로 뒤로 가면 인증부터 다시 진행
    setCode('');
    setNewPw('');
    setResetToken('');
    setStep(step === 'newPw' ? 'code' : 'id');
  };

  const common = { title: '비밀번호 찾기', loading, onSubmit: handleSubmit, onBack: handleBack };

  if (step === 'id') {
    return (
      <FindAccountLayout
        {...common}
        subtitle="가입한 아이디를 입력해주세요."
        Icon={UserLineIcon}
        placeholder="아이디를 입력해주세요."
        value={userId}
        onChangeText={setUserId}
        buttonLabel="인증코드 받기"
      />
    );
  }
  if (step === 'code') {
    return (
      <FindAccountLayout
        {...common}
        subtitle="가입한 이메일로 받은 인증코드를 입력해주세요."
        Icon={MailIcon}
        placeholder="인증코드를 입력해주세요."
        value={code}
        onChangeText={setCode}
        buttonLabel="인증하기"
      />
    );
  }
  return (
    <FindAccountLayout
      {...common}
      subtitle="새로 사용할 비밀번호를 입력해주세요."
      Icon={UserLineIcon}
      placeholder="새 비밀번호를 입력해주세요."
      value={newPw}
      onChangeText={setNewPw}
      secureTextEntry
      buttonLabel="비밀번호 변경"
    />
  );
};

export default FindPasswordScreen;

import React, { useState } from 'react';
import { Alert } from 'react-native';
import MailIcon from '../icon/mail_outlined.svg';
import FindAccountLayout from '../components/FindAccountLayout';

const FindIdScreen: React.FC<any> = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleFindId = () => {
    if (!email.trim()) return;
    // API 호출 시뮬레이션
    Alert.alert('아이디 찾기', '가입 시 등록하신 이메일로 아이디를 보내드렸어요.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <FindAccountLayout
      title="아이디 찾기"
      subtitle="회원가입 시 사용한 이메일을 입력해주세요."
      Icon={MailIcon}
      placeholder="이메일을 입력해주세요."
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      buttonLabel="아이디 찾기"
      onSubmit={handleFindId}
      onBack={() => navigation.goBack()}
    />
  );
};

export default FindIdScreen;

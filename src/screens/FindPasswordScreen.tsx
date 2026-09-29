import React, { useState } from 'react';
import { Alert } from 'react-native';
import UserLineIcon from '../icon/user_line_gray.svg';
import FindAccountLayout from '../components/FindAccountLayout';

const FindPasswordScreen: React.FC<any> = ({ navigation }) => {
  const [userId, setUserId] = useState('');

  const handleFindPassword = () => {
    if (!userId.trim()) return;
    // API 호출 시뮬레이션
    Alert.alert('비밀번호 찾기', '가입한 이메일로 임시 비밀번호를 보내드렸어요.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <FindAccountLayout
      title="비밀번호 찾기"
      subtitle="가입한 아이디를 입력해주세요."
      Icon={UserLineIcon}
      placeholder="아이디를 입력해주세요."
      value={userId}
      onChangeText={setUserId}
      buttonLabel="비밀번호 찾기"
      onSubmit={handleFindPassword}
      onBack={() => navigation.goBack()}
    />
  );
};

export default FindPasswordScreen;

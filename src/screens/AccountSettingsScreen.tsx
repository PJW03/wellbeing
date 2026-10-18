import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ChevronLeftIcon from '../icon/chevron_left_small.svg';
import AvatarRing from '../icon/avatar_ring.svg';
import CameraIcon from '../icon/camera.svg';
import EditIcon from '../icon/edit_small.svg';
import AvatarImage from '../image/account_avatar.png';
import { useFitLayout, Gap } from '../utils/figmaScale';
import { useSession } from '../context/SessionContext';
import { updateUser, deleteUser } from '../api/auth';

// Figma(Pretendard) 기본 줄 높이 — 안드로이드 기본 줄 높이가 더 커서 글자가 아래로 밀리는 것 방지
const LH = 1.2;

// ─── 색상 상수 (Figma 설정-계정설정) ─────────────────────────
const BG          = '#F7FAFA';
const TEXT        = '#172033';
const TEXT_S      = '#7B8794';
const FIELD_TEXT  = '#544C4C';
const FIELD_LINE  = 'rgba(84,76,76,0.14)';
const BUTTON      = '#5FCDC6';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── 화면 맞춤 레이아웃 (Figma px 기준, 프레임 높이 639) ─────
const BLOCKS = ['header', 'avatar', 'form', 'button', 'delete'];
const TOP: Gap = { design: 45, min: 0, max: 60, safeTop: true };
// 입력칸(현재 비밀번호)이 Figma보다 하나 많아 화면이 빽빽해짐 — 프로필 사진을 줄이고 간격 최소값을 넉넉히 둠
const AVATAR_SCALE = 0.72;
// 입력칸 높이·간격도 Figma(33 / 21.75)보다 살짝 줄임
const FIELD_HEIGHT = 30;
const FIELD_SPACING = 16.5;
const AVATAR_GAP: Gap = { design: 24, min: 18, max: 50 };
const FORM_GAP: Gap = { design: 24, min: 16, max: 36 };
const BUTTON_GAP: Gap = { design: 30, min: 20, max: 50 };
const DELETE_GAP: Gap = { design: 17.25, min: 10, max: 24 };
const BOTTOM: Gap = { design: 24, min: 18, max: 120 };
const GAPS = [TOP, AVATAR_GAP, FORM_GAP, BUTTON_GAP, DELETE_GAP, BOTTOM];

type FieldKey = 'nickname' | 'email' | 'currentPassword' | 'password' | 'passwordConfirm';

// 수정·탈퇴 모두 서버에서 현재 비밀번호를 검증하므로 입력칸을 따로 둠 (Figma에는 없는 항목)
const FIELDS: { key: FieldKey; label: string; secure?: boolean; placeholder?: string; keyboardType?: 'default' | 'email-address' }[] = [
  { key: 'nickname', label: '닉네임' },
  { key: 'email', label: '이메일', keyboardType: 'email-address' },
  { key: 'currentPassword', label: '현재 비밀번호', secure: true, placeholder: '현재 비밀번호를 입력해주세요.' },
  { key: 'password', label: '새 비밀번호', secure: true, placeholder: '**********' },
  { key: 'passwordConfirm', label: '새 비밀번호 확인', secure: true, placeholder: '**********' },
];

const AccountSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { f, fx, areaHeight, bottomInset, onAreaLayout, measure, spacer, ready } = useFitLayout({ blocks: BLOCKS, gaps: GAPS, safeBottom: true });
  const { user, updateUser: applyUserChanges, logout } = useSession();
  const [values, setValues] = useState<Record<FieldKey, string>>({
    nickname: user.nickname,
    email: user.userEmail,
    currentPassword: '',
    password: '',
    passwordConfirm: '',
  });
  const inputs = useRef<Partial<Record<FieldKey, TextInput | null>>>({});
  const [busy, setBusy] = useState(false);

  // 현재 비밀번호가 비어 있으면 안내 후 입력칸으로 이동
  const requireCurrentPw = (title: string) => {
    if (values.currentPassword) return true;
    Alert.alert(title, '현재 비밀번호를 입력해주세요.', [{ text: '확인', onPress: () => inputs.current.currentPassword?.focus() }]);
    return false;
  };

  const handleSave = async () => {
    if (busy) return;
    const nickname = values.nickname.trim();
    const email = values.email.trim();
    // 바뀐 필드만 보냄 (부분 수정)
    const changes = {
      nickname: nickname !== user.nickname ? nickname : undefined,
      userEmail: email !== user.userEmail ? email : undefined,
      newPw: values.password || undefined,
    };
    if (!changes.nickname && !changes.userEmail && !changes.newPw) {
      navigation.goBack();
      return;
    }
    if (!nickname) return Alert.alert('계정설정', '닉네임을 입력해주세요.');
    if (changes.userEmail !== undefined && !EMAIL_RE.test(changes.userEmail)) return Alert.alert('계정설정', '이메일 형식이 올바르지 않습니다.');
    if (changes.newPw && values.password !== values.passwordConfirm) return Alert.alert('계정설정', '새 비밀번호가 일치하지 않습니다.');
    if (!requireCurrentPw('계정설정')) return;

    setBusy(true);
    try {
      await updateUser({ userNo: user.userNo, currentPw: values.currentPassword, ...changes });
      applyUserChanges({
        ...(changes.nickname !== undefined && { nickname: changes.nickname }),
        ...(changes.userEmail !== undefined && { userEmail: changes.userEmail }),
      });
      Alert.alert('계정설정', '변경사항이 저장되었어요.', [{ text: '확인', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('계정설정', e.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    setBusy(true);
    try {
      await deleteUser(user.userNo, values.currentPassword);
      Alert.alert('계정 삭제', '계정이 삭제되었어요.');
      logout();
    } catch (e: any) {
      Alert.alert('계정 삭제', e.message);
      setBusy(false);
    }
  };

  const handleDelete = () => {
    if (busy || !requireCurrentPw('계정 삭제')) return;
    Alert.alert('계정 삭제', '계정을 삭제하면 모든 기록이 사라지고 되돌릴 수 없어요.\n정말 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: deleteAccount },
    ]);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}>
        {/* 본문 높이는 키보드가 열리기 전 화면 높이로 고정 — 키보드가 가리면 스크롤로 입력칸까지 이동 */}
        <ScrollView
          onLayout={onAreaLayout}
          contentContainerStyle={{ height: areaHeight ?? undefined, paddingBottom: bottomInset, opacity: ready ? 1 : 0 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {spacer(TOP)}
          {/* ── 헤더 ── */}
          <View onLayout={measure('header')} style={[s.center, { height: f(25.5) }]}>
            <Text style={{ fontSize: f(18), lineHeight: f(18 * LH), fontWeight: '700', color: TEXT }}>계정설정</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={{ position: 'absolute', left: fx(12), top: 0 }}>
              <ChevronLeftIcon width={f(25.5)} height={f(25.5)} />
            </TouchableOpacity>
          </View>

          {spacer(AVATAR_GAP)}
          {/* ── 프로필 사진 ── */}
          <View onLayout={measure('avatar')} style={{ alignSelf: 'center', width: f(128.603 * AVATAR_SCALE), height: f(131.98 * AVATAR_SCALE) }}>
            <AvatarRing width={f(128.603 * AVATAR_SCALE)} height={f(131.98 * AVATAR_SCALE)} style={s.abs} />
            <Image
              source={AvatarImage}
              style={{ position: 'absolute', left: f(2.26 * AVATAR_SCALE), top: f(4.5 * AVATAR_SCALE), width: f(123.75 * AVATAR_SCALE), height: f(122.25 * AVATAR_SCALE), borderRadius: f(61.875 * AVATAR_SCALE) }}
              resizeMode="cover"
            />
            {/* TODO: 프로필 사진 변경 기능 연동 필요 */}
            <TouchableOpacity activeOpacity={0.7} style={{ position: 'absolute', left: f(101.26 * AVATAR_SCALE), top: f(102.75 * AVATAR_SCALE) }}>
              <CameraIcon width={f(24 * AVATAR_SCALE)} height={f(24 * AVATAR_SCALE)} />
            </TouchableOpacity>
          </View>

          {spacer(FORM_GAP)}
          {/* ── 입력 항목 ── */}
          <View onLayout={measure('form')} style={{ marginLeft: fx(19.13), marginRight: fx(19.12) }}>
            {FIELDS.map(({ key, label, secure, placeholder, keyboardType }, i) => (
              <View key={key} style={i > 0 && { marginTop: f(FIELD_SPACING) }}>
                <Text style={{ marginLeft: f(1.5), fontSize: f(12), lineHeight: f(10.5), fontWeight: '700', color: '#000000' }}>{label}</Text>
                <View
                  style={[
                    s.row,
                    {
                      marginTop: f(6.75),
                      height: f(FIELD_HEIGHT),
                      paddingLeft: f(10.5),
                      paddingRight: f(9),
                      borderWidth: f(0.75),
                      borderColor: FIELD_LINE,
                      borderRadius: f(4.5),
                    },
                  ]}
                >
                  <TextInput
                    ref={el => {
                      inputs.current[key] = el;
                    }}
                    style={{ flex: 1, paddingVertical: 0, fontSize: f(10.5), fontWeight: '500', color: FIELD_TEXT }}
                    value={values[key]}
                    onChangeText={v => setValues(prev => ({ ...prev, [key]: v }))}
                    placeholder={placeholder}
                    // 마스킹 표시(*)는 Figma처럼 진하게, 안내 문구는 흐리게
                    placeholderTextColor={placeholder === '**********' ? FIELD_TEXT : TEXT_S}
                    secureTextEntry={secure}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity hitSlop={8} activeOpacity={0.7} onPress={() => inputs.current[key]?.focus()}>
                    <EditIcon width={f(15)} height={f(15)} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {spacer(BUTTON_GAP)}
          <TouchableOpacity
            onLayout={measure('button')}
            style={[
              s.center,
              {
                marginLeft: fx(19.13),
                marginRight: fx(18.62),
                height: f(35),
                borderRadius: f(100),
                backgroundColor: BUTTON,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: f(1.5) },
                shadowOpacity: 0.3,
                shadowRadius: f(1.5),
                elevation: 3,
              },
            ]}
            onPress={handleSave}
            disabled={busy}
            activeOpacity={0.8}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ fontSize: f(9), lineHeight: f(9 * LH), fontWeight: '600', color: '#FFFFFF' }}>변경사항 저장하기</Text>
            )}
          </TouchableOpacity>

          {spacer(DELETE_GAP)}
          <TouchableOpacity onLayout={measure('delete')} style={{ alignSelf: 'center' }} hitSlop={8} activeOpacity={0.7} onPress={handleDelete}>
            <Text style={{ fontSize: f(12), lineHeight: f(12 * LH), fontWeight: '500', color: TEXT_S, textDecorationLine: 'underline' }}>
              계정 삭제하기
            </Text>
          </TouchableOpacity>
          {spacer(BOTTOM)}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  abs: { position: 'absolute', left: 0, top: 0 },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default AccountSettingsScreen;

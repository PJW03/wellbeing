# Wellbeing - React Native Android App

## 프로젝트 정보

- **프로젝트명**: wellbeing
- **타입**: React Native Android App
- **언어**: TypeScript + JavaScript
- **패키지 매니저**: npm
- **React Native 버전**: 0.85.3
- **React 버전**: 19.2.3
- **Node.js 요구 사항**: >= 22.11.0

## 프로젝트 구조

```
wellbeing/
├── android/              # Android 네이티브 코드
├── src/
│   └── screens/
│       └── HomeScreen.tsx   # 메인 화면 컴포넌트
├── App.tsx              # 앱 진입점
├── index.js             # 애플리케이션 진입점
├── package.json         # 의존성 설정
├── tsconfig.json        # TypeScript 설정
└── metro.config.js      # Metro 번들러 설정
```

## 주요 기능

- **TypeScript 지원**: 타입 안전성을 위한 TypeScript 설정 완료
- **Safe Area**: `react-native-safe-area-context`를 사용한 안전 영역 처리
- **홈 화면**: 활동, 수면, 명상, 통계 등의 카드 UI
- **반응형 디자인**: 다양한 화면 크기에 대응

## 빠른 시작

### 1. 의존성 설치
```bash
cd wellbeing
npm install
```

### 2. Metro 번들러 시작
```bash
npm start
```

### 3. Android에서 실행
새로운 터미널에서:
```bash
npm run android
```

## 사용 가능한 npm 스크립트

- `npm start` - Metro 번들러 시작
- `npm run android` - Android 앱 빌드 및 실행
- `npm run ios` - iOS 앱 빌드 및 실행 (Mac에서만)
- `npm run lint` - ESLint를 사용한 코드 검사
- `npm test` - Jest를 사용한 테스트 실행

## 필수 요구 사항

### Android 개발 환경
- Android SDK (API 레벨 33 이상 권장)
- Android NDK
- JDK 11 이상
- Gradle

### 개발 도구
- Node.js v22.11.0 이상
- npm v10.0.0 이상
- VS Code 권장

## TypeScript 개발

모든 새로운 컴포넌트는 `.tsx` 확장자로 작성하세요:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MyComponentProps {
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 16,
  },
});

export default MyComponent;
```

## 문제 해결

### Metro 번들러 캐시 초기화
```bash
npm start -- --reset-cache
```

### node_modules 재설치
```bash
rm -r node_modules
npm install
```

### Android 빌드 오류 해결
```bash
cd android
./gradlew clean
cd ..
npm run android
```

## 다음 단계

1. 네비게이션 라이브러리 추가 (React Navigation)
2. 상태 관리 라이브러리 추가 (Redux, Zustand)
3. API 통신 구현
4. 추가 화면 및 기능 구현
5. 안드로이드 스토어 배포 준비

## 유용한 리소스

- [React Native 공식 문서](https://reactnative.dev/)
- [React Native CLI 가이드](https://reactnative.dev/docs/cli)
- [TypeScript in React Native](https://reactnative.dev/docs/typescript)

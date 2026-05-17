# Wellbeing - React Native Android App

React Native CLI를 사용하여 만든 건강 관리 애플리케이션입니다.

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

## 라이센스

MIT

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

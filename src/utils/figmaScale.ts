import { useWindowDimensions } from 'react-native';

// Figma 프레임 폭(294.75 = 393dp × 0.75) 기준 좌표를 기기 폭에 맞게 환산
export const FIGMA_WIDTH = 294.75;

export const useFigmaScale = () => {
  const { width } = useWindowDimensions();
  const k = width / FIGMA_WIDTH;
  return (v: number) => v * k;
};

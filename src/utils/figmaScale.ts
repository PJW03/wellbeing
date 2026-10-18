import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, LayoutChangeEvent, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Figma 프레임 폭(294.75 = 393dp × 0.75) 기준 좌표를 기기 폭에 맞게 환산
export const FIGMA_WIDTH = 294.75;

export const useFigmaScale = () => {
  const { width } = useWindowDimensions();
  const k = width / FIGMA_WIDTH;
  return (v: number) => v * k;
};

// 섹션 사이 간격(Figma px): Figma 값 기준으로 min~max 사이에서 화면 높이에 맞춰 늘고 줄어듦
// safeTop: 화면 맨 위 여백 — 상태바 바로 아래까지만 줄어들 수 있음
export interface Gap {
  design: number;
  min: number;
  max: number;
  safeTop?: boolean;
}

interface FitOptions {
  // 간격 사이에 놓이는 섹션 키 — 실제 렌더 높이를 onLayout으로 재서 스케일 계산에 사용
  blocks: readonly string[];
  // 화면에 들어가는 모든 간격 (spacer로 렌더하는 것과 동일한 목록)
  gaps: readonly Gap[];
  // 'fit': 한 화면에 담기도록 필요하면 전체를 균일하게 축소
  // 'scroll': 폭 기준 크기 유지, 넘치면 스크롤 (간격은 남는 높이만큼만 늘어남)
  mode?: 'fit' | 'scroll';
  // 가로 기준: 기본은 Figma 프레임 전체 폭. 좌우 고정 여백(dp)을 두고 그 안에 Figma 본문 폭을 맞출 수도 있음
  sideMargin?: number;
  contentWidth?: number;
  // 탭바가 없는 화면: 하단 시스템 내비게이션 바 영역을 비워둠 (반환되는 bottomInset을 컨테이너 paddingBottom으로 사용)
  safeBottom?: boolean;
}

// 상하좌우 반응형 레이아웃
// - 가로(fx): 여백·간격은 항상 화면 폭 기준 Figma 비율
// - 크기(f): 글자·아이콘·카드 높이 — 폭 기준으로 하되, fit 모드에서 높이가 모자라면
//   먼저 간격을 min까지 줄이고 그래도 모자랄 때만 균일하게 축소
export const useFitLayout = ({ blocks, gaps, mode = 'fit', sideMargin = 0, contentWidth = FIGMA_WIDTH, safeBottom = false }: FitOptions) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const kWidth = (width - sideMargin * 2) / contentWidth;

  // 본문 영역 높이 — 키보드가 열려 있는 동안의 변화는 무시해서 입력 중에 화면이 줄어들지 않게 함
  const [areaHeight, setAreaHeight] = useState<number | null>(null);
  const keyboardOpen = useRef(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => { keyboardOpen.current = true; });
    const hide = Keyboard.addListener('keyboardDidHide', () => { keyboardOpen.current = false; });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  const onAreaLayout = (e: LayoutChangeEvent) => {
    if (keyboardOpen.current && areaHeight !== null) return;
    const h = e.nativeEvent.layout.height;
    setAreaHeight(prev => (prev !== null && Math.abs(prev - h) < 0.5 ? prev : h));
  };

  const bottomInset = safeBottom ? insets.bottom : 0;
  // 실제로 내용이 들어갈 수 있는 높이
  const usableHeight = areaHeight !== null ? areaHeight - bottomInset : null;

  const gapMin = (g: Gap) => (g.safeTop ? Math.min(g.design, insets.top / kWidth + 6) : g.min);

  // 섹션 높이 합(Figma px) — 모든 크기가 스케일에 비례하므로 한 번 재면 어떤 스케일에서도 유효
  const [blocksHeight, setBlocksHeight] = useState<number | null>(null);
  const measured = useRef<Record<string, number>>({});

  const minContentHeight =
    blocksHeight !== null ? blocksHeight + gaps.reduce((sum, g) => sum + gapMin(g), 0) : null;
  const kHeight =
    mode === 'fit' && usableHeight !== null && minContentHeight !== null ? usableHeight / minContentHeight : kWidth;
  const k = Math.min(kWidth, kHeight);
  const f = (v: number) => v * k;
  const fx = (v: number) => v * kWidth;

  const measure = (key: string) => (e: LayoutChangeEvent) => {
    measured.current[key] = e.nativeEvent.layout.height / k;
    const values = blocks.map(b => measured.current[b]);
    if (values.some(v => v === undefined)) return;
    const total = values.reduce((sum, v) => sum + v, 0);
    // 반올림 오차로 인한 재렌더 반복 방지
    setBlocksHeight(prev => (prev !== null && Math.abs(prev - total) < 0.5 ? prev : total));
  };

  // fit 모드 간격 크기(Figma px) — flex 축소에 맡기지 않고 직접 계산해서 항상 정확히 화면에 맞춤
  // 모자라면: 모든 간격을 같은 비율(t)로 design → min 쪽으로 줄임
  // 남으면: 모든 간격에 같은 양(level)을 더하되 각자 max까지만 (다 차면 나머지는 하단 여백으로 남음)
  const gapSize = (() => {
    if (mode !== 'fit' || usableHeight === null || blocksHeight === null) return (g: Gap) => g.design;
    const free = usableHeight / k - blocksHeight;
    const sumMin = gaps.reduce((sum, g) => sum + gapMin(g), 0);
    const sumDesign = gaps.reduce((sum, g) => sum + g.design, 0);
    if (free <= sumDesign) {
      const t = sumDesign > sumMin ? Math.max(0, (free - sumMin) / (sumDesign - sumMin)) : 0;
      return (g: Gap) => gapMin(g) + (g.design - gapMin(g)) * t;
    }
    const grown = (level: number) => gaps.reduce((sum, g) => sum + Math.min(g.design + level, Math.max(g.max, g.design)), 0);
    let lo = 0;
    let hi = free;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (grown(mid) > free) hi = mid;
      else lo = mid;
    }
    return (g: Gap) => Math.min(g.design + lo, Math.max(g.max, g.design));
  })();

  // 섹션 사이 간격 — fit: 계산된 고정 높이 / scroll: Figma 값 이상, 화면이 남을 때만 max까지 늘어남
  const spacer = (g: Gap) =>
    React.createElement(View, {
      style:
        mode === 'fit'
          ? { height: f(gapSize(g)) }
          : { flexGrow: 1, flexShrink: 0, flexBasis: f(g.design), minHeight: f(g.design), maxHeight: f(Math.max(g.max, g.design)) },
    });

  // 섹션 높이를 재기 전 첫 프레임(폭 기준 크기)은 숨겨서 크기가 튀는 것이 보이지 않게 함
  const ready = mode === 'scroll' || blocksHeight !== null;

  return { f, fx, k, kWidth, width, areaHeight, bottomInset, onAreaLayout, measure, spacer, ready };
};

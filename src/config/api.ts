export const BASE_URL = 'http://3.37.123.73:8080';

// 요청 타임아웃(ms) — 서버가 응답하지 않을 때 화면이 무한 로딩에 빠지지 않게 함
export const REQUEST_TIMEOUT = 10000;

// 로그인 응답에 기기 번호가 없어 기본 기기(1번)를 사용
// TODO: 사용자별 기기 번호 API가 생기면 교체
export const DEFAULT_DEVICE_NO = 1;

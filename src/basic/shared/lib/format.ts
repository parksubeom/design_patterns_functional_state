/**
 * 숫자를 한국 통화 형식으로 변환합니다.
 * 예: 10000 -> "10,000원"
 * @param value 금액
 * @returns 포맷팅된 문자열
 */
export const formatCurrency = (value: number): string => {
  // 순수 계산: 입력(number) -> 출력(string)
  return `${value.toLocaleString()}원`;
};

/**
 * 숫자를 ₩ 표시가 있는 통화 형식으로 변환합니다. (기존 코드의 비관리자용)- `src/shared/lib/useLocalStorage.ts` 생성: 로컬 스토리지 읽기/쓰기 로직을 제네릭 훅으로 캡슐화
- Feature Hooks(`useCart`, `useProducts`, `useCoupons`)에서 중복되는 `useEffect` 및 저장소 접근 로직 제거
- `JSON.parse` 에러 처리를 공통 훅 내부로 통합하여 안정성 확보
- 비즈니스 로직에서 저장 매체(Implementation Detail)에 대한 의존성 제거
 */
export const formatCurrencyWithSymbol = (value: number): string => {
  return `₩${value.toLocaleString()}`;
};

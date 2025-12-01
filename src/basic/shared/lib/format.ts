/**
 * 숫자를 한국 통화 형식으로 변환합니다.
 * 예: 10000 -> "10,000원"
 * @param value 금액
 * @returns 포맷팅된 문자열
 */
export const formatCurrency = (value: number): string => {
  // 순수 계산: 입력(number) -> 출력(string)
  // 외부 상태 의존성 0%
  return `${value.toLocaleString()}원`;
};

/**
 * 숫자를 ₩ 표시가 있는 통화 형식으로 변환합니다. (기존 코드의 비관리자용)
 */
export const formatCurrencyWithSymbol = (value: number): string => {
  return `₩${value.toLocaleString()}`;
};

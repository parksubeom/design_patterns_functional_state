import { useState, useEffect } from "react";

/**
 * 로컬 스토리지와 동기화되는 상태를 관리하는 커스텀 훅 (Shared Action)
 * @param key 로컬 스토리지 키
 * @param initialValue 초기값
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  // 1. 초기화 (Read Action): 마운트 시 한 번만 실행
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 2. 동기화 (Write Action): 값이 변경될 때마다 실행
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};
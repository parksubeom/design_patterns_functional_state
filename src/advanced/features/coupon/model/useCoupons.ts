import {useCallback } from "react";
import { Coupon } from "../../../entities/coupon/model/types";
import { useLocalStorage } from "../../../shared/lib/useLocalStorage";
import { useNotificationStore } from "../../../shared/lib/notificationStore"; // ✅ Store Import

const initialCoupons: Coupon[] = [
  { name: "5000원 할인", code: "AMOUNT5000", discountType: "amount", discountValue: 5000 },
  { name: "10% 할인", code: "PERCENT10", discountType: "percentage", discountValue: 10 },
];

export const useCoupons = () => {
  const [coupons, setCoupons] = useLocalStorage<Coupon[]>("coupons", initialCoupons);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const addCoupon = useCallback(
    (newCoupon: Coupon) => {
      // coupons 상태를 바로 참조하면 stale closure 문제가 생길 수 있으므로
      // 여기서는 간단히 처리하지만, 실제로는 setCoupons 내부에서 검사하거나 refs를 써야 안전함.
      // 다만 useLocalStorage가 매번 갱신되므로 현재 구조에선 괜찮음.
      const existingCoupon = coupons.find((c) => c.code === newCoupon.code);
      if (existingCoupon) {
        addNotification("이미 존재하는 쿠폰 코드입니다.", "error");
        return;
      }
      setCoupons((prev) => [...prev, newCoupon]);
      addNotification("쿠폰이 추가되었습니다.", "success");
    },
    [coupons, addNotification, setCoupons]
  );

  const deleteCoupon = useCallback(
    (couponCode: string) => {
      setCoupons((prev) => prev.filter((c) => c.code !== couponCode));
      addNotification("쿠폰이 삭제되었습니다.", "success");
    },
    [addNotification, setCoupons]
  );

  return { coupons, addCoupon, deleteCoupon };
};
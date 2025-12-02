import { CartItem } from "../../../entities/cart/model/types";
import { Coupon } from "../../../entities/coupon/model/types";

/**
 * 장바구니 아이템에 적용 가능한 최대 할인율을 계산합니다.
 * (대량 구매 로직 포함)
 */
export const getMaxApplicableDiscount = (
  item: CartItem,
  cart: CartItem[]
): number => {
  const { discounts } = item.product;
  const { quantity } = item;

  // 1. 상품 자체의 수량 할인 확인
  const baseDiscount = discounts.reduce((maxDiscount, discount) => {
    return quantity >= discount.quantity && discount.rate > maxDiscount
      ? discount.rate
      : maxDiscount;
  }, 0);

  // 2. 장바구니 전체를 뒤져서 대량 구매 여부 확인 (비즈니스 룰)
  const hasBulkPurchase = cart.some((cartItem) => cartItem.quantity >= 10);

  if (hasBulkPurchase) {
    return Math.min(baseDiscount + 0.05, 0.5); // 추가 5% 할인, 최대 50%
  }

  return baseDiscount;
};

/**
 * 장바구니 아이템 하나의 최종 가격을 계산합니다.
 */
export const calculateItemTotal = (
  item: CartItem,
  cart: CartItem[]
): number => {
  const { price } = item.product;
  const { quantity } = item;
  const discount = getMaxApplicableDiscount(item, cart);

  return Math.round(price * quantity * (1 - discount));
};

/**
 * 장바구니 전체 금액(할인 전/후)을 계산합니다.
 */
export const calculateCartTotal = (
  cart: CartItem[],
  selectedCoupon: Coupon | null
) => {
  let totalBeforeDiscount = 0;
  let totalAfterDiscount = 0;

  cart.forEach((item) => {
    const itemPrice = item.product.price * item.quantity;
    totalBeforeDiscount += itemPrice;
    // calculateItemTotal을 재사용
    totalAfterDiscount += calculateItemTotal(item, cart);
  });

  // 쿠폰 적용
  if (selectedCoupon) {
    if (selectedCoupon.discountType === "amount") {
      totalAfterDiscount = Math.max(
        0,
        totalAfterDiscount - selectedCoupon.discountValue
      );
    } else {
      totalAfterDiscount = Math.round(
        totalAfterDiscount * (1 - selectedCoupon.discountValue / 100)
      );
    }
  }

  return {
    totalBeforeDiscount: Math.round(totalBeforeDiscount),
    totalAfterDiscount: Math.round(totalAfterDiscount),
  };
};

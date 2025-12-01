import { CartItem, Product } from "../../../shared/types/types";

/**
 * 상품의 재고가 얼마나 남았는지 계산합니다.
 * @param product 확인할 상품
 * @param cart 현재 장바구니 상태 (전체 재고 확인을 위해 필요)
 */
export const getRemainingStock = (
  product: Product,
  cart: CartItem[]
): number => {
  const cartItem = cart.find((item) => item.product.id === product.id);
  const remaining = product.stock - (cartItem?.quantity || 0);

  return remaining;
};

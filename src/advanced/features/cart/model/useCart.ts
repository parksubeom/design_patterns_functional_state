import { useState, useCallback } from "react";

// Shared
import { useLocalStorage } from "../../../shared/lib/useLocalStorage";

// Entities (Model)
import { CartItem } from "../../../entities/cart/model/types";
import { ProductWithUI } from "../../../entities/product/model/types";
import { Coupon } from "../../../entities/coupon/model/types";

// Entities (Lib - Pure Functions)
import { getRemainingStock } from "../../../entities/product/lib";
import { calculateCartTotal } from "../../../entities/cart/lib";
import { canApplyCoupon } from "../../../entities/coupon/lib";

/**
 * 장바구니 관련 상태와 액션을 관리하는 커스텀 훅
 * @param products 전체 상품 목록 (재고 확인용)
 * @param addNotification 알림 메시지 출력 함수
 */
export const useCart = (
  products: ProductWithUI[],
  addNotification: (msg: string, type?: "error" | "success" | "warning") => void
) => {
  // 장바구니 상태 (LocalStorage 연동)
  const [cart, setCart] = useLocalStorage<CartItem[]>("cart", []);

  // 선택된 쿠폰 상태
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  /**
   * 상품을 장바구니에 추가합니다.
   * 재고가 부족하거나 이미 담긴 수량이 재고를 초과하면 에러 알림을 보냅니다.
   */
  const addToCart = useCallback(
    (product: ProductWithUI) => {
      const remaining = getRemainingStock(product, cart);
      if (remaining <= 0) {
        addNotification("재고가 부족합니다!", "error");
        return;
      }

      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        
        if (existing) {
          if (existing.quantity + 1 > product.stock) {
            addNotification(
              `재고는 ${product.stock}개까지만 있습니다.`,
              "error"
            );
            return prev;
          }
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        
        return [...prev, { product, quantity: 1 }];
      });

      addNotification("장바구니에 담았습니다", "success");
    },
    [cart, addNotification]
  );

  /**
   * 장바구니에서 특정 상품을 제거합니다.
   */
  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  /**
   * 장바구니 아이템의 수량을 변경합니다.
   * 수량이 0 이하가 되면 제거하고, 재고를 초과하면 에러 알림을 보냅니다.
   */
  const updateQuantity = useCallback(
    (productId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
      }

      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const maxStock = product.stock;
      if (newQuantity > maxStock) {
        addNotification(`재고는 ${maxStock}개까지만 있습니다.`, "error");
        return;
      }

      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    },
    [products, removeFromCart, addNotification]
  );

  /**
   * 쿠폰을 적용합니다.
   * 쿠폰 적용 조건을 만족하지 못하면 에러 알림을 보냅니다.
   */
  const applyCoupon = useCallback(
    (coupon: Coupon) => {
      const { totalAfterDiscount } = calculateCartTotal(cart, null);
      
      if (!canApplyCoupon(coupon, totalAfterDiscount)) {
        addNotification(
          "percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.",
          "error"
        );
        return;
      }

      setSelectedCoupon(coupon);
      addNotification("쿠폰이 적용되었습니다.", "success");
    },
    [cart, addNotification]
  );

  /**
   * 주문을 완료하고 장바구니와 쿠폰 상태를 초기화합니다.
   */
  const completeOrder = useCallback(() => {
    const orderNumber = `ORD-${Date.now()}`;
    addNotification(
      `주문이 완료되었습니다. 주문번호: ${orderNumber}`,
      "success"
    );
    setCart([]);
    setSelectedCoupon(null);
  }, [addNotification]);

  return {
    cart,
    selectedCoupon,
    setSelectedCoupon,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    completeOrder,
  };
};
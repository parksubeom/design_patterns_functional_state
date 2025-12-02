import { useState, useEffect, useCallback } from "react";
import { CartItem, ProductWithUI, Coupon } from "../../../shared/model/types";
import { getRemainingStock } from "../../../entities/product/lib";
import { calculateCartTotal } from "../../../entities/cart/lib";
import { useLocalStorage } from "../../../shared/lib/useLocalStorage";

export const useCart = (
  products: ProductWithUI[],
  addNotification: (msg: string, type?: "error" | "success" | "warning") => void
) => {
    const [cart, setCart] = useLocalStorage<CartItem[]>("cart", []);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

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
            addNotification(`재고는 ${product.stock}개까지만 있습니다.`, "error");
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

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

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
          item.product.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    },
    [products, removeFromCart, addNotification]
  );

  const applyCoupon = useCallback(
    (coupon: Coupon) => {
      const { totalAfterDiscount } = calculateCartTotal(cart, null);
      if (totalAfterDiscount < 10000 && coupon.discountType === "percentage") {
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

  const completeOrder = useCallback(() => {
    const orderNumber = `ORD-${Date.now()}`;
    addNotification(`주문이 완료되었습니다. 주문번호: ${orderNumber}`, "success");
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
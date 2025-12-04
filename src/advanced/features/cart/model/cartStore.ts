import { create } from "zustand";

// Shared (Store)
import { useNotificationStore } from "../../../shared/lib/notificationStore";

// Entities (Model - types)
import { CartItem } from "../../../entities/cart/model/types";
import { ProductWithUI } from "../../../entities/product/model/types";
import { Coupon } from "../../../entities/coupon/model/types";

// Entities (Lib - Pure Functions)
import { getRemainingStock } from "../../../entities/product/lib";
import { calculateCartTotal } from "../../../entities/cart/lib";
import { canApplyCoupon } from "../../../entities/coupon/lib";

interface CartState {
  cart: CartItem[];
  selectedCoupon: Coupon | null;

  // Actions
  addToCart: (product: ProductWithUI) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number, products: ProductWithUI[]) => void;
  applyCoupon: (coupon: Coupon) => void;
  setSelectedCoupon: (coupon: Coupon | null) => void;
  completeOrder: () => void;
}

// ✅ persist 미들웨어 제거: 순수 메모리 저장소로 변경
export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  selectedCoupon: null,

  /**
   * 상품을 장바구니에 추가합니다.
   */
  addToCart: (product: ProductWithUI) => {
    const { cart } = get();
    const { addNotification } = useNotificationStore.getState();

    const remaining = getRemainingStock(product, cart);
    if (remaining <= 0) {
      addNotification("재고가 부족합니다!", "error");
      return;
    }

    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.quantity + 1 > product.stock) {
        addNotification(`재고는 ${product.stock}개까지만 있습니다.`, "error");
        return;
      }
      
      set({
        cart: cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ cart: [...cart, { product, quantity: 1 }] });
    }

    addNotification("장바구니에 담았습니다", "success");
  },

  /**
   * 장바구니에서 상품을 제거합니다.
   */
  removeFromCart: (productId: string) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    }));
  },

  /**
   * 수량을 업데이트합니다.
   */
  updateQuantity: (productId: string, newQuantity: number, products: ProductWithUI[]) => {
    const { removeFromCart } = get();
    const { addNotification } = useNotificationStore.getState();

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

    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ),
    }));
  },

  /**
   * 쿠폰을 적용합니다.
   */
  applyCoupon: (coupon: Coupon) => {
    const { cart } = get();
    const { addNotification } = useNotificationStore.getState();

    const { totalAfterDiscount } = calculateCartTotal(cart, null);

    if (!canApplyCoupon(coupon, totalAfterDiscount)) {
      addNotification(
        "percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.",
        "error"
      );
      return;
    }

    set({ selectedCoupon: coupon });
    addNotification("쿠폰이 적용되었습니다.", "success");
  },

  /**
   * 쿠폰 선택 상태를 직접 변경합니다. (해제 등)
   */
  setSelectedCoupon: (coupon: Coupon | null) => {
    set({ selectedCoupon: coupon });
  },

  /**
   * 주문을 완료하고 장바구니를 비웁니다.
   */
  completeOrder: () => {
    const { addNotification } = useNotificationStore.getState();
    // crypto.randomUUID()를 사용하여 고유한 주문번호 생성 (키 중복 방지)
    const orderNumber = `ORD-${crypto.randomUUID().slice(0, 8)}`;
    
    addNotification(
      `주문이 완료되었습니다. 주문번호: ${orderNumber}`,
      "success"
    );
    
    set({ cart: [], selectedCoupon: null });
  },
}));
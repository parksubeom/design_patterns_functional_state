import { useProducts } from "../product/model/useProducts";
import { useCoupons } from "../coupon/model/useCoupons";
import { useCart } from "../cart/model/useCart";
import { useNotificationSystem } from "../../shared/lib/useNotificationSystem";

export const useShop = () => {
  // 1. 알림 시스템
  const { notifications, addNotification, removeNotification } = useNotificationSystem();

  // 2. 도메인 훅 연결 (의존성 주입 해결)
  const productLogic = useProducts();
  const couponLogic = useCoupons();
  const cartLogic = useCart(productLogic.products);

  return {
    addNotification,
    notifications,
    removeNotification,
    productLogic, // { products, addProduct, ... }
    couponLogic,  // { coupons, addCoupon, ... }
    cartLogic,    // { cart, addToCart, ... }
  };
};
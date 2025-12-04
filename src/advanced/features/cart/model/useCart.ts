import { useCartStore } from "./cartStore"; // ✅ 스토어 임포트
import { ProductWithUI } from "../../../entities/product/model/types";

export const useCart = (products: ProductWithUI[]) => {
  const cartStore = useCartStore();

  return {
    cart: cartStore.cart,
    selectedCoupon: cartStore.selectedCoupon,
    // Actions
    addToCart: cartStore.addToCart,
    removeFromCart: cartStore.removeFromCart,
    applyCoupon: cartStore.applyCoupon,
    setSelectedCoupon: cartStore.setSelectedCoupon,
    completeOrder: cartStore.completeOrder,
    
    // updateQuantity는 products 인자가 필요하므로 래핑
    updateQuantity: (productId: string, newQuantity: number) => 
      cartStore.updateQuantity(productId, newQuantity, products)
  };
};
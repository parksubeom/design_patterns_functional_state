import { useState, useEffect } from "react";

// Shared Store
import { useNotificationStore } from "./shared/lib/notificationStore";
import { useCartStore } from "./features/cart/model/cartStore";

// Shared UI & Lib
import { NotificationSystem } from "./shared/ui/NotificationSystem";
import { useDebounce } from "./shared/lib/useDebounce";

// Widgets
import { Header } from "./widgets/Header/ui";
import { ProductList } from "./widgets/ProductList/ui";
import { CartSidebar } from "./widgets/CartSidebar/ui";
import { AdminDashboard } from "./widgets/AdminDashboard/ui";

// Feature Hooks
import { useProducts } from "./features/product/model/useProducts";
import { useCoupons } from "./features/coupon/model/useCoupons";
import { useCart } from "./features/cart/model/useCart";

const App = () => {
  // --------------------------------------------------------------------------
  // 1. Global State Connection
  // --------------------------------------------------------------------------
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    // 1. 알림 초기화 (테스트 격리)
    useNotificationStore.setState({ notifications: [] });

    // 2. 장바구니 로드 (Hydration)
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        useCartStore.setState({ cart: parsedCart });
      } catch {
        useCartStore.setState({ cart: [] });
      }
    } else {
      // 중요: 저장된 게 없으면 빈 배열로 초기화 (이전 테스트 잔재 삭제 효과)
      useCartStore.setState({ cart: [] });
    }

    // 3. 장바구니 변경 구독 (Subscription) -> 로컬스토리지 저장
    const unsubscribe = useCartStore.subscribe((state) => {
      localStorage.setItem("cart", JSON.stringify(state.cart));
    });

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------------------------------
  // 2. Feature Hooks
  // --------------------------------------------------------------------------
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { coupons, addCoupon, deleteCoupon } = useCoupons();
  const {
    cart,
    selectedCoupon,
    setSelectedCoupon,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    completeOrder,
  } = useCart(products);

  // --------------------------------------------------------------------------
  // 3. UI State & Logic
  // --------------------------------------------------------------------------
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const filteredProducts = debouncedSearchTerm
    ? products.filter((product) =>
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      )
    : products;

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationSystem />

      <Header
        cart={cart}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminDashboard
            products={products}
            coupons={coupons}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onAddCoupon={addCoupon}
            onDeleteCoupon={deleteCoupon}
            onNotification={addNotification}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ProductList
                products={filteredProducts}
                totalCount={products.length}
                cart={cart}
                onAddToCart={addToCart}
                searchTerm={debouncedSearchTerm}
              />
            </div>

            <div className="lg:col-span-1">
              <CartSidebar
                cart={cart}
                coupons={coupons}
                selectedCoupon={selectedCoupon}
                onUpdateQuantity={updateQuantity}
                onRemoveFromCart={removeFromCart}
                onApplyCoupon={applyCoupon}
                onCompleteOrder={completeOrder}
                onCouponSelected={setSelectedCoupon}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
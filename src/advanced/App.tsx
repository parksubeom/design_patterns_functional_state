import { useState, useEffect } from "react";

// Shared Store
import { useNotificationStore } from "./shared/lib/notificationStore";
// Feature Stores (동기화용)
import { useCartStore } from "./features/cart/model/cartStore";
import { useProductStore } from "./features/product/model/productStore";
import { useCouponStore } from "./features/coupon/model/couponStore";

// Shared UI & Lib
import { NotificationSystem } from "./shared/ui/NotificationSystem";
import { useDebounce } from "./shared/lib/useDebounce";

// Widgets
import { Header } from "./widgets/Header/ui";
import { ProductList } from "./widgets/ProductList/ui";
import { CartSidebar } from "./widgets/CartSidebar/ui";
import { AdminDashboard } from "./widgets/AdminDashboard/ui";

// Feature Hooks (Selector)
import { useProducts } from "./features/product/model/useProducts";
import { useCoupons } from "./features/coupon/model/useCoupons";
import { useCart } from "./features/cart/model/useCart";

const initialProducts = [
  {
    id: "p1",
    name: "상품1",
    price: 10000,
    stock: 20,
    discounts: [
      { quantity: 10, rate: 0.1 },
      { quantity: 20, rate: 0.2 },
    ],
    description: "최고급 품질의 프리미엄 상품입니다.",
  },
  {
    id: "p2",
    name: "상품2",
    price: 20000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.15 }],
    description: "다양한 기능을 갖춘 실용적인 상품입니다.",
    isRecommended: true,
  },
  {
    id: "p3",
    name: "상품3",
    price: 30000,
    stock: 20,
    discounts: [
      { quantity: 10, rate: 0.2 },
      { quantity: 30, rate: 0.25 },
    ],
    description: "대용량과 고성능을 자랑하는 상품입니다.",
  },
];
const initialCoupons = [
  {
    name: "5000원 할인",
    code: "AMOUNT5000",
    discountType: "amount",
    discountValue: 5000,
  },
  {
    name: "10% 할인",
    code: "PERCENT10",
    discountType: "percentage",
    discountValue: 10,
  },
];

const App = () => {
  // --------------------------------------------------------------------------
  // 2. Data Synchronization (LocalStorage <-> Zustand)
  // --------------------------------------------------------------------------
  useEffect(() => {
    // (1) 초기화: 알림 등 휘발성 데이터 비우기 (테스트 격리)
    useNotificationStore.setState({ notifications: [] });

    // (2) 로드 (Hydration): 로컬스토리지 -> 스토어
    const hydrateStore = <T,>(
      key: string,
      initial: T,
      setter: (data: T) => void
    ) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setter(JSON.parse(saved));
        } catch (e) {
          console.error(`Failed to parse ${key}`, e);
          setter(initial);
        }
      } else {
        setter(initial);
      }
    };

    // 각 스토어 초기화
    hydrateStore(
      "products",
      initialProducts,
      useProductStore.getState().setProducts
    );
    hydrateStore(
      "coupons",
      initialCoupons as any,
      useCouponStore.getState().setCoupons
    ); // as any는 타입 호환성 때문일 수 있음
    hydrateStore("cart", [], (cart) => useCartStore.setState({ cart })); // Cart는 별도 setter가 없다면 setState 사용

    // (3) 구독 (Subscription): 스토어 -> 로컬스토리지
    const unsubs = [
      useProductStore.subscribe((state) =>
        localStorage.setItem("products", JSON.stringify(state.products))
      ),
      useCouponStore.subscribe((state) =>
        localStorage.setItem("coupons", JSON.stringify(state.coupons))
      ),
      useCartStore.subscribe((state) =>
        localStorage.setItem("cart", JSON.stringify(state.cart))
      ),
    ];

    // Cleanup: 구독 해제
    return () => unsubs.forEach((fn) => fn());
  }, []);

  // --------------------------------------------------------------------------
  // 3. Feature Hooks (Business Logic)
  // --------------------------------------------------------------------------
  const { products } = useProducts();
  const { coupons } = useCoupons();
  const {
    cart,
    selectedCoupon,
    setSelectedCoupon,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    completeOrder,
  } = useCart();

  // --------------------------------------------------------------------------
  // 4. UI State & Logic
  // --------------------------------------------------------------------------
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const filteredProducts = debouncedSearchTerm
    ? products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase()))
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
          <AdminDashboard />
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

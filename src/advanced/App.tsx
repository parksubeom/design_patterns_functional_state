import { useState, useEffect } from "react";

// Shared Store
import { useNotificationStore } from "./shared/lib/notificationStore";

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
  const addNotification = useNotificationStore((state) => state.addNotification);
  useEffect(() => {
    useNotificationStore.setState({ notifications: [] });
  }, []);

  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { coupons, addCoupon, deleteCoupon } = useCoupons();

  //useCart는 이제 인자 없이(상품 목록만) 호출
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
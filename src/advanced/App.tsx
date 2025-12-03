import { useState } from "react";
// Widgets
import { Header } from "./widgets/Header/ui";
import { ProductList } from "./widgets/ProductList/ui";
import { CartSidebar } from "./widgets/CartSidebar/ui";
import { AdminDashboard } from "./widgets/AdminDashboard/ui";
import { NotificationSystem } from "./shared/ui/NotificationSystem";
// Hooks
import { useShop } from "./features/app/useShop";
import { useProductFilter } from "./features/product/model/useProductFilter";

const App = () => {
  // 1. Facade Hook에서 모든 로직과 상태를 가져옴
  const { 
    notifications, 
    removeNotification, 
    addNotification, // ✅ 여기서 직접 꺼내야 합니다!
    productLogic, 
    couponLogic, 
    cartLogic 
  } = useShop();

  // 2. 검색 필터링 로직
  const { searchTerm, setSearchTerm, filteredProducts } = useProductFilter(productLogic.products);

  // 3. 관리자 모드 상태
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationSystem
        notifications={notifications}
        onClose={removeNotification}
      />

      <Header
        cart={cartLogic.cart}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminDashboard
            products={productLogic.products}
            coupons={couponLogic.coupons}
            onAddProduct={productLogic.addProduct}
            onUpdateProduct={productLogic.updateProduct}
            onDeleteProduct={productLogic.deleteProduct}
            onAddCoupon={couponLogic.addCoupon}
            onDeleteCoupon={couponLogic.deleteCoupon}
            onNotification={addNotification} 
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ProductList
                products={filteredProducts}
                totalCount={productLogic.products.length}
                cart={cartLogic.cart}
                onAddToCart={cartLogic.addToCart}
                searchTerm={searchTerm}
              />
            </div>
            <div className="lg:col-span-1">
              <CartSidebar
                cart={cartLogic.cart}
                coupons={couponLogic.coupons}
                selectedCoupon={cartLogic.selectedCoupon}
                onUpdateQuantity={cartLogic.updateQuantity}
                onRemoveFromCart={cartLogic.removeFromCart}
                onApplyCoupon={cartLogic.applyCoupon}
                onCompleteOrder={cartLogic.completeOrder}
                onCouponSelected={cartLogic.setSelectedCoupon}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
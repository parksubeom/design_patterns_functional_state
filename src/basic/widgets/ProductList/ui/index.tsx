import { ProductWithUI, CartItem } from "../../../shared/types/types";
import { ProductCard } from "../../../entities/product/ui/ProductCard";

interface Props {
  // 화면에 보여줄 목록 (검색 필터링된 결과)
  products: ProductWithUI[];

  // 전체 상품 개수 (헤더 표시용: '총 5개 상품')
  totalCount: number;

  // 재고 확인용
  cart: CartItem[];

  // 액션
  onAddToCart: (product: ProductWithUI) => void;

  // 검색어 (결과 없음 메시지용)
  searchTerm: string;
}

export const ProductList = ({
  products,
  totalCount,
  cart,
  onAddToCart,
  searchTerm,
}: Props) => {
  return (
    <section>
      {/* 위젯 헤더 */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">전체 상품</h2>
        <div className="text-sm text-gray-600">총 {totalCount}개 상품</div>
      </div>

      {/* 검색 결과 없음 처리 */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            "{searchTerm}"에 대한 검색 결과가 없습니다.
          </p>
        </div>
      ) : (
        // 상품 목록
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cart={cart}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
};

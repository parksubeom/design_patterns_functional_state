import { FormEvent } from "react";

// Shared
import { ProductWithUI } from "../../../../entities/product/model/types";
import { useNotificationStore } from "../../../../shared/lib/notificationStore";

// Features (Model)
import { useProductForm } from "../useProductForm";

interface Props {
  initialData?: ProductWithUI | null;
  onSubmit: (product: ProductWithUI) => void;
  onCancel: () => void;
}

/**
 * 상품 추가/수정을 위한 폼 UI 컴포넌트
 */
export const ProductManagementForm = ({
  initialData,
  onSubmit,
  onCancel,
}: Props) => {

  const addNotification = useNotificationStore((state) => state.addNotification);
  // Logic을 Hook으로 위임
  const {
    productForm,
    handleChange,
    handleNumberChange,
    handleNumberBlur,
    addDiscount,
    removeDiscount,
    updateDiscount,
  } = useProductForm({ initialData, onNotification: addNotification });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(productForm);
  };

  const isEditMode = !!initialData;

  return (
    <div className="p-6 border-t border-gray-200 bg-gray-50">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {isEditMode ? "상품 수정" : "새 상품 추가"}
        </h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 상품명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상품명
            </label>
            <input
              type="text"
              value={productForm.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <input
              type="text"
              value={productForm.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
            />
          </div>

          {/* 가격 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              가격
            </label>
            <input
              type="text"
              value={productForm.price === 0 ? "" : productForm.price}
              onChange={(e) => handleNumberChange("price", e.target.value)}
              onBlur={(e) => handleNumberBlur("price", parseInt(e.target.value) || 0, "가격")}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
              placeholder="숫자만 입력"
              required
            />
          </div>

          {/* 재고 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              재고
            </label>
            <input
              type="text"
              value={productForm.stock === 0 ? "" : productForm.stock}
              onChange={(e) => handleNumberChange("stock", e.target.value)}
              onBlur={(e) => handleNumberBlur("stock", parseInt(e.target.value) || 0, "재고")}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
              placeholder="숫자만 입력"
              required
            />
          </div>

          {/* 추천 상품 체크박스 */}
          <div className="sm:col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={productForm.isRecommended}
                onChange={(e) => handleChange("isRecommended", e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                추천 상품(BEST)으로 등록
              </span>
            </label>
          </div>
        </div>

        {/* 할인 정책 섹션 */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            할인 정책
          </label>
          <div className="space-y-2">
            {productForm.discounts.map((discount, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-50 p-2 rounded"
              >
                <input
                  type="number"
                  value={discount.quantity}
                  onChange={(e) => updateDiscount(index, "quantity", parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border rounded"
                  placeholder="수량"
                />
                <span className="text-sm">개 이상 구매 시</span>
                <input
                  type="number"
                  value={discount.rate * 100}
                  onChange={(e) => updateDiscount(index, "rate", (parseInt(e.target.value) || 0) / 100)}
                  className="w-16 px-2 py-1 border rounded"
                  placeholder="%"
                />
                <span className="text-sm">% 할인</span>
                <button
                  type="button"
                  onClick={() => removeDiscount(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addDiscount}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              + 할인 추가
            </button>
          </div>
        </div>

        {/* 폼 버튼 */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            {isEditMode ? "수정" : "추가"}
          </button>
        </div>
      </form>
    </div>
  );
};
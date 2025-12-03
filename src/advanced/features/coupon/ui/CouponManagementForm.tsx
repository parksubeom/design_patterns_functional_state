import { useState, FormEvent } from "react";

// Entities (Model)
import { Coupon } from "../../../entities/coupon/model/types";

interface Props {
  /** 쿠폰 추가 확정 시 호출되는 콜백 */
  onAddCoupon: (coupon: Coupon) => void;
  /** 취소 버튼 클릭 시 호출되는 콜백 */
  onCancel: () => void;
  /** 유효성 검사 실패 등의 알림을 띄우기 위한 콜백 (Dependency Injection) */
  onNotification: (message: string, type?: "error" | "success" | "warning") => void;
}

/**
 * 쿠폰 생성을 위한 폼 UI 컴포넌트
 * 내부적으로 폼 상태를 관리하며, 입력 값에 대한 유효성 검사(Validation)를 수행합니다.
 */
export const CouponManagementForm = ({
  onAddCoupon,
  onCancel,
  onNotification,
}: Props) => {
  // --------------------------------------------------------------------------
  // Local State
  // --------------------------------------------------------------------------
  const [couponForm, setCouponForm] = useState<Coupon>({
    name: "",
    code: "",
    discountType: "amount",
    discountValue: 0,
  });

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  /**
   * 폼 제출 핸들러
   * 데이터를 부모에게 전달하고 폼을 초기화합니다.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAddCoupon(couponForm);
    setCouponForm({
      name: "",
      code: "",
      discountType: "amount",
      discountValue: 0,
    });
  };

  /**
   * 할인 금액/율 입력 필드의 Blur 핸들러
   * 입력된 값의 유효성을 검사하고, 범위를 벗어난 경우 알림을 띄우고 값을 보정합니다.
   */
  const handleDiscountBlur = () => {
    const value = couponForm.discountValue;

    if (couponForm.discountType === "percentage") {
      if (value > 100) {
        onNotification("할인율은 100%를 초과할 수 없습니다", "error");
        setCouponForm((prev) => ({ ...prev, discountValue: 100 }));
      } else if (value < 0) {
        setCouponForm((prev) => ({ ...prev, discountValue: 0 }));
      }
    } else {
      // 정액 할인일 경우
      if (value > 100000) {
        onNotification("할인 금액은 100,000원을 초과할 수 없습니다", "error");
        setCouponForm((prev) => ({ ...prev, discountValue: 100000 }));
      } else if (value < 0) {
        setCouponForm((prev) => ({ ...prev, discountValue: 0 }));
      }
    }
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-md font-medium text-gray-900">새 쿠폰 생성</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 쿠폰명 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              쿠폰명
            </label>
            <input
              type="text"
              value={couponForm.name}
              onChange={(e) =>
                setCouponForm({ ...couponForm, name: e.target.value })
              }
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border text-sm"
              placeholder="신규 가입 쿠폰"
              required
            />
          </div>

          {/* 쿠폰 코드 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              쿠폰 코드
            </label>
            <input
              type="text"
              value={couponForm.code}
              onChange={(e) =>
                setCouponForm({
                  ...couponForm,
                  code: e.target.value.toUpperCase(),
                })
              }
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border text-sm font-mono"
              placeholder="WELCOME2024"
              required
            />
          </div>

          {/* 할인 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              할인 타입
            </label>
            <select
              value={couponForm.discountType}
              onChange={(e) =>
                setCouponForm({
                  ...couponForm,
                  discountType: e.target.value as "amount" | "percentage",
                })
              }
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border text-sm"
            >
              <option value="amount">정액 할인</option>
              <option value="percentage">정률 할인</option>
            </select>
          </div>

          {/* 할인 값 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {couponForm.discountType === "amount" ? "할인 금액" : "할인율(%)"}
            </label>
            <input
              type="text"
              value={
                couponForm.discountValue === 0 ? "" : couponForm.discountValue
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  setCouponForm({
                    ...couponForm,
                    discountValue: val === "" ? 0 : parseInt(val),
                  });
                }
              }}
              onBlur={handleDiscountBlur}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border text-sm"
              placeholder={
                couponForm.discountType === "amount" ? "5000" : "10"
              }
              required
            />
          </div>
        </div>

        {/* 액션 버튼 */}
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
            쿠폰 생성
          </button>
        </div>
      </form>
    </div>
  );
};
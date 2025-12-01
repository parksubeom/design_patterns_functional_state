import { CartItem } from "../../../shared/types/types";

interface Props {
  // 1. 데이터 (Data)
  cart: CartItem[];
  isAdmin: boolean;
  searchTerm: string;

  // 2. 액션 (Event Handlers) -> 부모에게 위임
  onToggleAdmin: () => void;
  onSearchChange: (value: string) => void;
}

export const Header = ({
  cart,
  isAdmin,
  onToggleAdmin,
  searchTerm,
  onSearchChange,
}: Props) => {
  // ✅ UI 로직: 장바구니 총 수량 계산
  // (이 로직은 '장바구니' 도메인에 가깝지만, 배지 표시용 UI 로직이므로 여기서 계산해도 무방합니다.)
  // 추후 features/cart/lib 등으로 이동할 수도 있습니다.
  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-1">
            <h1 className="text-xl font-semibold text-gray-800">SHOP</h1>

            {/* 검색창 영역 */}
            {!isAdmin && (
              <div className="ml-8 flex-1 max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  // 이벤트 핸들러를 Props로 연결
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="상품 검색..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          <nav className="flex items-center space-x-4">
            {/* 관리자 토글 버튼 */}
            <button
              onClick={onToggleAdmin}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                isAdmin
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {isAdmin ? "쇼핑몰로 돌아가기" : "관리자 페이지로"}
            </button>

            {/* 장바구니 아이콘 및 배지 */}
            {!isAdmin && (
              <div className="relative">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {/* 수량이 있을 때만 배지 표시 */}
                {totalItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItemCount}
                  </span>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

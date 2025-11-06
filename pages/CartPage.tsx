

import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Updated imports for v6/v7
import { useCart } from '../hooks/useCart';
import Button from '../components/ui/Button';
import { CartItem, CustomPCBuildCartItem } from '../types';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate(); // Changed from useHistory

  const handleCheckout = () => {
    navigate('/checkout'); // Changed from history.push
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <i className="fas fa-shopping-cart text-6xl text-textSubtle mb-6"></i>
        <h1 className="text-3xl font-semibold text-textBase mb-4">Giỏ hàng của bạn đang trống</h1>
        <p className="text-textMuted mb-6">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!</p>
        <Link to="/shop">
          <Button variant="primary" size="lg">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-textBase mb-8 text-center">Giỏ Hàng Của Bạn</h1>
      <div className="bg-bgBase shadow-xl rounded-lg p-4 sm:p-6 border border-borderDefault">
        {cart.map((item) => {
          const isCustomBuild = 'isCustomBuild' in item && item.isCustomBuild;

          return (
            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b border-borderDefault last:border-b-0">
              <div className="flex items-start mb-4 sm:mb-0 w-full sm:w-3/5 md:w-2/5">
                <img
                  src={(item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : `https://picsum.photos/seed/${item.id}/100/100`)}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md mr-4 border border-borderDefault"
                />
                <div className="flex-grow">
                  <Link to={isCustomBuild ? `/pc-builder?load=${item.id}` : `/product/${item.id}`} className="font-semibold text-textBase hover:text-primary text-lg block mb-1">
                    {item.name}
                  </Link>
                  {!isCustomBuild && <p className="text-sm text-textMuted">{item.category}</p>}
                  {/* FIX: Cast `item` to `CustomPCBuildCartItem` to access `buildComponents`. */}
                  {isCustomBuild && (item as CustomPCBuildCartItem).buildComponents && (
                    <div className="text-xs text-textMuted mt-1 space-y-0.5">
                      <p className="font-medium text-textSubtle">Chi tiết cấu hình:</p>
                      {/* FIX: Cast `item` to `CustomPCBuildCartItem` to access `buildComponents`. */}
                      {Object.entries((item as CustomPCBuildCartItem).buildComponents).map(([type, comp]) => {
                        const component = comp as { name: string; price?: number };
                        return (
                        <p key={type} className="truncate" title={`${type}: ${component.name} (${(component.price || 0).toLocaleString('vi-VN')}₫)`}>
                          - {type}: {component.name}
                          {(component.price || 0) > 0 && ` (${(component.price || 0).toLocaleString('vi-VN')}₫)`}
                        </p>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between w-full sm:w-auto sm:space-x-4 md:space-x-8 mt-2 sm:mt-0">
                {!isCustomBuild && (
                  <div className="flex items-center mb-2 sm:mb-0 sm:w-28">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 border border-borderStrong text-textMuted rounded-l-md hover:bg-bgMuted"
                      disabled={item.quantity <= 1}
                      aria-label="Giảm số lượng"
                    >
                      <i className="fas fa-minus text-xs"></i>
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-10 text-center bg-white border-t border-b border-borderStrong text-textBase p-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      min="1"
                      aria-label="Số lượng"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 border border-borderStrong text-textMuted rounded-r-md hover:bg-bgMuted"
                      aria-label="Tăng số lượng"
                    >
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                  </div>
                )}
                 {isCustomBuild && (
                    <p className="text-sm text-textMuted mb-2 sm:mb-0">Số lượng: {item.quantity}</p>
                 )}
                <p className="font-semibold text-textBase w-28 text-right mb-2 sm:mb-0">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </p>
                <button onClick={() => removeFromCart(item.id)} className="text-danger-text hover:text-red-700 text-lg sm:text-xl" aria-label="Xóa khỏi giỏ hàng">
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          );
        })}

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
          <Button variant="outline" onClick={clearCart} className="mb-4 sm:mb-0 border-danger-border text-danger-text hover:bg-danger-bg">
            Xóa tất cả giỏ hàng
          </Button>
          <div className="text-right">
            <p className="text-xl font-semibold text-textBase">
              Tổng cộng: <span className="text-primary">{getTotalPrice().toLocaleString('vi-VN')}₫</span>
            </p>
            <p className="text-sm text-textMuted">Đã bao gồm VAT (nếu có)</p>
            <Button
                size="lg"
                className="mt-4 w-full sm:w-auto"
                onClick={handleCheckout}
            >
                Tiến hành thanh toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
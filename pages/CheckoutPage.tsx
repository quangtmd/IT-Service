
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Updated imports for v6/v7
import Button from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import * as Constants from '../constants.tsx';
import { CheckoutFormData, Order } from '../types';
import { MOCK_ORDERS } from '../data/mockData';

const CheckoutPage: React.FC = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { currentUser, isAuthenticated, addAdminNotification } = useAuth();
  const navigate = useNavigate(); // Changed from useHistory

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    address: '',
    email: '',
    notes: '',
  });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<CheckoutFormData>>({});
  const [submittedOrderTotal, setSubmittedOrderTotal] = useState(0);


  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setFormData(prev => ({ ...prev, email: currentUser.email, fullName: currentUser.username }));
    }
  }, [isAuthenticated, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof CheckoutFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<CheckoutFormData> = {};
    if (!formData.fullName.trim()) errors.fullName = "Vui lòng nhập họ tên.";
    if (!formData.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại.";
    else if (!/^\d{10,11}$/.test(formData.phone)) errors.phone = "Số điện thoại không hợp lệ.";
    if (!formData.address.trim()) errors.address = "Vui lòng nhập địa chỉ.";
    if (!formData.email.trim()) errors.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email không hợp lệ.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const currentOrderTotal = getTotalPrice();
    setSubmittedOrderTotal(currentOrderTotal);

    const newOrderId = `order-${Date.now()}`;
    const newOrder: Order = {
        id: newOrderId,
        customerInfo: formData,
        items: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        totalAmount: currentOrderTotal,
        orderDate: new Date().toISOString(),
        status: 'Chờ xử lý'
    };
    MOCK_ORDERS.unshift(newOrder);
    console.log("Order details:", newOrder);

    addAdminNotification(`Đơn hàng mới #${newOrderId} từ ${formData.fullName} (${formData.email}) đã được tạo với tổng giá trị ${currentOrderTotal.toLocaleString('vi-VN')}₫.`, 'success');

    setIsFormSubmitted(true);
    clearCart();
  };

  if (cart.length === 0 && !isFormSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <i className="fas fa-shopping-cart text-6xl text-textSubtle mb-6"></i>
        <h1 className="text-3xl font-semibold text-textBase mb-4">Giỏ hàng của bạn trống</h1>
        <p className="text-textMuted mb-6">Không có gì để thanh toán. Hãy thêm sản phẩm vào giỏ!</p>
        <Link to="/shop">
          <Button variant="primary" size="lg">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  if (isFormSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-lg mx-auto bg-bgBase p-8 rounded-lg shadow-xl border border-borderDefault">
          <i className="fas fa-check-circle text-6xl text-success-text mb-6"></i>
          <h1 className="text-3xl font-bold text-textBase mb-4">Đặt Hàng Thành Công!</h1>
          <p className="text-textMuted mb-6">
            Cảm ơn {formData.fullName} đã đặt hàng tại {Constants.COMPANY_NAME}.
            Đơn hàng của bạn với tổng giá trị {submittedOrderTotal.toLocaleString('vi-VN')}₫ đã được ghi nhận.
          </p>
          <p className="text-textMuted mb-8">
            Chúng tôi sẽ sớm liên hệ với bạn qua SĐT: {formData.phone} hoặc Email: {formData.email} để xác nhận và giao hàng đến địa chỉ: {formData.address}. (Đây là thông báo giả lập)
          </p>
          <div className="space-y-3 sm:space-y-0 sm:space-x-3">
            <Link to="/shop">
              <Button variant="primary" size="lg">Tiếp tục mua sắm</Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">Về trang chủ</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-textBase mb-8 text-center">Thông Tin Thanh Toán & Giao Hàng</h1>
      <div className="max-w-2xl mx-auto bg-bgBase p-6 md:p-8 rounded-lg shadow-xl border border-borderDefault">
        <form onSubmit={handleSubmitOrder} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-textMuted mb-1">Họ và tên người nhận *</label>
            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className={`w-full p-3 bg-white border ${formErrors.fullName ? 'border-danger-border' : 'border-borderStrong'} text-textBase rounded-md shadow-sm focus:ring-primary focus:border-primary placeholder:text-textSubtle`} />
            {formErrors.fullName && <p className="text-xs text-danger-text mt-1">{formErrors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-textMuted mb-1">Số điện thoại *</label>
              <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={`w-full p-3 bg-white border ${formErrors.phone ? 'border-danger-border' : 'border-borderStrong'} text-textBase rounded-md shadow-sm focus:ring-primary focus:border-primary placeholder:text-textSubtle`} />
              {formErrors.phone && <p className="text-xs text-danger-text mt-1">{formErrors.phone}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-textMuted mb-1">Email *</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={`w-full p-3 bg-white border ${formErrors.email ? 'border-danger-border' : 'border-borderStrong'} text-textBase rounded-md shadow-sm focus:ring-primary focus:border-primary placeholder:text-textSubtle`} />
              {formErrors.email && <p className="text-xs text-danger-text mt-1">{formErrors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-textMuted mb-1">Địa chỉ nhận hàng *</label>
            <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className={`w-full p-3 bg-white border ${formErrors.address ? 'border-danger-border' : 'border-borderStrong'} text-textBase rounded-md shadow-sm focus:ring-primary focus:border-primary placeholder:text-textSubtle`} />
            {formErrors.address && <p className="text-xs text-danger-text mt-1">{formErrors.address}</p>}
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-textMuted mb-1">Ghi chú (tùy chọn)</label>
            <textarea name="notes" id="notes" rows={3} value={formData.notes} onChange={handleChange} className="w-full p-3 bg-white border border-borderStrong text-textBase rounded-md shadow-sm focus:ring-primary focus:border-primary placeholder:text-textSubtle"></textarea>
          </div>

          <div className="border-t border-borderDefault pt-6 mt-6">
            <h3 className="text-lg font-semibold text-textBase mb-2">Tóm tắt đơn hàng:</h3>
            {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-textMuted py-1">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                </div>
            ))}
            <div className="flex justify-between text-xl font-bold text-textBase mt-2 pt-2 border-t border-borderDefault">
                <span>Tổng cộng:</span>
                <span className="text-primary">{getTotalPrice().toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Xác Nhận & Đặt Hàng
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;

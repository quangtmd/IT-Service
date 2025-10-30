import React, { useState, useEffect } from 'react';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import * as Constants from '../constants.tsx';
import { CheckoutFormData, Order, PaymentInfo } from '../types';
import { addOrder } from '../services/localDataService';

const CheckoutPage: React.FC = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { currentUser, isAuthenticated, addAdminNotification } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '', phone: '', address: '', email: '', notes: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<CheckoutFormData>>({});
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer'>('cod');
  const [transferOption, setTransferOption] = useState<'full' | 'deposit'>('full');
  
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'payment_details' | 'success'>('form');
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
        const total = getTotalPrice();
        let paymentDetails: any; // Using 'any' for flexibility with new schema

        if (paymentMethod === 'transfer') {
            const isDeposit = transferOption === 'deposit';
            paymentDetails = {
                method: 'Chuyển khoản ngân hàng',
                status: 'Chưa thanh toán',
                amountToPay: isDeposit ? total * Constants.DEPOSIT_PERCENTAGE : total,
            };
        } else {
            paymentDetails = { method: 'Thanh toán khi nhận hàng (COD)', status: 'Chưa thanh toán' };
        }
        
        // New payload for the backend
        const newOrderPayload = {
            userId: currentUser?.id || null,
            totalAmount: total,
            customerInfo: formData,
            shippingAddress: { address: formData.address }, // Simplified for now
            paymentDetails: paymentDetails,
            items: cart.map(item => ({ 
                productId: item.id, 
                productName: item.name, 
                quantity: item.quantity, 
                priceAtPurchase: item.price 
            })),
        };

        const createdOrder = await addOrder(newOrderPayload);

        addAdminNotification(`Đơn hàng mới #${createdOrder.id} từ ${formData.fullName} đã được tạo.`, 'success');
        setSubmittedOrder({
            ...createdOrder,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as Order);

        if (paymentMethod === 'cod') {
            clearCart();
            setCheckoutStep('success');
        } else {
            setCheckoutStep('payment_details');
        }
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        alert('Đã xảy ra lỗi không mong muốn khi tạo đơn hàng.');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleConfirmPayment = () => {
    clearCart();
    setCheckoutStep('success');
  };

  if (cart.length === 0 && checkoutStep === 'form') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <i className="fas fa-shopping-cart text-6xl text-textSubtle mb-6"></i>
        <h1 className="text-3xl font-semibold text-textBase mb-4">Giỏ hàng của bạn trống</h1>
        <p className="text-textMuted mb-6">Không có gì để thanh toán. Hãy thêm sản phẩm vào giỏ!</p>
        <ReactRouterDOM.Link to="/shop"><Button variant="primary" size="lg">Tiếp tục mua sắm</Button></ReactRouterDOM.Link>
      </div>
    );
  }

  if (checkoutStep === 'success' && submittedOrder) {
    const isCOD = (submittedOrder.paymentDetails as PaymentInfo).method === 'Thanh toán khi nhận hàng (COD)';
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-lg mx-auto bg-bgBase p-8 rounded-lg shadow-xl border border-borderDefault">
          <i className="fas fa-check-circle text-6xl text-success-text mb-6"></i>
          <h1 className="text-3xl font-bold text-textBase mb-4">Đặt Hàng Thành Công!</h1>
          <p className="text-textMuted mb-6">
            Cảm ơn {submittedOrder.customerInfo.fullName} đã đặt hàng tại {Constants.COMPANY_NAME}.
            Mã đơn hàng của bạn là <strong className="text-textBase">#{submittedOrder.id}</strong>.
          </p>
          <p className="text-textMuted mb-8">
            {isCOD 
              ? `Chúng tôi sẽ sớm liên hệ với bạn để xác nhận và giao hàng. Bạn sẽ thanh toán ${submittedOrder.totalAmount.toLocaleString('vi-VN')}₫ khi nhận hàng.`
              : `Chúng tôi sẽ kiểm tra và xác nhận thanh toán của bạn trong thời gian sớm nhất. Đơn hàng sẽ được xử lý ngay sau khi thanh toán được xác nhận.`
            }
          </p>
          <div className="space-y-3 sm:space-y-0 sm:space-x-3">
            <ReactRouterDOM.Link to="/shop"><Button variant="primary" size="lg">Tiếp tục mua sắm</Button></ReactRouterDOM.Link>
            <ReactRouterDOM.Link to="/home"><Button variant="outline" size="lg">Về trang chủ</Button></ReactRouterDOM.Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (checkoutStep === 'payment_details' && submittedOrder) {
    const paymentInfo = submittedOrder.paymentDetails as PaymentInfo;
    const amountToPay = paymentInfo.amountToPay || submittedOrder.totalAmount;
    const qrDescription = `TT DON HANG ${submittedOrder.id}`;
    const qrUrl = `https://img.vietqr.io/image/${Constants.VIETCOMBANK_ID}-${Constants.BANK_ACCOUNT_NUMBER}-print.png?amount=${amountToPay}&addInfo=${encodeURIComponent(qrDescription)}&accountName=${encodeURIComponent(Constants.BANK_ACCOUNT_NAME)}`;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto bg-bgBase p-6 md:p-8 rounded-lg shadow-xl border border-borderDefault">
          <h1 className="text-2xl font-bold text-textBase mb-4 text-center">Thông Tin Chuyển Khoản</h1>
          <p className="text-center text-textMuted mb-6">Vui lòng thực hiện chuyển khoản theo thông tin dưới đây để hoàn tất đơn hàng.</p>
          <div className="text-center mb-6">
            <img src={qrUrl} alt="Mã QR thanh toán" className="mx-auto w-56 h-56 rounded-lg border shadow-md" />
            <p className="text-sm text-textMuted mt-2">Quét mã VietQR để thanh toán nhanh</p>
          </div>
          <div className="space-y-3 text-sm bg-bgCanvas p-4 rounded-lg border border-borderDefault">
            <div className="flex justify-between"><span className="text-textMuted">Ngân hàng:</span><span className="font-semibold text-textBase">{Constants.BANK_NAME}</span></div>
            <div className="flex justify-between"><span className="text-textMuted">Chủ tài khoản:</span><span className="font-semibold text-textBase">{Constants.BANK_ACCOUNT_NAME}</span></div>
            <div className="flex justify-between"><span className="text-textMuted">Số tài khoản:</span><span className="font-semibold text-textBase">{Constants.BANK_ACCOUNT_NUMBER}</span></div>
            <div className="flex justify-between text-lg text-primary"><span className="font-semibold">Số tiền cần chuyển:</span><span className="font-bold">{amountToPay.toLocaleString('vi-VN')}₫</span></div>
            <div className="flex justify-between"><span className="text-textMuted">Nội dung chuyển khoản:</span><span className="font-semibold text-textBase">{qrDescription}</span></div>
          </div>
          <p className="text-xs text-center mt-4 text-danger-text">Lưu ý: Vui lòng ghi đúng nội dung chuyển khoản để đơn hàng được xác nhận tự động.</p>
          <Button onClick={handleConfirmPayment} size="lg" className="w-full mt-6">Tôi đã hoàn tất chuyển khoản</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-textBase mb-8 text-center">Thông Tin Thanh Toán & Giao Hàng</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-3 bg-bgBase p-6 md:p-8 rounded-lg shadow-xl border border-borderDefault">
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-textMuted mb-1">Họ và tên người nhận *</label>
              <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className={`input-style ${formErrors.fullName ? 'border-danger-border' : 'border-borderStrong'}`} />
              {formErrors.fullName && <p className="text-xs text-danger-text mt-1">{formErrors.fullName}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-textMuted mb-1">Số điện thoại *</label>
                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={`input-style ${formErrors.phone ? 'border-danger-border' : 'border-borderStrong'}`} />
                {formErrors.phone && <p className="text-xs text-danger-text mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-textMuted mb-1">Email *</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={`input-style ${formErrors.email ? 'border-danger-border' : 'border-borderStrong'}`} />
                {formErrors.email && <p className="text-xs text-danger-text mt-1">{formErrors.email}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-textMuted mb-1">Địa chỉ nhận hàng *</label>
              <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className={`input-style ${formErrors.address ? 'border-danger-border' : 'border-borderStrong'}`} />
              {formErrors.address && <p className="text-xs text-danger-text mt-1">{formErrors.address}</p>}
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-textMuted mb-1">Ghi chú (tùy chọn)</label>
              <textarea name="notes" id="notes" rows={3} value={formData.notes} onChange={handleChange} className="input-style"></textarea>
            </div>
             <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>Xác Nhận & Đặt Hàng</Button>
          </form>
        </div>
        {/* Summary Section */}
        <div className="lg:col-span-2">
           <div className="bg-bgBase p-6 rounded-lg shadow-xl border border-borderDefault sticky top-24">
             <h3 className="text-xl font-semibold text-textBase mb-4 border-b border-borderDefault pb-3">Tóm tắt đơn hàng</h3>
             <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                        <span className="text-textMuted pr-4">{item.name} <strong className="text-textBase">x {item.quantity}</strong></span>
                        <span className="font-medium text-textBase whitespace-nowrap">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                    </div>
                ))}
             </div>
             <div className="mt-4 pt-4 border-t border-borderDefault">
                <div className="flex justify-between text-xl font-bold text-textBase">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">{getTotalPrice().toLocaleString('vi-VN')}₫</span>
                </div>
             </div>
             <div className="border-t border-borderDefault pt-4 mt-4">
                <h3 className="text-lg font-semibold text-textBase mb-3">Phương thức thanh toán</h3>
                <div className="space-y-3">
                    <label htmlFor="cod" className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'bg-primary/10 border-primary' : 'border-borderDefault hover:bg-bgMuted'}`}>
                        <input type="radio" id="cod" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-4 w-4 text-primary focus:ring-primary"/>
                        <span className="ml-3 block text-sm font-medium text-textBase">Thanh toán khi nhận hàng (COD)</span>
                    </label>
                    <div className={`p-3 border rounded-lg transition-colors ${paymentMethod === 'transfer' ? 'bg-primary/10 border-primary' : 'border-borderDefault hover:bg-bgMuted'}`}>
                        <label htmlFor="transfer" className="flex items-center cursor-pointer">
                            <input type="radio" id="transfer" name="paymentMethod" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="h-4 w-4 text-primary focus:ring-primary"/>
                            <span className="ml-3 block text-sm font-medium text-textBase">Chuyển khoản ngân hàng</span>
                        </label>
                        {paymentMethod === 'transfer' && (
                            <div className="mt-3 pl-7 space-y-2 text-sm">
                                <label htmlFor="full_payment" className="flex items-center cursor-pointer text-textMuted">
                                    <input type="radio" id="full_payment" name="transferOption" value="full" checked={transferOption === 'full'} onChange={() => setTransferOption('full')} className="h-4 w-4 text-primary focus:ring-primary"/>
                                    <span className="ml-2">Thanh toán toàn bộ <strong className="text-textBase">{getTotalPrice().toLocaleString('vi-VN')}₫</strong></span>
                                </label>
                                <label htmlFor="deposit_payment" className="flex items-center cursor-pointer text-textMuted">
                                    <input type="radio" id="deposit_payment" name="transferOption" value="deposit" checked={transferOption === 'deposit'} onChange={() => setTransferOption('deposit')} className="h-4 w-4 text-primary focus:ring-primary"/>
                                    <span className="ml-2">Đặt cọc {Constants.DEPOSIT_PERCENTAGE * 100}% (<strong className="text-textBase">{(getTotalPrice() * Constants.DEPOSIT_PERCENTAGE).toLocaleString('vi-VN')}₫</strong>)</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
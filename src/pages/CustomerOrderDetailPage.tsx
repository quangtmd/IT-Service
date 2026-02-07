
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerOrders } from '../services/localDataService';
import { Order, OrderStatus } from '../types';
import Button from '../components/ui/Button';

const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
        case 'Chờ xử lý': return { text: 'Đơn hàng đã được đặt', icon: 'fas fa-clipboard-check', color: 'text-blue-600 bg-blue-100' };
        case 'Đang chuẩn bị': case 'Đã xác nhận': return { text: 'Người bán đang chuẩn bị hàng', icon: 'fas fa-box-open', color: 'text-yellow-600 bg-yellow-100' };
        case 'Đang giao': return { text: 'Đơn hàng đang được vận chuyển', icon: 'fas fa-shipping-fast', color: 'text-indigo-600 bg-indigo-100' };
        case 'Hoàn thành': return { text: 'Giao hàng thành công', icon: 'fas fa-check-circle', color: 'text-green-600 bg-green-100' };
        case 'Đã hủy': return { text: 'Đơn hàng đã bị hủy', icon: 'fas fa-times-circle', color: 'text-red-600 bg-red-100' };
        default: return { text: status, icon: 'fas fa-info-circle', color: 'text-gray-600 bg-gray-100' };
    }
};

const ShippingTracker: React.FC<{ status: OrderStatus, orderDate: string }> = ({ status, orderDate }) => {
    if (status === 'Đã hủy') {
        return (
            <div className="w-full my-6 p-6 bg-red-50 border border-red-200 rounded-xl flex flex-col items-center justify-center text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3 text-2xl">
                    <i className="fas fa-ban"></i>
                </div>
                <h3 className="text-lg font-bold text-red-700">Đơn hàng đã bị hủy</h3>
                <p className="text-red-600/80 text-sm mt-1">Vui lòng liên hệ bộ phận hỗ trợ nếu bạn có thắc mắc hoặc muốn đặt lại.</p>
            </div>
        );
    }

    const steps = [
        { label: 'Đã đặt đơn', icon: 'fas fa-file-invoice', date: orderDate },
        { label: 'Đang chuẩn bị', icon: 'fas fa-box' },
        { label: 'Đang giao hàng', icon: 'fas fa-truck' },
        { label: 'Giao thành công', icon: 'fas fa-star' },
    ];

    let activeIndex = 0;
    switch (status) {
        case 'Chờ xử lý': activeIndex = 0; break;
        case 'Đã xác nhận': case 'Đang chuẩn bị': activeIndex = 1; break;
        case 'Đang giao': activeIndex = 2; break;
        case 'Hoàn thành': activeIndex = 3; break;
        default: activeIndex = 0;
    }

    // Calculate progress bar width
    const progressPercentage = (activeIndex / (steps.length - 1)) * 100;

    return (
        <div className="w-full my-8 px-2 md:px-6">
            <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 rounded-full -translate-y-1/2 -z-10"></div>
                {/* Active Progress Bar */}
                <div 
                    className="absolute top-1/2 left-0 h-1.5 bg-green-500 rounded-full -translate-y-1/2 -z-10 transition-all duration-700 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>

                <div className="flex justify-between items-start">
                    {steps.map((step, index) => {
                        const isCompleted = index <= activeIndex;
                        const isCurrent = index === activeIndex;

                        return (
                            <div key={index} className="flex flex-col items-center relative group">
                                <div 
                                    className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10
                                    ${isCompleted 
                                        ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30 scale-105' 
                                        : 'bg-white border-gray-200 text-gray-300'}`}
                                >
                                    <i className={`${step.icon} text-sm md:text-xl`}></i>
                                </div>
                                
                                <div className={`mt-3 text-center transition-colors duration-300 absolute top-full w-32 ${isCurrent ? 'font-bold text-green-600' : isCompleted ? 'font-medium text-gray-800' : 'text-gray-400 font-medium'}`}>
                                    <p className="text-[10px] md:text-xs uppercase tracking-wide">{step.label}</p>
                                    {index === 0 && <p className="text-[10px] text-gray-400 mt-0.5 hidden md:block">{new Date(step.date).toLocaleDateString('vi-VN')}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="h-12 md:h-16"></div> {/* Spacer for absolute text */}
        </div>
    );
};

const CustomerOrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setError("Mã đơn hàng không hợp lệ.");
                setIsLoading(false);
                return;
            }
            if (isAuthenticated && currentUser) {
                try {
                    const userOrders = await getCustomerOrders(currentUser.id);
                    const foundOrder = userOrders.find(o => o.id === orderId);
                    if (foundOrder) {
                        setOrder(foundOrder);
                    } else {
                        setError("Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này.");
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Không thể tải chi tiết đơn hàng.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (!authLoading && isAuthenticated) {
            fetchOrder();
        } else if (!authLoading && !isAuthenticated) {
             navigate('/login');
        }
    }, [orderId, currentUser, isAuthenticated, authLoading, navigate]);

    if (isLoading || authLoading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-textMuted">Đang tải chi tiết đơn hàng...</p>
            </div>
        );
    }

    if (error) {
         return (
            <div className="container mx-auto px-4 py-12 text-center">
                 <div className="p-4 bg-danger-bg border border-danger-border text-danger-text rounded-md max-w-md mx-auto">
                    <p>{error}</p>
                    <Link to="/account/orders"><Button variant="danger" className="mt-4">Quay lại</Button></Link>
                 </div>
            </div>
        );
    }

    if (!order) return null;

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="bg-bgCanvas min-h-full pb-16">
            <div className="bg-white border-b border-borderDefault mb-6 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <Link to="/account/orders" className="text-sm font-medium text-textMuted hover:text-primary flex items-center gap-2 transition-colors w-fit">
                        <i className="fas fa-arrow-left"></i>
                        Quay lại danh sách đơn hàng
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl">
                {/* Order Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-borderDefault p-5 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-100 pb-5 mb-5">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
                                Đơn Hàng <span className="font-mono text-primary">#{order.orderNumber || order.id.slice(-6)}</span>
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full flex items-center gap-2 w-fit ${statusInfo.color}`}>
                             <i className={`${statusInfo.icon}`}></i>
                             <span className="font-semibold text-sm">{statusInfo.text}</span>
                        </div>
                    </div>
                     
                    <ShippingTracker status={order.status} orderDate={order.orderDate} />
                    
                    <div className="flex flex-col md:flex-row gap-4 mt-6 pt-6 border-t border-gray-100 justify-end">
                        {order.status !== 'Đã hủy' && order.status !== 'Hoàn thành' && (
                             <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">Yêu cầu hủy đơn</Button>
                        )}
                        <Button variant="outline">Liên hệ hỗ trợ</Button>
                        <Button variant="primary">Mua lại đơn hàng</Button>
                    </div>
                </div>
                
                {/* Detailed Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-borderDefault p-5 md:p-6 h-full">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <i className="fas fa-map-marker-alt text-primary/70"></i> Địa chỉ nhận hàng
                        </h2>
                        <div className="space-y-3 pl-7">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Người nhận</p>
                                <p className="font-semibold text-gray-800 text-base">{order.customerInfo.fullName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Số điện thoại</p>
                                <p className="font-medium text-gray-700">{order.customerInfo.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Địa chỉ</p>
                                <p className="text-gray-600 leading-relaxed">{order.customerInfo.address}</p>
                            </div>
                        </div>
                    </div>

                     <div className="bg-white rounded-xl shadow-sm border border-borderDefault p-5 md:p-6 h-full">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <i className="fas fa-wallet text-green-500/70"></i> Thông tin thanh toán
                        </h2>
                         <div className="space-y-4 pl-7">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Phương thức</p>
                                <p className="font-medium text-gray-700">{order.paymentInfo.method}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Trạng thái</p>
                                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                                    order.paymentInfo.status === 'Đã thanh toán' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {order.paymentInfo.status}
                                </span>
                            </div>
                            {order.shippingInfo && (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Vận chuyển</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {order.shippingInfo.carrier || 'Chưa cập nhật đơn vị'} 
                                        {order.shippingInfo.trackingCode && <span className="ml-2 font-mono bg-gray-100 px-1 rounded">{order.shippingInfo.trackingCode}</span>}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product List */}
                 <div className="bg-white rounded-xl shadow-sm border border-borderDefault overflow-hidden">
                    <div className="px-5 md:px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800">Sản phẩm ({order.items.length})</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {order.items.map(item => (
                            <div key={item.productId} className="flex items-center gap-4 p-4 md:p-5 hover:bg-gray-50/50 transition-colors">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-white">
                                    <img src={`https://picsum.photos/seed/${item.productId}/100/100`} alt={item.productName} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <Link to={`/product/${item.productId}`} className="font-semibold text-gray-800 hover:text-primary transition-colors text-sm md:text-base line-clamp-2">
                                        {item.productName}
                                    </Link>
                                    <p className="text-sm text-gray-500 mt-1">x {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 text-sm md:text-base">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</p>
                                    {item.quantity > 1 && <p className="text-xs text-gray-400 mt-0.5">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)} / cái</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="bg-gray-50/80 p-5 md:p-6 border-t border-gray-200">
                        <div className="flex flex-col gap-2 max-w-xs ml-auto">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tạm tính:</span>
                                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span>
                            </div>
                             <div className="flex justify-between text-sm text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span className="text-green-600 font-medium">Miễn phí</span>
                            </div>
                             <div className="flex justify-between items-end border-t border-gray-200 pt-3 mt-1">
                                <span className="font-bold text-gray-800">Tổng cộng:</span>
                                <span className="text-xl md:text-2xl font-bold text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default CustomerOrderDetailPage;

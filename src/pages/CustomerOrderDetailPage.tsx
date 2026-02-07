
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerOrders } from '../services/localDataService';
import { Order, OrderStatus } from '../types';
import Button from '../components/ui/Button';

const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
        case 'Chờ xử lý': return { text: 'Chờ xử lý', icon: 'fas fa-hourglass-half', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
        case 'Đang chuẩn bị': case 'Đã xác nhận': return { text: 'Đang chuẩn bị hàng', icon: 'fas fa-box', color: 'text-blue-600 bg-blue-50 border-blue-200' };
        case 'Đang giao': return { text: 'Đang giao hàng', icon: 'fas fa-truck', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
        case 'Hoàn thành': return { text: 'Giao hàng thành công', icon: 'fas fa-check-circle', color: 'text-green-600 bg-green-50 border-green-200' };
        case 'Đã hủy': return { text: 'Đơn hàng đã hủy', icon: 'fas fa-times-circle', color: 'text-red-600 bg-red-50 border-red-200' };
        default: return { text: status, icon: 'fas fa-info-circle', color: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
};

const ShippingTracker: React.FC<{ status: OrderStatus, orderDate: string }> = ({ status, orderDate }) => {
    if (status === 'Đã hủy') {
        return (
            <div className="w-full p-8 bg-red-50/50 rounded-xl flex flex-col items-center justify-center text-center border border-red-100">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3 text-2xl shadow-sm">
                    <i className="fas fa-ban"></i>
                </div>
                <h3 className="text-lg font-bold text-red-700">Đơn hàng đã bị hủy</h3>
                <p className="text-red-600/80 text-sm mt-1 max-w-md">Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ bộ phận hỗ trợ ngay lập tức.</p>
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

    const progressPercentage = (activeIndex / (steps.length - 1)) * 100;

    return (
        <div className="w-full py-4 px-2">
            <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
                {/* Active Progress Bar */}
                <div 
                    className="absolute top-5 left-0 h-1 bg-green-500 rounded-full -z-10 transition-all duration-700 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>

                <div className="flex justify-between items-start">
                    {steps.map((step, index) => {
                        const isCompleted = index <= activeIndex;
                        const isCurrent = index === activeIndex;

                        return (
                            <div key={index} className="flex flex-col items-center relative group">
                                <div 
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10
                                    ${isCompleted 
                                        ? 'bg-green-500 border-green-500 text-white shadow-md scale-105' 
                                        : 'bg-white border-gray-300 text-gray-300'}`}
                                >
                                    <i className={`${step.icon} text-sm`}></i>
                                </div>
                                
                                <div className={`mt-3 text-center transition-colors duration-300 ${isCurrent ? 'text-green-700 font-bold' : isCompleted ? 'text-gray-800 font-medium' : 'text-gray-400 font-medium'}`}>
                                    <p className="text-xs uppercase tracking-wide">{step.label}</p>
                                    {index === 0 && <p className="text-[10px] text-gray-500 mt-1 font-normal">{new Date(step.date).toLocaleDateString('vi-VN')}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
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
            <div className="min-h-screen flex items-center justify-center bg-bgCanvas">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-textMuted font-medium">Đang tải chi tiết...</p>
                </div>
            </div>
        );
    }

    if (error) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-bgCanvas px-4">
                 <div className="p-8 bg-white border border-gray-200 shadow-lg rounded-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/account/orders"><Button variant="primary" className="w-full">Quay lại danh sách</Button></Link>
                 </div>
            </div>
        );
    }

    if (!order) return null;

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="bg-bgCanvas min-h-screen pb-16 pt-6">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Back Link */}
                <div className="mb-6">
                    <Link to="/account/orders" className="inline-flex items-center text-sm font-medium text-textMuted hover:text-primary transition-colors group">
                        <i className="fas fa-arrow-left mr-2 transform group-hover:-translate-x-1 transition-transform"></i>
                        Quay lại danh sách đơn hàng
                    </Link>
                </div>

                <div className="space-y-6">
                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-borderDefault p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <i className="fas fa-file-invoice text-9xl"></i>
                        </div>
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                            Đơn Hàng <span className="font-mono text-primary">#{order.orderNumber || order.id.slice(-6)}</span>
                                        </h1>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusInfo.color}`}>
                                            <i className={statusInfo.icon}></i> {statusInfo.text}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                                </div>
                                <div className="text-left md:text-right bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tổng tiền thanh toán</p>
                                    <p className="text-2xl font-bold text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</p>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Trạng thái vận chuyển</h3>
                                <ShippingTracker status={order.status} orderDate={order.orderDate} />
                            </div>
                        </div>
                    </div>
                
                    {/* Detailed Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Address Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-borderDefault p-6 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Địa chỉ nhận hàng</h2>
                            </div>
                            <div className="space-y-3 flex-grow">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Người nhận</p>
                                    <p className="font-medium text-gray-900 text-base">{order.customerInfo.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Số điện thoại</p>
                                    <p className="font-medium text-gray-900">{order.customerInfo.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Địa chỉ</p>
                                    <p className="text-gray-700 leading-relaxed">{order.customerInfo.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-borderDefault p-6 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-lg">
                                    <i className="fas fa-credit-card"></i>
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Thông tin thanh toán</h2>
                            </div>
                             <div className="space-y-4 flex-grow">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Phương thức</p>
                                    <p className="font-medium text-gray-900">{order.paymentInfo.method}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Trạng thái</p>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                                        order.paymentInfo.status === 'Đã thanh toán' 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    }`}>
                                        <i className={`fas ${order.paymentInfo.status === 'Đã thanh toán' ? 'fa-check' : 'fa-clock'}`}></i>
                                        {order.paymentInfo.status}
                                    </span>
                                </div>
                                {order.shippingInfo && (
                                    <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
                                        <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Vận chuyển</p>
                                        <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                                            {order.shippingInfo.carrier || 'Chưa cập nhật đơn vị'} 
                                            {order.shippingInfo.trackingNumber && (
                                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-300">
                                                    {order.shippingInfo.trackingNumber}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="bg-white rounded-xl shadow-sm border border-borderDefault overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">Sản phẩm ({order.items.length})</h2>
                            <span className="text-xs font-medium text-gray-500">Mã đơn: #{order.orderNumber || order.id.slice(-6)}</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map(item => (
                                <div key={item.productId} className="flex items-center gap-4 p-4 md:p-6 hover:bg-gray-50 transition-colors group">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-white shadow-sm">
                                        <img src={`https://picsum.photos/seed/${item.productId}/100/100`} alt={item.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <Link to={`/product/${item.productId}`} className="font-semibold text-gray-800 hover:text-primary transition-colors text-sm md:text-base line-clamp-2 mb-1 block">
                                            {item.productName}
                                        </Link>
                                        <p className="text-sm text-gray-500">Số lượng: <span className="font-medium text-gray-900">{item.quantity}</span></p>
                                    </div>
                                    <div className="text-right pl-4">
                                        <p className="font-bold text-gray-900 text-sm md:text-base">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</p>
                                        {item.quantity > 1 && <p className="text-xs text-gray-400 mt-0.5">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)} / cái</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="bg-gray-50/80 p-6 border-t border-gray-200">
                            <div className="flex flex-col gap-3 max-w-sm ml-auto">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Tạm tính:</span>
                                    <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span>
                                </div>
                                 <div className="flex justify-between text-sm text-gray-600">
                                    <span>Phí vận chuyển:</span>
                                    <span className="text-green-600 font-medium">Miễn phí</span>
                                </div>
                                 <div className="flex justify-between items-end border-t border-gray-300 pt-3 mt-1">
                                    <span className="font-bold text-gray-800 text-base">Tổng cộng:</span>
                                    <span className="text-2xl font-bold text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
                        {order.status !== 'Đã hủy' && order.status !== 'Hoàn thành' && (
                             <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">Yêu cầu hủy đơn</Button>
                        )}
                        <Button variant="outline" className="bg-white hover:bg-gray-50">Liên hệ hỗ trợ</Button>
                        <Button variant="primary" className="shadow-md hover:shadow-lg">Mua lại đơn hàng</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerOrderDetailPage;

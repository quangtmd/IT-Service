import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerOrders } from '../services/localDataService';
import { Order, OrderStatus } from '../types';
import Button from '../components/ui/Button';

const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
        case 'Chờ xử lý': return { text: 'Chờ xử lý', icon: 'fas fa-hourglass-half', color: 'text-yellow-600' };
        case 'Đang chuẩn bị': case 'Đã xác nhận': return { text: 'Đang chuẩn bị hàng', icon: 'fas fa-box', color: 'text-blue-600' };
        case 'Đang giao': return { text: 'Đang giao hàng', icon: 'fas fa-truck', color: 'text-indigo-600' };
        case 'Hoàn thành': return { text: 'Giao hàng thành công', icon: 'fas fa-check-circle', color: 'text-green-600' };
        case 'Đã hủy': return { text: 'Đơn hàng đã hủy', icon: 'fas fa-times-circle', color: 'text-red-600' };
        default: return { text: status, icon: 'fas fa-question-circle', color: 'text-gray-600' };
    }
};

const SHIPPING_STEPS: { status: OrderStatus | 'Đặt hàng thành công', label: string, icon: string }[] = [
    { status: 'Đặt hàng thành công', label: 'Đặt hàng', icon: 'fas fa-receipt' },
    { status: 'Chờ xử lý', label: 'Xử lý', icon: 'fas fa-cogs' },
    { status: 'Đang chuẩn bị', label: 'Chuẩn bị hàng', icon: 'fas fa-box-open' },
    { status: 'Đang giao', label: 'Vận chuyển', icon: 'fas fa-truck' },
    { status: 'Hoàn thành', label: 'Giao thành công', icon: 'fas fa-home' },
];

const ShippingTracker: React.FC<{ status: OrderStatus }> = ({ status }) => {
    let currentIndex = SHIPPING_STEPS.findIndex(step => step.status === status);
    if (currentIndex === -1) {
        // Handle alias statuses like 'Đã xác nhận'
        if(status === 'Đã xác nhận') currentIndex = SHIPPING_STEPS.findIndex(step => step.status === 'Đang chuẩn bị');
        else currentIndex = 0; // Default to first step if status not found
    }
    // If an order is processing, it means it has been successfully placed.
    if (currentIndex >= 1) currentIndex = Math.max(currentIndex, 1);

    return (
        <div className="w-full my-6 p-4 bg-white rounded-lg border">
            <div className="flex justify-between items-start">
                {SHIPPING_STEPS.map((step, index) => {
                    const isActive = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    return (
                        <div key={step.status} className="flex-1 text-center group relative">
                            <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'bg-primary border-primary text-white' : 'bg-gray-200 border-gray-300 text-gray-400'}`}>
                                <i className={step.icon}></i>
                            </div>
                            <p className={`text-xs mt-2 font-semibold transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-500'}`}>{step.label}</p>
                            {isCurrent && <p className="text-xs text-textMuted mt-1">Lúc {new Date().toLocaleTimeString('vi-VN')}</p>}
                        </div>
                    );
                })}
            </div>
             <div className="relative w-[calc(100%-40px)] mx-auto h-1 bg-gray-200 mt-[-28px] -z-10">
                <div className="absolute top-0 left-0 h-1 bg-primary transition-all duration-500" style={{ width: `${(currentIndex / (SHIPPING_STEPS.length - 1)) * 100}%` }}></div>
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
        <div className="bg-bgCanvas min-h-full">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-6">
                    <Link to="/account/orders" className="text-sm font-medium text-textMuted hover:text-primary flex items-center gap-2">
                        <i className="fas fa-arrow-left"></i>
                        Quay lại danh sách đơn hàng
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-borderDefault p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-textBase">Chi Tiết Đơn Hàng #{order.id.slice(-6)}</h1>
                            <p className="text-sm text-textMuted">Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                        </div>
                        <div className={`text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 mt-2 sm:mt-0 ${statusInfo.color.replace('text-', 'bg-').replace('600', '100')}`}>
                             <i className={`${statusInfo.icon} ${statusInfo.color}`}></i>
                             <span className={statusInfo.color}>{statusInfo.text}</span>
                        </div>
                    </div>
                     <ShippingTracker status={order.status} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <h2 className="text-lg font-semibold text-textBase mb-3">Địa chỉ giao hàng</h2>
                        <div className="text-sm space-y-1 text-textMuted">
                            <p className="font-medium text-textBase">{order.customerInfo.fullName}</p>
                            <p>{order.customerInfo.phone}</p>
                            <p>{order.customerInfo.address}</p>
                        </div>
                    </div>
                     <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                        <h2 className="text-lg font-semibold text-textBase mb-3">Thông tin thanh toán</h2>
                         <div className="text-sm space-y-1 text-textMuted">
                            <p>Phương thức: <span className="font-medium text-textBase">{order.paymentInfo.method}</span></p>
                            <p>Trạng thái: <span className="font-medium text-textBase">{order.paymentInfo.status}</span></p>
                        </div>
                    </div>
                </div>

                 <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mt-6">
                    <h2 className="text-lg font-semibold text-textBase mb-4">Sản phẩm trong đơn</h2>
                    <div className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.productId} className="flex items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                <img src={`https://picsum.photos/seed/${item.productId}/100/100`} alt={item.productName} className="w-20 h-20 object-cover rounded-md border flex-shrink-0" />
                                <div className="flex-grow text-sm">
                                    <p className="font-medium text-textBase">{item.productName}</p>
                                    <p className="text-textMuted">Số lượng: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-semibold text-textBase">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-textMuted">Tạm tính:</span>
                            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-textMuted">Phí vận chuyển:</span>
                            <span>Miễn phí</span>
                        </div>
                         <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                            <span className="text-textBase">Tổng cộng:</span>
                            <span className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</span>
                        </div>
                    </div>
                 </div>

                 <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline">Liên hệ hỗ trợ</Button>
                    <Button variant="primary">Mua lại đơn hàng</Button>
                 </div>
            </div>
        </div>
    );
};

export default CustomerOrderDetailPage;

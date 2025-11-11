import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerOrders } from '../services/localDataService';
import { Order, OrderStatus } from '../types';
import Button from '../components/ui/Button';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Chờ xử lý': return 'bg-yellow-100 text-yellow-800';
        case 'Đang chuẩn bị': case 'Đã xác nhận': return 'bg-blue-100 text-blue-800';
        case 'Đang giao': return 'bg-indigo-100 text-indigo-800';
        case 'Hoàn thành': return 'bg-green-100 text-green-800';
        case 'Đã hủy': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const SHIPPING_STEPS: OrderStatus[] = ['Chờ xử lý', 'Đang chuẩn bị', 'Đang giao', 'Hoàn thành'];

const ShippingTracker: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const currentIndex = SHIPPING_STEPS.indexOf(status);
    
    return (
        <div className="w-full my-4">
            <div className="flex justify-between">
                {SHIPPING_STEPS.map((step, index) => {
                    const isActive = index <= currentIndex;
                    return (
                        <div key={step} className="flex-1 text-center">
                            <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive ? 'bg-primary border-primary text-white' : 'bg-gray-200 border-gray-300 text-gray-500'}`}>
                                <i className={`fas ${index < currentIndex ? 'fa-check' : 'fa-box-open'}`}></i>
                            </div>
                            <p className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>{step}</p>
                        </div>
                    );
                })}
            </div>
             <div className="relative w-full h-1 bg-gray-200 mt-[-22px] -z-10">
                <div className="absolute top-0 left-0 h-1 bg-primary transition-all duration-500" style={{ width: `${(currentIndex / (SHIPPING_STEPS.length - 1)) * 100}%` }}></div>
            </div>
        </div>
    );
};


const OrderRow: React.FC<{ order: Order }> = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white border border-borderDefault rounded-lg shadow-sm">
            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex-1 mb-4 sm:mb-0">
                    <p className="font-bold text-primary">Đơn hàng #{order.id.slice(-6)}</p>
                    <p className="text-sm text-textMuted">Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex-1 text-left sm:text-center mb-4 sm:mb-0">
                    <span className={`status-badge ${getStatusColor(order.status)}`}>{order.status}</span>
                </div>
                <div className="flex-1 text-left sm:text-right font-semibold text-textBase">
                    {order.totalAmount.toLocaleString('vi-VN')}₫
                </div>
                <div className="w-8 text-right">
                    <i className={`fas fa-chevron-down text-textSubtle transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}></i>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-borderDefault p-4 bg-gray-50/50">
                    <h4 className="font-semibold text-textBase mb-3">Chi tiết Vận chuyển & Thanh toán</h4>
                    <ShippingTracker status={order.status} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
                        <div>
                            <p className="font-medium text-textMuted">Thông tin giao hàng</p>
                            <p>{order.customerInfo.fullName}</p>
                            <p>{order.customerInfo.phone}</p>
                            <p>{order.customerInfo.address}</p>
                        </div>
                        <div>
                             <p className="font-medium text-textMuted">Thông tin vận chuyển</p>
                             <p>ĐVVC: {order.shippingInfo?.carrier || 'Chưa cập nhật'}</p>
                             <p>Mã vận đơn: {order.shippingInfo?.trackingNumber || 'Chưa cập nhật'}</p>
                        </div>
                         <div>
                            <p className="font-medium text-textMuted">Thanh toán</p>
                            <p>{order.paymentInfo.method}</p>
                            <p>Trạng thái: {order.paymentInfo.status}</p>
                        </div>
                    </div>

                    <h4 className="font-semibold text-textBase mt-6 mb-3 pt-4 border-t">Các sản phẩm đã mua</h4>
                    <div className="space-y-3">
                        {order.items.map(item => (
                            <div key={item.productId} className="flex items-center text-sm">
                                <p className="flex-grow">{item.productName} <span className="text-textMuted">x {item.quantity}</span></p>
                                <p className="font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const CustomerOrdersPage: React.FC = () => {
    const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login', { state: { from: '/account/orders' } });
        }
    }, [isAuthenticated, authLoading, navigate]);
    
    useEffect(() => {
        const fetchOrders = async () => {
            if (isAuthenticated && currentUser) {
                setIsLoading(true);
                setError(null);
                try {
                    const userOrders = await getCustomerOrders(currentUser.id);
                    setOrders(userOrders);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Không thể tải lịch sử đơn hàng.");
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchOrders();
    }, [isAuthenticated, currentUser]);


    if (authLoading || isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-textMuted">Đang tải đơn hàng của bạn...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-textBase mb-2">Đơn Hàng Của Tôi</h1>
                <p className="text-textMuted">Xem lại lịch sử và theo dõi trạng thái các đơn hàng của bạn.</p>
            </div>

            {error && <div className="p-4 bg-danger-bg border border-danger-border text-danger-text rounded-md">{error}</div>}

            {!error && orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-borderDefault">
                    <i className="fas fa-receipt text-5xl text-textSubtle mb-4"></i>
                    <h3 className="text-xl font-semibold text-textBase mb-2">Bạn chưa có đơn hàng nào</h3>
                    <p className="text-textMuted mb-6">Tất cả đơn hàng của bạn sẽ được hiển thị ở đây.</p>
                    <Link to="/shop"><Button variant="primary">Bắt đầu mua sắm</Button></Link>
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                    {orders.map(order => (
                        <OrderRow key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerOrdersPage;
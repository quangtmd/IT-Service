import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerOrders } from '../services/localDataService';
import { Order, OrderStatus } from '../types';
import Button from '../components/ui/Button';

const STATUS_TABS: { label: string, status: OrderStatus | 'Tất cả' }[] = [
    { label: 'Tất cả', status: 'Tất cả' },
    { label: 'Chờ xử lý', status: 'Chờ xử lý' },
    { label: 'Đang chuẩn bị', status: 'Đang chuẩn bị' },
    { label: 'Đang giao', status: 'Đang giao' },
    { label: 'Hoàn thành', status: 'Hoàn thành' },
    { label: 'Đã hủy', status: 'Đã hủy' },
];

const getStatusAppearance = (status: OrderStatus) => {
    switch (status) {
        case 'Chờ xử lý': return { text: 'Chờ xử lý', icon: 'fas fa-hourglass-half', color: 'text-yellow-600 bg-yellow-100' };
        case 'Đang chuẩn bị': case 'Đã xác nhận': return { text: 'Đang chuẩn bị', icon: 'fas fa-box', color: 'text-blue-600 bg-blue-100' };
        case 'Đang giao': return { text: 'Đang giao', icon: 'fas fa-truck', color: 'text-indigo-600 bg-indigo-100' };
        case 'Hoàn thành': return { text: 'Hoàn thành', icon: 'fas fa-check-circle', color: 'text-green-600 bg-green-100' };
        case 'Đã hủy': return { text: 'Đã hủy', icon: 'fas fa-times-circle', color: 'text-red-600 bg-red-100' };
        default: return { text: status, icon: 'fas fa-question-circle', color: 'text-gray-600 bg-gray-100' };
    }
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const statusInfo = getStatusAppearance(order.status);
    const firstItem = order.items[0];

    return (
        <Link to={`/account/orders/${order.id}`} className="block bg-white border border-borderDefault rounded-lg shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200">
            <div className="p-4 border-b border-borderDefault flex justify-between items-center bg-gray-50/50 rounded-t-lg">
                <div>
                    <p className="font-bold text-sm text-textBase">Đơn hàng #{order.id.slice(-6)}</p>
                    <p className="text-xs text-textMuted">Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${statusInfo.color}`}>
                    <i className={statusInfo.icon}></i>
                    <span>{statusInfo.text}</span>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-start gap-4">
                    <img src={`https://picsum.photos/seed/${firstItem.productId}/100/100`} alt={firstItem.productName} className="w-16 h-16 object-cover rounded-md border" />
                    <div className="flex-grow">
                        <p className="font-medium text-sm text-textBase line-clamp-1">{firstItem.productName}</p>
                        <p className="text-xs text-textMuted">x{firstItem.quantity}</p>
                        {order.items.length > 1 && (
                            <p className="text-xs text-textSubtle mt-1">và {order.items.length - 1} sản phẩm khác...</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-borderDefault flex justify-end items-center bg-gray-50/50 rounded-b-lg">
                 <p className="text-sm text-textMuted">Tổng tiền: <span className="font-bold text-lg text-primary">{order.totalAmount.toLocaleString('vi-VN')}₫</span></p>
            </div>
        </Link>
    );
};

const SkeletonOrderCard: React.FC = () => (
    <div className="bg-white border border-borderDefault rounded-lg shadow-sm animate-pulse">
        <div className="p-4 border-b flex justify-between items-center">
            <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-28"></div>
        </div>
        <div className="p-4 flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
            <div className="flex-grow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
        </div>
        <div className="p-4 border-t flex justify-end items-center">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
        </div>
    </div>
);


const CustomerOrdersPage: React.FC = () => {
    const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<OrderStatus | 'Tất cả'>('Tất cả');
    const [searchTerm, setSearchTerm] = useState('');

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
                    setAllOrders(userOrders);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Không thể tải lịch sử đơn hàng.");
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchOrders();
    }, [isAuthenticated, currentUser]);

    const filteredOrders = useMemo(() => {
        return allOrders
            .filter(order => activeTab === 'Tất cả' || order.status === activeTab)
            .filter(order => {
                if (!searchTerm) return true;
                const lowerSearchTerm = searchTerm.toLowerCase();
                const hasMatchingProduct = order.items.some(item =>
                    item.productName.toLowerCase().includes(lowerSearchTerm)
                );
                const hasMatchingId = order.id.toLowerCase().includes(lowerSearchTerm);
                return hasMatchingProduct || hasMatchingId;
            });
    }, [allOrders, activeTab, searchTerm]);

    if (authLoading) {
        return <div className="container mx-auto px-4 py-12 text-center">Đang xác thực...</div>;
    }

    return (
        <div className="bg-bgCanvas min-h-full">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-textBase mb-2">Đơn Hàng Của Tôi</h1>
                    <p className="text-textMuted">Xem lại lịch sử và theo dõi trạng thái các đơn hàng của bạn.</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-borderDefault mb-6 sticky top-[168px] z-20">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                             <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm theo mã đơn hàng hoặc tên sản phẩm"
                                className="input-style w-full !pl-10"
                            />
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-textSubtle"></i>
                        </div>
                    </div>
                     <div className="mt-4 -mb-4 -mx-4 px-4 border-t border-borderDefault overflow-x-auto scrollbar-hide">
                        <div className="flex space-x-2 pt-1">
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.label}
                                    onClick={() => setActiveTab(tab.status)}
                                    className={`py-3 px-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab.status ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-textBase border-b-2 border-transparent'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {error && <div className="p-4 bg-danger-bg border border-danger-border text-danger-text rounded-md">{error}</div>}

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonOrderCard key={i} />)}
                    </div>
                ) : !error && filteredOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-borderDefault max-w-5xl mx-auto">
                        <i className="fas fa-receipt text-6xl text-textSubtle mb-4"></i>
                        <h3 className="text-xl font-semibold text-textBase mb-2">Không tìm thấy đơn hàng</h3>
                        <p className="text-textMuted mb-6">Không có đơn hàng nào phù hợp với bộ lọc hiện tại.</p>
                        <Button variant="primary" onClick={() => { setActiveTab('Tất cả'); setSearchTerm(''); }}>Xem tất cả đơn hàng</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {filteredOrders.map(order => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerOrdersPage;

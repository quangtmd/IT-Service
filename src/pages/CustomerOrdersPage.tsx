
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
        case 'Chờ xử lý': return { text: 'Chờ xử lý', icon: 'fas fa-hourglass-half', color: 'text-yellow-700 bg-yellow-100 border-yellow-200' };
        case 'Đang chuẩn bị': case 'Đã xác nhận': return { text: 'Đang chuẩn bị', icon: 'fas fa-box', color: 'text-blue-700 bg-blue-100 border-blue-200' };
        case 'Đang giao': return { text: 'Đang giao', icon: 'fas fa-truck', color: 'text-indigo-700 bg-indigo-100 border-indigo-200' };
        case 'Hoàn thành': return { text: 'Hoàn thành', icon: 'fas fa-check-circle', color: 'text-green-700 bg-green-100 border-green-200' };
        case 'Đã hủy': return { text: 'Đã hủy', icon: 'fas fa-times-circle', color: 'text-red-700 bg-red-100 border-red-200' };
        default: return { text: status, icon: 'fas fa-question-circle', color: 'text-gray-700 bg-gray-100 border-gray-200' };
    }
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const statusInfo = getStatusAppearance(order.status);
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="bg-white border border-borderDefault rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
            {/* Card Header - Clickable to toggle */}
            <div 
                className="p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusInfo.color} border-0 bg-opacity-20`}>
                            <i className={statusInfo.icon}></i>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-textBase">
                                    Đơn hàng <span className="font-mono text-primary">#{order.orderNumber || order.id.slice(-6)}</span>
                                </h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusInfo.color}`}>
                                    {statusInfo.text}
                                </span>
                            </div>
                            <p className="text-xs text-textMuted mt-0.5">
                                <i className="far fa-clock mr-1"></i>
                                {new Date(order.orderDate).toLocaleDateString('vi-VN', { 
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end">
                         <span className="text-sm text-textMuted sm:hidden">Tổng tiền:</span>
                         <span className="text-lg font-bold text-primary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                        </span>
                    </div>
                </div>

                {/* Summary View (Collapsed) */}
                {!isExpanded && (
                    <div className="flex items-center justify-between text-sm text-textMuted bg-gray-50/50 p-3 rounded-lg border border-borderDefault/50">
                        <div className="flex items-center gap-2">
                            <span>{totalItems} sản phẩm</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="truncate max-w-[150px] sm:max-w-xs">{order.items[0].productName} {order.items.length > 1 ? `...` : ''}</span>
                        </div>
                        <i className="fas fa-chevron-down text-gray-400"></i>
                    </div>
                )}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="border-t border-borderDefault bg-gray-50/30 animate-fade-in-up">
                    
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 text-sm">
                        <div className="p-3 bg-white rounded-lg border border-borderDefault">
                            <h4 className="font-semibold text-textBase mb-2 flex items-center gap-2">
                                <i className="fas fa-map-marker-alt text-primary"></i> Giao nhận
                            </h4>
                            <div className="space-y-1 text-textMuted">
                                <p className="font-medium text-textBase">{order.customerInfo.fullName}</p>
                                <p>{order.customerInfo.phone}</p>
                                <p className="text-xs leading-relaxed">{order.customerInfo.address}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-borderDefault">
                            <h4 className="font-semibold text-textBase mb-2 flex items-center gap-2">
                                <i className="fas fa-credit-card text-blue-500"></i> Thanh toán
                            </h4>
                            <div className="space-y-1 text-textMuted">
                                <p>{order.paymentInfo.method}</p>
                                <p className="flex items-center gap-2">
                                    Trạng thái: 
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                        order.paymentInfo.status === 'Đã thanh toán' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {order.paymentInfo.status}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Full Product List */}
                    <div className="px-4 pb-4">
                        <div className="bg-white rounded-lg border border-borderDefault overflow-hidden">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 border-b border-borderDefault last:border-0 hover:bg-gray-50 transition-colors">
                                    <img 
                                        src={`https://picsum.photos/seed/${item.productId}/100/100`} 
                                        alt={item.productName} 
                                        className="w-12 h-12 object-cover rounded border border-gray-200"
                                    />
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-medium text-textBase truncate">{item.productName}</p>
                                        <p className="text-xs text-textMuted">x{item.quantity}</p>
                                    </div>
                                    <div className="text-sm font-semibold text-textBase">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Actions */}
            <div className="p-3 border-t border-borderDefault bg-gray-50 flex justify-between items-center">
                 <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="text-xs text-textMuted hover:text-primary transition-colors flex items-center gap-1 font-medium"
                >
                    {isExpanded ? <><i className="fas fa-chevron-up"></i> Thu gọn</> : <><i className="fas fa-chevron-down"></i> Xem chi tiết</>}
                </button>
                <div className="flex gap-2">
                    {order.status === 'Hoàn thành' && (
                        <Button variant="outline" size="sm" className="bg-white hover:bg-primary/5 border-primary text-primary">
                            Mua lại
                        </Button>
                    )}
                    <Link to={`/account/orders/${order.id}`}>
                        <Button size="sm" variant="primary">
                            Chi tiết đầy đủ <i className="fas fa-arrow-right ml-1"></i>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const SkeletonOrderCard: React.FC = () => (
    <div className="bg-white border border-borderDefault rounded-xl shadow-sm p-4 animate-pulse">
        <div className="flex justify-between mb-4">
            <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-16 bg-gray-100 rounded-lg mb-4"></div>
        <div className="flex justify-end gap-2">
             <div className="h-8 bg-gray-200 rounded w-20"></div>
             <div className="h-8 bg-gray-200 rounded w-24"></div>
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
                const hasMatchingId = (order.orderNumber?.toLowerCase() || order.id.toLowerCase()).includes(lowerSearchTerm);
                return hasMatchingProduct || hasMatchingId;
            });
    }, [allOrders, activeTab, searchTerm]);

    if (authLoading) {
        return <div className="container mx-auto px-4 py-12 text-center">Đang xác thực...</div>;
    }

    return (
        <div className="bg-bgCanvas min-h-full pb-12">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-textBase mb-2">Lịch Sử Đơn Hàng</h1>
                    <p className="text-textMuted max-w-lg mx-auto">Theo dõi trạng thái đơn hàng và xem lại lịch sử mua sắm của bạn.</p>
                </div>

                <div className="max-w-5xl mx-auto mb-8">
                     {/* Search and Filters */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-borderDefault sticky top-[160px] z-20">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Tìm theo mã đơn, tên sản phẩm..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                                <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>
                        
                        <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.label}
                                    onClick={() => setActiveTab(tab.status)}
                                    className={`
                                        whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all
                                        ${activeTab === tab.status 
                                            ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                            : 'bg-white text-textMuted hover:bg-gray-100 border border-gray-200'}
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-4">
                        {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-center">{error}</div>}

                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => <SkeletonOrderCard key={i} />)
                        ) : !error && filteredOrders.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-borderDefault">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-3xl">
                                    <i className="fas fa-box-open"></i>
                                </div>
                                <h3 className="text-xl font-bold text-textBase mb-2">Không tìm thấy đơn hàng</h3>
                                <p className="text-textMuted mb-6">Bạn chưa có đơn hàng nào hoặc không có đơn hàng phù hợp với bộ lọc.</p>
                                <Button variant="primary" onClick={() => { setActiveTab('Tất cả'); setSearchTerm(''); }}>Xóa bộ lọc</Button>
                            </div>
                        ) : (
                            filteredOrders.map(order => (
                                <OrderCard key={order.id} order={order} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerOrdersPage;

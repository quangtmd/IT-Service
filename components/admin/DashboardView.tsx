import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders, getProducts, checkBackendHealth } from '../../services/localDataService';
import Card from '../ui/Card';
import { Order, OrderStatus, Product, AdminView, User, AdminNotification, BackendHealthStatus } from '../../types';
import Button from '../ui/Button';
import BackendConnectionError from '../../components/shared/BackendConnectionError';
// FIX: Import useNavigate hook for navigation.
import { Link, useNavigate } from 'react-router-dom';

interface DashboardViewProps {
  setActiveView: (view: AdminView) => void;
}

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Chờ xử lý': return 'bg-yellow-100 text-yellow-800';
        case 'Đang chuẩn bị': return 'bg-blue-100 text-blue-800';
        case 'Đang giao': return 'bg-indigo-100 text-indigo-800';
        case 'Hoàn thành': return 'bg-green-100 text-green-800';
        case 'Đã hủy': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string; onClick?: () => void, subtitle?: string }> = ({ title, value, icon, color, onClick, subtitle }) => (
    <div onClick={onClick} className={`p-5 rounded-lg shadow-md flex items-center cursor-pointer hover:shadow-xl transition-shadow ${color} stat-card-pattern`}>
        <div className="p-4 rounded-full bg-white/30 mr-4">
            <i className={`fas ${icon} text-3xl text-white`}></i>
        </div>
        <div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm font-medium text-white/90">{title}</p>
            {subtitle && <p className="text-xs text-white/80 mt-1">{subtitle}</p>}
        </div>
    </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
    // FIX: Initialize useNavigate hook.
    const navigate = useNavigate();
    const { users, adminNotifications } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [backendStatus, setBackendStatus] = useState<BackendHealthStatus | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [ordersData, productsData, healthData] = await Promise.all([
                    getOrders(),
                    getProducts('limit=10000'),
                    checkBackendHealth()
                ]);
                
                setOrders(ordersData);
                setProducts(productsData.products);
                // FIX: Cast healthData to BackendHealthStatus to resolve type mismatch.
                setBackendStatus(healthData as BackendHealthStatus);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                setError(error instanceof Error ? error.message : "Lỗi khi tải dữ liệu dashboard.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const summary = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const ordersThisMonth = orders.filter(o => new Date(o.orderDate) >= startOfMonth);
        const customersThisMonth = users.filter(u => u.role === 'customer' && u.createdAt && new Date(u.createdAt) >= startOfMonth);

        const revenueThisMonth = ordersThisMonth
            .filter(o => o.status === 'Hoàn thành')
            .reduce((sum, o) => sum + o.totalAmount, 0);
        
        const profitThisMonth = ordersThisMonth
            .filter(o => o.status === 'Hoàn thành')
            .reduce((sum, o) => sum + (o.profit || 0), 0);

        const pendingOrders = orders.filter(o => o.status === 'Chờ xử lý');
        const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
        const bestSellers = products.filter(p => p.tags?.includes('Bán chạy')).slice(0, 5);

        return {
            revenueThisMonth,
            profitThisMonth,
            newOrdersCount: ordersThisMonth.length,
            newCustomersCount: customersThisMonth.length,
            pendingOrders,
            lowStockProducts,
            bestSellers,
        };
    }, [orders, products, users]);

    const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
    const unreadNotifications = useMemo(() => adminNotifications.filter(n => !n.isRead).slice(0, 4), [adminNotifications]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {error && <BackendConnectionError error={error} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Doanh thu tháng" value={summary.revenueThisMonth.toLocaleString('vi-VN')+'₫'} icon="fa-chart-line" color="bg-blue-500" onClick={() => setActiveView('reports')} />
                <StatCard title="Lợi nhuận tháng" value={summary.profitThisMonth.toLocaleString('vi-VN')+'₫'} icon="fa-dollar-sign" color="bg-green-500" onClick={() => navigate('/admin/reports?type=profit')} />
                <StatCard title="Đơn hàng mới" value={summary.newOrdersCount} icon="fa-receipt" color="bg-purple-500" onClick={() => setActiveView('orders')} subtitle="Trong tháng này" />
                <StatCard title="Khách hàng mới" value={summary.newCustomersCount} icon="fa-users" color="bg-orange-500" onClick={() => setActiveView('partners')} subtitle="Trong tháng này" />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <Card className="!p-4">
                         <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-lg">Đơn hàng gần đây</h4>
                            <Button variant="ghost" size="sm" onClick={() => setActiveView('orders')}>Xem tất cả</Button>
                        </div>
                         <div className="overflow-x-auto">
                            <table className="admin-table w-full">
                                <thead>
                                    <tr><th>Mã ĐH</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th></tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? recentOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/orders/edit/${order.id}`)}>
                                            <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{String(order.id).slice(-6)}</span></td>
                                            <td>{order.customerInfo.fullName}</td>
                                            <td className="font-semibold">{order.totalAmount.toLocaleString('vi-VN')}₫</td>
                                            <td><span className={`status-badge ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="text-center py-4 text-gray-500">Chưa có đơn hàng nào.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                 <div className="xl:col-span-1 space-y-6">
                    <Card className="!p-4">
                        <h4 className="font-semibold text-lg mb-3">Cần chú ý</h4>
                        <div className="space-y-3">
                            <Link to="/admin/orders" className="flex justify-between items-center p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                                <div><i className="fas fa-hourglass-half mr-2 text-yellow-600"></i><span className="font-medium text-yellow-800">Đơn hàng chờ xử lý</span></div>
                                <span className="font-bold text-lg text-yellow-800">{summary.pendingOrders.length}</span>
                            </Link>
                             <Link to="/admin/inventory" className="flex justify-between items-center p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                <div><i className="fas fa-box-open mr-2 text-red-600"></i><span className="font-medium text-red-800">Sản phẩm sắp hết hàng</span></div>
                                <span className="font-bold text-lg text-red-800">{summary.lowStockProducts.length}</span>
                            </Link>
                             <Link to="/admin/notifications_panel" className="flex justify-between items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                <div><i className="fas fa-bell mr-2 text-blue-600"></i><span className="font-medium text-blue-800">Thông báo chưa đọc</span></div>
                                <span className="font-bold text-lg text-blue-800">{unreadNotifications.length}</span>
                            </Link>
                        </div>
                    </Card>
                    
                    <Card className="!p-4">
                         <h4 className="font-semibold text-lg mb-3">Thông báo gần đây</h4>
                         <div className="space-y-2">
                            {unreadNotifications.length > 0 ? unreadNotifications.map(n => (
                                <div key={n.id} className="text-sm p-2 rounded-md bg-gray-50 border-l-4 border-blue-400">
                                    <p className="line-clamp-2">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString('vi-VN')}</p>
                                </div>
                            )) : <p className="text-sm text-gray-500 text-center py-4">Không có thông báo mới.</p>}
                         </div>
                    </Card>

                    <Card className="!p-4">
                        <h4 className="font-semibold text-lg mb-3">Tình trạng Hệ thống</h4>
                        {backendStatus ? (
                            <div className={`p-3 rounded-lg border flex items-center gap-3 ${backendStatus.status === 'ok' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <i className={`fas ${backendStatus.status === 'ok' ? 'fa-check-circle text-green-500' : 'fa-exclamation-triangle text-red-500'} text-2xl`}></i>
                                <div>
                                    <p className={`font-semibold ${backendStatus.status === 'ok' ? 'text-green-800' : 'text-red-800'}`}>
                                        Backend: {backendStatus.status === 'ok' ? 'Hoạt động' : 'Gặp sự cố'}
                                    </p>
                                    <p className={`text-xs ${backendStatus.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                                        Database: {backendStatus.database === 'connected' ? 'Đã kết nối' : 'Mất kết nối'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                             <div className="p-3 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-800 text-sm">Đang kiểm tra...</div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
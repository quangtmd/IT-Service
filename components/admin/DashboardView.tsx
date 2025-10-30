import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders, getProducts } from '../../services/localDataService';
import Card from '../ui/Card';
import { Order, OrderStatus, OrderStatusAdmin } from '../../types';
import Button from '../ui/Button';

interface DashboardViewProps {
  setActiveView: (view: string) => void;
}

// FIX: Change status cases to align with OrderStatus type
const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'shipped': return 'bg-indigo-100 text-indigo-800';
        case 'delivered': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const STATUS_MAP: Record<OrderStatus, OrderStatusAdmin> = {
    pending: 'Chờ xử lý',
    processing: 'Đang chuẩn bị',
    shipped: 'Đang giao',
    delivered: 'Hoàn thành',
    cancelled: 'Đã hủy',
};

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string; onClick?: () => void }> = ({ title, value, icon, color, onClick }) => (
    <div onClick={onClick} className={`p-4 rounded-lg shadow-md flex items-center cursor-pointer hover:shadow-lg transition-shadow ${color}`}>
        <div className="p-3 rounded-full bg-white/30 mr-4">
            <i className={`fas ${icon} text-2xl text-white`}></i>
        </div>
        <div>
            <p className="text-sm font-medium text-white/90">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const RevenueChart: React.FC<{ data: { day: string; revenue: number }[] }> = ({ data }) => {
    const width = 600;
    const height = 300;
    const padding = 40;

    if (!data || data.length === 0) {
        return <div className="text-center p-8 text-gray-500">Không có dữ liệu doanh thu.</div>;
    }

    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const maxRevenueCeiling = Math.ceil(maxRevenue / 1000000) * 1000000;

    const getX = (index: number) => padding + (index / (data.length - 1)) * (width - padding * 2);
    const getY = (revenue: number) => height - padding - (revenue / maxRevenueCeiling) * (height - padding * 2);

    const linePath = data.map((point, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(point.revenue)}`).join(' ');
    const areaPath = `${linePath} L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
        const value = (maxRevenueCeiling / 4) * i;
        return { value, y: getY(value) };
    });

    return (
        <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary-default)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--color-primary-default)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                {yAxisLabels.map(label => (
                    <g key={label.value}>
                        <line x1={padding} y1={label.y} x2={width - padding} y2={label.y} stroke="#e2e8f0" strokeDasharray="4" />
                        <text x={padding - 10} y={label.y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{`${label.value / 1000000}tr`}</text>
                    </g>
                ))}
                {data.map((point, i) => {
                    if (i % (Math.floor(data.length / 6)) === 0) {
                        return <text key={i} x={getX(i)} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#94a3b8">{point.day}</text>
                    }
                    return null;
                })}
                <path d={areaPath} fill="url(#revenueGradient)" />
                <path d={linePath} fill="none" stroke="var(--color-primary-default)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
};


const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
    const { users, adminNotifications } = useAuth();
    const [orderCount, setOrderCount] = useState(0);
    const [productCount, setProductCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [revenueData, setRevenueData] = useState<{ day: string; revenue: number }[]>([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const orders = await getOrders();
                const products = await getProducts();
                setOrderCount(orders.length);
                setProductCount(products.length);
                setRecentOrders(orders.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };
        fetchData();

        const generateMockData = () => {
            const data = [];
            const today = new Date();
            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const day = date.getDate().toString();
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const baseRevenue = 5000000;
                const randomFactor = Math.random() * 3000000;
                const weekendBonus = isWeekend ? 2000000 : 0;
                const revenue = baseRevenue + randomFactor + weekendBonus;
                data.push({ day, revenue });
            }
            setRevenueData(data);
        };
        generateMockData();
    }, []);

    const customerCount = users.filter(u => u.role === 'customer').length;
    const unreadNotifications = adminNotifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Tổng Đơn Hàng" value={orderCount} icon="fa-receipt" color="bg-blue-500" onClick={() => setActiveView('orders')} />
                <StatCard title="Sản Phẩm" value={productCount} icon="fa-box-open" color="bg-green-500" onClick={() => setActiveView('products')} />
                <StatCard title="Khách Hàng" value={customerCount} icon="fa-users" color="bg-purple-500" onClick={() => setActiveView('customers')} />
                <StatCard title="Thông Báo Mới" value={unreadNotifications} icon="fa-bell" color="bg-yellow-500" onClick={() => setActiveView('notifications_panel')} />
            </div>
            
            {/* Revenue Chart */}
            <Card className="!p-4">
                <h4 className="font-semibold text-lg mb-3 px-2">Doanh thu 30 ngày qua</h4>
                <RevenueChart data={revenueData} />
            </Card>

            {/* Quick Actions */}
            <Card className="!p-4">
                <h4 className="font-semibold text-lg mb-3">Tác vụ nhanh</h4>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setActiveView('products')} className="admin-quick-action-button"><i className="fas fa-plus mr-2"></i>Thêm sản phẩm</Button>
                    <Button onClick={() => setActiveView('articles')} className="admin-quick-action-button"><i className="fas fa-pen mr-2"></i>Viết bài mới</Button>
                    <Button onClick={() => setActiveView('discounts')} className="admin-quick-action-button"><i className="fas fa-tags mr-2"></i>Tạo mã giảm giá</Button>
                    <Button onClick={() => setActiveView('hrm_dashboard')} className="admin-quick-action-button"><i className="fas fa-user-plus mr-2"></i>Thêm nhân viên</Button>
                </div>
            </Card>

            {/* Recent Orders */}
            <Card className="!p-4">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-lg">Đơn hàng gần đây</h4>
                    <Button variant="ghost" size="sm" onClick={() => setActiveView('orders')}>Xem tất cả</Button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="admin-table w-full">
                        <thead>
                            <tr>
                                <th>Mã ĐH</th>
                                <th>Khách hàng</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.length > 0 ? recentOrders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setActiveView('orders')}>
                                    {/* FIX: Convert numeric ID to string for slice method. */}
                                    <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{String(order.id).slice(-6)}</span></td>
                                    <td>{order.customerInfo.fullName}</td>
                                    <td className="font-semibold">{order.totalAmount.toLocaleString('vi-VN')}₫</td>
                                    <td><span className={`status-badge ${getStatusColor(order.status)}`}>{STATUS_MAP[order.status] || order.status}</span></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500">Chưa có đơn hàng nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DashboardView;
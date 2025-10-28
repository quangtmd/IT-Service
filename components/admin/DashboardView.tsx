import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Product, Order, User, AdminNotification, OrderStatus } from '../../types';
import { getOrders, getProducts } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { MOCK_PRODUCTS } from '../../data/mockData';

// --- HELPER FUNCTIONS & TYPES ---
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
const calculatePercentageChange = (current: number, previous: number): number | null => {
    if (previous === 0) return current > 0 ? Infinity : 0;
    return ((current - previous) / previous) * 100;
};

// --- WIDGET SUB-COMPONENTS ---

const DashboardStatCard: React.FC<{
    title: string;
    value: string;
    change?: number | null;
    icon: string;
    colorClass: string;
}> = ({ title, value, change, icon, colorClass }) => {
    const isPositive = change !== null && change !== undefined && change >= 0;
    const isNegative = change !== null && change !== undefined && change < 0;
    const changeText = change === Infinity ? '+∞%' : (change !== null && change !== undefined ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : null);

    return (
        <div className="admin-card flex items-center p-4">
            <div className={`w-12 h-12 flex items-center justify-center rounded-full mr-4 ${colorClass} bg-opacity-10`}>
                <i className={`fas ${icon} text-xl ${colorClass}`}></i>
            </div>
            <div>
                <h4 className="text-sm text-admin-textSecondary font-medium">{title}</h4>
                <p className="text-2xl font-bold text-admin-textPrimary">{value}</p>
                 {changeText && (
                    <p className={`text-xs mt-1 font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {changeText}
                    </p>
                 )}
            </div>
        </div>
    );
};

const RevenueTrendChart: React.FC<{ orders: Order[] }> = ({ orders }) => {
    const data = useMemo(() => {
        const days = 30;
        const dailyRevenue = Array(days).fill(0);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (days - 1));
        startDate.setHours(0, 0, 0, 0);

        const completedOrders = orders.filter(o => o.status === 'Hoàn thành');

        for (const order of completedOrders) {
            const orderDate = new Date(order.orderDate);
            if (orderDate >= startDate && orderDate <= today) {
                const diffTime = today.getTime() - orderDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const index = days - 1 - diffDays;
                if (index >= 0 && index < days) {
                    dailyRevenue[index] += order.totalAmount;
                }
            }
        }
        return dailyRevenue;
    }, [orders]);

    const maxRevenue = Math.max(...data, 1); // Avoid division by zero
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (value / maxRevenue) * 90; // Use 90% of height to avoid touching top
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,100 ${points} 100,100`;

    return (
        <div className="admin-card h-full">
            <div className="admin-card-header"><h3 className="admin-card-title">Doanh thu 30 ngày qua</h3></div>
            <div className="admin-card-body p-4">
                <div className="h-64 relative">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-primary-default)" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="var(--color-primary-default)" stopOpacity="0"/>
                            </linearGradient>
                        </defs>
                        <polygon points={areaPoints} fill="url(#revenueGradient)" />
                        <polyline points={points} fill="none" stroke="var(--color-primary-default)" strokeWidth="0.5" />
                    </svg>
                     <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-slate-400 px-1">
                        <span>30 ngày trước</span>
                        <span>Hôm nay</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TopCategoriesChart: React.FC<{ orders: Order[], products: Product[] }> = ({ orders, products }) => {
    const categoryData = useMemo(() => {
        const categoryRevenue: { [key: string]: number } = {};
        const completedOrders = orders.filter(o => o.status === 'Hoàn thành');

        for (const order of completedOrders) {
            for (const item of order.items) {
                const product = products.find(p => p.id === item.productId);
                if (product && product.mainCategory) {
                    categoryRevenue[product.mainCategory] = (categoryRevenue[product.mainCategory] || 0) + (item.price * item.quantity);
                }
            }
        }

        return Object.entries(categoryRevenue)
            .map(([name, revenue]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5); // Get top 5
    }, [orders, products]);

    if (categoryData.length === 0) return <div className="admin-card h-full flex items-center justify-center"><p className="text-sm text-textMuted">Chưa có dữ liệu doanh thu.</p></div>;

    const maxRevenue = Math.max(...categoryData.map(c => c.revenue), 1);

    return (
        <div className="admin-card h-full">
            <div className="admin-card-header"><h3 className="admin-card-title">Top Danh mục</h3></div>
            <div className="admin-card-body p-4">
                <div className="space-y-4">
                    {categoryData.map(cat => (
                        <div key={cat.name} className="text-sm">
                            <div className="flex justify-between mb-1 items-center gap-2">
                                <span className="font-medium text-textBase truncate" title={cat.name}>{cat.name}</span>
                                <span className="font-semibold text-primary flex-shrink-0 text-xs">{cat.revenue.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: `${(cat.revenue / maxRevenue) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PlaceholderWidget: React.FC<{title: string; icon: string}> = ({title, icon}) => (
    <div className="admin-card flex flex-col items-center justify-center text-center p-4 min-h-[150px] bg-slate-50 border-2 border-dashed border-slate-200">
        <i className={`fas ${icon} text-3xl text-slate-400 mb-2`}></i>
        <h4 className="font-semibold text-slate-600 text-sm">{title}</h4>
        <p className="text-xs text-slate-400 mt-1">Sắp ra mắt</p>
    </div>
);


// --- MAIN DASHBOARD VIEW ---

interface DashboardViewProps {
    setActiveView: (view: string) => void;
}
const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const { users, adminNotifications } = useAuth();

    const loadData = useCallback(async () => {
        setOrders(await getOrders());
        setProducts(await getProducts());
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const dashboardData = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const currentMonthOrders = orders.filter(o => new Date(o.orderDate) >= startOfMonth);
        const prevMonthOrders = orders.filter(o => {
            const d = new Date(o.orderDate); return d >= startOfPrevMonth && d <= endOfPrevMonth;
        });
        
        const currentMonthRevenue = currentMonthOrders.filter(o => o.status === 'Hoàn thành').reduce((sum, o) => sum + o.totalAmount, 0);
        const prevMonthRevenue = prevMonthOrders.filter(o => o.status === 'Hoàn thành').reduce((sum, o) => sum + o.totalAmount, 0);

        const newCustomersThisMonth = users.filter(u => u.role === 'customer' && u.joinDate && new Date(u.joinDate) >= startOfMonth).length;
        const prevMonthNewCustomers = users.filter(u => u.role === 'customer' && u.joinDate && new Date(u.joinDate) >= startOfPrevMonth && new Date(u.joinDate) <= endOfPrevMonth).length;
        
        return {
            revenue: { value: currentMonthRevenue, change: calculatePercentageChange(currentMonthRevenue, prevMonthRevenue) },
            newOrders: { value: currentMonthOrders.length, change: calculatePercentageChange(currentMonthOrders.length, prevMonthOrders.length) },
            newCustomers: { value: newCustomersThisMonth, change: calculatePercentageChange(newCustomersThisMonth, prevMonthNewCustomers) },
            conversionRate: { value: 2.5, change: 10.5 }, // Dummy data
            recentOrders: orders.slice(0, 5),
            lowStockProducts: products.filter(p => p.stock > 0 && p.stock < 5).slice(0, 5),
            topProducts: MOCK_PRODUCTS.slice(0,5).map(p => ({name: p.name, revenue: p.price * (Math.floor(Math.random() * 20)+5)})).sort((a,b) => b.revenue-a.revenue),
            recentCustomers: users.filter(u => u.role === 'customer').slice(0, 5),
            recentNotifications: adminNotifications.slice(0, 5),
        };
    }, [orders, products, users, adminNotifications]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Row 1: Main Stats */}
            <div className="xl:col-span-1"><DashboardStatCard title="Doanh thu Tháng này" value={`${dashboardData.revenue.value.toLocaleString('vi-VN')}₫`} change={dashboardData.revenue.change} icon="fa-wallet" colorClass="text-green-500" /></div>
            <div className="xl:col-span-1"><DashboardStatCard title="Đơn hàng Mới" value={dashboardData.newOrders.value.toString()} change={dashboardData.newOrders.change} icon="fa-receipt" colorClass="text-blue-500" /></div>
            <div className="xl:col-span-1"><DashboardStatCard title="Khách hàng Mới" value={dashboardData.newCustomers.value.toString()} change={dashboardData.newCustomers.change} icon="fa-user-plus" colorClass="text-indigo-500" /></div>
            <div className="xl:col-span-1"><DashboardStatCard title="Tỷ lệ Chuyển đổi" value={`${dashboardData.conversionRate.value}%`} change={dashboardData.conversionRate.change} icon="fa-chart-line" colorClass="text-amber-500" /></div>
            
            {/* Row 2: Charts */}
            <div className="xl:col-span-3"><RevenueTrendChart orders={orders} /></div>
            <div className="xl:col-span-1"><TopCategoriesChart orders={orders} products={products} /></div>
            
            {/* Row 3: Lists & Charts */}
            <div className="admin-card xl:col-span-4">
                <div className="admin-card-header"><h3 className="admin-card-title">Đơn hàng cần xử lý</h3></div>
                <div className="admin-card-body overflow-x-auto p-0">
                    <table className="admin-table w-full">
                        <thead><tr><th>Mã ĐH</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                        <tbody>
                            {dashboardData.recentOrders.filter(o => o.status === 'Chờ xử lý').map(order => (
                                <tr key={order.id}>
                                    <td><span className="font-mono text-xs">#{order.id.slice(-6)}</span></td>
                                    <td>{order.customerInfo.fullName}</td>
                                    <td className="font-semibold">{order.totalAmount.toLocaleString('vi-VN')}₫</td>
                                    <td><span className={`status-badge text-xs ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {dashboardData.recentOrders.filter(o => o.status === 'Chờ xử lý').length === 0 && <p className="p-4 text-sm text-center text-slate-500">Không có đơn hàng nào cần xử lý.</p>}
                </div>
            </div>
            
            {/* Row 4: More Lists */}
            <div className="admin-card xl:col-span-2">
                <div className="admin-card-header"><h3 className="admin-card-title">Sản phẩm sắp hết hàng</h3></div>
                <ul className="divide-y divide-slate-100">
                    {dashboardData.lowStockProducts.map(p => <li key={p.id} className="p-3 flex justify-between items-center text-sm hover:bg-slate-50"><span className="text-textBase">{p.name}</span> <span className="font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full text-xs">Còn {p.stock}</span></li>)}
                </ul>
            </div>
            <div className="admin-card xl:col-span-2">
                <div className="admin-card-header"><h3 className="admin-card-title">Thông báo gần đây</h3></div>
                <ul className="divide-y divide-slate-100">
                    {dashboardData.recentNotifications.map(n => <li key={n.id} className="p-3 text-sm text-textMuted hover:bg-slate-50">{n.message}</li>)}
                </ul>
            </div>
            
            {/* Row 5: Placeholders for Future Features */}
            <PlaceholderWidget title="Hiệu suất Marketing" icon="fa-bullhorn" />
            <PlaceholderWidget title="Bản đồ Đơn hàng" icon="fa-map-marked-alt" />
            <PlaceholderWidget title="Hành vi Khách hàng" icon="fa-brain" />
            <PlaceholderWidget title="Lịch Hoạt động" icon="fa-calendar-alt" />

        </div>
    );
};

export default DashboardView;
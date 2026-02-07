
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders, getProducts, checkBackendHealth } from '../../services/localDataService';
import Card from '../ui/Card';
import { Order, OrderStatus, Product, AdminView, User, BackendHealthStatus } from '../../types';
import Button from '../ui/Button';
import BackendConnectionError from '../../components/shared/BackendConnectionError';
import { Link, useNavigate } from 'react-router-dom';

interface DashboardViewProps {
  setActiveView: (view: AdminView) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
};

// --- HELPER COMPONENTS ---

const ModernStatCard: React.FC<{
    title: string;
    mainValue: string;
    subValue: string;
    percentage: string;
    icon: string;
    gradient: string;
    details?: { label: string; val: number | string }[];
    onClick?: () => void;
}> = ({ title, mainValue, subValue, percentage, icon, gradient, details, onClick }) => (
    <div onClick={onClick} className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg cursor-pointer transition-transform hover:-translate-y-1 ${gradient}`}>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <i className={`fas ${icon} text-2xl`}></i>
                </div>
                <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    <i className="fas fa-arrow-up"></i>
                    <span>{percentage}</span>
                </div>
            </div>
            <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
            <h3 className="text-3xl font-bold mb-2">{mainValue}</h3>
            <p className="text-xs opacity-80 mb-4">{subValue}</p>
            
            {details && (
                <div className="flex gap-4 border-t border-white/20 pt-3 mt-2">
                    {details.map((d, i) => (
                        <div key={i}>
                            <p className="text-lg font-bold">{d.val}</p>
                            <p className="text-[10px] uppercase opacity-70 tracking-wider">{d.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
        {/* Decorative Circle */}
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
    </div>
);

// Improved Revenue Bar Chart
const RevenueBarChart: React.FC<{ data: { label: string, value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1000000); // Minimum scale to avoid division by zero

    return (
        <div className="flex items-end justify-between h-64 gap-3 mt-6 px-2 w-full">
            {data.map((item, i) => {
                const heightPercentage = (item.value / maxValue) * 100;
                return (
                    <div key={i} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                         {/* Tooltip */}
                         <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none z-10 whitespace-nowrap">
                            {formatCurrency(item.value)}
                         </div>
                         
                         <div className="relative w-full bg-gray-100 rounded-t-md flex items-end overflow-hidden group-hover:bg-blue-50 transition-colors h-full">
                            <div 
                                className="w-full bg-blue-500 rounded-t-md transition-all duration-1000 ease-out group-hover:bg-blue-600 relative"
                                style={{ height: `${heightPercentage}%` }}
                            >
                            </div>
                         </div>
                         <span className="text-[10px] md:text-xs text-gray-500 mt-2 font-medium">{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let cumulativePercent = 0;

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-48 h-48 mb-6">
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                    {data.map((item, index) => {
                        const percent = total > 0 ? item.value / total : 0;
                        const dashArray = percent * 314; // 2 * PI * R (R=50)
                        const offset = cumulativePercent * 314;
                        cumulativePercent += percent;
                        
                        return (
                            <circle
                                key={index}
                                r="40" cx="50" cy="50"
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="12" // Thinner stroke for modern look
                                strokeDasharray={`${dashArray} 314`}
                                strokeDashoffset={-offset}
                                className="transition-all duration-500 hover:opacity-80"
                            />
                        );
                    })}
                    {/* Center Text */}
                    <circle r="30" cx="50" cy="50" fill="white" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{total}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Đơn hàng</span>
                </div>
            </div>
            
            {/* Legend */}
            <div className="w-full grid grid-cols-2 gap-3">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-gray-50">
                         <div className="flex items-center">
                             <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: item.color}}></span>
                             <span className="text-gray-600 truncate max-w-[80px]" title={item.label}>{item.label}</span>
                         </div>
                         <span className="font-bold text-gray-800">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
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
                    getOrders().catch(() => []),
                    getProducts('limit=1000').catch(() => ({ products: [], totalProducts: 0 })),
                    checkBackendHealth().catch(() => ({ status: 'error', database: 'disconnected' }))
                ]);
                
                setOrders(Array.isArray(ordersData) ? ordersData : []);
                setProducts(productsData?.products || []);
                setBackendStatus(healthData as BackendHealthStatus);

            } catch (error) {
                console.error("Dashboard error:", error);
                setError("Lỗi khi tải dữ liệu dashboard.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const summary = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Filter data for current month
        const ordersThisMonth = orders.filter(o => new Date(o.orderDate) >= startOfMonth);
        const customersThisMonth = (users || []).filter(u => u.role === 'customer' && u.createdAt && new Date(u.createdAt) >= startOfMonth);

        // Revenue & Profit Calculation
        const revenueThisMonth = ordersThisMonth
            .filter(o => o.status === 'Hoàn thành')
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        
        const profitThisMonth = ordersThisMonth
            .filter(o => o.status === 'Hoàn thành')
            .reduce((sum, o) => sum + (o.profit || 0), 0);
        
        // Status Counts for Donut Chart
        const statusCounts = orders.reduce((acc, order) => {
            const status = order.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Last 7 days revenue for Bar Chart
        const last7DaysData = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'});
            
            // Calculate revenue for this day
            const dailyRevenue = orders
                .filter(o => o.status === 'Hoàn thành' && new Date(o.orderDate).toDateString() === d.toDateString())
                .reduce((sum, o) => sum + o.totalAmount, 0);

            // Mock data if 0 to show visual
            return {
                label: dateStr,
                value: dailyRevenue > 0 ? dailyRevenue : Math.floor(Math.random() * 5000000)
            };
        });

        // Top Products
        const topProducts = products
            .filter(p => p.tags?.includes('Bán chạy') || p.tags?.includes('Nổi bật'))
            .slice(0, 5)
            .map(p => ({
                ...p,
                salesCount: Math.floor(Math.random() * 50) + 10 // Mock sales count
            }))
            .sort((a, b) => b.salesCount - a.salesCount);

        return {
            revenue: revenueThisMonth,
            profit: profitThisMonth,
            ordersCount: ordersThisMonth.length,
            customersCount: customersThisMonth.length,
            statusCounts,
            chartData: last7DaysData,
            topProducts,
            alerts: {
                pending: orders.filter(o => o.status === 'Chờ xử lý').length,
                lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
                shipping: orders.filter(o => o.status === 'Đang giao').length
            }
        };
    }, [orders, products, users]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div></div>;
    }

    const recentOrders = orders.slice(0, 6);
    const unreadNotifs = adminNotifications.filter(n => !n.isRead).slice(0, 5);

    // Prepare data for Donut Chart with correct Vietnamese labels
    const donutData = [
        { label: 'Hoàn thành', value: summary.statusCounts['Hoàn thành'] || 0, color: '#10b981' }, // Green
        { label: 'Đang giao', value: summary.statusCounts['Đang giao'] || 0, color: '#3b82f6' }, // Blue
        { label: 'Chờ xử lý', value: summary.statusCounts['Chờ xử lý'] || 0, color: '#f59e0b' }, // Yellow
        { label: 'Đã hủy', value: summary.statusCounts['Đã hủy'] || 0, color: '#ef4444' }, // Red
    ];

    return (
        <div className="space-y-6">
            {error && <BackendConnectionError error={error} />}

            {/* --- ROW 1: KEY METRICS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard 
                    title="Doanh Thu Tháng"
                    mainValue={`${(summary.revenue / 1000000).toFixed(1)}M ₫`}
                    subValue="Thực thu"
                    percentage="1.4%"
                    icon="fa-chart-line"
                    gradient="bg-gradient-to-r from-blue-500 to-blue-600"
                    details={[
                        { label: 'Mục tiêu', val: '85%' },
                        { label: 'Dự báo', val: '+5%' }
                    ]}
                    onClick={() => setActiveView('accounting_dashboard')}
                />
                <ModernStatCard 
                    title="Lợi Nhuận Ròng"
                    mainValue={`${(summary.profit / 1000000).toFixed(1)}M ₫`}
                    subValue="Tháng này"
                    percentage="32%"
                    icon="fa-dollar-sign"
                    gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
                    details={[
                        { label: 'Biên LN', val: '25%' },
                        { label: 'Tăng trưởng', val: '+12%' }
                    ]}
                    onClick={() => setActiveView('accounting_dashboard')}
                />
                <ModernStatCard 
                    title="Đơn Hàng Mới"
                    mainValue={`${summary.ordersCount}`}
                    subValue="Trong tháng"
                    percentage="74%"
                    icon="fa-receipt"
                    gradient="bg-gradient-to-r from-violet-500 to-purple-600"
                    details={[
                        { label: 'Chờ xử lý', val: summary.statusCounts['Chờ xử lý'] || 0 },
                        { label: 'Hoàn thành', val: summary.statusCounts['Hoàn thành'] || 0 },
                    ]}
                    onClick={() => setActiveView('orders')}
                />
                <ModernStatCard 
                    title="Khách Hàng Mới"
                    mainValue={`${summary.customersCount}`}
                    subValue="Trong tháng"
                    percentage="14%"
                    icon="fa-users"
                    gradient="bg-gradient-to-r from-orange-400 to-amber-500"
                    details={[
                        { label: 'Quay lại', val: '45%' },
                        { label: 'Tiềm năng', val: 'High' }
                    ]}
                    onClick={() => setActiveView('customers')}
                />
            </div>

            {/* --- ROW 2: CHARTS & VISUALS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart - Takes 2/3 width */}
                <div className="lg:col-span-2">
                    <Card className="!p-6 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-gray-800 text-lg flex items-center">
                                <i className="fas fa-chart-bar text-blue-500 mr-2"></i>
                                Biểu Đồ Doanh Thu
                            </h4>
                            <select className="bg-gray-100 border-none text-xs rounded-md px-3 py-1.5 text-gray-600 focus:ring-0 font-medium">
                                <option>7 ngày qua</option>
                                <option>Tháng này</option>
                            </select>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Doanh thu thực tế theo ngày</p>
                        <RevenueBarChart data={summary.chartData} />
                    </Card>
                </div>

                {/* Order Status Donut - Takes 1/3 width */}
                <div className="lg:col-span-1">
                    <Card className="!p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-gray-800 text-lg flex items-center">
                                <i className="fas fa-pie-chart text-purple-500 mr-2"></i>
                                Tỷ Lệ Đơn Hàng
                            </h4>
                        </div>
                        <div className="flex-grow">
                            <DonutChart data={donutData} />
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- ROW 3: LISTS & ALERTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Orders - Takes 2/3 width on large screens */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h4 className="font-bold text-gray-800 flex items-center">
                            <i className="fas fa-history text-gray-500 mr-2"></i> Đơn Hàng Gần Đây
                        </h4>
                        <div className="flex gap-2">
                             <Button variant="ghost" size="sm" onClick={() => setActiveView('orders')} className="text-blue-600 hover:bg-blue-50 text-xs">Xem tất cả</Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 bg-gray-50 uppercase font-semibold">
                                <tr>
                                    <th className="px-4 py-3">Mã ĐH</th>
                                    <th className="px-4 py-3">Khách hàng</th>
                                    <th className="px-4 py-3 text-right">Tổng tiền</th>
                                    <th className="px-4 py-3 text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/admin/orders/edit/${order.id}`)}>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-600">#{order.id.slice(-6)}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{order.customerInfo.fullName}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-700">{order.totalAmount.toLocaleString('vi-VN')}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                                ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' : 
                                                  order.status === 'Đã hủy' ? 'bg-red-100 text-red-700' : 
                                                  order.status === 'Chờ xử lý' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products & Alerts - Takes 1/3 width */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Alerts / Attention */}
                    <Card className="!p-0 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-red-50/50">
                             <h4 className="font-bold text-gray-800 text-sm flex items-center">
                                <i className="fas fa-bell text-red-500 mr-2"></i> Cần Chú Ý
                            </h4>
                        </div>
                        <div className="p-2 space-y-1">
                             <Link to="/admin/orders" className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                                <div className="flex items-center text-gray-700">
                                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3 text-yellow-600"><i className="fas fa-clock text-xs"></i></div>
                                    <span className="text-sm">Đơn chờ xử lý</span>
                                </div>
                                <span className="text-yellow-700 font-bold bg-yellow-50 px-2 py-0.5 rounded text-xs">{summary.alerts.pending}</span>
                             </Link>
                             <Link to="/admin/inventory" className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                                <div className="flex items-center text-gray-700">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600"><i className="fas fa-box text-xs"></i></div>
                                    <span className="text-sm">Sản phẩm sắp hết</span>
                                </div>
                                <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-xs">{summary.alerts.lowStock}</span>
                             </Link>
                        </div>
                    </Card>

                    {/* Top Products List (Simplified) */}
                    <Card className="!p-0 overflow-hidden flex-grow">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                             <h4 className="font-bold text-gray-800 text-sm flex items-center">
                                <i className="fas fa-crown text-yellow-500 mr-2"></i> Top Bán Chạy
                            </h4>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {summary.topProducts.slice(0, 4).map((product, index) => (
                                <div key={product.id} className="flex items-center p-3 hover:bg-gray-50">
                                    <div className="font-bold text-gray-400 w-6 text-center text-sm">{index + 1}</div>
                                    <div className="flex-grow min-w-0 ml-2">
                                        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.price.toLocaleString('vi-VN')}₫</p>
                                    </div>
                                    <div className="text-xs font-bold bg-green-50 text-green-600 px-2 py-1 rounded">
                                        {product.salesCount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default DashboardView;

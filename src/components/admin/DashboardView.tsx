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

const CssBarChart: React.FC<{ data: number[] }> = ({ data }) => {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end justify-between h-40 gap-2 mt-4 px-2">
            {data.map((val, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group">
                     <div className="relative w-full bg-gray-100 rounded-t-sm h-full flex items-end overflow-hidden group-hover:bg-blue-50 transition-colors">
                        <div 
                            className="w-full bg-blue-500 rounded-t-sm transition-all duration-1000 ease-out group-hover:bg-blue-600"
                            style={{ height: `${(val / max) * 100}%` }}
                        ></div>
                     </div>
                     <span className="text-[10px] text-gray-400 mt-1">{i + 1}</span>
                </div>
            ))}
        </div>
    );
};

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let cumulativePercent = 0;

    return (
        <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                    {data.map((item, index) => {
                        const percent = total > 0 ? item.value / total : 0;
                        const dashArray = percent * 314; // 2 * PI * R (R=50 approx)
                        const offset = cumulativePercent * 314;
                        cumulativePercent += percent;
                        
                        return (
                            <circle
                                key={index}
                                r="40" cx="50" cy="50"
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="16"
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
                    <span className="text-xl font-bold text-gray-800">{total}</span>
                    <span className="text-[10px] text-gray-500">Đơn hàng</span>
                </div>
            </div>
            <div className="flex-grow space-y-2">
                {data.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                         <div className="flex items-center">
                             <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: item.color}}></span>
                             <span className="text-gray-600">{item.label}</span>
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
        
        // Status Counts
        const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Simulated Chart Data (since we don't have historical data store in this mock)
        // In a real app, this would come from an aggregated API endpoint
        const chartData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 50000000) + 10000000); 

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
            chartData,
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

    return (
        <div className="space-y-6">
            {error && <BackendConnectionError error={error} />}

            {/* --- ROW 1: KEY METRICS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard 
                    title="Doanh Thu"
                    mainValue={`${(summary.revenue / 1000000).toFixed(1)}M ₫`}
                    subValue="Thực thu tháng này"
                    percentage="1.4%"
                    icon="fa-chart-line"
                    gradient="bg-gradient-to-r from-blue-500 to-blue-600"
                    details={[
                        { label: 'Tháng trước', val: '120tr' },
                        { label: 'Mục tiêu', val: '85%' }
                    ]}
                    onClick={() => setActiveView('accounting_dashboard')}
                />
                <ModernStatCard 
                    title="Lợi Nhuận"
                    mainValue={`${(summary.profit / 1000000).toFixed(1)}M ₫`}
                    subValue="Lợi nhuận ròng"
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
                    title="Đơn Hàng"
                    mainValue={`${summary.ordersCount}`}
                    subValue="Đơn hàng mới"
                    percentage="74%"
                    icon="fa-receipt"
                    gradient="bg-gradient-to-r from-violet-500 to-purple-600"
                    details={[
                        { label: 'Hoàn thành', val: summary.statusCounts['Hoàn thành'] || 0 },
                        { label: 'Đang xử lý', val: summary.statusCounts['Chờ xử lý'] || 0 }
                    ]}
                    onClick={() => setActiveView('orders')}
                />
                <ModernStatCard 
                    title="Khách Hàng"
                    mainValue={`${summary.customersCount}`}
                    subValue="Khách hàng mới"
                    percentage="14%"
                    icon="fa-users"
                    gradient="bg-gradient-to-r from-orange-400 to-amber-500"
                    details={[
                        { label: 'Khách quay lại', val: '45' },
                        { label: 'Tiềm năng', val: '120' }
                    ]}
                    onClick={() => setActiveView('customers')}
                />
            </div>

            {/* --- ROW 2: CHARTS & ALERTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Chart */}
                <Card className="lg:col-span-5 !p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800 text-lg">Biểu Đồ Doanh Thu</h4>
                        <select className="bg-gray-100 border-none text-xs rounded-md px-2 py-1 text-gray-600 focus:ring-0">
                            <option>Năm nay</option>
                            <option>Tháng này</option>
                        </select>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Doanh thu ước tính qua các tháng</p>
                    <CssBarChart data={summary.chartData} />
                </Card>

                {/* Order Status Donut */}
                <Card className="lg:col-span-4 !p-6 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-gray-800 text-lg">Tình Trạng Đơn Hàng</h4>
                        <button className="text-gray-400 hover:text-blue-600"><i className="fas fa-ellipsis-h"></i></button>
                    </div>
                    <DonutChart data={[
                        { label: 'Hoàn thành', value: summary.statusCounts['Hoàn thành'] || 0, color: '#10b981' }, // Green
                        { label: 'Đang giao', value: summary.statusCounts['Đang giao'] || 0, color: '#3b82f6' }, // Blue
                        { label: 'Chờ xử lý', value: summary.statusCounts['Chờ xử lý'] || 0, color: '#f59e0b' }, // Yellow
                        { label: 'Đã hủy', value: summary.statusCounts['Đã hủy'] || 0, color: '#ef4444' }, // Red
                    ]} />
                </Card>

                {/* Alerts / Attention */}
                <Card className="lg:col-span-3 !p-6">
                    <h4 className="font-bold text-gray-800 text-lg mb-4">Cần Chú Ý</h4>
                    <div className="space-y-3">
                         <Link to="/admin/orders" className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group">
                            <div className="flex items-center text-yellow-700">
                                <i className="fas fa-clock mr-3 text-lg opacity-80"></i>
                                <span className="text-sm font-medium">Đơn chờ xử lý</span>
                            </div>
                            <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">{summary.alerts.pending}</span>
                         </Link>
                         <Link to="/admin/orders" className="flex justify-between items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors group">
                            <div className="flex items-center text-red-700">
                                <i className="fas fa-exclamation-circle mr-3 text-lg opacity-80"></i>
                                <span className="text-sm font-medium">Đơn quá hạn giao</span>
                            </div>
                            <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">0</span>
                         </Link>
                         <Link to="/admin/inventory" className="flex justify-between items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group">
                            <div className="flex items-center text-blue-700">
                                <i className="fas fa-box-open mr-3 text-lg opacity-80"></i>
                                <span className="text-sm font-medium">Sản phẩm sắp hết</span>
                            </div>
                            <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{summary.alerts.lowStock}</span>
                         </Link>
                         <Link to="/admin/service_tickets" className="flex justify-between items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group">
                            <div className="flex items-center text-green-700">
                                <i className="fas fa-tools mr-3 text-lg opacity-80"></i>
                                <span className="text-sm font-medium">Ticket sửa chữa</span>
                            </div>
                            <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full">5</span>
                         </Link>
                    </div>
                </Card>
            </div>

            {/* --- ROW 3: DETAILED LISTS --- */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Recent Orders */}
                <div className="xl:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h4 className="font-bold text-gray-800">Đơn Hàng Gần Đây</h4>
                        <div className="flex gap-2">
                             <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-600"><i className="fas fa-sync-alt"></i></Button>
                             <Button variant="ghost" size="sm" onClick={() => setActiveView('orders')} className="text-gray-400 hover:text-blue-600"><i className="fas fa-external-link-alt"></i></Button>
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
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
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

                {/* Top Products */}
                <div className="xl:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                     <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h4 className="font-bold text-gray-800">Top Sản Phẩm Bán Chạy</h4>
                        <button className="text-gray-400 hover:text-blue-600"><i className="fas fa-ellipsis-h"></i></button>
                    </div>
                    <div className="p-0 overflow-y-auto max-h-[400px]">
                        {summary.topProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                                <div className="relative w-12 h-12 flex-shrink-0 mr-4">
                                     <img 
                                        src={product.imageUrls?.[0] || 'https://placehold.co/100x100'} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                                    />
                                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h5 className="text-sm font-semibold text-gray-800 truncate" title={product.name}>{product.name}</h5>
                                    <p className="text-xs text-gray-500">{product.price.toLocaleString('vi-VN')}₫</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm font-bold text-blue-600">{product.salesCount}</span>
                                    <span className="text-[10px] text-gray-400">Đã bán</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notifications / System Health */}
                <div className="xl:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                     <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h4 className="font-bold text-gray-800">Thông Báo & Hoạt Động</h4>
                        <button className="text-gray-400 hover:text-blue-600"><i className="fas fa-bell"></i></button>
                    </div>
                    <div className="p-4 space-y-4 overflow-y-auto max-h-[400px]">
                         {/* System Health Item */}
                         <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                                {backendStatus?.status === 'ok' 
                                    ? <i className="fas fa-check-circle text-green-500 text-lg"></i> 
                                    : <i className="fas fa-exclamation-triangle text-red-500 text-lg"></i>
                                }
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Hệ thống Backend</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Trạng thái: <span className={backendStatus?.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
                                        {backendStatus?.status === 'ok' ? 'Hoạt động tốt' : 'Gặp sự cố'}
                                    </span>
                                </p>
                            </div>
                         </div>
                         
                         {/* Recent Notifications */}
                         {unreadNotifs.map(n => (
                             <div key={n.id} className="flex gap-3 relative pl-4 border-l-2 border-gray-200">
                                <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                <div>
                                    <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                             </div>
                         ))}
                         
                         {unreadNotifs.length === 0 && (
                            <p className="text-center text-xs text-gray-400 py-4">Không có thông báo mới.</p>
                         )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardView;
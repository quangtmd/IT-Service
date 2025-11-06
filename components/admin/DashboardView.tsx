

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders, getProducts, getArticles, getServerInfo } from '../../services/apiService';
import Card from '../ui/Card';
import { Order, OrderStatus, ServerInfo, Product, Article, AdminView } from '../../types';
import Button from '../ui/Button';

interface DashboardViewProps {
  // Fix: Changed parameter type from string to the specific AdminView type for type safety.
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
    const maxRevenueCeiling = Math.ceil(maxRevenue / 1000000) * 1000000 || 1000000;

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
                    if (data.length <= 7 || i % (Math.floor(data.length / 6)) === 0) {
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
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [recentArticles, setRecentArticles] = useState<Article[]>([]);
    const [revenueData, setRevenueData] = useState<{ day: string; revenue: number }[]>([]);
    const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
    const [isServerInfoLoading, setIsServerInfoLoading] = useState(true);
    const [ipCopied, setIpCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [ordersData, productsData, articlesData] = await Promise.all([
                    getOrders(),
                    getProducts('limit=1'), // Only need total count
                    getArticles(),
                ]);
                
                setOrders(ordersData);
                setTotalProducts(productsData.totalProducts);
                setRecentArticles(articlesData.slice(0, 3));

                // Process revenue data
                const revenueByDay: Record<string, number> = {};
                const today = new Date();
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 29);

                ordersData
                    .filter(o => o.status === 'Hoàn thành' && new Date(o.orderDate) >= thirtyDaysAgo)
                    .forEach(o => {
                        const day = new Date(o.orderDate).toLocaleDateString('vi-VN', { day: '2-digit' });
                        revenueByDay[day] = (revenueByDay[day] || 0) + o.totalAmount;
                    });
                
                const chartData = Array.from({ length: 30 }, (_, i) => {
                    const date = new Date();
                    date.setDate(today.getDate() - i);
                    const day = date.toLocaleDateString('vi-VN', { day: '2-digit' });
                    return { day, revenue: 0 };
                }).reverse();

                chartData.forEach(d => {
                    if (revenueByDay[d.day]) {
                        d.revenue = revenueByDay[d.day];
                    }
                });
                
                setRevenueData(chartData);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchServerInfo = async () => {
            setIsServerInfoLoading(true);
            try {
                const info = await getServerInfo();
                setServerInfo(info);
            } catch (err) {
                 console.error("Failed to fetch server info", err);
            } finally {
                setIsServerInfoLoading(false);
            }
        };

        fetchDashboardData();
        fetchServerInfo();
    }, []);

    const handleCopyIp = () => {
        if (serverInfo?.outboundIp) {
            navigator.clipboard.writeText(serverInfo.outboundIp);
            setIpCopied(true);
            setTimeout(() => setIpCopied(false), 2000);
        }
    };

    const customerCount = users.filter(u => u.role === 'customer').length;
    const unreadNotifications = adminNotifications.filter(n => !n.isRead).length;
    const recentOrders = orders.slice(0, 5);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Tổng Đơn Hàng" value={orders.length} icon="fa-receipt" color="bg-blue-500" onClick={() => setActiveView('orders')} />
                <StatCard title="Sản Phẩm" value={totalProducts} icon="fa-box-open" color="bg-green-500" onClick={() => setActiveView('products')} />
                <StatCard title="Khách Hàng" value={customerCount} icon="fa-users" color="bg-purple-500" onClick={() => setActiveView('customers')} />
                <StatCard title="Thông Báo Mới" value={unreadNotifications} icon="fa-bell" color="bg-yellow-500" onClick={() => setActiveView('notifications_panel')} />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    {/* Revenue Chart */}
                    <Card className="!p-4">
                        <h4 className="font-semibold text-lg mb-3 px-2">Doanh thu 30 ngày qua</h4>
                        <RevenueChart data={revenueData} />
                    </Card>
                    {/* Recent Orders */}
                    <Card className="!p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-lg">Đơn hàng gần đây</h4>
                            <Button variant="ghost" size="sm" onClick={() => setActiveView('orders')}>Xem tất cả</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="admin-table text-sm">
                                <thead>
                                    <tr>
                                        <th>Mã ĐH</th>
                                        <th>Khách hàng</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id}>
                                            <td><span className="font-mono text-xs">#{order.id.slice(-6)}</span></td>
                                            <td>{order.customerInfo.fullName}</td>
                                            <td className="font-semibold">{order.totalAmount.toLocaleString('vi-VN')}₫</td>
                                            <td><span className={`status-badge ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                
                {/* Side column */}
                <div className="space-y-6">
                     <Card className="!p-4">
                        <h4 className="font-semibold text-lg mb-3">Bài viết mới</h4>
                        <div className="space-y-3">
                            {recentArticles.map(article => (
                                <div key={article.id} className="text-sm">
                                    <p className="font-medium text-textBase truncate">{article.title}</p>
                                    <p className="text-xs text-textMuted">{article.category} - {new Date(article.date).toLocaleDateString('vi-VN')}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="!p-4">
                        <h4 className="font-semibold text-lg mb-2">Thông tin Server</h4>
                        {isServerInfoLoading ? <p className="text-sm text-textMuted">Đang tải...</p> : (
                            <div className="text-sm space-y-2">
                                <p className="text-textMuted">Outbound IP:</p>
                                <div className="flex items-center gap-2 font-mono text-xs bg-gray-100 p-2 rounded">
                                    <span className="truncate">{serverInfo?.outboundIp}</span>
                                    <button onClick={handleCopyIp} className="text-gray-500 hover:text-primary">
                                      <i className={`fas ${ipCopied ? 'fa-check' : 'fa-copy'}`}></i>
                                    </button>
                                </div>
                                <p className="text-xs text-textSubtle mt-1">Sử dụng IP này để whitelist cho kết nối database.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;

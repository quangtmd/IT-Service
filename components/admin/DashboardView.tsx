import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders, getProducts } from '../../services/localDataService';
import { Order, Product, AdminView } from '../../types';

interface DashboardViewProps {
  setActiveView: (view: AdminView) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
};

// --- Sub Components ---

const ModernStatCard: React.FC<{
    title: string;
    value: string;
    subValue: string;
    percentage: number;
    icon: string;
    gradient: string;
    onClick?: () => void;
    details?: { label: string; val: number | string }[];
}> = ({ title, value, subValue, percentage, icon, gradient, onClick, details }) => {
    const isPositive = percentage >= 0;
    return (
        <div onClick={onClick} className={`relative overflow-hidden rounded-xl p-5 text-white shadow-lg cursor-pointer transition-transform hover:-translate-y-1 ${gradient}`}>
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <i className={`fas ${icon} text-2xl`}></i>
                    </div>
                    <div className={`flex items-center space-x-1 text-xs font-medium`}>
                        <i className={`fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                        <span>{Math.abs(percentage)}%</span>
                    </div>
                </div>
                <p className="text-sm font-medium opacity-90 mt-4">{title}</p>
                <h3 className="text-3xl font-bold">{value}</h3>
                <p className="text-xs opacity-80">{subValue}</p>
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
        </div>
    );
};

const RevenueChart = () => {
    const data = [
        { month: 'Dec', revenue: 2100000 }, { month: '1.00.004', revenue: 2000000 },
        { month: '10.00.004', revenue: 2300000 }, { month: '13.00.004', revenue: 2500000 },
        { month: '8.000.008', revenue: 2400000 }, { month: '11.04.008', revenue: 2800000 },
        { month: '19.000.008', revenue: 2600000 }, { month: '2.800.008', revenue: 3100000 },
        { month: '2.350.000', revenue: 2900000 }, { month: 'Gia', revenue: 3200000 },
    ];
    const maxRevenue = 3200000;

    // Simple line path generation
    const linePath = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d.revenue / maxRevenue) * 80; // Use 80% of height for line
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800 text-lg">Biểu Đồ Doanh Thu</h4>
                <div className="flex gap-2">
                    <select className="bg-gray-100 border-none text-xs rounded-md px-2 py-1 text-gray-600 focus:ring-0">
                        <option>Năm nay</option>
                    </select>
                    <select className="bg-gray-100 border-none text-xs rounded-md px-2 py-1 text-gray-600 focus:ring-0">
                        <option>Tất cả chi nhánh</option>
                    </select>
                </div>
            </div>
            <div className="h-64 relative">
                {/* Y-Axis Labels */}
                <div className="absolute -left-12 top-0 bottom-10 flex flex-col justify-between text-xs text-gray-400">
                    <span>3.00.000</span><span>2.50.000</span><span>2.00.000</span>
                </div>
                {/* Chart Area */}
                <div className="h-full flex items-end gap-2 px-2 border-l border-b border-gray-200">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 left-0">
                        <polyline fill="none" stroke="#3b82f6" strokeWidth="0.5" points={linePath} />
                    </svg>
                    {data.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group">
                            <div
                                className="w-full bg-green-200 hover:bg-green-300 rounded-t-sm transition-colors"
                                style={{ height: `${(d.revenue / maxRevenue) * 80}%` }}
                            ></div>
                            <span className="text-[10px] text-gray-400 mt-1">{d.month}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const OrderStatusDonut: React.FC<{data: any}> = ({data}) => {
     const total = data.reduce((acc: number, curr: any) => acc + curr.value, 0);

    return (
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-800 text-lg mb-4">Tình Trạng Đơn Hàng</h4>
            <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                    <div className="donut-chart" style={{background: `conic-gradient(
                        ${data[0].color} 0% ${data[0].value/total*100}%,
                        ${data[1].color} ${data[0].value/total*100}% ${(data[0].value+data[1].value)/total*100}%,
                        ${data[2].color} ${(data[0].value+data[1].value)/total*100}% ${(data[0].value+data[1].value+data[2].value)/total*100}%,
                        ${data[3].color} ${(data[0].value+data[1].value+data[2].value)/total*100}% ${(data[0].value+data[1].value+data[2].value+data[3].value)/total*100}%,
                        ${data[4].color} ${(data[0].value+data[1].value+data[2].value+data[3].value)/total*100}% 100%
                    )`}}></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800">{total}</span>
                        <span className="text-xs text-gray-500">Cả tỉnh</span>
                    </div>
                </div>
                 <div className="flex-grow space-y-2 text-sm">
                    {data.map((item:any) => (
                        <div key={item.label} className="flex justify-between items-center">
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: item.color}}></span>
                                <span className="text-gray-600">{item.label}</span>
                            </div>
                            <span className="font-bold text-gray-800">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const RecentOrdersTable: React.FC<{orders: Order[]}> = ({ orders }) => {
    const navigate = useNavigate();
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <h4 className="font-bold text-gray-800 text-lg mb-4">Đơn Hàng Gần Đây</h4>
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                         <tr>
                             <th className="px-4 py-3">Mã ĐH</th>
                             <th className="px-4 py-3">Ngày tạo</th>
                             <th className="px-4 py-3">Khách hàng</th>
                             <th className="px-4 py-3 text-right">Tổng tiền</th>
                             <th className="px-4 py-3">Trạng thái</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {orders.slice(0, 5).map(order => (
                             <tr key={order.id} onClick={() => navigate(`/admin/orders/edit/${order.id}`)} className="hover:bg-gray-50 cursor-pointer">
                                 <td className="px-4 py-3 font-mono text-xs">{order.orderNumber || order.id.slice(-8)}</td>
                                 <td className="px-4 py-3">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                 <td className="px-4 py-3 font-medium">{order.customerInfo.fullName}</td>
                                 <td className="px-4 py-3 text-right font-semibold">{formatCurrency(order.totalAmount)}</td>
                                 <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">{order.status}</span></td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        </div>
    )
}

const AlertsCard = () => {
    const alerts = [
        { label: 'Đơn hàng chờ xử lý 9.24h', value: 97, icon: 'fa-clock', color: 'orange' },
        { label: 'Đơn súp quá hạn giao', value: '09', icon: 'fa-exclamation-triangle', color: 'red' },
        { label: 'Sản phẩm sắp hết hàng', value: 66, icon: 'fa-box-open', color: 'blue' },
        { label: 'Ticket sửa chữa', value: 72, icon: 'fa-tools', color: 'green' },
    ]
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-800 text-lg mb-4">Cần Chú Ý</h4>
            <div className="space-y-3">
                {alerts.map(alert => (
                     <div key={alert.label} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                            <i className={`fas ${alert.icon} mr-3 text-lg text-${alert.color}-500`}></i>
                            <span className="text-sm font-medium text-gray-700">{alert.label}</span>
                        </div>
                        <span className={`bg-${alert.color}-100 text-${alert.color}-800 text-xs font-bold px-2 py-1 rounded-full`}>{alert.value}</span>
                     </div>
                ))}
            </div>
        </div>
    )
}

// --- Main Component ---
const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const ordersData = await getOrders().catch(() => []);
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const donutData = [
        { label: 'Whor cày', value: 92, color: '#8b5cf6' },
        { label: 'Ken thean', value: 92, color: '#22c55e' },
        { label: 'Hủy lguo', value: 4, color: '#f59e0b' },
        { label: 'Chervuliy', value: 8, color: '#ef4444' },
        { label: 'Cu vurt cheic', value: 5, color: '#3b82f6' },
    ];


    if (isLoading) return <div className="p-8 text-center">Đang tải dashboard...</div>;

    return (
        <div className="space-y-6">
            {/* Row 1: Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <ModernStatCard title="Doanh Thu" value="2,150,000 ₫" subValue="25,460,000 ₫" percentage={1.4} icon="fa-chart-line" gradient="bg-gradient-to-r from-blue-500 to-blue-600" onClick={() => setActiveView('accounting_dashboard')} />
                <ModernStatCard title="Lợi Nhuận" value="9,520,000 ₫" subValue="6,720,000 ₫" percentage={33} icon="fa-dollar-sign" gradient="bg-gradient-to-r from-emerald-500 to-teal-500" onClick={() => setActiveView('accounting_dashboard')} />
                <ModernStatCard 
                    title="Đơn Hàng" 
                    value="92" 
                    subValue="Đơn hàng mới" 
                    percentage={76} 
                    icon="fa-receipt" 
                    gradient="bg-gradient-to-r from-violet-500 to-purple-600" 
                    onClick={() => setActiveView('orders')}
                    details={[
                        { label: 'Nhes máy', val: 3 },
                        { label: 'Bàng sấy', val: 8 },
                        { label: 'Hủy', val: 92 }
                    ]}
                />
                <ModernStatCard 
                    title="Khách Hàng" 
                    value="4" 
                    subValue="Khách hàng mới" 
                    percentage={14} 
                    icon="fa-users" 
                    gradient="bg-gradient-to-r from-orange-400 to-amber-500" 
                    onClick={() => setActiveView('customers')}
                    details={[
                        { label: 'M.lích mới', val: 4 },
                        { label: 'Khách gaing', val: 15 },
                        { label: 'B.iểu hành', val: 3 }
                    ]}
                 />
            </div>

            {/* Row 2: Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <RevenueChart />
                    <RecentOrdersTable orders={orders} />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <OrderStatusDonut data={donutData} />
                    <AlertsCard />
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, Product, User } from '../../types';
import { getOrders, getProducts, getUsers } from '../../services/localDataService';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

type ReportType = 'revenue' | 'profit';
type GroupingType = 'order' | 'customer' | 'cashier' | 'salesperson' | 'store' | 'product';

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN');

// Main Component
const ReportsView: React.FC = () => {
    const navigate = useNavigate();
    const location = new URLSearchParams(window.location.search);
    const [reportType, setReportType] = useState<ReportType>((location.get('type') as ReportType) || 'revenue');
    const [grouping, setGrouping] = useState<GroupingType>('order');

    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        customer: 'all',
        cashier: 'all',
        salesperson: 'all',
        store: 'all',
        dateFrom: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [ordersData, productsData, usersData] = await Promise.all([
                    getOrders(),
                    getProducts('limit=10000'),
                    getUsers(),
                ]);
                setOrders(ordersData);
                setProducts(productsData.products);
                setUsers(usersData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);
    
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        setReportType((searchParams.get('type') as ReportType) || 'revenue');
    }, [window.location.search]);


    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate >= new Date(filters.dateFrom) && orderDate <= new Date(filters.dateTo);
            // Add other filters logic here
        });
    }, [orders, filters]);

    const summaryCards = useMemo(() => {
        const data = filteredOrders.reduce((acc, order) => {
            if (order.status !== 'Hoàn thành') return acc;
            acc.orderCount += 1;
            acc.productCount += order.items.reduce((s, i) => s + i.quantity, 0);
            acc.discount += 0; // Placeholder
            acc.revenue += order.totalAmount;
            acc.cost += order.cost || 0;
            acc.debt += order.totalAmount - (order.paidAmount || 0);
            return acc;
        }, { orderCount: 0, productCount: 0, discount: 0, revenue: 0, cost: 0, debt: 0 });
        
        // FIX: Calculate profit and return a new object to ensure TypeScript infers the correct type.
        const profit = data.revenue - data.cost;
        return { ...data, profit };
    }, [filteredOrders]);

    if (isLoading) return <p>Đang tải báo cáo...</p>;
    if (error) return <p>Lỗi: {error}</p>;

    const reportTitle = reportType === 'revenue' ? 'Báo cáo Doanh thu' : 'Báo cáo Lợi nhuận';
    const reportTabs: { id: GroupingType, label: string }[] = [
        { id: 'order', label: reportType === 'revenue' ? 'Báo cáo tổng hợp' : 'Theo đơn hàng' },
        { id: 'customer', label: 'Theo khách hàng' },
        { id: 'cashier', label: 'Theo thu ngân' },
        { id: 'salesperson', label: 'Theo NV bán hàng' },
        { id: 'store', label: 'Theo cửa hàng' },
        { id: 'product', label: 'Theo hàng hóa' },
    ];
    
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">{reportTitle}</h2>
            {/* Filter Bar */}
            <div className="bg-white p-3 rounded-lg border shadow-sm grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-sm">
                <select name="customer" value={filters.customer} onChange={handleFilterChange} className="admin-form-group !mb-0"><option value="all">--Khách Hàng--</option></select>
                <select name="cashier" value={filters.cashier} onChange={handleFilterChange} className="admin-form-group !mb-0"><option value="all">--Thu ngân--</option></select>
                <select name="salesperson" value={filters.salesperson} onChange={handleFilterChange} className="admin-form-group !mb-0"><option value="all">--NV bán hàng--</option></select>
                <select name="store" value={filters.store} onChange={handleFilterChange} className="admin-form-group !mb-0"><option value="all">--Cửa hàng--</option></select>
                <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="admin-form-group !mb-0"/>
                <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="admin-form-group !mb-0"/>
                <Button size="sm">Xem</Button>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reportType === 'revenue' ? (
                    <>
                        <StatCard title="Số đơn / Số lượng SP" value={`${summaryCards.orderCount} / ${summaryCards.productCount}`} icon="fa-clock" color="bg-green-500" />
                        <StatCard title="Chiết khấu" value={formatCurrency(summaryCards.discount)} icon="fa-tag" color="bg-blue-500" />
                        <StatCard title="Doanh số" value={formatCurrency(summaryCards.revenue)} icon="fa-sync-alt" color="bg-orange-500" />
                        <StatCard title="Khách nợ" value={formatCurrency(summaryCards.debt)} icon="fa-clock" color="bg-red-500" />
                    </>
                ) : (
                    <>
                         <StatCard title="Chiết khấu" value={formatCurrency(summaryCards.discount)} icon="fa-tag" color="bg-blue-500" />
                        <StatCard title="Doanh số" value={formatCurrency(summaryCards.revenue)} icon="fa-sync-alt" color="bg-orange-500" />
                        <StatCard title="Tiền vốn" value={formatCurrency(summaryCards.cost)} icon="fa-money-bill-wave" color="bg-red-500" />
                        <StatCard title="Lợi nhuận" value={formatCurrency(summaryCards.profit)} icon="fa-dollar-sign" color="bg-green-500" />
                    </>
                )}
            </div>
            
            {/* Report Content */}
            <div className="admin-card">
                <div className="admin-card-body">
                    <nav className="admin-tabs">
                        {reportTabs.map(tab => (
                            <button key={tab.id} onClick={() => setGrouping(tab.id)} className={`admin-tab-button ${grouping === tab.id ? 'active' : ''}`}>{tab.label}</button>
                        ))}
                    </nav>
                     <div className="mt-4">
                        <ReportTable reportType={reportType} grouping={grouping} orders={filteredOrders} users={users} products={products} />
                     </div>
                </div>
            </div>
        </div>
    );
};


const StatCard: React.FC<{ title: string; value: string; icon: string; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-3 rounded-lg shadow-sm border flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${color}`}>
            <i className={`fas ${icon} text-lg text-white`}></i>
        </div>
        <div>
            <p className="text-xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500">{title}</p>
        </div>
    </div>
);


const ReportTable: React.FC<{ reportType: ReportType, grouping: GroupingType, orders: Order[], users: User[], products: Product[] }> = ({ reportType, grouping, orders, users, products }) => {
    const navigate = useNavigate();

    const data = useMemo(() => {
        if (grouping === 'order') {
            return orders.map(o => ({
                ...o,
                key: o.id,
                label: o.id,
                totalQty: o.items.reduce((s, i) => s + i.quantity, 0),
            }));
        }
        
        const grouped = orders.reduce((acc, order) => {
            let key = 'N/A';
            if (grouping === 'customer') key = order.customerInfo.fullName;
            if (grouping === 'cashier' || grouping === 'salesperson') key = users.find(u => u.id === order.creatorId)?.username || 'Không nhập';
            if (!acc[key]) acc[key] = { key, label: key, orders: [], totalQty: 0, totalAmount: 0, totalCost: 0, totalProfit: 0 };
            
            acc[key].orders.push(order);
            acc[key].totalQty += order.items.reduce((s, i) => s + i.quantity, 0);
            acc[key].totalAmount += order.totalAmount;
            acc[key].totalCost += order.cost || 0;
            acc[key].totalProfit += order.profit || 0;
            return acc;
        }, {} as any);
        
        return Object.values(grouped);
    }, [grouping, orders, users]);

    if (grouping === 'order') {
        const isProfit = reportType === 'profit';
        return (
            <table className="admin-table text-xs">
                <thead>
                    <tr>
                        <th>Mã đơn hàng</th><th>Kho xuất</th><th>Ngày bán</th><th>Thu ngân</th><th>Khách hàng</th>
                        <th className="text-right">Số lượng</th><th className="text-right">Chiết khấu</th><th className="text-right">Doanh số</th>
                        {isProfit && <th className="text-right">Tiền vốn</th>}
                        {isProfit && <th className="text-right">Lợi nhuận</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((order: any) => (
                        <tr key={order.key} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/orders/edit/${order.id}`)}>
                            <td className="font-mono">{order.id.slice(-8)}</td><td>Kho số 1</td><td>{formatDate(order.orderDate)}</td><td>{order.creatorName || users.find(u=>u.id === order.creatorId)?.username || 'admin'}</td><td>{order.customerInfo.fullName}</td>
                            <td className="text-right">{order.totalQty}</td><td className="text-right">{formatCurrency(0)}</td><td className="text-right font-semibold">{formatCurrency(order.totalAmount)}</td>
                            {isProfit && <td className="text-right">{formatCurrency(order.cost || 0)}</td>}
                            {isProfit && <td className="text-right font-semibold text-green-600">{formatCurrency(order.profit || 0)}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    const isProfit = reportType === 'profit';
    const groupLabel = {customer: "Tên khách hàng", cashier: "Tên thu ngân", salesperson: "Tên NV bán hàng"}[grouping] || "Đối tượng";

     return (
        <table className="admin-table text-xs">
            <thead>
                <tr>
                    <th>+</th><th>{groupLabel}</th><th className="text-right">Tổng số đơn</th><th className="text-right">Tổng SP</th><th className="text-right">Tổng chiết khấu</th>
                    <th className="text-right">Doanh số</th>
                    {isProfit && <th className="text-right">Tiền vốn</th>}
                    {isProfit && <th className="text-right">Lợi nhuận</th>}
                </tr>
            </thead>
            <tbody>
                {data.map((group: any) => (
                    <ExpandableRow key={group.key} group={group} isProfit={isProfit} users={users} />
                ))}
            </tbody>
        </table>
    );
};

const ExpandableRow: React.FC<{ group: any, isProfit: boolean, users: User[] }> = ({ group, isProfit, users }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <>
            <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <td><i className={`fas fa-plus-square transition-transform ${expanded ? 'rotate-90' : ''}`} /></td>
                <td className="font-semibold">{group.label}</td>
                <td className="text-right">{group.orders.length}</td>
                <td className="text-right">{group.totalQty}</td>
                <td className="text-right">{formatCurrency(0)}</td>
                <td className="text-right font-semibold">{formatCurrency(group.totalAmount)}</td>
                {isProfit && <td className="text-right">{formatCurrency(group.totalCost)}</td>}
                {isProfit && <td className="text-right font-semibold text-green-600">{formatCurrency(group.totalProfit)}</td>}
            </tr>
            {expanded && (
                <tr>
                    <td colSpan={isProfit ? 8 : 6} className="p-2 bg-blue-50">
                        <table className="w-full bg-white text-xs">
                           <thead>
                                <tr><th>Mã đơn hàng</th><th>Ngày bán</th><th className="text-right">SL</th><th className="text-right">Tổng tiền</th></tr>
                           </thead>
                           <tbody>
                            {group.orders.map((order: Order) => (
                                <tr key={order.id} className="border-t">
                                    <td className="p-1 font-mono">{order.id.slice(-8)}</td>
                                    <td className="p-1">{formatDate(order.orderDate)}</td>
                                    <td className="p-1 text-right">{order.items.reduce((s,i) => s + i.quantity, 0)}</td>
                                    <td className="p-1 text-right">{formatCurrency(order.totalAmount)}</td>
                                </tr>
                            ))}
                           </tbody>
                        </table>
                    </td>
                </tr>
            )}
        </>
    );
}

export default ReportsView;
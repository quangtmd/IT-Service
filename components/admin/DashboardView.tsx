import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders, getProducts } from '../../services/localDataService';
import Card from '../ui/Card';
import { Order } from '../../types';
import Button from '../ui/Button';

interface DashboardViewProps {
  setActiveView: (view: string) => void;
}

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


const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
    const { users, adminNotifications } = useAuth();
    const [orderCount, setOrderCount] = useState(0);
    const [productCount, setProductCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

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
                                    <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{order.id.slice(-6)}</span></td>
                                    <td>{order.customerInfo.fullName}</td>
                                    <td className="font-semibold">{order.totalAmount.toLocaleString('vi-VN')}₫</td>
                                    <td><span className={`status-badge`}>{order.status}</span></td>
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

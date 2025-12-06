import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';
import { getOrders, updateOrderStatus, deleteOrder } from '../../services/localDataService';
import BackendConnectionError from '../../components/shared/BackendConnectionError'; // Cập nhật đường dẫn
import * as ReactRouterDOM from 'react-router-dom';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Chờ xử lý': return 'bg-yellow-100 text-yellow-800';
        case 'Đang xác nhận': return 'bg-cyan-100 text-cyan-800';
        case 'Đang chuẩn bị': return 'bg-blue-100 text-blue-800';
        case 'Đang giao': return 'bg-indigo-100 text-indigo-800';
        case 'Hoàn thành': return 'bg-green-100 text-green-800';
        case 'Đã hủy': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const OrderManagementView: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = ReactRouterDOM.useNavigate();

    const loadOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const ordersFromDb = await getOrders();
            setOrders(ordersFromDb);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu đơn hàng.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const filteredOrders = useMemo(() =>
        orders.filter(o =>
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerInfo.phone.includes(searchTerm) ||
            o.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()),
    [orders, searchTerm]);

    const handleAddNewOrder = () => {
        navigate('/admin/orders/new');
    };

    const handleEditOrder = (orderId: string) => {
        navigate(`/admin/orders/edit/${orderId}`);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác.')) {
            try {
                await deleteOrder(id);
                loadOrders();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa.');
            }
        }
    };
    
    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Đơn hàng ({filteredOrders.length})</h3>
                 <Button onClick={handleAddNewOrder} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Thêm Đơn hàng
                </Button>
            </div>
            <div className="admin-card-body">
                <input
                    type="text"
                    placeholder="Tìm đơn hàng theo mã, tên, SĐT, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-form-group w-full max-w-md mb-4"
                />
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã ĐH</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">Đang tải đơn hàng...</td></tr>
                            ) : !error && filteredOrders.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-4">Không tìm thấy đơn hàng.</td></tr>
                            ) : (
                                !error && filteredOrders.map(order => (
                                    <tr key={order.id}>
                                        <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{order.id.slice(-6)}</span></td>
                                        <td>{order.customerInfo.fullName}</td>
                                        <td>{new Date(order.orderDate).toLocaleString('vi-VN')}</td>
                                        <td className="font-semibold text-primary">{order.totalAmount.toLocaleString('vi-VN')}₫</td>
                                        <td><span className={`status-badge ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleEditOrder(order.id)} size="sm" variant="outline" title="Xem/In"><i className="fas fa-eye"></i></Button>
                                                <Button onClick={() => handleEditOrder(order.id)} size="sm" variant="outline" title="Sửa"><i className="fas fa-edit"></i></Button>
                                                <Button onClick={() => handleDelete(order.id)} size="sm" variant="ghost" className="text-red-500" title="Xóa"><i className="fas fa-trash"></i></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderManagementView;
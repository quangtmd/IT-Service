

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';
import { getOrders, updateOrderStatus } from '../../services/localDataService';
import BackendConnectionError from '../../components/shared/BackendConnectionError'; // Cập nhật đường dẫn

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Chờ xử lý': return 'bg-yellow-100 text-yellow-800';
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
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

    const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            loadOrders(); // Refresh data from API
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật trạng thái.");
        }
    };
    
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Đơn hàng ({filteredOrders.length})</h3>
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
                                            <Button onClick={() => setSelectedOrder(order)} size="sm" variant="outline">Xem</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
        </div>
    );
};

// --- Order Detail Modal ---
interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}
const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onUpdateStatus }) => {
    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-panel">
                <div className="admin-modal-header">
                    <h4 className="admin-modal-title">Chi tiết Đơn hàng #{order.id.slice(-6)}</h4>
                    <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <div className="admin-modal-body grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div>
                        <h5 className="admin-form-subsection-title">Thông tin Khách hàng</h5>
                        <p><strong>Tên:</strong> {order.customerInfo.fullName}</p>
                        <p><strong>Email:</strong> {order.customerInfo.email}</p>
                        <p><strong>SĐT:</strong> {order.customerInfo.phone}</p>
                        <p><strong>Địa chỉ:</strong> {order.customerInfo.address}</p>
                        {order.customerInfo.notes && <p><strong>Ghi chú:</strong> {order.customerInfo.notes}</p>}
                    </div>
                    {/* Order Info */}
                    <div>
                        <h5 className="admin-form-subsection-title">Thông tin Đơn hàng</h5>
                        <p><strong>Ngày đặt:</strong> {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                        <p><strong>Tổng tiền:</strong> <span className="font-bold text-lg text-primary">{order.totalAmount.toLocaleString('vi-VN')}₫</span></p>
                        <p><strong>Thanh toán:</strong> {order.paymentInfo.method} ({order.paymentInfo.status})</p>
                        <div className="admin-form-group mt-4">
                            <label htmlFor="orderStatus">Cập nhật trạng thái</label>
                            <select id="orderStatus" value={order.status} onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}>
                                {Constants.ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                    </div>
                    {/* Items */}
                    <div className="md:col-span-2">
                         <h5 className="admin-form-subsection-title">Sản phẩm</h5>
                         <ul className="space-y-2">
                            {order.items.map(item => (
                                <li key={item.productId} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                    <span>{item.productName} (x{item.quantity})</span>
                                    <span>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="primary" onClick={onClose}>Đóng</Button>
                </div>
            </div>
        </div>
    );
};

export default OrderManagementView;
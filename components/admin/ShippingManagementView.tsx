import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Order, ShippingInfo } from '../../types';
import { getOrders, updateOrder } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';

const SHIPPING_STATUS_OPTIONS: ShippingInfo['shippingStatus'][] = ['Chưa giao', 'Đang lấy hàng', 'Đang giao', 'Đã giao', 'Gặp sự cố'];

const ShippingManagementView: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editStates, setEditStates] = useState<Record<string, Partial<ShippingInfo>>>({});

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getOrders();
            // Only show orders that are confirmed and not yet completed/cancelled
            setOrders(data.filter(o => ['Đã xác nhận', 'Đang chuẩn bị', 'Đang giao'].includes(o.status)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu đơn hàng.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleEditChange = (orderId: string, field: keyof ShippingInfo, value: string) => {
        setEditStates(prev => ({
            ...prev,
            [orderId]: { ...prev[orderId], [field]: value }
        }));
    };

    const handleSave = async (order: Order) => {
        const updates = editStates[order.id];
        if (!updates) return;
        
        try {
            await updateOrder(order.id, { shippingInfo: { ...order.shippingInfo, ...updates } });
            setEditStates(prev => {
                const newStates = {...prev};
                delete newStates[order.id];
                return newStates;
            });
            loadData(); // Refresh list
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Lỗi khi cập nhật thông tin vận chuyển.');
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Vận Chuyển</h3>
            </div>
            <div className="admin-card-body">
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table text-sm">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th>Mã ĐH</th>
                                <th>Khách Hàng</th>
                                <th>Ngày Đặt</th>
                                <th>Đối Tác Vận Chuyển</th>
                                <th>Mã Vận Đơn</th>
                                <th>Trạng Thái Giao Hàng</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={7} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && orders.length > 0 ? (
                                orders.map(order => {
                                    const isEditing = !!editStates[order.id];
                                    const currentShippingInfo = { ...order.shippingInfo, ...editStates[order.id] };
                                    return (
                                        <tr key={order.id}>
                                            <td className="font-mono text-xs">{order.id.slice(-6)}</td>
                                            <td>{order.customerInfo.fullName}</td>
                                            <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                            <td><input type="text" value={currentShippingInfo.carrier || ''} onChange={e => handleEditChange(order.id, 'carrier', e.target.value)} className="admin-form-group !p-1 !mb-0 w-32"/></td>
                                            <td><input type="text" value={currentShippingInfo.trackingNumber || ''} onChange={e => handleEditChange(order.id, 'trackingNumber', e.target.value)} className="admin-form-group !p-1 !mb-0 w-32"/></td>
                                            <td>
                                                <select value={currentShippingInfo.shippingStatus || 'Chưa giao'} onChange={e => handleEditChange(order.id, 'shippingStatus', e.target.value)} className="admin-form-group !p-1 !mb-0">
                                                    {SHIPPING_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <Button size="sm" onClick={() => handleSave(order)} disabled={!isEditing}>Lưu</Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                !error && <tr><td colSpan={7} className="text-center py-4 text-textMuted">Không có đơn hàng cần vận chuyển.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ShippingManagementView;

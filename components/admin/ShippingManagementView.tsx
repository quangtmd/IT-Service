import React, { useState, useEffect, useCallback } from 'react';
import { Order, ShippingInfo } from '../../types';
import { getOrders, updateOrder } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';

const SHIPPING_STATUS_OPTIONS: Array<NonNullable<ShippingInfo['shippingStatus']>> = ['Chưa giao', 'Đang lấy hàng', 'Đang giao', 'Đã giao', 'Gặp sự cố'];

const ShippingManagementView: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editStates, setEditStates] = useState<Record<string, Partial<ShippingInfo>>>({});
    const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving'>>({});


    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getOrders();
            // Only show orders that need shipping management
            const filtered = data.filter(o => ['Đã xác nhận', 'Đang chuẩn bị', 'Đang giao'].includes(o.status));
            setOrders(filtered);
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
        
        setSaveStatus(prev => ({...prev, [order.id]: 'saving'}));
        try {
            // Merge existing shipping info with the new updates
            const newShippingInfo = { ...order.shippingInfo, ...updates };
            await updateOrder(order.id, { shippingInfo: newShippingInfo });
            
            // Clear edit state for this order after successful save
            setEditStates(prev => {
                const newStates = {...prev};
                delete newStates[order.id];
                return newStates;
            });
            await loadData(); // Refresh list to get latest data from "source of truth"
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Lỗi khi cập nhật thông tin vận chuyển.');
        } finally {
            setSaveStatus(prev => ({...prev, [order.id]: 'idle'}));
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
                                    const isSaving = saveStatus[order.id] === 'saving';

                                    return (
                                        <tr key={order.id}>
                                            <td className="font-mono text-xs">{order.id.slice(-6)}</td>
                                            <td>{order.customerInfo.fullName}</td>
                                            <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                            <td><input type="text" value={currentShippingInfo.carrier || ''} onChange={e => handleEditChange(order.id, 'carrier', e.target.value)} className="admin-form-group !p-1 !mb-0 w-32"/></td>
                                            <td><input type="text" value={currentShippingInfo.trackingNumber || ''} onChange={e => handleEditChange(order.id, 'trackingNumber', e.target.value)} className="admin-form-group !p-1 !mb-0 w-32"/></td>
                                            <td>
                                                <select value={currentShippingInfo.shippingStatus || 'Chưa giao'} onChange={e => handleEditChange(order.id, 'shippingStatus', e.target.value as ShippingInfo['shippingStatus'])} className="admin-form-group !p-1 !mb-0">
                                                    {SHIPPING_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <Button size="sm" onClick={() => handleSave(order)} disabled={!isEditing || isSaving} isLoading={isSaving}>Lưu</Button>
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

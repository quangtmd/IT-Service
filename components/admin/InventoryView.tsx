import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Inventory, Warehouse } from '../../types';
import { getInventory, getWarehouses } from '../../services/localDataService';
import Button from '../ui/Button';

const InventoryView: React.FC = () => {
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [inventoryData, warehouseData] = await Promise.all([
                getInventory(),
                getWarehouses()
            ]);
            setInventory(inventoryData);
            setWarehouses(warehouseData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu tồn kho.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const filteredInventory = useMemo(() => 
        inventory.filter(item => 
            (selectedWarehouse === 'all' || item.warehouse_id === selectedWarehouse) &&
            (item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product_id?.toLowerCase().includes(searchTerm.toLowerCase()))
        ),
    [inventory, searchTerm, selectedWarehouse]);

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Kho & Tồn kho</h3>
                 <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">Thống kê</Button>
                    <Button size="sm" variant="outline">Kiểm kho</Button>
                </div>
            </div>
            <div className="admin-card-body">
                 <div className="flex flex-wrap gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Tìm sản phẩm (tên, mã)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-form-group !mb-0 max-w-sm"
                    />
                    <select 
                        value={selectedWarehouse} 
                        onChange={e => setSelectedWarehouse(e.target.value)}
                        className="admin-form-group !mb-0 w-48"
                    >
                        <option value="all">Tất cả kho</option>
                        {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="admin-table text-sm">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Kho</th>
                                <th className="text-right">Tồn kho</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-4">Đang tải...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={5} className="text-center py-4 text-red-500">{error}</td></tr>
                            ) : filteredInventory.length > 0 ? ( filteredInventory.map(item => (
                                <tr key={`${item.product_id}-${item.warehouse_id}`}>
                                    <td className="font-semibold">{item.product_name} <span className="font-mono text-xs text-gray-500">({item.product_id})</span></td>
                                    <td>{item.warehouse_name}</td>
                                    <td className="text-right font-bold text-lg">{item.quantity}</td>
                                    <td>
                                        {item.quantity <= 0 ? (
                                            <span className="status-badge bg-red-100 text-red-800">Hết hàng</span>
                                        ) : item.quantity < 10 ? (
                                            <span className="status-badge bg-yellow-100 text-yellow-800">Sắp hết</span>
                                        ) : (
                                            <span className="status-badge bg-green-100 text-green-800">Còn hàng</span>
                                        )}
                                    </td>
                                    <td>
                                        <Button size="sm" variant="outline">Điều chỉnh</Button>
                                    </td>
                                </tr>
                            ))
                            ) : (
                                <tr><td colSpan={5} className="text-center py-4 text-textMuted">Không có dữ liệu tồn kho.</td></tr>
                            )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryView;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Inventory } from '../../types';
import { getInventory } from '../../services/localDataService';
import Button from '../ui/Button';

const InventoryView: React.FC = () => {
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadInventory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getInventory();
            setInventory(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu tồn kho.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInventory();
    }, [loadInventory]);
    
    const filteredInventory = useMemo(() => 
        inventory.filter(item => 
            item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [inventory, searchTerm]);

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Kho & Tồn kho</h3>
            </div>
            <div className="admin-card-body">
                 <input
                    type="text"
                    placeholder="Tìm sản phẩm hoặc kho..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-form-group w-full max-w-md mb-4"
                />
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Kho</th>
                                <th>Số lượng tồn</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center py-4">Đang tải...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={4} className="text-center py-4 text-red-500">{error}</td></tr>
                            ) : filteredInventory.map(item => (
                                <tr key={`${item.product_id}-${item.warehouse_id}`}>
                                    <td className="font-semibold">{item.product_name}</td>
                                    <td>{item.warehouse_name}</td>
                                    <td className="font-bold">{item.quantity}</td>
                                    <td>
                                        <Button size="sm" variant="outline">Điều chỉnh</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryView;

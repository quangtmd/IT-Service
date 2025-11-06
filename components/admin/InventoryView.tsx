import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Fix: Import the newly added Inventory type.
import { Inventory } from '../../types';
// Fix: Import getInventory from apiService where it is correctly defined.
import { getInventory } from '../../services/apiService';
import Button from '../ui/Button';

// Fix: Add types for props to allow setting initial tab
type InventoryTab = 'inventory' | 'import' | 'export' | 'suppliers';
interface InventoryManagementViewProps {
    initialTab?: InventoryTab;
}

// Fix: Rename component to InventoryManagementView and accept props
const InventoryManagementView: React.FC<InventoryManagementViewProps> = ({ initialTab = 'inventory' }) => {
    const [activeTab, setActiveTab] = useState<InventoryTab>(initialTab);

    const renderTabContent = () => {
        switch(activeTab) {
            case 'inventory':
                return <InventoryList />;
            case 'import':
            case 'export':
            case 'suppliers':
                return <PlaceholderTab featureName={activeTab} />;
            default:
                return <InventoryList />;
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Kho & Vận hành</h3>
            </div>
            <div className="admin-card-body">
                <nav className="admin-tabs">
                    <button onClick={() => setActiveTab('inventory')} className={`admin-tab-button ${activeTab === 'inventory' ? 'active' : ''}`}>Tồn kho</button>
                    <button onClick={() => setActiveTab('import')} className={`admin-tab-button ${activeTab === 'import' ? 'active' : ''}`}>Nhập kho</button>
                    <button onClick={() => setActiveTab('export')} className={`admin-tab-button ${activeTab === 'export' ? 'active' : ''}`}>Xuất kho</button>
                    <button onClick={() => setActiveTab('suppliers')} className={`admin-tab-button ${activeTab === 'suppliers' ? 'active' : ''}`}>Nhà cung cấp</button>
                </nav>
                 <div className="mt-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

const InventoryList: React.FC = () => {
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
        <div>
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
                        ) : filteredInventory.length > 0 ? ( filteredInventory.map(item => (
                            <tr key={`${item.product_id}-${item.warehouse_id}`}>
                                <td className="font-semibold">{item.product_name}</td>
                                <td>{item.warehouse_name}</td>
                                <td className="font-bold">{item.quantity}</td>
                                <td>
                                    <Button size="sm" variant="outline">Điều chỉnh</Button>
                                </td>
                            </tr>
                        ))
                        ) : (
                            <tr><td colSpan={4} className="text-center py-4 text-textMuted">Không có dữ liệu tồn kho.</td></tr>
                        )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PlaceholderTab: React.FC<{featureName: string}> = ({ featureName }) => (
    <div className="text-center text-textMuted py-8">
        <i className="fas fa-tools text-4xl mb-4"></i>
        <br/>
        Tính năng '{featureName}' đang được phát triển.
    </div>
);


export default InventoryManagementView;

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StockTransfer, StockTransferItem, Warehouse, Product, User } from '../../types';
import Button from '../../components/ui/Button';
import { getStockTransfers, addStockTransfer, updateStockTransfer, getWarehouses, getProducts } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';

const StockTransferFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;
    const { currentUser, users } = useAuth();

    const [formData, setFormData] = useState<Partial<StockTransfer>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');
    
    const staffUsers = useMemo(() => users.filter(u => u.role === 'admin' || u.role === 'staff'), [users]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [whData, productsData, allTransfers] = await Promise.all([
                    getWarehouses(), 
                    getProducts('limit=10000'),
                    isEditing ? getStockTransfers() : Promise.resolve([])
                ]);
                setWarehouses(whData);
                setProducts(productsData.products);

                if (isEditing) {
                    const itemToEdit = allTransfers.find(t => t.id === id);
                    if (itemToEdit) setFormData(itemToEdit);
                    else setError('Không tìm thấy phiếu điều chuyển.');
                } else {
                    setFormData({
                        transferNumber: `DC${Date.now().toString().slice(-6)}`,
                        date: new Date().toISOString().split('T')[0],
                        items: [],
                        status: 'Chờ duyệt',
                        approverId: currentUser?.id,
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id, isEditing, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let newFormData: Partial<StockTransfer> = { ...formData, [name]: value };

        if (name === 'sourceWarehouseId') {
            const wh = warehouses.find(w => w.id === value);
            newFormData.sourceWarehouseName = wh?.name;
        } else if (name === 'destWarehouseId') {
            const wh = warehouses.find(w => w.id === value);
            newFormData.destWarehouseName = wh?.name;
        }

        setFormData(newFormData);
    };

    const handleItemChange = (index: number, field: keyof StockTransferItem, value: any) => {
        if (!formData.items) return;
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = (product: Product) => {
        if (formData.items?.some(i => i.productId === product.id)) return;
        const newItem: StockTransferItem = { productId: product.id, productName: product.name, quantity: 1 };
        setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
        setProductSearch('');
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({ ...prev, items: prev.items?.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.sourceWarehouseId || !formData.destWarehouseId || !formData.items || formData.items.length === 0) {
            alert('Vui lòng chọn kho nguồn, kho đích và thêm ít nhất một sản phẩm.');
            return;
        }
        if (formData.sourceWarehouseId === formData.destWarehouseId) {
            alert('Kho nguồn và kho đích không được trùng nhau.');
            return;
        }

        try {
            if (isEditing) {
                await updateStockTransfer(id!, formData as StockTransfer);
                alert('Cập nhật phiếu thành công!');
            } else {
                await addStockTransfer(formData as Omit<StockTransfer, 'id'>);
                alert('Tạo phiếu mới thành công!');
            }
            navigate('/admin/stock_transfers');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu.');
        }
    };
    
    const filteredProducts = useMemo(() =>
        productSearch ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5) : [],
    [products, productSearch]);

    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;

    return (
        <form onSubmit={handleSubmit} className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">{isEditing ? `Sửa Phiếu Điều Chuyển #${formData.transferNumber}` : 'Tạo Phiếu Điều Chuyển Mới'}</h3>
                <div>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/stock_transfers')} className="mr-2">Hủy</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </div>
            <div className="admin-card-body">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="admin-form-group"><label>Số Phiếu</label><input type="text" value={formData.transferNumber || ''} disabled /></div>
                    <div className="admin-form-group"><label>Ngày Lập</label><input type="date" name="date" value={formData.date?.toString().split('T')[0] || ''} onChange={handleChange} /></div>
                    <div className="admin-form-group"><label>Trạng Thái</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="Chờ duyệt">Chờ duyệt</option>
                            <option value="Đã duyệt">Đã duyệt</option>
                            <option value="Đang vận chuyển">Đang vận chuyển</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                            <option value="Đã hủy">Đã hủy</option>
                        </select>
                    </div>
                    <div className="admin-form-group"><label>Người Duyệt</label>
                        <select name="approverId" value={formData.approverId} onChange={handleChange}>
                           {staffUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                        </select>
                    </div>
                    <div className="admin-form-group md:col-span-2"><label>Từ Kho (Nguồn) *</label>
                        <select name="sourceWarehouseId" value={formData.sourceWarehouseId || ''} onChange={handleChange} required>
                            <option value="">-- Chọn kho nguồn --</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                     <div className="admin-form-group md:col-span-2"><label>Đến Kho (Đích) *</label>
                        <select name="destWarehouseId" value={formData.destWarehouseId || ''} onChange={handleChange} required>
                            <option value="">-- Chọn kho đích --</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="admin-form-subsection-title">Danh sách sản phẩm</div>
                 <table className="w-full text-sm text-left mb-4">
                    <thead className="bg-gray-100"><tr><th className="p-2">STT</th><th className="p-2">Tên Sản Phẩm</th><th className="p-2">Số Lượng</th><th className="p-2"></th></tr></thead>
                    <tbody>
                        {formData.items?.map((item, index) => (
                            <tr key={item.productId} className="border-b">
                                <td className="p-2">{index + 1}</td>
                                <td className="p-2">{item.productName}</td>
                                <td className="p-2"><input className="w-24 text-right admin-form-group !mb-0 !p-1" type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} /></td>
                                <td className="p-2"><Button type="button" size="sm" variant="ghost" onClick={() => removeItem(index)}><i className="fas fa-times text-red-500" /></Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="relative admin-form-group">
                    <input type="text" placeholder="Tìm sản phẩm để thêm vào phiếu..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                    {filteredProducts.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto mt-1">
                            {filteredProducts.map(p => <li key={p.id} onClick={() => addItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{p.name}</li>)}
                        </ul>
                    )}
                </div>
            </div>
        </form>
    );
};

export default StockTransferFormPage;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StockReceipt, StockReceiptItem, Supplier, Product, SiteSettings } from '../../types';
import Button from '../../components/ui/Button';
import { getStockReceipts, addStockReceipt, updateStockReceipt } from '../../services/localDataService';
import { getSuppliers, getProducts } from '../../services/localDataService';
import * as Constants from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

const StockReceiptFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState<Partial<StockReceipt>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [suppliersData, productsData, allReceipts] = await Promise.all([
                    getSuppliers(), 
                    getProducts('limit=10000'),
                    isEditing ? getStockReceipts() : Promise.resolve([]),
                ]);

                setSuppliers(suppliersData);
                setProducts(productsData.products);

                const settingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
                setSiteSettings(settingsRaw ? JSON.parse(settingsRaw) : Constants.INITIAL_SITE_SETTINGS);

                if (isEditing) {
                    const receiptToEdit = allReceipts.find(r => r.id === id);
                    if (receiptToEdit) {
                        setFormData(receiptToEdit);
                    } else {
                        setError('Không tìm thấy phiếu nhập kho.');
                    }
                } else {
                    setFormData({
                        receiptNumber: `PN${Date.now().toString().slice(-6)}`,
                        date: new Date().toISOString().split('T')[0],
                        items: [],
                        totalAmount: 0,
                        status: 'Nháp',
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id, isEditing]);

    const calculateTotal = useCallback((items: StockReceiptItem[]) => {
        return items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
    }, []);

    useEffect(() => {
        if (formData.items) {
            const total = calculateTotal(formData.items);
            setFormData(prev => ({...prev, totalAmount: total}));
        }
    }, [formData.items, calculateTotal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'supplierId') {
            const supplier = suppliers.find(s => s.id === value);
            setFormData(prev => ({ ...prev, supplierId: value, supplierName: supplier?.name }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleItemChange = (index: number, field: keyof StockReceiptItem, value: any) => {
        if (!formData.items) return;
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: Number(value) };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = (product: Product) => {
        if (formData.items?.some(i => i.productId === product.id)) return;
        const newItem: StockReceiptItem = {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            purchasePrice: product.purchasePrice || 0,
        };
        setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
        setProductSearch('');
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({ ...prev, items: prev.items?.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.supplierId || !formData.items || formData.items.length === 0) {
            alert('Vui lòng chọn nhà cung cấp và thêm ít nhất một sản phẩm.');
            return;
        }

        try {
            if (isEditing) {
                await updateStockReceipt(id!, formData as StockReceipt);
                alert('Cập nhật phiếu nhập kho thành công!');
            } else {
                await addStockReceipt(formData as Omit<StockReceipt, 'id'>);
                alert('Tạo phiếu nhập kho thành công!');
            }
            navigate('/admin/stock_receipts');
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
            <div className="admin-card-header flex justify-between items-center no-print">
                <h3 className="admin-card-title">{isEditing ? `Sửa Phiếu Nhập Kho #${formData.receiptNumber}` : 'Tạo Phiếu Nhập Kho Mới'}</h3>
                <div>
                    <Button type="button" variant="outline" onClick={() => window.print()} className="mr-2" leftIcon={<i className="fas fa-print" />}>In Phiếu</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </div>
            <div className="admin-card-body print-wrapper">
                <div className="print-container max-w-4xl mx-auto p-4 bg-white">
                    <header className="text-center mb-6">
                        <h1 className="text-3xl font-bold uppercase">Phiếu Nhập Kho</h1>
                        <p>Số: {formData.receiptNumber}</p>
                        <p>Ngày: {new Date(formData.date || Date.now()).toLocaleDateString('vi-VN')}</p>
                    </header>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="no-print">
                            <label className="admin-form-group">Nhà Cung Cấp *</label>
                            <select name="supplierId" value={formData.supplierId || ''} onChange={handleChange} className="admin-form-group" required>
                                <option value="">-- Chọn NCC --</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="print-only"><strong>Nhà Cung Cấp:</strong> {formData.supplierName}</div>
                        <div><strong>Người Lập Phiếu:</strong> {currentUser?.username}</div>
                    </div>
                    
                    <table className="w-full text-sm text-left print-table mb-4">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2">STT</th>
                                <th className="p-2">Tên Sản Phẩm</th>
                                <th className="p-2 text-right">Số Lượng</th>
                                <th className="p-2 text-right">Giá Nhập</th>
                                <th className="p-2 text-right">Thành Tiền</th>
                                <th className="p-2 no-print"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.items?.map((item, index) => (
                                <tr key={item.productId} className="border-b">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{item.productName}</td>
                                    <td className="p-2"><input className="w-20 text-right no-print admin-form-group !p-1 !mb-0" type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} /><span className="print-only">{item.quantity}</span></td>
                                    <td className="p-2"><input className="w-32 text-right no-print admin-form-group !p-1 !mb-0" type="number" value={item.purchasePrice} onChange={e => handleItemChange(index, 'purchasePrice', e.target.value)} /><span className="print-only">{item.purchasePrice.toLocaleString('vi-VN')}</span></td>
                                    <td className="p-2 text-right font-semibold">{(item.quantity * item.purchasePrice).toLocaleString('vi-VN')}₫</td>
                                    <td className="p-2 no-print"><Button type="button" size="sm" variant="ghost" onClick={() => removeItem(index)}><i className="fas fa-times text-red-500" /></Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     <div className="relative admin-form-group no-print">
                        <input type="text" placeholder="Tìm sản phẩm để thêm vào phiếu..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                        {filteredProducts.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto mt-1">
                                {filteredProducts.map(p => <li key={p.id} onClick={() => addItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{p.name}</li>)}
                            </ul>
                        )}
                    </div>
                    <div className="flex justify-end mt-4">
                        <p className="text-lg font-bold">Tổng Cộng: {formData.totalAmount?.toLocaleString('vi-VN')}₫</p>
                    </div>
                    <div className="mt-16 grid grid-cols-3 gap-4 text-center text-sm">
                        <div><p className="font-bold">Người Lập Phiếu</p><p>(Ký, họ tên)</p></div>
                        <div><p className="font-bold">Thủ Kho</p><p>(Ký, họ tên)</p></div>
                        <div><p className="font-bold">Kế Toán Trưởng</p><p>(Ký, họ tên)</p></div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default StockReceiptFormPage;

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
                        discount: 0,
                        amountPaid: 0,
                        paymentMethod: 'Tiền mặt',
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

    const subTotal = useMemo(() => {
        return formData.items?.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0) || 0;
    }, [formData.items]);

    const totalAmount = useMemo(() => subTotal - (formData.discount || 0), [subTotal, formData.discount]);
    
    const amountOwed = useMemo(() => totalAmount - (formData.amountPaid || 0), [totalAmount, formData.amountPaid]);

    useEffect(() => {
        setFormData(prev => ({...prev, totalAmount}));
    }, [totalAmount]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';

        if (name === 'supplierId') {
            const supplier = suppliers.find(s => s.id === value);
            setFormData(prev => ({ ...prev, supplierId: value, supplierName: supplier?.name }));
        } else {
            setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
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
            productId: product.productCode || product.id,
            productName: product.name,
            quantity: 1,
            purchasePrice: product.purchasePrice || 0,
        };
        setFormData(prev => ({ ...prev, items: [...(prev?.items || []), newItem] }));
        setProductSearch('');
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({ ...prev, items: prev?.items?.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (status: StockReceipt['status']) => {
        if (!formData.supplierId || !formData.items || formData.items.length === 0) {
            alert('Vui lòng chọn nhà cung cấp và thêm ít nhất một sản phẩm.');
            return;
        }
        
        const finalData = {...formData, status};

        try {
            if (isEditing) {
                await updateStockReceipt(id!, finalData as StockReceipt);
                alert('Cập nhật phiếu nhập kho thành công!');
            } else {
                await addStockReceipt(finalData as Omit<StockReceipt, 'id'>);
                alert('Tạo phiếu nhập kho thành công!');
            }
            navigate('/admin/stock_receipts');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu.');
        }
    };
    
    const filteredProducts = useMemo(() =>
        productSearch ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.productCode?.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5) : [],
    [products, productSearch]);

    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;

    return (
        <div className="admin-card !p-0">
            <div className="admin-card-header flex justify-between items-center no-print">
                <h3 className="admin-card-title">{isEditing ? `Sửa Phiếu Nhập Kho #${formData.receiptNumber}` : 'Tạo Phiếu Nhập Kho'}</h3>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => handleSubmit('Nháp')}>Lưu tạm</Button>
                    <Button type="button" variant="primary" onClick={() => handleSubmit('Hoàn thành')}>Lưu</Button>
                    <Button type="button" variant="primary" onClick={() => { handleSubmit('Hoàn thành').then(() => window.print()); }} leftIcon={<i className="fas fa-print"/>}>Lưu và in</Button>
                    <Button type="button" variant="ghost" onClick={() => navigate('/admin/stock_receipts')}>Hủy</Button>
                </div>
            </div>
            <div className="admin-card-body print-wrapper bg-gray-100/50">
                <div className="print-container bg-white p-6 max-w-5xl mx-auto shadow-lg">
                    <header className="grid grid-cols-2 gap-4 items-start mb-4">
                        <div>
                            <h2 className="font-bold text-lg">{siteSettings.companyName}</h2>
                            <p className="text-xs">Địa chỉ: {siteSettings.companyAddress}</p>
                            <p className="text-xs">Điện thoại: {siteSettings.companyPhone}</p>
                        </div>
                        <div className="text-right">
                             <h1 className="text-2xl font-bold uppercase">Phiếu Nhập Kho</h1>
                            <p className="text-sm">Số: {formData.receiptNumber}</p>
                            <p className="text-sm">Ngày: {new Date(formData.date || Date.now()).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </header>
                    <div className="relative admin-form-group no-print mb-4">
                        <input type="text" placeholder="Nhập mã hoặc tên sản phẩm để thêm hàng vào phiếu..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="!py-3 !text-base" />
                        {filteredProducts.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto mt-1">
                                {filteredProducts.map(p => <li key={p.id} onClick={() => addItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{p.name} ({p.productCode})</li>)}
                            </ul>
                        )}
                    </div>

                    <div className="overflow-x-auto my-4">
                        <table className="w-full text-sm text-left print-table">
                            <thead className="bg-gray-100">
                                <tr><th className="p-2 w-8">STT</th><th className="p-2">Mã hàng</th><th className="p-2">Tên sản phẩm</th><th className="p-2 text-right">Số Lượng</th><th className="p-2 text-right">Giá Nhập</th><th className="p-2 text-right">Thành Tiền</th><th className="p-2 no-print"></th></tr>
                            </thead>
                            <tbody>
                                {formData.items?.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-gray-500">Chưa có sản phẩm nào.</td></tr>}
                                {formData.items?.map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-1 text-center">{index + 1}</td>
                                        <td className="p-1 font-mono text-xs">{item.productId}</td>
                                        <td className="p-1">{item.productName}</td>
                                        <td className="p-1"><input className="w-20 text-right no-print admin-form-group !p-1 !mb-0" type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} /><span className="print-only">{item.quantity}</span></td>
                                        <td className="p-1"><input className="w-32 text-right no-print admin-form-group !p-1 !mb-0" type="number" value={item.purchasePrice} onChange={e => handleItemChange(index, 'purchasePrice', e.target.value)} /><span className="print-only">{item.purchasePrice.toLocaleString('vi-VN')}</span></td>
                                        <td className="p-1 text-right font-semibold">{(item.quantity * item.purchasePrice).toLocaleString('vi-VN')}₫</td>
                                        <td className="p-1 text-center no-print"><Button type="button" size="sm" variant="ghost" onClick={() => removeItem(index)}><i className="fas fa-trash text-red-500" /></Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="flex flex-col md:flex-row gap-6 mt-4">
                        <div className="flex-grow space-y-4 no-print">
                             <div className="admin-form-group">
                                <label>Nhà Cung Cấp</label>
                                <select name="supplierId" value={formData.supplierId || ''} onChange={handleChange} required>
                                    <option value="">-- Chọn --</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                             <div className="admin-form-group">
                                <label>Ghi chú</label>
                                 <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={2}></textarea>
                            </div>
                        </div>
                        <div className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0 bg-gray-50 p-4 rounded-lg border">
                             <h4 className="font-semibold mb-3 text-base flex items-center"><i className="fas fa-info-circle mr-2 text-blue-500"></i>Thông tin thanh toán</h4>
                             <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center"><span className="text-gray-600">Tiền hàng:</span><span className="font-semibold">{subTotal.toLocaleString('vi-VN')}₫</span></div>
                                <div className="flex justify-between items-center"><label htmlFor="discount" className="text-gray-600">Chiết khấu:</label><input id="discount" name="discount" type="number" value={formData.discount || 0} onChange={handleChange} className="w-32 text-right admin-form-group !p-1 !mb-0 no-print" /><span className="print-only">{(formData.discount || 0).toLocaleString('vi-VN')}₫</span></div>
                                <div className="flex justify-between items-center py-2 border-t text-base"><span className="font-bold">Tổng cộng:</span><span className="font-bold text-red-600">{totalAmount.toLocaleString('vi-VN')}₫</span></div>
                                <div className="flex justify-between items-center no-print"><label htmlFor="amountPaid" className="text-gray-600">Thanh toán:</label><input id="amountPaid" name="amountPaid" type="number" value={formData.amountPaid || 0} onChange={handleChange} className="w-32 text-right admin-form-group !p-1 !mb-0"/></div>
                                <div className="flex justify-between items-center py-2 border-t"><span className="font-semibold">Còn nợ:</span><span className="font-semibold">{amountOwed.toLocaleString('vi-VN')}₫</span></div>
                                <div className="flex justify-between items-center no-print"><label htmlFor="paymentMethod" className="text-gray-600">Hình thức:</label>
                                    <div className="flex gap-3">
                                        <label><input type="radio" name="paymentMethod" value="Tiền mặt" checked={formData.paymentMethod === 'Tiền mặt'} onChange={handleChange} /> Tiền mặt</label>
                                        <label><input type="radio" name="paymentMethod" value="Thẻ" checked={formData.paymentMethod === 'Thẻ'} onChange={handleChange} /> Thẻ</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                     <div className="mt-16 grid grid-cols-3 gap-4 text-center text-sm print-only">
                        <div><p className="font-bold">Người Lập Phiếu</p><p>(Ký, họ tên)</p></div>
                        <div><p className="font-bold">Thủ Kho</p><p>(Ký, họ tên)</p></div>
                        <div><p className="font-bold">Kế Toán Trưởng</p><p>(Ký, họ tên)</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockReceiptFormPage;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Quotation, QuotationItem, User, Product } from '../../types';
import Button from '../../components/ui/Button';
import { getQuotations, addQuotation, updateQuotation } from '../../services/localDataService';
import { getUsers, getProducts } from '../../services/localDataService';
import * as ReactRouterDOM from 'react-router-dom';

const QuotationFormPage: React.FC = () => {
    const { quotationId } = ReactRouterDOM.useParams<{ quotationId: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const isEditing = !!quotationId;

    const [formData, setFormData] = useState<Quotation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [customers, setCustomers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');

    const calculateTotals = useCallback((items: QuotationItem[], discount: number = 0, tax: number = 0) => {
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const total = subtotal - discount + tax;
        return { subtotal, total };
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [allQuotes, users, prodsData] = await Promise.all([
                    getQuotations(),
                    getUsers(),
                    getProducts('limit=10000')
                ]);

                setCustomers(users.filter(u => u.role === 'customer' || u.role === 'admin'));
                setProducts(prodsData.products);

                if (isEditing) {
                    const foundQuotation = allQuotes.find(q => q.id === quotationId);
                    if (foundQuotation) {
                        setFormData(foundQuotation);
                    } else {
                        setError('Không tìm thấy báo giá để chỉnh sửa.');
                    }
                } else {
                    const newId = `quote-${Date.now()}`;
                    setFormData({
                        id: newId, creation_date: new Date().toISOString(), expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        items: [], subtotal: 0, total_amount: 0, status: 'Nháp',
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [isEditing, quotationId]);

    const handleItemChange = (index: number, field: 'quantity' | 'price', value: number) => {
        if (!formData) return;
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        const { subtotal, total } = calculateTotals(newItems, formData.discount_amount, formData.tax_amount);
        setFormData(p => p ? ({ ...p, items: newItems, subtotal: subtotal, total_amount: total }) : null);
    };

    const addItem = (product: Product) => {
        if (!formData) return;
        if (formData.items.some(i => i.productId === product.id)) return;
        const newItem: QuotationItem = { productId: product.id, productName: product.name, quantity: 1, price: product.price };
        const newItems = [...formData.items, newItem];
        const { subtotal, total } = calculateTotals(newItems, formData.discount_amount, formData.tax_amount);
        setFormData(p => p ? ({ ...p, items: newItems, subtotal: subtotal, total_amount: total }) : null);
        setProductSearch('');
    };

    const removeItem = (index: number) => {
        if (!formData) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        const { subtotal, total } = calculateTotals(newItems, formData.discount_amount, formData.tax_amount);
        setFormData(p => p ? ({ ...p, items: newItems, subtotal: subtotal, total_amount: total }) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        try {
            if (isEditing) {
                await updateQuotation(formData.id, formData);
                alert('Cập nhật báo giá thành công!');
            } else {
                await addQuotation(formData);
                alert('Tạo báo giá mới thành công!');
            }
            navigate('/admin/quotations');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu báo giá.');
        }
    };

    const filteredProducts = useMemo(() =>
        productSearch ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5) : [],
    [products, productSearch]);

    if (isLoading) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-textMuted">Đang tải dữ liệu báo giá...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8 text-danger-text">
                    <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
                    <p>{error}</p>
                    <Button onClick={() => navigate('/admin/quotations')} className="mt-4">Quay lại</Button>
                </div>
            </div>
        );
    }

    if (!formData) return null;

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">{isEditing ? `Sửa Báo giá: #${formData.id.slice(-6)}` : 'Tạo Báo giá mới'}</h3>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/quotations')}>Hủy</Button>
                </div>
                <div className="admin-card-body admin-product-form-page-body"> {/* Using similar class for scrolling */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="admin-form-group"><label>Khách hàng</label>
                            <select value={formData.customer_id || ''} onChange={e => setFormData(p => p ? ({ ...p, customer_id: e.target.value }) : null)}>
                                <option value="">-- Chọn khách hàng --</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.username} ({c.email})</option>)}
                            </select>
                        </div>
                        <div className="admin-form-group"><label>Ngày tạo</label><input type="date" value={formData.creation_date.split('T')[0]} onChange={e => setFormData(p => p ? ({ ...p, creation_date: e.target.value }) : null)} /></div>
                        <div className="admin-form-group"><label>Ngày hết hạn</label><input type="date" value={formData.expiry_date?.split('T')[0] || ''} onChange={e => setFormData(p => p ? ({ ...p, expiry_date: e.target.value }) : null)} /></div>
                    </div>

                    <div className="admin-form-subsection-title">Sản phẩm/Dịch vụ</div>
                    <div className="overflow-x-auto mb-4">
                        <table className="admin-table text-sm">
                            <thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th><th></th></tr></thead>
                            <tbody>
                                {formData.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.productName}</td>
                                        <td><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-16 p-1 admin-form-group" /></td>
                                        <td><input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} className="w-32 p-1 admin-form-group" /></td>
                                        <td>{(item.quantity * item.price).toLocaleString('vi-VN')}₫</td>
                                        <td><Button type="button" size="sm" variant="ghost" className="!text-red-500" onClick={() => removeItem(index)}><i className="fas fa-times"></i></Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="relative admin-form-group">
                        <label>Thêm sản phẩm</label>
                        <input type="text" placeholder="Tìm kiếm sản phẩm..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                        {filteredProducts.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                                {filteredProducts.map(p => <li key={p.id} onClick={() => addItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer">{p.name}</li>)}
                            </ul>
                        )}
                    </div>

                     <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="admin-form-group"><label>Tổng phụ</label><input type="text" value={(formData.subtotal || 0).toLocaleString('vi-VN') + '₫'} readOnly disabled /></div>
                        <div className="admin-form-group"><label>Giảm giá</label><input type="number" value={formData.discount_amount || 0} onChange={e => { const discount = Number(e.target.value); const { total } = calculateTotals(formData.items, discount, formData.tax_amount); setFormData(p => p ? ({ ...p, discount_amount: discount, total_amount: total }) : null)}} /></div>
                        <div className="admin-form-group"><label>Thuế</label><input type="number" value={formData.tax_amount || 0} onChange={e => { const tax = Number(e.target.value); const { total } = calculateTotals(formData.items, formData.discount_amount, tax); setFormData(p => p ? ({ ...p, tax_amount: tax, total_amount: total }) : null)}} /></div>
                        <div className="admin-form-group"><label>Tổng cộng</label><input type="text" value={(formData.total_amount || 0).toLocaleString('vi-VN') + '₫'} readOnly disabled /></div>
                    </div>
                    <div className="admin-form-group"><label>Điều khoản</label><textarea value={formData.terms || ''} onChange={e => setFormData(p => p ? ({ ...p, terms: e.target.value }) : null)} rows={3}></textarea></div>
                    <div className="admin-form-group"><label>Trạng thái</label>
                        <select value={formData.status} onChange={e => setFormData(p => p ? ({ ...p, status: e.target.value as Quotation['status'] }) : null)}>
                            <option value="Nháp">Nháp</option><option value="Đã gửi">Đã gửi</option><option value="Đã chấp nhận">Đã chấp nhận</option><option value="Hết hạn">Hết hạn</option><option value="Đã hủy">Đã hủy</option>
                        </select>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/quotations')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu Báo giá</Button>
                </div>
            </form>
        </div>
        
    );
};

export default QuotationFormPage;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Quotation, QuotationItem, User, Product } from '../../types';
import Button from '../ui/Button';
// Fix: Split imports to resolve module errors. Quotation functions are local, users/products are from API.
import { getQuotations, addQuotation, updateQuotation, deleteQuotation } from '../../services/localDataService';
import { getUsers, getProducts } from '../../services/apiService';
import BackendConnectionError from '../shared/BackendConnectionError';

const getStatusColor = (status: Quotation['status']) => {
    switch (status) {
        case 'Nháp': return 'bg-gray-100 text-gray-800';
        case 'Đã gửi': return 'bg-blue-100 text-blue-800';
        case 'Đã chấp nhận': return 'bg-green-100 text-green-800';
        case 'Hết hạn':
        case 'Đã hủy': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const QuotationManagementView: React.FC = () => {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
    
    // Data for modals
    const [customers, setCustomers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [quotes, users, prods] = await Promise.all([
                getQuotations(),
                getUsers(),
                getProducts('limit=10000') // fetch all products
            ]);
            setQuotations(quotes.map(q => {
                const customer = users.find(u => u.id === q.customer_id);
                return {
                    ...q,
                    customerInfo: customer ? { name: customer.username, email: customer.email } : undefined,
                };
            }));
            setCustomers(users.filter(u => u.role === 'customer' || u.role === 'admin'));
            setProducts(prods.products);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu báo giá.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const openModalForNew = () => {
        setEditingQuotation({
            id: '', creation_date: new Date().toISOString(), items: [],
            subtotal: 0, total_amount: 0, status: 'Nháp',
        });
        setIsModalOpen(true);
    };

    const openModalForEdit = (quotation: Quotation) => {
        setEditingQuotation(quotation);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingQuotation(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data: Quotation) => {
        try {
            if (data.id && quotations.some(q => q.id === data.id)) {
                await updateQuotation(data.id, data);
            } else {
                await addQuotation(data);
            }
            loadData();
            closeModal();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu báo giá.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa báo giá này?')) {
            try {
                await deleteQuotation(id);
                loadData();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa báo giá.');
            }
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Báo giá ({quotations.length})</h3>
                <Button onClick={openModalForNew} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Tạo Báo giá</Button>
            </div>
            <div className="admin-card-body">
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead><tr><th>Mã BG</th><th>Khách hàng</th><th>Ngày tạo</th><th>Tổng tiền</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && quotations.length > 0 ? (
                                quotations.map(q => (
                                    <tr key={q.id}>
                                        <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{q.id.slice(-6)}</span></td>
                                        <td>{q.customerInfo?.name || 'N/A'}</td>
                                        <td>{new Date(q.creation_date).toLocaleDateString('vi-VN')}</td>
                                        <td className="font-semibold text-primary">{q.total_amount.toLocaleString('vi-VN')}₫</td>
                                        <td><span className={`status-badge ${getStatusColor(q.status)}`}>{q.status}</span></td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Button onClick={() => openModalForEdit(q)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                                <Button onClick={() => handleDelete(q.id)} size="sm" variant="ghost" className="text-red-500"><i className="fas fa-trash"></i></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !error && <tr><td colSpan={6} className="text-center py-4 text-textMuted">Chưa có báo giá nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <QuotationFormModal quotation={editingQuotation} customers={customers} products={products} onClose={closeModal} onSave={handleSave} />}
        </div>
    );
};


// --- FORM MODAL ---
interface QuotationFormModalProps {
    quotation: Quotation | null;
    customers: User[];
    products: Product[];
    onClose: () => void;
    onSave: (data: Quotation) => void;
}

const QuotationFormModal: React.FC<QuotationFormModalProps> = ({ quotation, customers, products, onClose, onSave }) => {
    const [formData, setFormData] = useState<Quotation>(quotation || {} as Quotation);
    const [productSearch, setProductSearch] = useState('');

    const calculateTotals = (items: QuotationItem[], discount: number = 0, tax: number = 0) => {
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const total = subtotal - discount + tax;
        return { subtotal, total };
    };

    const handleItemChange = (index: number, field: 'quantity' | 'price', value: number) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        const { subtotal, total } = calculateTotals(newItems, formData.discount_amount, formData.tax_amount);
        setFormData(p => ({ ...p, items: newItems, subtotal: subtotal, total_amount: total }));
    };
    
    const addItem = (product: Product) => {
        if(formData.items.some(i => i.productId === product.id)) return;
        const newItem: QuotationItem = { productId: product.id, productName: product.name, quantity: 1, price: product.price };
        const newItems = [...formData.items, newItem];
        const { subtotal, total } = calculateTotals(newItems, formData.discount_amount, formData.tax_amount);
        setFormData(p => ({...p, items: newItems, subtotal: subtotal, total_amount: total }));
        setProductSearch('');
    };
    
    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        const { subtotal, total } = calculateTotals(newItems, formData.discount_amount, formData.tax_amount);
        setFormData(p => ({...p, items: newItems, subtotal: subtotal, total_amount: total }));
    }
    
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    
    const filteredProducts = useMemo(() =>
        productSearch ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5) : [],
    [products, productSearch]);

    return (
        <div className="admin-modal-overlay">
        <div className="admin-modal-panel">
            <form onSubmit={handleSubmit}>
                <div className="admin-modal-header">
                    <h4 className="admin-modal-title">{formData.id ? 'Sửa Báo giá' : 'Tạo Báo giá'}</h4>
                    <button type="button" onClick={onClose}>&times;</button>
                </div>
                <div className="admin-modal-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="admin-form-group"><label>Khách hàng</label>
                            <select value={formData.customer_id || ''} onChange={e => setFormData(p=>({...p, customer_id: e.target.value}))}>
                                <option value="">-- Chọn khách hàng --</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.username} ({c.email})</option>)}
                            </select>
                        </div>
                        <div className="admin-form-group"><label>Ngày tạo</label><input type="date" value={formData.creation_date.split('T')[0]} onChange={e => setFormData(p=>({...p, creation_date: e.target.value}))} /></div>
                        <div className="admin-form-group"><label>Ngày hết hạn</label><input type="date" value={formData.expiry_date?.split('T')[0] || ''} onChange={e => setFormData(p=>({...p, expiry_date: e.target.value}))} /></div>
                    </div>

                    <div className="admin-form-subsection-title">Sản phẩm/Dịch vụ</div>
                    {/* Items table */}
                    <div className="overflow-x-auto mb-4">
                        <table className="admin-table text-sm">
                            <thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th><th></th></tr></thead>
                            <tbody>
                                {formData.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.productName}</td>
                                        <td><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-16 p-1" /></td>
                                        <td><input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} className="w-32 p-1" /></td>
                                        <td>{(item.quantity * item.price).toLocaleString('vi-VN')}₫</td>
                                        <td><Button type="button" size="sm" variant="ghost" className="!text-red-500" onClick={() => removeItem(index)}><i className="fas fa-times"></i></Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Add product search */}
                    <div className="relative admin-form-group">
                        <label>Thêm sản phẩm</label>
                        <input type="text" placeholder="Tìm kiếm sản phẩm..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                        {filteredProducts.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                                {filteredProducts.map(p => <li key={p.id} onClick={() => addItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer">{p.name}</li>)}
                            </ul>
                        )}
                    </div>
                    
                    {/* Totals */}
                     <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="admin-form-group"><label>Tổng phụ</label><input type="text" value={formData.subtotal.toLocaleString('vi-VN') + '₫'} readOnly disabled /></div>
                        <div className="admin-form-group"><label>Giảm giá</label><input type="number" value={formData.discount_amount || 0} onChange={e => { const discount = Number(e.target.value); const { total } = calculateTotals(formData.items, discount, formData.tax_amount); setFormData(p=>({...p, discount_amount: discount, total_amount: total}))}} /></div>
                        <div className="admin-form-group"><label>Thuế</label><input type="number" value={formData.tax_amount || 0} onChange={e => { const tax = Number(e.target.value); const { total } = calculateTotals(formData.items, formData.discount_amount, tax); setFormData(p=>({...p, tax_amount: tax, total_amount: total}))}} /></div>
                        <div className="admin-form-group"><label>Tổng cộng</label><input type="text" value={formData.total_amount.toLocaleString('vi-VN') + '₫'} readOnly disabled /></div>
                    </div>
                    <div className="admin-form-group"><label>Điều khoản</label><textarea value={formData.terms || ''} onChange={e => setFormData(p=>({...p, terms: e.target.value}))} rows={3}></textarea></div>
                    <div className="admin-form-group"><label>Trạng thái</label>
                        <select value={formData.status} onChange={e => setFormData(p=>({...p, status: e.target.value as Quotation['status']}))}>
                            <option value="Nháp">Nháp</option><option value="Đã gửi">Đã gửi</option><option value="Đã chấp nhận">Đã chấp nhận</option><option value="Hết hạn">Hết hạn</option><option value="Đã hủy">Đã hủy</option>
                        </select>
                    </div>

                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                    <Button type="submit">Lưu Báo giá</Button>
                </div>
            </form>
        </div>
        </div>
    );
};

export default QuotationManagementView;

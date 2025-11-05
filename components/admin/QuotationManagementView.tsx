import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Quotation, QuotationStatus, Product, User, OrderItem, CheckoutFormData } from '../../types';
import Button from '../ui/Button';
import { getQuotations, addQuotation, updateQuotation, deleteQuotation, getProducts } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';
import * as Constants from '../../constants';

const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
        case 'Bản nháp': return 'bg-gray-100 text-gray-800';
        case 'Đã gửi': return 'bg-blue-100 text-blue-800';
        case 'Đã chấp nhận': return 'bg-green-100 text-green-800';
        case 'Đã hết hạn': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const QuotationManagementView: React.FC = () => {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
    const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);


    const loadQuotations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getQuotations();
            setQuotations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu báo giá.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadQuotations();
    }, [loadQuotations]);

    const filteredQuotations = useMemo(() =>
        quotations.filter(q =>
            q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()),
    [quotations, searchTerm]);

    const handleSave = async (data: Omit<Quotation, 'id'> & { id?: string }) => {
        try {
            if (data.id) {
                await updateQuotation(data.id, data);
            } else {
                await addQuotation(data);
            }
            loadQuotations();
        } catch (error) {
            alert("Lỗi khi lưu báo giá.");
        } finally {
            setIsFormModalOpen(false);
            setEditingQuotation(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa báo giá này?')) {
            try {
                await deleteQuotation(id);
                loadQuotations();
            } catch (error) {
                alert("Lỗi khi xóa báo giá.");
            }
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Báo Giá ({filteredQuotations.length})</h3>
                <Button onClick={() => { setEditingQuotation(null); setIsFormModalOpen(true); }} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Tạo Báo giá
                </Button>
            </div>
            <div className="admin-card-body">
                 <input type="text" placeholder="Tìm báo giá..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="admin-form-group w-full max-w-md mb-4"/>
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead><tr><th>Mã BG</th><th>Khách hàng</th><th>Ngày tạo</th><th>Tổng tiền</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                        <tbody>
                            {isLoading ? ( <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                            ) : error ? ( <tr><td colSpan={6} className="text-center py-4 text-red-500">{error}</td></tr>
                            ) : filteredQuotations.length > 0 ? ( filteredQuotations.map(q => (
                                <tr key={q.id}>
                                    <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{q.id.slice(-6)}</span></td>
                                    <td>{q.customerInfo.fullName}</td>
                                    <td>{new Date(q.creationDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="font-semibold">{q.totalAmount.toLocaleString('vi-VN')}₫</td>
                                    <td><span className={`status-badge ${getStatusColor(q.status)}`}>{q.status}</span></td>
                                    <td>
                                        <div className="flex gap-2">
                                            <Button onClick={() => setViewingQuotation(q)} size="sm" variant="outline"><i className="fas fa-eye"></i></Button>
                                            <Button onClick={() => { setEditingQuotation(q); setIsFormModalOpen(true); }} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                            <Button onClick={() => handleDelete(q.id)} size="sm" variant="ghost" className="text-red-500"><i className="fas fa-trash"></i></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                            ) : ( <tr><td colSpan={6} className="text-center py-4 text-textMuted">Không có báo giá nào.</td></tr> )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            {isFormModalOpen && <QuotationFormModal quotation={editingQuotation} onSave={handleSave} onClose={() => { setIsFormModalOpen(false); setEditingQuotation(null); }} />}
            {viewingQuotation && <QuotationDetailModal quotation={viewingQuotation} onClose={() => setViewingQuotation(null)} />}
        </div>
    );
};

// --- Modal Form ---
interface QuotationFormModalProps {
    quotation: Quotation | null;
    onSave: (data: Omit<Quotation, 'id'> & { id?: string }) => void;
    onClose: () => void;
}

const QuotationFormModal: React.FC<QuotationFormModalProps> = ({ quotation, onSave, onClose }) => {
    const { users, addUser } = useAuth();
    const [formData, setFormData] = useState<Partial<Quotation>>(quotation || {
        customerInfo: { fullName: '', phone: '', email: '', address: '' },
        items: [], totalAmount: 0, creationDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Bản nháp', notes: ''
    });
    const [productSearch, setProductSearch] = useState('');
    const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search effect
    useEffect(() => {
        if (!productSearch.trim()) {
            setSearchedProducts([]);
            return;
        }
        setIsSearching(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const result = await getProducts(`q=${encodeURIComponent(productSearch)}&limit=5`);
                setSearchedProducts(result.products);
            } catch (error) {
                console.error("Failed to search products:", error);
                setSearchedProducts([]);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms delay
        return () => clearTimeout(delayDebounceFn);
    }, [productSearch]);

    const customerOptions = useMemo(() => users.filter(u => u.role === 'customer'), [users]);

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, customerInfo: { ...p.customerInfo!, [name]: value } }));
    };
    
    const handleSelectExistingCustomer = (email: string) => {
        const customer = users.find(u => u.email === email);
        if(customer) {
            setFormData(p => ({...p, customerInfo: {
                fullName: customer.username,
                email: customer.email,
                phone: customer.phone || '',
                address: customer.address || '',
                notes: ''
            }}));
        }
    }

    const handleItemChange = (index: number, field: 'quantity' | 'price', value: number) => {
        const newItems = [...(formData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(p => ({ ...p, items: newItems as OrderItem[] }));
    };

    const addItem = (product: Product) => {
        const newItems = [...(formData.items || [])];
        const existing = newItems.find(i => i.productId === product.id);
        if (existing) {
            existing.quantity++;
        } else {
            newItems.push({ productId: product.id, productName: product.name, quantity: 1, price: product.price });
        }
        setFormData(p => ({ ...p, items: newItems as OrderItem[] }));
        setProductSearch('');
        setSearchedProducts([]);
    };
    
    const removeItem = (index: number) => {
        const newItems = (formData.items || []).filter((_, i) => i !== index);
        setFormData(p => ({...p, items: newItems as OrderItem[]}));
    }

    useEffect(() => {
        const total = (formData.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setFormData(p => ({ ...p, totalAmount: total }));
    }, [formData.items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isNewCustomer = !customerOptions.some(c => c.email === formData.customerInfo?.email);
        if (isNewCustomer && formData.customerInfo?.email) {
            await addUser({
                username: formData.customerInfo.fullName,
                email: formData.customerInfo.email,
                phone: formData.customerInfo.phone,
                address: formData.customerInfo.address,
                role: 'customer'
            });
        }
        onSave(formData as Quotation);
    };

    return (
        <div className="admin-modal-overlay">
            <form onSubmit={handleSubmit} className="admin-modal-panel max-w-4xl">
                <div className="admin-modal-header"><h4 className="admin-modal-title">{formData.id ? 'Sửa Báo giá' : 'Tạo Báo giá Mới'}</h4><button type="button" onClick={onClose}>&times;</button></div>
                <div className="admin-modal-body grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h5 className="admin-form-subsection-title">Thông tin khách hàng</h5>
                         <div className="admin-form-group"><label>Tìm khách hàng cũ</label>
                            <select onChange={e => handleSelectExistingCustomer(e.target.value)} className="mb-2">
                                <option value="">-- Chọn hoặc tạo mới --</option>
                                {customerOptions.map(c => <option key={c.id} value={c.email}>{c.username} - {c.email}</option>)}
                            </select>
                        </div>
                        <div className="admin-form-group"><label>Họ tên *</label><input type="text" name="fullName" value={formData.customerInfo?.fullName || ''} onChange={handleCustomerChange} required /></div>
                        <div className="admin-form-group"><label>Email *</label><input type="email" name="email" value={formData.customerInfo?.email || ''} onChange={handleCustomerChange} required /></div>
                        <div className="admin-form-group"><label>Điện thoại *</label><input type="tel" name="phone" value={formData.customerInfo?.phone || ''} onChange={handleCustomerChange} required /></div>
                        <div className="admin-form-group"><label>Địa chỉ</label><input type="text" name="address" value={formData.customerInfo?.address || ''} onChange={handleCustomerChange} /></div>
                    </div>
                     <div>
                        <h5 className="admin-form-subsection-title">Thông tin báo giá</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="admin-form-group"><label>Ngày tạo</label><input type="date" value={(formData.creationDate || '').split('T')[0]} onChange={e => setFormData(p=>({...p, creationDate: e.target.value}))}/></div>
                            <div className="admin-form-group"><label>Ngày hết hạn</label><input type="date" value={(formData.expiryDate || '').split('T')[0]} onChange={e => setFormData(p=>({...p, expiryDate: e.target.value}))}/></div>
                            <div className="admin-form-group col-span-2"><label>Trạng thái</label>
                                <select value={formData.status} onChange={e => setFormData(p=>({...p, status: e.target.value as QuotationStatus}))}>
                                    <option value="Bản nháp">Bản nháp</option><option value="Đã gửi">Đã gửi</option><option value="Đã chấp nhận">Đã chấp nhận</option><option value="Đã hết hạn">Đã hết hạn</option>
                                </select>
                            </div>
                        </div>
                         <div className="admin-form-group"><label>Ghi chú</label><textarea rows={3} value={formData.notes || ''} onChange={e => setFormData(p => ({...p, notes: e.target.value}))}></textarea></div>
                    </div>
                     <div className="md:col-span-2">
                        <h5 className="admin-form-subsection-title">Sản phẩm</h5>
                        <div className="relative admin-form-group">
                            <label>Tìm sản phẩm</label>
                            <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Nhập tên sản phẩm..."/>
                            {(isSearching || searchedProducts.length > 0) && (
                                <ul className="absolute z-10 w-full bg-white border shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto">
                                    {isSearching ? (
                                        <li className="p-2 text-sm text-gray-500">Đang tìm...</li>
                                    ) : (
                                        searchedProducts.map(p => (
                                            <li key={p.id} onClick={() => addItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex justify-between">
                                                <span>{p.name}</span>
                                                <span className={`text-xs ${p.stock > 0 ? 'text-gray-500' : 'text-red-500 font-semibold'}`}>Tồn kho: {p.stock}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </div>
                        <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
                            {(formData.items || []).map((item, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <span className="flex-grow text-sm">{item.productName}</span>
                                    <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-16 p-1 text-center"/>
                                    <input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} className="w-28 p-1"/>
                                    <Button type="button" size="sm" variant="ghost" className="text-red-500" onClick={() => removeItem(index)}>&times;</Button>
                                </div>
                            ))}
                        </div>
                        <div className="text-right font-bold mt-4">Tổng cộng: {formData.totalAmount?.toLocaleString('vi-VN')}₫</div>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                    <Button type="submit">Lưu Báo giá</Button>
                </div>
            </form>
        </div>
    );
};


// --- Detail & Print Modal ---
interface QuotationDetailModalProps {
    quotation: Quotation;
    onClose: () => void;
}
const QuotationDetailModal: React.FC<QuotationDetailModalProps> = ({ quotation, onClose }) => {
    const handlePrint = () => window.print();

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-panel max-w-4xl">
                <div className="admin-modal-header no-print">
                    <h4 className="admin-modal-title">Chi tiết Báo giá #{quotation.id.slice(-6)}</h4>
                    <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <div className="admin-modal-body bg-white" id="printable-area">
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex justify-between items-start pb-4 border-b">
                            <div>
                                <h1 className="text-2xl font-bold text-primary">{Constants.COMPANY_NAME}</h1>
                                <p className="text-xs">{Constants.COMPANY_ADDRESS}</p>
                                <p className="text-xs">SĐT: {Constants.COMPANY_PHONE} | Email: {Constants.COMPANY_EMAIL}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-bold text-gray-700 uppercase">Báo Giá</h2>
                                <p className="text-sm">Mã số: <span className="font-mono">#{quotation.id.slice(-6)}</span></p>
                                <p className="text-sm">Ngày: {new Date(quotation.creationDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <h5 className="font-semibold text-gray-500 text-sm mb-1">Gửi đến:</h5>
                                <p className="font-bold text-lg">{quotation.customerInfo.fullName}</p>
                                <p className="text-sm">{quotation.customerInfo.address}</p>
                                <p className="text-sm">SĐT: {quotation.customerInfo.phone}</p>
                                <p className="text-sm">Email: {quotation.customerInfo.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm">Trạng thái: <span className={`font-semibold ${getStatusColor(quotation.status)} px-2 py-1 rounded-full text-xs`}>{quotation.status}</span></p>
                                <p className="text-sm">Hiệu lực đến: {new Date(quotation.expiryDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                        {/* Items Table */}
                        <div className="mt-6">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 text-sm font-semibold">Sản phẩm</th>
                                        <th className="p-2 text-sm font-semibold text-right">Đơn giá</th>
                                        <th className="p-2 text-sm font-semibold text-center">Số lượng</th>
                                        <th className="p-2 text-sm font-semibold text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotation.items.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-2">{item.productName}</td>
                                            <td className="p-2 text-right">{item.price.toLocaleString('vi-VN')}₫</td>
                                            <td className="p-2 text-center">{item.quantity}</td>
                                            <td className="p-2 text-right font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Total */}
                        <div className="flex justify-end mt-4">
                            <div className="w-full max-w-xs">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Tổng cộng:</span>
                                    <span>{quotation.totalAmount.toLocaleString('vi-VN')}₫</span>
                                </div>
                            </div>
                        </div>
                         {/* Notes */}
                        {quotation.notes && <div className="mt-6 text-sm text-gray-600 border-t pt-4"><strong>Ghi chú:</strong> {quotation.notes}</div>}
                    </div>
                </div>
                <div className="admin-modal-footer no-print">
                    <Button type="button" variant="outline" onClick={onClose}>Đóng</Button>
                    <Button type="button" variant="primary" onClick={handlePrint} leftIcon={<i className="fas fa-print"></i>}>In Báo giá</Button>
                </div>
            </div>
        </div>
    );
};

export default QuotationManagementView;
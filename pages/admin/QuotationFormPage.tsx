import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Quotation, QuotationItem, User, Product, SiteSettings } from '../../types';
import Button from '../../components/ui/Button';
import { getQuotations, addQuotation, updateQuotation } from '../../services/localDataService';
import { getUsers, getProducts } from '../../services/localDataService';
import { useNavigate, useParams } from 'react-router-dom';
import * as Constants from '../../constants';

const QuotationFormPage: React.FC = () => {
    const { quotationId } = useParams<{ quotationId: string }>();
    const navigate = useNavigate();
    const isEditing = !!quotationId;

    const [formData, setFormData] = useState<Quotation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [customers, setCustomers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
    
    const [customerSearchText, setCustomerSearchText] = useState('');
    const [customerResults, setCustomerResults] = useState<User[]>([]);

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
                
                const settingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
                setSiteSettings(settingsRaw ? JSON.parse(settingsRaw) : Constants.INITIAL_SITE_SETTINGS);

                const customerUsers = users.filter(u => u.role === 'customer' || u.role === 'admin');
                setCustomers(customerUsers);
                setProducts(prodsData.products);

                if (isEditing) {
                    const foundQuotation = allQuotes.find(q => q.id === quotationId);
                    if (foundQuotation) {
                        setFormData(foundQuotation);
                        const customer = customerUsers.find(c => c.id === foundQuotation.customer_id);
                        if(customer) {
                            setCustomerSearchText(customer.username);
                        } else if (foundQuotation.customerInfo?.name) {
                            setCustomerSearchText(foundQuotation.customerInfo.name);
                        }
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
    
    const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setCustomerSearchText(term);
        setFormData(prev => prev ? ({...prev, customerInfo: { name: term, email: '' }}) : null); // Update name for ad-hoc customer

        if (term) {
            setCustomerResults(customers.filter(c =>
                c.username.toLowerCase().includes(term.toLowerCase()) ||
                c.email.toLowerCase().includes(term.toLowerCase())
            ).slice(0, 5));
        } else {
            setCustomerResults([]);
        }
    };
    
    const handleSelectCustomer = (customer: User) => {
        setFormData(prev => prev ? ({
            ...prev,
            customer_id: customer.id,
            customerInfo: { name: customer.username, email: customer.email }
        }) : null);
        setCustomerSearchText(customer.username);
        setCustomerResults([]);
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
    
    const handlePrint = () => { window.print(); };

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

    const selectedCustomer = customers.find(c => c.id === formData.customer_id);

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header flex justify-between items-center no-print">
                    <h3 className="admin-card-title">{isEditing ? `Sửa Báo giá: #${formData.id.slice(-6)}` : 'Tạo Báo giá mới'}</h3>
                    <div>
                        <Button type="button" variant="outline" onClick={handlePrint} className="mr-2" leftIcon={<i className="fas fa-print"></i>}>In Báo giá</Button>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/quotations')}>Hủy</Button>
                    </div>
                </div>
                
                <div className="admin-card-body print-wrapper">
                     <div className="print-container max-w-4xl mx-auto p-4 bg-white">
                        {/* Print Header */}
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                                <h2 className="font-bold text-lg">{siteSettings.companyName}</h2>
                                <p>Địa chỉ: {siteSettings.companyAddress}</p>
                                <p>Điện thoại: {siteSettings.companyPhone}</p>
                                <p>Email: {siteSettings.companyEmail}</p>
                            </div>
                            <div className="text-right">
                                <p>Số Báo giá: <span className="font-bold">{formData.id?.slice(-6)}</span></p>
                            </div>
                        </div>
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold uppercase">Báo Giá</h1>
                            <p>Ngày {new Date(formData.creation_date || Date.now()).getDate()} tháng {new Date(formData.creation_date || Date.now()).getMonth() + 1} năm {new Date(formData.creation_date || Date.now()).getFullYear()}</p>
                        </div>

                        {/* Customer Info */}
                        <div className="border-t border-b border-dashed border-black py-2 mb-4">
                            <h3 className="font-bold mb-2 no-print">Thông tin khách hàng</h3>
                            <div className="grid grid-cols-1 gap-x-4 text-sm">
                                <p><strong className="w-24 inline-block">Khách hàng:</strong> {selectedCustomer?.username || formData.customerInfo?.name}</p>
                                <p><strong className="w-24 inline-block">Địa chỉ:</strong> {selectedCustomer?.address}</p>
                                <p><strong className="w-24 inline-block">Điện thoại:</strong> {selectedCustomer?.phone}</p>
                            </div>
                             <div className="admin-form-group mt-4 no-print">
                                <label>Khách hàng</label>
                                 <div className="flex items-center gap-2">
                                    <div className="relative flex-grow">
                                        <input type="text" placeholder="Tìm hoặc nhập tên khách hàng" value={customerSearchText} onChange={handleCustomerSearchChange} autoComplete="off"/>
                                        {customerResults.length > 0 && (
                                            <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto mt-1">
                                                {customerResults.map(c => <li key={c.id} onClick={() => handleSelectCustomer(c)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{c.username} ({c.email})</li>)}
                                            </ul>
                                        )}
                                    </div>
                                    <Button type="button" size="sm" variant="outline" onClick={() => navigate('/admin/customers/new')} title="Thêm khách hàng mới"><i className="fas fa-plus"></i></Button>
                                </div>
                            </div>
                        </div>
                       
                        {/* Items Table */}
                        <div className="admin-form-subsection-title no-print">Sản phẩm/Dịch vụ</div>
                        <div className="overflow-x-auto mb-4">
                            <table className="w-full text-sm text-left print-table">
                                <thead className="bg-gray-100">
                                    <tr><th className="p-2">STT</th><th className="p-2">Tên hàng hóa</th><th className="p-2 text-right">Số lượng</th><th className="p-2 text-right">Đơn giá</th><th className="p-2 text-right">Thành tiền</th><th className="p-2 no-print"></th></tr>
                                </thead>
                                <tbody>
                                    {formData.items.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-2">{index + 1}</td>
                                            <td className="p-2">{item.productName}</td>
                                            <td className="p-2 text-right"><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-16 p-1 text-right no-print" /><span className="print-only">{item.quantity}</span></td>
                                            <td className="p-2 text-right"><input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} className="w-32 p-1 text-right no-print" /><span className="print-only">{item.price.toLocaleString('vi-VN')}</span></td>
                                            <td className="p-2 text-right font-semibold">{(item.quantity * item.price).toLocaleString('vi-VN')}₫</td>
                                            <td className="p-2 no-print"><Button type="button" size="sm" variant="ghost" className="!text-red-500" onClick={() => removeItem(index)}><i className="fas fa-times"></i></Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="relative admin-form-group no-print">
                            <label>Thêm sản phẩm</label>
                            <input type="text" placeholder="Tìm kiếm sản phẩm..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                            {filteredProducts.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                                    {filteredProducts.map(p => <li key={p.id} onClick={() => addItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer">{p.name}</li>)}
                                </ul>
                            )}
                        </div>
                        
                        {/* Summary */}
                        <div className="flex justify-end mt-4">
                            <div className="w-full max-w-xs text-sm">
                                <div className="flex justify-between py-1 border-b"><span className="text-gray-600">Tổng phụ:</span><span className="font-semibold">{formData.subtotal.toLocaleString('vi-VN')}₫</span></div>
                                <div className="flex justify-between py-1 border-b"><span className="text-gray-600">Giảm giá:</span><span className="font-semibold">{(formData.discount_amount || 0).toLocaleString('vi-VN')}₫</span></div>
                                <div className="flex justify-between py-1 border-b"><span className="text-gray-600">Thuế:</span><span className="font-semibold">{(formData.tax_amount || 0).toLocaleString('vi-VN')}₫</span></div>
                                <div className="flex justify-between py-2 text-base"><span className="font-bold">Tổng cộng:</span><span className="font-bold text-red-600">{formData.total_amount.toLocaleString('vi-VN')}₫</span></div>
                            </div>
                        </div>

                        {/* Other Info */}
                        <div className="no-print mt-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="admin-form-group"><label>Giảm giá</label><input type="number" value={formData.discount_amount || 0} onChange={e => { const discount = Number(e.target.value); const { total } = calculateTotals(formData.items, discount, formData.tax_amount); setFormData(p => p ? ({ ...p, discount_amount: discount, total_amount: total }) : null)}} /></div>
                                <div className="admin-form-group"><label>Thuế</label><input type="number" value={formData.tax_amount || 0} onChange={e => { const tax = Number(e.target.value); const { total } = calculateTotals(formData.items, formData.discount_amount, tax); setFormData(p => p ? ({ ...p, tax_amount: tax, total_amount: total }) : null)}} /></div>
                                <div className="admin-form-group"><label>Ngày hết hạn</label><input type="date" value={formData.expiry_date?.split('T')[0] || ''} onChange={e => setFormData(p => p ? ({ ...p, expiry_date: e.target.value }) : null)} /></div>
                                <div className="admin-form-group"><label>Trạng thái</label>
                                    <select value={formData.status} onChange={e => setFormData(p => p ? ({ ...p, status: e.target.value as Quotation['status'] }) : null)}>
                                        <option value="Nháp">Nháp</option><option value="Đã gửi">Đã gửi</option><option value="Đã chấp nhận">Đã chấp nhận</option><option value="Hết hạn">Hết hạn</option><option value="Đã hủy">Đã hủy</option>
                                    </select>
                                </div>
                            </div>
                            <div className="admin-form-group"><label>Điều khoản</label><textarea value={formData.terms || ''} onChange={e => setFormData(p => p ? ({ ...p, terms: e.target.value }) : null)} rows={3}></textarea></div>
                        </div>

                        {/* Signatures */}
                        <div className="mt-16 grid grid-cols-2 gap-4 text-center text-sm">
                            <div><p className="font-bold">Khách hàng</p><p>(Ký & ghi rõ họ tên)</p></div>
                            <div><p className="font-bold">Người lập báo giá</p><p>(Ký & ghi rõ họ tên)</p></div>
                        </div>
                    </div>
                </div>

                <div className="admin-modal-footer no-print">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/quotations')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu Báo giá</Button>
                </div>
            </form>
        </div>
        
    );
};

export default QuotationFormPage;
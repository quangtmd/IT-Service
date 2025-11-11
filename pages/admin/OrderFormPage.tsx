import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Order, OrderItem, User, Product, OrderStatus, SiteSettings } from '../../types';
import Button from '../../components/ui/Button';
import { getOrders, addOrder, updateOrder } from '../../services/localDataService';
import { getUsers, getProducts } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';
import * as Constants from '../../constants';

const ORDER_STATUS_OPTIONS: OrderStatus[] = ['Phiếu tạm', 'Chờ xử lý', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Hoàn thành', 'Đã hủy'];

const FormattedNumberInput: React.FC<{ value: number; onChange: (value: number) => void; className?: string; }> = ({ value, onChange, className }) => {
    const [displayValue, setDisplayValue] = useState(value?.toLocaleString('vi-VN') || '0');

    useEffect(() => {
        if (Number(displayValue.replace(/[^0-9]/g, '')) !== value) {
            setDisplayValue(value.toLocaleString('vi-VN'));
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        const numValue = Number(rawValue);
        setDisplayValue(numValue.toLocaleString('vi-VN'));
    };
    
    const handleBlur = () => {
        const rawValue = displayValue.replace(/[^0-9]/g, '');
        onChange(Number(rawValue));
    };

    return (
        <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={className}
        />
    );
};


const OrderFormPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const isEditing = !!orderId;
    const { users, currentUser } = useAuth();

    const [formData, setFormData] = useState<Partial<Order> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [customers, setCustomers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
    
    const [customerSearchText, setCustomerSearchText] = useState('');
    const [customerResults, setCustomerResults] = useState<User[]>([]);

    const staffUsers = useMemo(() => users.filter(u => u.role === 'admin' || u.role === 'staff'), [users]);
    
    const calculateTotals = useCallback((items: OrderItem[]): { totalAmount: number; totalCost: number } => {
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalCost = items.reduce((sum, item) => sum + (item.purchasePrice || 0) * item.quantity, 0);
        return { totalAmount, totalCost };
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [allOrders, allUsers, prodsData] = await Promise.all([
                    getOrders(),
                    getUsers(),
                    getProducts('limit=10000')
                ]);
                
                const settingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
                setSiteSettings(settingsRaw ? JSON.parse(settingsRaw) : Constants.INITIAL_SITE_SETTINGS);

                setCustomers(allUsers.filter(u => u.role === 'customer'));
                setProducts(prodsData.products);

                if (isEditing) {
                    const foundOrder = allOrders.find(o => o.id === orderId);
                    if (foundOrder) {
                        setFormData(foundOrder);
                        setCustomerSearchText(foundOrder.customerInfo.fullName);
                    } else {
                        setError('Không tìm thấy đơn hàng để chỉnh sửa.');
                    }
                } else {
                    setFormData({
                        id: `order-${Date.now()}`,
                        orderDate: new Date().toISOString(),
                        items: [],
                        totalAmount: 0,
                        cost: 0,
                        profit: 0,
                        status: 'Phiếu tạm',
                        customerInfo: { fullName: '', phone: '', address: '', email: '' },
                        paymentInfo: { method: 'Tiền mặt', status: 'Chưa thanh toán' },
                        creatorId: currentUser?.id, // Default to current user
                        notes: '',
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [isEditing, orderId, currentUser]);
    
    useEffect(() => {
        if(formData?.items) {
            const { totalAmount, totalCost } = calculateTotals(formData.items);
            const profit = totalAmount - totalCost;
            setFormData(prev => prev ? ({...prev, totalAmount, cost: totalCost, profit }) : null);
        }
    }, [formData?.items, calculateTotals]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };
    
    const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, customerInfo: { ...prev.customerInfo!, [name]: value }}) : null);
    };

    const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setCustomerSearchText(term);

        if (term) {
            const lowerTerm = term.toLowerCase();
            setCustomerResults(customers.filter(c =>
                c.username.toLowerCase().includes(lowerTerm) ||
                (c.phone && c.phone.includes(term)) ||
                c.id.toLowerCase().includes(lowerTerm) ||
                (c.address && c.address.toLowerCase().includes(lowerTerm))
            ).slice(0, 5));
        } else {
            setCustomerResults([]);
        }
    };

    const handleSelectCustomer = (customer: User) => {
        setFormData(prev => prev ? ({
            ...prev,
            userId: customer.id,
            customerInfo: {
                fullName: customer.username,
                phone: customer.phone || '',
                address: customer.address || '',
                email: customer.email || '',
                notes: prev.customerInfo?.notes || ''
            }
        }) : null);
        setCustomerSearchText(customer.username);
        setCustomerResults([]);
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
        if (!formData?.items) return;
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(p => p ? ({ ...p, items: newItems }) : null);
    };

    const addItem = (product: Product) => {
        if (!formData || formData.items?.some(i => i.productId === product.id)) return;
        const newItem: OrderItem = { 
            productId: product.id, 
            productName: product.name, 
            quantity: 1, 
            price: product.price,
            purchasePrice: product.purchasePrice || 0,
            unit: product.unit || 'cái',
        };
        setFormData(p => p ? ({ ...p, items: [...(p.items || []), newItem] }) : null);
        setProductSearch('');
    };

    const removeItem = (index: number) => {
        if (!formData?.items) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(p => p ? ({ ...p, items: newItems }) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        try {
            if (isEditing) {
                await updateOrder(orderId!, formData as Order);
                alert('Cập nhật đơn hàng thành công!');
            } else {
                await addOrder(formData as Order);
                alert('Tạo đơn hàng mới thành công!');
            }
            navigate('/admin/orders');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu đơn hàng.');
        }
    };
    
    const handlePrint = () => { window.print(); };

    const filteredProducts = useMemo(() =>
        productSearch ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5) : [],
    [products, productSearch]);
    
    const creator = useMemo(() => staffUsers.find(u => u.id === formData?.creatorId), [staffUsers, formData?.creatorId]);


    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;

    const totalAmount = formData.totalAmount || 0;

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header flex justify-between items-center no-print">
                    <h3 className="admin-card-title">{isEditing ? `Sửa Đơn hàng #${formData.id?.slice(-6)}` : 'Tạo Đơn hàng Mới'}</h3>
                    <div>
                        <Button type="button" variant="outline" onClick={handlePrint} className="mr-2" leftIcon={<i className="fas fa-print"></i>}>In Phiếu</Button>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/orders')}>Hủy</Button>
                    </div>
                </div>
                
                {/* Main Content & Print Area */}
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
                                <p>Số HĐ: <span className="font-bold">{formData.id?.slice(-6)}</span></p>
                                <p>Mã số thuế: 010614591</p>
                            </div>
                        </div>
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold uppercase">Hóa Đơn Bán Hàng</h1>
                            <p>Ngày {new Date(formData.orderDate || Date.now()).getDate()} tháng {new Date(formData.orderDate || Date.now()).getMonth() + 1} năm {new Date(formData.orderDate || Date.now()).getFullYear()}</p>
                        </div>

                        {/* Customer Info */}
                        <div className="border-t border-b border-dashed border-black py-2 mb-4">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 no-print">
                                <div className="lg:col-span-3 space-y-4">
                                    <h3 className="font-bold text-base">Thông tin khách hàng</h3>
                                     <div className="admin-form-group relative !mb-0">
                                        <label>Tìm kiếm khách hàng</label>
                                        <div className="flex items-center gap-2">
                                            <input type="text" placeholder="Tìm theo Tên, SĐT, Mã KH, Địa chỉ..." value={customerSearchText} onChange={handleCustomerSearchChange} autoComplete="off" className="flex-grow"/>
                                            <Button type="button" size="sm" variant="outline" onClick={() => navigate('/admin/partners/customers/new')} title="Thêm khách hàng mới"><i className="fas fa-plus"></i></Button>
                                        </div>
                                        {customerResults.length > 0 && (
                                            <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto mt-1">
                                                {customerResults.map(c => <li key={c.id} onClick={() => handleSelectCustomer(c)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{c.username} ({c.phone || c.email})</li>)}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="admin-form-group"><label>Mã khách hàng</label><input type="text" value={formData.userId || 'Khách lẻ'} disabled className="bg-gray-100" /></div>
                                        <div className="admin-form-group"><label>Tên khách hàng</label><input type="text" name="fullName" value={formData.customerInfo?.fullName || ''} onChange={handleCustomerInfoChange}/></div>
                                        <div className="admin-form-group"><label>Số điện thoại</label><input type="tel" name="phone" value={formData.customerInfo?.phone || ''} onChange={handleCustomerInfoChange}/></div>
                                        <div className="admin-form-group"><label>Địa chỉ</label><input type="text" name="address" value={formData.customerInfo?.address || ''} onChange={handleCustomerInfoChange}/></div>
                                    </div>
                                </div>
                                <div className="lg:col-span-2 space-y-4">
                                     <h3 className="font-bold text-base">Thông tin đơn hàng</h3>
                                     <div className="admin-form-group">
                                        <label>Trạng thái đơn hàng</label>
                                        <select name="status" value={formData.status} onChange={handleChange}>
                                            {ORDER_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Nhân viên bán hàng</label>
                                        <select name="creatorId" value={formData.creatorId || ''} onChange={handleChange}>
                                            <option value="">-- Chọn nhân viên --</option>
                                            {staffUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                             <div className="grid grid-cols-2 gap-x-4 text-sm print-only">
                                <p><strong className="w-24 inline-block">Khách hàng:</strong> {formData.customerInfo?.fullName}</p>
                                <p><strong className="w-24 inline-block">Mã KH:</strong> {formData.userId || 'Khách lẻ'}</p>
                                <p><strong className="w-24 inline-block">Địa chỉ:</strong> {formData.customerInfo?.address}</p>
                                <p><strong className="w-24 inline-block">Điện thoại:</strong> {formData.customerInfo?.phone}</p>
                                <p><strong className="w-24 inline-block">Mã số thuế:</strong></p>
                            </div>
                        </div>
                       
                        {/* Items Table */}
                        <div className="admin-form-subsection-title">Sản phẩm/Dịch vụ</div>
                        <div className="overflow-x-auto mb-4">
                            <table className="w-full text-sm text-left print-table">
                                <thead className="bg-gray-100">
                                    <tr><th className="p-2 w-8">STT</th><th className="p-2">Tên hàng hóa</th><th className="p-2 text-right">Số lượng</th><th className="p-2 text-center">ĐVT</th><th className="p-2 text-right">Đơn giá</th><th className="p-2 text-right">Thành tiền</th><th className="p-2 no-print"></th></tr>
                                </thead>
                                <tbody>
                                    {formData.items?.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-gray-500">Chưa có sản phẩm nào.</td></tr>}
                                    {formData.items?.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-1 text-center">{index + 1}</td>
                                            <td className="p-1">{item.productName}</td>
                                            <td className="p-1"><input className="w-20 text-right no-print admin-form-group !p-1 !mb-0" type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} /><span className="print-only">{item.quantity}</span></td>
                                            <td className="p-1"><input className="w-16 text-center no-print admin-form-group !p-1 !mb-0" type="text" value={item.unit || ''} onChange={e => handleItemChange(index, 'unit', e.target.value)} /><span className="print-only">{item.unit}</span></td>
                                            <td className="p-1"><FormattedNumberInput value={item.price} onChange={value => handleItemChange(index, 'price', value)} className="w-32 text-right no-print admin-form-group !p-1 !mb-0" /><span className="print-only">{item.price.toLocaleString('vi-VN')}</span></td>
                                            <td className="p-1 text-right font-semibold">{(item.quantity * item.price).toLocaleString('vi-VN')}₫</td>
                                            <td className="p-1 text-center no-print"><Button type="button" size="sm" variant="ghost" className="!text-red-500" onClick={() => removeItem(index)}><i className="fas fa-times"></i></Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="relative admin-form-group no-print">
                            <input type="text" placeholder="Tìm kiếm để thêm sản phẩm..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                            {filteredProducts.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                                    {filteredProducts.map(p => <li key={p.id} onClick={() => addItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{p.name}</li>)}
                                </ul>
                            )}
                        </div>
                        
                        {formData.notes && (
                            <div className="mt-4 print-only">
                                <h3 className="font-bold text-sm">Ghi chú:</h3>
                                <p className="text-sm italic border p-2">{formData.notes}</p>
                            </div>
                        )}
                        
                        {/* Summary */}
                        <div className="flex justify-end mt-4">
                            <div className="w-full max-w-xs text-sm">
                                <div className="flex justify-between py-1 border-b"><span className="text-gray-600">Tổng tiền hàng:</span><span className="font-semibold">{totalAmount.toLocaleString('vi-VN')}₫</span></div>
                                <div className="flex justify-between py-1 border-b"><span className="text-gray-600">Thuế VAT (10%):</span><span className="font-semibold">{(totalAmount * 0.1).toLocaleString('vi-VN')}₫</span></div>
                                <div className="flex justify-between py-2 text-base"><span className="font-bold">Tổng cộng:</span><span className="font-bold text-red-600">{(totalAmount * 1.1).toLocaleString('vi-VN')}₫</span></div>
                            </div>
                        </div>

                         <div className="admin-form-group no-print mt-4">
                            <label>Ghi chú</label>
                            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} className="text-sm"></textarea>
                        </div>


                        {/* Signatures */}
                        <div className="mt-16 grid grid-cols-5 gap-4 text-center text-sm">
                            <div><p className="font-bold">Khách hàng</p><p>(Ký & ghi rõ họ tên)</p></div>
                            <div><p className="font-bold">Nhân viên bán hàng</p><p>(Ký & ghi rõ họ tên)</p><p className="mt-12 font-semibold">{creator?.username || ''}</p></div>
                            <div><p className="font-bold">Thủ kho</p><p>(Ký & ghi rõ họ tên)</p></div>
                            <div><p className="font-bold">Nhân viên kế toán</p><p>(Ký & ghi rõ họ tên)</p></div>
                            <div><p className="font-bold">Giám đốc</p><p>(Ký & ghi rõ họ tên)</p></div>
                        </div>
                    </div>
                </div>

                <div className="admin-modal-footer no-print">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/orders')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu Đơn hàng</Button>
                </div>
            </form>
        </div>
    );
};

export default OrderFormPage;
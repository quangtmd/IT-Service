import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Order, OrderItem, User, Product, OrderStatus, SiteSettings } from '../../types';
import Button from '../../components/ui/Button';
import { getOrders, addOrder, updateOrder } from '../../services/localDataService';
import { getUsers, getProducts } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';
import * as Constants from '../../constants';

const ORDER_STATUS_OPTIONS: OrderStatus[] = ['Phiếu tạm', 'Chờ xử lý', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Hoàn thành', 'Đã hủy'];

const InfoItem: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode; className?: string }> = ({ label, value, children, className }) => (
    <div className={className}>
        <p className="text-xs text-textMuted">{label}</p>
        {children || <p className="text-sm font-medium text-textBase">{value || 'N/A'}</p>}
    </div>
);


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

    const [discount, setDiscount] = useState({ type: 'fixed' as 'fixed' | 'percentage', value: 0 });


    const staffUsers = useMemo(() => users.filter(u => u.role === 'admin' || u.role === 'staff'), [users]);
    
    const subtotal = useMemo(() => {
        return formData?.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
    }, [formData?.items]);
    
    const discountAmount = useMemo(() => {
        if (discount.type === 'percentage') {
            return subtotal * (discount.value / 100);
        }
        return discount.value;
    }, [subtotal, discount]);

    const totalAmount = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);
    const amountDue = useMemo(() => totalAmount - (formData?.paidAmount || 0), [totalAmount, formData?.paidAmount]);


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
                        paidAmount: 0,
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
            const totalCost = formData.items.reduce((sum, item) => sum + (item.purchasePrice || 0) * item.quantity, 0);
            const profit = totalAmount - totalCost;
            setFormData(prev => prev ? ({...prev, totalAmount, cost: totalCost, profit }) : null);
        } else if (formData) {
            setFormData(prev => prev ? ({...prev, totalAmount }) : null);
        }
    }, [totalAmount, formData?.items]);

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
            setFormData(prev => prev ? ({
                ...prev,
                userId: undefined,
                customerInfo: { fullName: '', phone: '', address: '', email: '', notes: prev.customerInfo?.notes || '' }
            }) : null);
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
        newItems[index] = { ...newItems[index], [field]: Number(value) };
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

    return (
        <form onSubmit={handleSubmit}>
            <div className="admin-page-header flex justify-between items-center !m-0 !mb-6 no-print">
                <h1 className="admin-page-title">{isEditing ? `Chỉnh sửa Đơn hàng` : 'Tạo Đơn hàng Mới'}</h1>
                 <div>
                    <Button type="button" variant="outline" onClick={handlePrint} className="mr-2">In Phiếu</Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/orders')} className="mr-2">Hủy</Button>
                    <Button type="submit" variant="primary">Lưu Đơn hàng</Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info Card */}
                    <div className="admin-card">
                         <div className="admin-card-header">
                            <h3 className="admin-card-title">Thông tin khách hàng</h3>
                        </div>
                        <div className="admin-card-body">
                            <div className="admin-form-group relative !mb-0">
                                <label>Tìm kiếm khách hàng</label>
                                <div className="flex items-center gap-2">
                                    <input type="text" placeholder="Tìm theo Tên, SĐT, Mã KH..." value={customerSearchText} onChange={handleCustomerSearchChange} autoComplete="off" className="flex-grow"/>
                                    <Button type="button" size="sm" variant="outline" onClick={() => navigate('/admin/customers/new')} title="Thêm khách hàng mới"><i className="fas fa-plus"></i></Button>
                                </div>
                                {customerResults.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto mt-1">
                                        {customerResults.map(c => <li key={c.id} onClick={() => handleSelectCustomer(c)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{c.username} ({c.phone || c.email})</li>)}
                                    </ul>
                                )}
                            </div>
                            {(customerSearchText || formData.userId) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div className="admin-form-group"><label>Mã khách hàng</label><input type="text" value={formData.userId || 'Khách lẻ'} disabled className="bg-gray-100" /></div>
                                    <div className="admin-form-group"><label>Tên khách hàng</label><input type="text" name="fullName" value={formData.customerInfo?.fullName || ''} onChange={handleCustomerInfoChange}/></div>
                                    <div className="admin-form-group"><label>Số điện thoại</label><input type="tel" name="phone" value={formData.customerInfo?.phone || ''} onChange={handleCustomerInfoChange}/></div>
                                    <div className="admin-form-group"><label>Địa chỉ</label><input type="text" name="address" value={formData.customerInfo?.address || ''} onChange={handleCustomerInfoChange}/></div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Products Card */}
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3 className="admin-card-title">Sản phẩm/Dịch vụ</h3>
                        </div>
                        <div className="admin-card-body">
                             <div className="relative admin-form-group">
                                <input type="text" placeholder="Tìm kiếm để thêm sản phẩm..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                                {filteredProducts.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto mt-1">
                                        {filteredProducts.map(p => <li key={p.id} onClick={() => addItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{p.name}</li>)}
                                    </ul>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50">
                                        <tr><th className="p-2 w-8">STT</th><th className="p-2">Tên hàng hóa</th><th className="p-2 text-right">SL</th><th className="p-2 text-center">ĐVT</th><th className="p-2 text-right">Đơn giá</th><th className="p-2 text-right">Thành tiền</th><th className="p-2"></th></tr>
                                    </thead>
                                    <tbody>
                                        {formData.items?.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-gray-500">Chưa có sản phẩm nào.</td></tr>}
                                        {formData.items?.map((item, index) => (
                                            <tr key={item.productId || index} className="border-b">
                                                <td className="p-1 text-center">{index + 1}</td>
                                                <td className="p-1">{item.productName}</td>
                                                <td className="p-1"><input className="w-20 text-right admin-form-group !p-1 !mb-0" type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} /></td>
                                                <td className="p-1 text-center">{item.unit}</td>
                                                <td className="p-1"><input className="w-32 text-right admin-form-group !p-1 !mb-0" type="number" value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} /></td>
                                                <td className="p-1 text-right font-semibold">{(item.quantity * item.price).toLocaleString('vi-VN')}₫</td>
                                                <td className="p-1 text-center"><Button type="button" size="sm" variant="ghost" className="!text-red-500" onClick={() => removeItem(index)}><i className="fas fa-times"></i></Button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="sticky top-24">
                        <div className="admin-card">
                            <div className="admin-card-header"><h3 className="admin-card-title">Thông tin Phiếu</h3></div>
                            <div className="admin-card-body space-y-4">
                                <InfoItem label="Mã phiếu" value={formData.id?.slice(-8).toUpperCase()} />
                                <InfoItem label="Ngày tạo" value={new Date(formData.orderDate || Date.now()).toLocaleString('vi-VN')} />
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
                                 <div className="admin-form-group">
                                    <label>Ghi chú</label>
                                    <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="text-sm"></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="admin-card mt-6">
                             <div className="admin-card-header"><h3 className="admin-card-title">Thanh toán</h3></div>
                             <div className="admin-card-body space-y-3 text-sm">
                                <InfoItem label="Tổng tiền hàng" value={subtotal.toLocaleString('vi-VN') + '₫'} />
                                <div className="admin-form-group !mb-0">
                                    <label className="text-xs text-textMuted">Giảm giá</label>
                                    <div className="flex items-center gap-1">
                                        <input type="number" value={discount.value} onChange={e => setDiscount(d => ({...d, value: Number(e.target.value)}))} className="flex-grow !py-1"/>
                                        <select value={discount.type} onChange={e => setDiscount(d => ({...d, type: e.target.value as any}))} className="!py-1 w-16">
                                            <option value="fixed">VND</option>
                                            <option value="percentage">%</option>
                                        </select>
                                    </div>
                                </div>
                                <InfoItem label="Tổng cộng" value={totalAmount.toLocaleString('vi-VN') + '₫'} className="!text-lg !font-bold !text-primary pt-2 border-t"/>
                                <div className="admin-form-group !mb-0">
                                    <label className="text-xs text-textMuted">Đã thanh toán</label>
                                    <input type="number" name="paidAmount" value={formData.paidAmount || ''} onChange={handleChange} className="!py-1"/>
                                </div>
                                 <InfoItem label="Còn lại" value={amountDue.toLocaleString('vi-VN') + '₫'} className="!text-base !font-semibold !text-red-600"/>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            
             {/* --- Print Section (Hidden) --- */}
            <div className="print-wrapper hidden print:block">
                {/* Content for printing can be duplicated or specially formatted here */}
            </div>
        </form>
    );
};

export default OrderFormPage;
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
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);


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
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                const saveBtn = document.getElementById('btn-save-order');
                if (saveBtn) saveBtn.click();
            }
            if (e.key === 'F9') {
                e.preventDefault();
                handlePrint();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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
                    const now = Date.now();
                    setFormData({
                        id: `order-${now}`,
                        orderNumber: `T${now.toString().slice(-6)}`,
                        orderDate: new Date().toISOString(),
                        items: [],
                        totalAmount: 0,
                        paidAmount: 0,
                        cost: 0,
                        profit: 0,
                        status: 'Phiếu tạm',
                        customerInfo: { fullName: 'Khách lẻ', phone: '', address: '', email: '' },
                        paymentInfo: { method: 'Tiền mặt', status: 'Chưa thanh toán' },
                        creatorId: currentUser?.id,
                        notes: '',
                    });
                     setCustomerSearchText('Khách lẻ');
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
        setShowCustomerDropdown(true);

        if (term && term.toLowerCase() !== 'khách lẻ') {
            const lowerTerm = term.toLowerCase();
            const results = customers.filter(c =>
                c.username.toLowerCase().includes(lowerTerm) ||
                (c.phone && c.phone.includes(term)) ||
                c.id.toLowerCase().includes(lowerTerm) ||
                (c.address && c.address.toLowerCase().includes(lowerTerm))
            ).slice(0, 5);
            setCustomerResults(results);
        } else {
            setCustomerResults([]);
            setFormData(prev => prev ? ({
                ...prev,
                userId: undefined,
                customerInfo: { fullName: 'Khách lẻ', phone: '', address: '', email: '', notes: prev.customerInfo?.notes || '' }
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
        setShowCustomerDropdown(false);
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
        if (!formData?.items) return;
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: Number(value) };
        setFormData(p => p ? ({ ...p, items: newItems }) : null);
    };

    const addItem = (product: Product) => {
        if (!formData || formData.items?.some(i => i.productId === product.id)) {
            setProductSearch('');
            setShowProductDropdown(false);
            return;
        }
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
        setShowProductDropdown(false);
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
        productSearch ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.productCode?.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 10) : [],
    [products, productSearch]);
    
    const creator = useMemo(() => staffUsers.find(u => u.id === formData?.creatorId), [staffUsers, formData?.creatorId]);


    if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!formData) return null;
    
    const showCustomerDetails = customerSearchText && customerSearchText.toLowerCase() !== 'khách lẻ';

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6 no-print">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{isEditing ? `Sửa Đơn Hàng` : 'Tạo Đơn Hàng Mới'}</h1>
                    <p className="text-sm text-gray-500">Mã phiếu: <span className="font-mono bg-gray-100 px-1 rounded">{formData.orderNumber || formData.id}</span></p>
                </div>
                <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/orders')} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <i className="fas fa-arrow-left mr-2"></i> Quay lại
                    </Button>
                    <Button type="button" variant="outline" onClick={handlePrint} className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100" title="Phím tắt: F9">
                        <i className="fas fa-print mr-2"></i> In Phiếu (F9)
                    </Button>
                    <Button type="submit" id="btn-save-order" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200" title="Phím tắt: F2">
                        <i className="fas fa-save mr-2"></i> Lưu Đơn Hàng (F2)
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full no-print">
                {/* Left Column: Products & Items */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Products Search & List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
                         <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700 flex items-center gap-2"><i className="fas fa-box-open text-blue-500"></i> Sản phẩm / Dịch vụ</h3>
                        </div>
                        
                        <div className="p-4 product-search-container relative">
                             <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-search text-gray-400"></i>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm sản phẩm (Tên, Mã SP)..." 
                                    value={productSearch} 
                                    onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm"
                                />
                            </div>
                            
                            {showProductDropdown && filteredProducts.length > 0 && (
                                <ul className="absolute z-50 w-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto divide-y divide-gray-100">
                                    {filteredProducts.map(p => (
                                        <li key={p.id} onClick={() => addItem(p)} className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-colors">
                                            <div className="flex items-center gap-3">
                                                <img src={p.imageUrls?.[0] || 'https://placehold.co/40x40'} alt="" className="w-10 h-10 object-cover rounded bg-gray-100" />
                                                <div>
                                                    <p className="font-medium text-gray-800 group-hover:text-blue-700">{p.name}</p>
                                                    <p className="text-xs text-gray-500">Mã: {p.productCode || p.id}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-blue-600">{p.price.toLocaleString('vi-VN')}₫</p>
                                                <p className="text-xs text-gray-500">Tồn: <span className={p.stock > 0 ? 'text-green-600' : 'text-red-600'}>{p.stock}</span></p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex-grow overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-y border-gray-200">
                                    <tr>
                                        <th className="p-3 pl-4 w-10">#</th>
                                        <th className="p-3">Tên hàng hóa</th>
                                        <th className="p-3 text-center w-20">ĐVT</th>
                                        <th className="p-3 text-right w-24">SL</th>
                                        <th className="p-3 text-right w-32">Đơn giá</th>
                                        <th className="p-3 text-right w-32">Thành tiền</th>
                                        <th className="p-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {formData.items?.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <i className="fas fa-shopping-basket text-4xl mb-3 opacity-30"></i>
                                                    <p>Chưa có sản phẩm nào trong đơn hàng.</p>
                                                    <p className="text-xs mt-1">Vui lòng tìm kiếm và thêm sản phẩm ở trên.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        formData.items?.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 group">
                                                <td className="p-3 pl-4 text-gray-400">{index + 1}</td>
                                                <td className="p-3 font-medium text-gray-700">{item.productName}</td>
                                                <td className="p-3 text-center text-gray-500">{item.unit}</td>
                                                <td className="p-3 text-right">
                                                    <input 
                                                        type="number" 
                                                        value={item.quantity} 
                                                        min="1"
                                                        onChange={e => handleItemChange(index, 'quantity', e.target.value)} 
                                                        className="w-16 p-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                </td>
                                                <td className="p-3 text-right">
                                                    <input 
                                                        type="number" 
                                                        value={item.price} 
                                                        onChange={e => handleItemChange(index, 'price', e.target.value)} 
                                                        className="w-24 p-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                </td>
                                                <td className="p-3 text-right font-semibold text-gray-800">{(item.quantity * item.price).toLocaleString('vi-VN')}</td>
                                                <td className="p-3 text-center">
                                                    <button type="button" onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Payment */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Customer Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
                            <i className="fas fa-user-circle text-blue-500"></i> Khách hàng
                        </h3>
                        
                        <div className="relative customer-search-container mb-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-search text-gray-400"></i>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Tìm khách hàng (Tên, SĐT)..." 
                                    value={customerSearchText} 
                                    onChange={handleCustomerSearchChange} 
                                    onFocus={() => setShowCustomerDropdown(true)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <div className="absolute inset-y-0 right-0 pr-1 flex items-center">
                                     <button type="button" onClick={() => navigate('/admin/customers/new')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md" title="Thêm khách hàng mới">
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                            {showCustomerDropdown && customerResults.length > 0 && (
                                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {customerResults.map(c => (
                                        <li key={c.id} onClick={() => handleSelectCustomer(c)} className="p-2.5 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-0">
                                            <div className="font-medium text-gray-800">{c.username}</div>
                                            <div className="text-xs text-gray-500">{c.phone} - {c.email}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="space-y-3 text-sm">
                             <div className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">Tên khách hàng</label>
                                <input type="text" name="fullName" value={formData.customerInfo?.fullName || ''} onChange={handleCustomerInfoChange} className="p-2 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">Số điện thoại</label>
                                <input type="tel" name="phone" value={formData.customerInfo?.phone || ''} onChange={handleCustomerInfoChange} className="p-2 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                            </div>
                             <div className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">Địa chỉ</label>
                                <input type="text" name="address" value={formData.customerInfo?.address || ''} onChange={handleCustomerInfoChange} className="p-2 border border-gray-300 rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Payment Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                         <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
                            <i className="fas fa-file-invoice-dollar text-green-500"></i> Thanh toán
                        </h3>
                        
                        <div className="space-y-3 text-sm">
                             <div className="flex justify-between items-center text-gray-600">
                                <span>Tổng tiền hàng:</span>
                                <span className="font-semibold text-gray-800">{subtotal.toLocaleString('vi-VN')}₫</span>
                            </div>
                            
                             <div className="flex justify-between items-center text-gray-600">
                                <span>Giảm giá:</span>
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="number" 
                                        value={discount.value} 
                                        onChange={e => setDiscount(d => ({...d, value: Number(e.target.value)}))} 
                                        className="w-20 text-right p-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                    <select 
                                        value={discount.type} 
                                        onChange={e => setDiscount(d => ({...d, type: e.target.value as any}))} 
                                        className="p-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs bg-gray-50"
                                    >
                                        <option value="fixed">₫</option>
                                        <option value="percentage">%</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="border-t border-dashed border-gray-200 my-2 pt-2">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span className="text-gray-800">Khách cần trả:</span>
                                    <span className="text-blue-600">{totalAmount.toLocaleString('vi-VN')}₫</span>
                                </div>
                            </div>

                             <div className="flex justify-between items-center text-gray-600">
                                <label htmlFor="paidAmount">Khách thanh toán:</label>
                                <input 
                                    id="paidAmount"
                                    type="number" 
                                    name="paidAmount" 
                                    value={formData.paidAmount || ''} 
                                    onChange={handleChange} 
                                    onFocus={(e) => e.target.select()}
                                    className="w-32 text-right p-2 border border-gray-300 rounded font-semibold text-gray-800 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            
                            {amountDue > 0 && (
                                <div className="flex justify-between items-center text-red-600 font-medium bg-red-50 p-2 rounded">
                                    <span>Còn nợ:</span>
                                    <span>{amountDue.toLocaleString('vi-VN')}₫</span>
                                </div>
                            )}
                            
                             <div className="pt-4 mt-2 border-t border-gray-100">
                                <div className="mb-3">
                                    <label className="text-xs text-gray-500 block mb-1">Hình thức thanh toán</label>
                                    <select name="paymentMethod" value={formData.paymentInfo?.method || 'Tiền mặt'} onChange={(e) => setFormData(p => p ? ({...p, paymentInfo: {...p.paymentInfo!, method: e.target.value as any}}) : null)} className="w-full p-2 border border-gray-300 rounded bg-white text-sm">
                                        <option value="Tiền mặt">Tiền mặt</option>
                                        <option value="Chuyển khoản ngân hàng">Chuyển khoản</option>
                                        <option value="Thanh toán khi nhận hàng (COD)">COD</option>
                                    </select>
                                </div>
                                 <div className="mb-3">
                                    <label className="text-xs text-gray-500 block mb-1">Trạng thái đơn</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded bg-white text-sm">
                                        {ORDER_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Ghi chú đơn hàng</label>
                                    <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Print Template (Hidden by default, shown for print) --- */}
            <div className="print-wrapper hidden print:block bg-white text-black font-sans text-sm leading-snug">
                <div className="print-container max-w-[210mm] mx-auto p-8">
                    {/* Header */}
                    <header className="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-4">
                        <div className="flex items-start gap-4">
                             <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-full border-2 border-gray-800">
                                <span className="font-bold text-xl">IQ</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold uppercase tracking-wide">{siteSettings.companyName}</h1>
                                <p className="text-xs mt-1">Địa chỉ: {siteSettings.companyAddress}</p>
                                <p className="text-xs">Hotline: <strong>{siteSettings.companyPhone}</strong></p>
                            </div>
                        </div>
                        <div className="text-right">
                             <h2 className="text-3xl font-extrabold uppercase tracking-widest text-gray-900">Hóa Đơn</h2>
                             <p className="text-sm mt-1">Mã phiếu: <strong>{formData.orderNumber || formData.id}</strong></p>
                             <p className="text-sm">Ngày: {new Date(formData.orderDate || Date.now()).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </header>

                    {/* Info */}
                    <section className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                            <h3 className="font-bold border-b border-gray-300 mb-2 pb-1 uppercase text-xs text-gray-500">Thông tin khách hàng</h3>
                            <p><strong>Khách hàng:</strong> {formData.customerInfo?.fullName || 'Khách lẻ'}</p>
                            <p><strong>Điện thoại:</strong> {formData.customerInfo?.phone || '---'}</p>
                            <p><strong>Địa chỉ:</strong> {formData.customerInfo?.address || '---'}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold border-b border-gray-300 mb-2 pb-1 uppercase text-xs text-gray-500">Thông tin bổ sung</h3>
                            <p><strong>Thu ngân:</strong> {creator?.username || 'Admin'}</p>
                            <p><strong>Ghi chú:</strong> {formData.notes || '---'}</p>
                        </div>
                    </section>

                    {/* Table */}
                    <main>
                        <table className="w-full mb-6 border-collapse">
                            <thead>
                                <tr className="border-y-2 border-gray-800 bg-gray-100">
                                    <th className="py-2 text-left w-10">STT</th>
                                    <th className="py-2 text-left">Tên sản phẩm</th>
                                    <th className="py-2 text-center w-16">ĐVT</th>
                                    <th className="py-2 text-right w-16">SL</th>
                                    <th className="py-2 text-right w-28">Đơn giá</th>
                                    <th className="py-2 text-right w-32">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.items?.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-200">
                                        <td className="py-2 text-center">{index + 1}</td>
                                        <td className="py-2 font-medium">{item.productName}</td>
                                        <td className="py-2 text-center">{item.unit}</td>
                                        <td className="py-2 text-right">{item.quantity}</td>
                                        <td className="py-2 text-right">{item.price.toLocaleString('vi-VN')}</td>
                                        <td className="py-2 text-right font-bold">{(item.quantity * item.price).toLocaleString('vi-VN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </main>

                    {/* Totals */}
                    <section className="flex justify-end mb-12">
                        <div className="w-72 space-y-2">
                             <div className="flex justify-between">
                                <span>Tổng tiền hàng:</span>
                                <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Giảm giá:</span>
                                <span>- {discountAmount.toLocaleString('vi-VN')}₫</span>
                            </div>
                             <div className="flex justify-between border-t-2 border-gray-800 pt-2 text-lg font-bold">
                                <span>Thành tiền:</span>
                                <span>{totalAmount.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="text-right italic text-xs text-gray-500 mt-1">
                                (Bằng chữ: ........................................................................)
                            </div>
                        </div>
                    </section>
                    
                    {/* Signatures */}
                    <footer className="grid grid-cols-2 gap-8 text-center mt-auto pt-8">
                        <div>
                            <p className="font-bold uppercase text-xs mb-16">Người mua hàng</p>
                            <p className="italic text-xs">(Ký, ghi rõ họ tên)</p>
                        </div>
                        <div>
                            <p className="font-bold uppercase text-xs mb-16">Người bán hàng</p>
                            <p className="italic text-xs">(Ký, ghi rõ họ tên)</p>
                        </div>
                    </footer>
                    
                    <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
                        Cảm ơn quý khách đã mua hàng tại {siteSettings.companyName}!
                    </div>
                </div>
            </div>
        </form>
    );
};

export default OrderFormPage;
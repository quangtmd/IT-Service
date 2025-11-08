import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Order, OrderItem, User, Product, OrderStatus, SiteSettings } from '../../types';
import Button from '../../components/ui/Button';
// Fix: Add updateOrder to the import list
import { getOrders, addOrder, updateOrder } from '../../services/localDataService';
import { getUsers, getProducts } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';
import * as Constants from '../../constants';


const ORDER_STATUS_OPTIONS: OrderStatus[] = ['Phiếu tạm', 'Chờ xử lý', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Hoàn thành', 'Đã hủy'];


const OrderFormPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const isEditing = !!orderId;
    const { users } = useAuth();

    const [formData, setFormData] = useState<Partial<Order> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [customers, setCustomers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);

    const staffUsers = useMemo(() => users.filter(u => u.role === 'admin' || u.role === 'staff'), [users]);
    
    const calculateTotals = useCallback((items: OrderItem[]): number => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
                    } else {
                        setError('Không tìm thấy đơn hàng để chỉnh sửa.');
                    }
                } else {
                    setFormData({
                        id: `order-${Date.now()}`,
                        orderDate: new Date().toISOString(),
                        items: [],
                        totalAmount: 0,
                        status: 'Phiếu tạm',
                        customerInfo: { fullName: '', phone: '', address: '', email: '' },
                        paymentInfo: { method: 'Tiền mặt', status: 'Chưa thanh toán' },
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [isEditing, orderId]);
    
    useEffect(() => {
        if(formData?.items) {
            const newTotal = calculateTotals(formData.items);
            setFormData(prev => prev ? ({...prev, totalAmount: newTotal}) : null);
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

    const handleItemChange = (index: number, field: 'quantity' | 'price', value: number) => {
        if (!formData?.items) return;
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(p => p ? ({ ...p, items: newItems }) : null);
    };

    const addItem = (product: Product) => {
        if (!formData || formData.items?.some(i => i.productId === product.id)) return;
        const newItem: OrderItem = { productId: product.id, productName: product.name, quantity: 1, price: product.price };
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

    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;

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
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold uppercase">Hóa Đơn Bán Hàng</h1>
                            <p>Ngày {new Date(formData.orderDate || Date.now()).getDate()} tháng {new Date(formData.orderDate || Date.now()).getMonth() + 1} năm {new Date(formData.orderDate || Date.now()).getFullYear()}</p>
                        </div>
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

                        {/* Customer Info */}
                        <div className="border-t border-b border-dashed border-black py-2 mb-4">
                            <h3 className="font-bold mb-2 no-print">Thông tin khách hàng</h3>
                            <div className="grid grid-cols-2 gap-x-4 text-sm">
                                <p><strong className="w-24 inline-block">Khách hàng:</strong> {formData.customerInfo?.fullName}</p>
                                <p><strong className="w-24 inline-block">Mã số thuế:</strong></p>
                                <p><strong className="w-24 inline-block">Địa chỉ:</strong> {formData.customerInfo?.address}</p>
                                <p><strong className="w-24 inline-block">Điện thoại:</strong> {formData.customerInfo?.phone}</p>
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 no-print">
                                 <div className="admin-form-group"><input type="text" name="fullName" placeholder="Tên khách hàng" value={formData.customerInfo?.fullName || ''} onChange={handleCustomerInfoChange}/></div>
                                 <div className="admin-form-group"><input type="tel" name="phone" placeholder="Số điện thoại" value={formData.customerInfo?.phone || ''} onChange={handleCustomerInfoChange}/></div>
                                 <div className="admin-form-group sm:col-span-2"><input type="text" name="address" placeholder="Địa chỉ" value={formData.customerInfo?.address || ''} onChange={handleCustomerInfoChange}/></div>
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
                                    {formData.items?.map((item, index) => (
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
                            <input type="text" placeholder="Tìm kiếm để thêm sản phẩm..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                            {filteredProducts.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                                    {filteredProducts.map(p => <li key={p.id} onClick={() => addItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{p.name}</li>)}
                                </ul>
                            )}
                        </div>
                        
                        {/* Summary */}
                        <div className="flex justify-end mt-4">
                            <div className="w-full max-w-xs text-sm">
                                <div className="flex justify-between py-1 border-b"><span className="text-gray-600">Tổng tiền hàng:</span><span className="font-semibold">{calculateTotals(formData.items || []).toLocaleString('vi-VN')}₫</span></div>
                                <div className="flex justify-between py-1 border-b"><span className="text-gray-600">Thuế VAT (10%):</span><span className="font-semibold">{(calculateTotals(formData.items || []) * 0.1).toLocaleString('vi-VN')}₫</span></div>
                                <div className="flex justify-between py-2 text-base"><span className="font-bold">Tổng cộng:</span><span className="font-bold text-red-600">{(calculateTotals(formData.items || []) * 1.1).toLocaleString('vi-VN')}₫</span></div>
                            </div>
                        </div>

                        {/* Order Status */}
                        <div className="admin-form-group mt-4 no-print">
                            <label>Trạng thái đơn hàng</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                {ORDER_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        
                        {/* Signatures */}
                        <div className="mt-16 grid grid-cols-5 gap-4 text-center text-sm">
                            <div><p className="font-bold">Khách hàng</p><p>(Ký & ghi rõ họ tên)</p></div>
                            <div><p className="font-bold">Người nhận hàng</p><p>(Ký & ghi rõ họ tên)</p></div>
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
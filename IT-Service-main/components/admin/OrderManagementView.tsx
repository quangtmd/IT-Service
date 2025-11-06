import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Order, OrderStatus, FinancialTransaction, CheckoutFormData, Product, User, OrderItem } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';
import { getOrders, updateOrderStatus, addFinancialTransaction, addOrder, getProducts } from '../../services/localDataService';
import BackendConnectionError from '../shared/BackendConnectionError';
import { useAuth } from '../../contexts/AuthContext';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Chờ xử lý': return 'bg-yellow-100 text-yellow-800';
        case 'Đang chuẩn bị': return 'bg-blue-100 text-blue-800';
        case 'Đang giao': return 'bg-indigo-100 text-indigo-800';
        case 'Hoàn thành': return 'bg-green-100 text-green-800';
        case 'Đã hủy': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const OrderManagementView: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const loadOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const ordersFromDb = await getOrders();
            setOrders(ordersFromDb);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu đơn hàng.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const filteredOrders = useMemo(() =>
        orders.filter(o =>
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerInfo.phone.includes(searchTerm) ||
            o.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()),
    [orders, searchTerm]);

    const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            // Automatically create a financial transaction when an order is completed
            if (newStatus === 'Hoàn thành') {
                const order = orders.find(o => o.id === orderId);
                if (order && order.status !== 'Hoàn thành') { // Prevent duplicate transactions
                    const newTransaction: Omit<FinancialTransaction, 'id'> = {
                        date: new Date().toISOString(),
                        amount: order.totalAmount,
                        type: 'income',
                        category: 'Doanh thu Bán hàng',
                        description: `Doanh thu từ đơn hàng #${order.id.slice(-6)}`,
                        relatedEntity: order.customerInfo.fullName,
                        invoiceNumber: order.id,
                    };
                    await addFinancialTransaction(newTransaction);
                }
            }

            await updateOrderStatus(orderId, newStatus);
            loadOrders(); // Refresh data from API
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật trạng thái.");
        }
    };
    
    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Đơn hàng ({filteredOrders.length})</h3>
                 <Button onClick={() => setIsCreateModalOpen(true)} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Tạo Đơn hàng
                </Button>
            </div>
            <div className="admin-card-body">
                <input
                    type="text"
                    placeholder="Tìm đơn hàng theo mã, tên, SĐT, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-form-group w-full max-w-md mb-4"
                />
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã ĐH</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">Đang tải đơn hàng...</td></tr>
                            ) : !error && filteredOrders.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-4">Không tìm thấy đơn hàng.</td></tr>
                            ) : (
                                !error && filteredOrders.map(order => (
                                    <tr key={order.id}>
                                        <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{order.id.slice(-6)}</span></td>
                                        <td>{order.customerInfo.fullName}</td>
                                        <td>{new Date(order.orderDate).toLocaleString('vi-VN')}</td>
                                        <td className="font-semibold text-primary">{order.totalAmount.toLocaleString('vi-VN')}₫</td>
                                        <td><span className={`status-badge ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                        <td>
                                            <Button onClick={() => setSelectedOrder(order)} size="sm" variant="outline">Xem</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
            {isCreateModalOpen && (
                <OrderFormModal 
                    onClose={() => setIsCreateModalOpen(false)}
                    onSave={() => {
                        setIsCreateModalOpen(false);
                        loadOrders();
                    }}
                />
            )}
        </div>
    );
};

// --- Order Detail Modal ---
interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}
const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onUpdateStatus }) => {
    const handlePrint = () => window.print();

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-panel max-w-4xl">
                <div className="admin-modal-header no-print">
                    <h4 className="admin-modal-title">Chi tiết Đơn hàng #{order.id.slice(-6)}</h4>
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
                                <h2 className="text-3xl font-bold text-gray-700 uppercase">Hóa Đơn</h2>
                                <p className="text-sm">Mã đơn: <span className="font-mono">#{order.id.slice(-6)}</span></p>
                                <p className="text-sm">Ngày: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <h5 className="font-semibold text-gray-500 text-sm mb-1">Khách hàng:</h5>
                                <p className="font-bold text-lg">{order.customerInfo.fullName}</p>
                                <p className="text-sm">{order.customerInfo.address}</p>
                                <p className="text-sm">SĐT: {order.customerInfo.phone}</p>
                                <p className="text-sm">Email: {order.customerInfo.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm">Trạng thái: <span className={`font-semibold ${getStatusColor(order.status)} px-2 py-1 rounded-full text-xs`}>{order.status}</span></p>
                                <p className="text-sm">Thanh toán: {order.paymentInfo.method} ({order.paymentInfo.status})</p>
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
                                    {order.items.map((item, index) => (
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
                                    <span>{order.totalAmount.toLocaleString('vi-VN')}₫</span>
                                </div>
                            </div>
                        </div>
                         {/* Notes */}
                        {order.customerInfo.notes && <div className="mt-6 text-sm text-gray-600 border-t pt-4"><strong>Ghi chú của khách hàng:</strong> {order.customerInfo.notes}</div>}
                    </div>
                </div>
                <div className="admin-modal-footer no-print">
                     <div className="flex-grow">
                        <label htmlFor="orderStatus" className="mr-2 text-sm font-medium">Cập nhật trạng thái:</label>
                        <select id="orderStatus" value={order.status} onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)} className="admin-form-group !w-auto !inline-block !mb-0">
                            {Constants.ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                    <Button type="button" variant="outline" onClick={onClose}>Đóng</Button>
                    <Button type="button" variant="primary" onClick={handlePrint} leftIcon={<i className="fas fa-print"></i>}>In Đơn hàng</Button>
                </div>
            </div>
        </div>
    );
};

// --- Order Form Modal (New) ---
const OrderFormModal: React.FC<{ onClose: () => void; onSave: () => void; }> = ({ onClose, onSave }) => {
    const { users, addUser } = useAuth();
    const [formData, setFormData] = useState<Partial<Order>>({
        customerInfo: { fullName: '', phone: '', email: '', address: '' },
        items: [], totalAmount: 0, orderDate: new Date().toISOString(),
        status: 'Chờ xử lý',
        paymentInfo: { method: 'Thanh toán khi nhận hàng (COD)', status: 'Chưa thanh toán' }
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
                // Use encodeURIComponent to handle special characters in search
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
        setSearchedProducts([]); // Clear results after selection
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
        if (!formData.customerInfo?.fullName || !formData.customerInfo.email || !formData.customerInfo.phone) {
            alert("Vui lòng điền đủ thông tin khách hàng.");
            return;
        }
        if (!formData.items || formData.items.length === 0) {
            alert("Vui lòng thêm ít nhất một sản phẩm vào đơn hàng.");
            return;
        }

        const isNewCustomer = !customerOptions.some(c => c.email === formData.customerInfo?.email);
        if (isNewCustomer && formData.customerInfo?.email) {
            try {
                 await addUser({
                    username: formData.customerInfo.fullName,
                    email: formData.customerInfo.email,
                    phone: formData.customerInfo.phone,
                    address: formData.customerInfo.address,
                    role: 'customer'
                });
            } catch (err) {
                console.error("Lỗi khi tạo khách hàng mới:", err);
                alert("Email khách hàng này có thể đã tồn tại. Vui lòng kiểm tra lại.");
                return;
            }
        }
        
        try {
            const finalOrder = { ...formData, id: `order-${Date.now()}` } as Order;
            await addOrder(finalOrder);
            onSave();
        } catch (err) {
            console.error("Lỗi khi lưu đơn hàng:", err);
            alert("Đã xảy ra lỗi khi lưu đơn hàng.");
        }
    };

    return (
        <div className="admin-modal-overlay">
            <form onSubmit={handleSubmit} className="admin-modal-panel max-w-4xl">
                <div className="admin-modal-header"><h4 className="admin-modal-title">Tạo Đơn Hàng Mới</h4><button type="button" onClick={onClose}>&times;</button></div>
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
                        <div className="text-right font-bold text-lg mt-4">Tổng cộng: {formData.totalAmount?.toLocaleString('vi-VN')}₫</div>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                    <Button type="submit">Lưu Đơn hàng</Button>
                </div>
            </form>
        </div>
    );
};


export default OrderManagementView;
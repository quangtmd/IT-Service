import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomerOrders } from '../../services/localDataService';
import { User, Order, OrderStatus, OrderItem } from '../../types';
import Button from '../../components/ui/Button';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Chờ xử lý': return 'bg-yellow-100 text-yellow-800';
        case 'Đang chuẩn bị': return 'bg-blue-100 text-blue-800';
        case 'Đang giao': return 'bg-indigo-100 text-indigo-800';
        case 'Hoàn thành': return 'bg-green-100 text-green-800';
        case 'Đã hủy': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// FIX: Add className prop to InfoItem component
const InfoItem: React.FC<{ label: string; value?: string | number | null; className?: string }> = ({ label, value, className }) => (
    <div className={className}>
        <p className="text-xs text-textMuted">{label}</p>
        <p className="text-sm font-medium text-textBase">{value || 'N/A'}</p>
    </div>
);

const OrderRow: React.FC<{ order: Order }> = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <tr className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <td><i className={`fas fa-chevron-right text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}></i></td>
                <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{order.id.slice(-6)}</span></td>
                <td>{new Date(order.orderDate).toLocaleString('vi-VN')}</td>
                <td>{order.creatorName}</td>
                <td><span className={`status-badge ${getStatusColor(order.status)}`}>{order.status}</span></td>
                <td className="font-semibold text-right">{order.totalAmount.toLocaleString('vi-VN')}₫</td>
                <td className="text-right text-red-600">{(order.totalAmount - (order.paidAmount || 0)).toLocaleString('vi-VN')}₫</td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-50">
                    <td colSpan={7} className="p-0">
                        <div className="p-3 bg-green-50/50">
                             <div className="bg-white p-2 rounded border">
                                <p className="text-xs font-semibold text-green-700 mb-2">Chi tiết đơn hàng: {totalItems} sản phẩm, Tổng tiền: {order.totalAmount.toLocaleString('vi-VN')}₫</p>
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-1 text-left">STT</th>
                                            <th className="p-1 text-left">Mã sản phẩm</th>
                                            <th className="p-1 text-left">Tên sản phẩm</th>
                                            <th className="p-1 text-right">SL</th>
                                            <th className="p-1 text-right">Giá bán</th>
                                            <th className="p-1 text-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item, index) => (
                                            <tr key={item.productId} className="border-t">
                                                <td className="p-1">{index + 1}</td>
                                                <td className="p-1">{item.productId}</td>
                                                <td className="p-1">{item.productName}</td>
                                                <td className="p-1 text-right">{item.quantity}</td>
                                                <td className="p-1 text-right">{item.price.toLocaleString('vi-VN')}₫</td>
                                                <td className="p-1 text-right font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};


const CustomerProfilePage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const { users } = useAuth();
    const [customer, setCustomer] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!customerId) {
                setError("Không tìm thấy ID khách hàng.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const foundCustomer = users.find(u => u.id === customerId);
                if (!foundCustomer || foundCustomer.role !== 'customer') {
                    throw new Error("Không tìm thấy thông tin khách hàng hoặc người dùng không phải là khách hàng.");
                }
                setCustomer(foundCustomer);

                const customerOrders = await getCustomerOrders(customerId);
                setOrders(customerOrders);

            } catch (err) {
                setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu.");
            } finally {
                setIsLoading(false);
            }
        };
        
        if(users.length > 0) {
            loadData();
        }
    }, [customerId, users]);

    if (isLoading) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-textMuted">Đang tải hồ sơ khách hàng...</p>
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
                    <Link to="/admin/partners"><Button className="mt-4">Quay lại</Button></Link>
                </div>
            </div>
        );
    }

    if (!customer) return null;
    
    const totalSpent = orders.filter(o => o.status === 'Hoàn thành').reduce((sum, o) => sum + o.totalAmount, 0);
    const totalDebt = orders.reduce((sum, o) => sum + (o.totalAmount - (o.paidAmount || 0)), 0);


    return (
        <div className="space-y-6">
            <div className="admin-card">
                <div className="admin-card-header flex justify-between">
                     <h3 className="admin-card-title">Thông tin khách hàng</h3>
                     <Link to={`/admin/partners/customers/edit/${customer.id}`}><Button variant="primary" size="sm" leftIcon={<i className="fas fa-edit"/>}>Sửa</Button></Link>
                </div>
                <div className="admin-card-body">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <InfoItem label="Tên khách hàng" value={customer.username} />
                        <InfoItem label="Mã khách hàng" value={customer.id} />
                        <InfoItem label="Điện thoại" value={customer.phone} />
                        <InfoItem label="Email" value={customer.email} />
                        <InfoItem label="Địa chỉ" value={customer.address} className="md:col-span-2"/>
                        <InfoItem label="Ngày sinh" value={customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'} />
                        <InfoItem label="Ghi chú" value={"(chưa có)"} />
                    </div>
                </div>
            </div>
            
            <div className="admin-card">
                 <div className="admin-card-header"><h4 className="admin-card-title">Lịch sử Mua hàng ({orders.length})</h4></div>
                 <div className="admin-card-body !p-0">
                     <div className="overflow-x-auto">
                        <table className="admin-table text-sm">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Mã đơn hàng</th>
                                    <th>Ngày bán</th>
                                    <th>Thu ngân</th>
                                    <th>Trạng thái</th>
                                    <th className="text-right">Tổng tiền</th>
                                    <th className="text-right">Nợ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map(order => <OrderRow key={order.id} order={order} />)
                                ) : (
                                    <tr><td colSpan={7} className="text-center py-6 text-textMuted">Khách hàng chưa có đơn hàng nào.</td></tr>
                                )}
                            </tbody>
                             <tfoot>
                                <tr className="bg-gray-100 font-bold">
                                    <td colSpan={5} className="text-right p-2">Tổng cộng</td>
                                    <td className="text-right p-2">{totalSpent.toLocaleString('vi-VN')}₫</td>
                                    <td className="text-right p-2 text-red-600">{totalDebt.toLocaleString('vi-VN')}₫</td>
                                </tr>
                            </tfoot>
                        </table>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default CustomerProfilePage;
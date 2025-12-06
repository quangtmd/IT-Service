import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomerOrders } from '../../services/localDataService';
import { User, Order, OrderStatus } from '../../types';
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

const InfoItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-textMuted">{label}</p>
        <p className="text-sm font-medium text-textBase">{value || 'N/A'}</p>
    </div>
);

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
        
        // Wait for users to be loaded before fetching
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
                    <Link to="/admin/customers"><Button className="mt-4">Quay lại</Button></Link>
                </div>
            </div>
        );
    }

    if (!customer) return null;
    
    const totalSpent = orders.filter(o => o.status === 'Hoàn thành').reduce((sum, o) => sum + o.totalAmount, 0);

    return (
        <div className="space-y-6">
            <div className="admin-card">
                <div className="admin-card-body">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <img src={customer.imageUrl || `https://ui-avatars.com/api/?name=${customer.username.charAt(0)}&background=random`} alt={customer.username} className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover" />
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-textBase">{customer.username}</h3>
                                    <p className="text-sm text-textMuted">{customer.email}</p>
                                </div>
                                <Link to={`/admin/customers/edit/${customer.id}`}><Button variant="outline" size="sm">Chỉnh sửa</Button></Link>
                            </div>
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
                                <InfoItem label="Tổng chi tiêu" value={`${totalSpent.toLocaleString('vi-VN')}₫`} />
                                <InfoItem label="Tổng đơn hàng" value={orders.length} />
                                <InfoItem label="Điểm tích lũy" value={customer.loyaltyPoints} />
                                <InfoItem label="Công nợ" value={customer.debtStatus} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-1 space-y-6">
                    <div className="admin-card">
                        <div className="admin-card-header"><h4 className="admin-card-title">Thông tin liên hệ</h4></div>
                        <div className="admin-card-body space-y-3">
                            <InfoItem label="Số điện thoại" value={customer.phone} />
                            <InfoItem label="Địa chỉ" value={customer.address} />
                            <InfoItem label="Ngày sinh" value={customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'} />
                        </div>
                    </div>
                     <div className="admin-card">
                        <div className="admin-card-header"><h4 className="admin-card-title">Thông tin CRM</h4></div>
                        <div className="admin-card-body space-y-3">
                            <InfoItem label="Nguồn gốc" value={customer.origin} />
                            <InfoItem label="Nhân viên phụ trách" value={users.find(u => u.id === customer.assignedStaffId)?.username} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 admin-card">
                     <div className="admin-card-header"><h4 className="admin-card-title">Lịch sử Mua hàng ({orders.length})</h4></div>
                     <div className="admin-card-body">
                         <div className="overflow-x-auto">
                            <table className="admin-table">
                                <thead>
                                    <tr><th>Mã ĐH</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th></tr>
                                </thead>
                                <tbody>
                                    {orders.length > 0 ? (
                                        orders.map(order => (
                                        <tr key={order.id}>
                                            <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{order.id.slice(-6)}</span></td>
                                            <td>{new Date(order.orderDate).toLocaleString('vi-VN')}</td>
                                            <td className="font-semibold">{order.totalAmount.toLocaleString('vi-VN')}₫</td>
                                            <td><span className={`status-badge ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                        </tr>
                                    ))) : (
                                        <tr><td colSpan={4} className="text-center py-6 text-textMuted">Khách hàng chưa có đơn hàng nào.</td></tr>
                                    )}
                                </tbody>
                            </table>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfilePage;
import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, DebtStatus } from '../../types';
import Button from '../ui/Button';
import * as ReactRouterDOM from 'react-router-dom';

const getDebtStatusColor = (status: DebtStatus | undefined) => {
    switch (status) {
        case 'Có nợ': return 'bg-orange-100 text-orange-800';
        case 'Quá hạn': return 'bg-red-100 text-red-800';
        case 'Không có':
        default: return 'bg-green-100 text-green-800';
    }
};

const CustomerManagementView: React.FC = () => {
    const { users, updateUser, deleteUser, hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
    const navigate = ReactRouterDOM.useNavigate();

    const customerUsers = useMemo(() => {
        const staffMap = new Map(users.filter(u => u.role === 'staff' || u.role === 'admin').map(s => [s.id, s.username]));
        return users.filter(u => u.role === 'customer')
            .filter(u =>
                u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.phone && u.phone.includes(searchTerm))
            )
            .map(customer => ({
                ...customer,
                assignedStaffName: customer.assignedStaffId ? staffMap.get(customer.assignedStaffId) : 'Chưa phân công'
            }));
    }, [users, searchTerm]);
    
    const handleAddNewCustomer = () => {
        navigate('/admin/customers/new');
    };

    const handleEditCustomer = (userId: string) => {
        navigate(`/admin/customers/edit/${userId}`);
    };

    const handleDelete = (userId: string) => {
        if (!hasPermission(['manageCustomers'])) {
            alert('Bạn không có quyền để xóa khách hàng.');
            return;
        }
        if (window.confirm('Bạn có chắc muốn xóa khách hàng này không? Hành động này không thể hoàn tác.')) {
            deleteUser(userId);
        }
    };

    const handleViewCustomerDetails = useCallback((customer: User) => {
        setSelectedCustomer(customer);
    }, []);

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Khách hàng ({customerUsers.length})</h3>
                {hasPermission(['manageCustomers']) && (
                    <Button onClick={handleAddNewCustomer} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                        Thêm Khách hàng
                    </Button>
                )}
            </div>
            <div className="admin-card-body">
                <input
                    type="text"
                    placeholder="Tìm kiếm khách hàng theo tên, email, SĐT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-form-group w-full max-w-md mb-4"
                />
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã KH</th>
                                <th>Tên Khách hàng</th>
                                <th>SĐT / Email</th>
                                <th>Ngày sinh</th>
                                <th>Nguồn gốc</th>
                                <th>Điểm TL</th>
                                <th>Trạng thái nợ</th>
                                <th>NV Phụ trách</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerUsers.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-4 text-textMuted">Không có khách hàng nào phù hợp.</td></tr>
                            ) : (
                                customerUsers.map(user => (
                                    <tr key={user.id}>
                                        <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{user.id.slice(-6)}</span></td>
                                        <td>
                                            <div className="flex items-center">
                                                <img src={user.imageUrl || `https://ui-avatars.com/api/?name=${user.username.charAt(0)}&background=random`} alt={user.username} className="w-10 h-10 rounded-full mr-3 object-cover" />
                                                <p className="font-semibold text-textBase">{user.username}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="text-sm">{user.phone}</p>
                                            <p className="text-xs text-textMuted">{user.email}</p>
                                        </td>
                                        <td>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                        <td>{user.origin || 'N/A'}</td>
                                        <td className="text-center">{user.loyaltyPoints || 0}</td>
                                        <td><span className={`status-badge ${getDebtStatusColor(user.debtStatus)}`}>{user.debtStatus || 'Không có'}</span></td>
                                        <td>{user.assignedStaffName || 'N/A'}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                {hasPermission(['manageCustomers']) && (
                                                    <Button onClick={() => handleEditCustomer(user.id)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                                )}
                                                <Button onClick={() => handleViewCustomerDetails(user)} size="sm" variant="outline">
                                                    <i className="fas fa-eye"></i>
                                                </Button>
                                                {hasPermission(['manageCustomers']) && (
                                                    <Button onClick={() => handleDelete(user.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"><i className="fas fa-trash"></i></Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedCustomer && (
                <CustomerDetailModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    hasManagePermission={hasPermission(['manageCustomers'])}
                    onEdit={() => { setSelectedCustomer(null); handleEditCustomer(selectedCustomer.id); }}
                />
            )}
        </div>
    );
};

export default CustomerManagementView;

// --- Customer Detail Modal ---
interface CustomerDetailModalProps {
    customer: User;
    onClose: () => void;
    hasManagePermission: boolean;
    onEdit: () => void;
}
const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, onClose, hasManagePermission, onEdit }) => {
    // In a real app, you'd fetch orders/history for this customer
    const mockOrdersHistory = [
        { id: 'ORD001', date: '2024-07-20', total: 5000000, status: 'Hoàn thành' },
        { id: 'ORD002', date: '2024-06-15', total: 10000000, status: 'Hoàn thành' },
        { id: 'ORD003', date: '2024-05-01', total: 2500000, status: 'Đã hủy' },
    ];
    const { users } = useAuth();
    const staffMap = useMemo(() => new Map(users.filter(u => u.role === 'staff' || u.role === 'admin').map(s => [s.id, s.username])), [users]);
    const assignedStaffName = customer.assignedStaffId ? staffMap.get(customer.assignedStaffId) : 'Chưa phân công';

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-panel max-w-2xl">
                <div className="admin-modal-header">
                    <h4 className="admin-modal-title">Hồ sơ Khách hàng: {customer.username}</h4>
                    <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <div className="admin-modal-body grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div>
                        <h5 className="admin-form-subsection-title">Thông tin chung</h5>
                        <div className="flex items-center mb-3">
                            <img src={customer.imageUrl || `https://ui-avatars.com/api/?name=${customer.username.charAt(0)}&background=random`} alt={customer.username} className="w-16 h-16 rounded-full mr-4 object-cover" />
                            <div>
                                <p className="font-semibold text-textBase text-lg">{customer.username}</p>
                                <p className="text-sm text-textMuted">{customer.email}</p>
                            </div>
                        </div>
                        <p><strong>Mã KH:</strong> <span className="font-mono text-xs bg-gray-100 p-1 rounded">#{customer.id.slice(-6)}</span></p>
                        <p><strong>SĐT:</strong> {customer.phone || 'N/A'}</p>
                        <p><strong>Địa chỉ:</strong> {customer.address || 'N/A'}</p>
                        <p><strong>Ngày sinh:</strong> {customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}</p>
                        <p><strong>Nguồn gốc:</strong> {customer.origin || 'N/A'}</p>
                    </div>
                    {/* Loyalty & Debt */}
                    <div>
                        <h5 className="admin-form-subsection-title">Tài chính & CRM</h5>
                        <p><strong>Điểm tích lũy:</strong> <span className="font-bold text-primary">{customer.loyaltyPoints || 0}</span></p>
                        <p><strong>Trạng thái nợ:</strong> <span className={`status-badge ${getDebtStatusColor(customer.debtStatus)}`}>{customer.debtStatus || 'Không có'}</span></p>
                        <p><strong>Tổng chi tiêu:</strong> <span className="font-bold text-green-600">{(customer.totalSpent || 0).toLocaleString('vi-VN')}₫</span></p>
                        <p><strong>Đơn hàng cuối:</strong> {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                        <p><strong>NV Phụ trách:</strong> {assignedStaffName}</p>
                    </div>
                    {/* Order History (Mock) */}
                    <div className="md:col-span-2">
                        <h5 className="admin-form-subsection-title">Lịch sử mua hàng (Gần đây)</h5>
                        <ul className="space-y-2">
                            {mockOrdersHistory.length > 0 ? (
                                mockOrdersHistory.map(order => (
                                    <li key={order.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                        <span>#{order.id.slice(-6)} - {new Date(order.date).toLocaleDateString('vi-VN')}</span>
                                        <span className="font-semibold">{order.total.toLocaleString('vi-VN')}₫</span>
                                        <span className={`status-badge ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{order.status}</span>
                                    </li>
                                ))
                            ) : (
                                <p className="text-sm text-textMuted">Chưa có đơn hàng nào.</p>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    {hasManagePermission && (
                        <Button type="button" variant="outline" onClick={onEdit} leftIcon={<i className="fas fa-edit"></i>}>Sửa thông tin</Button>
                    )}
                    <Button type="button" variant="primary" onClick={onClose}>Đóng</Button>
                </div>
            </div>
        </div>
    );
};
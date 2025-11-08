import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import Button from '../ui/Button';
import * as ReactRouterDOM from 'react-router-dom';

const CustomerManagementView: React.FC = () => {
    const { users, updateUser, isLoading: isAuthLoading } = useAuth(); // Use isLoading from useAuth
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = ReactRouterDOM.useNavigate();

    const customerUsers = useMemo(() =>
        users.filter(u => u.role === 'customer')
            .filter(u =>
                u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [users, searchTerm]
    );
    
    const handleToggleLock = (user: User) => {
        const action = user.isLocked ? 'mở khóa' : 'khóa';
        if (window.confirm(`Bạn có chắc muốn ${action} tài khoản của ${user.username}?`)) {
            updateUser(user.id, { isLocked: !user.isLocked });
        }
    };

    const handleAddNewCustomer = () => {
        navigate('/admin/customers/new');
    };
    
    const handleEditCustomer = (customerId: string) => {
        navigate(`/admin/customers/edit/${customerId}`);
    };

    const handleViewCustomer = (customerId: string) => {
        navigate(`/admin/customers/view/${customerId}`);
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Khách hàng ({isAuthLoading ? '...' : customerUsers.length})</h3>
                <Button onClick={handleAddNewCustomer} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Thêm Khách hàng
                </Button>
            </div>
            <div className="admin-card-body">
                <input
                    type="text"
                    placeholder="Tìm kiếm khách hàng theo tên, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-form-group w-full max-w-md mb-4"
                />
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Khách hàng</th>
                                <th>Email</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isAuthLoading ? (
                                <tr><td colSpan={4} className="text-center py-6 text-textMuted">Đang tải danh sách khách hàng...</td></tr>
                            ) : customerUsers.length > 0 ? (
                                customerUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center">
                                                <img src={user.imageUrl || `https://ui-avatars.com/api/?name=${user.username.charAt(0)}&background=random`} alt={user.username} className="w-10 h-10 rounded-full mr-3 object-cover" />
                                                <p className="font-semibold text-textBase">{user.username}</p>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`status-badge ${user.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {user.isLocked ? 'Đã khóa' : 'Hoạt động'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleViewCustomer(user.id)} title="Xem hồ sơ">
                                                    <i className="fas fa-eye"></i>
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleEditCustomer(user.id)} title="Chỉnh sửa">
                                                    <i className="fas fa-edit"></i>
                                                </Button>
                                                <Button
                                                    onClick={() => handleToggleLock(user)}
                                                    size="sm"
                                                    variant="outline"
                                                    className={user.isLocked ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}
                                                    title={user.isLocked ? 'Mở khóa' : 'Khóa'}
                                                >
                                                    <i className={`fas ${user.isLocked ? 'fa-unlock' : 'fa-lock'}`}></i>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center py-6 text-textMuted">Không có khách hàng nào phù hợp.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerManagementView;
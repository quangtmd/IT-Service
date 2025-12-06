import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import Button from '../ui/Button';
import * as ReactRouterDOM from 'react-router-dom';

const HRMProfileView: React.FC = () => {
    const { users, deleteUser, currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = ReactRouterDOM.useNavigate();

    const staffUsers = useMemo(() =>
        users.filter(u => u.role === 'staff' || u.role === 'admin')
        .filter(u =>
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.position && u.position.toLowerCase().includes(searchTerm.toLowerCase()))
        ),
    [users, searchTerm]);

    const handleAddNewUser = () => {
        navigate('/admin/hrm_dashboard/new');
    };

    const handleEditUser = (userId: string) => {
        navigate(`/admin/hrm_dashboard/edit/${userId}`);
    };

    const handleDelete = (userId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này không? Hành động này không thể hoàn tác.')) {
            deleteUser(userId);
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Hồ sơ Nhân sự</h3>
                <Button onClick={handleAddNewUser} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Thêm Nhân viên
                </Button>
            </div>
            <div className="admin-card-body">
                <input
                    type="text"
                    placeholder="Tìm kiếm nhân viên theo tên, email, chức vụ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-form-group w-full max-w-md mb-4"
                />
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Nhân viên</th>
                                <th>Chức vụ</th>
                                <th>Vai trò hệ thống</th>
                                <th>Trạng thái</th>
                                <th>Ngày vào làm</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="flex items-center">
                                            <img src={user.imageUrl || `https://ui-avatars.com/api/?name=${user.username.charAt(0)}&background=random`} alt={user.username} className="w-10 h-10 rounded-full mr-3 object-cover" />
                                            <div>
                                                <p className="font-semibold text-textBase">{user.username}</p>
                                                <p className="text-xs text-textMuted">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.position || 'N/A'}</td>
                                    <td>{user.staffRole || 'N/A'}</td>
                                    <td><span className={`status-badge ${user.status === 'Đang hoạt động' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{user.status}</span></td>
                                    <td>{user.joinDate ? new Date(user.joinDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleEditUser(user.id)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                            <Button onClick={() => handleDelete(user.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" disabled={user.id === currentUser?.id}><i className="fas fa-trash"></i></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HRMProfileView;
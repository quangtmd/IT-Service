import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, StaffRole, STAFF_ROLE_OPTIONS, UserStatus, USER_STATUS_OPTIONS } from '../../types';
import Button from '../ui/Button';
import ImageUploadInput from '../ui/ImageUploadInput';

const HRMProfileView: React.FC = () => {
    const { users, addUser, updateUser, deleteUser, currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const staffUsers = useMemo(() => 
        users.filter(u => u.role === 'staff' || u.role === 'admin')
        .filter(u => 
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.position && u.position.toLowerCase().includes(searchTerm.toLowerCase()))
        ), 
    [users, searchTerm]);

    const openModalForNew = () => {
        setEditingUser({
            id: '',
            username: '',
            email: '',
            role: 'staff',
            staffRole: 'Chuyên viên Hỗ trợ',
            status: 'Đang hoạt động',
            joinDate: new Date().toISOString().split('T')[0], // Default to today
            position: '',
            phone: '',
            address: '',
            imageUrl: '',
        });
        setIsModalOpen(true);
    };

    const openModalForEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
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
                <Button onClick={openModalForNew} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
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
                                            <Button onClick={() => openModalForEdit(user)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                            <Button onClick={() => handleDelete(user.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" disabled={user.id === currentUser?.id}><i className="fas fa-trash"></i></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <HRMFormModal
                    user={editingUser}
                    onClose={closeModal}
                    onSave={editingUser?.id ? updateUser : addUser}
                />
            )}
        </div>
    );
};


interface HRMFormModalProps {
    user: User | null;
    onClose: () => void;
    onSave: (idOrDto: any, updates?: any) => Promise<any>;
}

const HRMFormModal: React.FC<HRMFormModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState<User>(user || {} as User);
    const { currentUser } = useAuth();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = { ...formData, role: 'staff' };
        if (formData.id) {
            const { id, ...updates } = dataToSave;
            await onSave(id, updates);
        } else {
            const { id, ...dto } = dataToSave;
            await onSave(dto);
        }
        onClose();
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-panel">
                <form onSubmit={handleSubmit} className="contents">
                    <div className="admin-modal-header">
                        <h4 className="admin-modal-title">{formData.id ? 'Chỉnh sửa Hồ sơ Nhân sự' : 'Thêm Nhân viên mới'}</h4>
                        <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                    </div>
                    <div className="admin-modal-body">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <ImageUploadInput 
                                    label="Ảnh đại diện"
                                    value={formData.imageUrl || ''}
                                    onChange={value => setFormData(p => ({...p, imageUrl: value}))}
                                    showPreview={true}
                                />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="admin-form-group">
                                    <label htmlFor="username">Tên nhân viên *</label>
                                    <input type="text" name="username" id="username" value={formData.username || ''} onChange={handleChange} required />
                                </div>
                                <div className="admin-form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} required disabled={!!formData.id} />
                                </div>
                                 <div className="admin-form-group">
                                    <label htmlFor="position">Chức vụ</label>
                                    <input type="text" name="position" id="position" value={formData.position || ''} onChange={handleChange} />
                                </div>
                                 <div className="admin-form-group">
                                    <label htmlFor="phone">Số điện thoại</label>
                                    <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange} />
                                </div>
                                <div className="admin-form-group sm:col-span-2">
                                    <label htmlFor="address">Địa chỉ</label>
                                    <input type="text" name="address" id="address" value={formData.address || ''} onChange={handleChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label htmlFor="joinDate">Ngày vào làm</label>
                                    <input type="date" name="joinDate" id="joinDate" value={formData.joinDate ? formData.joinDate.split('T')[0] : ''} onChange={handleChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label htmlFor="status">Trạng thái</label>
                                    <select name="status" id="status" value={formData.status || 'Đang hoạt động'} onChange={handleChange}>
                                        {USER_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                 <div className="admin-form-group sm:col-span-2">
                                    <label htmlFor="staffRole">Vai trò hệ thống</label>
                                    <select name="staffRole" id="staffRole" value={formData.staffRole || 'Chuyên viên Hỗ trợ'} onChange={handleChange} disabled={formData.email === currentUser?.email}>
                                        {STAFF_ROLE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="admin-modal-footer">
                        <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                        <Button type="submit" variant="primary">Lưu thay đổi</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HRMProfileView;
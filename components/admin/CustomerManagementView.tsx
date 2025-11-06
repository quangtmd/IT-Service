import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, StaffRole, STAFF_ROLE_OPTIONS, UserStatus, USER_STATUS_OPTIONS } from '../../types';
import Button from '../ui/Button';
import ImageUploadInput from '../ui/ImageUploadInput';
import { getUsers, addUser, updateUser, deleteUser } from '../../services/localDataService';

const CustomerManagementView: React.FC = () => {
    const { addAdminNotification } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            setIsLoading(true);
            try {
                const fetchedUsers = await getUsers();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Failed to load users", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadUsers();
    }, []);

    const customerUsers = useMemo(() =>
        users.filter(u => u.role === 'customer')
            .filter(u =>
                u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.phone && u.phone.includes(searchTerm))
            ),
        [users, searchTerm]
    );
    
    const handleToggleLock = async (user: User) => {
        const action = user.isLocked ? 'mở khóa' : 'khóa';
        if (window.confirm(`Bạn có chắc muốn ${action} tài khoản của ${user.username}?`)) {
            const success = await updateUser(user.id, { isLocked: !user.isLocked });
            if (success) {
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isLocked: !user.isLocked } : u));
            }
        }
    };
    
    const openModalForNew = () => {
        setEditingUser({
            id: '', username: '', email: '', role: 'customer',
            status: 'Đang hoạt động',
            customerGroup: 'Mới',
            debtStatus: 'Không có nợ'
        });
        setIsModalOpen(true);
    };

    const openModalForEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };
    
    const handleSave = async (userData: User) => {
        if (userData.id) { // Update
            const { id, ...updates } = userData;
            const success = await updateUser(id, updates);
            if(success) setUsers(prev => prev.map(u => u.id === id ? userData : u));
        } else { // Create
            const { id, ...dto } = userData;
            const newUser = await addUser(dto);
            if(newUser) setUsers(prev => [...prev, newUser]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = async (userId: string) => {
        if(window.confirm('Bạn có chắc muốn xóa khách hàng này?')) {
            const success = await deleteUser(userId);
            if (success) setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };


    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Khách hàng ({customerUsers.length})</h3>
                <Button onClick={openModalForNew} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Khách hàng</Button>
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
                                <th>Khách hàng</th>
                                <th>Thông tin liên hệ</th>
                                <th>Nhóm</th>
                                <th>Điểm</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                            ) : (
                                customerUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center">
                                                <img src={user.imageUrl || `https://ui-avatars.com/api/?name=${user.username.charAt(0)}&background=random`} alt={user.username} className="w-10 h-10 rounded-full mr-3 object-cover" />
                                                <p className="font-semibold text-textBase">{user.username}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <p>{user.email}</p>
                                            <p className="text-xs text-textMuted">{user.phone}</p>
                                        </td>
                                        <td>{user.customerGroup || 'Thường'}</td>
                                        <td>{user.loyaltyPoints || 0}</td>
                                        <td>
                                            <span className={`status-badge ${user.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {user.isLocked ? 'Đã khóa' : 'Hoạt động'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Button onClick={() => openModalForEdit(user)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                                <Button onClick={() => handleToggleLock(user)} size="sm" variant="outline" className={user.isLocked ? 'text-green-600' : 'text-yellow-600'}><i className={`fas ${user.isLocked ? 'fa-unlock' : 'fa-lock'}`}></i></Button>
                                                <Button onClick={() => handleDelete(user.id)} size="sm" variant="ghost" className="text-red-500"><i className="fas fa-trash"></i></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                 {customerUsers.length === 0 && !isLoading && (
                    <p className="text-center text-textMuted py-4">Không có khách hàng nào phù hợp.</p>
                )}
            </div>
            {isModalOpen && <CustomerFormModal user={editingUser} onClose={() => setIsModalOpen(false)} onSave={handleSave}/>}
        </div>
    );
};

// --- Form Modal ---
interface CustomerFormModalProps {
    user: User | null;
    onClose: () => void;
    onSave: (data: User) => Promise<void>;
}
const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState<User>(user || {} as User);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({...formData, role: 'customer' });
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-panel">
                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-header">
                        <h4 className="admin-modal-title">{formData.id ? 'Chỉnh sửa Khách hàng' : 'Thêm Khách hàng'}</h4>
                        <button type="button" onClick={onClose}>&times;</button>
                    </div>
                    <div className="admin-modal-body grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="admin-form-group"><label>Tên khách hàng *</label><input type="text" name="username" value={formData.username || ''} onChange={handleChange} required /></div>
                        <div className="admin-form-group"><label>Email *</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} required disabled={!!formData.id} /></div>
                        <div className="admin-form-group"><label>Số điện thoại</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} /></div>
                        <div className="admin-form-group"><label>Địa chỉ</label><input type="text" name="address" value={formData.address || ''} onChange={handleChange} /></div>
                        
                        <div className="md:col-span-2 admin-form-subsection-title">Thông tin CRM</div>
                        <div className="admin-form-group"><label>Giới tính</label>
                            <select name="gender" value={formData.gender || ''} onChange={handleChange}><option value="">-- Chọn --</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option></select>
                        </div>
                        <div className="admin-form-group"><label>Ngày sinh</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth?.split('T')[0] || ''} onChange={handleChange} /></div>
                        <div className="admin-form-group"><label>Nguồn gốc</label><input type="text" name="leadSource" value={formData.leadSource || ''} onChange={handleChange} placeholder="VD: Facebook, Website..." /></div>
                        <div className="admin-form-group"><label>Nhóm khách hàng</label>
                             <select name="customerGroup" value={formData.customerGroup || 'Thường'} onChange={handleChange}>
                                <option value="Thường">Thường</option><option value="Mới">Mới</option><option value="VIP">VIP</option><option value="Sỉ">Sỉ</option>
                             </select>
                        </div>
                        <div className="admin-form-group"><label>Điểm tích lũy</label><input type="number" name="loyaltyPoints" value={formData.loyaltyPoints || 0} onChange={handleChange} /></div>
                        <div className="admin-form-group"><label>Công nợ</label><input type="text" name="debtStatus" value={formData.debtStatus || ''} onChange={handleChange} /></div>
                    </div>
                    <div className="admin-modal-footer">
                        <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                        <Button type="submit">Lưu</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default CustomerManagementView;
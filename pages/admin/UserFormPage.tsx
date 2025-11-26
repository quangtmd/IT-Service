import React, { useState, useEffect } from 'react';
import { User, StaffRole, USER_STATUS_OPTIONS, STAFF_ROLE_OPTIONS } from '../../types';
import Button from '../../components/ui/Button';
import ImageUploadInput from '../../components/ui/ImageUploadInput';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const UserFormPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { users, addUser, updateUser, currentUser } = useAuth();
    const isEditing = !!userId;

    const [formData, setFormData] = useState<Partial<User> | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditing) {
            setIsLoading(true);
            setError(null);
            const userToEdit = users.find(u => u.id === userId);
            if (userToEdit) {
                setFormData(userToEdit);
            } else {
                setError('Không tìm thấy người dùng để chỉnh sửa.');
            }
            setIsLoading(false);
        } else {
            setFormData({
                id: '',
                username: '',
                email: '',
                role: 'staff',
                staffRole: 'Chuyên viên Hỗ trợ',
                status: 'Đang hoạt động',
                joinDate: new Date().toISOString().split('T')[0],
                position: '',
                phone: '',
                address: '',
                imageUrl: '',
                salary: 0,
            });
            setIsLoading(false);
        }
    }, [isEditing, userId, users]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => prev ? ({ ...prev, [name]: isNumber ? Number(value) : value }) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        setError(null);

        // Password validation
        if (!isEditing) { // When creating a new user, password is required
            if (password.length < 6) {
                setError('Mật khẩu phải có ít nhất 6 ký tự.');
                return;
            }
            if (password !== confirmPassword) {
                setError('Mật khẩu và xác nhận mật khẩu không khớp.');
                return;
            }
        } else { // When editing, password is optional
            if (password && password.length < 6) {
                setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
                return;
            }
            if (password && password !== confirmPassword) {
                setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
                return;
            }
        }

        try {
            if (isEditing) {
                const { id, ...updates } = formData;
                if (password) {
                    (updates as Partial<User>).password = password;
                }
                await updateUser(id as string, updates);
                alert('Cập nhật hồ sơ nhân sự thành công!');
            } else {
                const { id, ...dto } = formData;
                await addUser({ ...dto, password } as Omit<User, 'id'>);
                alert('Thêm nhân viên mới thành công!');
            }
            navigate('/admin/hrm_dashboard');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu hồ sơ nhân sự.');
        }
    };

    if (isLoading) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-textMuted">Đang tải dữ liệu người dùng...</p>
                </div>
            </div>
        );
    }

    if (error && !formData) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8 text-danger-text">
                    <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
                    <p>{error}</p>
                    <Button onClick={() => navigate('/admin/hrm_dashboard')} className="mt-4">Quay lại</Button>
                </div>
            </div>
        );
    }

    if (!formData) return null;

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">{isEditing ? `Chỉnh sửa Hồ sơ Nhân sự: ${formData.username}` : 'Thêm Nhân viên mới'}</h3>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/hrm_dashboard')}>Hủy</Button>
                </div>
                <div className="admin-card-body admin-product-form-page-body"> {/* Using similar class for scrolling */}
                    {error && <div className="p-3 bg-danger-bg border border-danger-border text-danger-text rounded-md text-sm mb-4">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <ImageUploadInput
                                label="Ảnh đại diện"
                                value={formData.imageUrl || ''}
                                onChange={value => setFormData(p => p ? ({ ...p, imageUrl: value }) : null)}
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
                                <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} required disabled={isEditing} />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="password">{isEditing ? 'Mật khẩu mới' : 'Mật khẩu *'}</label>
                                <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!isEditing} autoComplete="new-password" />
                                {isEditing && <p className="form-input-description">Để trống nếu không muốn thay đổi.</p>}
                            </div>
                            <div className="admin-form-group">
                                <label htmlFor="confirmPassword">{isEditing ? 'Xác nhận mật khẩu mới' : 'Xác nhận mật khẩu *'}</label>
                                <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required={!isEditing || !!password} autoComplete="new-password" />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="position">Chức vụ</label>
                                <input type="text" name="position" id="position" value={formData.position || ''} onChange={handleChange} />
                            </div>
                             <div className="admin-form-group">
                                <label htmlFor="salary">Lương cơ bản</label>
                                <input type="number" name="salary" id="salary" value={formData.salary || 0} onChange={handleChange} />
                            </div>
                            <div className="admin-form-group">
                                <label htmlFor="phone">Số điện thoại</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange} />
                            </div>
                            <div className="admin-form-group">
                                <label htmlFor="joinDate">Ngày vào làm</label>
                                <input type="date" name="joinDate" id="joinDate" value={formData.joinDate ? formData.joinDate.split('T')[0] : ''} onChange={handleChange} />
                            </div>
                             <div className="admin-form-group sm:col-span-2">
                                <label htmlFor="address">Địa chỉ</label>
                                <input type="text" name="address" id="address" value={formData.address || ''} onChange={handleChange} />
                            </div>
                            <div className="admin-form-group">
                                <label htmlFor="status">Trạng thái</label>
                                <select name="status" id="status" value={formData.status || 'Đang hoạt động'} onChange={handleChange}>
                                    {USER_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label htmlFor="staffRole">Vai trò hệ thống</label>
                                <select name="staffRole" id="staffRole" value={formData.staffRole || 'Chuyên viên Hỗ trợ'} onChange={handleChange} disabled={formData.email === currentUser?.email}>
                                    {STAFF_ROLE_OPTIONS.map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/hrm_dashboard')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu thay đổi</Button>
                </div>
            </form>
        </div>
    );
};

export default UserFormPage;
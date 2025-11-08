import React, { useState, useEffect } from 'react';
import { User, DebtStatus } from '../../types';
import Button from '../../components/ui/Button';
import ImageUploadInput from '../../components/ui/ImageUploadInput';
import { useAuth } from '../../contexts/AuthContext';
import * as ReactRouterDOM from 'react-router-dom';

const DEBT_STATUS_OPTIONS: DebtStatus[] = ['Không có', 'Có nợ', 'Quá hạn'];
const CUSTOMER_ORIGIN_OPTIONS: string[] = ['Website', 'Facebook Ads', 'Giới thiệu', 'Khác'];

const CustomerFormPage: React.FC = () => {
    const { customerId } = ReactRouterDOM.useParams<{ customerId: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { users, addUser, updateUser, hasPermission } = useAuth();
    const isEditing = !!customerId;

    const [formData, setFormData] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [staffUsers, setStaffUsers] = useState<User[]>([]);

    useEffect(() => {
        if (!hasPermission(['manageCustomers'])) {
            setError('Bạn không có quyền để quản lý khách hàng.');
            setIsLoading(false);
            return;
        }

        const loadData = () => {
            setIsLoading(true);
            setError(null);
            
            const availableStaff = users.filter(u => u.role === 'staff' || u.role === 'admin');
            setStaffUsers(availableStaff);

            if (isEditing) {
                const userToEdit = users.find(u => u.id === customerId);
                if (userToEdit && userToEdit.role === 'customer') {
                    setFormData(userToEdit);
                } else {
                    setError('Không tìm thấy khách hàng để chỉnh sửa hoặc người dùng không phải khách hàng.');
                }
                setIsLoading(false);
            } else {
                setFormData({
                    id: '',
                    username: '',
                    email: '',
                    password: 'password123', // Default password for new customer, should be changed
                    role: 'customer',
                    phone: '',
                    address: '',
                    dateOfBirth: '',
                    origin: 'Website',
                    loyaltyPoints: 0,
                    debtStatus: 'Không có',
                    assignedStaffId: '',
                    isLocked: false,
                });
                setIsLoading(false);
            }
        };
        loadData();
    }, [isEditing, customerId, users, hasPermission]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => prev ? ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }) : null);
    };
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData(prev => prev ? ({
            ...prev,
            [name]: value === '' ? undefined : Number(value)
        }) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        try {
            if (isEditing) {
                const { id, ...updates } = formData;
                await updateUser(id, updates);
                alert('Cập nhật thông tin khách hàng thành công!');
            } else {
                const { id, ...dto } = formData;
                await addUser(dto);
                alert('Thêm khách hàng mới thành công!');
            }
            navigate('/admin/customers');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu thông tin khách hàng.');
        }
    };

    if (isLoading) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-textMuted">Đang tải dữ liệu khách hàng...</p>
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
                    <Button onClick={() => navigate('/admin/customers')} className="mt-4">Quay lại</Button>
                </div>
            </div>
        );
    }

    if (!formData) return null;

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header flex justify-between items-center">
                    <h3 className="admin-card-title">{isEditing ? `Chỉnh sửa Khách hàng: ${formData.username}` : 'Thêm Khách hàng mới'}</h3>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/customers')}>Hủy</Button>
                </div>
                <div className="admin-card-body admin-product-form-page-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Avatar & Status */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="admin-card !p-4">
                                <h4 className="admin-form-subsection-title !mt-0">Ảnh đại diện & Trạng thái</h4>
                                <ImageUploadInput
                                    label="Ảnh đại diện"
                                    value={formData.imageUrl || ''}
                                    onChange={value => setFormData(p => p ? ({ ...p, imageUrl: value }) : null)}
                                    showPreview={true}
                                />
                                <div className="admin-form-group-checkbox items-center mt-4">
                                    <input type="checkbox" name="isLocked" id="isLocked" checked={formData.isLocked || false} onChange={handleChange} className="w-4 h-4" />
                                    <label htmlFor="isLocked" className="!mb-0 !ml-2">Khóa tài khoản</label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="admin-card !p-4">
                                <h4 className="admin-form-subsection-title !mt-0">Thông tin cơ bản</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="admin-form-group">
                                        <label htmlFor="username">Tên khách hàng *</label>
                                        <input type="text" name="username" id="username" value={formData.username || ''} onChange={handleChange} required />
                                    </div>
                                    <div className="admin-form-group">
                                        <label htmlFor="email">Email *</label>
                                        <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} required disabled={isEditing} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label htmlFor="phone">Số điện thoại</label>
                                        <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label htmlFor="dateOfBirth">Ngày sinh</label>
                                        <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''} onChange={handleChange} />
                                    </div>
                                    <div className="admin-form-group sm:col-span-2">
                                        <label htmlFor="address">Địa chỉ</label>
                                        <input type="text" name="address" id="address" value={formData.address || ''} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="admin-card !p-4">
                                 <h4 className="admin-form-subsection-title !mt-0">Thông tin CRM & Bán hàng</h4>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="admin-form-group">
                                        <label htmlFor="origin">Nguồn gốc</label>
                                        <select name="origin" id="origin" value={formData.origin || ''} onChange={handleChange}>
                                            {CUSTOMER_ORIGIN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div className="admin-form-group">
                                        <label htmlFor="loyaltyPoints">Điểm tích lũy</label>
                                        <input type="number" name="loyaltyPoints" id="loyaltyPoints" value={formData.loyaltyPoints === undefined ? '' : formData.loyaltyPoints} onChange={handleNumberChange} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label htmlFor="debtStatus">Trạng thái công nợ</label>
                                        <select name="debtStatus" id="debtStatus" value={formData.debtStatus || 'Không có'} onChange={handleChange}>
                                            {DEBT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                    <div className="admin-form-group">
                                        <label htmlFor="assignedStaffId">Nhân viên phụ trách</label>
                                        <select name="assignedStaffId" id="assignedStaffId" value={formData.assignedStaffId || ''} onChange={handleChange}>
                                            <option value="">-- Chọn nhân viên --</option>
                                            {staffUsers.map(staff => <option key={staff.id} value={staff.id}>{staff.username}</option>)}
                                        </select>
                                    </div>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/customers')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu thông tin</Button>
                </div>
            </form>
        </div>
    );
};

export default CustomerFormPage;
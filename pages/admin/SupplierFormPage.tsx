import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Supplier } from '../../types';
import Button from '../../components/ui/Button';
import { getSuppliers, addSupplier, updateSupplier } from '../../services/localDataService';

const SupplierFormPage: React.FC = () => {
    const { supplierId } = useParams<{ supplierId: string }>();
    const navigate = useNavigate();
    const isEditing = !!supplierId;

    const [formData, setFormData] = useState<Partial<Supplier> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (isEditing) {
                setIsLoading(true);
                setError(null);
                try {
                    const allData = await getSuppliers();
                    const itemToEdit = allData.find(s => s.id === supplierId);
                    if (itemToEdit) {
                        setFormData(itemToEdit);
                    } else {
                        setError('Không tìm thấy nhà cung cấp để chỉnh sửa.');
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setFormData({
                    name: '',
                    contactInfo: { email: '', phone: '', address: '' },
                    paymentTerms: 'Thanh toán ngay khi nhận hàng',
                });
                setIsLoading(false);
            }
        };
        loadData();
    }, [isEditing, supplierId]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };
    
    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, contactInfo: { ...prev.contactInfo, [name]: value } }) : null);
    };
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !formData.name) return;

        try {
            if (isEditing) {
                await updateSupplier(supplierId, formData);
                alert('Cập nhật nhà cung cấp thành công!');
            } else {
                await addSupplier(formData as Omit<Supplier, 'id'>);
                alert('Thêm nhà cung cấp mới thành công!');
            }
            navigate('/admin/suppliers');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu.');
        }
    };

    if (isLoading) {
        return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    }
    if (error) {
        return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    }
    if (!formData) return null;

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">{isEditing ? 'Chỉnh sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}</h3>
                </div>
                <div className="admin-card-body">
                    <div className="admin-form-group">
                        <label>Tên Nhà Cung Cấp *</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
                    </div>
                     <div className="admin-form-subsection-title">Thông tin liên hệ</div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="admin-form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.contactInfo?.email || ''} onChange={handleContactChange} />
                        </div>
                         <div className="admin-form-group">
                            <label>Số điện thoại</label>
                            <input type="tel" name="phone" value={formData.contactInfo?.phone || ''} onChange={handleContactChange} />
                        </div>
                        <div className="admin-form-group sm:col-span-2">
                            <label>Địa chỉ</label>
                            <input type="text" name="address" value={formData.contactInfo?.address || ''} onChange={handleContactChange} />
                        </div>
                     </div>
                     <div className="admin-form-subsection-title">Thông tin Giao dịch</div>
                     <div className="admin-form-group">
                        <label>Điều khoản Thanh toán</label>
                        <textarea name="paymentTerms" value={formData.paymentTerms || ''} onChange={handleChange} rows={2}></textarea>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/suppliers')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </form>
        </div>
    );
};

export default SupplierFormPage;
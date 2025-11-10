import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Supplier, SiteSettings } from '../../types';
import Button from '../../components/ui/Button';
import { getSuppliers, addSupplier, updateSupplier } from '../../services/localDataService';
import * as Constants from '../../constants';

const SupplierFormPage: React.FC = () => {
    const { supplierId } = useParams<{ supplierId: string }>();
    const navigate = useNavigate();
    const isEditing = !!supplierId;

    const [formData, setFormData] = useState<Partial<Supplier> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);

    useEffect(() => {
        const loadData = async () => {
            const settingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
            setSiteSettings(settingsRaw ? JSON.parse(settingsRaw) : Constants.INITIAL_SITE_SETTINGS);

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
                await updateSupplier(supplierId!, formData);
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
    
    const handlePrint = () => {
        window.print();
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
                <div className="admin-card-header flex justify-between items-center no-print">
                    <h3 className="admin-card-title">{isEditing ? 'Chỉnh sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}</h3>
                     <div>
                        <Button type="button" variant="outline" onClick={handlePrint} className="mr-2" leftIcon={<i className="fas fa-print"></i>}>In</Button>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/suppliers')}>Hủy</Button>
                    </div>
                </div>
                <div className="admin-card-body print-wrapper">
                    {/* Form and Print View */}
                    <div className="print-container max-w-2xl mx-auto p-4 bg-white">
                        {/* Print Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold uppercase hidden print-only">{siteSettings.companyName}</h2>
                            <h1 className="text-xl font-bold uppercase mt-4">Thông tin Nhà Cung Cấp</h1>
                        </div>

                        {/* Editable Form */}
                        <div className="admin-form-group">
                            <label className="no-print">Tên Nhà Cung Cấp *</label>
                             <p className="hidden print-only"><strong>Tên Nhà Cung Cấp:</strong> {formData.name}</p>
                            <input className="no-print" type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
                        </div>
                        <div className="admin-form-subsection-title">Thông tin liên hệ</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="admin-form-group">
                                <label className="no-print">Email</label>
                                <p className="hidden print-only"><strong>Email:</strong> {formData.contactInfo?.email}</p>
                                <input className="no-print" type="email" name="email" value={formData.contactInfo?.email || ''} onChange={handleContactChange} />
                            </div>
                            <div className="admin-form-group">
                                <label className="no-print">Số điện thoại</label>
                                <p className="hidden print-only"><strong>Số điện thoại:</strong> {formData.contactInfo?.phone}</p>
                                <input className="no-print" type="tel" name="phone" value={formData.contactInfo?.phone || ''} onChange={handleContactChange} />
                            </div>
                            <div className="admin-form-group sm:col-span-2">
                                <label className="no-print">Địa chỉ</label>
                                <p className="hidden print-only"><strong>Địa chỉ:</strong> {formData.contactInfo?.address}</p>
                                <input className="no-print" type="text" name="address" value={formData.contactInfo?.address || ''} onChange={handleContactChange} />
                            </div>
                        </div>
                        <div className="admin-form-subsection-title">Thông tin Giao dịch</div>
                        <div className="admin-form-group">
                            <label className="no-print">Điều khoản Thanh toán</label>
                            <p className="hidden print-only"><strong>Điều khoản Thanh toán:</strong> {formData.paymentTerms}</p>
                            <textarea className="no-print" name="paymentTerms" value={formData.paymentTerms || ''} onChange={handleChange} rows={2}></textarea>
                        </div>
                    </div>
                </div>
                <div className="admin-modal-footer no-print">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/suppliers')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </form>
        </div>
    );
};

export default SupplierFormPage;
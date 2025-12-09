import React, { useState, useEffect } from 'react';
import { DiscountCode } from '@/types';
import Button from '@/components/ui/Button';
import * as ReactRouterDOM from 'react-router-dom';
import * as Constants from '@/constants';

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; }
    catch (error) { console.error(`Lỗi đọc localStorage key "${key}":`, error); return defaultValue; }
};
const setLocalStorageItem = <T,>(key: string, value: T) => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (error) { console.error(`Lỗi cài đặt localStorage key "${key}":`, error); }
};

const DiscountFormPage: React.FC = () => {
    const { discountId } = ReactRouterDOM.useParams<{ discountId: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const isEditing = !!discountId;

    const [formData, setFormData] = useState<DiscountCode | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDiscount = () => {
            setIsLoading(true);
            setError(null);
            const allDiscounts: DiscountCode[] = getLocalStorageItem(Constants.DISCOUNTS_STORAGE_KEY, Constants.INITIAL_DISCOUNT_CODES);
            if (isEditing) {
                const foundDiscount = allDiscounts.find(d => d.id === discountId);
                if (foundDiscount) {
                    setFormData(foundDiscount);
                } else {
                    setError('Không tìm thấy mã giảm giá để chỉnh sửa.');
                }
            } else {
                setFormData({
                    id: '', code: '', type: 'percentage', value: 10, isActive: true,
                    minSpend: 0, usageLimit: undefined, timesUsed: 0,
                });
            }
            setIsLoading(false);
        };
        loadDiscount();
    }, [isEditing, discountId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        let finalValue: any = value;
        if (type === 'checkbox') {
            finalValue = checked;
        } else if (type === 'number') {
            finalValue = value === '' ? undefined : Number(value);
        }

        setFormData(p => p ? ({ ...p, [name]: finalValue }) : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        let allDiscounts: DiscountCode[] = getLocalStorageItem(Constants.DISCOUNTS_STORAGE_KEY, Constants.INITIAL_DISCOUNT_CODES);
        let updated: DiscountCode[];

        if (isEditing) {
            updated = allDiscounts.map(d => d.id === formData.id ? formData : d);
        } else {
            updated = [{ ...formData, id: `dc-${Date.now()}` }, ...allDiscounts];
        }
        setLocalStorageItem(Constants.DISCOUNTS_STORAGE_KEY, updated);
        alert('Lưu mã giảm giá thành công!');
        navigate('/admin/discounts');
    };

    if (isLoading) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-textMuted">Đang tải dữ liệu mã giảm giá...</p>
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
                    <Button onClick={() => navigate('/admin/discounts')} className="mt-4">Quay lại</Button>
                </div>
            </div>
        );
    }

    if (!formData) return null;

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">{isEditing ? `Sửa Mã giảm giá: ${formData.code}` : 'Thêm Mã giảm giá mới'}</h3>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/discounts')}>Hủy</Button>
                </div>
                <div className="admin-card-body admin-product-form-page-body"> {/* Using similar class for scrolling */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="admin-form-group">
                            <label>Mã Code *</label>
                            <input type="text" name="code" value={formData.code || ''} onChange={handleChange} required className="font-mono" />
                        </div>
                        <div className="admin-form-group">
                            <label>Loại *</label>
                            <select name="type" value={formData.type || 'percentage'} onChange={handleChange}>
                                <option value="percentage">Phần trăm</option>
                                <option value="fixed_amount">Số tiền cố định</option>
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label>Giá trị *</label>
                            <input type="number" name="value" value={formData.value || 0} onChange={handleChange} required />
                        </div>
                        <div className="admin-form-group">
                            <label>Chi tiêu tối thiểu</label>
                            <input type="number" name="minSpend" value={formData.minSpend === undefined ? '' : formData.minSpend} onChange={handleChange} />
                        </div>
                        <div className="admin-form-group">
                            <label>Giới hạn số lần dùng (để trống nếu không giới hạn)</label>
                            <input type="number" name="usageLimit" value={formData.usageLimit === undefined ? '' : formData.usageLimit} onChange={handleChange} placeholder="Vô hạn" />
                        </div>
                        <div className="admin-form-group md:col-span-2">
                            <label>Mô tả</label>
                            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3}></textarea>
                        </div>
                        <div className="admin-form-group">
                            <label>Ngày hết hạn</label>
                            <input type="date" name="expiryDate" value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''} onChange={handleChange} />
                        </div>
                        <div className="admin-form-group-checkbox items-center pt-6">
                            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4" id="isActive" />
                            <label htmlFor="isActive" className="!mb-0 !ml-2">Kích hoạt</label>
                        </div>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/discounts')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </form>
        </div>
    );
};

export default DiscountFormPage;

import React, { useState, useMemo, useEffect } from 'react';
import { DiscountCode } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; } 
    catch (error) { console.error(`Lỗi đọc localStorage key "${key}":`, error); return defaultValue; }
};
const setLocalStorageItem = <T,>(key: string, value: T) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } 
    catch (error) { console.error(`Lỗi cài đặt localStorage key "${key}":`, error); }
};

const DiscountManagementView: React.FC = () => {
    const [discounts, setDiscounts] = useState<DiscountCode[]>(() => getLocalStorageItem(Constants.DISCOUNTS_STORAGE_KEY, Constants.INITIAL_DISCOUNT_CODES));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);

    const handleUpdate = (updatedDiscounts: DiscountCode[]) => {
        setDiscounts(updatedDiscounts);
        setLocalStorageItem(Constants.DISCOUNTS_STORAGE_KEY, updatedDiscounts);
    };

    const openModalForNew = () => {
        setEditingDiscount({
            id: '', code: '', type: 'percentage', value: 10, isActive: true,
        });
        setIsModalOpen(true);
    };
    
    const openModalForEdit = (discount: DiscountCode) => {
        setEditingDiscount(discount);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setEditingDiscount(null);
        setIsModalOpen(false);
    };

    const handleSave = (data: DiscountCode) => {
        let updated;
        if (data.id) {
            updated = discounts.map(d => d.id === data.id ? data : d);
        } else {
            updated = [{...data, id: `dc-${Date.now()}`}, ...discounts];
        }
        handleUpdate(updated);
        closeModal();
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
            handleUpdate(discounts.filter(d => d.id !== id));
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Mã giảm giá</h3>
                <Button onClick={openModalForNew} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Thêm Mã mới
                </Button>
            </div>
            <div className="admin-card-body">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead><tr><th>Mã</th><th>Mô tả</th><th>Loại/Giá trị</th><th>Trạng thái</th><th>Ngày hết hạn</th><th>Hành động</th></tr></thead>
                        <tbody>
                            {discounts.map(d => (
                                <tr key={d.id}>
                                    <td className="font-mono text-primary font-semibold">{d.code}</td>
                                    <td className="text-sm">{d.description}</td>
                                    <td>
                                        <span className="capitalize">{d.type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}: </span>
                                        <strong>{d.type === 'percentage' ? `${d.value}%` : `${d.value.toLocaleString('vi-VN')}₫`}</strong>
                                    </td>
                                    <td><span className={`status-badge ${d.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{d.isActive ? 'Hoạt động' : 'Vô hiệu'}</span></td>
                                    <td>{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString('vi-VN') : 'Không hết hạn'}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <Button onClick={() => openModalForEdit(d)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                            <Button onClick={() => handleDelete(d.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"><i className="fas fa-trash"></i></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <DiscountFormModal discount={editingDiscount} onClose={closeModal} onSave={handleSave} />}
        </div>
    );
};

// --- Form Modal ---
interface DiscountFormModalProps {
    discount: DiscountCode | null;
    onClose: () => void;
    onSave: (data: DiscountCode) => void;
}
const DiscountFormModal: React.FC<DiscountFormModalProps> = ({ discount, onClose, onSave }) => {
    const [formData, setFormData] = useState<DiscountCode>(discount || {} as DiscountCode);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(p => ({...p, [name]: type === 'checkbox' ? checked : value}));
    }
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-panel">
                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-header"><h4 className="admin-modal-title">{formData.id ? 'Sửa Mã giảm giá' : 'Thêm Mã giảm giá'}</h4><button type="button" onClick={onClose}>&times;</button></div>
                    <div className="admin-modal-body grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="admin-form-group"><label>Mã Code *</label><input type="text" name="code" value={formData.code || ''} onChange={handleChange} required className="font-mono" /></div>
                        <div className="admin-form-group"><label>Loại *</label>
                            <select name="type" value={formData.type || 'percentage'} onChange={handleChange}><option value="percentage">Phần trăm</option><option value="fixed_amount">Số tiền cố định</option></select>
                        </div>
                        <div className="admin-form-group"><label>Giá trị *</label><input type="number" name="value" value={formData.value || 0} onChange={handleChange} required /></div>
                        <div className="admin-form-group"><label>Chi tiêu tối thiểu</label><input type="number" name="minSpend" value={formData.minSpend || ''} onChange={handleChange} /></div>
                        <div className="admin-form-group md:col-span-2"><label>Mô tả</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3}></textarea></div>
                        <div className="admin-form-group"><label>Ngày hết hạn</label><input type="date" name="expiryDate" value={formData.expiryDate || ''} onChange={handleChange} /></div>
                        <div className="admin-form-group-checkbox items-center pt-6"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4" /><label className="!mb-0 !ml-2">Kích hoạt</label></div>
                    </div>
                    <div className="admin-modal-footer"><Button type="button" variant="outline" onClick={onClose}>Hủy</Button><Button type="submit">Lưu</Button></div>
                </form>
            </div>
        </div>
    );
};


export default DiscountManagementView;

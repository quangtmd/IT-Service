import React, { useState, useMemo, useEffect } from 'react';
import { DiscountCode } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; }
    catch (error) { console.error(`Lỗi đọc localStorage key "${key}":`, error); return defaultValue; }
};

const DiscountManagementView: React.FC = () => {
    const [discounts, setDiscounts] = useState<DiscountCode[]>(() => getLocalStorageItem(Constants.DISCOUNTS_STORAGE_KEY, Constants.INITIAL_DISCOUNT_CODES));
    const navigate = useNavigate();

    useEffect(() => {
        // This effect reloads discounts if the storage changes externally, or on initial load
        const loadDiscounts = () => {
            setDiscounts(getLocalStorageItem(Constants.DISCOUNTS_STORAGE_KEY, Constants.INITIAL_DISCOUNT_CODES));
        };
        window.addEventListener('localStorageChange', loadDiscounts); // Custom event for localStorage updates
        return () => window.removeEventListener('localStorageChange', loadDiscounts);
    }, []);


    const handleAddNewDiscount = () => {
        navigate('/admin/discounts/new');
    };

    const handleEditDiscount = (discountId: string) => {
        navigate(`/admin/discounts/edit/${discountId}`);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
            const updated = discounts.filter(d => d.id !== id);
            localStorage.setItem(Constants.DISCOUNTS_STORAGE_KEY, JSON.stringify(updated));
            setDiscounts(updated); // Update local state
            window.dispatchEvent(new CustomEvent('localStorageChange')); // Notify others
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Mã giảm giá</h3>
                <Button onClick={handleAddNewDiscount} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
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
                                            <Button onClick={() => handleEditDiscount(d.id)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                            <Button onClick={() => handleDelete(d.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"><i className="fas fa-trash"></i></Button>
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

export default DiscountManagementView;
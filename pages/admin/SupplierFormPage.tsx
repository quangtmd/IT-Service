import React from 'react';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const SupplierFormPage: React.FC = () => {
    const navigate = useNavigate();
    // Placeholder for form state and logic

    return (
        <div className="admin-card">
            <form className="flex flex-col h-full">
                <div className="admin-card-header flex justify-between items-center">
                    <h3 className="admin-card-title">Tạo/Sửa Nhà Cung Cấp</h3>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/suppliers')}>Hủy</Button>
                </div>
                <div className="admin-card-body text-center py-12">
                    <i className="fas fa-truck-loading text-5xl text-gray-300 mb-4"></i>
                     <h4 className="text-xl font-semibold text-textBase">Tính năng đang được phát triển</h4>
                    <p className="mt-2 max-w-md mx-auto text-textMuted">Giao diện thêm và sửa thông tin nhà cung cấp sẽ được xây dựng tại đây.</p>
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

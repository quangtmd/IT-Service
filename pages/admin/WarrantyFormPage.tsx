import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

const WarrantyFormPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Tạo/Sửa Phiếu Bảo Hành</h3>
            </div>
            <div className="admin-card-body">
                <p className="text-center text-textMuted">Tính năng đang được phát triển.</p>
                <div className="mt-4 text-center">
                    <Button onClick={() => navigate('/admin/warranty_claims')}>Quay lại</Button>
                </div>
            </div>
        </div>
    );
};
export default WarrantyFormPage;

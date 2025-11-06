import React from 'react';

const WarrantyManagementView: React.FC = () => {
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Phiếu Bảo hành</h3>
            </div>
            <div className="admin-card-body">
                <div className="text-center text-textMuted py-12">
                    <i className="fas fa-shield-alt text-5xl text-gray-300 mb-4"></i>
                    <h4 className="text-xl font-semibold text-textBase">Tính năng đang được phát triển</h4>
                    <p className="mt-2 max-w-md mx-auto">Module quản lý quy trình tiếp nhận, xử lý và trả bảo hành cho khách hàng sẽ sớm được ra mắt.</p>
                </div>
            </div>
        </div>
    );
};

export default WarrantyManagementView;
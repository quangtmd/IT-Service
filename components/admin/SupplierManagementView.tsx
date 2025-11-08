import React from 'react';

const SupplierManagementView: React.FC = () => {
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Nhà Cung Cấp</h3>
            </div>
            <div className="admin-card-body">
                <div className="text-center text-textMuted py-12">
                    <i className="fas fa-truck-loading text-5xl text-gray-300 mb-4"></i>
                    <h4 className="text-xl font-semibold text-textBase">Tính năng đang được phát triển</h4>
                    <p className="mt-2 max-w-md mx-auto">Module quản lý thông tin, lịch sử giao dịch và công nợ với nhà cung cấp sẽ sớm được ra mắt.</p>
                </div>
            </div>
        </div>
    );
};

export default SupplierManagementView;

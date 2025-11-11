import React from 'react';

const AssetManagementView: React.FC = () => {
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Tài sản</h3>
            </div>
            <div className="admin-card-body text-center py-12">
                <i className="fas fa-laptop-house text-5xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-textBase">Tính năng Quản lý Tài sản</h3>
                <p className="text-textMuted mt-2">Module này đang trong quá trình phát triển và sẽ sớm được ra mắt.</p>
            </div>
        </div>
    );
};

export default AssetManagementView;

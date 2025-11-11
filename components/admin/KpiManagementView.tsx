import React from 'react';

const KpiManagementView: React.FC = () => {
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">KPI & Hiệu suất</h3>
            </div>
            <div className="admin-card-body text-center py-12">
                <i className="fas fa-chart-line text-5xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-textBase">Tính năng Quản lý KPI & Hiệu suất</h3>
                <p className="text-textMuted mt-2">Module này đang trong quá trình phát triển và sẽ sớm được ra mắt.</p>
            </div>
        </div>
    );
};

export default KpiManagementView;

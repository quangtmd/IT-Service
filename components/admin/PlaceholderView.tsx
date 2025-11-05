import React from 'react';

const PlaceholderView: React.FC<{ title: string }> = ({ title }) => {
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">{title}</h3>
            </div>
            <div className="admin-card-body text-center py-16 text-gray-500">
                <i className="fas fa-cogs text-5xl mb-4 text-gray-300"></i>
                <h4 className="text-xl font-semibold text-gray-700">Tính năng đang được phát triển</h4>
                <p className="mt-2 max-w-md mx-auto">Chúng tôi đang làm việc chăm chỉ để mang tính năng này đến với bạn. Vui lòng quay lại sau!</p>
            </div>
        </div>
    );
};

export default PlaceholderView;

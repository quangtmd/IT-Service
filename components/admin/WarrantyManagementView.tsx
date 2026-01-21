import React, { useState, useEffect, useCallback } from 'react';
import { WarrantyClaim } from '../../types';
import { getWarrantyClaims } from '../../services/localDataService';
import Button from '../ui/Button';

const getStatusColor = (status: WarrantyClaim['status']) => {
    switch (status) {
        case 'Đang tiếp nhận': return 'bg-blue-100 text-blue-800';
        case 'Đang xử lý': return 'bg-yellow-100 text-yellow-800';
        case 'Chờ linh kiện': return 'bg-purple-100 text-purple-800';
        case 'Hoàn thành': return 'bg-green-100 text-green-800';
        case 'Từ chối': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const WarrantyManagementView: React.FC = () => {
    const [claims, setClaims] = useState<WarrantyClaim[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadClaims = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // This service needs to be implemented in localDataService to fetch from API
            const data = await getWarrantyClaims();
            setClaims(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu phiếu bảo hành.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadClaims();
    }, [loadClaims]);

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Phiếu Bảo hành</h3>
            </div>
            <div className="admin-card-body">
                {isLoading ? (
                    <p className="text-center py-4">Đang tải dữ liệu...</p>
                ) : error ? (
                    <p className="text-center py-4 text-red-500">{error}</p>
                ) : claims.length > 0 ? (
                     <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Mã Phiếu</th>
                                    <th>Khách hàng</th>
                                    <th>Sản phẩm</th>
                                    <th>Ngày tạo</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {claims.map(claim => (
                                    <tr key={claim.id}>
                                        <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">{claim.claim_code}</span></td>
                                        <td>{claim.customer_name}</td>
                                        <td>{claim.product_name}</td>
                                        <td>{new Date(claim.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td><span className={`status-badge ${getStatusColor(claim.status)}`}>{claim.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-textMuted py-12">
                        <i className="fas fa-shield-alt text-5xl text-gray-300 mb-4"></i>
                        <h4 className="text-xl font-semibold text-textBase">Chưa có phiếu bảo hành nào</h4>
                        <p className="mt-2 max-w-md mx-auto">Module quản lý quy trình tiếp nhận, xử lý và trả bảo hành cho khách hàng.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WarrantyManagementView;

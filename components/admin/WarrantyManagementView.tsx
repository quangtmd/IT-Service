import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { WarrantyClaim } from '../../types';
import { getWarrantyClaims, deleteWarrantyClaim } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';

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
    const navigate = useNavigate();

    const loadClaims = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
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

    const handleAddNew = () => {
        navigate('/admin/warranty_claims/new');
    };

    const handleEdit = (id: string) => {
        navigate(`/admin/warranty_claims/edit/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa phiếu bảo hành này?')) {
            try {
                await deleteWarrantyClaim(id);
                loadClaims();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa.');
            }
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Phiếu Bảo hành ({claims.length})</h3>
                <Button onClick={handleAddNew} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Tạo Phiếu BH
                </Button>
            </div>
            <div className="admin-card-body">
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã Phiếu</th>
                                <th>Khách hàng</th>
                                <th>Sản phẩm</th>
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && claims.length > 0 ? (
                                claims.map(claim => (
                                    <tr key={claim.id}>
                                        <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">{claim.claim_code}</span></td>
                                        <td>{claim.customer_name}</td>
                                        <td>{claim.product_name}</td>
                                        <td>{new Date(claim.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td><span className={`status-badge ${getStatusColor(claim.status)}`}>{claim.status}</span></td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleEdit(claim.id)} size="sm" variant="outline" title="Sửa"><i className="fas fa-edit"></i></Button>
                                                <Button onClick={() => handleDelete(claim.id)} size="sm" variant="ghost" className="text-red-500" title="Xóa"><i className="fas fa-trash"></i></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !error && <tr><td colSpan={6} className="text-center py-4 text-textMuted">Chưa có phiếu bảo hành nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WarrantyManagementView;
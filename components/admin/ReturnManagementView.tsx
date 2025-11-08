import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReturnTicket } from '../../types';
import { getReturns, deleteReturn } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';

const getStatusColor = (status: ReturnTicket['status']) => {
    switch (status) {
        case 'Đang chờ': return 'bg-yellow-100 text-yellow-800';
        case 'Đã duyệt': return 'bg-green-100 text-green-800';
        case 'Đã từ chối': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const ReturnManagementView: React.FC = () => {
    const [returns, setReturns] = useState<ReturnTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadReturns = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getReturns();
            setReturns(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu hoàn trả.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReturns();
    }, [loadReturns]);

    const handleAddNew = () => {
        navigate('/admin/returns/new');
    };

    const handleEdit = (id: string) => {
        navigate(`/admin/returns/edit/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa phiếu hoàn trả này?')) {
            try {
                await deleteReturn(id);
                loadReturns();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa.');
            }
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Hoàn Trả ({returns.length})</h3>
                <Button onClick={handleAddNew} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Tạo Phiếu Hoàn Trả
                </Button>
            </div>
            <div className="admin-card-body">
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã Phiếu</th>
                                <th>Mã Đơn Hàng</th>
                                <th>Ngày tạo</th>
                                <th>Số tiền hoàn</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && returns.length > 0 ? (
                                returns.map(ret => (
                                    <tr key={ret.id}>
                                        <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{ret.id.slice(-6)}</span></td>
                                        <td><span className="font-mono text-xs bg-blue-100 p-1 rounded">#{ret.orderId.slice(-6)}</span></td>
                                        <td>{new Date(ret.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="font-semibold text-red-600">{ret.refundAmount ? `${ret.refundAmount.toLocaleString('vi-VN')}₫` : 'N/A'}</td>
                                        <td><span className={`status-badge ${getStatusColor(ret.status)}`}>{ret.status}</span></td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleEdit(ret.id)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                                <Button onClick={() => handleDelete(ret.id)} size="sm" variant="ghost" className="text-red-500"><i className="fas fa-trash"></i></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !error && <tr><td colSpan={6} className="text-center py-4 text-textMuted">Chưa có phiếu hoàn trả nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReturnManagementView;

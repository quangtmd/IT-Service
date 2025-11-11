import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockTransfer } from '../../types';
import { getStockTransfers, deleteStockTransfer } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';

const StockTransfersView: React.FC = () => {
    const [transfers, setTransfers] = useState<StockTransfer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getStockTransfers();
            setTransfers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu phiếu điều chuyển.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        window.addEventListener('localStorageChange', loadData);
        return () => window.removeEventListener('localStorageChange', loadData);
    }, [loadData]);
    
    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc muốn xóa phiếu điều chuyển này?')) {
            try {
                await deleteStockTransfer(id);
                loadData();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa.');
            }
        }
    };

    const getStatusColor = (status: StockTransfer['status']) => {
        switch (status) {
            case 'Chờ duyệt': return 'bg-yellow-100 text-yellow-800';
            case 'Đã duyệt':
            case 'Đang vận chuyển': return 'bg-blue-100 text-blue-800';
            case 'Hoàn thành': return 'bg-green-100 text-green-800';
            case 'Đã hủy': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Phiếu Điều Chuyển Kho ({transfers.length})</h3>
                <div className="admin-actions-bar">
                    <Button size="sm" onClick={() => navigate('/admin/stock_transfers/new')} leftIcon={<i className="fas fa-plus" />}>Tạo Phiếu</Button>
                </div>
            </div>
            <div className="admin-card-body">
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table text-sm">
                        <thead className="thead-brand">
                            <tr>
                                <th>Số Phiếu</th>
                                <th>Ngày Lập</th>
                                <th>Từ Kho</th>
                                <th>Đến Kho</th>
                                <th>Trạng Thái</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && transfers.length > 0 ? (
                                transfers.map(transfer => (
                                    <tr key={transfer.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => navigate(`/admin/stock_transfers/edit/${transfer.id}`)}>
                                        <td className="font-semibold text-blue-700">{transfer.transferNumber}</td>
                                        <td>{new Date(transfer.date).toLocaleDateString('vi-VN')}</td>
                                        <td>{transfer.sourceWarehouseName}</td>
                                        <td>{transfer.destWarehouseName}</td>
                                        <td><span className={`status-badge ${getStatusColor(transfer.status)}`}>{transfer.status}</span></td>
                                        <td>
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/stock_transfers/edit/${transfer.id}`) }} className="text-blue-600" title="Sửa"><i className="fas fa-edit" /></button>
                                                <button onClick={(e) => handleDelete(e, transfer.id)} className="text-red-600" title="Xóa"><i className="fas fa-times" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !error && <tr><td colSpan={6} className="text-center py-4 text-textMuted">Chưa có phiếu điều chuyển nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockTransfersView;
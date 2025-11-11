import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockIssue } from '../../types';
import { getStockIssues, deleteStockIssue } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';

const StockIssuesView: React.FC = () => {
    const [issues, setIssues] = useState<StockIssue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getStockIssues();
            setIssues(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu phiếu xuất kho.');
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
        if (window.confirm('Bạn có chắc muốn xóa phiếu xuất kho này?')) {
            try {
                await deleteStockIssue(id);
                loadData();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa.');
            }
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Phiếu Xuất Kho ({issues.length})</h3>
                <Button size="sm" onClick={() => navigate('/admin/stock_issues/new')} leftIcon={<i className="fas fa-plus" />}>Tạo Phiếu Xuất</Button>
            </div>
            <div className="admin-card-body">
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table text-sm">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th>Số Phiếu</th>
                                <th>Ngày Xuất</th>
                                <th>Đơn Hàng Gốc</th>
                                <th>Trạng Thái</th>
                                <th>Ghi Chú</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && issues.length > 0 ? (
                                issues.map(issue => (
                                    <tr key={issue.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => navigate(`/admin/stock_issues/edit/${issue.id}`)}>
                                        <td className="font-semibold text-blue-700">{issue.issueNumber}</td>
                                        <td>{new Date(issue.date).toLocaleDateString('vi-VN')}</td>
                                        <td className="font-mono text-xs">{issue.orderId}</td>
                                        <td>
                                            <span className={`status-badge ${issue.status === 'Hoàn thành' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{issue.status}</span>
                                        </td>
                                        <td className="max-w-xs truncate">{issue.notes}</td>
                                        <td>
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/stock_issues/edit/${issue.id}`) }} className="text-blue-600" title="Sửa"><i className="fas fa-edit" /></button>
                                                <button onClick={(e) => handleDelete(e, issue.id)} className="text-red-600" title="Xóa"><i className="fas fa-times" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !error && <tr><td colSpan={6} className="text-center py-4 text-textMuted">Chưa có phiếu xuất kho nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockIssuesView;

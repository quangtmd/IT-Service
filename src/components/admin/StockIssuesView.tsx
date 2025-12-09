
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
    const [selectedIssue, setSelectedIssue] = useState<StockIssue | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const handleViewDetails = (e: React.MouseEvent, issue: StockIssue) => {
        e.stopPropagation();
        setSelectedIssue(issue);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedIssue(null);
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Phiếu Xuất Kho ({issues.length})</h3>
                 <div className="admin-actions-bar">
                    <Button size="sm" variant="outline" leftIcon={<i className="fas fa-file-excel"/>}>Xuất Excel</Button>
                    <Button size="sm" onClick={() => navigate('/admin/stock_issues/new')} leftIcon={<i className="fas fa-plus" />}>Tạo Phiếu Xuất</Button>
                </div>
            </div>
            <div className="admin-card-body">
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table text-sm">
                        <thead className="thead-brand">
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
                                                <button onClick={(e) => handleViewDetails(e, issue)} className="text-gray-600 hover:text-blue-600" title="Xem chi tiết"><i className="fas fa-eye" /></button>
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

            {/* Details Modal */}
            {isModalOpen && selectedIssue && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-panel max-w-2xl" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h4 className="admin-modal-title">Chi Tiết Phiếu Xuất #{selectedIssue.issueNumber}</h4>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="admin-modal-body space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="font-semibold text-gray-600">Ngày xuất:</span> {new Date(selectedIssue.date).toLocaleDateString('vi-VN')}</div>
                                <div><span className="font-semibold text-gray-600">Trạng thái:</span> <span className={`status-badge ${selectedIssue.status === 'Hoàn thành' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedIssue.status}</span></div>
                                <div><span className="font-semibold text-gray-600">Đơn hàng gốc:</span> <span className="font-mono">{selectedIssue.orderId}</span></div>
                                <div><span className="font-semibold text-gray-600">Ghi chú:</span> {selectedIssue.notes || 'Không có'}</div>
                            </div>
                            
                            <h5 className="font-bold text-gray-700 border-b pb-2 mt-4">Danh sách sản phẩm</h5>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-2 border-b">STT</th>
                                            <th className="p-2 border-b">Tên Sản Phẩm</th>
                                            <th className="p-2 border-b text-right">Số Lượng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedIssue.items.map((item, idx) => (
                                            <tr key={idx} className="border-b last:border-0">
                                                <td className="p-2 text-center">{idx + 1}</td>
                                                <td className="p-2">{item.productName} <span className="text-xs text-gray-400">({item.productId})</span></td>
                                                <td className="p-2 text-right font-medium">{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <Button variant="outline" onClick={closeModal}>Đóng</Button>
                            <Button onClick={() => { closeModal(); navigate(`/admin/stock_issues/edit/${selectedIssue.id}`); }}>Chỉnh Sửa</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockIssuesView;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockReceipt } from '../../types';
import { getStockReceipts, deleteStockReceipt } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';

const StockReceiptsView: React.FC = () => {
    const [receipts, setReceipts] = useState<StockReceipt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getStockReceipts();
            setReceipts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu phiếu nhập kho.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc muốn xóa phiếu nhập kho này?')) {
            try {
                await deleteStockReceipt(id);
                loadData();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa.');
            }
        }
    };
    
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Phiếu Nhập Kho ({receipts.length})</h3>
                <div className="admin-actions-bar">
                    <Button size="sm" onClick={() => navigate('/admin/stock_receipts/new')} leftIcon={<i className="fas fa-plus" />}>Tạo Phiếu Nhập</Button>
                </div>
            </div>
            <div className="admin-card-body">
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table text-sm">
                        <thead className="thead-brand">
                            <tr>
                                <th>Số Phiếu</th>
                                <th>Ngày Nhập</th>
                                <th>Nhà Cung Cấp</th>
                                <th>Trạng Thái</th>
                                <th className="text-right">Tổng Tiền</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && receipts.length > 0 ? (
                                receipts.map(receipt => (
                                    <tr key={receipt.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => navigate(`/admin/stock_receipts/edit/${receipt.id}`)}>
                                        <td className="font-semibold text-blue-700">{receipt.receiptNumber}</td>
                                        <td>{new Date(receipt.date).toLocaleDateString('vi-VN')}</td>
                                        <td>{receipt.supplierName || receipt.supplierId}</td>
                                        <td>
                                            <span className={`status-badge ${receipt.status === 'Hoàn thành' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{receipt.status}</span>
                                        </td>
                                        <td className="text-right font-semibold">{receipt.totalAmount.toLocaleString('vi-VN')}₫</td>
                                        <td>
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/stock_receipts/edit/${receipt.id}`) }} className="text-blue-600" title="Sửa"><i className="fas fa-edit" /></button>
                                                <button onClick={(e) => handleDelete(e, receipt.id)} className="text-red-600" title="Xóa"><i className="fas fa-times" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !error && <tr><td colSpan={6} className="text-center py-4 text-textMuted">Chưa có phiếu nhập kho nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockReceiptsView;
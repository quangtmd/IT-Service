import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Quotation, User, Product } from '../../types';
import Button from '../ui/Button';
import { getQuotations, deleteQuotation } from '../../services/localDataService';
import { getUsers, getProducts } from '../../services/localDataService'; // Assuming these exist
import BackendConnectionError from '../../components/shared/BackendConnectionError'; // Cập nhật đường dẫn
import * as ReactRouterDOM from 'react-router-dom';

const getStatusColor = (status: Quotation['status']) => {
    switch (status) {
        case 'Nháp': return 'bg-gray-100 text-gray-800';
        case 'Đã gửi': return 'bg-blue-100 text-blue-800';
        case 'Đã chấp nhận': return 'bg-green-100 text-green-800';
        case 'Hết hạn':
        case 'Đã hủy': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const QuotationManagementView: React.FC = () => {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = ReactRouterDOM.useNavigate();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // These services need to be implemented, using localStorage for now.
            const [quotes, users] = await Promise.all([
                getQuotations(),
                getUsers(), // Assuming this fetches all users
            ]);

            setQuotations(quotes.map(q => {
                const customer = users.find(u => u.id === q.customer_id);
                return { ...q, customerInfo: customer ? { name: customer.username, email: customer.email } : undefined };
            }));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu báo giá.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddNewQuotation = () => {
        navigate('/admin/quotations/new');
    };

    const handleEditQuotation = (quotationId: string) => {
        navigate(`/admin/quotations/edit/${quotationId}`);
    };
    
    const handleViewQuotation = (quotationId: string) => {
        navigate(`/admin/quotations/edit/${quotationId}`);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa báo giá này?')) {
            try {
                await deleteQuotation(id);
                loadData();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa báo giá.');
            }
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Báo giá ({quotations.length})</h3>
                <Button onClick={handleAddNewQuotation} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Tạo Báo giá</Button>
            </div>
            <div className="admin-card-body">
                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead><tr><th>Mã BG</th><th>Khách hàng</th><th>Ngày tạo</th><th>Tổng tiền</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && quotations.length > 0 ? (
                                quotations.map(q => (
                                    <tr key={q.id}>
                                        <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{q.id.slice(-6)}</span></td>
                                        <td>{q.customerInfo?.name || 'N/A'}</td>
                                        <td>{new Date(q.creation_date).toLocaleDateString('vi-VN')}</td>
                                        <td className="font-semibold text-primary">{q.total_amount.toLocaleString('vi-VN')}₫</td>
                                        <td><span className={`status-badge ${getStatusColor(q.status)}`}>{q.status}</span></td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleViewQuotation(q.id)} size="sm" variant="outline" title="Xem/In"><i className="fas fa-eye"></i></Button>
                                                <Button onClick={() => handleEditQuotation(q.id)} size="sm" variant="outline" title="Sửa"><i className="fas fa-edit"></i></Button>
                                                <Button onClick={() => handleDelete(q.id)} size="sm" variant="ghost" className="text-red-500" title="Xóa"><i className="fas fa-trash"></i></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !error && <tr><td colSpan={6} className="text-center py-4 text-textMuted">Chưa có báo giá nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default QuotationManagementView;
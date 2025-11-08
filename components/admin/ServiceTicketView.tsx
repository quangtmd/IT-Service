import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceTicket } from '../../types';
import { getServiceTickets, deleteServiceTicket } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';

const getStatusColor = (status: ServiceTicket['status']) => {
    switch (status) {
        case 'Mới': return 'bg-blue-100 text-blue-800';
        case 'Đang xử lý': return 'bg-yellow-100 text-yellow-800';
        case 'Chờ linh kiện': return 'bg-purple-100 text-purple-800';
        case 'Hoàn thành': return 'bg-green-100 text-green-800';
        case 'Đã đóng': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const ServiceTicketView: React.FC = () => {
    const [tickets, setTickets] = useState<ServiceTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadTickets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getServiceTickets();
            setTickets(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu phiếu dịch vụ.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const handleAddNew = () => {
        navigate('/admin/service_tickets/new');
    };

    const handleEdit = (id: string) => {
        navigate(`/admin/service_tickets/edit/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa phiếu dịch vụ này?')) {
            try {
                await deleteServiceTicket(id);
                loadTickets();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa.');
            }
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Dịch vụ Sửa chữa ({tickets.length})</h3>
                 <Button onClick={handleAddNew} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Tạo Phiếu DV
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
                                <th>Thiết bị</th>
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && tickets.length > 0 ? ( tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">{ticket.ticket_code || ticket.id}</span></td>
                                    <td>{ticket.customer_info?.fullName || 'Khách lẻ'}</td>
                                    <td>{ticket.deviceName}</td>
                                    <td>{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td><span className={`status-badge ${getStatusColor(ticket.status)}`}>{ticket.status}</span></td>
                                    <td>
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleEdit(ticket.id)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                            <Button onClick={() => handleDelete(ticket.id)} size="sm" variant="ghost" className="text-red-500"><i className="fas fa-trash"></i></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                            ) : (
                                !error && <tr><td colSpan={6} className="text-center py-4 text-textMuted">Không có phiếu dịch vụ nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ServiceTicketView;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceTicket } from '../../types';
import { getServiceTickets, deleteServiceTicket } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';

const STATUS_FILTERS: Array<{ label: string, value: ServiceTicket['status'] | 'Tất cả' }> = [
    { label: 'Tất cả', value: 'Tất cả' },
    { label: 'Mới', value: 'Mới' },
    { label: 'Đang xử lý', value: 'Đang xử lý' },
    { label: 'Hoàn thành', value: 'Hoàn thành' },
    { label: 'Đã đóng', value: 'Đã đóng' },
    { label: 'Hủy bỏ', value: 'Hủy bỏ' },
];


const getStatusColorClass = (status: ServiceTicket['status']) => {
    switch (status) {
        case 'Mới':
        case 'Mới tiếp nhận':
            return 'text-blue-600 font-semibold';
        case 'Đang xử lý':
        case 'Chờ linh kiện':
        case 'Đợi KH đồng ý giá':
        case 'Đợi KH nhận lại':
            return 'text-yellow-600 font-semibold';
        case 'Hoàn thành':
            return 'text-green-600 font-semibold';
        case 'Đã đóng':
            return 'text-gray-600';
        case 'Không đồng ý sửa máy':
        case 'Hủy bỏ':
            return 'text-red-600 font-semibold';
        default:
            return 'text-gray-600';
    }
};

const ServiceTicketView: React.FC = () => {
    const [tickets, setTickets] = useState<ServiceTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<ServiceTicket['status'] | 'Tất cả'>('Tất cả');

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

    const filteredTickets = useMemo(() => {
        if (activeFilter === 'Tất cả') return tickets;
        return tickets.filter(t => t.status === activeFilter);
    }, [tickets, activeFilter]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent row click
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
                <h3 className="admin-card-title">Quản lý Phiếu Sửa Chữa ({filteredTickets.length})</h3>
                 <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => navigate('/admin/service_tickets/new')} leftIcon={<i className="fas fa-plus"></i>}>Thêm</Button>
                    <Button size="sm" variant="outline" leftIcon={<i className="fas fa-edit"></i>}>Sửa</Button>
                    <Button size="sm" variant="outline" leftIcon={<i className="fas fa-trash"></i>}>Xóa</Button>
                    <Button size="sm" variant="outline" leftIcon={<i className="fas fa-copy"></i>}>Sao chép</Button>
                    <Button size="sm" variant="outline" leftIcon={<i className="fas fa-print"></i>}>In ấn</Button>
                    <Button size="sm" variant="outline" leftIcon={<i className="fas fa-search"></i>}>Tìm kiếm</Button>
                </div>
            </div>
            <div className="admin-card-body">
                 <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-sm font-semibold mr-2">Trạng thái:</span>
                    {STATUS_FILTERS.map(filter => (
                         <Button key={filter.value} onClick={() => setActiveFilter(filter.value)} size="sm" variant={activeFilter === filter.value ? 'primary' : 'outline'} className="!font-normal">
                             {filter.label}
                         </Button>
                    ))}
                </div>

                {error && <BackendConnectionError error={error} />}
                <div className="overflow-x-auto">
                    <table className="admin-table text-sm">
                        <thead className="bg-red-800 text-white">
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
                            ) : !error && filteredTickets.length > 0 ? ( filteredTickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-yellow-50 cursor-pointer" onClick={() => navigate(`/admin/service_tickets/edit/${ticket.id}`)}>
                                    <td><span className="font-semibold text-blue-700">{ticket.ticket_code || ticket.id}</span></td>
                                    <td>{ticket.customer_info?.fullName || 'Khách lẻ'}</td>
                                    <td>{ticket.deviceName}</td>
                                    <td>{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td><span className={getStatusColorClass(ticket.status)}>{ticket.status}</span></td>
                                    <td>
                                        <div className="flex gap-2 justify-center">
                                            <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/service_tickets/edit/${ticket.id}`) }} className="text-blue-600" title="Sửa"><i className="fas fa-edit"></i></button>
                                            <button onClick={(e) => handleDelete(e, ticket.id)} className="text-red-600" title="Xóa"><i className="fas fa-times"></i></button>
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

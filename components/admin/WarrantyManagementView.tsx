import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { WarrantyTicket, WarrantyTicketStatus } from '../../types';
import { getWarrantyTickets, deleteWarrantyTicket } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';
import { useAuth } from '../../contexts/AuthContext';

const TICKET_STATUS_FILTERS: Array<{ label: string, value: WarrantyTicketStatus | 'Tất cả' }> = [
    { label: 'Tất cả', value: 'Tất cả' },
    { label: 'Chờ xem lại', value: 'Chờ xem lại' },
    { label: 'Lập chứng từ', value: 'Lập chứng từ' },
    { label: 'Chờ duyệt', value: 'Chờ duyệt' },
    { label: 'Đang duyệt', value: 'Đang duyệt' },
    { label: 'Đã duyệt', value: 'Đã duyệt' },
    { label: 'Đang thực hiện', value: 'Đang thực hiện' },
    { label: 'Hoàn thành', value: 'Hoàn thành' },
];

const getStatusColor = (status: WarrantyTicket['status']) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('duyệt')) return 'text-green-600 font-semibold';
    if (statusLower.includes('chờ')) return 'text-yellow-600 font-semibold';
    if (statusLower.includes('hủy') || statusLower.includes('từ chối')) return 'text-red-600 font-semibold';
    if (statusLower.includes('đang')) return 'text-blue-600 font-semibold';
    if (statusLower.includes('hoàn thành')) return 'text-purple-600 font-semibold';
    return 'text-gray-600';
};


const WarrantyManagementView: React.FC = () => {
    const [tickets, setTickets] = useState<WarrantyTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<WarrantyTicketStatus | 'Tất cả'>('Tất cả');
    const { users } = useAuth();
    const staffUsers = useMemo(() => users.filter(u => u.role === 'admin' || u.role === 'staff'), [users]);


    const loadTickets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getWarrantyTickets();
            // Denormalize creatorName if it's missing
            const enrichedData = data.map(ticket => {
                if (!ticket.creatorName && ticket.creatorId) {
                    const creator = staffUsers.find(u => u.id === ticket.creatorId);
                    return { ...ticket, creatorName: creator?.username || 'N/A' };
                }
                return ticket;
            });
            setTickets(enrichedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu phiếu bảo hành.');
        } finally {
            setIsLoading(false);
        }
    }, [staffUsers]);

    useEffect(() => {
        if (staffUsers.length > 0) {
            loadTickets();
        }
    }, [loadTickets, staffUsers]);

    const filteredTickets = useMemo(() => {
        if (activeFilter === 'Tất cả') return tickets;
        return tickets.filter(t => t.status === activeFilter);
    }, [tickets, activeFilter]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent row click navigation
        if (window.confirm('Bạn có chắc muốn xóa phiếu sửa chữa này?')) {
            try {
                await deleteWarrantyTicket(id);
                loadTickets();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa.');
            }
        }
    };
    
    const formatCurrency = (value?: number) => {
        if (typeof value !== 'number') return '0';
        return value.toLocaleString('vi-VN');
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Phiếu đề nghị sửa chữa, thay thế ({filteredTickets.length})</h3>
                <div className="admin-actions-bar">
                    <Button size="sm" onClick={() => navigate('/admin/warranty_tickets/new')} leftIcon={<i className="fas fa-plus"></i>}>Thêm</Button>
                    <Button size="sm" variant="outline" leftIcon={<i className="fas fa-print"></i>}>In</Button>
                    <Button size="sm" variant="outline" leftIcon={<i className="fas fa-search"></i>}>Tìm kiếm</Button>
                </div>
            </div>
            
            <div className="admin-card-body">
                <div className="filter-tabs">
                    {TICKET_STATUS_FILTERS.map(filter => (
                         <Button key={filter.value} onClick={() => setActiveFilter(filter.value)} size="sm" variant={activeFilter === filter.value ? 'primary' : 'outline'} className="!font-normal">
                             {filter.label}
                         </Button>
                    ))}
                </div>
                
                {error && <BackendConnectionError error={error} />}
                 <div className="overflow-x-auto">
                    <table className="admin-table text-sm">
                        <thead className="thead-brand">
                            <tr>
                                <th>Trạng thái</th>
                                <th>Số c/từ</th>
                                <th>Ngày c/từ</th>
                                <th>Người tiếp nhận</th>
                                <th>Diễn giải</th>
                                <th className="text-right">Tổng chi phí</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                             {isLoading ? (
                                <tr><td colSpan={7} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-yellow-50 cursor-pointer" onClick={() => navigate(`/admin/warranty_tickets/edit/${ticket.id}`)}>
                                        <td className={getStatusColor(ticket.status)}>{ticket.status}</td>
                                        <td className="font-semibold text-blue-700">{ticket.ticketNumber}</td>
                                        <td>{formatDate(ticket.createdAt)}</td>
                                        <td>{ticket.creatorName}</td>
                                        <td className="max-w-xs truncate">{ticket.reportedIssue}</td>
                                        <td className="text-right font-semibold">{formatCurrency(ticket.totalAmount)}</td>
                                        <td>
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/warranty_tickets/edit/${ticket.id}`) }} className="text-blue-600" title="Sửa"><i className="fas fa-edit"></i></button>
                                                <button onClick={(e) => handleDelete(e, ticket.id)} className="text-red-600" title="Xóa"><i className="fas fa-times"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !error && <tr><td colSpan={7} className="text-center py-4 text-textMuted">Không có phiếu nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default WarrantyManagementView;
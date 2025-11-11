import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { WarrantyTicket, WarrantyTicketStatus } from '../../types';
import { getWarrantyTickets, deleteWarrantyTicket } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';

const TICKET_STATUS_FILTERS: Array<{ label: string, value: WarrantyTicketStatus | 'Tất cả' }> = [
    { label: 'Tất cả', value: 'Tất cả' },
    { label: 'Mới Tạo', value: 'Mới Tạo' },
    { label: 'Chờ duyệt', value: 'Chờ duyệt' },
    { label: 'Đang sửa chữa', value: 'Đang sửa chữa' },
    { label: 'Hoàn thành', value: 'Hoàn thành' },
    { label: 'Đã trả khách', value: 'Đã trả khách' },
    { label: 'Hủy', value: 'Hủy' },
];


const WarrantyManagementView: React.FC = () => {
    const [tickets, setTickets] = useState<WarrantyTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<WarrantyTicketStatus | 'Tất cả'>('Tất cả');

    const loadTickets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getWarrantyTickets();
            setTickets(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu phiếu bảo hành.');
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
        e.stopPropagation(); // Prevent row click navigation
        if (window.confirm('Bạn có chắc muốn xóa phiếu bảo hành này?')) {
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

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric'})}`;
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Phiếu Báo Sửa Chữa, Thay Thế ({filteredTickets.length})</h3>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => navigate('/admin/warranty_tickets/new')} leftIcon={<i className="fas fa-plus"></i>}>Tạo Phiếu</Button>
                    <Button size="sm" variant="outline" leftIcon={<i className="fas fa-print"></i>}>In</Button>
                    <Button size="sm" variant="outline" leftIcon={<i className="fas fa-file-export"></i>}>Export</Button>
                </div>
            </div>
            
            <div className="admin-card-body">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {TICKET_STATUS_FILTERS.map(filter => (
                         <Button key={filter.value} onClick={() => setActiveFilter(filter.value)} size="sm" variant={activeFilter === filter.value ? 'primary' : 'outline'} className="!font-normal">
                             {filter.label}
                         </Button>
                    ))}
                </div>
                
                {error && <BackendConnectionError error={error} />}
                 <div className="overflow-x-auto">
                    <table className="admin-table text-sm">
                        <thead>
                            <tr>
                                <th>Trạng thái</th>
                                <th>Số phiếu</th>
                                <th>Ngày</th>
                                <th>Người tạo</th>
                                <th>Khách hàng</th>
                                <th>Diễn giải</th>
                                <th>Loại GD</th>
                                <th>Tổng tiền</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                             {isLoading ? (
                                <tr><td colSpan={9} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/warranty_tickets/edit/${ticket.id}`)}>
                                        <td><span className="text-red-600 font-semibold">{ticket.status}</span></td>
                                        <td className="text-blue-600 font-semibold">{ticket.ticketNumber}</td>
                                        <td>{formatDateTime(ticket.createdAt)}</td>
                                        <td>{ticket.creatorName}</td>
                                        <td>{ticket.customerName}</td>
                                        <td className="max-w-xs truncate">{ticket.reportedIssue}</td>
                                        <td>{ticket.transactionType}</td>
                                        <td className="text-right font-semibold">{formatCurrency(ticket.totalAmount)}₫</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/warranty_tickets/edit/${ticket.id}`) }} className="text-blue-600" title="Sửa"><i className="fas fa-edit"></i></button>
                                                <button onClick={(e) => handleDelete(e, ticket.id)} className="text-red-600" title="Xóa"><i className="fas fa-times"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !error && <tr><td colSpan={9} className="text-center py-4 text-textMuted">Không có phiếu nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default WarrantyManagementView;
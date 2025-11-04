import React, { useState, useEffect, useCallback } from 'react';
// Fix: Import the newly added ServiceTicket type.
import { ServiceTicket } from '../../types';
import { getServiceTickets } from '../../services/localDataService';
import Button from '../ui/Button';

const getStatusColor = (status: ServiceTicket['status']) => {
    switch (status) {
        case 'open': return 'bg-blue-100 text-blue-800';
        case 'in_progress': return 'bg-yellow-100 text-yellow-800';
        case 'awaiting_parts': return 'bg-purple-100 text-purple-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        case 'closed': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const ServiceTicketView: React.FC = () => {
    const [tickets, setTickets] = useState<ServiceTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);

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

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Dịch vụ Sửa chữa</h3>
            </div>
            <div className="admin-card-body">
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
                            ) : error ? (
                                <tr><td colSpan={6} className="text-center py-4 text-red-500">{error}</td></tr>
                            ) : tickets.length > 0 ? ( tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">{ticket.ticket_code}</span></td>
                                    <td>{ticket.customer_info?.fullName || 'Khách lẻ'}</td>
                                    <td>{ticket.device_name}</td>
                                    <td>{new Date(ticket.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td><span className={`status-badge ${getStatusColor(ticket.status)}`}>{ticket.status}</span></td>
                                    <td>
                                        <Button onClick={() => setSelectedTicket(ticket)} size="sm" variant="outline">Xem</Button>
                                    </td>
                                </tr>
                            ))
                            ) : (
                                <tr><td colSpan={6} className="text-center py-4 text-textMuted">Không có phiếu dịch vụ nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modal would go here */}
             {selectedTicket && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-panel">
                         <div className="admin-modal-header">
                            <h4 className="admin-modal-title">Chi tiết Phiếu DV: {selectedTicket.ticket_code}</h4>
                            <button type="button" onClick={() => setSelectedTicket(null)}>&times;</button>
                        </div>
                        <div className="admin-modal-body">
                            {/* Display ticket details here */}
                            <p><strong>Khách hàng:</strong> {selectedTicket.customer_info?.fullName}</p>
                            <p><strong>Thiết bị:</strong> {selectedTicket.device_name}</p>
                            <p><strong>Vấn đề báo cáo:</strong> {selectedTicket.reported_issue}</p>
                        </div>
                         <div className="admin-modal-footer">
                            <Button type="button" variant="primary" onClick={() => setSelectedTicket(null)}>Đóng</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceTicketView;

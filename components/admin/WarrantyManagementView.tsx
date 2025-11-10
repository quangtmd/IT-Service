import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { WarrantyTicket } from '../../types';
import { getWarrantyTickets, deleteWarrantyTicket } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';

const WarrantyManagementView: React.FC = () => {
    const [tickets, setTickets] = useState<WarrantyTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

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
        return `${date.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric'})} ${date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}`;
    };
    
    const formatDateOnly = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric'});
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">PHIẾU BẢO HÀNH</h2>
                    <p className="text-sm text-gray-500">Danh sách phiếu bảo hành máy ({tickets.length})</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => navigate('/admin/warranty_tickets/new')} className="bg-blue-600 hover:bg-blue-700 !py-1"><i className="fas fa-plus mr-1"></i>TẠO PHIẾU</Button>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 !py-1"><i className="fas fa-file-export mr-1"></i>EXPORT</Button>
                </div>
            </div>
            
            {/* Data Table */}
            {error && <BackendConnectionError error={error} />}
             <div className="overflow-x-auto">
                <table className="admin-table text-xs">
                    <thead>
                        <tr>
                            <th><input type="checkbox" /></th>
                            <th>#</th>
                            <th>Số phiếu</th>
                            <th>Model/Serial</th>
                            <th>Khách hàng</th>
                            <th>Người tạo</th>
                            <th>Số ĐT</th>
                            <th>Tổng tiền (VND)</th>
                            <th>Tình trạng</th>
                            <th>Ngày tạo</th>
                            <th>Mô tả lỗi</th>
                            <th>Ngày nhận/trả</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                         {isLoading ? (
                            <tr><td colSpan={13} className="text-center py-4">Đang tải...</td></tr>
                        ) : !error && tickets.length > 0 ? (
                            tickets.map((ticket, index) => (
                                <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/warranty_tickets/edit/${ticket.id}`)}>
                                    <td><input type="checkbox" onClick={e => e.stopPropagation()}/></td>
                                    <td>{index + 1}</td>
                                    <td className="text-blue-600 font-semibold">{ticket.ticketNumber}</td>
                                    <td>
                                        <p>{ticket.productModel}</p>
                                        <p className="text-gray-500">{ticket.productSerial}</p>
                                    </td>
                                    <td>{ticket.customerName}</td>
                                    <td>{ticket.creatorName}</td>
                                    <td>{ticket.customerPhone}</td>
                                    <td className="text-right">{formatCurrency(ticket.totalAmount)}</td>
                                    <td><span className="text-red-600 font-semibold">{ticket.status}</span></td>
                                    <td>{formatDateTime(ticket.createdAt)}</td>
                                    <td>{ticket.reportedIssue}</td>
                                    <td>
                                        <p>{formatDateOnly(ticket.receiveDate)}</p>
                                        <p>{formatDateOnly(ticket.returnDate)}</p>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/warranty_tickets/edit/${ticket.id}`) }} className="text-blue-600"><i className="fas fa-edit"></i></button>
                                            <button onClick={(e) => handleDelete(e, ticket.id)} className="text-red-600"><i className="fas fa-times"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            !error && <tr><td colSpan={13} className="text-center py-4 text-textMuted">Không có phiếu bảo hành nào.</td></tr>
                        )}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

export default WarrantyManagementView;
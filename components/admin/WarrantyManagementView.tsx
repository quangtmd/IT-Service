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

    const [filters, setFilters] = useState({
        ticketNumber: '',
        phone: '',
        productSerial: '',
        creationDate: '',
        status: 'Toàn bộ',
        isOverdue: false,
        customerName: '',
        warrantyCenter: ''
    });

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
        return tickets.filter(ticket => {
            return (
                (filters.ticketNumber ? ticket.ticketNumber.toLowerCase().includes(filters.ticketNumber.toLowerCase()) : true) &&
                (filters.phone ? ticket.customerPhone?.includes(filters.phone) : true) &&
                (filters.productSerial ? ticket.productSerial?.toLowerCase().includes(filters.productSerial.toLowerCase()) : true) &&
                (filters.customerName ? ticket.customerName.toLowerCase().includes(filters.customerName.toLowerCase()) : true) &&
                (filters.status !== 'Toàn bộ' ? ticket.status === filters.status : true)
            );
        });
    }, [tickets, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleResetFilters = () => {
        setFilters({
            ticketNumber: '', phone: '', productSerial: '', creationDate: '',
            status: 'Toàn bộ', isOverdue: false, customerName: '', warrantyCenter: ''
        });
    }

    const handleDelete = async (id: string) => {
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
                    <p className="text-sm text-gray-500">Danh sách phiếu bảo hành máy</p>
                </div>
                <div className="border-t-4 border-blue-600 w-1/4 h-1"></div>
            </div>

            {/* Filter Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                <div className="admin-form-group !mb-0"><label>Số phiếu</label><input type="text" name="ticketNumber" value={filters.ticketNumber} onChange={handleFilterChange} placeholder="Nhập số phiếu cần tra cứu..."/></div>
                <div className="admin-form-group !mb-0"><label>Số điện thoại</label><input type="text" name="phone" value={filters.phone} onChange={handleFilterChange} placeholder="Nhập số điện thoại..."/></div>
                <div className="admin-form-group !mb-0"><label>Mã sản phẩm</label><input type="text" name="productSerial" value={filters.productSerial} onChange={handleFilterChange} placeholder="Nhập mã Serial..."/></div>
                <div className="admin-form-group !mb-0"><label>Ngày tạo</label><input type="date" name="creationDate" value={filters.creationDate} onChange={handleFilterChange}/></div>
                <div className="admin-form-group !mb-0"><label>Tình trạng</label><select name="status" value={filters.status} onChange={handleFilterChange}><option>Toàn bộ</option><option>Mới Tạo</option><option>Đang xử lý</option><option>Hoàn thành</option></select></div>
                <div className="admin-form-group !mb-0 flex items-end"><label className="flex items-center"><input type="checkbox" name="isOverdue" checked={filters.isOverdue} onChange={handleFilterChange} className="mr-2"/> Trễ hạn</label></div>
                <div className="admin-form-group !mb-0"><label>Khách hàng</label><input type="text" name="customerName" value={filters.customerName} onChange={handleFilterChange} placeholder="Nhập tên khách hàng..."/></div>
                <div className="admin-form-group !mb-0"><label>Trạm BH</label><select name="warrantyCenter" value={filters.warrantyCenter} onChange={handleFilterChange}><option>--chọn--</option></select></div>
                 <div className="flex items-end">
                     <Button variant="primary" size="sm" className="bg-green-600 hover:bg-green-700 !py-2 w-full">
                        <i className="fas fa-search mr-1"></i> TRA CỨU...
                    </Button>
                 </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => navigate('/admin/warranty_tickets/new')} className="bg-blue-600 hover:bg-blue-700 !py-1"><i className="fas fa-plus mr-1"></i>TẠO PHIẾU</Button>
                <Button size="sm" variant="outline" onClick={handleResetFilters} className="!py-1"><i className="fas fa-sync-alt mr-1"></i>RESET</Button>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 !py-1"><i className="fas fa-file-export mr-1"></i>EXPORT</Button>
            </div>

            {/* Data Table */}
            {error && <BackendConnectionError error={error} />}
             <div className="overflow-x-auto">
                <p className="text-sm text-gray-600 mb-2">1 - {filteredTickets.length} of {filteredTickets.length}</p>
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
                        ) : !error && filteredTickets.length > 0 ? (
                            filteredTickets.map((ticket, index) => (
                                <tr key={ticket.id}>
                                    <td><input type="checkbox"/></td>
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
                                            <button onClick={() => navigate(`/admin/warranty_tickets/edit/${ticket.id}`)} className="text-blue-600"><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleDelete(ticket.id)} className="text-red-600"><i className="fas fa-times"></i></button>
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
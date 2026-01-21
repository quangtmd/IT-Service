import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceTicket, ServiceTicketStatus } from '../../types';
import { getServiceTickets, deleteServiceTicket } from '../../services/localDataService';
import Button from '../ui/Button';
import BackendConnectionError from '../shared/BackendConnectionError';
import Pagination from '../shared/Pagination';
import { MOCK_TICKETS } from '../../data/mockData';

const getStatusColor = (status: ServiceTicketStatus) => {
    const colors: Record<ServiceTicketStatus, string> = {
        'Đã duyệt': 'bg-green-100 text-green-800',
        'Chờ duyệt': 'bg-yellow-100 text-yellow-800',
        'Hoàn thành': 'bg-blue-100 text-blue-800',
        'Đang thực hiện': 'bg-indigo-100 text-indigo-800',
        'Chờ xử lý': 'bg-orange-100 text-orange-800',
        'Lập chứng từ': 'bg-cyan-100 text-cyan-800',
        'Đang duyệt': 'bg-purple-100 text-purple-800',
        'Khác': 'bg-gray-100 text-gray-800',
        'Mới': 'bg-blue-100 text-blue-800',
        'Chờ linh kiện': 'bg-purple-100 text-purple-800',
        'Đã đóng': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

const STATUS_FILTERS: { label: string, status: ServiceTicketStatus | 'Tất cả' }[] = [
    { label: 'Chờ bạn xử lý', status: 'Chờ xử lý' },
    { label: 'Tất cả', status: 'Tất cả' },
    { label: 'Lập chứng từ', status: 'Lập chứng từ' },
    { label: 'Chờ duyệt', status: 'Chờ duyệt' },
    { label: 'Đang duyệt', status: 'Đang duyệt' },
    { label: 'Đã duyệt', status: 'Đã duyệt' },
    { label: 'Khác', status: 'Khác' },
];

const ITEMS_PER_PAGE = 25;



const ServiceTicketView: React.FC = () => {
    const [allTickets, setAllTickets] = useState<ServiceTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const [activeFilter, setActiveFilter] = useState<ServiceTicketStatus | 'Tất cả'>('Tất cả');
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(MOCK_TICKETS[0]?.id || null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const loadTickets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // const data = await getServiceTickets();
            // Using mock data for now to match UI
            const data = MOCK_TICKETS;
            setAllTickets(data);
            if (data.length > 0) {
                setSelectedTicketId(data[0].id);
            }
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
        return allTickets
            .filter(ticket => activeFilter === 'Tất cả' || ticket.status === activeFilter)
            .filter(ticket => ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.recipientName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allTickets, activeFilter, searchTerm]);

    const paginatedTickets = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTickets, currentPage]);
    
    const selectedTicket = useMemo(() => allTickets.find(t => t.id === selectedTicketId), [allTickets, selectedTicketId]);
    const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
    const pageTotalCost = useMemo(() => paginatedTickets.reduce((sum, t) => sum + t.totalCost, 0), [paginatedTickets]);
    const pageTotalQuantity = useMemo(() => paginatedTickets.reduce((sum, t) => sum + t.totalQuantity, 0), [paginatedTickets]);


    const handleAddNew = () => navigate('/admin/service_tickets/new');
    const handleEdit = () => selectedTicketId && navigate(`/admin/service_tickets/edit/${selectedTicketId}`);
    const handleDelete = async () => {
        if (selectedTicketId && window.confirm('Bạn có chắc muốn xóa phiếu này?')) {
            // await deleteServiceTicket(selectedTicketId);
            // loadTickets();
            alert("Chức năng xóa đang được phát triển.");
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Phiếu báo đề nghị sửa chữa, thay thế</h2>

            {/* Status Filters */}
            <div className="flex items-center border-b mb-2">
                {STATUS_FILTERS.map(f => (
                    <button key={f.label} onClick={() => setActiveFilter(f.status)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeFilter === f.status ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 py-2">
                <Button onClick={handleAddNew} size="sm" variant="primary" leftIcon={<i className="fas fa-plus"></i>}>Thêm</Button>
                <Button onClick={handleEdit} size="sm" variant="outline" leftIcon={<i className="fas fa-edit"></i>} disabled={!selectedTicketId}>Sửa</Button>
                <Button onClick={handleDelete} size="sm" variant="outline" leftIcon={<i className="fas fa-trash"></i>} disabled={!selectedTicketId}>Xóa</Button>
                <Button size="sm" variant="outline" leftIcon={<i className="fas fa-copy"></i>} disabled={!selectedTicketId}>Sao chép</Button>
                <Button size="sm" variant="outline" leftIcon={<i className="fas fa-print"></i>}>In ấn</Button>
                <div className="relative ml-auto">
                    <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="admin-form-group !py-1.5 !pl-8 !text-sm" />
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-grow overflow-auto border rounded-md">
                <table className="admin-table w-full text-xs">
                    <thead className="sticky top-0 bg-gray-100 z-10">
                        <tr>
                            <th>Đơn vị</th><th>Trạng thái</th><th>Số c/từ</th><th>Ngày c/từ</th>
                            <th>Người tiếp nhận</th><th>Ngoại tệ</th><th>Tên người tiếp nhận</th><th>Mã bộ phận</th>
                            <th>Diễn giải</th><th>Tổng chi phí</th><th>Số lượng</th><th>Giao dịch</th>
                        </tr>
                        <tr className="bg-gray-200 font-bold">
                            <td colSpan={9}></td>
                            <td className="text-right">{pageTotalCost.toLocaleString('vi-VN')}</td>
                            <td className="text-right">{pageTotalQuantity.toLocaleString('vi-VN')}</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={12} className="text-center py-4">Đang tải...</td></tr>
                        ) : paginatedTickets.map(ticket => (
                            <tr key={ticket.id} onClick={() => setSelectedTicketId(ticket.id)} className={`cursor-pointer ${selectedTicketId === ticket.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                                <td>{ticket.unit}</td>
                                <td><span className={`status-badge ${getStatusColor(ticket.status)}`}>{ticket.status}</span></td>
                                <td>{ticket.id}</td>
                                <td>{new Date(ticket.voucherDate).toLocaleDateString('vi-VN')}</td>
                                <td>{ticket.recipientCode}</td>
                                <td>{ticket.currency}</td>
                                <td>{ticket.recipientName}</td>
                                <td>{ticket.departmentCode}</td>
                                <td>{ticket.notes}</td>
                                <td className="text-right font-semibold">{ticket.totalCost.toLocaleString('vi-VN')}</td>
                                <td className="text-right">{ticket.totalQuantity}</td>
                                <td>{ticket.transactionType}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center pt-2 text-sm">
                 <p>1-{paginatedTickets.length} trong {filteredTickets.length}</p>
                 <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>


            {/* Detail Grid */}
            <div className="mt-4 border-t pt-4">
                <div className="flex items-center gap-4 text-sm mb-2">
                     <button className="text-primary font-semibold">Kết xuất dữ liệu</button>
                     <button className="text-primary font-semibold">Cố định cột</button>
                </div>
                <div className="overflow-auto border rounded-md max-h-48">
                    <table className="admin-table w-full text-xs">
                        <thead className="sticky top-0 bg-gray-100">
                             <tr>
                                <th>Mã thiết bị</th><th>Tên thiết bị</th><th>Nội dung</th><th>Số lượng</th>
                                <th>Giá VND</th><th>Chi phí dự trù VND</th><th>Bộ phận</th><th>Vụ việc</th>
                                <th>Hợp đồng</th><th>Đợt thanh toán</th>
                            </tr>
                        </thead>
                         <tbody>
                            {selectedTicket && selectedTicket.details.map(detail => (
                                <tr key={detail.id}>
                                    <td>{detail.deviceId}</td>
                                    <td>{detail.deviceName}</td>
                                    <td>{detail.content}</td>
                                    <td className="text-right">{detail.quantity}</td>
                                    <td className="text-right">{detail.priceVND.toLocaleString('vi-VN')}</td>
                                    <td className="text-right">{detail.estimatedCostVND.toLocaleString('vi-VN')}</td>
                                    <td>{detail.department}</td>
                                    <td>{detail.case}</td>
                                    <td>{detail.contract}</td>
                                    <td>{detail.paymentPhase}</td>
                                </tr>
                            ))}
                             {!selectedTicket && (
                                <tr><td colSpan={10} className="text-center text-gray-500 py-4">Chọn một phiếu để xem chi tiết.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ServiceTicketView;
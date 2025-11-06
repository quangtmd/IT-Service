import React, { useState, useEffect, useCallback } from 'react';
import { ServiceTicket } from '../../types';
import { getServiceTickets, addServiceTicket, updateServiceTicket, deleteServiceTicket } from '../../services/localDataService';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const getStatusColor = (status: ServiceTicket['status']) => {
    switch (status) {
        case 'Đã tiếp nhận': return 'bg-blue-100 text-blue-800';
        case 'Đang chẩn đoán': return 'bg-yellow-100 text-yellow-800';
        case 'Đang sửa chữa': return 'bg-indigo-100 text-indigo-800';
        case 'Chờ linh kiện': return 'bg-purple-100 text-purple-800';
        case 'Sẵn sàng trả': return 'bg-green-100 text-green-800';
        case 'Đã trả khách': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const ServiceTicketView: React.FC = () => {
    const [tickets, setTickets] = useState<ServiceTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    const loadTickets = useCallback(async () => {
        setIsLoading(true); setError(null);
        try {
            const data = await getServiceTickets();
            setTickets(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu phiếu dịch vụ.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadTickets(); }, [loadTickets]);

    const handleSave = async (data: Omit<ServiceTicket, 'id'> & {id?: string}) => {
        try {
            if(data.id) {
                await updateServiceTicket(data.id, data);
            } else {
                await addServiceTicket(data as Omit<ServiceTicket, 'id'>);
            }
            loadTickets();
        } catch (err) {
            alert("Lỗi khi lưu phiếu dịch vụ.");
        } finally {
            setIsFormModalOpen(false);
            setSelectedTicket(null);
        }
    };

    const handleDelete = async (id: string) => {
        if(window.confirm('Bạn có chắc muốn xóa phiếu dịch vụ này?')) {
            try {
                await deleteServiceTicket(id);
                loadTickets();
            } catch (err) {
                alert("Lỗi khi xóa phiếu.");
            }
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Dịch vụ Sửa chữa</h3>
                <Button onClick={() => { setSelectedTicket(null); setIsFormModalOpen(true); }} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Phiếu</Button>
            </div>
            <div className="admin-card-body">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead><tr><th>Mã Phiếu</th><th>Khách hàng</th><th>Thiết bị</th><th>Ngày tạo</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                        <tbody>
                            {isLoading ? ( <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                            ) : error ? ( <tr><td colSpan={6} className="text-center py-4 text-red-500">{error}</td></tr>
                            ) : tickets.length > 0 ? ( tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">{ticket.ticket_code}</span></td>
                                    <td>{ticket.customer_info?.fullName || 'Khách lẻ'}</td>
                                    <td>{ticket.device_info.name}</td>
                                    <td>{new Date(ticket.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td><span className={`status-badge ${getStatusColor(ticket.status)}`}>{ticket.status}</span></td>
                                    <td>
                                        <div className="flex gap-2">
                                            <Button onClick={() => { setSelectedTicket(ticket); setIsFormModalOpen(true); }} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                            <Button onClick={() => handleDelete(ticket.id)} size="sm" variant="ghost" className="text-red-500"><i className="fas fa-trash"></i></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                            ) : ( <tr><td colSpan={6} className="text-center py-4 text-textMuted">Không có phiếu dịch vụ nào.</td></tr> )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
             {isFormModalOpen && <ServiceTicketFormModal ticket={selectedTicket} onSave={handleSave} onClose={() => setIsFormModalOpen(false)} />}
        </div>
    );
};

// --- Form Modal ---
interface ServiceTicketFormModalProps {
    ticket: ServiceTicket | null;
    onSave: (data: Omit<ServiceTicket, 'id'> & {id?: string}) => void;
    onClose: () => void;
}
const ServiceTicketFormModal: React.FC<ServiceTicketFormModalProps> = ({ ticket, onSave, onClose }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState<Partial<ServiceTicket>>(ticket || {
        ticket_code: `DV-${Date.now().toString().slice(-6)}`,
        created_at: new Date().toISOString(),
        status: 'Đã tiếp nhận',
        received_by: currentUser?.id,
        service_type: 'Sửa chữa Dịch vụ',
        customer_info: { fullName: '', phone: '' },
        device_info: { name: '', type: 'Khác' },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');
        if(field) {
            setFormData(p => ({ ...p, [section]: { ...(p as any)[section], [field]: value } }));
        } else {
            setFormData(p => ({ ...p, [name]: value }));
        }
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData as any); };

    return (
        <div className="admin-modal-overlay">
            <form onSubmit={handleSubmit} className="admin-modal-panel max-w-3xl">
                <div className="admin-modal-header"><h4 className="admin-modal-title">{formData.id ? 'Sửa Phiếu Dịch vụ' : 'Tạo Phiếu Dịch vụ'}</h4><button type="button" onClick={onClose}>&times;</button></div>
                <div className="admin-modal-body">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h5 className="admin-form-subsection-title">Thông tin Khách hàng</h5>
                            <div className="admin-form-group"><label>Họ tên *</label><input type="text" name="customer_info.fullName" value={formData.customer_info?.fullName} onChange={handleChange} required /></div>
                            <div className="admin-form-group"><label>Số điện thoại *</label><input type="tel" name="customer_info.phone" value={formData.customer_info?.phone} onChange={handleChange} required /></div>
                        </div>
                         <div>
                            <h5 className="admin-form-subsection-title">Thông tin Phiếu</h5>
                            <div className="admin-form-group"><label>Mã phiếu</label><input type="text" name="ticket_code" value={formData.ticket_code} onChange={handleChange} readOnly /></div>
                             <div className="admin-form-group"><label>Loại hình Dịch vụ</label>
                                <select name="service_type" value={formData.service_type} onChange={handleChange}>
                                    <option value="Sửa chữa Dịch vụ">Sửa chữa Dịch vụ</option>
                                    <option value="Bảo hành Cửa hàng">Bảo hành Cửa hàng</option>
                                    <option value="Bảo hành Hãng">Bảo hành Hãng</option>
                                </select>
                            </div>
                        </div>
                     </div>
                     <h5 className="admin-form-subsection-title mt-4">Thông tin Thiết bị</h5>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="admin-form-group"><label>Tên thiết bị *</label><input type="text" name="device_info.name" value={formData.device_info?.name} onChange={handleChange} required /></div>
                        <div className="admin-form-group"><label>Loại thiết bị</label>
                            <select name="device_info.type" value={formData.device_info?.type} onChange={handleChange}>
                                <option>Laptop</option><option>PC</option><option>Màn hình</option><option>Linh kiện</option><option>Khác</option>
                            </select>
                        </div>
                     </div>
                     <div className="admin-form-group"><label>Tình trạng vật lý (trầy xước, móp méo...)</label><textarea name="physical_condition" value={formData.physical_condition || ''} onChange={handleChange} rows={2}></textarea></div>
                     <div className="admin-form-group"><label>Phụ kiện đi kèm (sạc, dây...)</label><input type="text" name="accessories" value={formData.accessories || ''} onChange={handleChange} /></div>
                     <div className="admin-form-group"><label>Vấn đề khách hàng báo cáo *</label><textarea name="reported_issue" value={formData.reported_issue || ''} onChange={handleChange} required rows={3}></textarea></div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                    <Button type="submit">Lưu Phiếu</Button>
                </div>
            </form>
        </div>
    );
}

export default ServiceTicketView;
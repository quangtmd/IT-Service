import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ServiceTicket, User } from '../../types';
import Button from '../../components/ui/Button';
import { getServiceTickets, addServiceTicket, updateServiceTicket } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';


const STATUS_OPTIONS: Array<ServiceTicket['status']> = ['Mới', 'Đang xử lý', 'Chờ linh kiện', 'Hoàn thành', 'Đã đóng'];

const ServiceTicketFormPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const isEditing = !!ticketId;
    const { users } = useAuth();
    const staffUsers = users.filter(u => u.role === 'admin' || u.role === 'staff');

    const [formData, setFormData] = useState<Partial<ServiceTicket> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const loadTicket = async () => {
            if (isEditing) {
                try {
                    const tickets = await getServiceTickets();
                    const ticketToEdit = tickets.find(t => t.id === ticketId);
                    if (ticketToEdit) {
                        setFormData(ticketToEdit);
                    } else {
                        setError("Không tìm thấy phiếu dịch vụ.");
                    }
                } catch(err) {
                    setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu.");
                } finally {
                    setIsLoading(false);
                }
            } else {
                setFormData({
                    deviceName: '', deviceType: '', status: 'Mới', reportedIssue: '',
                    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
                    customer_info: { fullName: '', phone: '', address: ''}
                });
                setIsLoading(false);
            }
        };
        loadTicket();
    }, [isEditing, ticketId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({...prev, [name]: value}) : null);
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({...prev, customer_info: {...prev.customer_info, [name]: value} as any}) : null);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData) return;
        try {
            if (isEditing) {
                await updateServiceTicket(ticketId!, formData);
                alert("Cập nhật thành công!");
            } else {
                await addServiceTicket(formData as Omit<ServiceTicket, 'id'>);
                alert("Tạo phiếu mới thành công!");
            }
            navigate('/admin/service_tickets');
        } catch (err) {
             alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu.');
        }
    };

    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;
    
    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">{isEditing ? `Chỉnh sửa Phiếu DV #${formData.ticket_code}` : 'Tạo Phiếu Dịch Vụ Mới'}</h3>
                </div>
                <div className="admin-card-body">
                    <div className="admin-form-subsection-title">Thông tin khách hàng</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="admin-form-group"><label>Tên khách hàng *</label><input type="text" name="fullName" value={formData.customer_info?.fullName || ''} onChange={handleCustomerChange} required/></div>
                        <div className="admin-form-group"><label>Số điện thoại *</label><input type="tel" name="phone" value={formData.customer_info?.phone || ''} onChange={handleCustomerChange} required/></div>
                        <div className="admin-form-group md:col-span-2"><label>Địa chỉ</label><input type="text" name="address" value={formData.customer_info?.address || ''} onChange={handleCustomerChange}/></div>
                    </div>
                    
                    <div className="admin-form-subsection-title">Thông tin thiết bị</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="admin-form-group"><label>Tên thiết bị *</label><input type="text" name="deviceName" value={formData.deviceName || ''} onChange={handleChange} required/></div>
                        <div className="admin-form-group"><label>Loại thiết bị</label><input type="text" name="deviceType" value={formData.deviceType || ''} onChange={handleChange}/></div>
                        <div className="admin-form-group md:col-span-2"><label>Số Serial</label><input type="text" name="serialNumber" value={formData.serialNumber || ''} onChange={handleChange}/></div>
                        <div className="admin-form-group md:col-span-2"><label>Mô tả sự cố *</label><textarea name="reportedIssue" value={formData.reportedIssue || ''} onChange={handleChange} rows={3} required></textarea></div>
                    </div>

                    <div className="admin-form-subsection-title">Thông tin dịch vụ</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="admin-form-group"><label>Trạng thái</label><select name="status" value={formData.status || 'Mới'} onChange={handleChange}>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                         <div className="admin-form-group"><label>Nhân viên phụ trách</label><select name="assignedTo" value={formData.assignedTo || ''} onChange={handleChange}><option value="">-- Chọn --</option>{staffUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}</select></div>
                         <div className="admin-form-group"><label>Chi phí (dự kiến)</label><input type="number" name="cost" value={formData.cost || 0} onChange={handleChange}/></div>
                    </div>
                     <div className="admin-form-group"><label>Ghi chú</label><textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={4}></textarea></div>
                </div>

                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/service_tickets')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu Phiếu Dịch Vụ</Button>
                </div>
            </form>
        </div>
    );
};

export default ServiceTicketFormPage;

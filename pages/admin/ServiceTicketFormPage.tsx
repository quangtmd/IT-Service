import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ServiceTicket, User, SiteSettings } from '../../types';
import Button from '../../components/ui/Button';
import { getServiceTickets, addServiceTicket, updateServiceTicket } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';
import * as Constants from '../../constants';


const STATUS_OPTIONS: Array<ServiceTicket['status']> = ['Mới', 'Đang xử lý', 'Chờ linh kiện', 'Hoàn thành', 'Đã đóng'];

const ServiceTicketFormPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const { users } = useAuth();
    const isEditing = !!ticketId;

    const [formData, setFormData] = useState<Partial<ServiceTicket> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);

    const staffUsers = users.filter(u => u.role === 'admin' || u.role === 'staff');

    useEffect(() => {
        const loadData = async () => {
             const settingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
             setSiteSettings(settingsRaw ? JSON.parse(settingsRaw) : Constants.INITIAL_SITE_SETTINGS);

            if (isEditing) {
                setIsLoading(true);
                setError(null);
                try {
                    const allData = await getServiceTickets();
                    const itemToEdit = allData.find(t => t.id === ticketId);
                    if (itemToEdit) {
                        setFormData(itemToEdit);
                    } else {
                        setError('Không tìm thấy phiếu dịch vụ để chỉnh sửa.');
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setFormData({
                    customer_info: { fullName: '', phone: '' },
                    deviceName: '',
                    reported_issue: '',
                    status: 'Mới',
                });
                setIsLoading(false);
            }
        };
        loadData();
    }, [isEditing, ticketId]);

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };
    
    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, customer_info: { ...prev.customer_info!, [name]: value } }) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        try {
            if (isEditing) {
                await updateServiceTicket(ticketId!, formData);
                alert('Cập nhật phiếu dịch vụ thành công!');
            } else {
                await addServiceTicket(formData as Omit<ServiceTicket, 'id' | 'createdAt' | 'ticket_code'>);
                alert('Tạo phiếu dịch vụ mới thành công!');
            }
            navigate('/admin/service_tickets');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu.');
        }
    };
    
    const handlePrint = () => {
        window.print();
    };

    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header flex justify-between items-center no-print">
                    <h3 className="admin-card-title">{isEditing ? `Sửa Phiếu DV #${formData.ticket_code}` : 'Tạo Phiếu Dịch Vụ Mới'}</h3>
                    <div>
                        <Button type="button" variant="outline" onClick={handlePrint} className="mr-2" leftIcon={<i className="fas fa-print"></i>}>In Phiếu</Button>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/service_tickets')}>Hủy</Button>
                    </div>
                </div>
                <div className="admin-card-body print-wrapper">
                   <div className="print-container max-w-2xl mx-auto p-4 bg-white">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold uppercase">{siteSettings.companyName}</h2>
                            <p className="text-sm">{siteSettings.companyAddress}</p>
                            <p className="text-sm">ĐT: {siteSettings.companyPhone}</p>
                        </div>
                        <h2 className="text-xl font-bold mb-4 text-center uppercase">Phiếu Biên Nhận Dịch Vụ</h2>
                        
                        <div className="text-right text-sm mb-4">
                            <p>Số: <span className="font-semibold">{formData.ticket_code || '...'}</span></p>
                            <p>Ngày: <span className="font-semibold">{new Date(formData.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span></p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="admin-form-group no-print">
                                <label>Tên khách hàng *</label>
                                <input type="text" name="fullName" value={formData.customer_info?.fullName || ''} onChange={handleCustomerChange} required />
                            </div>
                             <div className="admin-form-group no-print">
                                <label>Số điện thoại *</label>
                                <input type="tel" name="phone" value={formData.customer_info?.phone || ''} onChange={handleCustomerChange} required />
                            </div>
                        </div>
                         <div className="border-t border-b border-dashed border-black py-2 mb-4 text-sm">
                            <p><strong>Khách hàng:</strong> {formData.customer_info?.fullName}</p>
                            <p><strong>Điện thoại:</strong> {formData.customer_info?.phone}</p>
                         </div>

                        <div className="admin-form-group no-print">
                            <label>Tên thiết bị</label>
                            <input type="text" name="deviceName" value={formData.deviceName || ''} onChange={handleChange} />
                        </div>
                         <p className="text-sm print-only"><strong>Thiết bị:</strong> {formData.deviceName}</p>

                        <div className="admin-form-group sm:col-span-2 no-print">
                            <label>Mô tả sự cố/yêu cầu</label>
                            <textarea name="reported_issue" value={formData.reported_issue || ''} onChange={handleChange} rows={4}></textarea>
                        </div>
                        <p className="text-sm print-only"><strong>Tình trạng/Yêu cầu:</strong> {formData.reported_issue}</p>
                        
                        <div className="grid grid-cols-2 gap-4 no-print mt-4">
                            <div className="admin-form-group">
                                <label>Trạng thái</label>
                                <select name="status" value={formData.status || 'Mới'} onChange={handleChange}>
                                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label>Nhân viên phụ trách</label>
                                <select name="assigneeId" value={formData.assigneeId || ''} onChange={handleChange}>
                                    <option value="">-- Chưa gán --</option>
                                    {staffUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                                </select>
                            </div>
                        </div>
                        
                         <div className="mt-16 grid grid-cols-2 gap-4 text-center text-sm">
                            <div><p className="font-bold">Khách hàng</p><p>(Ký & ghi rõ họ tên)</p></div>
                            <div><p className="font-bold">Nhân viên tiếp nhận</p><p>(Ký & ghi rõ họ tên)</p></div>
                        </div>
                   </div>
                </div>
                <div className="admin-modal-footer no-print">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/service_tickets')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </form>
        </div>
    );
};

export default ServiceTicketFormPage;
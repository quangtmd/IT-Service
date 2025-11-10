import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ServiceTicket, ServiceTicketDetailItem, User, SiteSettings, SERVICE_TICKET_STATUS_OPTIONS } from '../../types';
import Button from '../../components/ui/Button';
import { addServiceTicket, updateServiceTicket } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';
import * as Constants from '../../constants';
import { MOCK_TICKETS } from '../../data/mockData';


const InfoItem: React.FC<{ label: string; value?: string | number | null; className?: string }> = ({ label, value, className }) => (
    <div className={className}>
        <p className="text-xs text-textMuted">{label}</p>
        <p className="text-sm font-medium text-textBase">{value || 'N/A'}</p>
    </div>
);

const ServiceTicketFormPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const { users } = useAuth();
    const isEditing = !!ticketId;

    const [formData, setFormData] = useState<Partial<ServiceTicket> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const staffUsers = useMemo(() => users.filter(u => u.role === 'admin' || u.role === 'staff'), [users]);

    useEffect(() => {
        const loadData = async () => {
            if (isEditing) {
                setIsLoading(true);
                setError(null);
                try {
                    const allData = MOCK_TICKETS; // Use mock data to fix inconsistency
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
                    id: `BDN.${new Date().getFullYear().toString().slice(-2)}.${(new Date().getMonth() + 1).toString().padStart(2, '0')}.XXX`,
                    unit: 'CTV',
                    status: 'Chờ duyệt',
                    voucherDate: new Date().toISOString().split('T')[0],
                    recipientCode: '',
                    recipientName: '',
                    currency: 'VND',
                    notes: '',
                    transactionType: 'Sửa chữa',
                    details: [],
                    customer_info: { fullName: '', phone: '' },
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
    
    const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            if (!prev) return null;
            const newCustomerInfo = { ...prev.customer_info, [name]: value };
            return { ...prev, customer_info: newCustomerInfo as { fullName: string, phone: string } };
        });
    };

    const handleDetailChange = (index: number, field: keyof ServiceTicketDetailItem, value: string | number) => {
        if (!formData || !formData.details) return;
        const newDetails = [...formData.details];
        (newDetails[index] as any)[field] = value;
        setFormData(prev => prev ? { ...prev, details: newDetails } : null);
    };

    const addDetailItem = () => {
        if (!formData) return;
        const newItem: ServiceTicketDetailItem = {
            id: `detail-${Date.now()}`,
            deviceId: '', deviceName: '', content: '', quantity: 1,
            priceVND: 0, estimatedCostVND: 0,
        };
        setFormData(prev => prev ? ({ ...prev, details: [...(prev.details || []), newItem] }) : null);
    };
    
    const removeDetailItem = (index: number) => {
        if (!formData || !formData.details) return;
        const newDetails = formData.details.filter((_, i) => i !== index);
        setFormData(prev => prev ? { ...prev, details: newDetails } : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        // Recalculate totals before saving
        const totalCost = formData.details?.reduce((sum, d) => sum + d.estimatedCostVND, 0) || 0;
        const totalQuantity = formData.details?.reduce((sum, d) => sum + d.quantity, 0) || 0;
        const finalData = { ...formData, totalCost, totalQuantity };

        try {
            if (isEditing) {
                // await updateServiceTicket(ticketId!, finalData as ServiceTicket);
                alert('Cập nhật phiếu dịch vụ thành công! (Simulated)');
            } else {
                // await addServiceTicket(finalData as Omit<ServiceTicket, 'id'>);
                alert('Tạo phiếu dịch vụ mới thành công! (Simulated)');
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
                    <h3 className="admin-card-title">{isEditing ? `Chỉnh sửa Phiếu #${formData.id}` : 'Tạo Phiếu Dịch Vụ Mới'}</h3>
                    <div className="flex gap-2">
                         <Button type="button" variant="outline" onClick={handlePrint} className="mr-2" leftIcon={<i className="fas fa-print"></i>}>In Phiếu</Button>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/service_tickets')}>Hủy</Button>
                        <Button type="submit" variant="primary">Lưu</Button>
                    </div>
                </div>
                <div className="admin-card-body admin-product-form-page-body print-wrapper">
                    <div className="print-container">
                        <h4 className="admin-form-subsection-title">Thông tin chung</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="admin-form-group"><label>Số c/từ</label><input type="text" name="id" value={formData.id || ''} onChange={handleChange} disabled={isEditing} /></div>
                            <div className="admin-form-group"><label>Ngày c/từ</label><input type="date" name="voucherDate" value={formData.voucherDate?.split('T')[0] || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group"><label>Trạng thái</label>
                                <select name="status" value={formData.status || ''} onChange={handleChange}>
                                    {SERVICE_TICKET_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group"><label>Tên khách hàng</label><input type="text" name="fullName" value={formData.customer_info?.fullName || ''} onChange={handleCustomerInfoChange} /></div>
                            <div className="admin-form-group"><label>SĐT khách hàng</label><input type="text" name="phone" value={formData.customer_info?.phone || ''} onChange={handleCustomerInfoChange} /></div>
                            <div className="admin-form-group"><label>Đơn vị</label><input type="text" name="unit" value={formData.unit || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group"><label>Tên người tiếp nhận</label><input type="text" name="recipientName" value={formData.recipientName || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group"><label>Mã bộ phận</label><input type="text" name="departmentCode" value={formData.departmentCode || ''} onChange={handleChange} /></div>
                            <div className="admin-form-group md:col-span-3"><label>Diễn giải</label><textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={2}></textarea></div>
                        </div>
                        
                        <h4 className="admin-form-subsection-title">Chi tiết Phiếu</h4>
                        <div className="overflow-x-auto">
                            <table className="admin-table w-full text-xs">
                                <thead>
                                    <tr>
                                        <th>Mã TB</th><th>Tên TB</th><th>Nội dung</th><th>SL</th><th>Giá</th><th>Chi phí DK</th><th className="no-print">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(formData.details || []).map((detail, index) => (
                                        <tr key={index}>
                                            <td><input type="text" value={detail.deviceId} onChange={(e) => handleDetailChange(index, 'deviceId', e.target.value)} className="admin-form-group !p-1 w-24"/></td>
                                            <td><input type="text" value={detail.deviceName} onChange={(e) => handleDetailChange(index, 'deviceName', e.target.value)} className="admin-form-group !p-1 w-32"/></td>
                                            <td><input type="text" value={detail.content} onChange={(e) => handleDetailChange(index, 'content', e.target.value)} className="admin-form-group !p-1 w-40"/></td>
                                            <td><input type="number" value={detail.quantity} onChange={(e) => handleDetailChange(index, 'quantity', Number(e.target.value))} className="admin-form-group !p-1 w-16"/></td>
                                            <td><input type="number" value={detail.priceVND} onChange={(e) => handleDetailChange(index, 'priceVND', Number(e.target.value))} className="admin-form-group !p-1 w-24"/></td>
                                            <td><input type="number" value={detail.estimatedCostVND} onChange={(e) => handleDetailChange(index, 'estimatedCostVND', Number(e.target.value))} className="admin-form-group !p-1 w-24"/></td>
                                            <td className="no-print"><Button type="button" size="sm" variant="ghost" className="!text-red-500" onClick={() => removeDetailItem(index)}><i className="fas fa-trash"></i></Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={addDetailItem} leftIcon={<i className="fas fa-plus"></i>} className="mt-2 no-print">Thêm dòng</Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ServiceTicketFormPage;
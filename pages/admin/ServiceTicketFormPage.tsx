import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ServiceTicket, User, SiteSettings } from '../../types';
import Button from '../../components/ui/Button';
import { getServiceTickets, addServiceTicket, updateServiceTicket } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';
import * as Constants from '../../constants';


const STATUS_OPTIONS: Array<ServiceTicket['status']> = ['Mới', 'Mới tiếp nhận', 'Đang xử lý', 'Chờ linh kiện', 'Đợi KH đồng ý giá', 'Đợi KH nhận lại', 'Hoàn thành', 'Đã đóng', 'Không đồng ý sửa máy', 'Hủy bỏ'];

const InfoItem: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode, className?: string }> = ({ label, value, children, className }) => (
    <div className={className}>
        <p className="text-xs text-textMuted">{label}</p>
        {children || <p className="text-sm font-medium text-textBase">{value || 'N/A'}</p>}
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
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
    
    const [customerSearchText, setCustomerSearchText] = useState('');
    const [customerResults, setCustomerResults] = useState<User[]>([]);
    const [customers, setCustomers] = useState<User[]>([]);

    const staffUsers = useMemo(() => users.filter(u => u.role === 'admin' || u.role === 'staff'), [users]);

    useEffect(() => {
        const loadData = async () => {
             const settingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
             setSiteSettings(settingsRaw ? JSON.parse(settingsRaw) : Constants.INITIAL_SITE_SETTINGS);
             setCustomers(users.filter(u => u.role === 'customer'));

            if (isEditing) {
                setIsLoading(true);
                setError(null);
                try {
                    const allData = await getServiceTickets();
                    const itemToEdit = allData.find(t => t.id === ticketId);
                    if (itemToEdit) {
                        setFormData(itemToEdit);
                        setCustomerSearchText(itemToEdit.customer_info?.fullName || '');
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
    }, [isEditing, ticketId, users]);

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };
    
    const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, customer_info: { ...prev.customer_info!, [name]: value } }) : null);
        if (name === 'fullName') {
             setCustomerSearchText(value);
        }
    };

    const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        handleCustomerInfoChange(e); // Allow manual typing

        if (term) {
            setCustomerResults(customers.filter(c =>
                c.username.toLowerCase().includes(term.toLowerCase()) ||
                c.email.toLowerCase().includes(term.toLowerCase()) ||
                (c.phone && c.phone.includes(term))
            ).slice(0, 5));
        } else {
            setCustomerResults([]);
        }
    };
    
    const handleSelectCustomer = (customer: User) => {
        setFormData(prev => prev ? ({
            ...prev,
            customerId: customer.id,
            customer_info: {
                fullName: customer.username,
                phone: customer.phone || '',
            }
        }) : null);
        setCustomerSearchText(customer.username);
        setCustomerResults([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        try {
            if (isEditing) {
                await updateServiceTicket(ticketId!, formData);
                alert('Cập nhật phiếu dịch vụ thành công!');
            } else {
                await addServiceTicket(formData as any);
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
        <form onSubmit={handleSubmit}>
            <div className="admin-page-header flex justify-between items-center !m-0 !mb-6 no-print">
                <h1 className="admin-page-title">{isEditing ? `Phiếu Dịch Vụ #${formData.ticket_code}` : 'Tạo Phiếu Dịch Vụ Mới'}</h1>
                 <div>
                    <Button type="button" variant="outline" onClick={handlePrint} className="mr-2" leftIcon={<i className="fas fa-print"></i>}>In Phiếu</Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/service_tickets')} className="mr-2">Hủy</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3 className="admin-card-title">Thông tin Khách hàng & Thiết bị</h3>
                        </div>
                        <div className="admin-card-body">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="admin-form-group relative">
                                    <label>Tên khách hàng *</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            name="fullName" 
                                            value={customerSearchText} 
                                            onChange={handleCustomerSearchChange} 
                                            required
                                            autoComplete="off"
                                            className="flex-grow"
                                         />
                                         <Button type="button" size="sm" variant="outline" onClick={() => navigate('/admin/customers/new')} title="Thêm khách hàng mới"><i className="fas fa-plus"></i></Button>
                                    </div>
                                    {customerResults.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto mt-1">
                                            {customerResults.map(c => (
                                                <li key={c.id} onClick={() => handleSelectCustomer(c)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                                    {c.username} ({c.phone || c.email})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                 <div className="admin-form-group">
                                    <label>Số điện thoại *</label>
                                    <input type="tel" name="phone" value={formData.customer_info?.phone || ''} onChange={handleCustomerInfoChange} required />
                                </div>
                            </div>
                             <div className="admin-form-subsection-title mt-2">Thông tin thiết bị</div>
                            <div className="admin-form-group">
                                <label>Tên thiết bị</label>
                                <input type="text" name="deviceName" value={formData.deviceName || ''} onChange={handleChange} />
                            </div>
                            <div className="admin-form-group sm:col-span-2">
                                <label>Mô tả sự cố/yêu cầu</label>
                                <textarea name="reported_issue" value={formData.reported_issue || ''} onChange={handleChange} rows={4}></textarea>
                            </div>
                            <div className="admin-form-group sm:col-span-2">
                                <label>Tình trạng tiếp nhận & Phụ kiện đi kèm</label>
                                <textarea name="physical_condition" value={formData.physical_condition || ''} onChange={handleChange} rows={3} placeholder="Ví dụ: Máy trầy góc phải, kèm sạc zin"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Column */}
                 <div className="lg:col-span-1 space-y-6">
                     <div className="sticky top-24">
                        <div className="admin-card">
                            <div className="admin-card-header"><h3 className="admin-card-title">Thông tin Phiếu</h3></div>
                            <div className="admin-card-body space-y-4">
                                 <InfoItem label="Mã phiếu" value={formData.ticket_code || '(sẽ tạo tự động)'} />
                                 <InfoItem label="Ngày tạo" value={formData.createdAt ? new Date(formData.createdAt).toLocaleString('vi-VN') : 'Mới'} />
                                
                                 <div className="admin-form-group">
                                    <label>Trạng thái</label>
                                    <select name="status" value={formData.status || 'Mới'} onChange={handleChange} className="!py-2">
                                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label>Nhân viên phụ trách (Kỹ thuật)</label>
                                    <select name="assigneeId" value={formData.assigneeId || ''} onChange={handleChange} className="!py-2">
                                        <option value="">-- Chưa gán --</option>
                                        {staffUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>

            {/* --- Print Section --- */}
            <div className="print-wrapper hidden print:block">
               <div className="print-container max-w-2xl mx-auto p-8 bg-white text-black font-sans text-sm">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold uppercase">{siteSettings.companyName}</h2>
                        <p className="text-xs">{siteSettings.companyAddress}</p>
                        <p className="text-xs">ĐT: {siteSettings.companyPhone}</p>
                    </div>
                    <h2 className="text-2xl font-bold mb-6 text-center uppercase">Phiếu Biên Nhận Dịch Vụ</h2>
                    
                    <div className="text-right text-xs mb-4">
                        <p>Số: <span className="font-semibold">{formData.ticket_code || '...'}</span></p>
                        <p>Ngày: <span className="font-semibold">{new Date(formData.createdAt || Date.now()).toLocaleString('vi-VN')}</span></p>
                    </div>

                     <div className="border-2 border-black p-3">
                        <h3 className="text-base font-bold mb-2">Thông tin Khách hàng & Thiết bị</h3>
                        <div className="grid grid-cols-2 gap-x-4 mb-2">
                            <p><strong>Tên khách hàng:</strong> {formData.customer_info?.fullName}</p>
                            <p><strong>Số điện thoại:</strong> {formData.customer_info?.phone}</p>
                        </div>
                        <div className="border-t border-black pt-2">
                             <h4 className="font-bold">Thông tin thiết bị</h4>
                             <p><strong>Tên thiết bị:</strong> {formData.deviceName}</p>
                             <p className="mt-1"><strong>Mô tả sự cố/yêu cầu:</strong> {formData.reported_issue}</p>
                             <div className="mt-1">
                                <p><strong>Tình trạng tiếp nhận & Phụ kiện:</strong></p>
                                <div className="border p-2 min-h-[60px]">{formData.physical_condition}</div>
                             </div>
                        </div>
                     </div>
                    
                     <div className="mt-16 grid grid-cols-2 gap-4 text-center text-xs">
                        <div><p className="font-bold">Khách hàng</p><p>(Ký & ghi rõ họ tên)</p></div>
                        <div><p className="font-bold">Nhân viên tiếp nhận</p><p>(Ký & ghi rõ họ tên)</p></div>
                    </div>
               </div>
            </div>
        </form>
    );
};

export default ServiceTicketFormPage;
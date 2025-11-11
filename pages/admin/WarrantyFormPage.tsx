import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WarrantyTicket, WarrantyTicketItem, SiteSettings, User } from '../../types';
import Button from '../../components/ui/Button';
import { getWarrantyTickets, addWarrantyTicket, updateWarrantyTicket } from '../../services/localDataService';
import * as Constants from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

const WARRANTY_STATUS_OPTIONS: Array<WarrantyTicket['status']> = [
    'Mới Tạo', 'Chờ duyệt', 'Đã duyệt', 'Đang sửa chữa', 'Hoàn thành', 'Đã trả khách', 'Chờ linh kiện', 'Đợi KH đồng ý giá', 'Đợi KH nhận lại', 'Từ chối bảo hành', 'Hủy', 'Lập chứng từ', 'Đang duyệt', 'Đang thực hiện', 'Chờ xem lại'
];

const PrintableRepairSlip: React.FC<{ ticket: Partial<WarrantyTicket>, settings: SiteSettings, title: string }> = ({ ticket, settings, title }) => {
    const itemsTotal = ticket.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    const totalBeforeVat = itemsTotal + (ticket.serviceFee || 0) - (ticket.discount || 0);
    const vatAmount = totalBeforeVat * ((ticket.vat || 0) / 100);
    const grandTotal = totalBeforeVat + vatAmount;

    return (
        <div className="print-container max-w-4xl mx-auto p-8 bg-white text-black font-sans text-sm">
            <header className="flex justify-between items-start mb-4 pb-2 border-b-2 border-black">
                <div className="w-1/3">
                    {settings.siteLogoUrl ? <img src={settings.siteLogoUrl} alt="Company Logo" className="max-h-20" /> : <h2 className="text-2xl font-bold">{settings.companyName}</h2>}
                </div>
                <div className="w-2/3 text-right">
                    <h1 className="text-3xl font-bold uppercase">{title}</h1>
                    <p className="mt-2">Số: <span className="font-semibold">{ticket.ticketNumber || '...'}</span></p>
                    <p>Ngày: {new Date(ticket.receiveDate || Date.now()).toLocaleDateString('vi-VN')}</p>
                </div>
            </header>

            <section className="mb-4 p-2 border border-black rounded">
                <h2 className="text-base font-bold mb-1">Thông Tin Khách Hàng</h2>
                <div className="grid grid-cols-2 gap-x-4 text-xs">
                    <p><strong>Tên khách hàng:</strong> {ticket.customerName}</p>
                    <p><strong>Điện thoại:</strong> {ticket.customerPhone}</p>
                </div>
            </section>

            <main>
                <table className="w-full border-collapse border border-black text-xs mb-4 print-table">
                     <thead className="bg-red-700 text-white text-center font-bold">
                         <tr>
                             <th className="border border-black p-2 w-[5%]">STT</th>
                             <th className="border border-black p-2 w-[25%]">Sản phẩm bảo hành</th>
                             <th className="border border-black p-2 w-[15%]">Tình trạng hư hỏng</th>
                             <th className="border border-black p-2 w-[15%]">Diện bảo hành</th>
                             <th className="border border-black p-2 w-[15%]">Giải pháp xử lý</th>
                             <th className="border border-black p-2 w-[25%]">Kỹ thuật ghi chú</th>
                         </tr>
                     </thead>
                     <tbody>
                         <tr>
                             <td className="border border-black p-2 text-center align-top">1</td>
                             <td className="border border-black p-2 align-top">
                                 <p><strong>Tên:</strong> {ticket.productModel}</p>
                                 <p><strong>Mã:</strong> {ticket.productId || 'N/A'}</p>
                                 <p><strong>Serial:</strong> {ticket.productSerial}</p>
                             </td>
                             <td className="border border-black p-2 align-top">{ticket.reportedIssue}</td>
                             <td className="border border-black p-2 align-top">{ticket.warrantyType}</td>
                             <td className="border border-black p-2 align-top">{ticket.resolution_notes}</td>
                             <td className="border border-black p-2 align-top">{ticket.technician_notes}</td>
                         </tr>
                     </tbody>
                </table>
                
                <div className="flex items-start justify-between gap-4">
                    <div className="w-[65%]">
                        <table className="w-full border-collapse border border-black text-xs print-table">
                            <thead className="bg-red-700 text-white text-center font-bold">
                                <tr>
                                    <th className="border border-black p-2 w-[8%]">STT</th>
                                    <th className="border border-black p-2 w-[25%]">Mã linh kiện</th>
                                    <th className="border border-black p-2">Tên linh kiện</th>
                                    <th className="border border-black p-2 w-[12%]">SL</th>
                                    <th className="border border-black p-2 w-[25%]">Giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ticket.items?.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="border border-black p-2 text-center">{index + 1}</td>
                                        <td className="border border-black p-2">{item.itemCode}</td>
                                        <td className="border border-black p-2">{item.itemName}</td>
                                        <td className="border border-black p-2 text-right">{item.quantity}</td>
                                        <td className="border border-black p-2 text-right">{item.price.toLocaleString('vi-VN')} VND</td>
                                    </tr>
                                ))}
                                {(!ticket.items || ticket.items.length === 0) && (
                                    <tr><td colSpan={5} className="border border-black p-2 h-10 text-center italic">Không có linh kiện/dịch vụ.</td></tr>
                                )}
                                 <tr>
                                    <td colSpan={5} className="border border-black p-2 align-bottom min-h-[50px]">
                                        <strong>Bằng chữ:</strong> <span className="italic">(Một trăm nghìn đồng chẵn)</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="w-[35%]">
                         <table className="w-full border-collapse border border-black text-xs print-table">
                            <tbody>
                                <tr>
                                    <td className="border border-black p-2">Phí dịch vụ</td>
                                    <td className="border border-black p-2 text-right">{ticket.serviceFee?.toLocaleString('vi-VN')} VND</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2">Giảm giá</td>
                                    <td className="border border-black p-2 text-right">{ticket.discount?.toLocaleString('vi-VN')} VND</td>
                                </tr>
                                 <tr>
                                    <td className="border border-black p-2">Thuế VAT ({ticket.vat || 0}%)</td>
                                    <td className="border border-black p-2 text-right">{vatAmount.toLocaleString('vi-VN')} VND</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-bold bg-gray-100">Tổng cộng</td>
                                    <td className="border border-black p-2 text-right font-bold bg-gray-100">{grandTotal.toLocaleString('vi-VN')} VND</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            
            <footer className="mt-24 grid grid-cols-4 gap-4 text-center text-xs">
                <div><p className="font-bold">Khách hàng</p><p className="mt-12 text-gray-500">(Ký & ghi rõ họ tên)</p></div>
                <div><p className="font-bold">Nhân viên nhận</p><p className="mt-12 text-gray-500">(Ký & ghi rõ họ tên)</p></div>
                <div><p className="font-bold">Kỹ thuật viên</p><p className="mt-12 text-gray-500">(Ký & ghi rõ họ tên)</p></div>
                <div><p className="font-bold">Quản lý TTBH</p><p className="mt-12 text-gray-500">(Ký & ghi rõ họ tên)</p></div>
            </footer>
        </div>
    );
};


const WarrantyFormPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const isNew = !ticketId;

    const [formData, setFormData] = useState<Partial<WarrantyTicket>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser, users } = useAuth();
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
    const [printTitle, setPrintTitle] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const settingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
                setSiteSettings(settingsRaw ? JSON.parse(settingsRaw) : Constants.INITIAL_SITE_SETTINGS);

                if (!isNew) {
                    const allTickets = await getWarrantyTickets();
                    const itemToEdit = allTickets.find(c => c.id === ticketId);
                    if (itemToEdit) {
                        setFormData(itemToEdit);
                    } else {
                        setError('Không tìm thấy phiếu để xem/chỉnh sửa.');
                    }
                } else {
                    setFormData({
                        status: 'Mới Tạo', creatorId: currentUser?.id,
                        receiveDate: new Date().toISOString(), priority: 'Bình thường',
                        items: [], serviceFee: 0, discount: 0, vat: 0, totalAmount: 0,
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [isNew, ticketId, currentUser]);
    
    // Auto-calculate total amount
    useEffect(() => {
        if (formData.items || formData.serviceFee || formData.discount || formData.vat) {
            const itemsTotal = formData.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0;
            const subtotal = itemsTotal + (formData.serviceFee || 0) - (formData.discount || 0);
            const vatAmount = subtotal * ((formData.vat || 0) / 100);
            const total = subtotal + vatAmount;
            const totalQty = formData.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
            setFormData(prev => ({ ...prev, totalAmount: total, totalQuantity: totalQty }));
        }
    }, [formData.items, formData.serviceFee, formData.discount, formData.vat]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    };

    const handleItemChange = (index: number, field: keyof WarrantyTicketItem, value: string | number) => {
        const newItems = [...(formData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: newItems }));
    };
    
    const addItem = () => {
        const newItem: WarrantyTicketItem = { id: `item-${Date.now()}`, itemCode: '', itemName: '', quantity: 1, price: 0 };
        setFormData(prev => ({ ...prev, items: [...(prev?.items || []), newItem] }));
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({ ...prev, items: prev?.items?.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !formData.customerName) return alert("Vui lòng nhập tên khách hàng.");

        try {
            if (!isNew) {
                await updateWarrantyTicket(ticketId!, formData as WarrantyTicket);
                alert('Cập nhật thành công!');
            } else {
                await addWarrantyTicket(formData as Omit<WarrantyTicket, 'id'>);
                alert('Tạo phiếu mới thành công!');
            }
            navigate('/admin/warranty_tickets');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu.');
        }
    };
    
    const handlePrint = (type: 'receipt' | 'return') => {
        setPrintTitle(type === 'receipt' ? 'PHIẾU BIÊN NHẬN' : 'PHIẾU SỬA CHỮA');
        setTimeout(() => {
            const printContents = document.getElementById('print-section')?.innerHTML;
            const originalContents = document.body.innerHTML;
            if(printContents) {
                document.body.innerHTML = printContents;
                window.print();
                document.body.innerHTML = originalContents;
                window.location.reload(); // Reload to re-attach React listeners
            }
        }, 100);
    };

    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;

    return (
        <form onSubmit={handleSubmit}>
            <div className="admin-card">
                 <div className="admin-card-header flex justify-between items-center">
                    <h3 className="admin-card-title">{isNew ? 'Tạo Phiếu Mới' : `Sửa Phiếu #${formData.ticketNumber}`}</h3>
                    <div>
                        <Button type="button" variant="outline" onClick={() => handlePrint('receipt')} className="mr-2" leftIcon={<i className="fas fa-print"></i>}>In Phiếu Nhận</Button>
                        <Button type="button" variant="outline" onClick={() => handlePrint('return')} className="mr-2" leftIcon={<i className="fas fa-print"></i>}>In Phiếu Trả</Button>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/warranty_tickets')} className="mr-2">Hủy</Button>
                        <Button type="submit" variant="primary">Lưu</Button>
                    </div>
                </div>
                 <div className="admin-card-body">
                     {/* Form Fields */}
                     <div className="space-y-6">
                        <div className="p-4 border rounded-md">
                             <h4 className="admin-form-subsection-title !mt-0">Thông tin chung</h4>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div className="admin-form-group"><label>Trạng thái</label><select name="status" value={formData.status || ''} onChange={handleChange}>{WARRANTY_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                                <div className="admin-form-group"><label>Tên khách hàng *</label><input type="text" name="customerName" value={formData.customerName || ''} onChange={handleChange} required /></div>
                                <div className="admin-form-group"><label>Số điện thoại</label><input type="tel" name="customerPhone" value={formData.customerPhone || ''} onChange={handleChange} /></div>
                             </div>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h4 className="admin-form-subsection-title !mt-0">Thông tin Sản phẩm & Sự cố</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="admin-form-group"><label>Tên sản phẩm</label><input type="text" name="productModel" value={formData.productModel || ''} onChange={handleChange} /></div>
                                <div className="admin-form-group"><label>Mã sản phẩm</label><input type="text" name="productId" value={formData.productId || ''} onChange={handleChange} /></div>
                                <div className="admin-form-group"><label>Serial</label><input type="text" name="productSerial" value={formData.productSerial || ''} onChange={handleChange} /></div>
                            </div>
                            <div className="admin-form-group"><label>Tình trạng hư hỏng / Yêu cầu *</label><textarea name="reportedIssue" value={formData.reportedIssue || ''} onChange={handleChange} required rows={3}></textarea></div>
                            <div className="admin-form-group"><label>Giải pháp xử lý</label><textarea name="resolution_notes" value={formData.resolution_notes || ''} onChange={handleChange} rows={2}></textarea></div>
                            <div className="admin-form-group"><label>Kỹ thuật ghi chú</label><textarea name="technician_notes" value={formData.technician_notes || ''} onChange={handleChange} rows={2}></textarea></div>
                             <div className="admin-form-group"><label>Diện bảo hành</label><input type="text" name="warrantyType" value={formData.warrantyType || 'Bảo hành dịch vụ'} onChange={handleChange} /></div>
                        </div>
                         <div className="p-4 border rounded-md">
                            <h4 className="admin-form-subsection-title !mt-0">Linh kiện & Chi phí</h4>
                             <div className="overflow-x-auto">
                                <table className="admin-table text-sm">
                                    <thead><tr><th>Mã LK</th><th>Tên Linh kiện/Dịch vụ</th><th className="w-24">Số lượng</th><th className="w-40">Đơn giá</th><th className="w-12"></th></tr></thead>
                                    <tbody>
                                        {formData.items?.map((item, index) => (
                                            <tr key={item.id}>
                                                <td><input type="text" value={item.itemCode || ''} onChange={e => handleItemChange(index, 'itemCode', e.target.value)} className="admin-form-group !p-1 !mb-0"/></td>
                                                <td><input type="text" value={item.itemName || ''} onChange={e => handleItemChange(index, 'itemName', e.target.value)} className="admin-form-group !p-1 !mb-0"/></td>
                                                <td><input type="number" value={item.quantity || 1} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="admin-form-group !p-1 !mb-0"/></td>
                                                <td><input type="number" value={item.price || 0} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} className="admin-form-group !p-1 !mb-0"/></td>
                                                <td><Button type="button" size="sm" variant="ghost" className="text-red-500" onClick={() => removeItem(index)}><i className="fas fa-trash"></i></Button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                             <Button type="button" onClick={addItem} size="sm" variant="outline" className="mt-2" leftIcon={<i className="fas fa-plus"/>}>Thêm dòng</Button>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="admin-form-group"><label>Phí dịch vụ</label><input type="number" name="serviceFee" value={formData.serviceFee || 0} onChange={handleChange}/></div>
                                <div className="admin-form-group"><label>Giảm giá</label><input type="number" name="discount" value={formData.discount || 0} onChange={handleChange}/></div>
                                <div className="admin-form-group"><label>Thuế VAT (%)</label><input type="number" name="vat" value={formData.vat || 0} onChange={handleChange}/></div>
                                <div className="admin-form-group"><label className="text-lg">Tổng cộng</label><p className="text-xl font-bold text-primary pt-2">{(formData.totalAmount || 0).toLocaleString('vi-VN')}₫</p></div>
                             </div>
                        </div>
                     </div>
                 </div>
            </div>
            {/* Hidden printable section */}
            <div id="print-section" className="hidden">
                <PrintableRepairSlip ticket={formData} settings={siteSettings} title={printTitle} />
            </div>
        </form>
    );
};

export default WarrantyFormPage;
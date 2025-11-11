import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WarrantyTicket, Order, SiteSettings, User } from '../../types';
import Button from '../../components/ui/Button';
import { getWarrantyTickets, addWarrantyTicket, updateWarrantyTicket, getOrders } from '../../services/localDataService';
import * as Constants from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

// FIX: Corrected the status options to match the WarrantyTicketStatus type definition.
const WARRANTY_STATUS_OPTIONS: Array<WarrantyTicket['status']> = ['Mới Tạo', 'Chờ duyệt', 'Đã duyệt', 'Đang sửa chữa', 'Chờ linh kiện', 'Hoàn thành', 'Đã trả khách', 'Từ chối bảo hành', 'Hủy'];
const PRIORITY_OPTIONS: Array<WarrantyTicket['priority']> = ['Bình thường', 'Gấp'];


const WarrantyFormPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const isNew = !ticketId;

    const [formData, setFormData] = useState<Partial<WarrantyTicket> | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser, users } = useAuth();
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
    
    const [isEditingMode, setIsEditingMode] = useState(isNew);
    const [printPreview, setPrintPreview] = useState<'receipt' | 'return' | null>(null);

    const staffUsers = users.filter(u => u.role === 'admin' || u.role === 'staff');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [allOrders, allTickets] = await Promise.all([getOrders(), getWarrantyTickets()]);
                setOrders(allOrders);

                const settingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
                setSiteSettings(settingsRaw ? JSON.parse(settingsRaw) : Constants.INITIAL_SITE_SETTINGS);

                if (!isNew) {
                    const itemToEdit = allTickets.find(c => c.id === ticketId);
                    if (itemToEdit) {
                        setFormData(itemToEdit);
                    } else {
                        setError('Không tìm thấy phiếu bảo hành để xem/chỉnh sửa.');
                    }
                } else {
                    setFormData({
                        status: 'Mới Tạo',
                        creatorId: currentUser?.id,
                        receiveDate: new Date().toISOString(),
                        priority: 'Bình thường',
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

    const handleOrderChange = (orderId: string) => {
        const selectedOrder = orders.find(o => o.id === orderId);
        if (selectedOrder) {
            setFormData(prev => ({
                ...prev,
                orderId: selectedOrder.id,
                customerId: selectedOrder.userId,
                customerName: selectedOrder.customerInfo.fullName,
                customerPhone: selectedOrder.customerInfo.phone,
                productId: '', 
                productModel: '',
                productSerial: '',
            }));
        }
    };
    
    const handleProductChange = (productId: string) => {
        const selectedOrder = orders.find(o => o.id === formData?.orderId);
        const selectedProduct = selectedOrder?.items.find(i => i.productId === productId);
        if(selectedProduct) {
             setFormData(prev => ({
                ...prev,
                productId: selectedProduct.productId,
                productModel: selectedProduct.productName,
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !formData.customerName || !formData.reportedIssue) {
            alert("Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }

        try {
            if (!isNew) {
                await updateWarrantyTicket(ticketId!, formData as WarrantyTicket);
                alert('Cập nhật phiếu bảo hành thành công!');
            } else {
                await addWarrantyTicket(formData as Omit<WarrantyTicket, 'id'>);
                alert('Tạo phiếu bảo hành mới thành công!');
            }
            navigate('/admin/warranty_tickets');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu.');
        }
    };
    
    const selectedOrder = orders.find(o => o.id === formData?.orderId);

    const Slip: React.FC<{ type: 'receipt' | 'return' }> = ({ type }) => {
        const returnStaff = staffUsers.find(u => u.id === formData?.returnStaffId);
        return (
             <div className="max-w-4xl mx-auto p-8 bg-white text-black font-sans text-xs">
                 <div className="grid grid-cols-2 gap-x-4 mb-2 text-xs">
                     <div>
                         <p><strong>Nhân viên trả:</strong> {returnStaff?.username || '...'}</p>
                         <p><strong>Ngày nhận:</strong> {formData?.receiveDate ? new Date(formData.receiveDate).toLocaleString('vi-VN') : ''}</p>
                         <p><strong>Ngày trả:</strong> {formData?.returnDate ? new Date(formData.returnDate).toLocaleString('vi-VN') : ''}</p>
                         <p><strong>Ghi chú:</strong> {formData?.resolution_notes || ''}</p>
                     </div>
                     <div className="text-right">
                         <p><strong>Tên khách hàng:</strong> {formData?.customerName}</p>
                         <p><strong>Thứ tự:</strong> {formData?.priority || 'Bình thường'}</p>
                     </div>
                 </div>
 
                 <table className="w-full border-collapse border border-black text-xs">
                     <thead>
                         <tr className="bg-gray-100 text-center font-bold">
                             <th className="border border-black p-1">STT</th>
                             <th className="border border-black p-1">Sản phẩm bảo hành</th>
                             <th className="border border-black p-1">Tình trạng hư hỏng</th>
                             <th className="border border-black p-1">Diện bảo hành</th>
                             <th className="border border-black p-1">Giải pháp xử lý</th>
                             <th className="border border-black p-1">Kỹ thuật ghi chú</th>
                         </tr>
                     </thead>
                     <tbody>
                         <tr>
                             <td className="border border-black p-1 text-center align-top">1</td>
                             <td className="border border-black p-1 align-top">
                                 <p><strong>Tên sản phẩm:</strong> {formData?.productModel}</p>
                                 <p><strong>Mã sản phẩm:</strong> {formData?.productId || formData?.productModel}</p>
                                 <p><strong>Số serial:</strong> {formData?.productSerial}</p>
                             </td>
                             <td className="border border-black p-1 align-top">{formData?.reportedIssue}</td>
                             <td className="border border-black p-1 align-top">{formData?.warrantyType}</td>
                             <td className="border border-black p-1 align-top">{formData?.resolution_notes}</td>
                             <td className="border border-black p-1 align-top">{formData?.technician_notes}</td>
                         </tr>
                         <tr>
                             <td colSpan={2} className="border border-black p-1 font-bold">Xử lý</td>
                             <td colSpan={2} className="border border-black p-1"><strong>Ngày sửa:</strong> {formData?.repairDate ? new Date(formData.repairDate).toLocaleString('vi-VN') : ''}</td>
                             <td colSpan={2} className="border border-black p-1 text-center font-bold">{formData?.status === 'Hoàn thành' ? 'Hoàn thành' : ''}</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
        );
    };
    
    const PrintPreviewModal: React.FC<{ type: 'receipt' | 'return', onClose: () => void }> = ({ type, onClose }) => {
        useEffect(() => {
            const handleAfterPrint = () => { document.body.classList.remove('printing'); };
            window.addEventListener('afterprint', handleAfterPrint);
            return () => window.removeEventListener('afterprint', handleAfterPrint);
        }, []);

        const handlePrint = () => {
            document.body.classList.add('printing');
            window.print();
        };

        return (
            <div className="admin-modal-overlay" onClick={onClose}>
                <div className="admin-modal-panel max-w-4xl" onClick={e => e.stopPropagation()}>
                    <div className="admin-modal-header no-print">
                        <h4 className="admin-modal-title">Xem trước Phiếu In</h4>
                        <div>
                            <Button type="button" variant="outline" onClick={onClose} className="mr-2">Đóng</Button>
                            <Button type="button" variant="primary" onClick={handlePrint} leftIcon={<i className="fas fa-print"></i>}>In Phiếu</Button>
                        </div>
                    </div>
                    <div className="admin-modal-body bg-gray-300">
                        <div className="print-section bg-white shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                            <Slip type={type} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;

    return (
        <>
            <div className="admin-card">
                <form id="warranty-form" onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="admin-card-header flex justify-between items-center">
                        <h3 className="admin-card-title">{isNew ? 'Tạo Phiếu Bảo Hành Mới' : `Phiếu BH #${formData.ticketNumber}`}</h3>
                        <div className="flex items-center gap-2">
                             {!isNew && !isEditingMode && <Button type="button" variant="outline" onClick={() => navigate('/admin/warranty_tickets')} leftIcon={<i className="fas fa-arrow-left"></i>}>Quay lại</Button>}
                             {!isNew && <Button type="button" variant="outline" onClick={() => setPrintPreview('receipt')} leftIcon={<i className="fas fa-print"></i>}>In Phiếu Nhận</Button>}
                             {!isNew && <Button type="button" variant="outline" onClick={() => setPrintPreview('return')} leftIcon={<i className="fas fa-print"></i>}>In Phiếu Trả</Button>}
                            
                            {isEditingMode ? (
                                <>
                                    {!isNew && <Button type="button" variant="outline" onClick={() => setIsEditingMode(false)}>Hủy</Button>}
                                    <Button type="submit" variant="primary">Lưu</Button>
                                </>
                            ) : (
                                !isNew && <Button type="button" variant="primary" onClick={() => setIsEditingMode(true)}>Sửa</Button>
                            )}
                            {isNew && <Button type="submit" variant="primary">Lưu</Button>}
                            {isNew && <Button type="button" variant="outline" onClick={() => navigate('/admin/warranty_tickets')}>Hủy</Button>}

                        </div>
                    </div>

                    <div className="admin-card-body">
                        {isEditingMode ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="admin-form-group"><label>Tên khách hàng *</label><input type="text" name="customerName" value={formData.customerName || ''} onChange={handleChange} required /></div>
                                    <div className="admin-form-group"><label>Số điện thoại</label><input type="tel" name="customerPhone" value={formData.customerPhone || ''} onChange={handleChange} /></div>
                                    <div className="admin-form-group"><label>Nhân viên tạo</label>
                                        <select name="creatorId" value={formData.creatorId || ''} onChange={handleChange}>
                                            <option value="">-- Chọn nhân viên --</option>
                                            {staffUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                                        </select>
                                    </div>
                                    <div className="admin-form-group"><label>Model sản phẩm</label><input type="text" name="productModel" value={formData.productModel || ''} onChange={handleChange} /></div>
                                    <div className="admin-form-group"><label>Serial sản phẩm</label><input type="text" name="productSerial" value={formData.productSerial || ''} onChange={handleChange} /></div>
                                    <div className="admin-form-group"><label>Diện bảo hành</label><input type="text" name="warrantyType" value={formData.warrantyType || ''} onChange={handleChange} /></div>
                                </div>
                                <div className="admin-form-group"><label>Mô tả sự cố *</label><textarea name="reportedIssue" value={formData.reportedIssue || ''} onChange={handleChange} required rows={3}></textarea></div>
                                <div className="admin-form-group"><label>Giải pháp/Ghi chú xử lý</label><textarea name="resolution_notes" value={formData.resolution_notes || ''} onChange={handleChange} rows={3}></textarea></div>
                                <div className="admin-form-group"><label>Ghi chú của kỹ thuật viên</label><textarea name="technician_notes" value={formData.technician_notes || ''} onChange={handleChange} rows={3}></textarea></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                     <div className="admin-form-group"><label>Trạng thái *</label><select name="status" value={formData.status || 'Mới Tạo'} onChange={handleChange} required>{WARRANTY_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                                     <div className="admin-form-group"><label>Ưu tiên</label><select name="priority" value={formData.priority || 'Bình thường'} onChange={handleChange}>{PRIORITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                                     <div className="admin-form-group"><label>Phí sửa chữa (nếu có)</label><input type="number" name="totalAmount" value={formData.totalAmount || 0} onChange={handleChange} /></div>
                                     <div className="admin-form-group"><label>Ngày nhận</label><input type="datetime-local" name="receiveDate" value={formData.receiveDate ? formData.receiveDate.slice(0,16) : ''} onChange={handleChange} /></div>
                                     <div className="admin-form-group"><label>Ngày hẹn trả</label><input type="datetime-local" name="returnDate" value={formData.returnDate?.slice(0,16) || ''} onChange={handleChange} /></div>
                                     <div className="admin-form-group"><label>Ngày sửa</label><input type="datetime-local" name="repairDate" value={formData.repairDate?.slice(0,16) || ''} onChange={handleChange} /></div>
                                     <div className="admin-form-group"><label>Nhân viên trả</label>
                                        <select name="returnStaffId" value={formData.returnStaffId || ''} onChange={handleChange}>
                                            <option value="">-- Chọn nhân viên --</option>
                                            {staffUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                             <div className="p-4 bg-gray-50 rounded border">
                                 <Slip type="receipt" />
                             </div>
                        )}
                    </div>
                </form>
            </div>
            
             {printPreview && <PrintPreviewModal type={printPreview} onClose={() => setPrintPreview(null)} />}
        </>
    );
};

export default WarrantyFormPage;
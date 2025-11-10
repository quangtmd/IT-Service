import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WarrantyTicket, Order, SiteSettings, User } from '../../types';
import Button from '../../components/ui/Button';
import { getWarrantyTickets, addWarrantyTicket, updateWarrantyTicket, getOrders } from '../../services/localDataService';
import * as Constants from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

const WARRANTY_STATUS_OPTIONS: Array<WarrantyTicket['status']> = ['Mới Tạo', 'Đang xử lý', 'Chờ linh kiện', 'Hoàn thành', 'Đã trả khách', 'Từ chối bảo hành', 'Hủy'];

const WarrantyFormPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const isEditing = !!ticketId;

    const [formData, setFormData] = useState<Partial<WarrantyTicket> | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser, users } = useAuth();
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
    const [printMode, setPrintMode] = useState<'receipt' | 'return' | null>(null);

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

                if (isEditing) {
                    const itemToEdit = allTickets.find(c => c.id === ticketId);
                    if (itemToEdit) {
                        setFormData(itemToEdit);
                    } else {
                        setError('Không tìm thấy phiếu bảo hành để chỉnh sửa.');
                    }
                } else {
                    setFormData({
                        status: 'Mới Tạo',
                        creatorId: currentUser?.id,
                        receiveDate: new Date().toISOString(),
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [isEditing, ticketId, currentUser]);

    useEffect(() => {
        if (printMode) {
            const timer = setTimeout(() => {
                window.print();
                setPrintMode(null);
            }, 100); // Delay to allow state update and re-render
            return () => clearTimeout(timer);
        }
    }, [printMode]);
    
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
            if (isEditing) {
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

    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;
    
    const selectedOrder = orders.find(o => o.id === formData.orderId);
    const creator = staffUsers.find(u => u.id === formData.creatorId);

    const Slip: React.FC<{ type: 'receipt' | 'return' }> = ({ type }) => {
        const title = type === 'receipt' ? "Biên Nhận Bảo Hành" : "Phiếu Trả Bảo Hành";
        return (
             <div className="print-container max-w-2xl mx-auto p-8 bg-white text-black font-sans">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold uppercase">{siteSettings.companyName}</h2>
                    <p className="text-xs">{siteSettings.companyAddress} - ĐT: {siteSettings.companyPhone}</p>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-center uppercase">{title}</h2>
                <p className="text-center text-xs mb-4">Số: {formData.ticketNumber}</p>
                <p className="text-center text-xs mb-6">Ngày: {new Date(formData.createdAt || Date.now()).toLocaleString('vi-VN')}</p>

                <div className="border-t border-b py-2 my-4">
                    <p><strong>Khách hàng:</strong> {formData.customerName}</p>
                    <p><strong>Điện thoại:</strong> {formData.customerPhone}</p>
                </div>

                <p><strong>Tên thiết bị:</strong> {formData.productModel}</p>
                <p><strong>Serial:</strong> {formData.productSerial}</p>
                <p className="mt-2"><strong>Mô tả sự cố:</strong> {formData.reportedIssue}</p>
                {type === 'return' && <p className="mt-2"><strong>Kết quả xử lý:</strong> {formData.resolution_notes || 'Chưa có'}</p>}

                <div className="mt-6 text-sm">
                    <p><strong>Ngày nhận:</strong> {formData.receiveDate ? new Date(formData.receiveDate).toLocaleDateString('vi-VN') : ''}</p>
                    <p><strong>Ngày hẹn trả:</strong> {formData.returnDate ? new Date(formData.returnDate).toLocaleDateString('vi-VN') : ''}</p>
                    <p><strong>Nhân viên tiếp nhận:</strong> {creator?.username}</p>
                </div>
                
                <div className="mt-16 grid grid-cols-2 gap-4 text-center text-sm">
                    <div><p className="font-bold">Khách hàng</p><p>(Ký & ghi rõ họ tên)</p></div>
                    <div><p className="font-bold">Nhân viên tiếp nhận</p><p>(Ký & ghi rõ họ tên)</p></div>
                </div>
            </div>
        )
    };

    return (
        <div className={`admin-card ${printMode ? `print-mode print-${printMode}`: ''}`}>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header flex justify-between items-center no-print">
                    <h3 className="admin-card-title">{isEditing ? `Sửa Phiếu BH #${formData.ticketNumber}` : 'Tạo Phiếu Bảo Hành Mới'}</h3>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={() => setPrintMode('receipt')} leftIcon={<i className="fas fa-print"></i>}>In Phiếu Nhận</Button>
                        <Button type="button" variant="outline" onClick={() => setPrintMode('return')} leftIcon={<i className="fas fa-print"></i>}>In Phiếu Trả</Button>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/warranty_tickets')}>Hủy</Button>
                        <Button type="submit" variant="primary">Lưu</Button>
                    </div>
                </div>
                <div className="admin-card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="admin-form-group">
                            <label>Đơn hàng gốc</label>
                            <select name="orderId" value={formData.orderId || ''} onChange={(e) => handleOrderChange(e.target.value)}>
                                <option value="">-- Chọn đơn hàng (tùy chọn) --</option>
                                {orders.map(o => (
                                    <option key={o.id} value={o.id}>#{o.id.slice(-6)} - {o.customerInfo.fullName} - {o.totalAmount.toLocaleString('vi-VN')}₫</option>
                                ))}
                            </select>
                        </div>
                         <div className="admin-form-group">
                            <label>Sản phẩm cần bảo hành</label>
                            <select name="productId" value={formData.productId || ''} onChange={(e) => handleProductChange(e.target.value)} disabled={!selectedOrder}>
                                <option value="">-- Chọn sản phẩm --</option>
                                {selectedOrder?.items.map(item => (
                                    <option key={item.productId} value={item.productId}>{item.productName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-form-group"><label>Tên khách hàng *</label><input type="text" name="customerName" value={formData.customerName || ''} onChange={handleChange} required /></div>
                        <div className="admin-form-group"><label>Số điện thoại</label><input type="tel" name="customerPhone" value={formData.customerPhone || ''} onChange={handleChange} /></div>
                        <div className="admin-form-group"><label>Model sản phẩm</label><input type="text" name="productModel" value={formData.productModel || ''} onChange={handleChange} /></div>
                        <div className="admin-form-group"><label>Serial sản phẩm</label><input type="text" name="productSerial" value={formData.productSerial || ''} onChange={handleChange} /></div>

                        <div className="md:col-span-2 admin-form-group">
                            <label>Mô tả sự cố *</label>
                            <textarea name="reportedIssue" value={formData.reportedIssue || ''} onChange={handleChange} required rows={3}></textarea>
                        </div>
                         <div className="md:col-span-2 admin-form-group">
                            <label>Ghi chú xử lý (hiển thị trên phiếu trả)</label>
                            <textarea name="resolution_notes" value={formData.resolution_notes || ''} onChange={handleChange} rows={3}></textarea>
                        </div>
                        <div className="admin-form-group">
                            <label>Trạng thái *</label>
                            <select name="status" value={formData.status || 'Đang tiếp nhận'} onChange={handleChange} required>
                                {WARRANTY_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                         <div className="admin-form-group">
                            <label>Phí sửa chữa (nếu có)</label>
                            <input type="number" name="totalAmount" value={formData.totalAmount || 0} onChange={handleChange} />
                        </div>
                        <div className="admin-form-group"><label>Ngày nhận</label><input type="date" name="receiveDate" value={formData.receiveDate?.split('T')[0] || ''} onChange={handleChange} /></div>
                        <div className="admin-form-group"><label>Ngày dự kiến trả</label><input type="date" name="returnDate" value={formData.returnDate?.split('T')[0] || ''} onChange={handleChange} /></div>
                    </div>
                </div>
            </form>
            <div className="print-wrapper hidden">
                {printMode === 'receipt' && <Slip type="receipt" />}
                {printMode === 'return' && <Slip type="return" />}
            </div>
        </div>
    );
};

export default WarrantyFormPage;
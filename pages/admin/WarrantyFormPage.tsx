import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WarrantyTicket, Order, SiteSettings, OrderItem, User } from '../../types';
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
    const { currentUser } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const allOrders = await getOrders();
                setOrders(allOrders);

                if (isEditing) {
                    const allData = await getWarrantyTickets();
                    const itemToEdit = allData.find(c => c.id === ticketId);
                    if (itemToEdit) {
                        setFormData(itemToEdit);
                    } else {
                        setError('Không tìm thấy phiếu bảo hành để chỉnh sửa.');
                    }
                } else {
                    setFormData({
                        status: 'Mới Tạo',
                        creatorId: currentUser?.id,
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

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header flex justify-between items-center">
                    <h3 className="admin-card-title">{isEditing ? `Sửa Phiếu BH #${formData.ticketNumber}` : 'Tạo Phiếu Bảo Hành Mới'}</h3>
                    <div>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/warranty_tickets')} className="mr-2">Hủy</Button>
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
                            <textarea name="reportedIssue" value={formData.reportedIssue || ''} onChange={handleChange} required rows={4}></textarea>
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
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/warranty_tickets')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </form>
        </div>
    );
};

export default WarrantyFormPage;
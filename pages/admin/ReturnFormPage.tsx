import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReturnTicket, Order } from '../../types';
import Button from '../../components/ui/Button';
import { getReturns, addReturn, updateReturn, getOrders } from '../../services/localDataService';

const RETURN_STATUS_OPTIONS: Array<ReturnTicket['status']> = ['Đang chờ', 'Đã duyệt', 'Đã từ chối'];

const ReturnFormPage: React.FC = () => {
    const { returnId } = useParams<{ returnId: string }>();
    const navigate = useNavigate();
    const isEditing = !!returnId;

    const [formData, setFormData] = useState<Partial<ReturnTicket> | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const allOrders = await getOrders();
                setOrders(allOrders);

                if (isEditing) {
                    const allData = await getReturns();
                    const itemToEdit = allData.find(r => r.id === returnId);
                    if (itemToEdit) {
                        setFormData(itemToEdit);
                    } else {
                        setError('Không tìm thấy phiếu hoàn trả để chỉnh sửa.');
                    }
                } else {
                    setFormData({
                        orderId: '',
                        reason: '',
                        status: 'Đang chờ',
                        refundAmount: 0,
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [isEditing, returnId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !formData.orderId) return;

        try {
            if (isEditing) {
                await updateReturn(returnId, formData);
                alert('Cập nhật phiếu hoàn trả thành công!');
            } else {
                await addReturn(formData as Omit<ReturnTicket, 'id'>);
                alert('Tạo phiếu hoàn trả mới thành công!');
            }
            navigate('/admin/returns');
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

    const selectedOrder = orders.find(o => o.id === formData.orderId);

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header flex justify-between items-center no-print">
                    <h3 className="admin-card-title">{isEditing ? `Sửa Phiếu Hoàn Trả #${formData.id?.slice(-6)}` : 'Tạo Phiếu Hoàn Trả Mới'}</h3>
                    <div>
                         <Button type="button" variant="outline" onClick={handlePrint} className="mr-2" leftIcon={<i className="fas fa-print"></i>}>In Phiếu</Button>
                         <Button type="button" variant="outline" onClick={() => navigate('/admin/returns')}>Hủy</Button>
                    </div>
                </div>
                <div className="admin-card-body print-wrapper">
                    <div className="print-container">
                        <h2 className="text-2xl font-bold mb-4 text-center">PHIẾU HOÀN TRẢ</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="admin-form-group">
                                <label>Đơn hàng gốc *</label>
                                <select name="orderId" value={formData.orderId || ''} onChange={handleChange} required>
                                    <option value="">-- Chọn đơn hàng --</option>
                                    {orders.map(o => (
                                        <option key={o.id} value={o.id}>#{o.id.slice(-6)} - {o.customerInfo.fullName} - {o.totalAmount.toLocaleString('vi-VN')}₫</option>
                                    ))}
                                </select>
                                {selectedOrder && <p className="text-xs mt-1 text-gray-500">Ngày đặt: {new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}</p>}
                            </div>
                            <div className="admin-form-group">
                                <label>Trạng thái *</label>
                                <select name="status" value={formData.status || 'Đang chờ'} onChange={handleChange} required>
                                    {RETURN_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group sm:col-span-2">
                                <label>Lý do hoàn trả</label>
                                <textarea name="reason" value={formData.reason || ''} onChange={handleChange} rows={3}></textarea>
                            </div>
                             <div className="admin-form-group">
                                <label>Số tiền hoàn (VNĐ)</label>
                                <input type="number" name="refundAmount" value={formData.refundAmount || 0} onChange={handleChange} />
                            </div>
                        </div>
                         {isEditing && (
                            <div className="mt-6 border-t pt-4 text-sm text-gray-500">
                                <p>Mã phiếu: {formData.id}</p>
                                <p>Ngày tạo: {new Date(formData.createdAt || Date.now()).toLocaleString('vi-VN')}</p>
                            </div>
                         )}
                    </div>
                </div>
                <div className="admin-modal-footer no-print">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/returns')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </form>
        </div>
    );
};

export default ReturnFormPage;

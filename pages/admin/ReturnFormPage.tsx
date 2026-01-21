import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReturnTicket, Order, SiteSettings } from '../../types';
import Button from '../../components/ui/Button';
import { getReturns, addReturn, updateReturn, getOrders } from '../../services/localDataService';
import * as Constants from '../../constants';

const RETURN_STATUS_OPTIONS: Array<ReturnTicket['status']> = ['Đang chờ', 'Đã duyệt', 'Đã từ chối'];

const ReturnFormPage: React.FC = () => {
    const { returnId } = useParams<{ returnId: string }>();
    const navigate = useNavigate();
    const isEditing = !!returnId;

    const [formData, setFormData] = useState<Partial<ReturnTicket> | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const allOrders = await getOrders();
                setOrders(allOrders);

                const settingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
                setSiteSettings(settingsRaw ? JSON.parse(settingsRaw) : Constants.INITIAL_SITE_SETTINGS);

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
                await updateReturn(returnId!, formData);
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
                    <div className="print-container max-w-2xl mx-auto p-4 bg-white">
                        <div className="text-sm mb-4">
                            <h3 className="font-bold text-base mb-2">{siteSettings.companyName}</h3>
                            <p>Địa chỉ: {siteSettings.companyAddress}</p>
                        </div>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold uppercase">Phiếu Yêu Cầu Hoàn Trả</h2>
                             <p>Ngày {new Date(formData.createdAt || Date.now()).toLocaleDateString('vi-VN')}</p>
                        </div>
                        
                        <div className="text-sm mb-4 border-t pt-4">
                            <h3 className="font-bold text-base mb-2">Thông tin Khách hàng</h3>
                            <p><strong>Tên:</strong> {selectedOrder?.customerInfo.fullName}</p>
                            <p><strong>SĐT:</strong> {selectedOrder?.customerInfo.phone}</p>
                            <p><strong>Địa chỉ:</strong> {selectedOrder?.customerInfo.address}</p>
                        </div>
                        <div className="admin-form-group no-print">
                            <label>Đơn hàng gốc *</label>
                            <select name="orderId" value={formData.orderId || ''} onChange={handleChange} required>
                                <option value="">-- Chọn đơn hàng --</option>
                                {orders.map(o => (
                                    <option key={o.id} value={o.id}>#{o.id.slice(-6)} - {o.customerInfo.fullName} - {o.totalAmount.toLocaleString('vi-VN')}₫</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="border-t pt-4 text-sm">
                            <h3 className="font-bold text-base mb-2">Chi tiết Yêu cầu</h3>
                             <p className="print-only"><strong>Đơn hàng gốc:</strong> #{formData.orderId?.slice(-6)}</p>
                             <div className="admin-form-group no-print">
                                <label>Trạng thái *</label>
                                <select name="status" value={formData.status || 'Đang chờ'} onChange={handleChange} required>
                                    {RETURN_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <p className="print-only"><strong>Trạng thái:</strong> {formData.status}</p>

                            <div className="admin-form-group no-print">
                                <label>Lý do hoàn trả</label>
                                <textarea name="reason" value={formData.reason || ''} onChange={handleChange} rows={3}></textarea>
                            </div>
                            <p className="print-only"><strong>Lý do:</strong> {formData.reason}</p>

                             <div className="admin-form-group no-print">
                                <label>Số tiền hoàn (VNĐ)</label>
                                <input type="number" name="refundAmount" value={formData.refundAmount || 0} onChange={handleChange} />
                            </div>
                            <p className="print-only"><strong>Số tiền hoàn:</strong> {formData.refundAmount?.toLocaleString('vi-VN')}₫</p>
                        </div>
                         {isEditing && (
                            <div className="mt-6 border-t pt-4 text-sm text-gray-500">
                                <p>Mã phiếu: {formData.id}</p>
                            </div>
                         )}
                         <div className="mt-16 grid grid-cols-2 gap-4 text-center text-sm">
                            <div><p className="font-bold">Khách hàng</p><p>(Ký & ghi rõ họ tên)</p></div>
                            <div><p className="font-bold">Nhân viên tiếp nhận</p><p>(Ký & ghi rõ họ tên)</p></div>
                        </div>
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
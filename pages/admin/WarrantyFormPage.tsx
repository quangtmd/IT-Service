import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WarrantyClaim, Order, SiteSettings, OrderItem } from '../../types';
import Button from '../../components/ui/Button';
import { getWarrantyClaims, addWarrantyClaim, updateWarrantyClaim, getOrders } from '../../services/localDataService';
import * as Constants from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

const WARRANTY_STATUS_OPTIONS: Array<WarrantyClaim['status']> = ['Đang tiếp nhận', 'Đang xử lý', 'Chờ linh kiện', 'Hoàn thành', 'Từ chối'];

const WarrantyFormPage: React.FC = () => {
    const { claimId } = useParams<{ claimId: string }>();
    const navigate = useNavigate();
    const isEditing = !!claimId;

    const [formData, setFormData] = useState<Partial<WarrantyClaim> | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
    const { users } = useAuth();
    const staffUsers = users.filter(u => u.role === 'admin' || u.role === 'staff');

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
                    const allData = await getWarrantyClaims();
                    const itemToEdit = allData.find(c => c.id === claimId);
                    if (itemToEdit) {
                        setFormData(itemToEdit);
                    } else {
                        setError('Không tìm thấy phiếu bảo hành để chỉnh sửa.');
                    }
                } else {
                    setFormData({
                        status: 'Đang tiếp nhận',
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [isEditing, claimId]);
    
    const handleOrderChange = (orderId: string) => {
        const selectedOrder = orders.find(o => o.id === orderId);
        if (selectedOrder) {
            setFormData(prev => ({
                ...prev,
                order_id: selectedOrder.id,
                customer_id: selectedOrder.userId,
                customer_name: selectedOrder.customerInfo.fullName,
                product_id: '', // Reset product when order changes
                product_name: '',
            }));
        }
    };
    
    const handleProductChange = (productId: string) => {
        const selectedOrder = orders.find(o => o.id === formData?.order_id);
        const selectedProduct = selectedOrder?.items.find(i => i.productId === productId);
        if(selectedProduct) {
             setFormData(prev => ({
                ...prev,
                product_id: selectedProduct.productId,
                product_name: selectedProduct.productName,
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !formData.order_id || !formData.product_id || !formData.reported_issue) {
            alert("Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }

        try {
            if (isEditing) {
                await updateWarrantyClaim(claimId!, formData as WarrantyClaim);
                alert('Cập nhật phiếu bảo hành thành công!');
            } else {
                await addWarrantyClaim(formData as Omit<WarrantyClaim, 'id'>);
                alert('Tạo phiếu bảo hành mới thành công!');
            }
            navigate('/admin/warranty_claims');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu.');
        }
    };

    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;
    
    const selectedOrder = orders.find(o => o.id === formData.order_id);

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header flex justify-between items-center no-print">
                    <h3 className="admin-card-title">{isEditing ? `Sửa Phiếu BH #${formData.claim_code}` : 'Tạo Phiếu Bảo Hành Mới'}</h3>
                    <div>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/warranty_claims')} className="mr-2">Hủy</Button>
                        <Button type="submit" variant="primary">Lưu</Button>
                    </div>
                </div>
                <div className="admin-card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="admin-form-group">
                            <label>Đơn hàng gốc *</label>
                            <select name="order_id" value={formData.order_id || ''} onChange={(e) => handleOrderChange(e.target.value)} required>
                                <option value="">-- Chọn đơn hàng --</option>
                                {orders.map(o => (
                                    <option key={o.id} value={o.id}>#{o.id.slice(-6)} - {o.customerInfo.fullName} - {o.totalAmount.toLocaleString('vi-VN')}₫</option>
                                ))}
                            </select>
                        </div>
                         <div className="admin-form-group">
                            <label>Sản phẩm cần bảo hành *</label>
                            <select name="product_id" value={formData.product_id || ''} onChange={(e) => handleProductChange(e.target.value)} required disabled={!selectedOrder}>
                                <option value="">-- Chọn sản phẩm --</option>
                                {selectedOrder?.items.map(item => (
                                    <option key={item.productId} value={item.productId}>{item.productName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label>Tên khách hàng</label>
                            <input type="text" value={formData.customer_name || ''} readOnly disabled />
                        </div>
                        <div className="admin-form-group">
                            <label>Trạng thái *</label>
                            <select name="status" value={formData.status || 'Đang tiếp nhận'} onChange={handleChange} required>
                                {WARRANTY_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2 admin-form-group">
                            <label>Mô tả sự cố *</label>
                            <textarea name="reported_issue" value={formData.reported_issue || ''} onChange={handleChange} required rows={4}></textarea>
                        </div>
                    </div>
                </div>
                <div className="admin-modal-footer no-print">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/warranty_claims')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </form>
        </div>
    );
};

export default WarrantyFormPage;
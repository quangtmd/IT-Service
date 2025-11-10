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
                        customer_name: '',
                        order_id: '',
                        product_id: '',
                        product_name: '',
                        reported_issue: '',
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
    
    const handlePrint = () => {
        window.print();
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
                        <Button type="button" variant="outline" onClick={handlePrint} className="mr-2" leftIcon={<i className="fas fa-print"></i>}>In Phiếu</Button>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/warranty_claims')} className="mr-2">Hủy</Button>
                        <Button type="submit" variant="primary">Lưu</Button>
                    </div>
                </div>
                <div className="admin-card-body print-wrapper">
                     <div className="print-container max-w-2xl mx-auto p-4 bg-white">
                        {/* Print Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold uppercase hidden print-only">{siteSettings.companyName}</h2>
                            <h1 className="text-xl font-bold uppercase mt-4">Phiếu Tiếp Nhận Bảo Hành</h1>
                            <p>Ngày {new Date(formData.created_at || Date.now()).toLocaleDateString('vi-VN')}</p>
                        </div>

                        <div className="text-sm mb-4 border-t pt-4">
                            <h3 className="font-bold text-base mb-2">Thông tin Khách hàng & Sản phẩm</h3>
                             <p><strong>Khách hàng:</strong> {formData.customer_name}</p>
                             <p><strong>SĐT:</strong> {selectedOrder?.customerInfo.phone}</p>
                             <p><strong>Sản phẩm:</strong> {formData.product_name}</p>
                             <p><strong>Đơn hàng gốc:</strong> #{formData.order_id?.slice(-6)}</p>
                        </div>
                        <div className="no-print">
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
                            </div>
                        </div>

                        <div className="border-t pt-4 text-sm mt-4">
                             <h3 className="font-bold text-base mb-2">Tình trạng & Ghi chú</h3>
                             <p className="print-only"><strong>Mô tả sự cố:</strong> {formData.reported_issue}</p>
                             <div className="admin-form-group md:col-span-2 no-print">
                                <label>Mô tả sự cố *</label>
                                <textarea name="reported_issue" value={formData.reported_issue || ''} onChange={handleChange} required rows={4}></textarea>
                            </div>
                            <p className="print-only"><strong>Ghi chú:</strong> {formData.notes}</p>
                             <div className="admin-form-group md:col-span-2 no-print">
                                <label>Ghi chú thêm</label>
                                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={2}></textarea>
                            </div>

                            <p className="print-only"><strong>Trạng thái:</strong> {formData.status}</p>
                            <div className="admin-form-group mt-4 no-print">
                                <label>Trạng thái *</label>
                                <select name="status" value={formData.status || 'Đang tiếp nhận'} onChange={handleChange} required>
                                    {WARRANTY_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-16 grid grid-cols-2 gap-4 text-center text-sm">
                            <div><p className="font-bold">Khách hàng</p><p>(Ký & ghi rõ họ tên)</p></div>
                            <div><p className="font-bold">Nhân viên tiếp nhận</p><p>(Ký & ghi rõ họ tên)</p></div>
                        </div>
                     </div>
                </div>
            </form>
        </div>
    );
};

export default WarrantyFormPage;
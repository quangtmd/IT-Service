import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StockIssue, StockIssueItem, Order, SiteSettings } from '../../types';
import Button from '../../components/ui/Button';
import { getStockIssues, addStockIssue, updateStockIssue, getOrders } from '../../services/localDataService';
import * as Constants from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

const StockIssueFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState<Partial<StockIssue>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [ordersData, allIssues] = await Promise.all([
                    getOrders(),
                    isEditing ? getStockIssues() : Promise.resolve([]),
                ]);

                setOrders(ordersData.filter(o => ['Đã xác nhận', 'Đang chuẩn bị'].includes(o.status)));
                
                if (isEditing) {
                    const issueToEdit = allIssues.find(i => i.id === id);
                    if (issueToEdit) {
                        setFormData(issueToEdit);
                    } else {
                        setError('Không tìm thấy phiếu xuất kho.');
                    }
                } else {
                    setFormData({
                        issueNumber: `PX${Date.now().toString().slice(-6)}`,
                        date: new Date().toISOString().split('T')[0],
                        items: [],
                        status: 'Nháp',
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id, isEditing]);

    const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const orderId = e.target.value;
        const selectedOrder = orders.find(o => o.id === orderId);
        if (selectedOrder) {
            const newItems: StockIssueItem[] = selectedOrder.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
            }));
            setFormData(prev => ({ ...prev, orderId: orderId, items: newItems }));
        } else {
             setFormData(prev => ({ ...prev, orderId: '', items: [] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.orderId) {
            alert('Vui lòng chọn đơn hàng gốc.');
            return;
        }
        try {
            if (isEditing) {
                await updateStockIssue(id!, formData as StockIssue);
                alert('Cập nhật phiếu xuất kho thành công!');
            } else {
                await addStockIssue(formData as Omit<StockIssue, 'id'>);
                alert('Tạo phiếu xuất kho thành công!');
            }
            navigate('/admin/stock_issues');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu.');
        }
    };

    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;
    
    const selectedOrder = orders.find(o => o.id === formData.orderId);

    return (
        <form onSubmit={handleSubmit} className="admin-card">
            <div className="admin-card-header flex justify-between items-center no-print">
                <h3 className="admin-card-title">{isEditing ? `Sửa Phiếu Xuất Kho #${formData.issueNumber}` : 'Tạo Phiếu Xuất Kho Mới'}</h3>
                <div>
                    <Button type="button" variant="outline" onClick={() => window.print()} className="mr-2" leftIcon={<i className="fas fa-print" />}>In Phiếu</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </div>
            <div className="admin-card-body print-wrapper">
                 <div className="print-container max-w-4xl mx-auto p-4 bg-white">
                    <header className="text-center mb-6">
                        <h1 className="text-3xl font-bold uppercase">Phiếu Xuất Kho</h1>
                        <p>Số: {formData.issueNumber}</p>
                        <p>Ngày: {new Date(formData.date || Date.now()).toLocaleDateString('vi-VN')}</p>
                    </header>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="no-print">
                            <label className="admin-form-group">Từ Đơn hàng *</label>
                            <select name="orderId" value={formData.orderId || ''} onChange={handleOrderChange} className="admin-form-group" required>
                                <option value="">-- Chọn Đơn hàng --</option>
                                {orders.map(o => <option key={o.id} value={o.id}>#{o.id.slice(-6)} - {o.customerInfo.fullName}</option>)}
                            </select>
                        </div>
                        <div><strong>Khách hàng:</strong> {selectedOrder?.customerInfo.fullName}</div>
                        <div className="print-only"><strong>Đơn hàng gốc:</strong> #{formData.orderId?.slice(-6)}</div>
                        <div><strong>Người Lập Phiếu:</strong> {currentUser?.username}</div>
                    </div>
                    <table className="w-full text-sm text-left print-table mb-4">
                        <thead className="bg-gray-100">
                            <tr><th className="p-2">STT</th><th className="p-2">Tên Sản Phẩm</th><th className="p-2 text-right">Số Lượng</th></tr>
                        </thead>
                        <tbody>
                            {formData.items?.map((item, index) => (
                                <tr key={item.productId} className="border-b">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{item.productName}</td>
                                    <td className="p-2 text-right">{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-16 grid grid-cols-3 gap-4 text-center text-sm">
                        <div><p className="font-bold">Người Lập Phiếu</p><p>(Ký, họ tên)</p></div>
                        <div><p className="font-bold">Người Giao Hàng</p><p>(Ký, họ tên)</p></div>
                        <div><p className="font-bold">Thủ Kho</p><p>(Ký, họ tên)</p></div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default StockIssueFormPage;

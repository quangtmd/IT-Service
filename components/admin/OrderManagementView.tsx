import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../../types';
import Button from '../ui/Button';
import { getOrders, deleteOrder } from '../../services/localDataService';
import BackendConnectionError from '../../components/shared/BackendConnectionError';
import { useNavigate } from 'react-router-dom';

type StatusFilter = 'all' | OrderStatus;

const PaymentStatusPill: React.FC<{ status: Order['paymentInfo']['status'] }> = ({ status }) => {
    let text = '';
    let className = '';

    switch (status) {
        case 'Chưa thanh toán':
            text = 'CHƯA THANH TOÁN';
            className = 'bg-red-600 text-white';
            break;
        case 'Đã thanh toán':
            text = 'ĐÃ THANH TOÁN';
            className = 'bg-green-500 text-white';
            break;
        case 'Đã cọc':
            text = 'ĐÃ CỌC';
            className = 'bg-amber-500 text-white';
            break;
        default:
            text = status;
            className = 'bg-gray-500 text-white';
    }

    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-md ${className}`}>
            {text}
        </span>
    );
};

const OrderManagementView: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
    const navigate = useNavigate();
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const loadOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const ordersFromDb = await getOrders();
            setOrders(ordersFromDb);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu đơn hàng.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const statusCounts = useMemo(() => {
        return orders.reduce((acc, order) => {
            acc.all = (acc.all || 0) + 1;
            const status = order.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<StatusFilter, number>);
    }, [orders]);


    const filteredOrders = useMemo(() => {
        if (activeFilter === 'all') return orders;
        return orders.filter(order => order.status === activeFilter);
    }, [orders, activeFilter]);


    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
            try {
                await deleteOrder(id);
                loadOrders();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa.');
            }
        }
    };

    const formatCurrency = (value?: number) => {
        if (typeof value !== 'number') return '0';
        return value.toLocaleString('vi-VN');
    };
    
    const formatOrderId = (id: string) => `T${id.replace(/\D/g, '').slice(-6)}`;

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }).replace(',', '');
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="p-8 text-center text-textMuted">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-3">Đang tải dữ liệu đơn hàng...</p>
                </div>
            );
        }
        if (error) {
            return <BackendConnectionError error={error} />;
        }
        return (
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                <table className="min-w-full text-sm align-middle">
                    <thead className="bg-slate-800 text-white">
                        <tr>
                            <th className="p-3 w-4"></th>
                            <th className="p-3">Mã đơn hàng</th>
                            <th className="p-3">Ngày tạo đơn</th>
                            <th className="p-3">Người tạo đơn</th>
                            <th className="p-3">Trạng thái TT</th>
                            <th className="p-3">Tên khách hàng</th>
                            <th className="p-3 text-right">Tổng cộng</th>
                            <th className="p-3 text-right">Đã thanh toán</th>
                            <th className="p-3 text-right">Chi phí</th>
                            <th className="p-3 text-right">Lợi nhuận</th>
                            <th className="p-3 text-center"><i className="fas fa-cog"></i></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                            const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                            const hasInvalidTotal = order.totalAmount === 0 && itemsTotal > 0;
                            const displayTotal = hasInvalidTotal ? itemsTotal : order.totalAmount;
                            
                            const itemsCost = order.items.reduce((sum, item) => sum + (item.purchasePrice || 0) * item.quantity, 0);
                            const displayCost = (hasInvalidTotal && itemsCost > 0) ? itemsCost : (order.cost || 0);
                            const displayProfit = displayTotal - displayCost;
                            
                            let displayShippingStatus = order.shippingInfo?.shippingStatus || 'Chưa giao';
                            if (order.status === 'Hoàn thành' && !['Đã giao', 'Gặp sự cố'].includes(displayShippingStatus)) {
                                displayShippingStatus = 'Đã giao';
                            }
                            
                            return (
                               <React.Fragment key={order.id}>
                                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedOrderId(prev => prev === order.id ? null : order.id)}>
                                        <td className="p-3 text-center"><i className={`fas fa-chevron-right text-xs text-gray-400 transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`}></i></td>
                                        <td className="p-3 font-medium text-blue-600">{formatOrderId(order.id)}</td>
                                        <td className="p-3">{formatDateTime(order.orderDate)}</td>
                                        <td className="p-3">{order.creatorName || 'N/A'}</td>
                                        <td className="p-3"><PaymentStatusPill status={order.paymentInfo.status} /></td>
                                        <td className="p-3">{order.customerInfo.fullName}</td>
                                        <td className="p-3 text-right font-semibold">{formatCurrency(displayTotal)}</td>
                                        <td className="p-3 text-right">{formatCurrency(order.paidAmount)}</td>
                                        <td className="p-3 text-right">{formatCurrency(displayCost)}</td>
                                        <td className="p-3 text-right font-semibold text-green-600">{formatCurrency(displayProfit)}</td>
                                        <td className="p-3">
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/edit/${order.id}`) }} className="text-gray-500 hover:text-blue-600"><i className="fas fa-pencil-alt"></i></button>
                                                <button onClick={(e) => handleDelete(e, order.id)} className="text-gray-500 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedOrderId === order.id && (
                                        <tr className="bg-slate-50">
                                            <td colSpan={11} className="p-0">
                                                <div className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                                        <div>
                                                            <h5 className="font-bold mb-1 text-slate-600">Thông tin Giao hàng</h5>
                                                            <p><strong>Người nhận:</strong> {order.customerInfo.fullName}</p>
                                                            <p><strong>SĐT:</strong> {order.customerInfo.phone}</p>
                                                            <p><strong>Địa chỉ:</strong> {order.customerInfo.address}</p>
                                                            <hr className="my-2"/>
                                                            <p><strong>Vận chuyển:</strong> {order.shippingInfo?.carrier || 'Chưa có'}</p>
                                                            <p><strong>Mã vận đơn:</strong> {order.shippingInfo?.trackingNumber || 'Chưa có'}</p>
                                                            <p><strong>Trạng thái GH:</strong> {displayShippingStatus}</p>
                                                        </div>
                                                        
                                                        <div>
                                                            <h5 className="font-bold mb-1 text-slate-600">Thông tin Thanh toán</h5>
                                                            <p><strong>Phương thức:</strong> {order.paymentInfo.method}</p>
                                                            <p><strong>Trạng thái TT:</strong> {order.paymentInfo.status}</p>
                                                            <p><strong>Tổng đơn:</strong> {formatCurrency(displayTotal)}</p>
                                                            <p><strong>Đã trả:</strong> {formatCurrency(order.paidAmount || 0)}</p>
                                                            <p className="font-bold text-red-600"><strong>Còn lại:</strong> {formatCurrency(displayTotal - (order.paidAmount || 0))}</p>
                                                        </div>
    
                                                        <div>
                                                            <h5 className="font-bold mb-1 text-slate-600">Ghi chú</h5>
                                                            <p className="italic bg-yellow-50 p-2 rounded border border-yellow-200">{order.notes || 'Không có ghi chú.'}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-4">
                                                        <h5 className="font-bold text-xs mb-1 text-slate-600">Chi tiết Sản phẩm</h5>
                                                        <table className="w-full text-xs bg-white rounded shadow-sm border">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="p-1 text-left">Sản phẩm</th>
                                                                    <th className="p-1 text-right">SL</th>
                                                                    <th className="p-1 text-right">Đơn giá</th>
                                                                    <th className="p-1 text-right">Thành tiền</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.items.map(item => (
                                                                    <tr key={item.productId} className="border-t">
                                                                        <td className="p-1">{item.productName}</td>
                                                                        <td className="p-1 text-right">{item.quantity}</td>
                                                                        <td className="p-1 text-right">{formatCurrency(item.price)}</td>
                                                                        <td className="p-1 text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                               </React.Fragment>
                            )
                        }) : (
                            <tr>
                                <td colSpan={11} className="text-center py-8 text-textMuted">Không có đơn hàng nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    const filterOptions: {label: string, value: StatusFilter}[] = [
        { label: 'Tất cả', value: 'all'},
        { label: 'Chờ xử lý', value: 'Chờ xử lý'},
        { label: 'Đã xác nhận', value: 'Đã xác nhận'},
        { label: 'Đang chuẩn bị', value: 'Đang chuẩn bị'},
        { label: 'Đang giao', value: 'Đang giao'},
        { label: 'Hoàn thành', value: 'Hoàn thành'},
        { label: 'Đã hủy', value: 'Đã hủy'},
        { label: 'Phiếu tạm', value: 'Phiếu tạm'},
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div className="flex items-center gap-4 text-gray-600">
                    <h2 className="text-xl font-bold text-gray-800">Quản lý đơn hàng</h2>
                    <button className="hover:text-primary transition-colors"><i className="fas fa-chart-bar mr-1"></i>Thống kê</button>
                    <button className="hover:text-primary transition-colors"><i className="fas fa-filter mr-1"></i>Bộ lọc</button>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => navigate('/admin/service_tickets/new')} variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">Tạo phiếu dịch vụ</Button>
                    <Button onClick={() => navigate('/admin/orders/new')} variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">Tạo đơn bán hàng</Button>
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">Thêm từ excel</Button>
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10 !px-3"><i className="fas fa-search"></i></Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                 {filterOptions.map(opt => {
                    const count = statusCounts[opt.value];
                    if (!count && opt.value !== 'all') return null; // Hide filter if no orders have that status
                    return (
                        <Button 
                            key={opt.value} 
                            onClick={() => setActiveFilter(opt.value)} 
                            size="sm" 
                            variant={activeFilter === opt.value ? 'primary' : 'outline'} 
                            className="!font-normal"
                        >
                            {opt.label} ({count || 0})
                        </Button>
                    );
                 })}
            </div>
            
            {renderContent()}
        </div>
    );
};

export default OrderManagementView;
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../../types';
import Button from '../ui/Button';
import { getOrders, deleteOrder } from '../../services/localDataService';
import BackendConnectionError from '../../components/shared/BackendConnectionError';
import * as ReactRouterDOM from 'react-router-dom';

type StatusFilter = 'all' | 'cancelled' | 'unpaid' | 'deposited' | 'paid';

const PaymentStatusPill: React.FC<{ status: Order['paymentInfo']['status'] }> = ({ status }) => {
    let text = '';
    let className = '';

    switch (status) {
        case 'Chưa thanh toán':
            text = 'CHƯA THANH TOÁN';
            className = 'bg-indigo-600 text-white';
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
    const navigate = ReactRouterDOM.useNavigate();
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

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
            acc.all++;
            if (order.status === 'Đã hủy') acc.cancelled++;
            if (order.paymentInfo?.status === 'Chưa thanh toán') acc.unpaid++;
            if (order.paymentInfo?.status === 'Đã cọc') acc.deposited++;
            if (order.paymentInfo?.status === 'Đã thanh toán') acc.paid++;
            return acc;
        }, { all: 0, cancelled: 0, unpaid: 0, deposited: 0, paid: 0 });
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'cancelled') return order.status === 'Đã hủy';
            if (activeFilter === 'unpaid') return order.paymentInfo?.status === 'Chưa thanh toán';
            if (activeFilter === 'deposited') return order.paymentInfo?.status === 'Đã cọc';
            if (activeFilter === 'paid') return order.paymentInfo?.status === 'Đã thanh toán';
            return true;
        });
    }, [orders, activeFilter]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
        } else {
            setSelectedOrders(new Set());
        }
    };
    
    const handleSelectOne = (orderId: string) => {
        const newSelection = new Set(selectedOrders);
        if (newSelection.has(orderId)) {
            newSelection.delete(orderId);
        } else {
            newSelection.add(orderId);
        }
        setSelectedOrders(newSelection);
    };


    const handleDelete = async (id: string) => {
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
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
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
                    <thead className="bg-blue-800 text-white">
                        <tr>
                            <th className="p-3 w-4"><input type="checkbox" className="form-checkbox" onChange={handleSelectAll} checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0} /></th>
                            <th className="p-3">#</th>
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
                        {filteredOrders.length > 0 ? filteredOrders.map((order, index) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="p-3"><input type="checkbox" className="form-checkbox" checked={selectedOrders.has(order.id)} onChange={() => handleSelectOne(order.id)} /></td>
                                <td className="p-3">{index + 1}</td>
                                <td className="p-3 font-medium text-blue-600 cursor-pointer">{formatOrderId(order.id)}</td>
                                <td className="p-3">{formatDateTime(order.orderDate)}</td>
                                <td className="p-3">{order.creatorName || 'N/A'}</td>
                                <td className="p-3"><PaymentStatusPill status={order.paymentInfo.status} /></td>
                                <td className="p-3">{order.customerInfo.fullName}</td>
                                <td className="p-3 text-right font-semibold">{formatCurrency(order.totalAmount)}</td>
                                <td className="p-3 text-right">{formatCurrency(order.paidAmount)}</td>
                                <td className="p-3 text-right">{formatCurrency(order.cost)}</td>
                                <td className="p-3 text-right font-semibold text-green-600">{formatCurrency(order.profit)}</td>
                                <td className="p-3">
                                    <div className="flex justify-center items-center gap-2">
                                        <button className="text-gray-500 hover:text-gray-800"><i className="fas fa-ellipsis-h"></i></button>
                                        <button onClick={() => navigate(`/admin/orders/edit/${order.id}`)} className="text-gray-500 hover:text-blue-600"><i className="fas fa-pencil-alt"></i></button>
                                        <button onClick={() => handleDelete(order.id)} className="text-gray-500 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={12} className="text-center py-8 text-textMuted">Không có đơn hàng nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

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
                <Button onClick={() => setActiveFilter('all')} size="sm" variant={activeFilter === 'all' ? 'primary' : 'outline'} className="!font-normal">Tất cả</Button>
                <Button onClick={() => setActiveFilter('cancelled')} size="sm" variant={activeFilter === 'cancelled' ? 'primary' : 'outline'} className="!font-normal">Hủy bỏ {statusCounts.cancelled}</Button>
                <Button onClick={() => setActiveFilter('unpaid')} size="sm" variant={activeFilter === 'unpaid' ? 'primary' : 'outline'} className="!font-normal">Chưa thanh toán {statusCounts.unpaid}</Button>
                <Button onClick={() => setActiveFilter('deposited')} size="sm" variant={activeFilter === 'deposited' ? 'primary' : 'outline'} className="!font-normal">Đã cọc {statusCounts.deposited}</Button>
                <Button onClick={() => setActiveFilter('paid')} size="sm" variant={activeFilter === 'paid' ? 'primary' : 'outline'} className="!font-normal">Đã thanh toán {statusCounts.paid}</Button>
            </div>
            
            {renderContent()}
        </div>
    );
};

export default OrderManagementView;
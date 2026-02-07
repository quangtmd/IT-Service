
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../../types';
import Button from '../ui/Button';
import { getOrders, deleteOrder } from '../../services/localDataService';
import BackendConnectionError from '../../components/shared/BackendConnectionError';
import * as ReactRouterDOM from 'react-router-dom';

type StatusFilter = 'all' | OrderStatus;
type TimeFilter = 'all' | 'today' | 'week' | 'month';

// Modern Soft Badge Component
const PaymentStatusPill: React.FC<{ status: Order['paymentInfo']['status'] }> = ({ status }) => {
    let className = '';
    let icon = '';

    switch (status) {
        case 'Chưa thanh toán':
            className = 'bg-red-50 text-red-700 border border-red-100';
            icon = 'fa-times-circle';
            break;
        case 'Đã thanh toán':
            className = 'bg-green-50 text-green-700 border border-green-100';
            icon = 'fa-check-circle';
            break;
        case 'Đã cọc':
            className = 'bg-orange-50 text-orange-700 border border-orange-100';
            icon = 'fa-adjust';
            break;
        default:
            className = 'bg-gray-100 text-gray-700 border border-gray-200';
            icon = 'fa-question-circle';
    }

    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 ${className}`}>
            <i className={`fas ${icon} text-[10px]`}></i> {status}
        </span>
    );
};

const OrderManagementView: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
    const navigate = ReactRouterDOM.useNavigate();
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

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
        let result = orders;

        // Status Filter
        if (activeFilter !== 'all') {
            result = result.filter(order => order.status === activeFilter);
        }

        // Time Filter
        if (timeFilter !== 'all') {
            const now = new Date();
            result = result.filter(order => {
                const orderDate = new Date(order.orderDate);
                if (timeFilter === 'today') {
                    return orderDate.getDate() === now.getDate() && orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                }
                if (timeFilter === 'week') {
                    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return orderDate >= oneWeekAgo;
                }
                if (timeFilter === 'month') {
                    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                }
                return true;
            });
        }

        return result;
    }, [orders, activeFilter, timeFilter]);


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

    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
        } else {
            setSelectedOrderIds(new Set());
        }
    };

    const toggleSelectOrder = (id: string) => {
        const newSelected = new Set(selectedOrderIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedOrderIds(newSelected);
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
                <div className="p-12 text-center text-textMuted">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Đang tải dữ liệu đơn hàng...</p>
                </div>
            );
        }
        if (error) {
            return <BackendConnectionError error={error} />;
        }
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 w-10 text-center">
                                    <input type="checkbox" onChange={toggleSelectAll} checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0} className="rounded border-gray-300 text-primary focus:ring-primary"/>
                                </th>
                                <th className="p-4">Mã đơn</th>
                                <th className="p-4">Ngày tạo</th>
                                <th className="p-4">Khách hàng</th>
                                <th className="p-4">Thanh toán</th>
                                <th className="p-4 text-right">Tổng cộng</th>
                                <th className="p-4 text-right">Đã trả</th>
                                <th className="p-4 text-right">Lợi nhuận</th>
                                <th className="p-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                                const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                                const hasInvalidTotal = order.totalAmount === 0 && itemsTotal > 0;
                                const displayTotal = hasInvalidTotal ? itemsTotal : order.totalAmount;
                                
                                const itemsCost = order.items.reduce((sum, item) => sum + (item.purchasePrice || 0) * item.quantity, 0);
                                const displayCost = (hasInvalidTotal && itemsCost > 0) ? itemsCost : (order.cost || 0);
                                const displayProfit = displayTotal - displayCost;
                                const isSelected = selectedOrderIds.has(order.id);
                                
                                // Get display for shipping status
                                let displayShippingStatus = order.shippingInfo?.shippingStatus || 'Chưa giao';
                                if (order.status === 'Hoàn thành' && !['Đã giao', 'Gặp sự cố'].includes(displayShippingStatus)) {
                                    displayShippingStatus = 'Đã giao';
                                }

                                return (
                                   <React.Fragment key={order.id}>
                                        <tr 
                                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`} 
                                            onClick={() => setExpandedOrderId(prev => prev === order.id ? null : order.id)}
                                        >
                                            <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                                <input type="checkbox" checked={isSelected} onChange={() => toggleSelectOrder(order.id)} className="rounded border-gray-300 text-primary focus:ring-primary"/>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-blue-600 hover:underline">{formatOrderId(order.id)}</span>
                                                <div className="text-xs text-gray-400 mt-0.5">{order.creatorName || 'N/A'}</div>
                                            </td>
                                            <td className="p-4 text-gray-600">{formatDateTime(order.orderDate)}</td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-800">{order.customerInfo.fullName}</div>
                                                <div className="text-xs text-gray-500">{order.customerInfo.phone}</div>
                                            </td>
                                            <td className="p-4"><PaymentStatusPill status={order.paymentInfo.status} /></td>
                                            <td className="p-4 text-right font-bold text-gray-800">{formatCurrency(displayTotal)}</td>
                                            <td className="p-4 text-right text-gray-600">{formatCurrency(order.paidAmount)}</td>
                                            <td className="p-4 text-right font-semibold text-green-600">{formatCurrency(displayProfit)}</td>
                                            <td className="p-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/edit/${order.id}`) }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Chỉnh sửa">
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button onClick={(e) => handleDelete(e, order.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Xóa đơn hàng">
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedOrderId === order.id && (
                                            <tr className="bg-gray-50/50 shadow-inner">
                                                <td colSpan={9} className="p-4 sm:p-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                                        {/* 1. Delivery Info Card */}
                                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                                                <i className="fas fa-truck text-6xl text-blue-500 transform rotate-12"></i>
                                                            </div>
                                                            <h5 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3 flex items-center gap-2">
                                                                <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><i className="fas fa-map-marker-alt"></i></span>
                                                                Thông tin Giao hàng
                                                            </h5>
                                                            <div className="space-y-2 text-sm text-gray-600 relative z-10">
                                                                <p className="flex justify-between"><span className="text-gray-400">Người nhận:</span> <span className="font-medium text-gray-900">{order.customerInfo.fullName}</span></p>
                                                                <p className="flex justify-between"><span className="text-gray-400">SĐT:</span> <span className="font-medium text-gray-900">{order.customerInfo.phone}</span></p>
                                                                <div className="pt-1">
                                                                    <span className="text-gray-400 block mb-1">Địa chỉ:</span>
                                                                    <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded">{order.customerInfo.address}</p>
                                                                </div>
                                                                <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                                                                    <p className="flex justify-between"><span className="text-gray-400">Đơn vị VC:</span> <span className="font-medium">{order.shippingInfo?.carrier || '---'}</span></p>
                                                                    <p className="flex justify-between items-center mt-1">
                                                                        <span className="text-gray-400">Mã vận đơn:</span> 
                                                                        <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">{order.shippingInfo?.trackingNumber || '---'}</span>
                                                                    </p>
                                                                     <p className="flex justify-between mt-1"><span className="text-gray-400">Trạng thái GH:</span> <span className="font-medium text-blue-600">{displayShippingStatus}</span></p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* 2. Payment Info Card */}
                                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                                                <i className="fas fa-file-invoice-dollar text-6xl text-green-500 transform -rotate-12"></i>
                                                            </div>
                                                            <h5 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3 flex items-center gap-2">
                                                                <span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600"><i className="fas fa-wallet"></i></span>
                                                                Thông tin Thanh toán
                                                            </h5>
                                                            <div className="space-y-3 text-sm text-gray-600 relative z-10">
                                                                <div>
                                                                    <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Phương thức</p>
                                                                    <p className="font-medium text-gray-900">{order.paymentInfo.method}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Trạng thái</p>
                                                                    <PaymentStatusPill status={order.paymentInfo.status} />
                                                                </div>
                                                                
                                                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-gray-200">
                                                                    <div className="bg-gray-50 p-2 rounded">
                                                                        <p className="text-xs text-gray-500">Tổng tiền</p>
                                                                        <p className="font-bold text-gray-900">{formatCurrency(displayTotal)}</p>
                                                                    </div>
                                                                    <div className="bg-green-50 p-2 rounded border border-green-100">
                                                                        <p className="text-xs text-green-600">Đã thanh toán</p>
                                                                        <p className="font-bold text-green-700">{formatCurrency(order.paidAmount || 0)}</p>
                                                                    </div>
                                                                </div>
                                                                
                                                                {(displayTotal - (order.paidAmount || 0)) > 0 && (
                                                                    <div className="bg-red-50 p-2 rounded border border-red-100 flex justify-between items-center">
                                                                        <span className="text-red-600 font-medium">Còn nợ:</span>
                                                                        <span className="font-bold text-red-700">{formatCurrency(displayTotal - (order.paidAmount || 0))}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* 3. Notes & Meta Card */}
                                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group flex flex-col">
                                                             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                                                <i className="fas fa-clipboard-list text-6xl text-yellow-500 transform rotate-6"></i>
                                                            </div>
                                                            <h5 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3 flex items-center gap-2">
                                                                <span className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600"><i className="fas fa-sticky-note"></i></span>
                                                                Ghi chú & Khác
                                                            </h5>
                                                            <div className="flex-grow relative z-10">
                                                                <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100 h-full min-h-[80px]">
                                                                    <p className="italic text-gray-600 text-sm whitespace-pre-wrap">{order.notes || 'Không có ghi chú nào cho đơn hàng này.'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 flex justify-between relative z-10">
                                                                <span>Tạo bởi: {order.creatorName || 'Hệ thống'}</span>
                                                                <span>ID: {order.id}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Product Table */}
                                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                                                            <h5 className="font-bold text-gray-800 flex items-center gap-2">
                                                                <i className="fas fa-box-open text-gray-500"></i> Chi tiết Sản phẩm
                                                            </h5>
                                                            <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                                                {order.items.length} mặt hàng
                                                            </span>
                                                        </div>
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-sm text-left">
                                                                <thead className="bg-white text-gray-500 border-b border-gray-100">
                                                                    <tr>
                                                                        <th className="py-3 px-5 font-medium w-12">#</th>
                                                                        <th className="py-3 px-5 font-medium">Sản phẩm</th>
                                                                        <th className="py-3 px-5 font-medium text-right">Số lượng</th>
                                                                        <th className="py-3 px-5 font-medium text-right">Đơn giá</th>
                                                                        <th className="py-3 px-5 font-medium text-right">Thành tiền</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {order.items.map((item, idx) => (
                                                                        <tr key={idx} className="hover:bg-gray-50/50">
                                                                            <td className="py-3 px-5 text-gray-400">{idx + 1}</td>
                                                                            <td className="py-3 px-5">
                                                                                <div className="font-medium text-gray-800">{item.productName}</div>
                                                                                <div className="text-xs text-gray-400">{item.productId}</div>
                                                                            </td>
                                                                            <td className="py-3 px-5 text-right font-medium">{item.quantity}</td>
                                                                            <td className="py-3 px-5 text-right text-gray-600">{formatCurrency(item.price)}</td>
                                                                            <td className="py-3 px-5 text-right font-bold text-gray-800">{formatCurrency(item.price * item.quantity)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                                <tfoot className="bg-gray-50 border-t border-gray-200">
                                                                    <tr>
                                                                        <td colSpan={4} className="py-3 px-5 text-right font-bold text-gray-700">Tổng cộng</td>
                                                                        <td className="py-3 px-5 text-right font-bold text-blue-600 text-base">{formatCurrency(displayTotal)}</td>
                                                                    </tr>
                                                                </tfoot>
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
                                    <td colSpan={9} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <i className="fas fa-box-open text-4xl mb-3 opacity-30"></i>
                                            <p>Không tìm thấy đơn hàng nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const filterOptions: {label: string, value: StatusFilter}[] = [
        { label: 'Tất cả', value: 'all'},
        { label: 'Chờ xử lý', value: 'Chờ xử lý'},
        { label: 'Đã xác nhận', value: 'Đã xác nhận'},
        { label: 'Đang giao', value: 'Đang giao'},
        { label: 'Hoàn thành', value: 'Hoàn thành'},
        { label: 'Đã hủy', value: 'Đã hủy'},
        { label: 'Phiếu tạm', value: 'Phiếu tạm'},
    ];

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap">Quản lý đơn hàng</h2>
                    <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                        {['all', 'today', 'week', 'month'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeFilter(t as TimeFilter)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${timeFilter === t ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {t === 'all' ? 'Tất cả' : t === 'today' ? 'Hôm nay' : t === 'week' ? 'Tuần này' : 'Tháng này'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {selectedOrderIds.size > 0 && (
                        <div className="flex items-center gap-2 mr-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                            <span className="text-xs font-semibold text-blue-700">{selectedOrderIds.size} đã chọn</span>
                            <button className="text-red-500 hover:text-red-700 text-xs font-medium" onClick={() => {if(window.confirm('Xóa các đơn đã chọn?')) alert('Tính năng đang phát triển')}}>Xóa</button>
                            <div className="w-px h-3 bg-blue-200 mx-1"></div>
                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">In hàng loạt</button>
                        </div>
                    )}
                    
                    <Button onClick={() => navigate('/admin/service_tickets/new')} variant="outline" size="sm" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm">
                        <i className="fas fa-tools mr-2 text-gray-500"></i> Dịch vụ
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm">
                        <i className="fas fa-file-excel mr-2 text-green-600"></i> Excel
                    </Button>
                    <Button onClick={() => navigate('/admin/orders/new')} variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200">
                        <i className="fas fa-plus mr-2"></i> Tạo đơn bán hàng
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                 {filterOptions.map(opt => {
                    const count = statusCounts[opt.value];
                    if (!count && opt.value !== 'all') return null;
                    const isActive = activeFilter === opt.value;
                    return (
                        <button 
                            key={opt.value} 
                            onClick={() => setActiveFilter(opt.value)} 
                            className={`
                                whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${isActive 
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-100' 
                                    : 'text-gray-500 hover:bg-white hover:text-gray-700'
                                }
                            `}
                        >
                            {opt.label}
                            <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                                {count || 0}
                            </span>
                        </button>
                    );
                 })}
            </div>
            
            {renderContent()}
        </div>
    );
};

export default OrderManagementView;

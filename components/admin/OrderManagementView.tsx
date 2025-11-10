import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../../types';
import Button from '../ui/Button';
import { getOrders, deleteOrder } from '../../services/localDataService';
import BackendConnectionError from '../../components/shared/BackendConnectionError'; // Cập nhật đường dẫn
import * as ReactRouterDOM from 'react-router-dom';

// Updated status colors to match the new design
const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Hoàn thành': return 'bg-green-100 text-green-800';
        case 'Đang giao': return 'bg-violet-100 text-violet-800'; // Light purple/blue from image
        case 'Đã hủy': return 'bg-red-100 text-red-800';
        case 'Chờ xử lý': return 'bg-yellow-100 text-yellow-800';
        case 'Đang xác nhận':
        case 'Đã xác nhận': return 'bg-cyan-100 text-cyan-800';
        case 'Đang chuẩn bị': return 'bg-blue-100 text-blue-800';
        case 'Phiếu tạm':
        default: return 'bg-gray-100 text-gray-800';
    }
}

const OrderManagementView: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = ReactRouterDOM.useNavigate();

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

    const filteredOrders = useMemo(() =>
        orders.filter(o =>
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerInfo.phone.includes(searchTerm) ||
            o.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()),
    [orders, searchTerm]);

    const handleAddNewOrder = () => {
        navigate('/admin/orders/new');
    };

    const handleEditOrder = (orderId: string) => {
        navigate(`/admin/orders/edit/${orderId}`);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác.')) {
            try {
                await deleteOrder(id);
                loadOrders();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa.');
            }
        }
    };
    
    // Function to format order ID as #ORDXXXX
    const formatOrderId = (id: string) => {
        const numericId = id.replace(/[^0-9]/g, '');
        return `#ORD${numericId.slice(-4).padStart(4, '0')}`;
    };

    // Function to format date as HH:mm:ss DD/MM/YYYY
    const formatOrderDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour12: false
        };
        // The default vi-VN format is "HH:mm:ss, DD/MM/YYYY". We need to remove the comma.
        return new Intl.DateTimeFormat('vi-VN', options).format(date).replace(',', '');
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Đang tải đơn hàng...</p>
                </div>
            );
        }

        if (error) {
            return <BackendConnectionError error={error} />;
        }

        if (filteredOrders.length === 0) {
            return <p className="text-center py-10 text-gray-500">Không tìm thấy đơn hàng nào.</p>;
        }

        return (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase font-semibold border-b">
                        <tr>
                            <th scope="col" className="px-4 py-3">Mã ĐH</th>
                            <th scope="col" className="px-4 py-3">Khách hàng</th>
                            <th scope="col" className="px-4 py-3">Ngày đặt</th>
                            <th scope="col" className="px-4 py-3">Tổng tiền</th>
                            <th scope="col" className="px-4 py-3">Trạng thái</th>
                            <th scope="col" className="px-4 py-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    <span className="bg-gray-100 text-gray-800 text-xs font-mono p-1 rounded">
                                        {formatOrderId(order.id)}
                                    </span>
                                </td>
                                <td className="px-4 py-4">{order.customerInfo.fullName}</td>
                                <td className="px-4 py-4">{formatOrderDate(order.orderDate)}</td>
                                <td className="px-4 py-4 font-semibold">
                                    {order.totalAmount.toLocaleString('vi-VN')}₫
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        <button onClick={() => handleEditOrder(order.id)} className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-gray-100" title="Xem chi tiết">
                                            <i className="fas fa-eye w-4 h-4"></i>
                                        </button>
                                         <button onClick={() => handleEditOrder(order.id)} className="text-gray-500 hover:text-green-600 p-1 rounded-full hover:bg-gray-100" title="Chỉnh sửa">
                                            <i className="fas fa-edit w-4 h-4"></i>
                                        </button>
                                        <button onClick={() => handleDelete(order.id)} className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-gray-100" title="Xóa">
                                            <i className="fas fa-trash-alt w-4 h-4"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Quản lý Đơn hàng ({filteredOrders.length})</h2>
                <Button onClick={handleAddNewOrder} size="sm" variant="primary" className="!bg-red-500 hover:!bg-red-600">
                    <i className="fas fa-plus mr-2"></i>Thêm Đơn
                </Button>
            </div>

            <div className="mb-6 relative">
                 <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                 <input
                    type="text"
                    placeholder="Tìm đơn hàng theo mã, tên, SĐT, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                />
            </div>
            
            {renderContent()}
        </div>
    );
};

export default OrderManagementView;

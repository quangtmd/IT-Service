import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSuppliers, getStockReceipts } from '../../services/localDataService';
import { Supplier, StockReceipt } from '../../types';
import Button from '../../components/ui/Button';

// FIX: Add className prop to InfoItem component
const InfoItem: React.FC<{ label: string; value?: string | number | null; className?: string }> = ({ label, value, className }) => (
    <div className={className}>
        <p className="text-xs text-textMuted">{label}</p>
        <p className="text-sm font-medium text-textBase">{value || 'N/A'}</p>
    </div>
);

const ReceiptRow: React.FC<{ receipt: StockReceipt }> = ({ receipt }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <tr className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <td><i className={`fas fa-chevron-right text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}></i></td>
                <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">{receipt.receiptNumber}</span></td>
                <td>{new Date(receipt.date).toLocaleString('vi-VN')}</td>
                <td><span className={`status-badge ${receipt.status === 'Hoàn thành' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{receipt.status}</span></td>
                <td className="font-semibold text-right">{receipt.totalAmount.toLocaleString('vi-VN')}₫</td>
                <td className="text-right text-red-600">{(receipt.totalAmount - receipt.amountPaid).toLocaleString('vi-VN')}₫</td>
            </tr>
            {isExpanded && (
                <tr className="bg-gray-50">
                    <td colSpan={6} className="p-2">
                        <div className="bg-white p-2 rounded border">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-1 text-left">Sản phẩm</th>
                                        <th className="p-1 text-right">SL</th>
                                        <th className="p-1 text-right">Giá nhập</th>
                                        <th className="p-1 text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receipt.items.map((item, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="p-1">{item.productName}</td>
                                            <td className="p-1 text-right">{item.quantity}</td>
                                            <td className="p-1 text-right">{item.purchasePrice.toLocaleString('vi-VN')}₫</td>
                                            <td className="p-1 text-right font-medium">{(item.purchasePrice * item.quantity).toLocaleString('vi-VN')}₫</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

const SupplierProfilePage: React.FC = () => {
    const { supplierId } = useParams<{ supplierId: string }>();
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [receipts, setReceipts] = useState<StockReceipt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!supplierId) {
                setError("Không tìm thấy ID nhà cung cấp.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const [allSuppliers, allReceipts] = await Promise.all([getSuppliers(), getStockReceipts()]);
                const foundSupplier = allSuppliers.find(s => s.id === supplierId);

                if (!foundSupplier) throw new Error("Không tìm thấy thông tin nhà cung cấp.");
                
                setSupplier(foundSupplier);
                setReceipts(allReceipts.filter(r => r.supplierId === supplierId));

            } catch (err) {
                setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu.");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [supplierId]);
    
    if (isLoading) return <div className="admin-card-body text-center p-8">Đang tải hồ sơ...</div>;
    if (error) return <div className="admin-card-body text-center p-8 text-red-500">{error}</div>;
    if (!supplier) return null;
    
    const totalValue = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalDebt = receipts.reduce((sum, r) => sum + (r.totalAmount - r.amountPaid), 0);

    return (
        <div className="space-y-6">
            <div className="admin-card">
                 <div className="admin-card-header flex justify-between">
                     <h3 className="admin-card-title">Thông tin Nhà Cung Cấp</h3>
                     <Link to={`/admin/partners/suppliers/edit/${supplier.id}`}><Button variant="primary" size="sm" leftIcon={<i className="fas fa-edit"/>}>Sửa</Button></Link>
                </div>
                 <div className="admin-card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoItem label="Tên Nhà Cung Cấp" value={supplier.name} className="md:col-span-2" />
                         <InfoItem label="Mã NCC" value={supplier.id} />
                         <InfoItem label="Email" value={supplier.contactInfo.email} />
                         <InfoItem label="Số điện thoại" value={supplier.contactInfo.phone} />
                         <InfoItem label="Địa chỉ" value={supplier.contactInfo.address} className="md:col-span-3"/>
                         <InfoItem label="Điều khoản thanh toán" value={supplier.paymentTerms} className="md:col-span-3"/>
                    </div>
                </div>
            </div>
            
            <div className="admin-card">
                 <div className="admin-card-header"><h4 className="admin-card-title">Lịch sử Nhập hàng ({receipts.length})</h4></div>
                 <div className="admin-card-body !p-0">
                     <div className="overflow-x-auto">
                        <table className="admin-table text-sm">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Mã phiếu nhập</th>
                                    <th>Ngày nhập</th>
                                    <th>Trạng thái</th>
                                    <th className="text-right">Tổng tiền</th>
                                    <th className="text-right">Nợ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receipts.length > 0 ? (
                                    receipts.map(r => <ReceiptRow key={r.id} receipt={r} />)
                                ) : (
                                    <tr><td colSpan={6} className="text-center py-6 text-textMuted">Chưa có lịch sử nhập hàng.</td></tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-100 font-bold">
                                    <td colSpan={4} className="text-right p-2">Tổng cộng</td>
                                    <td className="text-right p-2">{totalValue.toLocaleString('vi-VN')}₫</td>
                                    <td className="text-right p-2 text-red-600">{totalDebt.toLocaleString('vi-VN')}₫</td>
                                </tr>
                            </tfoot>
                        </table>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default SupplierProfilePage;
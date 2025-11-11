import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Supplier } from '../../types';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { getSuppliers } from '../../services/localDataService';

type PartnerTab = 'customers' | 'suppliers';

const PartnersView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<PartnerTab>('customers');

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Đối tác</h3>
            </div>
            <div className="admin-card-body">
                <nav className="admin-tabs">
                    <button onClick={() => setActiveTab('customers')} className={`admin-tab-button ${activeTab === 'customers' ? 'active' : ''}`}>Khách hàng</button>
                    <button onClick={() => setActiveTab('suppliers')} className={`admin-tab-button ${activeTab === 'suppliers' ? 'active' : ''}`}>Nhà cung cấp</button>
                </nav>
                <div className="mt-6">
                    {activeTab === 'customers' && <CustomersTab />}
                    {activeTab === 'suppliers' && <SuppliersTab />}
                </div>
            </div>
        </div>
    );
};

// Customer Tab Component
const CustomersTab: React.FC = () => {
    const { users, isLoading: isAuthLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const customerUsers = useMemo(() =>
        users.filter(u => u.role === 'customer')
            .filter(u => {
                const term = searchTerm.toLowerCase();
                if (!term) return true;
                return (
                    u.username.toLowerCase().includes(term) ||
                    u.email.toLowerCase().includes(term) ||
                    (u.phone && u.phone.includes(searchTerm)) ||
                    u.id.toLowerCase().includes(term)
                );
            }),
        [users, searchTerm]
    );

    const totalDebt = customerUsers.reduce((sum, user) => {
        // This is a placeholder logic. Real debt calculation would be more complex.
        if(user.debtStatus === 'Có nợ' || user.debtStatus === 'Quá hạn') {
            return sum + (user.loyaltyPoints || 0) * 1000; // Mock debt
        }
        return sum;
    }, 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Nhập tên, mã hoặc SĐT khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-form-group w-full max-w-md !mb-0"
                />
                <Button onClick={() => navigate('/admin/partners/customers/new')} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Thêm KH
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="admin-table text-sm">
                    <thead>
                        <tr>
                            <th>Mã KH</th>
                            <th>Tên KH</th>
                            <th>Điện thoại</th>
                            <th>Địa chỉ</th>
                            <th>Lần cuối mua hàng</th>
                            <th className="text-right">Tổng tiền hàng</th>
                            <th className="text-right">Nợ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isAuthLoading ? (
                            <tr><td colSpan={7} className="text-center py-4">Đang tải...</td></tr>
                        ) : customerUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/partners/customers/view/${user.id}`)}>
                                <td className="font-mono">{user.id.slice(-6).toUpperCase()}</td>
                                <td className="font-semibold">{user.username}</td>
                                <td>{user.phone}</td>
                                <td className="max-w-xs truncate">{user.address}</td>
                                <td>(chưa có)</td>
                                <td className="text-right font-semibold">{(user.loyaltyPoints || 0) * 10000}</td>
                                <td className="text-right text-red-600">0</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 font-bold">
                            <td colSpan={5} className="text-right p-2">Tổng cộng ({customerUsers.length} khách hàng)</td>
                            <td className="text-right p-2">{(customerUsers.reduce((sum, u) => sum + (u.loyaltyPoints || 0) * 10000, 0)).toLocaleString('vi-VN')}₫</td>
                            <td className="text-right p-2 text-red-600">{totalDebt.toLocaleString('vi-VN')}₫</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

// Supplier Tab Component
const SuppliersTab: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await getSuppliers();
            setSuppliers(data);
            setIsLoading(false);
        };
        loadData();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Nhập tên, mã hoặc SĐT nhà cung cấp..."
                    className="admin-form-group w-full max-w-md !mb-0"
                />
                <Button onClick={() => navigate('/admin/partners/suppliers/new')} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Thêm NCC
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="admin-table text-sm">
                    <thead>
                        <tr>
                            <th>Mã NCC</th>
                            <th>Tên NCC</th>
                            <th>Điện thoại</th>
                            <th>Địa chỉ</th>
                            <th>Lần cuối nhập hàng</th>
                            <th className="text-right">Tổng tiền hàng</th>
                            <th className="text-right">Nợ</th>
                        </tr>
                    </thead>
                    <tbody>
                         {isLoading ? (
                            <tr><td colSpan={7} className="text-center py-4">Đang tải...</td></tr>
                        ) : suppliers.map(s => (
                             <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/partners/suppliers/view/${s.id}`)}>
                                <td className="font-mono">{s.id.slice(-6).toUpperCase()}</td>
                                <td className="font-semibold">{s.name}</td>
                                <td>{s.contactInfo.phone}</td>
                                <td className="max-w-xs truncate">{s.contactInfo.address}</td>
                                <td>(chưa có)</td>
                                <td className="text-right font-semibold">0</td>
                                <td className="text-right text-red-600">0</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PartnersView;
import React, { useState } from 'react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getWarehouses } from '../../services/localDataService';
import HRMProfileView from './HRMProfileView'; // Re-use the user list

type SystemTab = 'users' | 'permissions' | 'invoice_templates' | 'warehouses';

const SystemManagementView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SystemTab>('users');

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Thiết lập Hệ thống</h3>
            </div>
            <div className="admin-card-body">
                <nav className="admin-tabs">
                    <button onClick={() => setActiveTab('users')} className={`admin-tab-button ${activeTab === 'users' ? 'active' : ''}`}>Nhân viên</button>
                    <button onClick={() => setActiveTab('permissions')} className={`admin-tab-button ${activeTab === 'permissions' ? 'active' : ''}`}>Thiết lập chức năng</button>
                    <button onClick={() => setActiveTab('invoice_templates')} className={`admin-tab-button ${activeTab === 'invoice_templates' ? 'active' : ''}`}>Mẫu hóa đơn</button>
                    <button onClick={() => setActiveTab('warehouses')} className={`admin-tab-button ${activeTab === 'warehouses' ? 'active' : ''}`}>Kho</button>
                </nav>
                <div className="mt-6">
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'permissions' && <PermissionsTab />}
                    {activeTab === 'invoice_templates' && <InvoiceTemplatesTab />}
                    {activeTab === 'warehouses' && <WarehousesTab />}
                </div>
            </div>
        </div>
    );
};

// Users Tab
const UsersTab: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => navigate('/admin/system_management/users/new')} size="sm" leftIcon={<i className="fas fa-user-plus" />}>Tạo nhân viên mới</Button>
            </div>
            {/* Re-using the HRMProfileView component logic for user listing */}
            <HRMProfileView />
        </div>
    );
}

// Permissions Tab
const PermissionsTab: React.FC = () => {
    // FIX: Remove unused and incorrect destructuring of STAFF_ROLE_OPTIONS from useAuth.
    const functions = [
        "Báo cáo mỗi ngày", "Sản phẩm", "Bán hàng", "Nhập hàng", "Báo cáo lợi nhuận",
        "Báo cáo nhập xuất tồn", "Báo cáo tồn kho", "Đối tác", "Nhân viên", "Phân quyền", "Thiết lập cửa hàng"
    ];
    // This is a mock permission matrix
    const permissions = {
        'Ban Giám đốc': functions.map(() => true),
        'Quản lý': [true, true, true, true, false, true, true, true, true, false, false],
        'Nhân viên bán hàng': [true, false, true, false, false, false, false, true, false, false, false],
    };

    return (
        <div>
            <table className="admin-table text-sm">
                <thead>
                    <tr>
                        <th className="w-1/4">Chức năng</th>
                        <th className="text-center">Ban Giám đốc</th>
                        <th className="text-center">Quản lý</th>
                        <th className="text-center">Nhân viên bán hàng</th>
                    </tr>
                </thead>
                <tbody>
                    {functions.map((func, index) => (
                        <tr key={index}>
                            <td className="font-semibold">{func}</td>
                            <td className="text-center">{permissions['Ban Giám đốc'][index] ? <i className="fas fa-check text-green-500"/> : <i className="fas fa-times text-red-500"/>}</td>
                            <td className="text-center">{permissions['Quản lý'][index] ? <i className="fas fa-check text-green-500"/> : <i className="fas fa-times text-red-500"/>}</td>
                            <td className="text-center">{permissions['Nhân viên bán hàng'][index] ? <i className="fas fa-check text-green-500"/> : <i className="fas fa-times text-red-500"/>}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Invoice Templates Tab
const InvoiceTemplatesTab: React.FC = () => {
    return (
        <div className="text-center p-8 text-textMuted">
            <i className="fas fa-file-invoice text-4xl text-gray-300 mb-3"></i>
            <p>Tính năng chỉnh sửa mẫu hóa đơn đang được phát triển.</p>
        </div>
    );
};

// Warehouses Tab
const WarehousesTab: React.FC = () => {
    const [warehouses, setWarehouses] = React.useState<any[]>([]);
    React.useEffect(() => {
        getWarehouses().then(setWarehouses);
    }, []);

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button size="sm" leftIcon={<i className="fas fa-plus"/>}>Thêm kho</Button>
            </div>
             <table className="admin-table text-sm">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tên Kho</th>
                        <th>Ngày tạo</th>
                    </tr>
                </thead>
                <tbody>
                    {warehouses.map((wh, index) => (
                        <tr key={wh.id}>
                            <td>{index + 1}</td>
                            <td className="font-semibold">{wh.name}</td>
                            <td>{new Date().toLocaleDateString('vi-VN')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SystemManagementView;
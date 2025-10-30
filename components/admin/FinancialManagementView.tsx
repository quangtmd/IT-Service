import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FinancialTransaction, PayrollRecord, TransactionCategory, TransactionType, User, Supplier, Bill } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import { getSuppliers, getBills } from '../../services/localDataService';


type FinancialTab = 'overview' | 'transactions' | 'reports' | 'payroll' | 'suppliers' | 'bills';

// --- MAIN COMPONENT ---
const FinancialManagementView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<FinancialTab>('overview');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'suppliers': return <SuppliersTab />;
            case 'bills': return <BillsTab />;
            case 'transactions': return <p>Quản lý Giao dịch đang được phát triển.</p>;
            case 'reports': return <p>Báo cáo đang được phát triển.</p>;
            case 'payroll': return <p>Quản lý Lương thưởng đang được phát triển.</p>;
            case 'overview':
            default: return <p>Tổng quan tài chính đang được phát triển.</p>;
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Tài chính</h3>
            </div>
            <div className="admin-card-body">
                <nav className="admin-tabs">
                    <button onClick={() => setActiveTab('overview')} className={`admin-tab-button ${activeTab === 'overview' ? 'active' : ''}`}>Tổng Quan</button>
                    <button onClick={() => setActiveTab('transactions')} className={`admin-tab-button ${activeTab === 'transactions' ? 'active' : ''}`}>Giao Dịch</button>
                    <button onClick={() => setActiveTab('bills')} className={`admin-tab-button ${activeTab === 'bills' ? 'active' : ''}`}>Hóa Đơn Chi</button>
                    <button onClick={() => setActiveTab('suppliers')} className={`admin-tab-button ${activeTab === 'suppliers' ? 'active' : ''}`}>Nhà Cung Cấp</button>
                    <button onClick={() => setActiveTab('payroll')} className={`admin-tab-button ${activeTab === 'payroll' ? 'active' : ''}`}>Lương Thưởng</button>
                    <button onClick={() => setActiveTab('reports')} className={`admin-tab-button ${activeTab === 'reports' ? 'active' : ''}`}>Báo Cáo</button>
                </nav>
                <div className="mt-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

// --- TAB COMPONENTS ---

const SuppliersTab: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await getSuppliers();
                setSuppliers(data);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };
        loadData();
    }, []);

    return (
        <div>
             <div className="flex justify-end mb-4">
                <Button size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Nhà Cung Cấp</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead><tr><th>Tên NCC</th><th>Người liên hệ</th><th>Email</th><th>Điện thoại</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {isLoading ? <tr><td colSpan={5}>Đang tải...</td></tr> : suppliers.map(s => (
                            <tr key={s.id}>
                                <td className="font-semibold">{s.name}</td>
                                <td>{s.contact_person}</td>
                                <td>{s.email}</td>
                                <td>{s.phone}</td>
                                <td><Button size="sm" variant="outline"><i className="fas fa-edit"></i></Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const BillsTab: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await getBills();
                setBills(data);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };
        loadData();
    }, []);

    return (
         <div>
             <div className="flex justify-end mb-4">
                <Button size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Hóa Đơn</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead><tr><th>Số HĐ</th><th>Nhà Cung Cấp</th><th>Ngày HĐ</th><th>Hạn TT</th><th>Tổng tiền</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {isLoading ? <tr><td colSpan={7}>Đang tải...</td></tr> : bills.map(b => (
                            <tr key={b.id}>
                                <td className="font-mono text-xs">{b.bill_number}</td>
                                <td>{b.supplier_name}</td>
                                <td>{new Date(b.bill_date).toLocaleDateString('vi-VN')}</td>
                                <td>{b.due_date ? new Date(b.due_date).toLocaleDateString('vi-VN') : ''}</td>
                                <td className="font-semibold">{b.total_amount.toLocaleString('vi-VN')}₫</td>
                                <td><span className="status-badge bg-yellow-100 text-yellow-800">{b.status}</span></td>
                                <td><Button size="sm" variant="outline"><i className="fas fa-edit"></i></Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


export default FinancialManagementView;

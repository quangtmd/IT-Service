import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FinancialTransaction, PayrollRecord, User, Debt, PaymentApproval, CashflowForecastData } from '../../types';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import {
    getFinancialTransactions, deleteFinancialTransaction,
    getPayrollRecords, savePayrollRecords,
    getDebts, updateDebt,
    getPaymentApprovals, updatePaymentApproval,
    getCashflowForecast
} from '../../services/localDataService';
import { useNavigate, useLocation } from 'react-router-dom';

// --- HELPER FUNCTIONS ---
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');
const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN') + '₫';

type FinancialTab = 'overview' | 'transactions' | 'debts' | 'payroll' | 'forecast' | 'approvals' | 'reports';

// --- MAIN COMPONENT ---
const FinancialManagementView: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = (queryParams.get('tab') as FinancialTab) || 'overview';
    
    const [activeTab, setActiveTab] = useState<FinancialTab>(initialTab);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Data will be fetched within each tab component to avoid loading everything at once
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải dữ liệu tài chính.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const renderTabContent = () => {
        // We pass a key to force re-mount and data fetching when tab changes,
        // which is simpler than complex state management across tabs.
        switch (activeTab) {
            case 'transactions': return <TransactionsTab key="transactions" navigate={navigate} />;
            case 'debts': return <DebtTab key="debts" />;
            case 'payroll': return <PayrollTab key="payroll" />;
            case 'forecast': return <CashflowForecastTab key="forecast" />;
            case 'approvals': return <PaymentApprovalTab key="approvals" />;
            case 'reports': return <ReportsTab key="reports" />;
            case 'overview':
            default: return <OverviewTab key="overview" setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Tài chính & Kế toán</h3>
            </div>
            <div className="admin-card-body">
                <nav className="admin-tabs">
                    <button onClick={() => setActiveTab('overview')} className={`admin-tab-button ${activeTab === 'overview' ? 'active' : ''}`}>Tổng Quan</button>
                    <button onClick={() => setActiveTab('transactions')} className={`admin-tab-button ${activeTab === 'transactions' ? 'active' : ''}`}>Giao Dịch</button>
                    <button onClick={() => setActiveTab('debts')} className={`admin-tab-button ${activeTab === 'debts' ? 'active' : ''}`}>Công Nợ</button>
                    <button onClick={() => setActiveTab('payroll')} className={`admin-tab-button ${activeTab === 'payroll' ? 'active' : ''}`}>Lương</button>
                    <button onClick={() => setActiveTab('forecast')} className={`admin-tab-button ${activeTab === 'forecast' ? 'active' : ''}`}>Dự báo Dòng tiền</button>
                    <button onClick={() => setActiveTab('approvals')} className={`admin-tab-button ${activeTab === 'approvals' ? 'active' : ''}`}>Phê duyệt chi</button>
                    <button onClick={() => setActiveTab('reports')} className={`admin-tab-button ${activeTab === 'reports' ? 'active' : ''}`}>Báo Cáo</button>
                </nav>
                <div className="mt-6">
                    {isLoading ? <div className="text-center p-8">Đang tải...</div> : renderTabContent()}
                </div>
            </div>
        </div>
    );
};

// --- TAB SUB-COMPONENTS ---
const OverviewTab: React.FC<{setActiveTab: (tab: FinancialTab) => void}> = ({setActiveTab}) => {
    // This could fetch summary data for performance
    return <div className="text-center p-8">
        <h4 className="text-xl font-semibold">Chào mừng đến với Bảng điều khiển Tài chính</h4>
        <p className="text-textMuted mt-2">Chọn một tab ở trên để bắt đầu quản lý.</p>
        <div className="mt-6 flex justify-center gap-4">
            <Button onClick={() => setActiveTab('transactions')}>Xem Giao dịch</Button>
            <Button variant="outline" onClick={() => setActiveTab('reports')}>Xem Báo cáo</Button>
        </div>
    </div>;
}

const TransactionsTab: React.FC<{ navigate: ReturnType<typeof useNavigate> }> = ({ navigate }) => {
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        const data = await getFinancialTransactions();
        setTransactions(data);
        setIsLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleDelete = useCallback(async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa giao dịch này?')) {
            await deleteFinancialTransaction(id);
            loadData();
        }
    }, [loadData]);
    
    if (isLoading) return <p>Đang tải giao dịch...</p>;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => navigate('/admin/accounting_dashboard/transactions/new')} size="sm" leftIcon={<i className="fas fa-plus"/>}>Thêm Giao dịch</Button>
            </div>
            <div className="overflow-x-auto"><table className="admin-table">
                <thead><tr><th>Ngày</th><th>Loại</th><th>Danh mục</th><th>Mô tả</th><th>Số tiền</th><th>Hành động</th></tr></thead>
                <tbody>{transactions.map(t => (
                    <tr key={t.id}>
                        <td>{formatDate(t.date)}</td>
                        <td>{t.type === 'income' ? 'Thu' : 'Chi'}</td>
                        <td>{t.category}</td>
                        <td>{t.description}</td>
                        <td className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(t.amount)}</td>
                        <td><div className="flex gap-1">
                            <Button onClick={() => navigate(`/admin/accounting_dashboard/transactions/edit/${t.id}`)} size="sm" variant="outline"><i className="fas fa-edit"/></Button>
                            <Button onClick={() => handleDelete(t.id)} size="sm" variant="ghost" className="text-red-500"><i className="fas fa-trash"/></Button>
                        </div></td>
                    </tr>
                ))}</tbody>
            </table></div>
        </div>
    );
};

const DebtTab: React.FC = () => {
    const [debts, setDebts] = useState<Debt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const loadData = useCallback(async () => { setIsLoading(true); setDebts(await getDebts()); setIsLoading(false); }, []);
    useEffect(() => { loadData(); }, [loadData]);

    const handleMarkAsPaid = async (id: string) => {
        await updateDebt(id, { status: 'Đã thanh toán' });
        loadData();
    }

    if (isLoading) return <p>Đang tải công nợ...</p>;
    
    return (
        <div className="overflow-x-auto"><table className="admin-table">
            <thead><tr><th>Đối tượng</th><th>Loại</th><th>Số tiền</th><th>Ngày đáo hạn</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
            <tbody>{debts.map(d => (
                <tr key={d.id}>
                    <td>{d.entityName}</td>
                    <td>{d.type === 'receivable' ? 'Phải thu' : 'Phải trả'}</td>
                    <td className="font-semibold">{formatCurrency(d.amount)}</td>
                    <td>{d.dueDate ? formatDate(d.dueDate) : 'N/A'}</td>
                    <td><span className={`status-badge ${d.status === 'Đã thanh toán' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{d.status}</span></td>
                    <td>{d.status === 'Chưa thanh toán' && <Button size="sm" onClick={() => handleMarkAsPaid(d.id)}>Đánh dấu đã trả</Button>}</td>
                </tr>
            ))}</tbody>
        </table></div>
    );
};

const PayrollTab: React.FC = () => {
    const [records, setRecords] = useState<PayrollRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const loadData = useCallback(async () => { setIsLoading(true); setRecords(await getPayrollRecords()); setIsLoading(false); }, []);
    useEffect(() => { loadData(); }, [loadData]);

    if (isLoading) return <p>Đang tải dữ liệu lương...</p>;

    return (
        <div className="overflow-x-auto"><table className="admin-table">
            <thead><tr><th>Kỳ Lương</th><th>Nhân viên</th><th>Lương CB</th><th>Thưởng/Phạt</th><th>Lương cuối</th><th>Trạng thái</th></tr></thead>
            <tbody>{records.map(r => (
                <tr key={r.id}>
                    <td>{r.payPeriod}</td>
                    <td>{r.employeeName}</td>
                    <td>{formatCurrency(r.baseSalary)}</td>
                    <td>{formatCurrency(r.bonus - r.deduction)}</td>
                    <td className="font-bold">{formatCurrency(r.finalSalary)}</td>
                    <td><span className={`status-badge ${r.status === 'Đã thanh toán' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{r.status}</span></td>
                </tr>
            ))}</tbody>
        </table></div>
    );
};

const CashflowForecastTab: React.FC = () => {
    const [forecast, setForecast] = useState<CashflowForecastData | null>(null);
    useEffect(() => { getCashflowForecast().then(setForecast); }, []);

    if (!forecast) return <p>Đang tính toán dự báo...</p>;
    
    const months = Object.keys(forecast).sort();
    const maxVal = Math.max(...months.flatMap(m => [forecast[m].income, forecast[m].expense]));

    return (
        <div>
            <h4 className="admin-form-subsection-title">Dự báo Thu-Chi 3 tháng tới (dựa trên công nợ)</h4>
            <div className="flex gap-8 p-4 border rounded-lg bg-gray-50 h-64 items-end">
                {months.map(month => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="flex h-full w-full items-end gap-2 justify-center">
                            <div className="w-1/2 bg-green-200 rounded-t" title={`Thu: ${formatCurrency(forecast[month].income)}`} style={{ height: `${(forecast[month].income / maxVal) * 100}%` }}></div>
                            <div className="w-1/2 bg-red-200 rounded-t" title={`Chi: ${formatCurrency(forecast[month].expense)}`} style={{ height: `${(forecast[month].expense / maxVal) * 100}%` }}></div>
                        </div>
                        <p className="text-sm font-semibold">{month}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PaymentApprovalTab: React.FC = () => {
    const { currentUser } = useAuth();
    const [approvals, setApprovals] = useState<PaymentApproval[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const loadData = useCallback(async () => { setIsLoading(true); setApprovals(await getPaymentApprovals()); setIsLoading(false); }, []);
    useEffect(() => { loadData(); }, [loadData]);

    const handleApproval = async (id: string, status: 'Đã duyệt' | 'Đã từ chối') => {
        await updatePaymentApproval(id, { status, approverId: currentUser?.id });
        loadData();
    };
    
    if(isLoading) return <p>Đang tải yêu cầu...</p>;

    return (
         <div className="overflow-x-auto"><table className="admin-table">
            <thead><tr><th>Ngày YC</th><th>Người YC</th><th>Số tiền</th><th>Mô tả</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
            <tbody>{approvals.map(a => (
                <tr key={a.id}>
                    <td>{formatDate(a.createdAt)}</td>
                    <td>{a.requestorId}</td>
                    <td className="font-bold">{formatCurrency(a.amount)}</td>
                    <td className="max-w-xs truncate">{a.description}</td>
                    <td><span className={`status-badge ${a.status === 'Đã duyệt' ? 'bg-green-100 text-green-800' : a.status === 'Đã từ chối' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{a.status}</span></td>
                    <td>{a.status === 'Chờ duyệt' && <div className="flex gap-2">
                        <Button size="sm" className="!bg-green-500" onClick={() => handleApproval(a.id, 'Đã duyệt')}>Duyệt</Button>
                        <Button size="sm" className="!bg-red-500" onClick={() => handleApproval(a.id, 'Đã từ chối')}>Từ chối</Button>
                    </div>}</td>
                </tr>
            ))}</tbody>
        </table></div>
    );
};

const ReportsTab: React.FC = () => {
    // This is a placeholder for a more complex reporting tool
    return <div className="text-center p-8 text-textMuted">Tính năng báo cáo chi tiết đang được phát triển.</div>
}

export default FinancialManagementView;
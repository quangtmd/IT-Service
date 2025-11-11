import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FinancialTransaction, PayrollRecord, User, Debt, PaymentApproval, CashflowForecastData } from '../../types';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import {
    getFinancialTransactions, deleteFinancialTransaction,
    getPayrollRecords, savePayrollRecords,
    getDebts, updateDebt,
    getPaymentApprovals, updatePaymentApproval,
    getCashflowForecast
} from '../../services/localDataService';
import { useNavigate, useLocation, NavigateFunction } from 'react-router-dom';

// --- HELPER FUNCTIONS & COMPONENTS ---
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');
const formatCurrency = (amount: number) => amount.toLocaleString('vi-VN') + '₫';

type FinancialTab = 'overview' | 'transactions' | 'debts' | 'payroll' | 'forecast' | 'approvals' | 'reports';

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string; onClick?: () => void }> = ({ title, value, icon, color, onClick }) => (
    <div onClick={onClick} className={`p-4 rounded-lg shadow flex items-center cursor-pointer hover:shadow-lg transition-shadow ${color}`}>
        <div className="p-3 rounded-full bg-white/30 mr-4">
            <i className={`fas ${icon} text-2xl text-white`}></i>
        </div>
        <div>
            <p className="text-sm font-medium text-white/90">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

// --- MAIN COMPONENT ---
const FinancialManagementView: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = (queryParams.get('tab') as FinancialTab) || 'overview';
    
    const [activeTab, setActiveTab] = useState<FinancialTab>(initialTab);
    const navigate = useNavigate();

    const renderTabContent = () => {
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
    
    const handleTabChange = (tab: FinancialTab) => {
        setActiveTab(tab);
    }

    return (
        <div className="space-y-6">
            <nav className="admin-tabs">
                <button onClick={() => handleTabChange('overview')} className={`admin-tab-button ${activeTab === 'overview' ? 'active' : ''}`}>Tổng Quan</button>
                <button onClick={() => handleTabChange('transactions')} className={`admin-tab-button ${activeTab === 'transactions' ? 'active' : ''}`}>Giao Dịch</button>
                <button onClick={() => handleTabChange('debts')} className={`admin-tab-button ${activeTab === 'debts' ? 'active' : ''}`}>Công Nợ</button>
                <button onClick={() => handleTabChange('payroll')} className={`admin-tab-button ${activeTab === 'payroll' ? 'active' : ''}`}>Lương</button>
                <button onClick={() => handleTabChange('forecast')} className={`admin-tab-button ${activeTab === 'forecast' ? 'active' : ''}`}>Dự báo Dòng tiền</button>
                <button onClick={() => handleTabChange('approvals')} className={`admin-tab-button ${activeTab === 'approvals' ? 'active' : ''}`}>Phê duyệt chi</button>
                <button onClick={() => handleTabChange('reports')} className={`admin-tab-button ${activeTab === 'reports' ? 'active' : ''}`}>Báo Cáo</button>
            </nav>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

// --- TAB SUB-COMPONENTS ---
const OverviewTab: React.FC<{setActiveTab: (tab: FinancialTab) => void}> = ({setActiveTab}) => {
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [transData, debtData] = await Promise.all([getFinancialTransactions(), getDebts()]);
            setTransactions(transData);
            setDebts(debtData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const summary = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyTrans = transactions.filter(t => new Date(t.date) >= startOfMonth);
        
        const income = monthlyTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = monthlyTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const profit = income - expense;
        const receivable = debts.filter(d => d.type === 'receivable' && d.status !== 'Đã thanh toán').reduce((s, d) => s + d.amount, 0);
        const recent = transactions.slice(0, 5);

        // Chart data
        const dailyData: Record<string, { income: number, expense: number }> = {};
        for(let i=0; i<30; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            dailyData[d.toLocaleDateString('vi-VN')] = { income: 0, expense: 0 };
        }
        transactions.forEach(t => {
            const day = new Date(t.date).toLocaleDateString('vi-VN');
            if(dailyData[day]) {
                dailyData[day][t.type] += t.amount;
            }
        });
        const chartData = Object.entries(dailyData).map(([day, values]) => ({ day, ...values })).reverse();
        
        return { income, expense, profit, receivable, recent, chartData };
    }, [transactions, debts]);

    if (isLoading) return <div className="text-center p-8">Đang tải dữ liệu tổng quan...</div>;

    const maxChartValue = Math.max(...summary.chartData.flatMap(d => [d.income, d.expense]), 1);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Tổng Thu (Tháng)" value={formatCurrency(summary.income)} icon="fa-arrow-up" color="bg-green-500" onClick={() => setActiveTab('transactions')} />
                <StatCard title="Tổng Chi (Tháng)" value={formatCurrency(summary.expense)} icon="fa-arrow-down" color="bg-red-500" onClick={() => setActiveTab('transactions')} />
                <StatCard title="Lợi Nhuận (Tháng)" value={formatCurrency(summary.profit)} icon="fa-balance-scale" color="bg-blue-500" onClick={() => setActiveTab('reports')} />
                <StatCard title="Công Nợ Phải Thu" value={formatCurrency(summary.receivable)} icon="fa-file-invoice-dollar" color="bg-orange-500" onClick={() => setActiveTab('debts')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 admin-card">
                    <div className="admin-card-header"><h3 className="admin-card-title">Doanh Thu & Chi Phí (30 ngày qua)</h3></div>
                    <div className="admin-card-body">
                        <div className="h-64 flex gap-1 items-end">
                            {summary.chartData.map(d => (
                                <div key={d.day} className="flex-1 flex flex-col items-center group relative">
                                    <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {d.day}<br/>
                                        Thu: {formatCurrency(d.income)}<br/>
                                        Chi: {formatCurrency(d.expense)}
                                    </div>
                                    <div className="w-full h-full flex items-end gap-1">
                                         <div className="w-1/2 bg-green-300 rounded-t" style={{ height: `${(d.income / maxChartValue) * 100}%` }}></div>
                                         <div className="w-1/2 bg-red-300 rounded-t" style={{ height: `${(d.expense / maxChartValue) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                 <div className="admin-card">
                    <div className="admin-card-header"><h3 className="admin-card-title">Giao Dịch Gần Đây</h3></div>
                    <div className="admin-card-body overflow-y-auto">
                        <ul className="space-y-3">
                            {summary.recent.map(t => (
                                <li key={t.id} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-medium text-textBase">{t.description}</p>
                                        <p className="text-xs text-textMuted">{new Date(t.date).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <p className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(t.amount)}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

const TransactionsTab: React.FC<{ navigate: NavigateFunction }> = ({ navigate }) => {
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const loadData = useCallback(async () => { setIsLoading(true); setTransactions(await getFinancialTransactions()); setIsLoading(false); }, []);
    useEffect(() => { loadData(); }, [loadData]);

    const handleDelete = useCallback(async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa giao dịch này?')) { await deleteFinancialTransaction(id); loadData(); }
    }, [loadData]);
    
    if (isLoading) return <p>Đang tải giao dịch...</p>;

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Giao dịch</h3>
                <Button onClick={() => navigate('/admin/accounting_dashboard/transactions/new')} size="sm" leftIcon={<i className="fas fa-plus"/>}>Thêm Giao dịch</Button>
            </div>
            <div className="admin-card-body overflow-x-auto"><table className="admin-table">
                <thead className="thead-brand"><tr><th>Ngày</th><th>Loại</th><th>Danh mục</th><th>Mô tả</th><th>Số tiền</th><th>Hành động</th></tr></thead>
                <tbody>{transactions.map(t => (
                    <tr key={t.id}>
                        <td>{formatDate(t.date)}</td>
                        <td><span className={`status-badge ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.type === 'income' ? 'Thu' : 'Chi'}</span></td>
                        <td>{t.category}</td>
                        <td className="max-w-xs truncate">{t.description}</td>
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

    const handleMarkAsPaid = async (id: string) => { await updateDebt(id, { status: 'Đã thanh toán' }); loadData(); };

    if (isLoading) return <p>Đang tải công nợ...</p>;
    
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Công nợ</h3>
                <div className="admin-actions-bar">
                    <Button size="sm" variant="outline" leftIcon={<i className="fas fa-file-excel"/>}>Xuất Excel</Button>
                    <Button size="sm" leftIcon={<i className="fas fa-plus"/>}>Tạo Công nợ</Button>
                </div>
            </div>
            <div className="admin-card-body">
                <div className="filter-tabs">
                    <Button size="sm" variant="primary">Tất cả</Button>
                    <Button size="sm" variant="outline">Phải thu</Button>
                    <Button size="sm" variant="outline">Phải trả</Button>
                    <Button size="sm" variant="outline">Quá hạn</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead className="thead-brand">
                            <tr>
                                <th>Đối tượng</th>
                                <th>Loại</th>
                                <th className="text-right">Số tiền</th>
                                <th>Ngày đáo hạn</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {debts.map(d => (
                                <tr key={d.id}>
                                    <td>{d.entityName} <span className="text-xs text-gray-500">({d.entityType === 'customer' ? 'KH' : 'NCC'})</span></td>
                                    <td>
                                        <span className={`font-medium ${d.type === 'receivable' ? 'text-blue-600' : 'text-orange-600'}`}>
                                            {d.type === 'receivable' ? 'Phải thu' : 'Phải trả'}
                                        </span>
                                    </td>
                                    <td className="font-semibold text-right">{formatCurrency(d.amount)}</td>
                                    <td>{d.dueDate ? formatDate(d.dueDate) : 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${d.status === 'Đã thanh toán' ? 'bg-green-100 text-green-800' : d.status === 'Quá hạn' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            {d.status !== 'Đã thanh toán' && 
                                                <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(d.id)}>
                                                    <i className="fas fa-check mr-1"></i> Đã TT
                                                </Button>
                                            }
                                            <Button size="sm" variant="ghost" className="text-textSubtle"><i className="fas fa-ellipsis-h"></i></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const PayrollTab: React.FC = () => { return <div className="text-center p-8 text-textMuted">Tính năng lương đang được tích hợp vào module Nhân sự (HRM).</div>; };
const CashflowForecastTab: React.FC = () => { return <div className="text-center p-8 text-textMuted">Tính năng đang được xây dựng.</div>; };
const PaymentApprovalTab: React.FC = () => { return <div className="text-center p-8 text-textMuted">Tính năng đang được xây dựng.</div>;};
const ReportsTab: React.FC = () => { return <div className="text-center p-8 text-textMuted">Tính năng báo cáo chi tiết đang được phát triển.</div>; };

export default FinancialManagementView;
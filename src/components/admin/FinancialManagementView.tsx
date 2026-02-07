
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FinancialTransaction, PayrollRecord, User, Debt, PaymentApproval, CashflowForecastData, TransactionType, AdminView } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import {
    getFinancialTransactions, addFinancialTransaction, updateFinancialTransaction, deleteFinancialTransaction as apiDeleteFinancialTransaction,
    getPayrollRecords, savePayrollRecords,
    getDebts, updateDebt,
    getPaymentApprovals, updatePaymentApproval,
    getCashflowForecast
} from '../../services/localDataService';
import { useNavigate, useLocation, NavigateFunction } from 'react-router-dom';

// --- HELPER FUNCTIONS & COMPONENTS ---
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

type FinancialTab = 'overview' | 'invoices' | 'expenses' | 'debts' | 'payroll' | 'forecast' | 'approvals' | 'reports';

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string; onClick?: () => void }> = ({ title, value, icon, color, onClick }) => (
    <div onClick={onClick} className={`p-4 rounded-lg shadow flex items-center cursor-pointer hover:shadow-lg transition-shadow ${color} stat-card-pattern`}>
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
const FinancialManagementView: React.FC<{activeView?: AdminView}> = ({ activeView }) => {
    const [activeTab, setActiveTab] = useState<FinancialTab>('overview');
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [approvals, setApprovals] = useState<PaymentApproval[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Map activeView (from URL/AdminPage) to internal activeTab
    useEffect(() => {
        if (activeView) {
            switch(activeView) {
                case 'invoices': setActiveTab('invoices'); break;
                case 'expenses': setActiveTab('expenses'); break;
                case 'debt_management': setActiveTab('debts'); break;
                case 'cashflow_forecast': setActiveTab('forecast'); break;
                case 'payment_approval': setActiveTab('approvals'); break;
                case 'accounting_dashboard': 
                default: setActiveTab('overview'); break;
            }
        }
    }, [activeView]);


    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [trans, payroll, appr, debtList] = await Promise.all([
                getFinancialTransactions(),
                getPayrollRecords(),
                getPaymentApprovals(),
                getDebts()
            ]);
            setTransactions(trans);
            setPayrollRecords(payroll);
            setApprovals(appr);
            setDebts(debtList);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải dữ liệu tài chính.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const addTransaction = useCallback(async (newTransaction: Omit<FinancialTransaction, 'id'>) => {
        try {
            await addFinancialTransaction(newTransaction);
            loadData(); // Re-fetch all data to ensure consistency
        } catch (error) {
            console.error(error);
            alert("Lỗi khi thêm giao dịch.");
        }
    }, [loadData]);

    const handleTabChange = (tab: FinancialTab) => {
        setActiveTab(tab);
        // Optional: Update URL to reflect tab change if needed, but keeping it simple for internal state
    }

    const renderTabContent = () => {
        if (isLoading) return <div className="text-center p-8">Đang tải dữ liệu tài chính...</div>;
        if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

        switch (activeTab) {
            case 'invoices': return <TransactionListTab type="income" transactions={transactions} onDataChange={loadData} navigate={navigate} title="Hóa Đơn / Phiếu Thu" />;
            case 'expenses': return <TransactionListTab type="expense" transactions={transactions} onDataChange={loadData} navigate={navigate} title="Phiếu Chi" />;
            case 'debts': return <DebtTab debts={debts} onDataChange={loadData} />;
            case 'payroll': return <PayrollTab payrollRecords={payrollRecords} onDataChange={loadData} onAddTransaction={addTransaction} />;
            case 'forecast': return <CashflowForecastTab debts={debts} transactions={transactions} />;
            case 'approvals': return <PaymentApprovalTab approvals={approvals} onDataChange={loadData} />;
            case 'reports': return <ReportsTab transactions={transactions} />;
            case 'overview':
            default: return <OverviewTab transactions={transactions} setActiveTab={handleTabChange} />;
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quản lý Tài chính</h3>
            </div>
            <div className="admin-card-body">
                <nav className="admin-tabs">
                    <button onClick={() => handleTabChange('overview')} className={`admin-tab-button ${activeTab === 'overview' ? 'active' : ''}`}>Tổng Quan</button>
                    <button onClick={() => handleTabChange('invoices')} className={`admin-tab-button ${activeTab === 'invoices' ? 'active' : ''}`}>Phiếu Thu</button>
                    <button onClick={() => handleTabChange('expenses')} className={`admin-tab-button ${activeTab === 'expenses' ? 'active' : ''}`}>Phiếu Chi</button>
                    <button onClick={() => handleTabChange('debts')} className={`admin-tab-button ${activeTab === 'debts' ? 'active' : ''}`}>Công Nợ</button>
                    <button onClick={() => handleTabChange('forecast')} className={`admin-tab-button ${activeTab === 'forecast' ? 'active' : ''}`}>Dự báo Dòng tiền</button>
                    <button onClick={() => handleTabChange('approvals')} className={`admin-tab-button ${activeTab === 'approvals' ? 'active' : ''}`}>Phê duyệt chi</button>
                </nav>
                <div className="mt-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

// --- TAB COMPONENTS ---

const OverviewTab: React.FC<{ transactions: FinancialTransaction[], setActiveTab: (tab: FinancialTab) => void }> = ({ transactions, setActiveTab }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyTransactions = transactions.filter(t => new Date(t.date) >= startOfMonth);

    const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;

    const recentTransactions = transactions.slice(0, 5);

    return (
        <div>
            <h4 className="admin-form-subsection-title">Tổng quan Tháng {now.getMonth() + 1}/{now.getFullYear()}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="Tổng Thu" value={formatCurrency(totalIncome)} icon="fa-arrow-up" color="bg-green-500" onClick={() => setActiveTab('invoices')} />
                <StatCard title="Tổng Chi" value={formatCurrency(totalExpense)} icon="fa-arrow-down" color="bg-red-500" onClick={() => setActiveTab('expenses')} />
                <StatCard title="Lợi Nhuận" value={formatCurrency(netProfit)} icon="fa-chart-line" color="bg-blue-500" onClick={() => setActiveTab('reports')} />
            </div>
             <h4 className="admin-form-subsection-title">Giao dịch gần đây</h4>
             <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead><tr><th>Ngày</th><th>Loại</th><th>Mô tả</th><th>Số tiền</th></tr></thead>
                    <tbody>
                        {recentTransactions.map(t => (
                            <tr key={t.id}>
                                <td>{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                                <td><span className={`status-badge ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.type === 'income' ? 'Thu' : 'Chi'}</span></td>
                                <td>{t.description}</td>
                                <td className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(t.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Reusable component for Invoices and Expenses lists
const TransactionListTab: React.FC<{ type: TransactionType, transactions: FinancialTransaction[], onDataChange: () => void, navigate: NavigateFunction, title: string }> = ({ type, transactions, onDataChange, navigate, title }) => {
    
    const filteredTransactions = useMemo(() => transactions.filter(t => t.type === type), [transactions, type]);

    const handleEditTransaction = (transactionId: string) => {
        navigate(`/admin/accounting_dashboard/transactions/edit/${transactionId}`);
    };

    const handleDelete = async (id: string) => {
        const isConfirmed = window.confirm('Bạn có chắc muốn xóa phiếu này?');
        if(isConfirmed) {
            try {
                await apiDeleteFinancialTransaction(id);
                onDataChange();
            } catch (error) {
                console.error("Delete transaction error:", error);
                window.alert("Lỗi khi xóa giao dịch.");
            }
        }
    };

    const handleAddNew = () => {
        // Pass state or query param to pre-select type
        navigate(`/admin/accounting_dashboard/transactions/new?type=${type}`);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-700">{title}</h4>
                <Button onClick={handleAddNew} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Tạo {title}</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead><tr><th>Ngày</th><th>Danh mục</th><th>Mô tả</th><th>Đối tượng</th><th>Số tiền</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                            <tr key={t.id}>
                                <td>{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                                <td>{t.category}</td>
                                <td>{t.description}</td>
                                <td>{t.relatedEntity || '-'}</td>
                                <td className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(t.amount)}</td>
                                <td>
                                    <div className="flex gap-1">
                                        <Button onClick={() => handleEditTransaction(t.id)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                        <Button onClick={() => handleDelete(t.id)} size="sm" variant="ghost" className="text-red-500"><i className="fas fa-trash"></i></Button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="text-center py-4 text-textMuted">Chưa có dữ liệu.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DebtTab: React.FC<{ debts: Debt[], onDataChange: () => void }> = ({ debts, onDataChange }) => {
    
    const handleMarkAsPaid = async (id: string) => { 
        await updateDebt(id, { status: 'Đã thanh toán' }); 
        onDataChange(); 
    };

    return (
        <div className="p-0">
             <div className="flex justify-end mb-4">
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white border-none"><i className="fas fa-plus mr-2"></i> Tạo Công nợ</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead>
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
                        {debts.length > 0 ? debts.map(d => (
                            <tr key={d.id}>
                                <td>
                                    <div className="font-medium">{d.entityName}</div>
                                    <div className="text-xs text-gray-500">{d.entityType === 'customer' ? 'Khách hàng' : 'Nhà cung cấp'}</div>
                                </td>
                                <td>
                                    <span className={`text-xs font-semibold ${d.type === 'receivable' ? 'text-blue-600' : 'text-orange-600'}`}>
                                        {d.type === 'receivable' ? 'Phải thu' : 'Phải trả'}
                                    </span>
                                </td>
                                <td className="text-right font-bold">{formatCurrency(d.amount)}</td>
                                <td>{d.dueDate ? formatDate(d.dueDate) : 'N/A'}</td>
                                <td>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        d.status === 'Đã thanh toán' ? 'bg-green-100 text-green-700' : 
                                        d.status === 'Quá hạn' ? 'bg-red-100 text-red-700' : 
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {d.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        {d.status !== 'Đã thanh toán' && 
                                            <button onClick={() => handleMarkAsPaid(d.id)} className="text-green-600 hover:text-green-800" title="Đánh dấu đã thanh toán">
                                                <i className="fas fa-check-circle"></i>
                                            </button>
                                        }
                                    </div>
                                </td>
                            </tr>
                        )) : <tr><td colSpan={6} className="text-center py-4 text-textMuted">Chưa có công nợ.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CashflowForecastTab: React.FC<{ debts: Debt[], transactions: FinancialTransaction[] }> = ({ debts, transactions }) => {
    // Logic: 
    // 1. Get current month + next 2 months.
    // 2. Calculate "Receivable" debts due in those months -> Projected Income.
    // 3. Calculate "Payable" debts due in those months -> Projected Expense.
    // 4. Calculate average monthly expenses from `transactions` (excluding COGS if possible, or simple average) -> Add to Projected Expense.

    const forecast = useMemo(() => {
        const today = new Date();
        const months = [];
        for (let i = 0; i < 3; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
            months.push({ 
                date: d, 
                label: d.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
                income: 0,
                expense: 0
            });
        }

        // Project from Debts
        debts.forEach(debt => {
            if (debt.status === 'Đã thanh toán' || !debt.dueDate) return;
            const dueDate = new Date(debt.dueDate);
            const monthIndex = months.findIndex(m => 
                m.date.getMonth() === dueDate.getMonth() && m.date.getFullYear() === dueDate.getFullYear()
            );
            
            if (monthIndex !== -1) {
                if (debt.type === 'receivable') {
                    months[monthIndex].income += debt.amount;
                } else {
                    months[monthIndex].expense += debt.amount;
                }
            }
        });

        // Add Estimated Regular Expenses (Average of last 3 months)
        // This is a simplified estimation
        const last3MonthsExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const avgMonthlyExpense = last3MonthsExpenses / 3 || 0;

        months.forEach(m => {
            m.expense += avgMonthlyExpense;
        });

        return months;

    }, [debts, transactions]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {forecast.map((item, idx) => (
                    <Card key={idx} className="!p-4 border-t-4 border-blue-500">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">{item.label}</h4>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Dự thu:</span>
                            <span className="font-bold text-green-600">{formatCurrency(item.income)}</span>
                        </div>
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Dự chi:</span>
                            <span className="font-bold text-red-600">{formatCurrency(item.expense)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between items-center">
                            <span className="text-gray-800 font-medium">Dòng tiền ròng:</span>
                            <span className={`font-bold ${item.income - item.expense >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {formatCurrency(item.income - item.expense)}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>
            <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
                <i className="fas fa-info-circle mr-2"></i>
                Dự báo được tính dựa trên các khoản công nợ sắp đến hạn và chi phí trung bình hàng tháng.
            </div>
        </div>
    );
};

const PaymentApprovalTab: React.FC<{ approvals: PaymentApproval[], onDataChange: () => void }> = ({ approvals, onDataChange }) => {
    
    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        const newStatus = action === 'approve' ? 'Đã duyệt' : 'Đã từ chối';
        if (window.confirm(`Bạn có chắc chắn muốn ${newStatus.toLowerCase()} yêu cầu này?`)) {
            try {
                await updatePaymentApproval(id, { status: newStatus });
                onDataChange();
                alert(`Đã ${newStatus.toLowerCase()} yêu cầu.`);
            } catch (error) {
                alert("Đã xảy ra lỗi.");
            }
        }
    };

    return (
        <div className="overflow-x-auto">
             <table className="admin-table">
                <thead>
                    <tr>
                        <th>Người yêu cầu</th>
                        <th>Số tiền</th>
                        <th>Lý do chi</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {approvals.length > 0 ? approvals.map(appr => (
                        <tr key={appr.id}>
                            <td className="font-medium">{appr.requestorId}</td> {/* In real app, map ID to Name */}
                            <td className="font-bold text-red-600">{formatCurrency(appr.amount)}</td>
                            <td>{appr.description}</td>
                            <td>{new Date(appr.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td>
                                <span className={`status-badge ${
                                    appr.status === 'Đã duyệt' ? 'bg-green-100 text-green-800' :
                                    appr.status === 'Đã từ chối' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {appr.status}
                                </span>
                            </td>
                            <td>
                                {appr.status === 'Chờ duyệt' && (
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleAction(appr.id, 'approve')} className="bg-green-600 hover:bg-green-700 text-white border-none">Duyệt</Button>
                                        <Button size="sm" onClick={() => handleAction(appr.id, 'reject')} className="bg-red-600 hover:bg-red-700 text-white border-none">Từ chối</Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={6} className="text-center py-4 text-textMuted">Không có yêu cầu phê duyệt nào.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const ReportsTab: React.FC<{ transactions: FinancialTransaction[] }> = ({ transactions }) => {
    const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const setDateRange = (period: 'week' | 'month' | 'year') => {
        const today = new Date();
        if (period === 'week') {
            const start = new Date(today);
            start.setDate(today.getDate() - 7);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
        } else if (period === 'month') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
        } else if (period === 'year') {
            const start = new Date(today.getFullYear(), 0, 1);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
        }
    };

    const filteredTransactions = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= start && tDate <= end;
        });
    }, [transactions, startDate, endDate]);

    const summary = useMemo(() => {
        let income = 0;
        let expense = 0;
        const incomeByCategory: Record<string, number> = {};
        const expenseByCategory: Record<string, number> = {};

        filteredTransactions.forEach(t => {
            if (t.type === 'income') {
                income += t.amount;
                incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
            } else if (t.type === 'expense') {
                expense += t.amount;
                expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
            }
        });

        const net = income - expense;
        return { income, expense, net, incomeByCategory, expenseByCategory };
    }, [filteredTransactions]);

    return (
        <div>
            <div className="flex flex-wrap gap-4 items-center mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDateRange('week')}>Tuần này</Button>
                    <Button size="sm" variant="outline" onClick={() => setDateRange('month')}>Tháng này</Button>
                    <Button size="sm" variant="outline" onClick={() => setDateRange('year')}>Năm nay</Button>
                </div>
                <div className="flex gap-2 items-center">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="admin-form-group" />
                    <span>-</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="admin-form-group" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"><h5 className="text-sm text-gray-500">Tổng Thu</h5><p className="text-2xl font-bold text-green-600">{formatCurrency(summary.income)}</p></div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"><h5 className="text-sm text-gray-500">Tổng Chi</h5><p className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</p></div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"><h5 className="text-sm text-gray-500">Lợi Nhuận</h5><p className={`text-2xl font-bold ${summary.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{formatCurrency(summary.net)}</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="admin-form-subsection-title">Chi tiết Khoản Thu</h5>
                    {Object.keys(summary.incomeByCategory).length > 0 ? (
                        <ul className="text-sm space-y-2">
                            {Object.entries(summary.incomeByCategory).map(([cat, amount]) => <li key={cat} className="flex justify-between p-2 bg-gray-50 rounded"><span>{cat}</span><strong className="text-green-600">{formatCurrency(amount as number)}</strong></li>)}
                        </ul>
                    ) : <p className="text-sm text-gray-500">Không có khoản thu nào trong kỳ.</p>}
                </div>
                 <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="admin-form-subsection-title">Chi tiết Khoản Chi</h5>
                    {Object.keys(summary.expenseByCategory).length > 0 ? (
                        <ul className="text-sm space-y-2">
                            {Object.entries(summary.expenseByCategory).map(([cat, amount]) => <li key={cat} className="flex justify-between p-2 bg-gray-50 rounded"><span>{cat}</span><strong className="text-red-600">{formatCurrency(amount as number)}</strong></li>)}
                        </ul>
                    ) : <p className="text-sm text-gray-500">Không có khoản chi nào trong kỳ.</p>}
                </div>
            </div>
        </div>
    );
};

interface PayrollTabProps {
    payrollRecords: PayrollRecord[];
    onDataChange: () => Promise<void>;
    onAddTransaction: (trans: Omit<FinancialTransaction, 'id'>) => Promise<void>;
}

const PayrollTab: React.FC<PayrollTabProps> = ({ payrollRecords, onDataChange, onAddTransaction }) => {
    const { users } = useAuth();
    const staff = users.filter(u => u.role === 'admin' || u.role === 'staff');
    const [payPeriod, setPayPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

    const [localPayroll, setLocalPayroll] = useState<PayrollRecord[]>(payrollRecords);
    useEffect(() => setLocalPayroll(payrollRecords), [payrollRecords]);

    const handlePayrollChange = (employeeId: string, field: 'baseSalary' | 'bonus' | 'deduction' | 'notes', value: string | number) => {
        setLocalPayroll(currentPayroll => {
             const existingRecord = currentPayroll.find(p => p.payPeriod === payPeriod && p.employeeId === employeeId);
             let updatedRecord: PayrollRecord;
            if (existingRecord) {
                updatedRecord = { ...existingRecord, [field]: value };
            } else {
                const employee = staff.find(s => s.id === employeeId)!;
                updatedRecord = {
                    id: `payroll-${payPeriod}-${employeeId}`, employeeId, employeeName: employee.username, payPeriod,
                    baseSalary: 0, bonus: 0, deduction: 0, finalSalary: 0, notes: '', status: 'Chưa thanh toán',
                    [field]: value
                };
            }
            updatedRecord.finalSalary = Number(updatedRecord.baseSalary) + Number(updatedRecord.bonus) - Number(updatedRecord.deduction);
            const otherRecords = currentPayroll.filter(p => p.id !== updatedRecord.id);
            return [updatedRecord, ...otherRecords];
        });
    };
    
    const handleSettlePayroll = async () => {
        if (!window.confirm(`Bạn có chắc muốn chốt và thanh toán lương cho tháng ${payPeriod}?`)) return;

        const recordsToSettle = localPayroll.filter(p => p.payPeriod === payPeriod && p.status === 'Chưa thanh toán' && p.finalSalary > 0);
        if (recordsToSettle.length === 0) {
            alert('Không có lương để thanh toán cho kỳ này.');
            return;
        }
        
        const totalSalaryExpense = recordsToSettle.reduce((sum, r) => sum + r.finalSalary, 0);

        try {
            const recordsToSave: PayrollRecord[] = localPayroll.filter(p => p.payPeriod === payPeriod).map(r => {
                const shouldSettle = recordsToSettle.some(s => s.id === r.id);
                return shouldSettle ? { ...r, status: 'Đã thanh toán' as const } : r;
            });
            
            await savePayrollRecords(recordsToSave);
            
            await onAddTransaction({
                date: new Date().toISOString(),
                amount: totalSalaryExpense,
                type: 'expense',
                category: 'Chi phí Lương',
                description: `Thanh toán lương tháng ${payPeriod}`
            });
            alert('Chốt lương và tạo giao dịch chi thành công!');
            await onDataChange();
        } catch (error) {
            console.error("Lỗi khi chốt lương:", error);
            alert('Lỗi khi chốt lương.');
        }
    };
    
    const handleSaveDraft = async () => {
        const recordsToSave: PayrollRecord[] = localPayroll.filter(p => p.payPeriod === payPeriod);
        if(recordsToSave.length === 0) {
            alert("Không có dữ liệu lương để lưu nháp.");
            return;
        }
        try {
            await savePayrollRecords(recordsToSave);
            alert('Đã lưu nháp lương thành công!');
            await onDataChange();
        } catch (error) {
            console.error("Lỗi khi lưu nháp lương:", error);
            alert("Đã có lỗi xảy ra khi lưu nháp lương.");
        }
    };


    return (
        <div>
            <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label htmlFor="payPeriod" className="font-medium text-gray-700">Chọn kỳ lương:</label>
                <input type="month" id="payPeriod" value={payPeriod} onChange={e => setPayPeriod(e.target.value)} className="admin-form-group !mb-0"/>
                <div className="ml-auto flex gap-2">
                     <Button onClick={() => handleSaveDraft()} size="sm" variant="outline">Lưu Nháp</Button>
                     <Button onClick={() => handleSettlePayroll()} size="sm" variant="primary" leftIcon={<i className="fas fa-check-circle"></i>}>Chốt & Thanh toán</Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead><tr><th>Nhân viên</th><th>Lương Cơ bản</th><th>Thưởng</th><th>Phạt</th><th>Tổng Lương</th><th>Ghi chú</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                        {staff.map(employee => {
                            const record = localPayroll.find(p => p.payPeriod === payPeriod && p.employeeId === employee.id);
                            return (
                                <tr key={employee.id}>
                                    <td>{employee.username}</td>
                                    <td><input type="number" value={record?.baseSalary || 0} onChange={e => handlePayrollChange(employee.id, 'baseSalary', Number(e.target.value))} className="admin-form-group !p-1 w-28 text-right" /></td>
                                    <td><input type="number" value={record?.bonus || 0} onChange={e => handlePayrollChange(employee.id, 'bonus', Number(e.target.value))} className="admin-form-group !p-1 w-24 text-right" /></td>
                                    <td><input type="number" value={record?.deduction || 0} onChange={e => handlePayrollChange(employee.id, 'deduction', Number(e.target.value))} className="admin-form-group !p-1 w-24 text-right" /></td>
                                    <td className="font-bold text-right">{formatCurrency(record ? record.finalSalary : 0)}</td>
                                    <td><input type="text" value={record?.notes || ''} onChange={e => handlePayrollChange(employee.id, 'notes', e.target.value)} className="admin-form-group !p-1 w-full" /></td>
                                    <td><span className={`status-badge ${record?.status === 'Đã thanh toán' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{record?.status || 'Chưa thanh toán'}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default FinancialManagementView;

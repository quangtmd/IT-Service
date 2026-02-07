
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FinancialTransaction, PayrollRecord, User, Debt, PaymentApproval, CashflowForecastData } from '../../types';
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

type FinancialTab = 'overview' | 'transactions' | 'debts' | 'payroll' | 'forecast' | 'approvals' | 'reports';

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
const FinancialManagementView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<FinancialTab>('overview');
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [trans, payroll] = await Promise.all([
                getFinancialTransactions(),
                getPayrollRecords()
            ]);
            setTransactions(trans);
            setPayrollRecords(payroll);
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

    const renderTabContent = () => {
        if (isLoading) return <div className="text-center p-8">Đang tải dữ liệu tài chính...</div>;
        if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

        switch (activeTab) {
            case 'transactions': return <TransactionsTab transactions={transactions} onDataChange={loadData} navigate={navigate} />;
            case 'debts': return <DebtTab debts={[]} onDataChange={loadData} />; // Debts loaded internally in DebtTab or pass them down if fetched in main
            case 'reports': return <ReportsTab transactions={transactions} />;
            case 'payroll': return <PayrollTab payrollRecords={payrollRecords} onDataChange={loadData} onAddTransaction={addTransaction} />;
            case 'overview':
            default: return <OverviewTab transactions={transactions} setActiveTab={setActiveTab} />;
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
                    <button onClick={() => setActiveTab('debts')} className={`admin-tab-button ${activeTab === 'debts' ? 'active' : ''}`}>Công Nợ</button>
                    <button onClick={() => setActiveTab('reports')} className={`admin-tab-button ${activeTab === 'reports' ? 'active' : ''}`}>Báo Cáo</button>
                    <button onClick={() => setActiveTab('payroll')} className={`admin-tab-button ${activeTab === 'payroll' ? 'active' : ''}`}>Lương Thưởng</button>
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
                <StatCard title="Tổng Thu" value={formatCurrency(totalIncome)} icon="fa-arrow-up" color="bg-green-500" onClick={() => setActiveTab('transactions')} />
                <StatCard title="Tổng Chi" value={formatCurrency(totalExpense)} icon="fa-arrow-down" color="bg-red-500" onClick={() => setActiveTab('transactions')} />
                <StatCard title="Lợi Nhuận" value={formatCurrency(netProfit)} icon="fa-chart-line" color="bg-blue-500" onClick={() => setActiveTab('reports')} />
            </div>
             <h4 className="admin-form-subsection-title">Giao dịch gần đây</h4>
             <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead><tr><th>Ngày</th><th>Mô tả</th><th>Số tiền</th></tr></thead>
                    <tbody>
                        {recentTransactions.map(t => (
                            <tr key={t.id}>
                                <td>{new Date(t.date).toLocaleDateString('vi-VN')}</td>
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

const TransactionsTab: React.FC<{ transactions: FinancialTransaction[], onDataChange: () => void, navigate: NavigateFunction }> = ({ transactions, onDataChange, navigate }) => {

    const handleEditTransaction = (transactionId: string) => {
        navigate(`/admin/accounting_dashboard/transactions/edit/${transactionId}`);
    };

    const handleDelete = async (id: string) => {
        const isConfirmed = window.confirm('Bạn có chắc muốn xóa giao dịch này?');
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

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => navigate('/admin/accounting_dashboard/transactions/new')} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Giao dịch</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead><tr><th>Ngày</th><th>Loại</th><th>Danh mục</th><th>Mô tả</th><th>Số tiền</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id}>
                                <td>{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                                <td>{t.type === 'income' ? 'Thu' : 'Chi'}</td>
                                <td>{t.category}</td>
                                <td>{t.description}</td>
                                <td className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(t.amount)}</td>
                                <td>
                                    <div className="flex gap-1">
                                        <Button onClick={() => handleEditTransaction(t.id)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                        <Button onClick={() => handleDelete(t.id)} size="sm" variant="ghost" className="text-red-500"><i className="fas fa-trash"></i></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DebtTab: React.FC<{ debts: Debt[], onDataChange: () => void }> = ({ debts: initialDebts, onDataChange }) => {
    const [debts, setDebts] = useState<Debt[]>(initialDebts || []);
    
    // Fetch debts if not provided or to ensure fresh data
    useEffect(() => {
        const fetchDebts = async () => {
            const data = await getDebts();
            setDebts(data);
        };
        fetchDebts();
    }, [initialDebts]);

    const handleMarkAsPaid = async (id: string) => { 
        await updateDebt(id, { status: 'Đã thanh toán' }); 
        const updatedDebts = await getDebts();
        setDebts(updatedDebts);
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
                        {debts.map(d => (
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
                        ))}
                    </tbody>
                </table>
            </div>
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
    
    // Sync props to local state
    useEffect(() => {
        setLocalPayroll(payrollRecords);
    }, [payrollRecords]);

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

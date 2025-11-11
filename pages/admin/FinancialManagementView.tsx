import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FinancialTransaction, PayrollRecord, TransactionCategory, TransactionType, User } from '../../types';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import {
    getFinancialTransactions, addFinancialTransaction, updateFinancialTransaction, deleteFinancialTransaction,
    getPayrollRecords, savePayrollRecords
} from '../../services/localDataService';
import * as ReactRouterDOM from 'react-router-dom';

// --- HELPER FUNCTIONS ---
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
};

type FinancialTab = 'overview' | 'transactions' | 'reports' | 'payroll';

// --- MAIN COMPONENT ---
const FinancialManagementView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<FinancialTab>('overview');
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = ReactRouterDOM.useNavigate();

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

    // FIX: Wrapped addTransaction in useCallback to ensure a stable function reference is passed down.
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
            case 'reports': return <ReportsTab transactions={transactions} />;
            case 'payroll': return <PayrollTab payrollRecords={payrollRecords} onDataChange={loadData} onAddTransaction={addTransaction} />;
            case 'overview':
            default: return <OverviewTab transactions={transactions} />;
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

const OverviewTab: React.FC<{ transactions: FinancialTransaction[] }> = ({ transactions }) => {
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
                <Card className="!p-4 !bg-green-50 !border-green-200"><h5 className="text-sm text-green-700">Tổng Thu</h5><p className="text-2xl font-bold text-green-800">{totalIncome.toLocaleString('vi-VN')}₫</p></Card>
                <Card className="!p-4 !bg-red-50 !border-red-200"><h5 className="text-sm text-red-700">Tổng Chi</h5><p className="text-2xl font-bold text-red-800">{totalExpense.toLocaleString('vi-VN')}₫</p></Card>
                <Card className={`!p-4 ${netProfit >= 0 ? '!bg-blue-50 !border-blue-200' : '!bg-orange-50 !border-orange-200'}`}><h5 className={`text-sm ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Lợi nhuận</h5><p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>{netProfit.toLocaleString('vi-VN')}₫</p></Card>
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
                                <td className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.amount.toLocaleString('vi-VN')}₫</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TransactionsTab: React.FC<{ transactions: FinancialTransaction[], onDataChange: () => void, navigate: ReactRouterDOM.NavigateFunction }> = ({ transactions, onDataChange, navigate }) => {

    const handleAddNewTransaction = () => {
        navigate('/admin/accounting_dashboard/transactions/new');
    };

    const handleEditTransaction = (transactionId: string) => {
        navigate(`/admin/accounting_dashboard/transactions/edit/${transactionId}`);
    };

    const handleDelete = async (id: string) => {
        if(window.confirm('Bạn có chắc muốn xóa giao dịch này?')) {
            try {
                await deleteFinancialTransaction(id);
                onDataChange();
            } catch (error) {
                alert("Lỗi khi xóa giao dịch.");
            }
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={handleAddNewTransaction} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Giao dịch</Button>
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
                                <td className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.amount.toLocaleString('vi-VN')}₫</td>
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

const ReportsTab: React.FC<{ transactions: FinancialTransaction[] }> = ({ transactions }) => {
    const [startDate, setStartDate] = useState<string>(formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
    const [endDate, setEndDate] = useState<string>(formatDate(new Date()));

    const setDateRange = (period: 'week' | 'month' | 'year') => {
        const today = new Date();
        if (period === 'week') {
            setStartDate(formatDate(getStartOfWeek(today)));
            setEndDate(formatDate(today));
        } else if (period === 'month') {
            setStartDate(formatDate(new Date(today.getFullYear(), today.getMonth(), 1)));
            setEndDate(formatDate(today));
        } else if (period === 'year') {
            setStartDate(formatDate(new Date(today.getFullYear(), 0, 1)));
            setEndDate(formatDate(today));
        }
    };

    const filteredTransactions = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include entire end day

        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= start && tDate <= end;
        });
    }, [transactions, startDate, endDate]);

    const summary = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const net = income - expense;

        const incomeByCategory = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);
        const expenseByCategory = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        return { income, expense, net, incomeByCategory, expenseByCategory };
    }, [filteredTransactions]);

    return (
        <div>
            <div className="flex flex-wrap gap-4 items-center mb-4 p-4 bg-gray-50 rounded-lg">
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
                <Card className="!p-4"><h5 className="text-sm">Tổng Thu</h5><p className="text-2xl font-bold text-green-600">{summary.income.toLocaleString('vi-VN')}₫</p></Card>
                <Card className="!p-4"><h5 className="text-sm">Tổng Chi</h5><p className="text-2xl font-bold text-red-600">{summary.expense.toLocaleString('vi-VN')}₫</p></Card>
                <Card className="!p-4"><h5 className="text-sm">Lợi Nhuận</h5><p className={`text-2xl font-bold ${summary.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{summary.net.toLocaleString('vi-VN')}₫</p></Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h5 className="admin-form-subsection-title">Chi tiết Khoản Thu</h5>
                    {Object.keys(summary.incomeByCategory).length > 0 ? (
                        <ul className="text-sm space-y-1">
                            {Object.entries(summary.incomeByCategory).map(([cat, amount]) => <li key={cat} className="flex justify-between p-1 bg-gray-50 rounded"><span>{cat}</span><strong className="text-green-600">{amount.toLocaleString('vi-VN')}₫</strong></li>)}
                        </ul>
                    ) : <p className="text-sm text-gray-500">Không có khoản thu nào trong kỳ.</p>}
                </div>
                 <div>
                    <h5 className="admin-form-subsection-title">Chi tiết Khoản Chi</h5>
                    {Object.keys(summary.expenseByCategory).length > 0 ? (
                        <ul className="text-sm space-y-1">
                            {Object.entries(summary.expenseByCategory).map(([cat, amount]) => <li key={cat} className="flex justify-between p-1 bg-gray-50 rounded"><span>{cat}</span><strong className="text-red-600">{amount.toLocaleString('vi-VN')}₫</strong></li>)}
                        </ul>
                    ) : <p className="text-sm text-gray-500">Không có khoản chi nào trong kỳ.</p>}
                </div>
            </div>
        </div>
    );
};

const PayrollTab: React.FC<{ payrollRecords: PayrollRecord[], onDataChange: () => void, onAddTransaction: (trans: Omit<FinancialTransaction, 'id'>) => void }> = ({ payrollRecords, onDataChange, onAddTransaction }) => {
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

    const handleSettlePayroll = useCallback(async () => {
        if (!window.confirm(`Bạn có chắc muốn chốt và thanh toán lương cho tháng ${payPeriod}?`)) return;

        const recordsToSettle = localPayroll.filter(p => p.payPeriod === payPeriod && p.status === 'Chưa thanh toán' && p.finalSalary > 0);
        if (recordsToSettle.length === 0) {
            alert('Không có lương để thanh toán cho kỳ này.');
            return;
        }
        
        const totalSalaryExpense = recordsToSettle.reduce((sum, r) => sum + r.finalSalary, 0);

        try {
            const recordsToSave = localPayroll.filter(p => p.payPeriod === payPeriod);
            await savePayrollRecords(recordsToSave);
            await onAddTransaction({
                date: new Date().toISOString(),
                amount: totalSalaryExpense,
                type: 'expense',
                category: 'Chi phí Lương',
                description: `Thanh toán lương tháng ${payPeriod}`
            });
            onDataChange();
        } catch (error) {
            alert('Lỗi khi chốt lương.');
        }
    }, [localPayroll, payPeriod, onAddTransaction, onDataChange]);

    const handleSaveDraft = useCallback(async () => {
        const recordsToSave = localPayroll.filter(p => p.payPeriod === payPeriod);
        await savePayrollRecords(recordsToSave);
        alert('Đã lưu nháp lương thành công!');
        onDataChange();
    }, [localPayroll, payPeriod, onDataChange]);


    return (
        <div>
            <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <label htmlFor="payPeriod" className="font-medium">Chọn kỳ lương:</label>
                <input type="month" id="payPeriod" value={payPeriod} onChange={e => setPayPeriod(e.target.value)} className="admin-form-group !mb-0"/>
                <Button onClick={handleSaveDraft} size="sm" variant="outline">Lưu Nháp</Button>
                <Button onClick={handleSettlePayroll} size="sm" variant="primary" leftIcon={<i className="fas fa-check-circle"></i>}>Chốt & Thanh toán</Button>
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
                                    <td><input type="number" value={record?.baseSalary || 0} onChange={e => handlePayrollChange(employee.id, 'baseSalary', Number(e.target.value))} className="admin-form-group !p-1 w-32" /></td>
                                    <td><input type="number" value={record?.bonus || 0} onChange={e => handlePayrollChange(employee.id, 'bonus', Number(e.target.value))} className="admin-form-group !p-1 w-28" /></td>
                                    <td><input type="number" value={record?.deduction || 0} onChange={e => handlePayrollChange(employee.id, 'deduction', Number(e.target.value))} className="admin-form-group !p-1 w-28" /></td>
                                    <td className="font-bold">{record ? record.finalSalary.toLocaleString('vi-VN') : 0}₫</td>
                                    <td><input type="text" value={record?.notes || ''} onChange={e => handlePayrollChange(employee.id, 'notes', e.target.value)} className="admin-form-group !p-1 w-40" /></td>
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

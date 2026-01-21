import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FinancialTransaction, PayrollRecord, TransactionCategory, TransactionType, User } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';

// --- HELPER FUNCTIONS ---
const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; } 
    catch (error) { console.error(`Lỗi đọc localStorage key "${key}":`, error); return defaultValue; }
};
const setLocalStorageItem = <T,>(key: string, value: T) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } 
    catch (error) { console.error(`Lỗi cài đặt localStorage key "${key}":`, error); }
};
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
    const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => getLocalStorageItem(Constants.FINANCIAL_TRANSACTIONS_STORAGE_KEY, []));
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => getLocalStorageItem(Constants.PAYROLL_RECORDS_STORAGE_KEY, []));

    const handleUpdateTransactions = (updated: FinancialTransaction[]) => {
        setTransactions(updated);
        setLocalStorageItem(Constants.FINANCIAL_TRANSACTIONS_STORAGE_KEY, updated);
    };

    const handleUpdatePayroll = (updated: PayrollRecord[]) => {
        setPayrollRecords(updated);
        setLocalStorageItem(Constants.PAYROLL_RECORDS_STORAGE_KEY, updated);
    };

    const addTransaction = (newTransaction: Omit<FinancialTransaction, 'id'>) => {
        const transactionWithId: FinancialTransaction = { ...newTransaction, id: `trans-${Date.now()}` };
        handleUpdateTransactions([transactionWithId, ...transactions]);
    };
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'transactions': return <TransactionsTab transactions={transactions} onUpdate={handleUpdateTransactions} />;
            case 'reports': return <ReportsTab transactions={transactions} />;
            case 'payroll': return <PayrollTab payrollRecords={payrollRecords} onUpdatePayroll={handleUpdatePayroll} onAddTransaction={addTransaction} />;
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

const TransactionsTab: React.FC<{ transactions: FinancialTransaction[], onUpdate: (updated: FinancialTransaction[]) => void }> = ({ transactions, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);

    const handleSave = (data: FinancialTransaction) => {
        let updated;
        if (data.id) {
            updated = transactions.map(t => t.id === data.id ? data : t);
        } else {
            updated = [{...data, id: `trans-${Date.now()}`}, ...transactions];
        }
        onUpdate(updated.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Bạn có chắc muốn xóa giao dịch này?')) {
            onUpdate(transactions.filter(t => t.id !== id));
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Giao dịch</Button>
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
                                        <Button onClick={() => { setEditingTransaction(t); setIsModalOpen(true); }} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                        <Button onClick={() => handleDelete(t.id)} size="sm" variant="ghost" className="text-red-500"><i className="fas fa-trash"></i></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <TransactionModal transaction={editingTransaction} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const ReportsTab: React.FC<{ transactions: FinancialTransaction[] }> = ({ transactions }) => {
    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(1);
        return formatDate(d);
    });
    const [endDate, setEndDate] = useState<string>(formatDate(new Date()));
    const [filterSource, setFilterSource] = useState<'all' | 'internal' | 'supplier'>('all');

    const setDateRange = (period: 'week' | 'month' | 'year') => {
        const today = new Date();
        if (period === 'week') {
            setStartDate(formatDate(getStartOfWeek(today)));
            setEndDate(formatDate(today));
        } else if (period === 'month') {
            // Fix: To avoid a potential linter error on the new Date() constructor with arguments, this uses an alternative method to get the first day of the month.
            const startOfMonth = new Date(today);
            startOfMonth.setDate(1);
            setStartDate(formatDate(startOfMonth));
            setEndDate(formatDate(today));
        } else if (period === 'year') {
            // Fix: To avoid a potential linter error on the new Date() constructor with arguments, this uses an alternative method to get the first day of the year.
            const startOfYear = new Date(today);
            startOfYear.setMonth(0, 1);
            setStartDate(formatDate(startOfYear));
            setEndDate(formatDate(today));
        }
    };
    
    const filteredTransactions = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include entire end day
        
        const dateFiltered = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= start && tDate <= end;
        });

        if (filterSource === 'internal') {
            return dateFiltered.filter(t => t.category === 'Thu nội bộ');
        }
        if (filterSource === 'supplier') {
            return dateFiltered.filter(t => t.category === 'Chi phí Nhà Cung Cấp');
        }
        
        return dateFiltered; // 'all' case
    }, [transactions, startDate, endDate, filterSource]);

    const summary = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
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
                <div className="flex items-center gap-2 border-l pl-4 ml-4">
                    <span className="text-sm font-medium text-gray-600">Xem theo:</span>
                    <Button size="sm" variant={filterSource === 'all' ? 'primary' : 'outline'} onClick={() => setFilterSource('all')}>Tổng hợp</Button>
                    <Button size="sm" variant={filterSource === 'internal' ? 'primary' : 'outline'} onClick={() => setFilterSource('internal')}>Nội bộ</Button>
                    <Button size="sm" variant={filterSource === 'supplier' ? 'primary' : 'outline'} onClick={() => setFilterSource('supplier')}>Nhà Cung Cấp</Button>
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

const PayrollTab: React.FC<{ payrollRecords: PayrollRecord[], onUpdatePayroll: (updated: PayrollRecord[]) => void, onAddTransaction: (trans: Omit<FinancialTransaction, 'id'>) => void }> = ({ payrollRecords, onUpdatePayroll, onAddTransaction }) => {
    const { users } = useAuth();
    const staff = users.filter(u => u.role === 'admin' || u.role === 'staff');
    const [payPeriod, setPayPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

    const handlePayrollChange = (employeeId: string, field: 'baseSalary' | 'bonus' | 'deduction' | 'notes', value: string | number) => {
        const existingRecord = payrollRecords.find(p => p.payPeriod === payPeriod && p.employeeId === employeeId);
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
        
        const otherRecords = payrollRecords.filter(p => p.id !== updatedRecord.id);
        onUpdatePayroll([updatedRecord, ...otherRecords]);
    };
    
    const handleSettlePayroll = () => {
        if (!window.confirm(`Bạn có chắc muốn chốt và thanh toán lương cho tháng ${payPeriod}? Hành động này sẽ tạo một giao dịch chi phí.`)) return;

        let totalSalaryExpense = 0;
        const updatedRecords = payrollRecords.map(p => {
            if (p.payPeriod === payPeriod && p.status === 'Chưa thanh toán') {
                totalSalaryExpense += p.finalSalary;
                return { ...p, status: 'Đã thanh toán' as const };
            }
            return p;
        });

        if (totalSalaryExpense > 0) {
            onAddTransaction({
                date: new Date().toISOString(),
                amount: totalSalaryExpense,
                type: 'expense',
                category: 'Chi phí Lương',
                description: `Thanh toán lương tháng ${payPeriod}`
            });
            onUpdatePayroll(updatedRecords);
        } else {
            alert('Không có lương để thanh toán cho kỳ này.');
        }
    };
    
    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                <label htmlFor="payPeriod">Chọn kỳ lương:</label>
                <input type="month" id="payPeriod" value={payPeriod} onChange={e => setPayPeriod(e.target.value)} className="admin-form-group"/>
                <Button onClick={handleSettlePayroll} size="sm" variant="primary" leftIcon={<i className="fas fa-check-circle"></i>}>Chốt & Thanh toán</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead><tr><th>Nhân viên</th><th>Lương Cơ bản</th><th>Thưởng</th><th>Phạt</th><th>Tổng Lương</th><th>Ghi chú</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                        {staff.map(employee => {
                            const record = payrollRecords.find(p => p.payPeriod === payPeriod && p.employeeId === employee.id);
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

// --- MODAL COMPONENT ---
interface TransactionModalProps {
    transaction: FinancialTransaction | null;
    onClose: () => void;
    onSave: (data: FinancialTransaction) => void;
}
const TRANSACTION_CATEGORIES: Record<TransactionType, TransactionCategory[]> = {
    'income': ['Doanh thu Bán hàng', 'Thu nội bộ'],
    'expense': ['Chi phí Nhà Cung Cấp', 'Chi phí Lương', 'Chi phí Vận hành', 'Chi phí Marketing', 'Chi phí Khác'],
};

const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<FinancialTransaction>>(transaction || {
        date: new Date().toISOString().split('T')[0], type: 'expense', amount: 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };
        if (name === 'type') {
            newFormData.category = undefined; // Reset category when type changes
        }
        setFormData(newFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as FinancialTransaction);
    };

    const type = formData.type || 'expense';

    return (
         <div className="admin-modal-overlay">
            <div className="admin-modal-panel max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-header"><h4 className="admin-modal-title">{formData.id ? 'Sửa Giao dịch' : 'Thêm Giao dịch'}</h4><button type="button" onClick={onClose}>&times;</button></div>
                    <div className="admin-modal-body grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="admin-form-group"><label>Ngày *</label><input type="date" name="date" value={formData.date} onChange={handleChange} required/></div>
                        <div className="admin-form-group"><label>Loại *</label><select name="type" value={type} onChange={handleChange}><option value="income">Thu</option><option value="expense">Chi</option></select></div>
                        <div className="admin-form-group sm:col-span-2"><label>Danh mục *</label>
                            <select name="category" value={formData.category || ''} onChange={handleChange} required>
                                <option value="">-- Chọn --</option>
                                {TRANSACTION_CATEGORIES[type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="admin-form-group sm:col-span-2"><label>Số tiền (VNĐ) *</label><input type="number" name="amount" value={formData.amount} onChange={handleChange} required/></div>
                        <div className="admin-form-group sm:col-span-2"><label>Mô tả *</label><textarea name="description" value={formData.description || ''} onChange={handleChange} required rows={3}></textarea></div>
                        <div className="admin-form-group"><label>Đối tượng liên quan</label><input type="text" name="relatedEntity" value={formData.relatedEntity || ''} onChange={handleChange} /></div>
                        <div className="admin-form-group"><label>Mã hóa đơn</label><input type="text" name="invoiceNumber" value={formData.invoiceNumber || ''} onChange={handleChange} /></div>
                    </div>
                    <div className="admin-modal-footer"><Button type="button" variant="outline" onClick={onClose}>Hủy</Button><Button type="submit">Lưu</Button></div>
                </form>
            </div>
        </div>
    );
};


export default FinancialManagementView;
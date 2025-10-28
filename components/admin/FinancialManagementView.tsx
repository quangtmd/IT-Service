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
                <Button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm Giao Dịch</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="admin-table">
                    <thead><tr><th>Ngày</th><th>Loại</th><th>Danh mục</th><th>Số tiền</th><th>Mô tả</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id}>
                                <td>{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                                <td>{t.type === 'income' ? 'Thu' : 'Chi'}</td>
                                <td>{t.category}</td>
                                <td className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.amount.toLocaleString('vi-VN')}₫</td>
                                <td>{t.description}</td>
                                <td>
                                    <div className="flex gap-2">
                                        <Button onClick={() => { setEditingTransaction(t); setIsModalOpen(true); }} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                        <Button onClick={() => handleDelete(t.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"><i className="fas fa-trash"></i></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* The modal would go here */}
        </div>
    );
};

// Fix: Add missing ReportsTab component placeholder.
const ReportsTab: React.FC<{ transactions: FinancialTransaction[] }> = ({ transactions }) => {
    return (
        <div>
            <h4 className="admin-form-subsection-title">Báo cáo</h4>
            <p className="text-textMuted">Tính năng báo cáo chi tiết đang được phát triển.</p>
        </div>
    );
};

// Fix: Add missing PayrollTab component placeholder.
const PayrollTab: React.FC<{ 
    payrollRecords: PayrollRecord[], 
    onUpdatePayroll: (updated: PayrollRecord[]) => void,
    onAddTransaction: (newTransaction: Omit<FinancialTransaction, 'id'>) => void 
}> = ({ payrollRecords, onUpdatePayroll, onAddTransaction }) => {
    return (
        <div>
            <h4 className="admin-form-subsection-title">Quản lý Lương thưởng</h4>
            <p className="text-textMuted">Tính năng quản lý lương thưởng đang được phát triển.</p>
        </div>
    );
};

export default FinancialManagementView;
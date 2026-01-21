import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FinancialTransaction, TransactionCategory, TransactionType } from '../../types';
import Button from '../../components/ui/Button';
import { getFinancialTransactions, addFinancialTransaction, updateFinancialTransaction } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';


const TRANSACTION_TYPE_OPTIONS: Array<TransactionType> = ['income', 'expense'];
const TRANSACTION_CATEGORY_OPTIONS: Array<TransactionCategory> = ['Doanh thu Bán hàng', 'Doanh thu Dịch vụ', 'Chi phí Lương', 'Chi phí Marketing', 'Chi phí Vận hành', 'Chi phí Nhập hàng', 'Khác'];

const TransactionFormPage: React.FC = () => {
    const { transactionId } = useParams<{ transactionId: string }>();
    const navigate = useNavigate();
    const isEditing = !!transactionId;

    const [formData, setFormData] = useState<Partial<FinancialTransaction> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (isEditing) {
                setIsLoading(true);
                setError(null);
                try {
                    const allData = await getFinancialTransactions();
                    const itemToEdit = allData.find(t => t.id === transactionId);
                    if (itemToEdit) {
                        setFormData(itemToEdit);
                    } else {
                        setError('Không tìm thấy giao dịch để chỉnh sửa.');
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu.');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    amount: 0,
                    type: 'expense',
                    category: 'Chi phí Vận hành',
                    description: '',
                });
                setIsLoading(false);
            }
        };
        loadData();
    }, [isEditing, transactionId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        try {
            if (isEditing) {
                await updateFinancialTransaction(transactionId!, formData as FinancialTransaction);
                alert('Cập nhật giao dịch thành công!');
            } else {
                await addFinancialTransaction(formData as Omit<FinancialTransaction, 'id'>);
                alert('Tạo giao dịch mới thành công!');
            }
            navigate('/admin/accounting_dashboard');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu.');
        }
    };

    if (isLoading) return <div className="admin-card"><div className="admin-card-body text-center">Đang tải...</div></div>;
    if (error) return <div className="admin-card"><div className="admin-card-body text-center text-red-500">{error}</div></div>;
    if (!formData) return null;

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header flex justify-between items-center">
                    <h3 className="admin-card-title">{isEditing ? 'Chỉnh sửa Giao dịch' : 'Tạo Giao dịch mới'}</h3>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/accounting_dashboard')}>Hủy</Button>
                </div>
                <div className="admin-card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="admin-form-group">
                            <label>Ngày *</label>
                            <input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleChange} required />
                        </div>
                        <div className="admin-form-group">
                            <label>Số tiền (VNĐ) *</label>
                            <input type="number" name="amount" value={formData.amount || ''} onChange={handleChange} required />
                        </div>
                        <div className="admin-form-group">
                            <label>Loại *</label>
                            <select name="type" value={formData.type || 'expense'} onChange={handleChange} required>
                                {TRANSACTION_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt === 'income' ? 'Thu' : 'Chi'}</option>)}
                            </select>
                        </div>
                        <div className="admin-form-group">
                            <label>Danh mục *</label>
                            <select name="category" value={formData.category || 'Khác'} onChange={handleChange} required>
                                {TRANSACTION_CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2 admin-form-group">
                            <label>Mô tả *</label>
                            <textarea name="description" value={formData.description || ''} onChange={handleChange} required rows={3}></textarea>
                        </div>
                        <div className="admin-form-group">
                            <label>Mã đơn hàng (tùy chọn)</label>
                            <input type="text" name="orderId" value={formData.orderId || ''} onChange={handleChange} />
                        </div>
                        <div className="admin-form-group">
                            <label>Bên liên quan (tùy chọn)</label>
                            <input type="text" name="relatedParty" value={formData.relatedParty || ''} onChange={handleChange} />
                        </div>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/accounting_dashboard')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu Giao dịch</Button>
                </div>
            </form>
        </div>
    );
};

export default TransactionFormPage;

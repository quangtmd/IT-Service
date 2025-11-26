import React, { useState, useEffect } from 'react';
import { FinancialTransaction, TransactionCategory, TransactionType } from '../../types';
import Button from '../../components/ui/Button';
import { getFinancialTransactions, addFinancialTransaction, updateFinancialTransaction } from '../../services/localDataService';
import { useNavigate, useParams } from 'react-router-dom';

const TRANSACTION_CATEGORIES: Record<TransactionType, TransactionCategory[]> = {
    'income': ['Doanh thu Bán hàng', 'Thu nội bộ'],
    'expense': ['Chi phí Nhà Cung Cấp', 'Chi phí Lương', 'Chi phí Vận hành', 'Chi phí Marketing', 'Chi phí Khác'],
};

const TransactionFormPage: React.FC = () => {
    const { transactionId } = useParams<{ transactionId: string }>();
    const navigate = useNavigate();
    const isEditing = !!transactionId;

    const [formData, setFormData] = useState<Partial<FinancialTransaction> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTransaction = async () => {
            if (isEditing) {
                setIsLoading(true);
                setError(null);
                try {
                    const allTransactions = await getFinancialTransactions();
                    const foundTransaction = allTransactions.find(t => t.id === transactionId);
                    if (foundTransaction) {
                        setFormData(foundTransaction);
                    } else {
                        setError('Không tìm thấy giao dịch để chỉnh sửa.');
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu giao dịch.');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    type: 'expense',
                    amount: 0,
                    category: 'Chi phí Khác',
                    description: '',
                });
                setIsLoading(false);
            }
        };
        loadTransaction();
    }, [isEditing, transactionId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };
        if (name === 'type') {
            newFormData.category = undefined; // Reset category when type changes
        }
        setFormData(newFormData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !formData.date || !formData.type || !formData.amount || !formData.category) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        try {
            if (isEditing) {
                const { id, ...updates } = formData;
                await updateFinancialTransaction(id as string, updates);
                alert('Cập nhật giao dịch thành công!');
            } else {
                await addFinancialTransaction(formData as Omit<FinancialTransaction, 'id'>);
                alert('Thêm giao dịch mới thành công!');
            }
            navigate('/admin/accounting_dashboard'); // Navigate back to financial dashboard
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu giao dịch.');
        }
    };

    if (isLoading) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-textMuted">Đang tải dữ liệu giao dịch...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8 text-danger-text">
                    <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
                    <p>{error}</p>
                    <Button onClick={() => navigate('/admin/accounting_dashboard')} className="mt-4">Quay lại</Button>
                </div>
            </div>
        );
    }

    if (!formData) return null;

    const type = formData.type || 'expense';

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">{isEditing ? `Sửa Giao dịch: ${formData.description?.substring(0, 50)}...` : 'Thêm Giao dịch mới'}</h3>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/accounting_dashboard')}>Hủy</Button>
                </div>
                <div className="admin-card-body admin-product-form-page-body"> {/* Using similar class for scrolling */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="admin-form-group"><label>Ngày *</label><input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleChange} required /></div>
                        <div className="admin-form-group"><label>Loại *</label><select name="type" value={type} onChange={handleChange}><option value="income">Thu</option><option value="expense">Chi</option></select></div>
                        <div className="admin-form-group sm:col-span-2"><label>Danh mục *</label>
                            <select name="category" value={formData.category || ''} onChange={handleChange} required>
                                <option value="">-- Chọn --</option>
                                {TRANSACTION_CATEGORIES[type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="admin-form-group sm:col-span-2"><label>Số tiền (VNĐ) *</label><input type="number" name="amount" value={formData.amount || 0} onChange={handleChange} required /></div>
                        <div className="admin-form-group sm:col-span-2"><label>Mô tả *</label><textarea name="description" value={formData.description || ''} onChange={handleChange} required rows={3}></textarea></div>
                        <div className="admin-form-group"><label>Đối tượng liên quan</label><input type="text" name="relatedEntity" value={formData.relatedEntity || ''} onChange={handleChange} /></div>
                        <div className="admin-form-group"><label>Mã hóa đơn</label><input type="text" name="invoiceNumber" value={formData.invoiceNumber || ''} onChange={handleChange} /></div>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/accounting_dashboard')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </form>
        </div>
    );
};

export default TransactionFormPage;
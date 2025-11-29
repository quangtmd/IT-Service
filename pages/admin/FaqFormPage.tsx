import React, { useState, useEffect } from 'react';
import { FaqItem } from '../../types';
import Button from '../../components/ui/Button';
import { useNavigate, useParams } from 'react-router-dom';
import * as Constants from '../../constants';

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; }
    catch (error) { console.error(`Lỗi đọc localStorage key "${key}":`, error); return defaultValue; }
};
const setLocalStorageItem = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(new CustomEvent('faqsUpdated'));
    } catch (error) { console.error(`Lỗi cài đặt localStorage key "${key}":`, error); }
};

const FaqFormPage: React.FC = () => {
    const { faqId } = useParams<{ faqId: string }>();
    const navigate = useNavigate();
    const isEditing = !!faqId;

    const [formData, setFormData] = useState<FaqItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadFaq = () => {
            setIsLoading(true);
            setError(null);
            const allFaqs: FaqItem[] = getLocalStorageItem(Constants.FAQ_STORAGE_KEY, Constants.INITIAL_FAQS);
            if (isEditing) {
                const foundFaq = allFaqs.find(f => f.id === faqId);
                if (foundFaq) {
                    setFormData(foundFaq);
                } else {
                    setError('Không tìm thấy FAQ để chỉnh sửa.');
                }
            } else {
                setFormData({ id: '', question: '', answer: '', category: 'Chung', isVisible: true });
            }
            setIsLoading(false);
        };
        loadFaq();
    }, [isEditing, faqId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formData) return;
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(p => p ? ({ ...p, [name]: type === 'checkbox' ? checked : value }) : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        let allFaqs: FaqItem[] = getLocalStorageItem(Constants.FAQ_STORAGE_KEY, Constants.INITIAL_FAQS);
        let updated: FaqItem[];

        if (isEditing) {
            updated = allFaqs.map(f => f.id === formData.id ? formData : f);
        } else {
            updated = [{ ...formData, id: `faq-${Date.now()}` }, ...allFaqs];
        }
        setLocalStorageItem(Constants.FAQ_STORAGE_KEY, updated);
        alert('Lưu FAQ thành công!');
        navigate('/admin/faqs');
    };

    if (isLoading) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-textMuted">Đang tải dữ liệu FAQ...</p>
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
                    <Button onClick={() => navigate('/admin/faqs')} className="mt-4">Quay lại</Button>
                </div>
            </div>
        );
    }

    if (!formData) return null;

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">{isEditing ? `Sửa FAQ: ${formData.question.substring(0, 50)}...` : 'Thêm FAQ mới'}</h3>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/faqs')}>Hủy</Button>
                </div>
                <div className="admin-card-body admin-product-form-page-body"> {/* Using similar class for scrolling */}
                    <div className="admin-form-group">
                        <label>Câu hỏi *</label>
                        <input type="text" name="question" value={formData.question || ''} onChange={handleChange} required />
                    </div>
                    <div className="admin-form-group">
                        <label>Câu trả lời (hỗ trợ Markdown) *</label>
                        <textarea name="answer" value={formData.answer || ''} onChange={handleChange} required rows={6}></textarea>
                    </div>
                    <div className="admin-form-group">
                        <label>Danh mục</label>
                        <input type="text" name="category" value={formData.category || ''} onChange={handleChange} />
                    </div>
                    <div className="admin-form-group-checkbox items-center">
                        <input type="checkbox" name="isVisible" id="isVisible" checked={formData.isVisible} onChange={handleChange} className="w-4 h-4" />
                        <label htmlFor="isVisible" className="!mb-0 !ml-2">Hiển thị trên trang web</label>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/faqs')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu</Button>
                </div>
            </form>
        </div>
    );
};

export default FaqFormPage;
import React, { useState, useEffect } from 'react';
import { FaqItem } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; } 
    catch (error) { return defaultValue; }
};
const setLocalStorageItem = <T,>(key: string, value: T) => {
    try { 
        localStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(new CustomEvent('faqsUpdated'));
    } catch (error) { console.error(error); }
};

const FaqManagementView: React.FC = () => {
    const [faqs, setFaqs] = useState<FaqItem[]>(() => getLocalStorageItem(Constants.FAQ_STORAGE_KEY, Constants.INITIAL_FAQS));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

    const handleUpdate = (updatedFaqs: FaqItem[]) => {
        setFaqs(updatedFaqs);
        setLocalStorageItem(Constants.FAQ_STORAGE_KEY, updatedFaqs);
    };

    const openModalForNew = () => {
        setEditingFaq({ id: '', question: '', answer: '', category: 'Chung', isVisible: true });
        setIsModalOpen(true);
    };

    const openModalForEdit = (faq: FaqItem) => {
        setEditingFaq(faq);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingFaq(null);
        setIsModalOpen(false);
    };

    const handleSave = (data: FaqItem) => {
        let updated;
        if (data.id) {
            updated = faqs.map(f => f.id === data.id ? data : f);
        } else {
            updated = [{...data, id: `faq-${Date.now()}`}, ...faqs];
        }
        handleUpdate(updated);
        closeModal();
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Bạn có chắc muốn xóa FAQ này?')) {
            handleUpdate(faqs.filter(f => f.id !== id));
        }
    };
    
    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý FAQs</h3>
                <Button onClick={openModalForNew} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm FAQ</Button>
            </div>
            <div className="admin-card-body">
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead><tr><th>Câu hỏi</th><th>Danh mục</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                        <tbody>
                            {faqs.map(faq => (
                                <tr key={faq.id}>
                                    <td className="font-semibold">{faq.question}</td>
                                    <td>{faq.category}</td>
                                    <td><span className={`status-badge ${faq.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{faq.isVisible ? 'Hiển thị' : 'Ẩn'}</span></td>
                                    <td>
                                        <div className="flex gap-2">
                                            <Button onClick={() => openModalForEdit(faq)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                            <Button onClick={() => handleDelete(faq.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"><i className="fas fa-trash"></i></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <FaqFormModal faq={editingFaq} onClose={closeModal} onSave={handleSave} />}
        </div>
    );
};

// --- Form Modal ---
interface FaqFormModalProps {
    faq: FaqItem | null;
    onClose: () => void;
    onSave: (data: FaqItem) => void;
}
const FaqFormModal: React.FC<FaqFormModalProps> = ({ faq, onClose, onSave }) => {
    const [formData, setFormData] = useState<FaqItem>(faq || {} as FaqItem);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value, type} = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(p => ({...p, [name]: type === 'checkbox' ? checked : value}));
    }
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    
    return (
         <div className="admin-modal-overlay">
            <form onSubmit={handleSubmit} className="admin-modal-panel">
                <div className="admin-modal-header">
                    <h4 className="admin-modal-title">{formData.id ? 'Sửa FAQ' : 'Thêm FAQ'}</h4>
                    <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <div className="admin-modal-body">
                    <div className="admin-form-group"><label>Câu hỏi *</label><input type="text" name="question" value={formData.question || ''} onChange={handleChange} required /></div>
                    <div className="admin-form-group"><label>Câu trả lời (hỗ trợ Markdown) *</label><textarea name="answer" value={formData.answer || ''} onChange={handleChange} required rows={6}></textarea></div>
                    <div className="admin-form-group"><label>Danh mục</label><input type="text" name="category" value={formData.category || ''} onChange={handleChange} /></div>
                    <div className="admin-form-group-checkbox items-center"><input type="checkbox" name="isVisible" id="isVisible" checked={formData.isVisible} onChange={handleChange} className="w-4 h-4" /><label htmlFor="isVisible" className="!mb-0 !ml-2">Hiển thị trên trang web</label></div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                    <Button type="submit">Lưu</Button>
                </div>
            </form>
        </div>
    );
}

export default FaqManagementView;
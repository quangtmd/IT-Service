import React, { useState, useEffect } from 'react';
import { FaqItem } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; }
    catch (error) { console.error(`Lỗi đọc localStorage key "${key}":`, error); return defaultValue; }
};
const setLocalStorageItem = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(new CustomEvent('faqsUpdated'));
    } catch (error) { console.error(error); }
};

const FaqManagementView: React.FC = () => {
    const [faqs, setFaqs] = useState<FaqItem[]>(() => getLocalStorageItem(Constants.FAQ_STORAGE_KEY, Constants.INITIAL_FAQS));
    const navigate = useNavigate();

    useEffect(() => {
        const loadFaqs = () => {
            setFaqs(getLocalStorageItem(Constants.FAQ_STORAGE_KEY, Constants.INITIAL_FAQS).filter(faq => faq.isVisible !== false));
        };
        window.addEventListener('faqsUpdated', loadFaqs);
        return () => window.removeEventListener('faqsUpdated', loadFaqs);
    }, []);

    const handleAddNewFaq = () => {
        navigate('/admin/faqs/new');
    };

    const handleEditFaq = (faqId: string) => {
        navigate(`/admin/faqs/edit/${faqId}`);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Bạn có chắc muốn xóa FAQ này?')) {
            const updated = faqs.filter(f => f.id !== id);
            setLocalStorageItem(Constants.FAQ_STORAGE_KEY, updated);
        }
    };
    
    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý FAQs</h3>
                <Button onClick={handleAddNewFaq} size="sm" leftIcon={<i className="fas fa-plus"></i>}>Thêm FAQ</Button>
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
                                            <Button onClick={() => handleEditFaq(faq.id)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                            <Button onClick={() => handleDelete(faq.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"><i className="fas fa-trash"></i></Button>
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

export default FaqManagementView;
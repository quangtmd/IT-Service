
import React, { useState, useMemo } from 'react';
import { Article } from '../../types';
import * as Constants from '../../constants';
import Button from '../ui/Button';

interface ArticleManagementViewProps {
    articles: Article[];
    onUpdate: (updatedArticles: Article[]) => void;
}

const ArticleManagementView: React.FC<ArticleManagementViewProps> = ({ articles, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    const filteredArticles = useMemo(() =>
        articles.filter(a =>
            a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.category.toLowerCase().includes(searchTerm.toLowerCase())
        ), [articles, searchTerm]);

    const openModalForNew = () => {
        setEditingArticle({
            id: '',
            title: '',
            summary: '',
            imageUrl: '',
            author: 'Admin',
            date: new Date().toISOString(),
            category: Constants.ARTICLE_CATEGORIES[0],
            content: ''
        });
        setIsModalOpen(true);
    };

    const openModalForEdit = (article: Article) => {
        setEditingArticle(article);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingArticle(null);
        setIsModalOpen(false);
    };

    const handleSave = (articleData: Article) => {
        let updatedArticles;
        if (articleData.id) {
            updatedArticles = articles.map(a => a.id === articleData.id ? articleData : a);
        } else {
            const newArticle = { ...articleData, id: `art-${Date.now()}` };
            updatedArticles = [newArticle, ...articles];
        }
        onUpdate(updatedArticles);
        closeModal();
    };

    const handleDelete = (articleId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
            onUpdate(articles.filter(a => a.id !== articleId));
        }
    };
    
    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Bài viết ({filteredArticles.length})</h3>
                <Button onClick={openModalForNew} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Thêm Bài viết
                </Button>
            </div>
            <div className="admin-card-body">
                 <input
                    type="text"
                    placeholder="Tìm bài viết theo tiêu đề, tác giả, danh mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-form-group w-full max-w-md mb-4"
                />
                <div className="overflow-x-auto">
                    <table className="admin-table">
                         <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Tác giả</th>
                                <th>Danh mục</th>
                                <th>Ngày đăng</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredArticles.map(article => (
                                <tr key={article.id}>
                                    <td>
                                        <div className="flex items-center">
                                            <img src={article.imageUrl || `https://picsum.photos/seed/${article.id}/40/40`} alt={article.title} className="w-10 h-10 rounded-md mr-3 object-cover"/>
                                            <p className="font-semibold text-textBase">{article.title}</p>
                                        </div>
                                    </td>
                                    <td>{article.author}</td>
                                    <td>{article.category}</td>
                                    <td>{new Date(article.date).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <Button onClick={() => openModalForEdit(article)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                            <Button onClick={() => handleDelete(article.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"><i className="fas fa-trash"></i></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <ArticleFormModal article={editingArticle} onClose={closeModal} onSave={handleSave} />}
        </div>
    );
};


// --- Article Form Modal ---
interface ArticleFormModalProps {
    article: Article | null;
    onClose: () => void;
    onSave: (article: Article) => void;
}
const ArticleFormModal: React.FC<ArticleFormModalProps> = ({ article, onClose, onSave }) => {
    const [formData, setFormData] = useState<Article>(article || {} as Article);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-panel">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="admin-modal-header">
                        <h4 className="admin-modal-title">{formData.id ? 'Chỉnh sửa Bài viết' : 'Thêm Bài viết Mới'}</h4>
                        <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                    </div>
                    <div className="admin-modal-body">
                         <div className="admin-form-group">
                            <label htmlFor="title">Tiêu đề *</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="admin-form-group">
                                <label htmlFor="author">Tác giả</label>
                                <input type="text" name="author" id="author" value={formData.author} onChange={handleChange} />
                            </div>
                            <div className="admin-form-group">
                                <label htmlFor="category">Danh mục</label>
                                <select name="category" id="category" value={formData.category} onChange={handleChange}>
                                    {Constants.ARTICLE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="admin-form-group">
                            <label htmlFor="imageUrl">URL Ảnh đại diện</label>
                            <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} />
                        </div>
                        <div className="admin-form-group">
                            <label htmlFor="summary">Tóm tắt *</label>
                            <textarea name="summary" id="summary" rows={3} value={formData.summary} onChange={handleChange} required></textarea>
                        </div>
                        <div className="admin-form-group">
                            <label htmlFor="content">Nội dung (hỗ trợ Markdown)</label>
                            <textarea name="content" id="content" rows={10} value={formData.content || ''} onChange={handleChange}></textarea>
                        </div>
                    </div>
                    <div className="admin-modal-footer">
                        <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                        <Button type="submit" variant="primary">Lưu Bài viết</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArticleManagementView;

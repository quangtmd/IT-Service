import React, { useState, useEffect } from 'react';
import { Article } from '../../types';
import * as Constants from '../../constants';
import Button from '../../components/ui/Button';
import ImageUploadInput from '../../components/ui/ImageUploadInput';
import { getArticle, addArticle, updateArticle } from '../../services/localDataService';
import * as ReactRouterDOM from 'react-router-dom';

const ArticleFormPage: React.FC = () => {
    const { articleId } = ReactRouterDOM.useParams<{ articleId: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const isEditing = !!articleId;

    const [formData, setFormData] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadArticle = async () => {
            if (isEditing) {
                setIsLoading(true);
                setError(null);
                try {
                    const foundArticle = await getArticle(articleId!);
                    if (foundArticle) {
                        setFormData(foundArticle);
                    } else {
                        setError('Không tìm thấy bài viết để chỉnh sửa.');
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu bài viết.');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setFormData({
                    id: '',
                    title: '',
                    summary: '',
                    imageUrl: '',
                    author: 'Admin',
                    date: new Date().toISOString(),
                    category: Constants.ARTICLE_CATEGORIES[0],
                    content: '',
                    tags: [],
                    slug: '',
                });
                setIsLoading(false);
            }
        };
        loadArticle();
    }, [isEditing, articleId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        if (name === 'tags') {
            setFormData(prev => prev ? ({ ...prev, tags: value.split(',').map(tag => tag.trim()) }) : null);
        } else {
            setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        try {
            if (isEditing) {
                await updateArticle(formData.id, formData);
                alert('Cập nhật bài viết thành công!');
            } else {
                await addArticle(formData);
                alert('Thêm bài viết mới thành công!');
            }
            navigate('/admin/articles'); // Navigate back to article list
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu bài viết.');
        }
    };

    if (isLoading) {
        return (
            <div className="admin-card">
                <div className="admin-card-body text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-textMuted">Đang tải dữ liệu bài viết...</p>
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
                    <Button onClick={() => navigate('/admin/articles')} className="mt-4">Quay lại</Button>
                </div>
            </div>
        );
    }

    if (!formData) return null;

    return (
        <div className="admin-card">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">{isEditing ? `Chỉnh sửa Bài viết: ${formData.title}` : 'Thêm Bài viết Mới'}</h3>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/articles')}>Hủy</Button>
                </div>
                <div className="admin-card-body admin-product-form-page-body"> {/* Using similar class for scrolling */}
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
                    <ImageUploadInput
                        label="URL Ảnh đại diện"
                        value={formData.imageUrl}
                        onChange={value => setFormData(p => p ? ({ ...p, imageUrl: value }) : null)}
                        showPreview={true}
                    />
                    <div className="admin-form-group">
                        <label htmlFor="summary">Tóm tắt *</label>
                        <textarea name="summary" id="summary" rows={3} value={formData.summary} onChange={handleChange} required></textarea>
                    </div>
                    <div className="admin-form-group">
                        <label htmlFor="content">Nội dung (hỗ trợ Markdown)</label>
                        <textarea name="content" id="content" rows={10} value={formData.content || ''} onChange={handleChange}></textarea>
                    </div>
                     <div className="admin-form-subsection-title mt-4">Tối ưu hóa SEO</div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="admin-form-group">
                            <label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</label>
                            <input type="text" name="tags" id="tags" value={formData.tags?.join(', ') || ''} onChange={handleChange} />
                        </div>
                        <div className="admin-form-group">
                            <label htmlFor="slug">Đường dẫn (URL Slug)</label>
                            <input type="text" name="slug" id="slug" value={formData.slug || ''} onChange={handleChange} />
                             <p className="form-input-description">Ví dụ: huong-dan-build-pc-gaming-20-trieu</p>
                        </div>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/articles')}>Hủy</Button>
                    <Button type="submit" variant="primary">Lưu Bài viết</Button>
                </div>
            </form>
        </div>
    );
};

export default ArticleFormPage;
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Article } from '../../types';
import Button from '../ui/Button';
import { getArticles, deleteArticle } from '../../services/localDataService';
import BackendConnectionError from '../../components/shared/BackendConnectionError'; // Cập nhật đường dẫn
import { useNavigate } from 'react-router-dom';

const ArticleManagementView: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const loadArticles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const articlesFromDb = await getArticles();
            setArticles(articlesFromDb);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu bài viết.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    const filteredArticles = useMemo(() =>
        articles.filter(a =>
            a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.category.toLowerCase().includes(searchTerm.toLowerCase())
        ), [articles, searchTerm]);

    const handleAddNewArticle = () => {
        navigate('/admin/articles/new');
    };

    const handleEditArticle = (articleId: string) => {
        navigate(`/admin/articles/edit/${articleId}`);
    };

    const handleDelete = async (articleId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
            try {
                await deleteArticle(articleId);
                loadArticles();
            } catch (err) {
                 alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa bài viết.');
            }
        }
    };
    
    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Bài viết ({filteredArticles.length})</h3>
                <Button onClick={handleAddNewArticle} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
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
                {error && <BackendConnectionError error={error} />}
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
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-4">Đang tải...</td></tr>
                            ) : !error && filteredArticles.length > 0 ? (
                                filteredArticles.map(article => (
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
                                                <Button onClick={() => handleEditArticle(article.id)} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                                <Button onClick={() => handleDelete(article.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"><i className="fas fa-trash"></i></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                             ) : (
                                !error && <tr><td colSpan={5} className="text-center py-4 text-textMuted">Không có bài viết nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ArticleManagementView;
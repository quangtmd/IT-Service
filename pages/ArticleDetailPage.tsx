import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom'; // useParams and Link are compatible with v6/v7
import { Article } from '../types';
import Markdown from 'react-markdown';
import ArticlePreview from '../components/blog/ArticlePreview';
import { getArticle, getArticles } from '../services/localDataService';

const ArticleDetailPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      if (!articleId) {
          setIsLoading(false);
          return;
      }
      setIsLoading(true);
      try {
          const foundArticle = await getArticle(articleId);
          setArticle(foundArticle);

          if(foundArticle) {
              const allArticles = await getArticles(); // Fetch from backend
              // Also get AI articles from local storage
              const aiArticlesRaw = localStorage.getItem('aiGeneratedArticles_v1');
              const aiArticles: Article[] = aiArticlesRaw ? JSON.parse(aiArticlesRaw) : [];
              const combinedArticles = [...allArticles, ...aiArticles];

              const filteredRelated = combinedArticles.filter(
                  a => a.id !== foundArticle.id && a.category === foundArticle.category
              ).slice(0, 3);
              setRelatedArticles(filteredRelated);
          }
      } catch (error) {
          console.error("Error fetching article:", error);
      } finally {
          setIsLoading(false);
          window.scrollTo(0, 0);
      }
    };

    loadArticle();
  }, [articleId]);

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-textMuted">Đang tải bài viết...</p>
        </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold text-textBase">Không tìm thấy bài viết</h2>
        <p className="text-textMuted mb-4">Bài viết bạn tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
        <Link to="/blog" className="text-primary hover:underline mt-4 inline-block">
          Quay lại trang Blog
        </Link>
      </div>
    );
  }

  const placeholderContent = `
Nội dung chi tiết cho bài viết "${article.title}".

## Đây là một tiêu đề phụ

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

*   Mục 1
*   Mục 2
*   Mục 3

### Tiêu đề nhỏ hơn

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

\`\`\`javascript
function chao(ten) {
  console.log(\`Xin chào, \${ten}!\`);
}
chao('Thế giới');
\`\`\`

Hình ảnh minh họa (nếu có):

![Ảnh minh họa công nghệ](https://picsum.photos/seed/techDetail${article.id}/800/400)

Kết luận, ${article.summary.toLowerCase()}
  `;


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="bg-bgBase p-6 md:p-10 rounded-lg shadow-xl border border-borderDefault">
        <header className="mb-8">
          <nav aria-label="breadcrumb" className="text-sm text-textMuted mb-2">
            <Link to="/home" className="hover:text-primary">Trang chủ</Link>
            <span className="mx-1">/</span>
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <span className="mx-1">/</span>
            <span className="text-textSubtle line-clamp-1" title={article.title}>{article.title}</span>
          </nav>
          <p className="text-primary font-semibold mb-2">{article.category}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-textBase mb-3">{article.title}</h1>
          <div className="text-sm text-textMuted">
            <span>Đăng bởi: {article.author}</span> | <span>Ngày: {new Date(article.date).toLocaleDateString('vi-VN')}</span>
          </div>
        </header>

        <img
            src={article.imageUrl || `https://picsum.photos/seed/articleDetail${article.id}/800/400`}
            alt={article.title}
            className="w-full h-auto max-h-[450px] object-cover rounded-lg mb-8 shadow-lg border border-borderDefault"
        />

        <div className="prose prose-lg max-w-none text-textBase
                        prose-headings:text-textBase prose-a:text-primary hover:prose-a:underline
                        prose-strong:text-textBase prose-blockquote:border-primary
                        prose-blockquote:text-textMuted prose-code:text-secondary-dark
                        prose-code:bg-bgMuted prose-code:p-1 prose-code:rounded prose-img:rounded-md
                        prose-li:marker:text-primary">
          <Markdown>{article.content || placeholderContent}</Markdown>
        </div>

        <div className="mt-10 pt-6 border-t border-borderDefault">
            <h4 className="text-md font-semibold text-textBase mb-2">Chia sẻ bài viết:</h4>
            <div className="flex space-x-3">
                <button title="Share on Facebook (placeholder)" className="text-2xl text-blue-600 hover:text-blue-800"><i className="fab fa-facebook-square"></i></button>
                <button title="Share on Zalo (placeholder)" className="text-2xl text-blue-500 hover:text-blue-700"><i className="fas fa-comment-dots"></i></button>
                <button title="Share on Twitter (placeholder)" className="text-2xl text-sky-500 hover:text-sky-700"><i className="fab fa-twitter-square"></i></button>
            </div>
        </div>

        <div className="mt-10 pt-6 border-t border-borderDefault">
            <h3 className="text-2xl font-semibold text-textBase mb-4">Bình luận</h3>
            <p className="text-textMuted">Tính năng bình luận sắp ra mắt. Hãy quay lại sau!</p>
        </div>


        <div className="mt-10 pt-6 border-t border-borderDefault">
            <Link to="/blog" className="text-primary hover:text-primary-dark font-semibold">
                <i className="fas fa-arrow-left mr-2"></i> Quay lại Blog
            </Link>
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-textBase mb-6 text-center">Bài Viết Liên Quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map(relatedArticle => (
              <ArticlePreview key={relatedArticle.id} article={relatedArticle} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetailPage;

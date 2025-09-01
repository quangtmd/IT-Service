
import React from 'react';
import { MOCK_ARTICLES } from '../data/mockData';
import ArticlePreview from '../components/blog/ArticlePreview';
import SearchBar from '../components/shared/SearchBar';

const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const articles = MOCK_ARTICLES.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-textBase mb-2">Blog & Tin Tức</h1>
        <p className="text-textMuted max-w-xl mx-auto">
          Cập nhật những mẹo hay, hướng dẫn hữu ích, và tin tức công nghệ mới nhất từ chúng tôi.
        </p>
      </div>

      <div className="mb-8 max-w-xl mx-auto">
        <SearchBar onSearch={setSearchTerm} placeholder="Tìm kiếm bài viết..."/>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <ArticlePreview key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-center text-textMuted text-xl">Không tìm thấy bài viết nào phù hợp.</p>
      )}
    </div>
  );
};

export default BlogPage;

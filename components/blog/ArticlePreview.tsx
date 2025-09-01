
import React from 'react';
import { Link } from 'react-router-dom'; // Link is compatible with v6/v7
import { Article } from '../../types';
import Card from '../ui/Card';

interface ArticlePreviewProps {
  article: Article;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article }) => {
  return (
    <Card className="flex flex-col overflow-hidden h-full border border-borderDefault hover:shadow-xl">
      <Link to={`/article/${article.id}`} className="block">
        <img
          src={article.imageUrl || `https://picsum.photos/seed/${article.id}/400/250`}
          alt={article.title}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-sm text-primary mb-1 font-medium">{article.category}</p>
        <Link to={`/article/${article.id}`} className="block">
          <h3 className="text-xl font-semibold text-textBase mb-2 hover:text-primary transition-colors line-clamp-2" title={article.title}>
            {article.title}
          </h3>
        </Link>
        <p className="text-textMuted text-sm mb-4 line-clamp-3 flex-grow">{article.summary}</p>
        <div className="text-xs text-textSubtle mt-auto">
          <span>Tác giả: {article.author}</span> | <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
    </Card>
  );
};

export default ArticlePreview;

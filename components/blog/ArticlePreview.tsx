
import React from 'react';
import { Link } from 'react-router-dom'; // Link is compatible with v6/v7
import { Article } from '../../types';

interface ArticlePreviewProps {
  article: Article;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article }) => {
  return (
    <div className="modern-card flex flex-col overflow-hidden h-full group relative">
      <Link to={`/article/${article.id}`} className="block aspect-[16/10] overflow-hidden rounded-t-lg">
        <img
          src={article.imageUrl || `https://picsum.photos/seed/${article.id}/400/250`}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="p-5 flex flex-col flex-grow">
         <div className="mb-2">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {article.category}
            </span>
        </div>
        <h3 className="text-lg font-semibold text-textBase mb-2 leading-snug transition-colors">
          <Link to={`/article/${article.id}`} className="line-clamp-2 modern-card-title">
            {article.title}
          </Link>
        </h3>
        <p className="text-xs text-textSubtle mb-3">
            By {article.author} on {new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="modern-card-description mb-4 line-clamp-3 flex-grow">{article.summary}</p>
        <div className="mt-auto">
             <Link to={`/article/${article.id}`} className="modern-card-link self-start">
                Read More <i className="fas fa-arrow-right text-xs ml-1"></i>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticlePreview;
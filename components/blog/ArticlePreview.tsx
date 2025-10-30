import React from 'react';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { Article } from '../../types';

interface ArticlePreviewProps {
  article: Article;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article }) => {
  // Use imageUrl if present, otherwise generate from imageSearchQuery or fallback to id
  const imageUrl = article.imageUrl || `https://source.unsplash.com/400x250/?${encodeURIComponent(article.imageSearchQuery || article.category)}`;

  return (
    <div className="modern-card flex flex-col overflow-hidden h-full group relative">
      <ReactRouterDOM.Link to={`/article/${article.id}`} className="block aspect-[16/10] overflow-hidden rounded-t-lg">
        <img
          src={imageUrl}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </ReactRouterDOM.Link>
      <div className="p-5 flex flex-col flex-grow">
         <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {article.category}
            </span>
            {article.isAIGenerated && (
              <span className="text-xs font-semibold text-white bg-gray-700 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <i className="fas fa-robot text-xs"></i> AI
              </span>
            )}
        </div>
        <h3 className="text-lg font-semibold text-textBase mb-2 leading-snug transition-colors">
          <ReactRouterDOM.Link to={`/article/${article.id}`} className="line-clamp-2 modern-card-title">
            {article.title}
          </ReactRouterDOM.Link>
        </h3>
        <p className="text-xs text-textSubtle mb-3">
            {/* FIX: Property 'date' does not exist on type 'Article'. Use 'publishedAt' or 'createdAt' instead. */}
            By {article.author} on {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="modern-card-description mb-4 line-clamp-3 flex-grow">{article.summary}</p>
        <div className="mt-auto">
             <ReactRouterDOM.Link to={`/article/${article.id}`} className="modern-card-link self-start">
                Read More <i className="fas fa-arrow-right text-xs ml-1"></i>
            </ReactRouterDOM.Link>
        </div>
      </div>
    </div>
  );
};

export default ArticlePreview;
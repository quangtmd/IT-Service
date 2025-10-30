import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as Constants from '../../../constants.tsx';
import { MOCK_ARTICLES } from '../../../data/mockData';
import { SiteSettings, Article } from '../../../types';
import Button from '../../ui/Button'; // Import Button
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';

const BlogItemCard: React.FC<{article: Article, index: number}> = ({article, index}) => {
    // FIX: Ensure article.id is treated as a string for the replace method.
    const placeholderImg = article.imageUrl || `https://picsum.photos/seed/modernTechBlog${String(article.id).replace(/\D/g,'') || index}/400/260`;

    return (
        <div
            className="modern-card group flex flex-col"
        >
            <Link to={`/article/${article.id}`} className="block aspect-[16/10] overflow-hidden rounded-t-xl">
                <img src={placeholderImg} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <div className="p-5 md:p-6 flex flex-col flex-grow">
                <div className="mb-2">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {article.category}
                    </span>
                </div>
                <h3 className="text-lg font-semibold text-textBase mb-2 leading-snug hover:text-primary transition-colors">
                    <Link to={`/article/${article.id}`} className="line-clamp-2">{article.title}</Link>
                </h3>
                 <p className="text-xs text-textSubtle mb-3">
                    {/* FIX: Property 'date' does not exist on type 'Article'. Use 'publishedAt' or 'createdAt' instead. */}
                    By {article.author} on {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-textMuted mb-4 line-clamp-3 flex-grow">{article.summary}</p>
                <Link to={`/article/${article.id}`} className="modern-card-link mt-auto self-start">
                    Read Article <i className="fas fa-arrow-right text-xs ml-1"></i>
                </Link>
            </div>
        </div>
    );
}

interface HomeBlogPreviewItsProps {
  categoryFilter?: string;
  maxArticles?: number;
}

const HomeBlogPreviewIts: React.FC<HomeBlogPreviewItsProps> = ({ categoryFilter, maxArticles: maxArticlesProp }) => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [loadedArticles, setLoadedArticles] = useState<Article[]>([]);
  const blogConfig = settings.homepageBlogPreview;
  const ARTICLES_STORAGE_KEY = 'adminArticles_v1_local';
  const DEFAULT_MAX_ARTICLES = 3; // Show 3 articles in a 3-column grid

  const loadContent = useCallback(() => {
    const storedSiteSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    if (storedSiteSettingsRaw) {
      setSettings(JSON.parse(storedSiteSettingsRaw));
    } else {
      setSettings(Constants.INITIAL_SITE_SETTINGS);
    }

    const storedArticlesRaw = localStorage.getItem(ARTICLES_STORAGE_KEY);
    const allArticles: Article[] = storedArticlesRaw ? JSON.parse(storedArticlesRaw) : MOCK_ARTICLES;

    let articlesToDisplay = allArticles;

    if (categoryFilter) {
      articlesToDisplay = articlesToDisplay.filter(article => article.category === categoryFilter);
    } else if (blogConfig.enabled) {
      const featuredId = blogConfig.featuredArticleId;
      const otherIds = blogConfig.otherArticleIds || [];
      const displayIds = [featuredId, ...otherIds].filter(Boolean) as string[];

      if (displayIds.length > 0) {
        articlesToDisplay = displayIds
          // FIX: Compare IDs as strings to avoid type mismatch.
          .map(id => allArticles.find(article => String(article.id) === String(id))) // Search in allArticles
          .filter(Boolean) as Article[];
      } else {
        articlesToDisplay = allArticles.slice(0, maxArticlesProp || DEFAULT_MAX_ARTICLES);
      }
    } else {
         articlesToDisplay = allArticles.slice(0, maxArticlesProp || DEFAULT_MAX_ARTICLES);
    }

    setLoadedArticles(articlesToDisplay.slice(0, maxArticlesProp || DEFAULT_MAX_ARTICLES));

  }, [categoryFilter, maxArticlesProp, blogConfig.enabled, blogConfig.featuredArticleId, blogConfig.otherArticleIds]);


  useEffect(() => {
    loadContent();
    window.addEventListener('siteSettingsUpdated', loadContent);
    window.addEventListener('articlesUpdated', loadContent);
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadContent);
      window.removeEventListener('articlesUpdated', loadContent);
    };
  }, [loadContent]);


  if (!blogConfig.enabled && !categoryFilter) return null;
  if (loadedArticles.length === 0) return <p className="text-center text-textMuted py-8">No recent articles to display.</p>;


  return (
    <section className="bg-bgMuted">
      <div className="container mx-auto px-4">
        {!categoryFilter && (
          <div className="home-section-title-area">
            {blogConfig.preTitle && (
                <span className="home-section-pretitle">
                    {blogConfig.sectionTitleIconUrl && <img src={blogConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
                    <img src={settings.siteLogoUrl || ''} onError={(e) => (e.currentTarget.style.display = 'none')} alt={`${settings.companyName} logo`} className="inline h-6 mr-2 object-contain" />
                    {blogConfig.preTitle}
                </span>
            )}
            <h2 className="home-section-title text-4xl md:text-5xl font-extrabold mb-6">
                {blogConfig.title || "Latest News & Insights"}
            </h2>
             <p className="home-section-subtitle mt-3">
                Stay updated with the latest trends, tips, and news from the tech world.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadedArticles.map((article, index) => (
            <BlogItemCard key={article.id} article={article} index={index} />
          ))}
        </div>

        {!categoryFilter && (
            <div className="text-center mt-12">
                <Link to="/blog">
                <Button variant="primary" size="lg" className="px-10 py-3.5 text-base shadow-lg hover:shadow-primary/40">
                    Visit Our Blog <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </Button>
                </Link>
            </div>
        )}
      </div>
    </section>
  );
};

export default HomeBlogPreviewIts;
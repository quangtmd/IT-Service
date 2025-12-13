
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { MOCK_ARTICLES } from '../../../data/mockData';
import { SiteSettings, Article } from '../../../types';
import Button from '../../ui/Button';
import { Canvas } from '@react-three/fiber';
import DataStreamTunnelScene from '../three/DataStreamTunnelScene';
import TiltCard from '../../ui/TiltCard';

const BlogItemCard: React.FC<{article: Article, index: number}> = ({article, index}) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const placeholderImg = article.imageUrl || `https://picsum.photos/seed/modernTechBlog${article.id.replace(/\D/g,'') || index}/400/260`;

    return (
        <div
            ref={ref}
            className={`animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} h-full`}
            style={{animationDelay: `${index * 100}ms`}}
        >
            <TiltCard className="h-full">
                <div className="group flex flex-col relative h-full overflow-hidden rounded-2xl border-2 transition-all duration-300
                    bg-slate-800/40 backdrop-blur-lg shadow-2xl border-white/10 hover:border-primary hover:shadow-primary/20">
                    
                    <Link to={`/article/${article.id}`} className="block aspect-video overflow-hidden">
                        <img src={placeholderImg} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </Link>

                    <div className="p-6 flex flex-col flex-grow">
                        <div className="mb-3">
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {article.category}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                             <Link to={`/article/${article.id}`} className="line-clamp-2">{article.title}</Link>
                        </h3>
                        <p className="text-gray-300 text-sm mb-5 line-clamp-3 flex-grow">{article.summary}</p>
                        <div className="mt-auto">
                            <Link to={`/article/${article.id}`} className="font-semibold text-primary hover:text-primary-light transition-colors">
                                Đọc Bài viết <i className="fas fa-arrow-right text-xs ml-1 transition-transform group-hover:translate-x-1"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </TiltCard>
        </div>
    );
}

interface HomeBlogPreviewItsProps {
  categoryFilter?: string;
  maxArticles?: number;
}

const HomeBlogPreviewIts: React.FC<HomeBlogPreviewItsProps> = ({ categoryFilter, maxArticles: maxArticlesProp }) => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [loadedArticles, setLoadedArticles] = useState<Article[]>([]);

  const blogConfig = settings.homepageBlogPreview;
  const ARTICLES_STORAGE_KEY = 'adminArticles_v1';
  const DEFAULT_MAX_ARTICLES = 3; 

  const loadContent = useCallback(() => {
    const storedSiteSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    if (storedSiteSettingsRaw) {
      setSettings(JSON.parse(storedSiteSettingsRaw));
    } else {
      setSettings(Constants.INITIAL_SITE_SETTINGS);
    }

    const allArticles: Article[] = MOCK_ARTICLES;

    let articlesToDisplay = allArticles;

    if (categoryFilter) {
      articlesToDisplay = articlesToDisplay.filter(article => article.category === categoryFilter);
    } else if (blogConfig.enabled) {
        articlesToDisplay = allArticles.slice(0, maxArticlesProp || DEFAULT_MAX_ARTICLES);
    } else {
         articlesToDisplay = allArticles.slice(0, maxArticlesProp || DEFAULT_MAX_ARTICLES);
    }

    setLoadedArticles(articlesToDisplay.slice(0, maxArticlesProp || DEFAULT_MAX_ARTICLES));

  }, [categoryFilter, maxArticlesProp, blogConfig.enabled]);


  useEffect(() => {
    loadContent();
    window.addEventListener('siteSettingsUpdated', loadContent);
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadContent);
    };
  }, [loadContent]);


  if (!blogConfig.enabled && !categoryFilter) return null;
  if (loadedArticles.length === 0) return null;


  return (
    <section className="home-section relative bg-[#0B1120] text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
            <Canvas>
                <Suspense fallback={null}>
                    <DataStreamTunnelScene />
                </Suspense>
            </Canvas>
        </div>

      <div className="container mx-auto px-4 relative z-10">
        {!categoryFilter && (
          <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
            {blogConfig.preTitle && (
                <span className="home-section-pretitle bg-black/40 backdrop-blur-md border border-primary/30 text-primary">
                    {blogConfig.sectionTitleIconUrl && <img src={blogConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
                    {blogConfig.preTitle}
                </span>
            )}
            <h2 className="home-section-title text-4xl md:text-5xl font-extrabold text-white">
                {blogConfig.title || "Tin Tức & Chia Sẻ Mới Nhất"}
            </h2>
             <p className="home-section-subtitle text-gray-300">
                Cập nhật những xu hướng, mẹo và tin tức mới nhất từ thế giới công nghệ.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadedArticles.map((article, index) => (
            <BlogItemCard key={article.id} article={article} index={index} />
          ))}
        </div>

        {!categoryFilter && (
            <div className={`text-center mt-12 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`} style={{animationDelay: '0.3s'}}>
                <Link to="/blog">
                <Button variant="primary" size="lg" className="px-10 py-3.5 text-base shadow-lg hover:shadow-primary/40">
                    Xem Blog Của Chúng Tôi <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </Button>
                </Link>
            </div>
        )}
      </div>
    </section>
  );
};

export default HomeBlogPreviewIts;

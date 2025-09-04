

import React, { useState, useEffect, useMemo } from 'react';
import ArticlePreview from '../components/blog/ArticlePreview';
import SearchBar from '../components/shared/SearchBar';
import { Article } from '../types';
import geminiService from '../services/geminiService';
import { MOCK_ARTICLES } from '../data/mockData';

const MANUAL_ARTICLES_KEY = 'adminArticles_v1';
const AI_ARTICLES_KEY = 'aiGeneratedArticles_v1';
const AI_LAST_FETCHED_KEY = 'aiArticlesLastFetched_v1';
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  useEffect(() => {
    const loadAndFetchArticles = async () => {
      setIsLoading(true);
      
      // Load manual articles from localStorage or mock
      const manualArticlesRaw = localStorage.getItem(MANUAL_ARTICLES_KEY);
      const manualArticles: Article[] = manualArticlesRaw ? JSON.parse(manualArticlesRaw) : MOCK_ARTICLES;

      // Load cached AI articles
      const aiArticlesRaw = localStorage.getItem(AI_ARTICLES_KEY);
      const cachedAiArticles: Article[] = aiArticlesRaw ? JSON.parse(aiArticlesRaw) : [];

      // Load last fetch time
      const lastFetchedTimestamp = localStorage.getItem(AI_LAST_FETCHED_KEY);
      const lastFetchedTime = lastFetchedTimestamp ? parseInt(lastFetchedTimestamp, 10) : null;
      setLastFetched(lastFetchedTime);
      
      setAllArticles([...manualArticles, ...cachedAiArticles]);
      setIsLoading(false);

      const isCacheStale = !lastFetchedTime || (Date.now() - lastFetchedTime > CACHE_DURATION_MS);

      if (process.env.API_KEY && isCacheStale) {
        setIsLoadingAI(true);
        setAiError(null);
        try {
          const newAiArticlesData = await geminiService.fetchLatestTechNews();
          const newAiArticles: Article[] = newAiArticlesData.map((art, index) => ({
            id: `ai-${Date.now()}-${index}`,
            title: art.title || "Không có tiêu đề",
            summary: art.summary || "Không có tóm tắt",
            content: art.content || "Nội dung đang được cập nhật.",
            category: art.category || "Tin tức công nghệ",
            imageSearchQuery: art.imageSearchQuery || "technology",
            imageUrl: '', // Will be generated from query
            author: "AI News Bot",
            date: new Date().toISOString(),
            isAIGenerated: true,
          }));
          
          localStorage.setItem(AI_ARTICLES_KEY, JSON.stringify(newAiArticles));
          const now = Date.now();
          localStorage.setItem(AI_LAST_FETCHED_KEY, now.toString());
          setLastFetched(now);
          setAllArticles([...manualArticles, ...newAiArticles]);

        } catch (error) {
          console.error("Failed to fetch AI articles:", error);
          setAiError(error instanceof Error ? error.message : "Lỗi không xác định");
        } finally {
          setIsLoadingAI(false);
        }
      }
    };
    
    loadAndFetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    return allArticles
      .filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allArticles, searchTerm]);

  const renderStatus = () => {
    if (isLoadingAI) {
      return (
        <div className="flex items-center justify-center text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang tìm kiếm tin tức công nghệ mới nhất bằng AI...
        </div>
      );
    }
    if (aiError) {
      return (
        <div className="text-sm text-danger-text bg-danger-bg p-3 rounded-lg border border-danger-border">
          <strong>Lỗi cập nhật tin tức AI:</strong> {aiError}
        </div>
      );
    }
    if (lastFetched) {
      return (
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
          <i className="fas fa-robot mr-2 text-primary"></i>
          Tin tức được AI cập nhật lúc: {new Date(lastFetched).toLocaleString('vi-VN')}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-textBase mb-2">Blog & Tin Tức</h1>
        <p className="text-textMuted max-w-xl mx-auto">
          Cập nhật những mẹo hay, hướng dẫn hữu ích, và tin tức công nghệ mới nhất từ chúng tôi và AI.
        </p>
      </div>

      <div className="mb-8 max-w-3xl mx-auto space-y-4">
        <SearchBar onSearch={setSearchTerm} placeholder="Tìm kiếm bài viết..."/>
        {renderStatus()}
      </div>

      {isLoading && allArticles.length === 0 ? (
         <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-textMuted">Đang tải bài viết...</p>
         </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map(article => (
            <ArticlePreview key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow border">
            <i className="fas fa-search text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-textBase">Không tìm thấy bài viết</h3>
            <p className="text-textMuted mt-2">Không có bài viết nào phù hợp với tìm kiếm của bạn.</p>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
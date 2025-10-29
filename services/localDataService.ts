import { Product, Order, Article, MediaItem, OrderStatus } from '../types';
import { MOCK_ARTICLES, MOCK_ORDERS, MOCK_PRODUCTS } from '../data/mockData';
import * as Constants from '../constants';

const ARTICLES_KEY = 'adminArticles_v1_local';
const MEDIA_KEY = 'siteMediaLibrary_v1_local';

// --- API Helpers ---
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${Constants.BACKEND_API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Lỗi mạng hoặc server không phản hồi' }));
        throw new Error(errorData.error || `Lỗi HTTP: ${response.status}`);
    }
    return response.json();
};


// --- Generic Helper for LocalStorage ---
const getLocalStorageItem = <T extends any[]>(key: string, initialData: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : initialData;
    } catch (error) {
        console.error(`Error with localStorage key "${key}":`, error);
        return initialData;
    }
};

const setLocalStorage = <T,>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// --- Product Service ---
export const getProducts = async (): Promise<Product[]> => {
    // This function now fetches a large number of products to simulate "get all" for components
    // that rely on client-side filtering (e.g., related products).
    const data = await apiFetch('/api/products?limit=1000');
    return data.products;
};

export const getFilteredProducts = async (
    filters: { [key: string]: string | number | null },
    page: number,
    limit: number
): Promise<{ products: Product[], totalProducts: number }> => {
    const params = new URLSearchParams();
    for (const key in filters) {
        if (filters[key] !== null && filters[key] !== '') {
            params.append(key, String(filters[key]));
        }
    }
    params.append('page', String(page));
    params.append('limit', String(limit));
    return apiFetch(`/api/products?${params.toString()}`);
};


export const getProduct = async (id: string): Promise<Product | null> => {
    try {
        return await apiFetch(`/api/products/${id}`);
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct = { ...product, id: `prod-${Date.now()}` };
    return apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
    });
};

export const updateProduct = async (id: string, productUpdate: Partial<Product>): Promise<void> => {
    await apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productUpdate),
    });
};

export const deleteProduct = async (id: string): Promise<void> => {
    await apiFetch(`/api/products/${id}`, {
        method: 'DELETE',
    });
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    return await apiFetch('/api/products/featured');
};


// --- Order Service ---
export const getOrders = async (): Promise<Order[]> => {
    return await apiFetch('/api/orders');
};

export const addOrder = async (order: Order): Promise<Order> => {
    return await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(order),
    });
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    await apiFetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

// --- Article Service (Remains on LocalStorage) ---
export const getArticles = async (): Promise<Article[]> => {
    const articles = getLocalStorageItem(ARTICLES_KEY, MOCK_ARTICLES);
    return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getArticle = async (id: string): Promise<Article | null> => {
    const articles = await getArticles();
    // Also check AI articles from a different storage
    const aiArticlesRaw = localStorage.getItem('aiGeneratedArticles_v1');
    const aiArticles = aiArticlesRaw ? JSON.parse(aiArticlesRaw) : [];
    return [...articles, ...aiArticles].find(a => a.id === id) || null;
};

export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
    const articles = await getArticles();
    const newArticle = { ...article, id: `art-${Date.now()}`, date: new Date().toISOString() };
    setLocalStorage(ARTICLES_KEY, [newArticle, ...articles]);
    window.dispatchEvent(new CustomEvent('articlesUpdated'));
    return newArticle;
};

export const updateArticle = async (id: string, articleUpdate: Partial<Article>): Promise<void> => {
    let articles = await getArticles();
    articles = articles.map(a => a.id === id ? { ...a, ...articleUpdate, id } : a);
    setLocalStorage(ARTICLES_KEY, articles);
    window.dispatchEvent(new CustomEvent('articlesUpdated'));
};

export const deleteArticle = async (id: string): Promise<void> => {
    const articles = await getArticles();
    setLocalStorage(ARTICLES_KEY, articles.filter(a => a.id !== id));
    window.dispatchEvent(new CustomEvent('articlesUpdated'));
};

// --- Media Library Service (Remains on LocalStorage) ---
export const getMediaItems = async (): Promise<MediaItem[]> => {
    const items = getLocalStorageItem(MEDIA_KEY, []);
    return items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
};

export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    const items = await getMediaItems();
    const newItem = { ...item, id: `media-${Date.now()}` };
    setLocalStorage(MEDIA_KEY, [newItem, ...items]);
    return newItem;
};

export const deleteMediaItem = async (id: string): Promise<void> => {
    const items = await getMediaItems();
    setLocalStorage(MEDIA_KEY, items.filter(i => i.id !== id));
};
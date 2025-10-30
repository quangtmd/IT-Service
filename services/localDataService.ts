import { Product, Order, Article, MediaItem, OrderStatus, FaqItem, DiscountCode, SiteSettings, ProductCategory } from '../types';
import * as Constants from '../constants';

// --- API Helper ---
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const response = await fetch(`${Constants.BACKEND_API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định' }));
        throw new Error(errorData.error || `Lỗi HTTP: ${response.status}`);
    }
    if (response.status === 204) { // No Content
        return null;
    }
    return response.json();
};

// --- Category Service ---
export const getProductCategories = async (): Promise<ProductCategory[]> => {
    return apiFetch('/api/product_categories');
};


// --- Product Service ---
export const getProducts = async (): Promise<Product[]> => {
    const data = await apiFetch('/api/products?limit=1000'); // Lấy tất cả sản phẩm
    return data.products;
};

export const getFilteredProducts = async (
    filters: { [key: string]: string | number | null },
    page: number,
    limit: number
): Promise<{ products: Product[], totalProducts: number }> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    for (const key in filters) {
        if (filters[key]) {
            params.append(key, String(filters[key]));
        }
    }
    return apiFetch(`/api/products?${params.toString()}`);
};

export const getProduct = async (id: string): Promise<Product | null> => {
    return apiFetch(`/api/products/${id}`);
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    return apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(product),
    });
};

export const updateProduct = async (id: number | string, productUpdate: Partial<Product>): Promise<Product> => {
    return apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productUpdate),
    });
};

export const deleteProduct = async (id: number | string): Promise<void> => {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    return apiFetch('/api/products/featured');
};

// --- Order Service ---
export const getOrders = async (): Promise<Order[]> => {
    return apiFetch('/api/orders');
};

export const addOrder = async (orderData: any): Promise<Order> => {
    return apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
};

export const updateOrderStatus = async (id: number | string, status: OrderStatus): Promise<void> => {
    // FIX: Convert id to string for API endpoint.
    await apiFetch(`/api/orders/${String(id)}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

// --- Article Service (Local) ---
export const getArticles = async (): Promise<Article[]> => {
    const stored = localStorage.getItem('adminArticles_v1_local');
    // Ensure all articles have createdAt for sorting robustness
    const articles: Article[] = stored ? JSON.parse(stored) : [];
    return articles.map(a => ({ ...a, createdAt: a.createdAt || new Date(0).toISOString() }));
};

export const getArticle = async (id: string): Promise<Article | null> => {
    const articles = await getArticles();
    // FIX: Compare IDs as strings to avoid type mismatch (number vs string).
    return articles.find(a => String(a.id) === String(id)) || null;
};

export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
    const articles = await getArticles();
    const newArticle = { ...article, id: Date.now() }; // Use number for consistency
    localStorage.setItem('adminArticles_v1_local', JSON.stringify([newArticle, ...articles]));
    window.dispatchEvent(new Event('articlesUpdated'));
    return newArticle as Article;
};

export const updateArticle = async (id: number | string, articleUpdate: Partial<Article>): Promise<void> => {
    const articles = await getArticles();
    // FIX: Compare IDs as strings.
    const updatedArticles = articles.map(a => String(a.id) === String(id) ? { ...a, ...articleUpdate } : a);
    localStorage.setItem('adminArticles_v1_local', JSON.stringify(updatedArticles));
    window.dispatchEvent(new Event('articlesUpdated'));
};

export const deleteArticle = async (id: number | string): Promise<void> => {
    const articles = await getArticles();
    // FIX: Compare IDs as strings.
    const updatedArticles = articles.filter(a => String(a.id) !== String(id));
    localStorage.setItem('adminArticles_v1_local', JSON.stringify(updatedArticles));
    window.dispatchEvent(new Event('articlesUpdated'));
};


// --- Local Storage Services ---
const createLocalSettingsService = <T,>(key: string, initialData: T[]) => ({
    get: async (): Promise<T[]> => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initialData;
    },
    updateAll: async (data: T[]): Promise<void> => {
        localStorage.setItem(key, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent(`${key}Updated`));
    },
});

export const faqService = createLocalSettingsService<FaqItem>(Constants.FAQ_STORAGE_KEY, Constants.INITIAL_FAQS);
export const discountService = createLocalSettingsService<DiscountCode>(Constants.DISCOUNTS_STORAGE_KEY, Constants.INITIAL_DISCOUNT_CODES);

export const getSiteSettings = async (): Promise<SiteSettings> => {
    const settings = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    return settings ? JSON.parse(settings) : Constants.INITIAL_SITE_SETTINGS;
};

export const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
    localStorage.setItem(Constants.SITE_CONFIG_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('siteSettingsUpdated'));
};

export const getMediaItems = async (): Promise<MediaItem[]> => {
  const settings = await getSiteSettings();
  return settings.siteMediaLibrary || [];
};

export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    const settings = await getSiteSettings();
    const newItem = { ...item, id: `media-${Date.now()}` };
    const newSettings = { ...settings, siteMediaLibrary: [newItem, ...(settings.siteMediaLibrary || [])] };
    await saveSiteSettings(newSettings);
    return newItem;
};

export const deleteMediaItem = async (id: string): Promise<void> => {
    const settings = await getSiteSettings();
    const newSettings = { ...settings, siteMediaLibrary: (settings.siteMediaLibrary || []).filter(item => item.id !== id) };
    await saveSiteSettings(newSettings);
};
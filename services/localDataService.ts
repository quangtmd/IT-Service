import { Product, Order, Article, MediaItem, OrderStatus, FaqItem, DiscountCode, SiteSettings } from '../types';
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

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct = { ...product, id: `prod-${Date.now()}` };
    return apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
    });
};

export const updateProduct = async (id: string, productUpdate: Partial<Product>): Promise<Product> => {
    return apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productUpdate),
    });
};

export const deleteProduct = async (id: string): Promise<void> => {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    return apiFetch('/api/products/featured');
};

// --- Order Service ---
export const getOrders = async (): Promise<Order[]> => {
    return apiFetch('/api/orders');
};

export const addOrder = async (order: Order): Promise<Order> => {
    return apiFetch('/api/orders', {
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

// --- Article Service ---
export const getArticles = async (): Promise<Article[]> => {
    return apiFetch('/api/articles');
};

export const getArticle = async (id: string): Promise<Article | null> => {
    try {
        return await apiFetch(`/api/articles/${id}`);
    } catch (e) { return null; }
};

export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
    return apiFetch('/api/articles', { method: 'POST', body: JSON.stringify(article) });
};

export const updateArticle = async (id: string, articleUpdate: Partial<Article>): Promise<void> => {
    await apiFetch(`/api/articles/${id}`, { method: 'PUT', body: JSON.stringify(articleUpdate) });
};

export const deleteArticle = async (id: string): Promise<void> => {
    await apiFetch(`/api/articles/${id}`, { method: 'DELETE' });
};

// --- Media Library Service ---
export const getMediaItems = async (): Promise<MediaItem[]> => {
    return apiFetch('/api/media_library');
};

export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    return apiFetch('/api/media_library', { method: 'POST', body: JSON.stringify(item) });
};

export const deleteMediaItem = async (id: string): Promise<void> => {
    await apiFetch(`/api/media_library/${id}`, { method: 'DELETE' });
};

// --- Settings, FAQs, Discounts (Full update model) ---
const createSettingsService = <T,>(key: string, endpoint: string) => ({
    get: (): Promise<T[]> => apiFetch(endpoint),
    updateAll: (data: T[]): Promise<void> => apiFetch(endpoint, {
        method: 'POST', // Using POST to replace the whole collection
        body: JSON.stringify(data),
    }),
});

export const faqService = createSettingsService<FaqItem>('faqs', '/api/faqs');
export const discountService = createSettingsService<DiscountCode>('discounts', '/api/discount_codes');

// Site Settings Service (Special case)
export const getSiteSettings = async (): Promise<SiteSettings> => {
    const settings = await apiFetch('/api/settings');
    // Merge with initial settings to ensure all keys exist
    return { ...Constants.INITIAL_SITE_SETTINGS, ...settings };
};

export const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
    await apiFetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
    });
};

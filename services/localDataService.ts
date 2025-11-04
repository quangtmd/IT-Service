import { Product, Order, Article, MediaItem, OrderStatus, ServiceTicket, Inventory, ServerInfo } from '../types';
import { BACKEND_API_BASE_URL } from '../constants';

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Lỗi mạng hoặc server không phản hồi' }));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }
    return res.json();
};

const apiRequest = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    return fetch(`${BACKEND_API_BASE_URL}${endpoint}`, { ...options, headers }).then(handleResponse);
};

// --- Product Service ---
export const getProducts = async (queryParams: string = ''): Promise<{ products: Product[], totalProducts: number }> => {
    // Ensure queryParams starts with '?' if it exists
    const queryString = queryParams && !queryParams.startsWith('?') ? `?${queryParams}` : queryParams;
    return apiRequest(`/api/products${queryString}`);
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    return apiRequest('/api/products/featured');
};

export const getProduct = async (id: string): Promise<Product | null> => {
    try {
        return await apiRequest(`/api/products/${id}`);
    } catch (e) {
        if (e instanceof Error && e.message.includes('404')) return null;
        throw e;
    }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct = { ...product, id: `prod-${Date.now()}`};
    return apiRequest('/api/products', { method: 'POST', body: JSON.stringify(newProduct) });
};

export const updateProduct = async (id: string, productUpdate: Partial<Product>): Promise<void> => {
    await apiRequest(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(productUpdate) });
};

export const deleteProduct = async (id: string): Promise<void> => {
    await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
};

// --- Order Service ---
export const getOrders = async (): Promise<Order[]> => {
    return apiRequest('/api/orders');
};

export const addOrder = async (order: Order): Promise<Order> => {
    return apiRequest('/api/orders', { method: 'POST', body: JSON.stringify(order) });
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    await apiRequest(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
};

// --- Article Service ---
export const getArticles = async (): Promise<Article[]> => {
    return apiRequest('/api/articles');
};

export const getArticle = async (id: string): Promise<Article | null> => {
    // Also check AI articles from local storage as they are not in DB
    const aiArticlesRaw = localStorage.getItem('aiGeneratedArticles_v1');
    const aiArticles: Article[] = aiArticlesRaw ? JSON.parse(aiArticlesRaw) : [];
    const aiArticle = aiArticles.find(a => a.id === id);
    if (aiArticle) return aiArticle;

    try {
        return await apiRequest(`/api/articles/${id}`);
    } catch (e) {
        if (e instanceof Error && e.message.includes('404')) return null;
        throw e;
    }
};

export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
    const newArticle = { ...article, id: `art-${Date.now()}`, date: new Date().toISOString() };
    return apiRequest('/api/articles', { method: 'POST', body: JSON.stringify(newArticle) });
};

export const updateArticle = async (id: string, articleUpdate: Partial<Article>): Promise<void> => {
    await apiRequest(`/api/articles/${id}`, { method: 'PUT', body: JSON.stringify(articleUpdate) });
};

export const deleteArticle = async (id: string): Promise<void> => {
    await apiRequest(`/api/articles/${id}`, { method: 'DELETE' });
};

// --- Media Library Service ---
export const getMediaItems = async (): Promise<MediaItem[]> => {
    return apiRequest('/api/media-library');
};

export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    const newItem = { ...item, id: `media-${Date.now()}` };
    return apiRequest('/api/media-library', { method: 'POST', body: JSON.stringify(newItem) });
};

export const deleteMediaItem = async (id: string): Promise<void> => {
    await apiRequest(`/api/media-library/${id}`, { method: 'DELETE' });
};
// Fix: Add missing functions to satisfy imports in admin components.
// --- Service Ticket Service ---
export const getServiceTickets = async (): Promise<ServiceTicket[]> => {
    // This endpoint doesn't exist in the provided backend/server.js
    // Returning an empty array to prevent crashes.
    console.warn('getServiceTickets: Backend endpoint not implemented. Returning empty array.');
    return Promise.resolve([]);
    // return apiRequest('/api/service-tickets');
};

// --- Inventory Service ---
export const getInventory = async (): Promise<Inventory[]> => {
    // This endpoint doesn't exist in the provided backend/server.js
    // Returning an empty array to prevent crashes.
    console.warn('getInventory: Backend endpoint not implemented. Returning empty array.');
    return Promise.resolve([]);
    // return apiRequest('/api/inventory');
};

// --- Server Info Service ---
export const getServerInfo = async (): Promise<ServerInfo> => {
    // This endpoint doesn't exist in the provided backend/server.js
    // Returning a mock response to prevent crashes.
    console.warn('getServerInfo: Backend endpoint not implemented. Returning mock data.');
    // In a real scenario, this might hit an external IP service or a dedicated backend endpoint.
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) return { outboundIp: 'N/A' };
        const data = await response.json();
        return { outboundIp: data.ip };
    } catch (e) {
        return { outboundIp: 'N/A' };
    }
};

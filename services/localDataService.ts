// This service now fetches data from the backend API instead of localStorage.

import { 
    Product, Order, Article, OrderStatus, MediaItem, ServerInfo, 
    ServiceTicket, Inventory, ChatLogSession, FinancialTransaction, PayrollRecord
} from '../types';
import { BACKEND_API_BASE_URL } from '../constants';

const API_BASE = BACKEND_API_BASE_URL;

// --- Helper for API calls ---
async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (!response.ok) {
            // Try to parse error message from backend
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi mạng hoặc server không phản hồi (Status: ${response.status})`);
            } catch (e) {
                 throw new Error(`Lỗi mạng hoặc server không phản hồi (Status: ${response.status})`);
            }
        }
        // Handle 204 No Content for delete operations
        if (response.status === 204) {
            return {} as T;
        }
        return response.json();
    } catch (error) {
        console.error(`API call failed for endpoint ${endpoint}:`, error);
        // Re-throw a more user-friendly error message
        if (error instanceof TypeError) { // This often indicates a network failure
            throw new Error('Lỗi mạng hoặc server không phản hồi');
        }
        throw error;
    }
}


// --- Product Service ---
export const getProducts = async (queryParamsString: string = ''): Promise<{ products: Product[], totalProducts: number }> => {
    const endpoint = `/api/products${queryParamsString ? `?${queryParamsString}` : ''}`;
    return fetchFromApi<{ products: Product[], totalProducts: number }>(endpoint);
};

export const getProduct = async (id: string): Promise<Product | null> => {
    try {
        return await fetchFromApi<Product>(`/api/products/${id}`);
    } catch (error) {
        if (error instanceof Error && error.message.includes('404')) return null;
        throw error;
    }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    return fetchFromApi<Product>('/api/products', { 
        method: 'POST', 
        body: JSON.stringify(product), 
        headers: {'Content-Type': 'application/json'} 
    });
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
     return fetchFromApi<Product>(`/api/products/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify(updates), 
        headers: {'Content-Type': 'application/json'} 
    });
};

export const deleteProduct = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/products/${id}`, { method: 'DELETE' });
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    return fetchFromApi<Product[]>('/api/products/featured');
};


// --- Order Service ---
export const getOrders = async (): Promise<Order[]> => {
    return fetchFromApi<Order[]>('/api/orders');
};

export const addOrder = async (order: Order): Promise<Order> => {
    return fetchFromApi<Order>('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
    });
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    return fetchFromApi<void>(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
};


// --- Article Service ---
export const getArticles = async (): Promise<Article[]> => {
    return fetchFromApi<Article[]>('/api/articles');
};

export const getArticle = async (id: string): Promise<Article | null> => {
    // AI articles are not in the DB, they are in localStorage
    if (id.startsWith('ai-')) {
        const aiArticlesRaw = localStorage.getItem('aiGeneratedArticles_v1');
        const aiArticles: Article[] = aiArticlesRaw ? JSON.parse(aiArticlesRaw) : [];
        const aiArticle = aiArticles.find(a => a.id === id);
        if (aiArticle) return Promise.resolve(aiArticle);
    }
    
    // Fetch from backend if not an AI article
    try {
        return await fetchFromApi<Article>(`/api/articles/${id}`);
    } catch (error) {
        if (error instanceof Error && error.message.includes('404')) return null;
        throw error;
    }
};

export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
     return fetchFromApi<Article>('/api/articles', { 
        method: 'POST', 
        body: JSON.stringify(article), 
        headers: {'Content-Type': 'application/json'} 
    });
};

export const updateArticle = async (id: string, updates: Partial<Article>): Promise<Article> => {
     return fetchFromApi<Article>(`/api/articles/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify(updates), 
        headers: {'Content-Type': 'application/json'} 
    });
};

export const deleteArticle = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/articles/${id}`, { method: 'DELETE' });
};


// --- Media Library Service (Still local as backend doesn't support it) ---
const MEDIA_KEY = 'siteMediaLibrary_v1';
const getLocal = <T,>(key: string, def: T): T => { try { const i = localStorage.getItem(key); return i ? JSON.parse(i) : def; } catch (e) { return def; }};
const setLocal = <T,>(key: string, val: T) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}};

export const getMediaItems = async (): Promise<MediaItem[]> => Promise.resolve(getLocal<MediaItem[]>(MEDIA_KEY, []));
export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    const items = getLocal<MediaItem[]>(MEDIA_KEY, []);
    const newItem = { ...item, id: `media-${Date.now()}`};
    setLocal(MEDIA_KEY, [newItem, ...items]);
    return Promise.resolve(newItem);
};
export const deleteMediaItem = async (id: string): Promise<void> => {
    const items = getLocal<MediaItem[]>(MEDIA_KEY, []);
    setLocal(MEDIA_KEY, items.filter(i => i.id !== id));
    return Promise.resolve();
};


// --- Misc Services ---
export const getServerInfo = async (): Promise<ServerInfo> => {
    // This is a placeholder, as the backend doesn't expose this directly.
    // The health check is a better diagnostic tool.
    return Promise.resolve({ outboundIp: 'Not available' });
};

export const checkBackendHealth = async () => {
    return fetchFromApi<{ status: string; database: string; errorCode?: string; message?: string }>('/api/health');
};

// These are still local as backend doesn't support them
export const getServiceTickets = async (): Promise<ServiceTicket[]> => Promise.resolve(getLocal('serviceTickets_v1', []));
export const getInventory = async (): Promise<Inventory[]> => Promise.resolve(getLocal('inventory_v1', []));

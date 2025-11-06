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

// --- Media Library Service ---
export const getMediaItems = async (): Promise<MediaItem[]> => fetchFromApi('/api/media');

export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    return fetchFromApi<MediaItem>('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
};

export const deleteMediaItem = async (id: string): Promise<void> => {
    return fetchFromApi(`/api/media/${id}`, { method: 'DELETE' });
};

// --- Chat Log Service ---
export const getChatLogs = async (): Promise<ChatLogSession[]> => {
    return fetchFromApi<ChatLogSession[]>('/api/chatlogs');
};

export const saveChatLogSession = async (session: ChatLogSession): Promise<void> => {
    return fetchFromApi<void>('/api/chatlogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
    });
};

// --- Financials Service ---
export const getFinancialTransactions = async (): Promise<FinancialTransaction[]> => {
    return fetchFromApi<FinancialTransaction[]>('/api/financials/transactions');
};

export const addFinancialTransaction = async (transaction: Omit<FinancialTransaction, 'id'>): Promise<FinancialTransaction> => {
    return fetchFromApi<FinancialTransaction>('/api/financials/transactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(transaction),
    });
};

export const updateFinancialTransaction = async (id: string, updates: Partial<FinancialTransaction>): Promise<FinancialTransaction> => {
    return fetchFromApi<FinancialTransaction>(`/api/financials/transactions/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates),
    });
};

export const deleteFinancialTransaction = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/financials/transactions/${id}`, { method: 'DELETE' });
};

export const getPayrollRecords = async (): Promise<PayrollRecord[]> => {
    return fetchFromApi<PayrollRecord[]>('/api/financials/payroll');
};

export const savePayrollRecords = async (records: PayrollRecord[]): Promise<void> => {
    return fetchFromApi<void>('/api/financials/payroll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(records),
    });
};

// --- Service Ticket Service ---
export const getServiceTickets = async (): Promise<ServiceTicket[]> => {
    return fetchFromApi<ServiceTicket[]>('/api/service-tickets');
};

// --- Inventory Service ---
export const getInventory = async (): Promise<Inventory[]> => {
    return fetchFromApi<Inventory[]>('/api/inventory');
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

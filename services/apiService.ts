import { 
    Product, Order, OrderStatus, Article, User, SiteSettings, FaqItem, 
    DiscountCode, SiteThemeSettings, CustomMenuLink, MediaItem, 
    ChatLogSession, ServerInfo, FinancialTransaction, PayrollRecord, 
    Quotation, Inventory 
} from '../types';
import * as Constants from '../constants';

const API_BASE = process.env.VITE_BACKEND_API_BASE_URL || '';

// --- Generic API Helper ---
const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    try {
        const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: 'Invalid JSON response from server' }));
            throw new Error(`Network response was not ok. Status: ${response.status}. Message: ${errorBody.error || response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API fetch error for ${url}:`, error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
             throw new Error(`Lỗi mạng hoặc server không phản hồi. Vui lòng kiểm tra kết nối và cấu hình backend. Error: ${error.message}`);
        }
        throw error;
    }
};

// --- Product Service ---
export const getProducts = async (query: string = ''): Promise<{ products: Product[], totalProducts: number }> => {
    // Note: The new backend returns all products, filtering/pagination would be a future backend enhancement.
    // The query string is kept for potential future use.
    return apiFetch(`/api/products?${query}`);
};
export const getProduct = async (id: string): Promise<Product | null> => apiFetch(`/api/products/${id}`);
export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => apiFetch('/api/products', { method: 'POST', body: JSON.stringify(product) });
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    await apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    return true;
};
export const deleteProduct = async (id: string): Promise<boolean> => {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
    return true;
};
export const getFeaturedProducts = async (): Promise<Product[]> => {
    const { products } = await getProducts('limit=1000'); // Fetch all
    return products.filter(p => p.tags?.includes('Nổi bật')).slice(0, 4);
}

// --- Article Service ---
export const getArticles = async (): Promise<Article[]> => apiFetch('/api/articles');
export const getArticle = async (id: string): Promise<Article | null> => {
    // Client-side merge of DB and AI articles still needed until AI articles are persisted to DB
    if (id.startsWith('ai-')) {
         const aiArticlesRaw = localStorage.getItem('aiGeneratedArticles_v1');
         const aiArticles: Article[] = aiArticlesRaw ? JSON.parse(aiArticlesRaw) : [];
         return aiArticles.find(a => a.id === id) || null;
    }
    return apiFetch(`/api/articles/${id}`);
};
export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => apiFetch('/api/articles', { method: 'POST', body: JSON.stringify(article) });
export const updateArticle = async (id: string, updates: Partial<Article>): Promise<boolean> => {
    await apiFetch(`/api/articles/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    return true;
};
export const deleteArticle = async (id: string): Promise<boolean> => {
    await apiFetch(`/api/articles/${id}`, { method: 'DELETE' });
    return true;
};

// --- User Service ---
export const getUsers = async (): Promise<User[]> => apiFetch('/api/users');
export const addUser = async (user: Omit<User, 'id'>): Promise<User> => apiFetch('/api/users', { method: 'POST', body: JSON.stringify(user) });
export const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
    await apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    return true;
};
export const deleteUser = async (id: string): Promise<boolean> => {
    await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
    return true;
};

// --- Order Service ---
export const getOrders = async (): Promise<Order[]> => apiFetch('/api/orders');
export const addOrder = async (order: Omit<Order, 'id'>): Promise<Order> => apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(order) });
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<boolean> => {
    await apiFetch(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    return true;
};

// --- Services that still use LocalStorage (for smoother transition) ---

const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

const setLocalStorageItem = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(error);
    }
};

// ChatLog, Media, Financials etc. remain on localStorage for now as per transition strategy.
// They can be migrated to API calls one by one.
export const getMediaItems = async (): Promise<MediaItem[]> => getLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, Constants.INITIAL_SITE_SETTINGS).siteMediaLibrary || [];
export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    const settings = getLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, Constants.INITIAL_SITE_SETTINGS);
    const newItem = { ...item, id: `media-${Date.now()}` };
    const newLibrary = [newItem, ...settings.siteMediaLibrary];
    setLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, { ...settings, siteMediaLibrary: newLibrary });
    window.dispatchEvent(new CustomEvent('siteSettingsUpdated'));
    return newItem;
};
export const deleteMediaItem = async (id: string): Promise<boolean> => {
    const settings = getLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, Constants.INITIAL_SITE_SETTINGS);
    const newLibrary = settings.siteMediaLibrary.filter(item => item.id !== id);
    setLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, { ...settings, siteMediaLibrary: newLibrary });
    window.dispatchEvent(new CustomEvent('siteSettingsUpdated'));
    return true;
};

export const saveChatLogSession = async (session: ChatLogSession): Promise<void> => {
    const logs = getLocalStorageItem<ChatLogSession[]>(Constants.CHAT_LOGS_STORAGE_KEY, []);
    const existingIndex = logs.findIndex(log => log.id === session.id);
    if (existingIndex > -1) logs[existingIndex] = session; else logs.unshift(session);
    setLocalStorageItem(Constants.CHAT_LOGS_STORAGE_KEY, logs.slice(0, 50));
};
export const getChatLogSessions = async (): Promise<ChatLogSession[]> => getLocalStorageItem(Constants.CHAT_LOGS_STORAGE_KEY, []);
export const deleteChatLogSession = async (id: string): Promise<boolean> => {
    const logs = getLocalStorageItem<ChatLogSession[]>(Constants.CHAT_LOGS_STORAGE_KEY, []);
    setLocalStorageItem(Constants.CHAT_LOGS_STORAGE_KEY, logs.filter(log => log.id !== id));
    return true;
};

export const getFinancialTransactions = async (): Promise<FinancialTransaction[]> => getLocalStorageItem(Constants.FINANCIAL_TRANSACTIONS_STORAGE_KEY, []);
export const addFinancialTransaction = async (transaction: Omit<FinancialTransaction, 'id'>): Promise<FinancialTransaction> => {
    const items = await getFinancialTransactions();
    const newItem = { ...transaction, id: `fin-${Date.now()}` };
    setLocalStorageItem(Constants.FINANCIAL_TRANSACTIONS_STORAGE_KEY, [newItem, ...items]);
    return newItem;
};
export const updateFinancialTransaction = async (id: string, updates: Partial<FinancialTransaction>): Promise<boolean> => {
    const items = await getFinancialTransactions();
    setLocalStorageItem(Constants.FINANCIAL_TRANSACTIONS_STORAGE_KEY, items.map(i => i.id === id ? { ...i, ...updates } : i));
    return true;
};
export const deleteFinancialTransaction = async (id: string): Promise<boolean> => {
    const items = await getFinancialTransactions();
    setLocalStorageItem(Constants.FINANCIAL_TRANSACTIONS_STORAGE_KEY, items.filter(i => i.id !== id));
    return true;
};

export const getPayrollRecords = async (): Promise<PayrollRecord[]> => getLocalStorageItem(Constants.PAYROLL_RECORDS_STORAGE_KEY, []);
export const savePayrollRecords = async (records: PayrollRecord[]): Promise<boolean> => {
    setLocalStorageItem(Constants.PAYROLL_RECORDS_STORAGE_KEY, records);
    return true;
};

export const getQuotations = async (): Promise<Quotation[]> => getLocalStorageItem('siteQuotations_v1', []);
export const addQuotation = async (quote: Omit<Quotation, 'id'>): Promise<Quotation> => {
    const items = await getQuotations();
    const newItem = { ...quote, id: `quote-${Date.now()}` };
    setLocalStorageItem('siteQuotations_v1', [newItem, ...items]);
    return newItem;
};
export const updateQuotation = async (id: string, updates: Partial<Quotation>): Promise<boolean> => {
    const items = await getQuotations();
    setLocalStorageItem('siteQuotations_v1', items.map(i => i.id === id ? { ...i, ...updates } : i));
    return true;
};
export const deleteQuotation = async (id: string): Promise<boolean> => {
    const items = await getQuotations();
    setLocalStorageItem('siteQuotations_v1', items.filter(i => i.id !== id));
    return true;
};

export const getInventory = async (): Promise<Inventory[]> => {
    const { products } = await getProducts('limit=10000');
    return products.map(p => ({
        product_id: p.id,
        product_name: p.name,
        warehouse_id: 'main',
        warehouse_name: 'Kho Chính',
        quantity: p.stock,
        last_updated: new Date().toISOString()
    }));
};

export const getServerInfo = async (): Promise<ServerInfo> => {
    // This is a mock as frontend cannot get this info.
    return { outboundIp: "Not available (check Render dashboard)" };
};

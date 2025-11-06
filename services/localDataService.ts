
import { 
    Product, Order, OrderStatus, Article, User, SiteSettings, FaqItem, 
    DiscountCode, SiteThemeSettings, CustomMenuLink, MediaItem, 
    ChatLogSession, ServerInfo, FinancialTransaction, PayrollRecord, 
    Quotation, Inventory 
} from '../types';
import * as Constants from '../constants';
import { MOCK_SERVICES, MOCK_STAFF_USERS, MOCK_PROJECTS, MOCK_TESTIMONIALS, MOCK_ARTICLES as INITIAL_ARTICLES } from '../data/mockData';

// --- Generic LocalStorage Helper ---
const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
    }
};

const setLocalStorageItem = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        // Dispatch a custom event to notify other components of the change
        const eventName = `${key.replace(/_v\d+$/, '')}Updated`;
        window.dispatchEvent(new CustomEvent(eventName));
    } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
    }
};

// --- Initialization ---
const initializeData = () => {
    if (!localStorage.getItem(Constants.PRODUCTS_STORAGE_KEY)) {
        // Mock some products for initial load if none exist
        const initialProducts: Product[] = [];
        setLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, initialProducts);
    }
    if (!localStorage.getItem('adminArticles_v1')) {
        setLocalStorageItem('adminArticles_v1', INITIAL_ARTICLES);
    }
     if (!localStorage.getItem('adminUsers_v1')) {
        const initialUsers: User[] = [
            { id: 'user001', username: 'Quang Trần', email: Constants.ADMIN_EMAIL, password: 'password123', role: 'admin' },
            ...MOCK_STAFF_USERS
        ];
        setLocalStorageItem('adminUsers_v1', initialUsers);
    }
};
initializeData(); // Run on script load

// --- Product Service ---
export const getProducts = async (query: string = ''): Promise<{ products: Product[], totalProducts: number }> => {
    const allProducts: Product[] = getLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, []);
    const params = new URLSearchParams(query);
    
    let filtered = allProducts.filter(p => p.isVisible);

    if (params.get('mainCategory')) filtered = filtered.filter(p => p.mainCategory.toLowerCase() === params.get('mainCategory')?.toLowerCase());
    if (params.get('subCategory')) filtered = filtered.filter(p => p.subCategory.toLowerCase() === params.get('subCategory')?.toLowerCase());
    if (params.get('brand')) filtered = filtered.filter(p => p.brand?.toLowerCase() === params.get('brand')?.toLowerCase());
    if (params.get('q')) {
        const q = params.get('q')!.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    if (params.get('tags')) {
        const tag = params.get('tags')!.toLowerCase();
        filtered = filtered.filter(p => p.tags?.map(t => t.toLowerCase()).includes(tag));
    }

    const totalProducts = filtered.length;
    const page = parseInt(params.get('page') || '1', 10);
    const limit = parseInt(params.get('limit') || '12', 10);
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filtered.slice(startIndex, startIndex + limit);

    return { products: paginatedProducts, totalProducts };
};

export const getProduct = async (id: string): Promise<Product | null> => {
    const allProducts = getLocalStorageItem<Product[]>(Constants.PRODUCTS_STORAGE_KEY, []);
    return allProducts.find(p => p.id === id) || null;
};
export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const allProducts = getLocalStorageItem<Product[]>(Constants.PRODUCTS_STORAGE_KEY, []);
    const newProduct = { ...product, id: `prod-${Date.now()}` };
    setLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, [...allProducts, newProduct]);
    return newProduct;
};
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    const allProducts = getLocalStorageItem<Product[]>(Constants.PRODUCTS_STORAGE_KEY, []);
    const updatedProducts = allProducts.map(p => p.id === id ? { ...p, ...updates } : p);
    setLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, updatedProducts);
    return true;
};
export const deleteProduct = async (id: string): Promise<boolean> => {
    const allProducts = getLocalStorageItem<Product[]>(Constants.PRODUCTS_STORAGE_KEY, []);
    setLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, allProducts.filter(p => p.id !== id));
    return true;
};
export const getFeaturedProducts = async (): Promise<Product[]> => {
    const allProducts = getLocalStorageItem<Product[]>(Constants.PRODUCTS_STORAGE_KEY, []);
    return allProducts.filter(p => p.tags?.includes('Nổi bật')).slice(0, 4);
}


// --- Article Service ---
export const getArticles = async (): Promise<Article[]> => getLocalStorageItem('adminArticles_v1', INITIAL_ARTICLES);
export const getArticle = async (id: string): Promise<Article | null> => {
    const articles = await getArticles();
    // Also check AI articles from local storage
    const aiArticlesRaw = localStorage.getItem('aiGeneratedArticles_v1');
    const aiArticles: Article[] = aiArticlesRaw ? JSON.parse(aiArticlesRaw) : [];
    const combined = [...articles, ...aiArticles];
    return combined.find(a => a.id === id) || null;
}
export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
    const articles = await getArticles();
    const newArticle = { ...article, id: `art-${Date.now()}` };
    setLocalStorageItem('adminArticles_v1', [newArticle, ...articles]);
    return newArticle;
};
export const updateArticle = async (id: string, updates: Partial<Article>): Promise<boolean> => {
    const articles = await getArticles();
    setLocalStorageItem('adminArticles_v1', articles.map(a => a.id === id ? { ...a, ...updates } : a));
    return true;
};
export const deleteArticle = async (id: string): Promise<boolean> => {
    const articles = await getArticles();
    setLocalStorageItem('adminArticles_v1', articles.filter(a => a.id !== id));
    return true;
};

// --- User Service ---
export const getUsers = async (): Promise<User[]> => getLocalStorageItem('adminUsers_v1', []);
export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
    const users = await getUsers();
    const newUser = { ...user, id: `user-${Date.now()}` };
    setLocalStorageItem('adminUsers_v1', [...users, newUser]);
    return newUser;
};
export const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
    const users = await getUsers();
    setLocalStorageItem('adminUsers_v1', users.map(u => u.id === id ? { ...u, ...updates } : u));
    return true;
};
export const deleteUser = async (id: string): Promise<boolean> => {
    const users = await getUsers();
    setLocalStorageItem('adminUsers_v1', users.filter(u => u.id !== id));
    return true;
};

// --- Order Service ---
export const getOrders = async (): Promise<Order[]> => getLocalStorageItem(Constants.ORDERS_STORAGE_KEY, []);
export const addOrder = async (order: Order): Promise<Order> => {
    const orders = await getOrders();
    setLocalStorageItem(Constants.ORDERS_STORAGE_KEY, [order, ...orders]);
    return order;
};
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<boolean> => {
    const orders = await getOrders();
    setLocalStorageItem(Constants.ORDERS_STORAGE_KEY, orders.map(o => o.id === id ? { ...o, status } : o));
    return true;
};

// --- Media Library Service ---
export const getMediaItems = async (): Promise<MediaItem[]> => getLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, Constants.INITIAL_SITE_SETTINGS).siteMediaLibrary || [];
export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    const settings = getLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, Constants.INITIAL_SITE_SETTINGS);
    const newItem = { ...item, id: `media-${Date.now()}` };
    const newLibrary = [newItem, ...settings.siteMediaLibrary];
    setLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, { ...settings, siteMediaLibrary: newLibrary });
    return newItem;
};
export const deleteMediaItem = async (id: string): Promise<boolean> => {
    const settings = getLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, Constants.INITIAL_SITE_SETTINGS);
    const newLibrary = settings.siteMediaLibrary.filter(item => item.id !== id);
    setLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, { ...settings, siteMediaLibrary: newLibrary });
    return true;
};

// --- ChatLog Service ---
export const saveChatLogSession = async (session: ChatLogSession): Promise<void> => {
    const logs = getLocalStorageItem<ChatLogSession[]>(Constants.CHAT_LOGS_STORAGE_KEY, []);
    const existingIndex = logs.findIndex(log => log.id === session.id);
    if (existingIndex > -1) {
        logs[existingIndex] = session;
    } else {
        logs.unshift(session);
    }
    // Keep only the last 50 logs
    const limitedLogs = logs.slice(0, 50);
    setLocalStorageItem(Constants.CHAT_LOGS_STORAGE_KEY, limitedLogs);
};
export const getChatLogSessions = async (): Promise<ChatLogSession[]> => {
    return getLocalStorageItem(Constants.CHAT_LOGS_STORAGE_KEY, []);
}
export const deleteChatLogSession = async (id: string): Promise<boolean> => {
    const logs = getLocalStorageItem<ChatLogSession[]>(Constants.CHAT_LOGS_STORAGE_KEY, []);
    setLocalStorageItem(Constants.CHAT_LOGS_STORAGE_KEY, logs.filter(log => log.id !== id));
    return true;
};


// --- Financial & HRM ---
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


// --- Quotations, Inventory, etc. ---
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
    const products = await getProducts('limit=10000');
    // Simulate inventory from product stock
    return products.products.map(p => ({
        product_id: p.id,
        product_name: p.name,
        warehouse_id: 'main',
        warehouse_name: 'Kho Chính',
        quantity: p.stock,
        last_updated: new Date().toISOString()
    }));
};


// --- Server Info ---
// This is a mock as we can't get server IP in a browser/static site context
export const getServerInfo = async (): Promise<ServerInfo> => {
    return { outboundIp: "Not available" };
};

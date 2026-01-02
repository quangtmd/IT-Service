
// Fix: Removed vite/client reference and switched to process.env to resolve TypeScript errors.
import { 
    User, Product, Article, Order, AdminNotification, ChatLogSession, SiteSettings,
    FinancialTransaction, PayrollRecord, ServiceTicket, Inventory, Quotation, ReturnTicket, Supplier, OrderStatus,
    WarrantyTicket, Warehouse, StockReceipt, StockIssue, StockTransfer,
    Debt, PaymentApproval, CashflowForecastData,
    AdCampaign, EmailCampaign, EmailSubscriber
} from '../types';
import * as Constants from '../constants';

// --- Helper Functions for localStorage ---
const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
    }
};

const setLocalStorageItem = <T,>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        // Optional: Dispatch a custom event to notify other components of the change
        window.dispatchEvent(new CustomEvent('localStorageChange', { detail: { key } }));
    } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
    }
};

const API_BASE_URL = "";

async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullEndpoint = path.startsWith('/api/') ? path : `/api${path}`;
    const url = `${API_BASE_URL}${fullEndpoint}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Lỗi API: ${response.status} ${response.statusText}. Endpoint: ${fullEndpoint}`);
        }
        
        const text = await response.text();
        return text ? JSON.parse(text) : null;

    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Lỗi mạng hoặc server không phản hồi. Dịch vụ backend có thể đang không hoạt động.');
        }
        throw error;
    }
}

// --- User Service ---
export const getUsers = (): Promise<User[]> => fetchFromApi<User[]>('/users');
export const loginUser = (credentials: {email: string, password?: string}): Promise<User> => 
    fetchFromApi<User>('/users/login', { method: 'POST', body: JSON.stringify(credentials) });
export const addUser = (userDto: Omit<User, 'id'>): Promise<User> => fetchFromApi<User>('/users', { method: 'POST', body: JSON.stringify(userDto) });
export const updateUser = (id: string, updates: Partial<User>): Promise<User> => fetchFromApi<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteUser = (id: string): Promise<void> => fetchFromApi<void>(`/users/${id}`, { method: 'DELETE' });

// --- Product Service ---
export const getProducts = async (queryParams: string = ''): Promise<{ products: Product[], totalProducts: number }> => {
    const response = await fetchFromApi<{ products: Product[], totalProducts: number }>(`/products?${queryParams}`);
    return response || { products: [], totalProducts: 0 };
};
export const getProduct = (id: string): Promise<Product> => fetchFromApi<Product>(`/products/${id}`);
export const addProduct = (product: Omit<Product, 'id'>): Promise<Product> => fetchFromApi<Product>('/products', { method: 'POST', body: JSON.stringify(product) });
export const updateProduct = (id: string, updates: Partial<Product>): Promise<Product> => fetchFromApi<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteProduct = (id: string): Promise<void> => fetchFromApi<void>(`/products/${id}`, { method: 'DELETE' });

export const getFeaturedProducts = async (): Promise<Product[]> => {
    try {
        const response = await fetchFromApi<Product[]>('/products/featured');
        return Array.isArray(response) ? response : [];
    } catch (e) {
        console.warn("Featured API error, falling back to query:", e);
        const data = await getProducts('is_featured=true&limit=4');
        return data.products || [];
    }
};

// --- Article Service ---
export const getArticles = (): Promise<Article[]> => fetchFromApi<Article[]>('/articles');
export const getArticle = (id: string): Promise<Article> => fetchFromApi<Article>(`/articles/${id}`);
export const addArticle = (article: Omit<Article, 'id'>): Promise<Article> => fetchFromApi<Article>('/articles', { method: 'POST', body: JSON.stringify(article) });
export const updateArticle = (id: string, updates: Partial<Article>): Promise<Article> => fetchFromApi<Article>(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteArticle = (id: string): Promise<void> => fetchFromApi<void>(`/articles/${id}`, { method: 'DELETE' });

// --- Order Service ---
export const getOrders = (): Promise<Order[]> => fetchFromApi<Order[]>('/orders');
export const getCustomerOrders = (customerId: string): Promise<Order[]> => fetchFromApi<Order[]>(`/users/${customerId}/orders`);
export const addOrder = (order: Order): Promise<Order> => fetchFromApi<Order>('/orders', { method: 'POST', body: JSON.stringify(order) });
export const updateOrder = (id: string, updates: Partial<Order>): Promise<Order> => fetchFromApi<Order>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const updateOrderStatus = (id: string, status: OrderStatus): Promise<Order> => fetchFromApi<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteOrder = (id: string): Promise<void> => fetchFromApi<void>(`/orders/${id}`, { method: 'DELETE' });

// --- Other Services ---
export const getChatLogs = (): Promise<ChatLogSession[]> => fetchFromApi<ChatLogSession[]>('/chatlogs');
export const saveChatLogSession = (session: ChatLogSession): Promise<ChatLogSession> => fetchFromApi<ChatLogSession>('/chatlogs', { method: 'POST', body: JSON.stringify(session) });

// --- Financials ---
export const getFinancialTransactions = (): Promise<FinancialTransaction[]> => fetchFromApi<FinancialTransaction[]>('/financials/transactions');
export const addFinancialTransaction = (transaction: Omit<FinancialTransaction, 'id'>): Promise<FinancialTransaction> => fetchFromApi<FinancialTransaction>('/financials/transactions', { method: 'POST', body: JSON.stringify(transaction) });
export const updateFinancialTransaction = (id: string, updates: Partial<FinancialTransaction>): Promise<FinancialTransaction> => fetchFromApi<FinancialTransaction>(`/financials/transactions/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteFinancialTransaction = (id: string): Promise<void> => fetchFromApi<void>(`/financials/transactions/${id}`, { method: 'DELETE' });

export const getPayrollRecords = (): Promise<PayrollRecord[]> => fetchFromApi<PayrollRecord[]>('/financials/payroll');
export const savePayrollRecords = (records: PayrollRecord[]): Promise<void> => fetchFromApi<void>('/financials/payroll', { method: 'POST', body: JSON.stringify(records) });

export const getDebts = (): Promise<Debt[]> => fetchFromApi<Debt[]>('/debts');
export const updateDebt = (id: string, updates: Partial<Debt>): Promise<Debt> => fetchFromApi<Debt>(`/debts/${id}`, { method: 'PUT', body: JSON.stringify(updates) });

export const getPaymentApprovals = (): Promise<PaymentApproval[]> => fetchFromApi<PaymentApproval[]>('/payment-approvals');
export const updatePaymentApproval = (id: string, updates: Partial<PaymentApproval>): Promise<PaymentApproval> => fetchFromApi<PaymentApproval>(`/payment-approvals/${id}`, { method: 'PUT', body: JSON.stringify(updates) });

export const getCashflowForecast = (): Promise<CashflowForecastData> => fetchFromApi<CashflowForecastData>('/financials/forecast');


// --- Service Tickets ---
export const getServiceTickets = (): Promise<ServiceTicket[]> => fetchFromApi<ServiceTicket[]>('/service-tickets');
export const addServiceTicket = (ticket: any): Promise<ServiceTicket> => fetchFromApi<ServiceTicket>('/service-tickets', { method: 'POST', body: JSON.stringify(ticket) });
export const updateServiceTicket = (id: string, updates: Partial<ServiceTicket>): Promise<ServiceTicket> => fetchFromApi<ServiceTicket>(`/service-tickets/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteServiceTicket = (id: string): Promise<void> => fetchFromApi<void>(`/service-tickets/${id}`, { method: 'DELETE' });

export const getWarrantyTickets = (): Promise<WarrantyTicket[]> => fetchFromApi<WarrantyTicket[]>('/warranty-tickets');
export const addWarrantyTicket = (ticket: any): Promise<WarrantyTicket> => fetchFromApi<WarrantyTicket>('/warranty-tickets', { method: 'POST', body: JSON.stringify(ticket) });
export const updateWarrantyTicket = (id: string, updates: Partial<WarrantyTicket>): Promise<WarrantyTicket> => fetchFromApi<WarrantyTicket>(`/warranty-tickets/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteWarrantyTicket = (id: string): Promise<void> => fetchFromApi<void>(`/warranty-tickets/${id}`, { method: 'DELETE' });

export const getSuppliers = (): Promise<Supplier[]> => fetchFromApi<Supplier[]>('/suppliers');
export const addSupplier = (supplier: any): Promise<Supplier> => fetchFromApi<Supplier>('/suppliers', { method: 'POST', body: JSON.stringify(supplier) });
export const updateSupplier = (id: string, updates: Partial<Supplier>): Promise<Supplier> => fetchFromApi<Supplier>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteSupplier = (id: string): Promise<void> => fetchFromApi<void>(`/suppliers/${id}`, { method: 'DELETE' });

export const checkBackendHealth = (): Promise<any> => fetchFromApi('/health');

export const getMediaItems = (): Promise<any[]> => fetchFromApi<any[]>('/media');
export const addMediaItem = (item: any): Promise<any> => fetchFromApi<any>('/media', { method: 'POST', body: JSON.stringify(item) });
export const deleteMediaItem = (id: string): Promise<void> => fetchFromApi<void>(`/media/${id}`, { method: 'DELETE' });

export const getQuotations = (): Promise<Quotation[]> => fetchFromApi<Quotation[]>('/quotations');
export const addQuotation = (q: any): Promise<Quotation> => fetchFromApi<Quotation>('/quotations', { method: 'POST', body: JSON.stringify(q) });
export const updateQuotation = (id: string, u: any): Promise<Quotation> => fetchFromApi<Quotation>(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(u) });
export const deleteQuotation = (id: string): Promise<void> => fetchFromApi<void>(`/quotations/${id}`, { method: 'DELETE' });

export const getReturns = (): Promise<ReturnTicket[]> => fetchFromApi<ReturnTicket[]>('/returns');
export const addReturn = (r: any): Promise<ReturnTicket> => fetchFromApi<ReturnTicket>('/returns', { method: 'POST', body: JSON.stringify(r) });
export const updateReturn = (id: string, u: any): Promise<ReturnTicket> => fetchFromApi<ReturnTicket>(`/returns/${id}`, { method: 'PUT', body: JSON.stringify(u) });
export const deleteReturn = (id: string): Promise<void> => fetchFromApi<void>(`/returns/${id}`, { method: 'DELETE' });


// --- NEW INVENTORY & LOGISTICS LOCAL SERVICES (using localStorage) ---

// Warehouses
export const getWarehouses = async (): Promise<Warehouse[]> => {
    return getLocalStorageItem(Constants.WAREHOUSES_STORAGE_KEY, Constants.INITIAL_WAREHOUSES);
};

// Stock Receipts
export const getStockReceipts = async (): Promise<StockReceipt[]> => {
    return getLocalStorageItem(Constants.STOCK_RECEIPTS_STORAGE_KEY, Constants.INITIAL_STOCK_RECEIPTS);
};

export const addStockReceipt = async (receipt: Omit<StockReceipt, 'id'>): Promise<StockReceipt> => {
    const receipts = await getStockReceipts();
    const newReceipt = { ...receipt, id: `sr-${Date.now()}` };
    setLocalStorageItem(Constants.STOCK_RECEIPTS_STORAGE_KEY, [newReceipt, ...receipts]);
    return newReceipt;
};

export const updateStockReceipt = async (id: string, updates: Partial<StockReceipt>): Promise<StockReceipt> => {
    const receipts = await getStockReceipts();
    let updatedReceipt: StockReceipt | undefined;
    const newReceipts = receipts.map(r => {
        if (r.id === id) {
            updatedReceipt = { ...r, ...updates };
            return updatedReceipt;
        }
        return r;
    });
    if (!updatedReceipt) throw new Error("Receipt not found");
    setLocalStorageItem(Constants.STOCK_RECEIPTS_STORAGE_KEY, newReceipts);
    return updatedReceipt;
};

export const deleteStockReceipt = async (id: string): Promise<void> => {
    const receipts = await getStockReceipts();
    setLocalStorageItem(Constants.STOCK_RECEIPTS_STORAGE_KEY, receipts.filter(r => r.id !== id));
};

// Stock Issues
export const getStockIssues = async (): Promise<StockIssue[]> => {
    return getLocalStorageItem(Constants.STOCK_ISSUES_STORAGE_KEY, []);
};
export const addStockIssue = async (issue: Omit<StockIssue, 'id'>): Promise<StockIssue> => {
    const issues = await getStockIssues();
    const newIssue = { ...issue, id: `si-${Date.now()}` };
    setLocalStorageItem(Constants.STOCK_ISSUES_STORAGE_KEY, [newIssue, ...issues]);
    return newIssue;
};
export const updateStockIssue = async (id: string, updates: Partial<StockIssue>): Promise<StockIssue> => {
    const issues = await getStockIssues();
    let updated: StockIssue | undefined;
    const newItems = issues.map(i => {
        if (i.id === id) {
            updated = { ...i, ...updates };
            return updated;
        }
        return i;
    });
    if (!updated) throw new Error("Issue not found");
    setLocalStorageItem(Constants.STOCK_ISSUES_STORAGE_KEY, newItems);
    return updated;
};
export const deleteStockIssue = async (id: string): Promise<void> => {
    const issues = await getStockIssues();
    setLocalStorageItem(Constants.STOCK_ISSUES_STORAGE_KEY, issues.filter(i => i.id !== id));
};


// Stock Transfers
export const getStockTransfers = async (): Promise<StockTransfer[]> => {
    return getLocalStorageItem(Constants.STOCK_TRANSFERS_STORAGE_KEY, []);
};
export const addStockTransfer = async (transfer: Omit<StockTransfer, 'id'>): Promise<StockTransfer> => {
    const transfers = await getStockTransfers();
    const newTransfer = { ...transfer, id: `stf-${Date.now()}` };
    setLocalStorageItem(Constants.STOCK_TRANSFERS_STORAGE_KEY, [newTransfer, ...transfers]);
    return newTransfer;
};
export const updateStockTransfer = async (id: string, updates: Partial<StockTransfer>): Promise<StockTransfer> => {
    const transfers = await getStockTransfers();
    let updated: StockTransfer | undefined;
    const newItems = transfers.map(t => {
        if (t.id === id) {
            updated = { ...t, ...updates };
            return updated;
        }
        return t;
    });
    if (!updated) throw new Error("Transfer not found");
    setLocalStorageItem(Constants.STOCK_TRANSFERS_STORAGE_KEY, newItems);
    return updated;
};
export const deleteStockTransfer = async (id: string): Promise<void> => {
    const transfers = await getStockTransfers();
    setLocalStorageItem(Constants.STOCK_TRANSFERS_STORAGE_KEY, transfers.filter(t => t.id !== id));
};

// Placeholder for other missing functions
export const getAdCampaigns = async (): Promise<any[]> => { return []; };
export const addAdCampaign = async (campaign: any): Promise<void> => { };
export const updateAdCampaign = async (id: string, updates: any): Promise<void> => { };
export const deleteAdCampaign = async (id: string): Promise<void> => { };

export const getEmailCampaigns = async (): Promise<any[]> => { return []; };
export const addEmailCampaign = async (campaign: any): Promise<void> => { };
export const updateEmailCampaign = async (id: string, updates: any): Promise<void> => { };
export const deleteEmailCampaign = async (id: string): Promise<void> => { };

export const getEmailSubscribers = async (): Promise<any[]> => { return []; };
export const deleteEmailSubscriber = async (id: number): Promise<void> => { };

export const getAuditLogs = async (): Promise<any[]> => fetchFromApi<any[]>('/audit-logs');

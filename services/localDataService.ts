// Fix: Correct relative imports by moving up one directory level
import { 
    User, Product, Article, Order, AdminNotification, ChatLogSession, SiteSettings,
    FinancialTransaction, PayrollRecord, ServiceTicket, Inventory, Quotation, ReturnTicket, Supplier, OrderStatus,
    WarrantyTicket, Warehouse, StockReceipt, StockIssue, StockTransfer,
    Debt, PaymentApproval, CashflowForecastData, AdCampaign, EmailCampaign, EmailSubscriber
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
        window.dispatchEvent(new CustomEvent('localStorageChange', { detail: { key } }));
    } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
    }
};


const API_BASE_URL = "";

async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const fullEndpoint = `/api${endpoint}`;
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
            const errorMessage = `Lỗi API: ${response.status} ${response.statusText}. Endpoint: ${fullEndpoint}. Điều này có thể do dịch vụ backend đã gặp sự cố. Vui lòng kiểm tra log của server.`;
            throw new Error(errorMessage);
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
export const loginUser = (credentials: {email: string, password?: string}): Promise<User> => fetchFromApi<User>('/users/login', { method: 'POST', body: JSON.stringify(credentials) });
export const addUser = (userDto: Omit<User, 'id'>): Promise<User> => fetchFromApi<User>('/users', { method: 'POST', body: JSON.stringify(userDto) });
export const updateUser = (id: string, updates: Partial<User>): Promise<User> => fetchFromApi<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteUser = (id: string): Promise<void> => fetchFromApi<void>(`/users/${id}`, { method: 'DELETE' });

// --- Product Service ---
export const getProducts = (queryParams: string = ''): Promise<{ products: Product[], totalProducts: number }> => fetchFromApi<{ products: Product[], totalProducts: number }>(`/products?${queryParams}`);
export const getProduct = (id: string): Promise<Product> => fetchFromApi<Product>(`/products/${id}`);
export const addProduct = (product: Omit<Product, 'id'>): Promise<Product> => fetchFromApi<Product>('/products', { method: 'POST', body: JSON.stringify(product) });
export const updateProduct = (id: string, updates: Partial<Product>): Promise<Product> => fetchFromApi<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteProduct = (id: string): Promise<void> => fetchFromApi<void>(`/products/${id}`, { method: 'DELETE' });
export const getFeaturedProducts = async (): Promise<Product[]> => {
    const { products } = await getProducts('is_featured=true&limit=4');
    return products;
}

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

// --- Chat Log Service ---
export const getChatLogs = (): Promise<ChatLogSession[]> => fetchFromApi<ChatLogSession[]>('/chatlogs');
export const saveChatLogSession = (session: ChatLogSession): Promise<ChatLogSession> => fetchFromApi<ChatLogSession>('/chatlogs', { method: 'POST', body: JSON.stringify(session) });

// --- Server Info ---
export const getServerInfo = (): Promise<any> => fetchFromApi<any>('/server-info');

// --- Media Library ---
export const getMediaItems = (): Promise<any[]> => fetchFromApi<any[]>('/media');
export const addMediaItem = (item: any): Promise<any> => fetchFromApi<any>('/media', { method: 'POST', body: JSON.stringify(item) });
export const deleteMediaItem = (id: string): Promise<void> => fetchFromApi<void>(`/media/${id}`, { method: 'DELETE' });

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
export const addServiceTicket = (ticket: Omit<ServiceTicket, 'id' | 'ticket_code' | 'createdAt'>): Promise<ServiceTicket> => fetchFromApi<ServiceTicket>('/service-tickets', { method: 'POST', body: JSON.stringify(ticket) });
export const updateServiceTicket = (id: string, updates: Partial<ServiceTicket>): Promise<ServiceTicket> => fetchFromApi<ServiceTicket>(`/service-tickets/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteServiceTicket = (id: string): Promise<void> => fetchFromApi<void>(`/service-tickets/${id}`, { method: 'DELETE' });

// --- Inventory ---
export const getInventory = (): Promise<Inventory[]> => fetchFromApi<Inventory[]>('/inventory');

// --- Quotations ---
export const getQuotations = (): Promise<Quotation[]> => fetchFromApi<Quotation[]>('/quotations');
export const addQuotation = (quotation: Omit<Quotation, 'id'>): Promise<Quotation> => fetchFromApi<Quotation>('/quotations', { method: 'POST', body: JSON.stringify(quotation) });
export const updateQuotation = (id: string, updates: Partial<Quotation>): Promise<Quotation> => fetchFromApi<Quotation>(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteQuotation = (id: string): Promise<void> => fetchFromApi<void>(`/quotations/${id}`, { method: 'DELETE' });

// --- Returns ---
export const getReturns = (): Promise<ReturnTicket[]> => fetchFromApi<ReturnTicket[]>('/returns');
export const addReturn = (ticket: Omit<ReturnTicket, 'id'>): Promise<ReturnTicket> => fetchFromApi<ReturnTicket>('/returns', { method: 'POST', body: JSON.stringify(ticket) });
export const updateReturn = (id: string, updates: Partial<ReturnTicket>): Promise<ReturnTicket> => fetchFromApi<ReturnTicket>(`/returns/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteReturn = (id: string): Promise<void> => fetchFromApi<void>(`/returns/${id}`, { method: 'DELETE' });

// --- Suppliers ---
export const getSuppliers = (): Promise<Supplier[]> => fetchFromApi<Supplier[]>('/suppliers');
export const addSupplier = (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => fetchFromApi<Supplier>('/suppliers', { method: 'POST', body: JSON.stringify(supplier) });
export const updateSupplier = (id: string, updates: Partial<Supplier>): Promise<Supplier> => fetchFromApi<Supplier>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteSupplier = (id: string): Promise<void> => fetchFromApi<void>(`/suppliers/${id}`, { method: 'DELETE' });

// --- Warranty Ticket Service ---
export const getWarrantyTickets = (): Promise<WarrantyTicket[]> => fetchFromApi<WarrantyTicket[]>('/warranty-tickets');
export const addWarrantyTicket = (ticket: Omit<WarrantyTicket, 'id' | 'ticketNumber' | 'createdAt'>): Promise<WarrantyTicket> => fetchFromApi<WarrantyTicket>('/warranty-tickets', { method: 'POST', body: JSON.stringify(ticket) });
export const updateWarrantyTicket = (id: string, updates: Partial<WarrantyTicket>): Promise<WarrantyTicket> => fetchFromApi<WarrantyTicket>(`/warranty-tickets/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteWarrantyTicket = (id: string): Promise<void> => fetchFromApi<void>(`/warranty-tickets/${id}`, { method: 'DELETE' });

// --- NEW INVENTORY & LOGISTICS LOCAL SERVICES (using localStorage) ---
export const getWarehouses = (): Promise<Warehouse[]> => Promise.resolve(getLocalStorageItem(Constants.WAREHOUSES_STORAGE_KEY, Constants.INITIAL_WAREHOUSES));
export const getStockReceipts = (): Promise<StockReceipt[]> => Promise.resolve(getLocalStorageItem(Constants.STOCK_RECEIPTS_STORAGE_KEY, Constants.INITIAL_STOCK_RECEIPTS));
export const addStockReceipt = (receipt: Omit<StockReceipt, 'id'>): Promise<StockReceipt> => { const receipts = getLocalStorageItem(Constants.STOCK_RECEIPTS_STORAGE_KEY, Constants.INITIAL_STOCK_RECEIPTS); const newReceipt = { ...receipt, id: `sr-${Date.now()}` }; setLocalStorageItem(Constants.STOCK_RECEIPTS_STORAGE_KEY, [newReceipt, ...receipts]); return Promise.resolve(newReceipt); };
export const updateStockReceipt = (id: string, updates: Partial<StockReceipt>): Promise<StockReceipt> => { let updatedReceipt: StockReceipt | undefined; const newReceipts = getLocalStorageItem(Constants.STOCK_RECEIPTS_STORAGE_KEY, Constants.INITIAL_STOCK_RECEIPTS).map(r => { if (r.id === id) { updatedReceipt = { ...r, ...updates }; return updatedReceipt; } return r; }); if (!updatedReceipt) return Promise.reject(new Error("Receipt not found")); setLocalStorageItem(Constants.STOCK_RECEIPTS_STORAGE_KEY, newReceipts); return Promise.resolve(updatedReceipt); };
export const deleteStockReceipt = (id: string): Promise<void> => { const receipts = getLocalStorageItem(Constants.STOCK_RECEIPTS_STORAGE_KEY, Constants.INITIAL_STOCK_RECEIPTS); setLocalStorageItem(Constants.STOCK_RECEIPTS_STORAGE_KEY, receipts.filter(r => r.id !== id)); return Promise.resolve(); };
export const getStockIssues = (): Promise<StockIssue[]> => Promise.resolve(getLocalStorageItem(Constants.STOCK_ISSUES_STORAGE_KEY, []));
export const addStockIssue = (issue: Omit<StockIssue, 'id'>): Promise<StockIssue> => { const issues = getLocalStorageItem(Constants.STOCK_ISSUES_STORAGE_KEY, []); const newIssue = { ...issue, id: `si-${Date.now()}` }; setLocalStorageItem(Constants.STOCK_ISSUES_STORAGE_KEY, [newIssue, ...issues]); return Promise.resolve(newIssue); };
export const updateStockIssue = (id: string, updates: Partial<StockIssue>): Promise<StockIssue> => { let updated: StockIssue | undefined; const newItems = getLocalStorageItem(Constants.STOCK_ISSUES_STORAGE_KEY, []).map(i => { if (i.id === id) { updated = { ...i, ...updates }; return updated; } return i; }); if (!updated) return Promise.reject(new Error("Issue not found")); setLocalStorageItem(Constants.STOCK_ISSUES_STORAGE_KEY, newItems); return Promise.resolve(updated); };
export const deleteStockIssue = (id: string): Promise<void> => { const issues = getLocalStorageItem(Constants.STOCK_ISSUES_STORAGE_KEY, []); setLocalStorageItem(Constants.STOCK_ISSUES_STORAGE_KEY, issues.filter(i => i.id !== id)); return Promise.resolve(); };
export const getStockTransfers = (): Promise<StockTransfer[]> => Promise.resolve(getLocalStorageItem(Constants.STOCK_TRANSFERS_STORAGE_KEY, []));
export const addStockTransfer = (transfer: Omit<StockTransfer, 'id'>): Promise<StockTransfer> => { const transfers = getLocalStorageItem(Constants.STOCK_TRANSFERS_STORAGE_KEY, []); const newTransfer = { ...transfer, id: `stf-${Date.now()}` }; setLocalStorageItem(Constants.STOCK_TRANSFERS_STORAGE_KEY, [newTransfer, ...transfers]); return Promise.resolve(newTransfer); };
export const updateStockTransfer = (id: string, updates: Partial<StockTransfer>): Promise<StockTransfer> => { let updated: StockTransfer | undefined; const newItems = getLocalStorageItem(Constants.STOCK_TRANSFERS_STORAGE_KEY, []).map(t => { if (t.id === id) { updated = { ...t, ...updates }; return updated; } return t; }); if (!updated) return Promise.reject(new Error("Transfer not found")); setLocalStorageItem(Constants.STOCK_TRANSFERS_STORAGE_KEY, newItems); return Promise.resolve(updated); };
export const deleteStockTransfer = (id: string): Promise<void> => { const transfers = getLocalStorageItem(Constants.STOCK_TRANSFERS_STORAGE_KEY, []); setLocalStorageItem(Constants.STOCK_TRANSFERS_STORAGE_KEY, transfers.filter(t => t.id !== id)); return Promise.resolve(); };

// --- Placeholder Marketing APIs ---
export const getAdCampaigns = (): Promise<AdCampaign[]> => Promise.resolve([]);
export const addAdCampaign = (campaign: AdCampaign): Promise<void> => Promise.resolve();
export const updateAdCampaign = (id: string, updates: Partial<AdCampaign>): Promise<void> => Promise.resolve();
export const deleteAdCampaign = (id: string): Promise<void> => Promise.resolve();
export const getEmailCampaigns = (): Promise<EmailCampaign[]> => Promise.resolve([]);
export const addEmailCampaign = (campaign: EmailCampaign): Promise<void> => Promise.resolve();
export const updateEmailCampaign = (id: string, updates: Partial<EmailCampaign>): Promise<void> => Promise.resolve();
export const deleteEmailCampaign = (id: string): Promise<void> => Promise.resolve();
export const getEmailSubscribers = (): Promise<EmailSubscriber[]> => Promise.resolve([]);
export const deleteEmailSubscriber = (id: number): Promise<void> => Promise.resolve();

// --- System APIs ---
export const getAuditLogs = (): Promise<any[]> => fetchFromApi<any[]>('/audit-logs');
export const checkBackendHealth = (): Promise<any> => fetchFromApi('/health');
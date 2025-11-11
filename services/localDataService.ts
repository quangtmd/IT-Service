// This service now fetches data from the backend API instead of localStorage.

import { 
    Product, Order, Article, OrderStatus, MediaItem, ServerInfo, 
    ServiceTicket, Inventory, ChatLogSession, FinancialTransaction, PayrollRecord,
    Quotation, User, WarrantyTicket, ReturnTicket, Supplier, Warehouse, StockReceipt, StockIssue, StockTransfer,
    Debt, PaymentApproval, CashflowForecastData
} from '../types';
import * as Constants from '../constants';
import { BACKEND_API_BASE_URL } from '../constants';

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


const API_BASE = BACKEND_API_BASE_URL;

// --- Helper for API calls ---
async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (!response.ok) {
            // Try to parse error message from backend
            try {
                const errorData = await response.json();
                const errorMessage = errorData.message || errorData.error || `Lỗi API: ${response.status} ${response.statusText}. Vui lòng kiểm tra kết nối server.`;
                 if (response.status === 404) {
                    throw new Error(`Lỗi API: 404 Not Found. Vui lòng kiểm tra VITE_BACKEND_API_BASE_URL trên frontend.`);
                }
                // Specific handling for schema mismatch error
                if (errorData.errorCode === 'ER_BAD_FIELD_ERROR' || (errorMessage && errorMessage.includes("Unknown column"))) {
                    throw new Error(`Lỗi cơ sở dữ liệu: Cột không tồn tại. Có vẻ như lược đồ database của bạn không đồng bộ với backend. Vui lòng chạy lại script SQL từ README.md.`);
                }
                throw new Error(errorMessage);
            } catch (e) {
                 if (response.status === 404) {
                    throw new Error(`Lỗi API: 404 Not Found. Vui lòng kiểm tra VITE_BACKEND_API_BASE_URL trên frontend.`);
                }
                 throw new Error(`Lỗi API: ${response.status} ${response.statusText}. Vui lòng kiểm tra kết nối server.`);
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
            throw new Error('Lỗi mạng hoặc server không phản hồi. Vui lòng kiểm tra logs của backend.');
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

export const updateOrder = async (id: string, updates: Partial<Order>): Promise<Order> => {
     return fetchFromApi<Order>(`/api/orders/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify(updates), 
        headers: {'Content-Type': 'application/json'} 
    });
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    return fetchFromApi<void>(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
};

export const deleteOrder = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/orders/${id}`, { method: 'DELETE' });
};


// --- Article Service ---
export const getArticles = async (): Promise<Article[]> => {
    return fetchFromApi<Article[]>('/api/articles');
};

export const getArticle = async (id: string): Promise<Article | null> => {
    if (id.startsWith('ai-')) {
        const aiArticlesRaw = localStorage.getItem('aiGeneratedArticles_v1');
        const aiArticles: Article[] = aiArticlesRaw ? JSON.parse(aiArticlesRaw) : [];
        const aiArticle = aiArticles.find(a => a.id === id);
        if (aiArticle) return Promise.resolve(aiArticle);
    }
    
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

export const getDebts = async (): Promise<Debt[]> => {
    return fetchFromApi<Debt[]>('/api/debts');
};

export const updateDebt = async (id: string, updates: Partial<Debt>): Promise<Debt> => {
    return fetchFromApi<Debt>(`/api/debts/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates),
    });
};

export const getPaymentApprovals = async (): Promise<PaymentApproval[]> => {
    return fetchFromApi<PaymentApproval[]>('/api/payment-approvals');
};

export const updatePaymentApproval = async (id: string, updates: Partial<PaymentApproval>): Promise<PaymentApproval> => {
    return fetchFromApi<PaymentApproval>(`/api/payment-approvals/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates),
    });
};

export const getCashflowForecast = async (): Promise<CashflowForecastData> => {
    return fetchFromApi<CashflowForecastData>('/api/financials/forecast');
};


// --- Auth & User Service ---
export const loginUser = async (credentials: { email: string; password?: string }): Promise<User> => {
    return fetchFromApi<User>('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
};

export const getUsers = async (): Promise<User[]> => {
    return fetchFromApi<User[]>('/api/users');
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
    return fetchFromApi<User>('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
    return fetchFromApi<User>(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
};

export const deleteUser = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/users/${id}`, { method: 'DELETE' });
};

export const getCustomerOrders = async (userId: string): Promise<Order[]> => {
    return fetchFromApi<Order[]>(`/api/users/${userId}/orders`);
};

// --- Quotation Service ---
export const getQuotations = async (): Promise<Quotation[]> => {
    return fetchFromApi<Quotation[]>('/api/quotations');
};

export const addQuotation = async (quote: Omit<Quotation, 'id'>): Promise<Quotation> => {
    const newQuote = { ...quote, id: `quote-${Date.now()}` };
    return fetchFromApi<Quotation>('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuote),
    });
};
export const updateQuotation = async (id: string, updates: Partial<Quotation>): Promise<Quotation> => {
    return fetchFromApi<Quotation>(`/api/quotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
};

export const deleteQuotation = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/quotations/${id}`, { method: 'DELETE' });
};

// --- Service Ticket Service ---
export const getServiceTickets = async (): Promise<ServiceTicket[]> => {
    return fetchFromApi<ServiceTicket[]>('/api/service-tickets');
};

export const addServiceTicket = async (ticket: Omit<ServiceTicket, 'id' | 'createdAt' | 'ticket_code'>): Promise<ServiceTicket> => {
    return fetchFromApi<ServiceTicket>('/api/service-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
    });
};

export const updateServiceTicket = async (id: string, updates: Partial<ServiceTicket>): Promise<ServiceTicket> => {
    return fetchFromApi<ServiceTicket>(`/api/service-tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
};

export const deleteServiceTicket = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/service-tickets/${id}`, { method: 'DELETE' });
};

// --- Inventory Service ---
export const getInventory = async (): Promise<Inventory[]> => {
    return fetchFromApi<Inventory[]>('/api/inventory');
};

// --- Warranty Ticket Service ---
export const getWarrantyTickets = async (): Promise<WarrantyTicket[]> => {
    return fetchFromApi<WarrantyTicket[]>('/api/warranty-tickets');
};

export const addWarrantyTicket = async (ticket: Omit<WarrantyTicket, 'id' | 'ticketNumber' | 'createdAt'>): Promise<WarrantyTicket> => {
    return fetchFromApi<WarrantyTicket>('/api/warranty-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
    });
};

export const updateWarrantyTicket = async (id: string, updates: Partial<WarrantyTicket>): Promise<WarrantyTicket> => {
    return fetchFromApi<WarrantyTicket>(`/api/warranty-tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
};

export const deleteWarrantyTicket = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/warranty-tickets/${id}`, { method: 'DELETE' });
};


// --- Return Ticket Service ---
export const getReturns = async (): Promise<ReturnTicket[]> => {
    return fetchFromApi<ReturnTicket[]>('/api/returns');
};

export const addReturn = async (ticket: Omit<ReturnTicket, 'id' | 'createdAt'>): Promise<ReturnTicket> => {
    return fetchFromApi<ReturnTicket>('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
    });
};

export const updateReturn = async (id: string, updates: Partial<ReturnTicket>): Promise<ReturnTicket> => {
    return fetchFromApi<ReturnTicket>(`/api/returns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
};

export const deleteReturn = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/returns/${id}`, { method: 'DELETE' });
};

// --- Supplier Service ---
export const getSuppliers = async (): Promise<Supplier[]> => {
    return fetchFromApi<Supplier[]>('/api/suppliers');
};

export const addSupplier = async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
    return fetchFromApi<Supplier>('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplier),
    });
};

export const updateSupplier = async (id: string, updates: Partial<Supplier>): Promise<Supplier> => {
    return fetchFromApi<Supplier>(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
};

export const deleteSupplier = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/suppliers/${id}`, { method: 'DELETE' });
};


// --- Misc Services ---
export const getServerInfo = async (): Promise<ServerInfo> => {
    return Promise.resolve({ outboundIp: 'Not available' });
};

export const checkBackendHealth = async () => {
    return fetchFromApi<{ status: string; database: string; errorCode?: string; message?: string }>('/api/health');
};
// --- NEW INVENTORY & LOGISTICS API SERVICES ---

// Warehouses
export const getWarehouses = async (): Promise<Warehouse[]> => {
    return fetchFromApi<Warehouse[]>('/api/warehouses');
};

// Stock Receipts
export const getStockReceipts = async (): Promise<StockReceipt[]> => {
    return fetchFromApi<StockReceipt[]>('/api/stock-receipts');
};

export const addStockReceipt = async (receipt: Omit<StockReceipt, 'id'>): Promise<StockReceipt> => {
    return fetchFromApi<StockReceipt>('/api/stock-receipts', {
        method: 'POST', body: JSON.stringify(receipt), headers: { 'Content-Type': 'application/json' }
    });
};

export const updateStockReceipt = async (id: string, updates: Partial<StockReceipt>): Promise<StockReceipt> => {
    return fetchFromApi<StockReceipt>(`/api/stock-receipts/${id}`, {
        method: 'PUT', body: JSON.stringify(updates), headers: { 'Content-Type': 'application/json' }
    });
};

export const deleteStockReceipt = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/stock-receipts/${id}`, { method: 'DELETE' });
};

// Stock Issues
export const getStockIssues = async (): Promise<StockIssue[]> => {
    return fetchFromApi<StockIssue[]>('/api/stock-issues');
};

export const addStockIssue = async (issue: Omit<StockIssue, 'id'>): Promise<StockIssue> => {
    return fetchFromApi<StockIssue>('/api/stock-issues', {
        method: 'POST', body: JSON.stringify(issue), headers: { 'Content-Type': 'application/json' }
    });
};

export const updateStockIssue = async (id: string, updates: Partial<StockIssue>): Promise<StockIssue> => {
    return fetchFromApi<StockIssue>(`/api/stock-issues/${id}`, {
        method: 'PUT', body: JSON.stringify(updates), headers: { 'Content-Type': 'application/json' }
    });
};

export const deleteStockIssue = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/stock-issues/${id}`, { method: 'DELETE' });
};

// Stock Transfers
export const getStockTransfers = async (): Promise<StockTransfer[]> => {
    return fetchFromApi<StockTransfer[]>('/api/stock-transfers');
};
export const addStockTransfer = async (transfer: Omit<StockTransfer, 'id'>): Promise<StockTransfer> => {
    return fetchFromApi<StockTransfer>('/api/stock-transfers', {
        method: 'POST', body: JSON.stringify(transfer), headers: { 'Content-Type': 'application/json' }
    });
};
export const updateStockTransfer = async (id: string, updates: Partial<StockTransfer>): Promise<StockTransfer> => {
    return fetchFromApi<StockTransfer>(`/api/stock-transfers/${id}`, {
        method: 'PUT', body: JSON.stringify(updates), headers: { 'Content-Type': 'application/json' }
    });
};
export const deleteStockTransfer = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/api/stock-transfers/${id}`, { method: 'DELETE' });
};
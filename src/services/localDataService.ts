
// Fix: Removed vite/client reference and switched to process.env to resolve TypeScript errors.
import { 
    User, Product, Article, Order, AdminNotification, ChatLogSession, SiteSettings,
    FinancialTransaction, PayrollRecord, ServiceTicket, Inventory, Quotation, ReturnTicket, Supplier, OrderStatus,
    WarrantyTicket, Warehouse, StockReceipt, StockIssue, StockTransfer,
    Debt, PaymentApproval, CashflowForecastData,
    AdCampaign, EmailCampaign, EmailSubscriber, AuditLog, WarrantyClaim
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


// The base URL is now derived from the constants, allowing environment overrides.
// In dev (vite), this defaults to "" to use the proxy.
// In prod, it uses the VITE_BACKEND_API_BASE_URL env var.
const API_BASE_URL = Constants.BACKEND_API_BASE_URL;

async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // All API endpoints are prefixed with /api on the server.
    // This ensures the correct path is always used.
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
            
            // Handle 404 specifically to give a hint about configuration
            if (response.status === 404) {
                throw new Error(`Lỗi API: 404 Not Found (${fullEndpoint}).`);
            }

            // Simplified, more robust error message for a monolithic setup.
            const errorMessage = `Lỗi API: ${response.status} ${response.statusText}.`;
            throw new Error(errorMessage);
        }
        
        // Handle cases where the response might be empty (e.g., DELETE requests)
        const text = await response.text();
        return text ? JSON.parse(text) : null;

    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            // This now more clearly indicates a server-down issue.
            throw new Error('Lỗi mạng hoặc server không phản hồi.');
        }
        // Re-throw other errors (like the custom one from response.ok check)
        throw error;
    }
}

// --- User Service ---
export const getUsers = async (): Promise<User[]> => {
    try {
        return await fetchFromApi<User[]>('/users');
    } catch (e) {
        console.warn('API /users failed, using localStorage fallback');
        return getLocalStorageItem<User[]>('siteUsers_v1', []); // Fallback key
    }
};

export const loginUser = async (credentials: {email: string, password?: string}): Promise<User> => {
    try {
        return await fetchFromApi<User>('/login', { method: 'POST', body: JSON.stringify(credentials) });
    } catch (e) {
        // Fallback for demo login if API is down
        console.warn('API /login failed, attempting local mock login');
        const users = await getUsers();
        const user = users.find(u => u.email === credentials.email);
        if (user && user.password === credentials.password) {
            const { password, ...userWithoutPass } = user;
            return userWithoutPass as User;
        }
        throw new Error("Đăng nhập thất bại (Offline mode). Kiểm tra email/mật khẩu.");
    }
};

export const addUser = async (userDto: Omit<User, 'id'>): Promise<User> => {
    try {
        return await fetchFromApi<User>('/users', { method: 'POST', body: JSON.stringify(userDto) });
    } catch (e) {
        console.warn('API /users (POST) failed, saving to localStorage');
        const users = await getUsers();
        const newUser = { ...userDto, id: `user-${Date.now()}` } as User;
        const updatedUsers = [...users, newUser];
        setLocalStorageItem('siteUsers_v1', updatedUsers); // Save to fallback key
        return newUser;
    }
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
     try {
        return await fetchFromApi<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch (e) {
        console.warn('API /users (PUT) failed, saving to localStorage');
        const users = await getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            setLocalStorageItem('siteUsers_v1', users);
            return users[index];
        }
        throw e;
    }
};

export const deleteUser = async (id: string): Promise<void> => {
    try {
        return await fetchFromApi<void>(`/users/${id}`, { method: 'DELETE' });
    } catch (e) {
         console.warn('API /users (DELETE) failed, updating localStorage');
         const users = await getUsers();
         setLocalStorageItem('siteUsers_v1', users.filter(u => u.id !== id));
    }
};

// --- Product Service ---
export const getProducts = (queryParams: string = ''): Promise<{ products: Product[], totalProducts: number }> => fetchFromApi<{ products: Product[], totalProducts: number }>(`/products?${queryParams}`);
export const getProduct = (id: string): Promise<Product> => fetchFromApi<Product>(`/products/${id}`);
export const addProduct = (product: Omit<Product, 'id'>): Promise<Product> => fetchFromApi<Product>('/products', { method: 'POST', body: JSON.stringify(product) });
export const updateProduct = (id: string, updates: Partial<Product>): Promise<Product> => fetchFromApi<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteProduct = (id: string): Promise<void> => fetchFromApi<void>(`/products/${id}`, { method: 'DELETE' });
export const getFeaturedProducts = async (): Promise<Product[]> => {
    // Use the dedicated endpoint for featured products
    try {
         return await fetchFromApi<Product[]>('/products/featured');
    } catch (e) {
        console.warn("Featured products API failed, returning empty.");
        return [];
    }
   
}

// --- Article Service ---
export const getArticles = (): Promise<Article[]> => fetchFromApi<Article[]>('/articles');
export const getArticle = (id: string): Promise<Article> => fetchFromApi<Article>(`/articles/${id}`);
export const addArticle = (article: Omit<Article, 'id'>): Promise<Article> => fetchFromApi<Article>('/articles', { method: 'POST', body: JSON.stringify(article) });
export const updateArticle = (id: string, updates: Partial<Article>): Promise<Article> => fetchFromApi<Article>(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteArticle = (id: string): Promise<void> => fetchFromApi<void>(`/articles/${id}`, { method: 'DELETE' });

// --- Order Service (WITH ROBUST FALLBACK) ---
export const getOrders = async (): Promise<Order[]> => {
    try {
        return await fetchFromApi<Order[]>('/orders');
    } catch (e) {
        console.warn('API /orders failed, using localStorage fallback');
        return getLocalStorageItem<Order[]>(Constants.ORDERS_STORAGE_KEY, []);
    }
};

export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
    try {
        return await fetchFromApi<Order[]>(`/orders/customer/${customerId}`);
    } catch (e) {
        console.warn('API /orders/customer failed, filtering from localStorage');
        const allOrders = getLocalStorageItem<Order[]>(Constants.ORDERS_STORAGE_KEY, []);
        return allOrders.filter(o => o.userId === customerId);
    }
};

export const addOrder = async (order: Order): Promise<Order> => {
    try {
        return await fetchFromApi<Order>('/orders', { method: 'POST', body: JSON.stringify(order) });
    } catch (e) {
        console.warn('API /orders (POST) failed, saving to localStorage');
        const currentOrders = getLocalStorageItem<Order[]>(Constants.ORDERS_STORAGE_KEY, []);
        const newOrders = [order, ...currentOrders];
        setLocalStorageItem(Constants.ORDERS_STORAGE_KEY, newOrders);
        return order;
    }
};

export const updateOrder = async (id: string, updates: Partial<Order>): Promise<Order> => {
    try {
         return await fetchFromApi<Order>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch (e) {
        console.warn('API /orders (PUT) failed, updating localStorage');
        const orders = getLocalStorageItem<Order[]>(Constants.ORDERS_STORAGE_KEY, []);
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
             orders[index] = { ...orders[index], ...updates };
             setLocalStorageItem(Constants.ORDERS_STORAGE_KEY, orders);
             return orders[index];
        }
        throw e;
    }
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
     try {
        return await fetchFromApi<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
     } catch(e) {
         // Fallback using updateOrder logic locally
         return updateOrder(id, { status });
     }
};

export const deleteOrder = async (id: string): Promise<void> => {
     try {
        return await fetchFromApi<void>(`/orders/${id}`, { method: 'DELETE' });
     } catch (e) {
        console.warn('API /orders (DELETE) failed, updating localStorage');
        const orders = getLocalStorageItem<Order[]>(Constants.ORDERS_STORAGE_KEY, []);
        setLocalStorageItem(Constants.ORDERS_STORAGE_KEY, orders.filter(o => o.id !== id));
     }
};

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
export const savePayrollRecords = async (records: PayrollRecord[]): Promise<void> => {
    return fetchFromApi<void>('/financials/payroll', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(records)
    });
};

export const getDebts = (): Promise<Debt[]> => fetchFromApi<Debt[]>('/debts');
export const updateDebt = (id: string, updates: Partial<Debt>): Promise<Debt> => fetchFromApi<Debt>(`/debts/${id}`, { method: 'PUT', body: JSON.stringify(updates) });

export const getPaymentApprovals = (): Promise<PaymentApproval[]> => fetchFromApi<PaymentApproval[]>('/payment-approvals');
export const updatePaymentApproval = (id: string, updates: Partial<PaymentApproval>): Promise<PaymentApproval> => fetchFromApi<PaymentApproval>(`/payment-approvals/${id}`, { method: 'PUT', body: JSON.stringify(updates) });

export const getCashflowForecast = (): Promise<CashflowForecastData> => fetchFromApi<CashflowForecastData>('/financials/forecast');


// --- Service Tickets ---
export const getServiceTickets = (): Promise<ServiceTicket[]> => fetchFromApi<ServiceTicket[]>('/service-tickets');
export const addServiceTicket = (ticket: Omit<ServiceTicket, 'id'>): Promise<ServiceTicket> => fetchFromApi<ServiceTicket>('/service-tickets', { method: 'POST', body: JSON.stringify(ticket) });
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
export const getWarrantyClaims = async (): Promise<WarrantyClaim[]> => {
    return fetchFromApi<WarrantyClaim[]>('/warranty-claims');
};

export const addWarrantyClaim = async (ticket: Omit<WarrantyClaim, 'id' | 'claim_code' | 'created_at'>): Promise<WarrantyClaim> => {
    return fetchFromApi<WarrantyClaim>('/warranty-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
    });
};

export const updateWarrantyClaim = async (id: string, updates: Partial<WarrantyClaim>): Promise<WarrantyClaim> => {
    return fetchFromApi<WarrantyClaim>(`/warranty-claims/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
};

export const deleteWarrantyClaim = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/warranty-claims/${id}`, { method: 'DELETE' });
};


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
export const getAdCampaigns = async (): Promise<AdCampaign[]> => { return []; };
export const addAdCampaign = async (campaign: Omit<AdCampaign, 'id'>): Promise<void> => { };
export const updateAdCampaign = async (id: string, updates: Partial<AdCampaign>): Promise<void> => { };
export const deleteAdCampaign = async (id: string): Promise<void> => { };

export const getEmailCampaigns = async (): Promise<EmailCampaign[]> => { return []; };
export const addEmailCampaign = async (campaign: Omit<EmailCampaign, 'id'>): Promise<void> => { };
export const updateEmailCampaign = async (id: string, updates: Partial<EmailCampaign>): Promise<void> => { };
export const deleteEmailCampaign = async (id: string): Promise<void> => { };

export const getEmailSubscribers = async (): Promise<EmailSubscriber[]> => { return []; };
export const deleteEmailSubscriber = async (id: number): Promise<void> => { };

export const getAuditLogs = async (): Promise<AuditLog[]> => fetchFromApi<AuditLog[]>('/audit-logs');

export const checkBackendHealth = (): Promise<any> => fetchFromApi('/health');

export const getWarrantyTickets = async (): Promise<WarrantyTicket[]> => {
    return fetchFromApi<WarrantyTicket[]>('/warranty-tickets');
};

export const addWarrantyTicket = async (ticket: Omit<WarrantyTicket, 'id' | 'ticketNumber' | 'createdAt'>): Promise<WarrantyTicket> => {
    return fetchFromApi<WarrantyTicket>('/warranty-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
    });
};

export const updateWarrantyTicket = async (id: string, updates: Partial<WarrantyTicket>): Promise<WarrantyTicket> => {
    return fetchFromApi<WarrantyTicket>(`/warranty-tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
};

export const deleteWarrantyTicket = async (id: string): Promise<void> => {
    return fetchFromApi<void>(`/warranty-tickets/${id}`, { method: 'DELETE' });
};

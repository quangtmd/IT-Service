import { 
    User, Product, Article, Order, AdminNotification, ChatLogSession, SiteSettings,
    FinancialTransaction, PayrollRecord, ServiceTicket, Inventory, Quotation, ReturnTicket, 
    Supplier, OrderStatus, WarrantyClaim, Debt
} from '../types';
import { BACKEND_API_BASE_URL } from '../constants';

const API_BASE_URL = BACKEND_API_BASE_URL;

async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

    const fullEndpoint = `/api${endpoint}`;
    const url = `${API_BASE_URL}${fullEndpoint}`;
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal, // Add the abort signal to the fetch options
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        
        clearTimeout(timeoutId); // Clear the timeout if the fetch completes successfully

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            
            if (response.status === 404) {
                // This specific message format will be caught by the BackendConnectionError component
                // to show the detailed 404 guide to the user.
                throw new Error('Lỗi Giao Tiếp Frontend-Backend (404)');
            }
            
            const errorMessage = `Lỗi API: ${response.status} (${errorData.message || response.statusText}). Endpoint: ${fullEndpoint}.`;
            throw new Error(errorMessage);
        }
        
        const text = await response.text();
        return text ? JSON.parse(text) : null;

    } catch (error: any) {
        clearTimeout(timeoutId); // Ensure timeout is cleared on error

        if (error.name === 'AbortError') {
            throw new Error('Yêu cầu tới máy chủ đã hết thời gian chờ. Dịch vụ backend có thể đang không hoạt động hoặc quá tải.');
        }

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
export const getCustomerOrders = (customerId: string): Promise<Order[]> => fetchFromApi<Order[]>(`/orders/customer/${customerId}`);
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
export const addDebt = (debt: Omit<Debt, 'id'>): Promise<Debt> => fetchFromApi<Debt>('/debts', { method: 'POST', body: JSON.stringify(debt) });
export const updateDebt = (id: string, updates: Partial<Debt>): Promise<Debt> => fetchFromApi<Debt>(`/debts/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteDebt = (id: string): Promise<void> => fetchFromApi<void>(`/debts/${id}`, { method: 'DELETE' });


// --- Service Tickets ---
export const getServiceTickets = (): Promise<ServiceTicket[]> => fetchFromApi<ServiceTicket[]>('/service-tickets');
export const addServiceTicket = (ticket: Omit<ServiceTicket, 'id'| 'createdAt' | 'ticket_code' | 'updatedAt'>): Promise<ServiceTicket> => fetchFromApi<ServiceTicket>('/service-tickets', { method: 'POST', body: JSON.stringify(ticket) });
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

// --- Warranty Claims ---
export const getWarrantyClaims = (): Promise<WarrantyClaim[]> => fetchFromApi<WarrantyClaim[]>('/warranty-claims');
export const addWarrantyClaim = (claim: Omit<WarrantyClaim, 'id'|'created_at'|'updated_at'|'claim_code'>): Promise<WarrantyClaim> => fetchFromApi<WarrantyClaim>('/warranty-claims', { method: 'POST', body: JSON.stringify(claim) });
export const updateWarrantyClaim = (id: string, updates: Partial<WarrantyClaim>): Promise<WarrantyClaim> => fetchFromApi<WarrantyClaim>(`/warranty-claims/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteWarrantyClaim = (id: string): Promise<void> => fetchFromApi<void>(`/warranty-claims/${id}`, { method: 'DELETE' });
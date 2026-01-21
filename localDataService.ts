import { 
    User, Product, Article, Order, AdminNotification, ChatLogSession, SiteSettings,
    FinancialTransaction, PayrollRecord, ServiceTicket, Inventory, Quotation, ReturnTicket, Supplier, OrderStatus
} from '../types';

// The base URL for the backend. In development, this is an empty string,
// and requests are proxied by Vite. In production, this will be the
// full URL of the deployed backend service (e.g., https://my-backend.onrender.com).
const API_BASE_URL = process.env.VITE_BACKEND_API_BASE_URL || "";

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
            // Provide a more specific error for 404s, which are common with misconfigurations.
            const errorMessage = response.status === 404
                ? `Không tìm thấy API endpoint. Vui lòng kiểm tra lại cấu hình. (Lỗi API: ${response.status})`
                : errorData.message || `Lỗi API: ${response.status}`;
            throw new Error(errorMessage);
        }
        
        // Handle cases where the response might be empty (e.g., DELETE requests)
        const text = await response.text();
        return text ? JSON.parse(text) : null;

    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            // This is a network error
            throw new Error('Lỗi mạng hoặc server không phản hồi. Vui lòng kiểm tra kết nối và cấu hình backend.');
        }
        // Re-throw other errors (like the custom one from response.ok check)
        throw error;
    }
}

// --- User Service ---
// Note: The endpoint now starts with /users, and /api is prepended by fetchFromApi
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
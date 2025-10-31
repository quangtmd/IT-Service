import { Product, Order, Article, MediaItem, OrderStatus, FaqItem, DiscountCode, SiteSettings, ProductCategory, ServiceTicket, Warehouse, Inventory, Supplier, Bill, User } from '../types';
import * as Constants from '../constants';

// --- API HELPER ---
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    try {
        const response = await fetch(`${Constants.BACKEND_API_BASE_URL}${endpoint}`, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định' }));
            console.error(`API Error on ${endpoint}:`, errorData);
            throw new Error(errorData.error || `Lỗi HTTP: ${response.status}`);
        }
        if (response.status === 204) { // No Content
            return null;
        }
        return response.json();
    } catch (error) {
        console.error(`Network or fetch error for ${endpoint}:`, error);
        throw error;
    }
};

// --- USER & AUTH ---
export const loginUser = async (credentials: { email: string; password?: string }): Promise<User> => {
    return apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

export const getUsers = async (): Promise<User[]> => {
    return apiFetch('/api/users');
}
// Placeholder functions for user management to be implemented with API
export const addUser = async (user: Omit<User, 'id'>) => { console.log("addUser not implemented"); return user; };
export const updateUser = async (id: string, user: Partial<User>) => { console.log("updateUser not implemented"); return true; };
export const deleteUser = async (id: string) => { console.log("deleteUser not implemented"); return true; };


// --- PRODUCT & CATEGORY ---
export const getProductCategories = async (): Promise<ProductCategory[]> => {
    return apiFetch('/api/product_categories');
};

export const getProducts = async (): Promise<Product[]> => {
    return apiFetch('/api/products');
};

export const getFilteredProducts = async (
    filters: { [key: string]: string | number | boolean | null },
    page: number,
    limit: number
): Promise<{ products: Product[], totalProducts: number }> => {
    // This is a simplified client-side implementation. A real backend would handle this.
    const allProducts = await getProducts();

    const filtered = allProducts.filter(p => {
        let match = true;
        if (filters.q && typeof filters.q === 'string') {
            match = match && p.name.toLowerCase().includes(filters.q.toLowerCase());
        }
        if (filters.categoryId) {
            match = match && String(p.category_id) === String(filters.categoryId);
        }
        if (filters.brand) {
            match = match && p.brand === filters.brand;
        }
        // Add more filters here as needed
        return match;
    });

    const totalProducts = filtered.length;
    const startIndex = (page - 1) * limit;
    const products = filtered.slice(startIndex, startIndex + limit);

    return { products, totalProducts };
};

export const getProduct = async (id: string): Promise<Product | null> => {
    return apiFetch(`/api/products/${id}`);
};

export const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'categoryName'>): Promise<Product> => {
    return apiFetch('/api/products', { method: 'POST', body: JSON.stringify(product) });
};

export const updateProduct = async (id: number | string, productUpdate: Partial<Product>): Promise<Product> => {
    return apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(productUpdate) });
};

export const deleteProduct = async (id: number | string): Promise<void> => {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    return apiFetch('/api/products/featured');
};

// --- ORDER ---
export const getOrders = async (): Promise<Order[]> => {
    const orders = await apiFetch('/api/orders');
    // Map backend snake_case to frontend camelCase for compatibility
    return orders.map((o: any) => ({
        ...o,
        totalAmount: o.total_amount,
        customerInfo: o.customer_info,
        paymentDetails: o.payment_details,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
    }));
};

export const addOrder = async (orderData: any): Promise<Order> => {
    return apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(orderData) });
};

export const updateOrderStatus = async (id: number | string, status: OrderStatus): Promise<void> => {
    await apiFetch(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
};

// --- ARTICLE ---
export const getArticles = async (): Promise<Article[]> => {
    return apiFetch('/api/articles');
};

export const getArticle = async (id: string): Promise<Article | null> => {
    const articles = await getArticles(); // Still simple logic for now
    return articles.find(a => String(a.id) === String(id)) || null;
};

export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
    return apiFetch('/api/articles', { method: 'POST', body: JSON.stringify(article) });
};

export const updateArticle = async (id: number | string, articleUpdate: Partial<Article>): Promise<void> => {
    await apiFetch(`/api/articles/${id}`, { method: 'PUT', body: JSON.stringify(articleUpdate) });
};

export const deleteArticle = async (id: number | string): Promise<void> => {
    await apiFetch(`/api/articles/${id}`, { method: 'DELETE' });
};

// --- SITE SETTINGS & OTHER LOCALSTORAGE MIGRATIONS ---
// This single function replaces multiple localStorage getters.
export const getSiteSettings = async (): Promise<SiteSettings> => {
    try {
        const settingsFromApi = await apiFetch('/api/settings');
        // Merge with initial settings to ensure all keys are present, even if not in DB
        return { ...Constants.INITIAL_SITE_SETTINGS, ...settingsFromApi };
    } catch (error) {
        console.error("Failed to fetch site settings from API, using defaults.", error);
        return Constants.INITIAL_SITE_SETTINGS;
    }
};

// This single function replaces multiple localStorage setters.
export const saveSiteSettings = async (settings: Partial<SiteSettings>): Promise<void> => {
    await apiFetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
    });
    // Dispatch event to notify components of the update
    window.dispatchEvent(new CustomEvent('siteSettingsUpdated'));
};

// --- DYNAMIC DATA MIGRATIONS (FAQs, Discounts, etc.) ---
// These now read from the SiteSettings object from the DB

export const getFaqs = async (): Promise<FaqItem[]> => {
    const settings = await getSiteSettings();
    return settings.faqs || Constants.INITIAL_FAQS;
};

export const saveFaqs = async (faqs: FaqItem[]): Promise<void> => {
    await saveSiteSettings({ faqs });
    window.dispatchEvent(new CustomEvent('faqsUpdated'));
};

export const getDiscounts = async (): Promise<DiscountCode[]> => {
    const settings = await getSiteSettings();
    return settings.discountCodes || Constants.INITIAL_DISCOUNT_CODES;
};

export const saveDiscounts = async (discounts: DiscountCode[]): Promise<void> => {
    await saveSiteSettings({ discountCodes: discounts });
};

// --- MEDIA LIBRARY (now part of Site Settings) ---
export const getMediaItems = async (): Promise<MediaItem[]> => {
  const settings = await getSiteSettings();
  return settings.siteMediaLibrary || [];
};

export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    const settings = await getSiteSettings();
    const newItem = { ...item, id: `media-${Date.now()}` };
    const newLibrary = [newItem, ...(settings.siteMediaLibrary || [])];
    await saveSiteSettings({ siteMediaLibrary: newLibrary });
    return newItem;
};

export const deleteMediaItem = async (id: string): Promise<void> => {
    const settings = await getSiteSettings();
    const newLibrary = (settings.siteMediaLibrary || []).filter((item: MediaItem) => item.id !== id);
    await saveSiteSettings({ siteMediaLibrary: newLibrary });
};

// --- OTHER ADMIN MODULES ---
export const getServiceTickets = async (): Promise<ServiceTicket[]> => apiFetch('/api/service_tickets');
export const getInventory = async (): Promise<Inventory[]> => apiFetch('/api/inventory');
export const getSuppliers = async (): Promise<Supplier[]> => apiFetch('/api/suppliers');
export const getBills = async (): Promise<Bill[]> => apiFetch('/api/bills');
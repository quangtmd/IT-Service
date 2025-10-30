import { Product, Order, Article, MediaItem, OrderStatus, FaqItem, DiscountCode, SiteSettings, ProductCategory, ServiceTicket, Warehouse, Inventory, Supplier, Bill, User } from '../types';
import * as Constants from '../constants';

// --- API Helper ---
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const response = await fetch(`${Constants.BACKEND_API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định' }));
        throw new Error(errorData.error || `Lỗi HTTP: ${response.status}`);
    }
    if (response.status === 204) { // No Content
        return null;
    }
    return response.json();
};

// --- Category Service ---
export const getProductCategories = async (): Promise<ProductCategory[]> => {
    return apiFetch('/api/product_categories');
};

// --- Product Service ---
export const getProducts = async (): Promise<Product[]> => {
    const data = await apiFetch('/api/products?limit=1000'); // Lấy tất cả sản phẩm
    return data.products;
};

export const getFilteredProducts = async (
    filters: { [key: string]: string | number | boolean | null },
    page: number,
    limit: number
): Promise<{ products: Product[], totalProducts: number }> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    for (const key in filters) {
        if (filters[key] !== null && filters[key] !== undefined) {
            params.append(key, String(filters[key]));
        }
    }
    return apiFetch(`/api/products?${params.toString()}`);
};

export const getProduct = async (id: string): Promise<Product | null> => {
    return apiFetch(`/api/products/${id}`);
};

export const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'categoryName'>): Promise<Product> => {
    return apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(product),
    });
};

export const updateProduct = async (id: number | string, productUpdate: Partial<Product>): Promise<Product> => {
    return apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productUpdate),
    });
};

export const deleteProduct = async (id: number | string): Promise<void> => {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    return apiFetch('/api/products/featured');
};

// --- Order Service ---
export const getOrders = async (): Promise<Order[]> => {
    return apiFetch('/api/orders');
};

export const addOrder = async (orderData: any): Promise<Order> => {
    return apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
};

export const updateOrderStatus = async (id: number | string, status: OrderStatus): Promise<void> => {
    await apiFetch(`/api/orders/${String(id)}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

// --- Article Service (Now from API) ---
export const getArticles = async (): Promise<Article[]> => {
    return apiFetch('/api/articles');
};

export const getArticle = async (id: string): Promise<Article | null> => {
    const articles = await getArticles();
    return articles.find(a => String(a.id) === String(id)) || null;
};

export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
    // This should be an API call in a real app
    console.warn("addArticle is using localStorage as a fallback.");
    const articles = await getArticles();
    const newArticle = { ...article, id: Date.now() };
    localStorage.setItem('adminArticles_v1_local', JSON.stringify([newArticle, ...articles]));
    window.dispatchEvent(new Event('articlesUpdated'));
    return newArticle as Article;
};

export const updateArticle = async (id: number | string, articleUpdate: Partial<Article>): Promise<void> => {
    console.warn("updateArticle is using localStorage as a fallback.");
    const articles = await getArticles();
    const updatedArticles = articles.map(a => String(a.id) === String(id) ? { ...a, ...articleUpdate } : a);
    localStorage.setItem('adminArticles_v1_local', JSON.stringify(updatedArticles));
    window.dispatchEvent(new Event('articlesUpdated'));
};

export const deleteArticle = async (id: number | string): Promise<void> => {
    console.warn("deleteArticle is using localStorage as a fallback.");
    const articles = await getArticles();
    const updatedArticles = articles.filter(a => String(a.id) !== String(id));
    localStorage.setItem('adminArticles_v1_local', JSON.stringify(updatedArticles));
    window.dispatchEvent(new Event('articlesUpdated'));
};

// --- User Service ---
export const loginUser = async (credentials: { email: string; password?: string }): Promise<User> => {
    return apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

export const getUsers = async (): Promise<User[]> => {
    return apiFetch('/api/users');
}

// --- Site Settings Service ---
export const getSiteSettings = async (): Promise<SiteSettings> => {
    const settings = await apiFetch('/api/site_settings');
    // The API returns an object of key-values. We need to merge it with defaults.
    return { ...Constants.INITIAL_SITE_SETTINGS, ...settings };
};

export const saveSiteSettings = async (settings: Partial<SiteSettings>): Promise<void> => {
    await apiFetch('/api/site_settings', {
        method: 'POST',
        body: JSON.stringify(settings)
    });
    window.dispatchEvent(new CustomEvent('siteSettingsUpdated'));
};


// --- Media Library (still local for simplicity, can be migrated to cloud storage) ---
export const getMediaItems = async (): Promise<MediaItem[]> => {
  const settings = await getSiteSettings();
  return (settings as any).siteMediaLibrary || [];
};

export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    const settings = await getSiteSettings();
    const newItem = { ...item, id: `media-${Date.now()}` };
    const newSettings = { ...settings, siteMediaLibrary: [newItem, ...((settings as any).siteMediaLibrary || [])] };
    await saveSiteSettings(newSettings);
    return newItem;
};

export const deleteMediaItem = async (id: string): Promise<void> => {
    const settings = await getSiteSettings();
    const newSettings = { ...settings, siteMediaLibrary: ((settings as any).siteMediaLibrary || []).filter((item: MediaItem) => item.id !== id) };
    await saveSiteSettings(newSettings);
};

// --- NEW SERVICES for Admin Modules ---

// Service Tickets
export const getServiceTickets = async (): Promise<ServiceTicket[]> => {
    return apiFetch('/api/service_tickets');
}

// Inventory
export const getInventory = async (): Promise<Inventory[]> => {
    return apiFetch('/api/inventory');
}

// Suppliers
export const getSuppliers = async (): Promise<Supplier[]> => {
    return apiFetch('/api/suppliers');
}

// Bills
export const getBills = async (): Promise<Bill[]> => {
    return apiFetch('/api/bills');
}
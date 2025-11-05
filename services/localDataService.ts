import { 
    Product, Order, Article, OrderStatus, MediaItem, ChatLogSession,
    FinancialTransaction, PayrollRecord, ServiceTicket, Inventory, ServerInfo 
} from '../types';
import * as Constants from '../constants';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_ARTICLES } from '../data/mockData';

// --- Helper Functions ---
const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
        // If no item, set the default value in localStorage
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
    } catch (error) {
        console.error(`Error reading or initializing localStorage key "${key}":`, error);
        return defaultValue;
    }
};

const setLocalStorageItem = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        // Dispatch event for other components to update
        window.dispatchEvent(new CustomEvent(`${key}Updated`));
    } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
    }
};

// Initialize data if not present
const initializeData = () => {
    getLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, MOCK_PRODUCTS);
    getLocalStorageItem(Constants.ORDERS_STORAGE_KEY, MOCK_ORDERS);
    // Assuming articles are managed in admin panel, let's use a different key.
    getLocalStorageItem('adminArticles_v1', MOCK_ARTICLES);
    getLocalStorageItem('siteMediaLibrary_v1', []); // For media items
    getLocalStorageItem('serviceTickets_v1', []); // For service tickets
    getLocalStorageItem('inventory_v1', []); // For inventory
};

initializeData();

// --- Product Service ---
export const getProducts = async (queryParamsString: string = ''): Promise<{ products: Product[], totalProducts: number }> => {
    return new Promise((resolve) => {
        let allProducts = getLocalStorageItem<Product[]>(Constants.PRODUCTS_STORAGE_KEY, []);
        const params = new URLSearchParams(queryParamsString);
        
        const mainCategory = params.get('mainCategory');
        const subCategory = params.get('subCategory');
        const brand = params.get('brand');
        const status = params.get('status');
        const tags = params.get('tags');
        const q = params.get('q')?.toLowerCase() || '';
        const page = parseInt(params.get('page') || '1', 10);
        const limit = parseInt(params.get('limit') || '12', 10);

        let filtered = allProducts.filter(p => p.isVisible !== false);

        if (mainCategory) filtered = filtered.filter(p => Constants.PRODUCT_CATEGORIES_HIERARCHY.find(mc => mc.slug === mainCategory)?.name === p.mainCategory);
        if (subCategory) filtered = filtered.filter(p => Constants.PRODUCT_CATEGORIES_HIERARCHY.flatMap(mc => mc.subCategories).find(sc => sc.slug === subCategory)?.name === p.subCategory);
        if (brand) filtered = filtered.filter(p => p.brand === brand);
        if (status) filtered = filtered.filter(p => p.status === status);
        if (tags) filtered = filtered.filter(p => p.tags && p.tags.includes(tags));
        if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)));

        const totalProducts = filtered.length;
        const paginatedProducts = filtered.slice((page - 1) * limit, page * limit);
        
        resolve({ products: paginatedProducts, totalProducts });
    });
};

export const getProduct = async (id: string): Promise<Product | null> => {
    return new Promise((resolve) => {
        const allProducts = getLocalStorageItem<Product[]>(Constants.PRODUCTS_STORAGE_KEY, []);
        const product = allProducts.find(p => p.id === id) || null;
        resolve(product);
    });
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    return new Promise((resolve) => {
        const allProducts = getLocalStorageItem<Product[]>(Constants.PRODUCTS_STORAGE_KEY, []);
        const newProduct: Product = { ...product, id: `prod-${Date.now()}` };
        const updatedProducts = [newProduct, ...allProducts];
        setLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, updatedProducts);
        resolve(newProduct);
    });
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    return new Promise((resolve, reject) => {
        const allProducts = getLocalStorageItem<Product[]>(Constants.PRODUCTS_STORAGE_KEY, []);
        let productToUpdate: Product | undefined;
        const updatedProducts = allProducts.map(p => {
            if (p.id === id) {
                productToUpdate = { ...p, ...updates };
                return productToUpdate;
            }
            return p;
        });
        if (productToUpdate) {
            setLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, updatedProducts);
            resolve(productToUpdate);
        } else {
            reject(new Error("Product not found"));
        }
    });
};

export const deleteProduct = async (id: string): Promise<void> => {
    return new Promise((resolve) => {
        const allProducts = getLocalStorageItem<Product[]>(Constants.PRODUCTS_STORAGE_KEY, []);
        const updatedProducts = allProducts.filter(p => p.id !== id);
        setLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, updatedProducts);
        resolve();
    });
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    return new Promise((resolve) => {
        const allProducts = getLocalStorageItem<Product[]>(Constants.PRODUCTS_STORAGE_KEY, []);
        let featured = allProducts.filter(p => p.tags && p.tags.includes('Bán chạy')).slice(0, 4);
        if (featured.length < 4) {
            const saleProducts = allProducts.filter(p => p.originalPrice && p.originalPrice > p.price);
            featured = [...featured, ...saleProducts].slice(0, 4);
        }
        if (featured.length < 4) {
             featured = [...featured, ...allProducts].slice(0, 4);
        }
        // remove duplicates
        featured = Array.from(new Map(featured.map(item => [item.id, item])).values());
        resolve(featured.slice(0, 4));
    });
};


// --- Order Service ---
export const getOrders = async (): Promise<Order[]> => {
    return new Promise((resolve) => {
        const orders = getLocalStorageItem<Order[]>(Constants.ORDERS_STORAGE_KEY, []);
        resolve(orders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
    });
};

export const addOrder = async (order: Order): Promise<Order> => {
    return new Promise((resolve) => {
        const orders = getLocalStorageItem<Order[]>(Constants.ORDERS_STORAGE_KEY, []);
        const updatedOrders = [order, ...orders];
        setLocalStorageItem(Constants.ORDERS_STORAGE_KEY, updatedOrders);
        resolve(order);
    });
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
     return new Promise((resolve) => {
        const orders = getLocalStorageItem<Order[]>(Constants.ORDERS_STORAGE_KEY, []);
        const updatedOrders = orders.map(o => o.id === id ? { ...o, status } : o);
        setLocalStorageItem(Constants.ORDERS_STORAGE_KEY, updatedOrders);
        resolve();
    });
};


// --- Article Service ---
const ARTICLES_KEY = 'adminArticles_v1';
export const getArticles = async (): Promise<Article[]> => {
    return new Promise((resolve) => {
        const articles = getLocalStorageItem<Article[]>(ARTICLES_KEY, MOCK_ARTICLES);
        resolve(articles.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
};

export const getArticle = async (id: string): Promise<Article | null> => {
    return new Promise((resolve) => {
        // AI articles are stored separately
        const aiArticlesRaw = localStorage.getItem('aiGeneratedArticles_v1');
        const aiArticles: Article[] = aiArticlesRaw ? JSON.parse(aiArticlesRaw) : [];

        const allArticles = [...getLocalStorageItem<Article[]>(ARTICLES_KEY, MOCK_ARTICLES), ...aiArticles];
        const article = allArticles.find(a => a.id === id) || null;
        resolve(article);
    });
};

export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
    return new Promise((resolve) => {
        const articles = getLocalStorageItem<Article[]>(ARTICLES_KEY, []);
        const newArticle = { ...article, id: `article-${Date.now()}`, date: new Date().toISOString() };
        const updated = [newArticle, ...articles];
        setLocalStorageItem(ARTICLES_KEY, updated);
        window.dispatchEvent(new CustomEvent('articlesUpdated'));
        resolve(newArticle);
    });
};

export const updateArticle = async (id: string, updates: Partial<Article>): Promise<void> => {
    return new Promise((resolve) => {
        const articles = getLocalStorageItem<Article[]>(ARTICLES_KEY, []);
        const updated = articles.map(a => a.id === id ? { ...a, ...updates } : a);
        setLocalStorageItem(ARTICLES_KEY, updated);
        window.dispatchEvent(new CustomEvent('articlesUpdated'));
        resolve();
    });
};

export const deleteArticle = async (id: string): Promise<void> => {
     return new Promise((resolve) => {
        const articles = getLocalStorageItem<Article[]>(ARTICLES_KEY, []);
        const updated = articles.filter(a => a.id !== id);
        setLocalStorageItem(ARTICLES_KEY, updated);
        window.dispatchEvent(new CustomEvent('articlesUpdated'));
        resolve();
    });
};


// --- Media Library Service ---
const MEDIA_KEY = 'siteMediaLibrary_v1';
export const getMediaItems = async (): Promise<MediaItem[]> => {
    return new Promise(resolve => resolve(getLocalStorageItem<MediaItem[]>(MEDIA_KEY, [])));
};
export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    return new Promise(resolve => {
        const items = getLocalStorageItem<MediaItem[]>(MEDIA_KEY, []);
        const newItem = { ...item, id: `media-${Date.now()}`};
        setLocalStorageItem(MEDIA_KEY, [newItem, ...items]);
        resolve(newItem);
    });
};
export const deleteMediaItem = async (id: string): Promise<void> => {
    return new Promise(resolve => {
        const items = getLocalStorageItem<MediaItem[]>(MEDIA_KEY, []);
        setLocalStorageItem(MEDIA_KEY, items.filter(i => i.id !== id));
        resolve();
    });
};


// --- Misc Services (Mocked) ---
export const getServerInfo = async (): Promise<ServerInfo> => {
     return new Promise(resolve => {
        // This is a mock. In a real backend, you'd fetch this.
        setTimeout(() => resolve({ outboundIp: '123.45.67.89' }), 500);
    });
};
export const getServiceTickets = async (): Promise<ServiceTicket[]> => {
    return new Promise(resolve => resolve(getLocalStorageItem('serviceTickets_v1', [])));
};
export const getInventory = async (): Promise<Inventory[]> => {
    return new Promise(resolve => resolve(getLocalStorageItem('inventory_v1', [])));
};

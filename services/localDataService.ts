import { Product, Order, Article, MediaItem, OrderStatus } from '../types';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_ARTICLES } from '../data/mockData';

const PRODUCTS_KEY = 'siteProducts_v1_local';
const ORDERS_KEY = 'siteOrders_v1_local';
const ARTICLES_KEY = 'adminArticles_v1_local';
const MEDIA_KEY = 'siteMediaLibrary_v1_local';

// --- Generic Helper ---
const getOrInitLocalStorage = <T extends any[]>(key: string, initialData: T): T => {
    const seededKey = `${key}_seeded_v2`; // Use a versioned, separate key to track initialization
    try {
        const isSeeded = localStorage.getItem(seededKey);
        
        // If the data has never been seeded before (or cache was cleared)
        if (!isSeeded) {
            // Seed the storage with the initial mock data
            localStorage.setItem(key, JSON.stringify(initialData));
            // Set the flag to indicate seeding has been done
            localStorage.setItem(seededKey, 'true');
            return initialData;
        }
        
        // If it has been seeded, get whatever is currently in storage.
        // This respects any changes made by the admin (like deleting all products).
        const item = localStorage.getItem(key);
        // Fallback to an empty array if the item is somehow null after being seeded.
        return item ? JSON.parse(item) : [];

    } catch (error) {
        console.error(`Error with localStorage key "${key}":`, error);
        // On any error, fallback to initial data as a safe measure.
        return initialData;
    }
};

const setLocalStorage = <T,>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// --- Product Service ---
export const getProducts = async (): Promise<Product[]> => {
    return getOrInitLocalStorage(PRODUCTS_KEY, MOCK_PRODUCTS);
};

export const getProduct = async (id: string): Promise<Product | null> => {
    const products = await getProducts();
    return products.find(p => p.id === id) || null;
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const products = await getProducts();
    const newProduct = { ...product, id: `prod-${Date.now()}` };
    setLocalStorage(PRODUCTS_KEY, [newProduct, ...products]);
    return newProduct;
};

export const updateProduct = async (id: string, productUpdate: Partial<Product>): Promise<void> => {
    let products = await getProducts();
    products = products.map(p => p.id === id ? { ...p, ...productUpdate, id } : p);
    setLocalStorage(PRODUCTS_KEY, products);
};

export const deleteProduct = async (id: string): Promise<void> => {
    const products = await getProducts();
    setLocalStorage(PRODUCTS_KEY, products.filter(p => p.id !== id));
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    const allProducts = await getProducts();
    // 1. Chỉ làm việc với các sản phẩm được phép hiển thị.
    const visibleProducts = allProducts.filter(p => p.isVisible !== false);

    // 2. Lấy sản phẩm bán chạy một cách an toàn.
    // Đảm bảo thuộc tính 'tags' tồn tại và là một mảng trước khi dùng 'includes'.
    const bestselling = visibleProducts.filter(p => Array.isArray(p.tags) && p.tags.includes('Bán chạy'));
    
    // 3. Tìm các sản phẩm đang giảm giá.
    const onSale = visibleProducts.filter(p => p.originalPrice && p.originalPrice > p.price);
    
    // 4. Kết hợp và lấy các sản phẩm duy nhất, ưu tiên các mặt hàng bán chạy nhất.
    const combined = [...bestselling, ...onSale];
    const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
    
    // 5. Nếu có bất kỳ sản phẩm nổi bật nào, trả về tối đa 4 sản phẩm.
    if (unique.length > 0) {
        return unique.slice(0, 4);
    }
    
    // 6. Nếu không tìm thấy sản phẩm nổi bật cụ thể, trả về 4 sản phẩm hiển thị đầu tiên làm phương án dự phòng.
    return visibleProducts.slice(0, 4);
};


// --- Order Service ---
export const getOrders = async (): Promise<Order[]> => {
    const orders = getOrInitLocalStorage(ORDERS_KEY, MOCK_ORDERS);
    return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

export const addOrder = async (order: Order): Promise<Order> => {
    const orders = await getOrders();
    setLocalStorage(ORDERS_KEY, [order, ...orders]);
    return order;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    let orders = await getOrders();
    orders = orders.map(o => o.id === id ? { ...o, status } : o);
    setLocalStorage(ORDERS_KEY, orders);
};

// --- Article Service ---
export const getArticles = async (): Promise<Article[]> => {
    const articles = getOrInitLocalStorage(ARTICLES_KEY, MOCK_ARTICLES);
    return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getArticle = async (id: string): Promise<Article | null> => {
    const articles = await getArticles();
    // Also check AI articles from a different storage
    const aiArticlesRaw = localStorage.getItem('aiGeneratedArticles_v1');
    const aiArticles = aiArticlesRaw ? JSON.parse(aiArticlesRaw) : [];
    return [...articles, ...aiArticles].find(a => a.id === id) || null;
};

export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
    const articles = await getArticles();
    const newArticle = { ...article, id: `art-${Date.now()}`, date: new Date().toISOString() };
    setLocalStorage(ARTICLES_KEY, [newArticle, ...articles]);
    return newArticle;
};

export const updateArticle = async (id: string, articleUpdate: Partial<Article>): Promise<void> => {
    let articles = await getArticles();
    articles = articles.map(a => a.id === id ? { ...a, ...articleUpdate, id } : a);
    setLocalStorage(ARTICLES_KEY, articles);
};

export const deleteArticle = async (id: string): Promise<void> => {
    const articles = await getArticles();
    setLocalStorage(ARTICLES_KEY, articles.filter(a => a.id !== id));
};

// --- Media Library Service ---
export const getMediaItems = async (): Promise<MediaItem[]> => {
    const items = getOrInitLocalStorage(MEDIA_KEY, []);
    return items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
};

export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    const items = await getMediaItems();
    const newItem = { ...item, id: `media-${Date.now()}` };
    setLocalStorage(MEDIA_KEY, [newItem, ...items]);
    return newItem;
};

export const deleteMediaItem = async (id: string): Promise<void> => {
    const items = await getMediaItems();
    setLocalStorage(MEDIA_KEY, items.filter(i => i.id !== id));
};
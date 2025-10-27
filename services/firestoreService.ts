import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import { Product, Order, Article, OrderStatus, MediaItem } from '../types';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_ARTICLES } from '../data/mockData';

const productsCollection = collection(db, "products");
const ordersCollection = collection(db, "orders");
const articlesCollection = collection(db, "articles");
const mediaLibraryCollection = collection(db, "mediaLibrary");

// --- Seeding ---
export const seedDatabase = async () => {
    const productsSnapshot = await getDocs(query(productsCollection, limit(1)));
    if (productsSnapshot.empty) {
        console.log("Seeding products...");
        const batch = writeBatch(db);
        MOCK_PRODUCTS.forEach(product => {
            const docRef = doc(productsCollection, product.id);
            batch.set(docRef, product);
        });
        await batch.commit();
        console.log("Products seeded.");
    }

    const ordersSnapshot = await getDocs(query(ordersCollection, limit(1)));
    if (ordersSnapshot.empty) {
        console.log("Seeding orders...");
        const batch = writeBatch(db);
        MOCK_ORDERS.forEach(order => {
            const docRef = doc(ordersCollection, order.id);
            batch.set(docRef, order);
        });
        await batch.commit();
        console.log("Orders seeded.");
    }
    
    const articlesSnapshot = await getDocs(query(articlesCollection, limit(1)));
    if (articlesSnapshot.empty) {
        console.log("Seeding articles...");
        const batch = writeBatch(db);
        MOCK_ARTICLES.forEach(article => {
            const docRef = doc(articlesCollection, article.id);
            batch.set(docRef, article);
        });
        await batch.commit();
        console.log("Articles seeded.");
    }
};


// --- Product Service ---
export const getProducts = async (): Promise<Product[]> => {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProduct = async (id: string): Promise<Product | null> => {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Product) : null;
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const docRef = await addDoc(productsCollection, product);
    return { id: docRef.id, ...product };
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, product);
};

export const deleteProduct = async (id: string): Promise<void> => {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    // Query for 'Bán chạy' tag
    const bestsellingQuery = query(productsCollection, where('tags', 'array-contains', 'Bán chạy'), limit(4));
    const bestsellingSnapshot = await getDocs(bestsellingQuery);
    let products = bestsellingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    
    if (products.length < 4) {
        const onSaleQuery = query(productsCollection, where('originalPrice', '>', 0), limit(4));
        const onSaleSnapshot = await getDocs(onSaleQuery);
        const onSaleProducts = onSaleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        const combined = [...products, ...onSaleProducts];
        const uniqueProducts = Array.from(new Map(combined.map(p => [p.id, p])).values());
        products = uniqueProducts.slice(0, 4);
    }
    
    if(products.length === 0) { // Fallback if no featured products found
      const anyProductsQuery = query(productsCollection, limit(4));
      const anyProductsSnapshot = await getDocs(anyProductsQuery);
      products = anyProductsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Product));
    }

    return products;
};

// --- Order Service ---
export const getOrders = async (): Promise<Order[]> => {
    const q = query(ordersCollection, orderBy('orderDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const addOrder = async (order: Order): Promise<Order> => {
    const docRef = doc(ordersCollection, order.id);
    await setDoc(docRef, order);
    return order;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    const docRef = doc(db, "orders", id);
    await updateDoc(docRef, { status });
};

// --- Article Service ---
export const getArticles = async (): Promise<Article[]> => {
    const q = query(articlesCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
};

export const getArticle = async (id: string): Promise<Article | null> => {
    const docRef = doc(db, "articles", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Article) : null;
};

export const addArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
    const newArticle = { ...article, date: new Date().toISOString() };
    const docRef = await addDoc(articlesCollection, newArticle);
    return { id: docRef.id, ...newArticle };
};

export const updateArticle = async (id: string, article: Partial<Article>): Promise<void> => {
    const docRef = doc(db, "articles", id);
    await updateDoc(docRef, article);
};

export const deleteArticle = async (id: string): Promise<void> => {
    const docRef = doc(db, "articles", id);
    await deleteDoc(docRef);
};

// --- Media Library Service ---
export const getMediaItems = async (): Promise<MediaItem[]> => {
    const q = query(mediaLibraryCollection, orderBy('uploadedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem));
};

export const addMediaItem = async (item: Omit<MediaItem, 'id'>): Promise<MediaItem> => {
    const docRef = await addDoc(mediaLibraryCollection, item);
    return { id: docRef.id, ...item };
};

export const deleteMediaItem = async (id: string): Promise<void> => {
    const docRef = doc(db, "mediaLibrary", id);
    await deleteDoc(docRef);
};
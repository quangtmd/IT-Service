
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card'; 
import { 
    Product, Article, User, StaffRole, Order, OrderStatus, AdminNotification, UserRole, 
    FaqItem, DiscountCode, SiteThemeSettings, CustomMenuLink, SiteSettings, TeamMember, StoreImage,
    HomepageBannerSettings, HomepageAboutSettings, HomepageAboutFeature, 
    HomepageServiceBenefit, HomepageServicesBenefitsSettings,
    HomepageWhyChooseUsFeature, HomepageWhyChooseUsSettings,
    HomepageStatItem, HomepageStatsCounterSettings,
    HomepageFeaturedProjectsSettings, 
    HomepageTestimonialItem, HomepageTestimonialsSettings,
    HomepageBrandLogo, HomepageBrandLogosSettings,
    HomepageProcessStep, HomepageProcessSettings,
    HomepageCallToActionSettings, HomepageBlogPreviewSettings, HomepageContactSectionSettings,
    ShippingInfo, SMTPSettings, PaymentGatewaySettings, MediaItem, ChatLogSession, ChatMessage as ChatMessageType
} from '../types';
import * as Constants from '../constants.tsx';
import { MOCK_PRODUCTS as INITIAL_MOCK_PRODUCTS, MOCK_ARTICLES as ALL_MOCK_ARTICLES, MOCK_ORDERS, MOCK_STAFF_USERS as initialStaffUsers, MOCK_SERVICES } from '../data/mockData';
import { useAuth, AuthContextType, AdminPermission } from '../contexts/AuthContext';
import ImageUploadPreview from '../components/ui/ImageUploadPreview';
import Markdown from 'react-markdown';
import ChatMessageComponent from '../components/chatbot/ChatMessage'; 

// Helper functions
const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; } 
    catch (error) { console.error(`Lỗi đọc localStorage key "${key}":`, error); return defaultValue; }
};
const setLocalStorageItem = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        const eventMap: Record<string, string> = {
            [Constants.SITE_CONFIG_STORAGE_KEY]: 'siteSettingsUpdated',
            [Constants.FAQ_STORAGE_KEY]: 'faqsUpdated',
            [Constants.DISCOUNTS_STORAGE_KEY]: 'discountsUpdated',
            [Constants.THEME_SETTINGS_STORAGE_KEY]: 'themeSettingsUpdated',
            [Constants.CUSTOM_MENU_STORAGE_KEY]: 'menuUpdated',
            [Constants.PRODUCTS_STORAGE_KEY]: 'productsUpdated',
            'adminArticles_v1': 'articlesUpdated',
            [Constants.MEDIA_LIBRARY_STORAGE_KEY]: 'mediaLibraryUpdated',
            [Constants.CHAT_LOGS_STORAGE_KEY]: 'chatLogsUpdated',
        };
        if (eventMap[key]) window.dispatchEvent(new CustomEvent(eventMap[key]));

    } catch (error) { console.error(`Lỗi cài đặt localStorage key "${key}":`, error); }
};
const getAndMergeSiteSettings = (): SiteSettings => {
    const defaultValue = Constants.INITIAL_SITE_SETTINGS;
    try {
        const item = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
        if (item) {
            const parsedItem = JSON.parse(item) as Partial<SiteSettings>; 
            const mergedSettings: SiteSettings = { ...defaultValue };
            for (const key in defaultValue) { 
                const K = key as keyof SiteSettings; 
                if (parsedItem.hasOwnProperty(K)) { 
                    if (typeof defaultValue[K] === 'object' && defaultValue[K] !== null && !Array.isArray(defaultValue[K]) && typeof parsedItem[K] === 'object' && parsedItem[K] !== null && !Array.isArray(parsedItem[K])) { 
                        (mergedSettings[K] as any) = { ...(defaultValue[K] as object), ...(parsedItem[K] as object) }; 
                    } else if (parsedItem[K] !== undefined) { 
                        (mergedSettings[K] as any) = parsedItem[K]; 
                    } 
                } 
            }
            (Object.keys(Constants.INITIAL_SITE_SETTINGS) as Array<keyof SiteSettings>).forEach(sectionKey => {
                if (sectionKey.startsWith('homepage') && typeof Constants.INITIAL_SITE_SETTINGS[sectionKey] === 'object' && Constants.INITIAL_SITE_SETTINGS[sectionKey] !== null) {
                    if (typeof mergedSettings[sectionKey] !== 'object' || mergedSettings[sectionKey] === null) {
                        (mergedSettings[sectionKey] as any) = { ...(Constants.INITIAL_SITE_SETTINGS[sectionKey] as object) };
                    } else {
                        if (Array.isArray(Constants.INITIAL_SITE_SETTINGS[sectionKey])) {
                             (mergedSettings[sectionKey] as any) = Array.isArray(parsedItem[sectionKey]) ? parsedItem[sectionKey] : Constants.INITIAL_SITE_SETTINGS[sectionKey];
                        } else {
                            (mergedSettings[sectionKey]as any) = { ...(Constants.INITIAL_SITE_SETTINGS[sectionKey] as object), ...(mergedSettings[sectionKey] as object) };
                        }
                    }
                }
            });
            if (!mergedSettings.smtpSettings) mergedSettings.smtpSettings = defaultValue.smtpSettings;
            if (!mergedSettings.paymentGateways) mergedSettings.paymentGateways = defaultValue.paymentGateways;
            if (!mergedSettings.siteMediaLibrary) mergedSettings.siteMediaLibrary = defaultValue.siteMediaLibrary;
            if (!mergedSettings.homepageBanners || !Array.isArray(mergedSettings.homepageBanners)) {
                 mergedSettings.homepageBanners = defaultValue.homepageBanners;
            }
            return mergedSettings;
        } return defaultValue;
    } catch (error) { console.error(`Lỗi đọc hoặc hợp nhất SiteSettings từ localStorage:`, error); return defaultValue; }
};

// Form states
interface AdminProductFormState { id?: string; name: string; mainCategorySlug: string; subCategorySlug: string; price: number; originalPrice?: number; imageUrlsData: string[]; description: string; shortDescription: string; specifications: string; stock: number; status: 'Mới' | 'Cũ' | 'Like new'; brand: string; isVisible: boolean; tagsString: string; seoMetaTitle: string; seoMetaDescription: string; slug: string; }
const initialProductFormState: AdminProductFormState = { name: '', mainCategorySlug: Constants.PRODUCT_CATEGORIES_HIERARCHY[0]?.slug || '', subCategorySlug: Constants.PRODUCT_CATEGORIES_HIERARCHY[0]?.subCategories[0]?.slug || '', price: 0, originalPrice: undefined, imageUrlsData: [], description: '', shortDescription: '', specifications: '{}', stock: 0, status: 'Mới', brand: '', isVisible: true, tagsString: '', seoMetaTitle: '', seoMetaDescription: '', slug: '' };
interface AdminArticleFormState { id?: string; title: string; summary: string; imageUrl: string; author: string; date: string; category: string; content: string; }
const initialArticleFormState: AdminArticleFormState = { title: '', summary: '', imageUrl: '', author: 'Admin', date: new Date().toISOString().split('T')[0], category: Constants.ARTICLE_CATEGORIES[0], content: '',};
interface AdminStaffFormState { id?: string; username: string; email: string; password?: string; role: UserRole; staffRole?: StaffRole; isLocked?:boolean;}
const initialStaffFormState: AdminStaffFormState = { username: '', email: '', password: '', role: 'staff', staffRole: Constants.STAFF_ROLE_OPTIONS_CONST[0], isLocked: false };
interface AdminFaqFormState extends Omit<FaqItem, 'id'> { id?: string; }
const initialFaqFormState: AdminFaqFormState = { question: '', answer: '', category: 'Chung', isVisible: true };
interface AdminDiscountFormState extends Omit<DiscountCode, 'id' | 'timesUsed'> { id?: string; }
const initialDiscountFormState: AdminDiscountFormState = { code: '', type: 'percentage', value: 10, description: '', isActive: true, expiryDate: '', minSpend: 0, usageLimit: 0 };
interface AdminMenuLinkFormState extends Omit<CustomMenuLink, 'id' | 'originalPath'> { id?: string }
const initialMenuLinkFormState: AdminMenuLinkFormState = { label: '', path: '', order: 100, icon: 'fas fa-link', isVisible: true };
interface AdminOrderFilterState { status: OrderStatus | ''; dateFrom: string; dateTo: string; customerName: string; }
const initialOrderFilterState: AdminOrderFilterState = { status: '', dateFrom: '', dateTo: '', customerName: '' };

type AdminView = 
  | 'dashboard' 
  | 'products' | 'articles' | 'site_settings' | 'faqs' | 'media_library' 
  | 'staff' | 'customers' 
  | 'orders' | 'discounts' | 'chat_logs' 
  | 'theme_settings' | 'menu_settings' 
  | 'notifications_panel'
  | 'analytics_revenue' | 'analytics_inventory' | 'analytics_promo'; 

interface MenuItemConfig {
    id: AdminView | string; 
    label: string;
    icon: string;
    permission: AdminPermission[];
    count?: number;
    children?: MenuItemConfig[];
}

const AdminPage: React.FC = () => {
  const { 
    currentUser, users: authUsers, addUser, updateUser, deleteUser, 
    addAdminNotification: notify, hasPermission, 
    adminNotifications, markAdminNotificationRead, clearAdminNotifications
  } = useAuth();
  
  const unreadNotificationCount = adminNotifications.filter(n => !n.isRead).length;

  const MENU_CONFIG: MenuItemConfig[] = useMemo(() => [
    { id: 'dashboard', label: 'Tổng Quan', icon: 'fa-tachometer-alt', permission: ['viewDashboard'] as AdminPermission[] },
    { 
        id: 'content_parent', label: 'Quản Lý Nội Dung', icon: 'fa-file-alt', permission: ['viewContent'] as AdminPermission[],
        children: [
            { id: 'products', label: 'Sản Phẩm', icon: 'fa-box-open', permission: ['viewProducts'] },
            { id: 'articles', label: 'Bài Viết', icon: 'fa-newspaper', permission: ['viewArticles'] },
            { id: 'media_library', label: 'Thư Viện Media', icon: 'fa-photo-video', permission: ['manageSiteSettings'] },
            { id: 'faqs', label: 'FAQs', icon: 'fa-question-circle', permission: ['manageFaqs'] },
        ]
    },
    { 
        id: 'users_parent', label: 'Quản Lý Người Dùng', icon: 'fa-users', permission: ['viewUsers'] as AdminPermission[],
        children: [
            { id: 'staff', label: 'Nhân Viên', icon: 'fa-user-tie', permission: ['manageStaff'] },
            { id: 'customers', label: 'Khách Hàng', icon: 'fa-user-friends', permission: ['viewCustomers'] },
        ]
    },
    {
        id: 'sales_parent', label: 'Quản Lý Bán Hàng', icon: 'fa-chart-line', permission: ['viewSales'] as AdminPermission[],
        children: [
            { id: 'orders', label: 'Đơn Hàng', icon: 'fa-receipt', permission: ['viewOrders'] },
            { id: 'chat_logs', label: 'Lịch Sử Chat', icon: 'fa-comments', permission: ['viewOrders'] }, 
            { id: 'discounts', label: 'Mã Giảm Giá', icon: 'fa-tags', permission: ['manageDiscounts'] },
        ]
    },
    {
        id: 'appearance_parent', label: 'Giao Diện & Cài Đặt', icon: 'fa-paint-brush', permission: ['viewAppearance', 'manageSiteSettings'] as AdminPermission[], 
        children: [
            { id: 'theme_settings', label: 'Theme Màu', icon: 'fa-palette', permission: ['manageTheme'] },
            { id: 'menu_settings', label: 'Menu Điều Hướng', icon: 'fa-list-ul', permission: ['manageMenu'] },
            { id: 'site_settings', label: 'Cài Đặt Trang & Hệ thống', icon: 'fa-cog', permission: ['manageSiteSettings'] }, 
        ]
    },
     { 
        id: 'analytics_parent', label: 'Phân Tích & AI', icon: 'fa-brain', permission: ['viewAnalytics'] as AdminPermission[], 
        children: [
            { id: 'analytics_revenue', label: 'Dự Đoán Doanh Thu', icon: 'fa-chart-line', permission: ['viewAnalytics'] },
            { id: 'analytics_inventory', label: 'Gợi Ý Nhập Hàng', icon: 'fa-boxes', permission: ['viewAnalytics'] },
            { id: 'analytics_promo', label: 'Gợi Ý Khuyến Mãi', icon: 'fa-tags', permission: ['viewAnalytics'] },
        ]
    },
    { id: 'notifications_panel', label: 'Thông Báo', icon: 'fa-bell', count: unreadNotificationCount, permission: ['viewNotifications'] as AdminPermission[] },
  ], [unreadNotificationCount, currentUser]); 

  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({content_parent: true, sales_parent: true}); 

  const [products, setProducts] = useState<Product[]>(() => getLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, INITIAL_MOCK_PRODUCTS));
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormData, setProductFormData] = useState<AdminProductFormState>(initialProductFormState);
  const [isEditingProduct, setIsEditingProduct] = useState<string | null>(null); 
  
  const [articles, setArticles] = useState<Article[]>(() => getLocalStorageItem('adminArticles_v1', ALL_MOCK_ARTICLES));
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [articleFormData, setArticleFormData] = useState<AdminArticleFormState>(initialArticleFormState);
  const [isEditingArticle, setIsEditingArticle] = useState<string | null>(null);

  const [siteMedia, setSiteMedia] = useState<MediaItem[]>(() => getLocalStorageItem(Constants.MEDIA_LIBRARY_STORAGE_KEY, []));

  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [customerUsers, setCustomerUsers] = useState<User[]>([]);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffFormData, setStaffFormData] = useState<AdminStaffFormState>(initialStaffFormState);
  const [isEditingStaff, setIsEditingStaff] = useState<string | null>(null);
  
  useEffect(() => {
    setStaffUsers(authUsers.filter(u => u.role === 'staff' || u.role === 'admin'));
    setCustomerUsers(authUsers.filter(u => u.role === 'customer'));
  }, [authUsers]);

  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS); 
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [orderFilters, setOrderFilters] = useState<AdminOrderFilterState>(initialOrderFilterState);
  const [editingOrderShipping, setEditingOrderShipping] = useState<Order | null>(null);

  const [chatLogs, setChatLogs] = useState<ChatLogSession[]>([]);
  const [viewingChatLog, setViewingChatLog] = useState<ChatLogSession | null>(null);
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getAndMergeSiteSettings);
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettings>(getAndMergeSiteSettings);
  const [openSiteSettingsSections, setOpenSiteSettingsSections] = useState<Record<string, boolean>>({
    'general':true, 
    'homepageBanners': false, 'homepageAbout': false, 'homepageServicesBenefits': false, 'homepageWhyChooseUs': false,
    'homepageStatsCounter': false, 'homepageFeaturedProjects': false, 'homepageTestimonials': false, 'homepageBrandLogos': false,
    'homepageProcess': false, 'homepageCallToAction': false, 'homepageBlogPreview': false, 'homepageContactSection': false,
    'aboutPage': false, 'contactPage': false, 'socialMedia': false, 'smtpSettings': false, 'paymentGateways': false,
  });

  const [faqs, setFaqs] = useState<FaqItem[]>(() => getLocalStorageItem(Constants.FAQ_STORAGE_KEY, Constants.INITIAL_FAQS));
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [faqFormData, setFaqFormData] = useState<AdminFaqFormState>(initialFaqFormState);
  const [isEditingFaq, setIsEditingFaq] = useState<string | null>(null);

  const [discounts, setDiscounts] = useState<DiscountCode[]>(() => getLocalStorageItem(Constants.DISCOUNTS_STORAGE_KEY, Constants.INITIAL_DISCOUNT_CODES));
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [discountFormData, setDiscountFormData] = useState<AdminDiscountFormState>(initialDiscountFormState);
  const [isEditingDiscount, setIsEditingDiscount] = useState<string | null>(null);

  const [themeSettings, setThemeSettings] = useState<SiteThemeSettings>(() => getLocalStorageItem(Constants.THEME_SETTINGS_STORAGE_KEY, Constants.INITIAL_THEME_SETTINGS));
  const [themeSettingsForm, setThemeSettingsForm] = useState<SiteThemeSettings>(() => getLocalStorageItem(Constants.THEME_SETTINGS_STORAGE_KEY, Constants.INITIAL_THEME_SETTINGS));

  const [customMenu, setCustomMenu] = useState<CustomMenuLink[]>(() => getLocalStorageItem(Constants.CUSTOM_MENU_STORAGE_KEY, Constants.INITIAL_CUSTOM_MENU_LINKS));
  const [editingMenuLink, setEditingMenuLink] = useState<CustomMenuLink | null>(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuLinkFormData, setMenuLinkFormData] = useState<AdminMenuLinkFormState>(initialMenuLinkFormState);

 useEffect(() => {
    let itemIsParent = false;
    let parentOfActiveView: string | null = null;
    let firstPermittedChildOfActiveParent: AdminView | null = null;

    for (const menuItem of MENU_CONFIG) {
        if (menuItem.id === activeView) { 
            if (menuItem.children && menuItem.children.length > 0) {
                itemIsParent = true;
                const firstChild = menuItem.children.find(child => hasPermission(child.permission));
                if (firstChild) {
                    firstPermittedChildOfActiveParent = firstChild.id as AdminView;
                }
                break; 
            }
        } else if (menuItem.children?.some(child => child.id === activeView)) {
            parentOfActiveView = menuItem.id;
            break;
        }
    }

    if (itemIsParent) {
        if (firstPermittedChildOfActiveParent) {
            if (activeView !== firstPermittedChildOfActiveParent) {
                setActiveView(firstPermittedChildOfActiveParent); 
            }
            if (!openMenus[activeView]) {
                setOpenMenus(prev => ({ ...prev, [activeView]: true }));
            }
        } else {
            if (activeView !== 'dashboard' && hasPermission(['viewDashboard'])) setActiveView('dashboard');
            else if (activeView !== 'products' && hasPermission(['viewProducts'])) setActiveView('products'); 
        }
    } else if (parentOfActiveView) {
        if (!openMenus[parentOfActiveView]) {
            setOpenMenus(prev => ({ ...prev, [parentOfActiveView!]: true }));
        }
    }
  }, [activeView, MENU_CONFIG, hasPermission, openMenus, setActiveView, setOpenMenus]);

  const loadChatLogs = useCallback(() => {
    const logs = getLocalStorageItem<ChatLogSession[]>(Constants.CHAT_LOGS_STORAGE_KEY, []);
    setChatLogs(logs);
  }, []);

  useEffect(() => {
    const handleSettingsUpdate = () => { const updatedSettings = getAndMergeSiteSettings(); setSiteSettings(updatedSettings); setSiteSettingsForm(updatedSettings); };
    const handleThemeUpdate = () => setThemeSettingsForm(getLocalStorageItem(Constants.THEME_SETTINGS_STORAGE_KEY, Constants.INITIAL_THEME_SETTINGS));
    const handleProductsUpdate = () => setProducts(getLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, INITIAL_MOCK_PRODUCTS));
    const handleArticlesUpdate = () => setArticles(getLocalStorageItem('adminArticles_v1', ALL_MOCK_ARTICLES));
    const handleFaqsUpdate = () => setFaqs(getLocalStorageItem(Constants.FAQ_STORAGE_KEY, Constants.INITIAL_FAQS));
    const handleDiscountsUpdate = () => setDiscounts(getLocalStorageItem(Constants.DISCOUNTS_STORAGE_KEY, Constants.INITIAL_DISCOUNT_CODES));
    const handleMenuUpdate = () => setCustomMenu(getLocalStorageItem(Constants.CUSTOM_MENU_STORAGE_KEY, Constants.INITIAL_CUSTOM_MENU_LINKS));
    const handleMediaLibraryUpdate = () => setSiteMedia(getLocalStorageItem(Constants.MEDIA_LIBRARY_STORAGE_KEY, []));
    const handleChatLogsUpdate = () => loadChatLogs();
    
    window.addEventListener('siteSettingsUpdated', handleSettingsUpdate);
    window.addEventListener('themeSettingsUpdated', handleThemeUpdate);
    window.addEventListener('productsUpdated', handleProductsUpdate);
    window.addEventListener('articlesUpdated', handleArticlesUpdate);
    window.addEventListener('faqsUpdated', handleFaqsUpdate);
    window.addEventListener('discountsUpdated', handleDiscountsUpdate);
    window.addEventListener('menuUpdated', handleMenuUpdate);
    window.addEventListener('mediaLibraryUpdated', handleMediaLibraryUpdate);
    window.addEventListener('chatLogsUpdated', handleChatLogsUpdate); 
    loadChatLogs(); 

    if (localStorage.getItem(Constants.PRODUCTS_STORAGE_KEY) === null) { setLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, INITIAL_MOCK_PRODUCTS); setProducts(INITIAL_MOCK_PRODUCTS); }
    if (localStorage.getItem('adminArticles_v1') === null) { setLocalStorageItem('adminArticles_v1', ALL_MOCK_ARTICLES); setArticles(ALL_MOCK_ARTICLES); }
    if (localStorage.getItem(Constants.MEDIA_LIBRARY_STORAGE_KEY) === null) { setLocalStorageItem(Constants.MEDIA_LIBRARY_STORAGE_KEY, []); setSiteMedia([]);}
    if (localStorage.getItem(Constants.CHAT_LOGS_STORAGE_KEY) === null) { setLocalStorageItem(Constants.CHAT_LOGS_STORAGE_KEY, []); setChatLogs([]);}
    
    document.body.classList.add('admin-panel-body');
    return () => {
        document.body.classList.remove('admin-panel-body');
        window.removeEventListener('siteSettingsUpdated', handleSettingsUpdate);
        window.removeEventListener('themeSettingsUpdated', handleThemeUpdate);
        window.removeEventListener('productsUpdated', handleProductsUpdate);
        window.removeEventListener('articlesUpdated', handleArticlesUpdate);
        window.removeEventListener('faqsUpdated', handleFaqsUpdate);
        window.removeEventListener('discountsUpdated', handleDiscountsUpdate);
        window.removeEventListener('menuUpdated', handleMenuUpdate);
        window.removeEventListener('mediaLibraryUpdated', handleMediaLibraryUpdate);
        window.removeEventListener('chatLogsUpdated', handleChatLogsUpdate);
    };
  }, [loadChatLogs]);

  const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsDataURL(file); });
  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setProductFormData(prev => ({ ...prev, [name]: val }));
  };
  const handleProductImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) { const filesArray = Array.from(e.target.files); const dataUrls = await Promise.all(filesArray.map(fileToDataUrl)); setProductFormData(prevData => ({ ...prevData, imageUrlsData: [...prevData.imageUrlsData.filter(url => !url.startsWith('data:image')), ...dataUrls] })); }};
  const handleProductImageUrlChange = (index: number, value: string) => { const newImageUrls = [...productFormData.imageUrlsData]; newImageUrls[index] = value; setProductFormData(prev => ({ ...prev, imageUrlsData: newImageUrls })); };
  const addProductImageUrlField = () => setProductFormData(prev => ({ ...prev, imageUrlsData: [...prev.imageUrlsData, ''] }));
  const removeProductImageUrlField = (indexToRemove: number) => setProductFormData(prev => ({ ...prev, imageUrlsData: prev.imageUrlsData.filter((_, index) => index !== indexToRemove) }));
  const resetProductForm = () => { setProductFormData(initialProductFormState); setIsEditingProduct(null); setShowProductForm(false); };
  const handleProductFormSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!hasPermission(['manageProducts'])) { notify("Bạn không có quyền.", "error"); return; } let specsObject = {}; try { specsObject = JSON.parse(productFormData.specifications || '{}'); } catch (error) { notify("JSON thông số kỹ thuật không hợp lệ.", "error"); return; } const mainCat = Constants.PRODUCT_CATEGORIES_HIERARCHY.find(mc => mc.slug === productFormData.mainCategorySlug); const subCat = mainCat?.subCategories.find(sc => sc.slug === productFormData.subCategorySlug); if (!mainCat || !subCat) { notify("Danh mục không hợp lệ.", "error"); return; } const productPayload: Product = { id: isEditingProduct || `prod-${Date.now()}`, name: productFormData.name, mainCategory: mainCat.name, subCategory: subCat.name, category: subCat.name, price: Number(productFormData.price), originalPrice: productFormData.originalPrice ? Number(productFormData.originalPrice) : undefined, imageUrls: productFormData.imageUrlsData.filter(url => url.trim() !== ''), description: productFormData.description, shortDescription: productFormData.shortDescription, specifications: specsObject, stock: Number(productFormData.stock), status: productFormData.status, brand: productFormData.brand, isVisible: productFormData.isVisible, tags: productFormData.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag), seoMetaTitle: productFormData.seoMetaTitle, seoMetaDescription: productFormData.seoMetaDescription, slug: productFormData.slug }; let updatedProducts; if (isEditingProduct) { updatedProducts = products.map(p => p.id === isEditingProduct ? productPayload : p); notify(`Sản phẩm "${productPayload.name}" đã được cập nhật.`, 'success'); } else { updatedProducts = [productPayload, ...products]; notify(`Sản phẩm "${productPayload.name}" đã được thêm.`, 'success'); } setProducts(updatedProducts); setLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, updatedProducts); resetProductForm(); };
  const handleEditProduct = (product: Product) => { if (!hasPermission(['manageProducts'])) { notify("Không có quyền.", "error"); return; } const mainCat = Constants.PRODUCT_CATEGORIES_HIERARCHY.find(mc => mc.name === product.mainCategory); const subCat = mainCat?.subCategories.find(sc => sc.name === product.subCategory); setProductFormData({ id: product.id, name: product.name, mainCategorySlug: mainCat?.slug || '', subCategorySlug: subCat?.slug || '', price: product.price, originalPrice: product.originalPrice, imageUrlsData: product.imageUrls, description: product.description, shortDescription: product.shortDescription || '', specifications: JSON.stringify(product.specifications, null, 2), stock: product.stock, status: product.status || 'Mới', brand: product.brand || '', isVisible: product.isVisible !== undefined ? product.isVisible : true, tagsString: product.tags?.join(', ') || '', seoMetaTitle: product.seoMetaTitle || '', seoMetaDescription: product.seoMetaDescription || '', slug: product.slug || '' }); setIsEditingProduct(product.id); setShowProductForm(true); setActiveView('products'); };
  const handleDeleteProduct = (productId: string) => { if (!hasPermission(['manageProducts'])) { notify("Không có quyền.", "error"); return; } if (window.confirm("Xóa sản phẩm này?")) { const name = products.find(p=>p.id===productId)?.name; const updatedProducts = products.filter(p => p.id !== productId); setProducts(updatedProducts); setLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, updatedProducts); notify(`Sản phẩm "${name || 'Không tên'}" đã được xóa.`, 'warning'); }};
  const handleArticleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setArticleFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleArticleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { try { const dataUrl = await fileToDataUrl(e.target.files[0]); setArticleFormData(prev => ({ ...prev, imageUrl: dataUrl })); } catch (error) { notify("Lỗi tải ảnh lên.", "error"); }}};
  const resetArticleForm = () => { setArticleFormData(initialArticleFormState); setIsEditingArticle(null); setShowArticleForm(false); };
  const handleArticleFormSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!hasPermission(['manageArticles'])) { notify("Không có quyền.", "error"); return; } const articlePayload: Article = { id: isEditingArticle || `art-${Date.now()}`, ...articleFormData, content: articleFormData.content || "Nội dung đang được cập nhật." }; let updatedArticles; if (isEditingArticle) { updatedArticles = articles.map(a => a.id === isEditingArticle ? articlePayload : a); notify(`Bài viết "${articlePayload.title}" đã được cập nhật.`, 'success'); } else { updatedArticles = [articlePayload, ...articles]; notify(`Bài viết "${articlePayload.title}" đã được thêm.`, 'success'); } setArticles(updatedArticles); setLocalStorageItem('adminArticles_v1', updatedArticles); resetArticleForm(); };
  const handleEditArticle = (article: Article) => { if (!hasPermission(['manageArticles'])) { notify("Không có quyền.", "error"); return; } setArticleFormData({ ...article, content: article.content || '' }); setIsEditingArticle(article.id); setShowArticleForm(true); setActiveView('articles'); };
  const handleDeleteArticle = (articleId: string) => { if (!hasPermission(['manageArticles'])) { notify("Không có quyền.", "error"); return; } if (window.confirm("Xóa bài viết này?")) { const title = articles.find(a=>a.id===articleId)?.title; const updated = articles.filter(a => a.id !== articleId); setArticles(updated); setLocalStorageItem('adminArticles_v1', updated); notify(`Bài viết "${title || 'Không tên'}" đã được xóa.`, 'warning'); }};
  
  const handleSiteSettingInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, 
    section: keyof SiteSettings, 
    index?: number
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setSiteSettingsForm(prev => {
      const newState = { ...prev };
      
      if (typeof index === 'number' && Array.isArray(newState[section])) {
        const newArray = [...(newState[section] as any[])];
        newArray[index] = { ...newArray[index], [name]: val };
        newState[section] = newArray as any;
        return newState;
      }
      
      if (typeof newState[section] === 'object' && newState[section] !== null && !Array.isArray(newState[section])) {
        newState[section] = { ...(newState[section] as object), [name]: val } as any;
        return newState;
      }

      newState[section] = val as any;
      return newState;
    });
  };

  const handleSiteImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    section: keyof SiteSettings, 
    fieldName: string, 
    index?: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const dataUrl = await fileToDataUrl(e.target.files[0]);
        setSiteSettingsForm(prev => {
          const newState = { ...prev };

          if (typeof index === 'number' && Array.isArray(newState[section])) {
            const newArray = [...(newState[section] as any[])];
            newArray[index] = { ...newArray[index], [fieldName]: dataUrl };
            newState[section] = newArray as any;
            return newState;
          }

          if (typeof newState[section] === 'object' && newState[section] !== null && !Array.isArray(newState[section])) {
            newState[section] = { ...(newState[section] as object), [fieldName]: dataUrl } as any;
            return newState;
          }
          
          return newState;
        });
      } catch (error) {
        notify('Lỗi tải ảnh lên.', 'error');
      }
    }
  };


  const handleSaveSiteSettings = () => { if (!hasPermission(['manageSiteSettings'])) { notify("Không có quyền.", "error"); return; } setLocalStorageItem(Constants.SITE_CONFIG_STORAGE_KEY, siteSettingsForm); setSiteSettings(siteSettingsForm); notify("Cài đặt trang đã được lưu.", 'success'); };
  const handleFaqInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { const { name, value, type } = e.target; const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value; setFaqFormData(prev => ({ ...prev, [name]: val }));};
  const resetFaqForm = () => { setFaqFormData(initialFaqFormState); setIsEditingFaq(null); setShowFaqForm(false); };
  const handleFaqFormSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!hasPermission(['manageFaqs'])) { notify("Không có quyền.", "error"); return; } const faqPayload: FaqItem = { id: isEditingFaq || `faq-${Date.now()}`, ...faqFormData }; let updatedFaqs; if (isEditingFaq) { updatedFaqs = faqs.map(f => f.id === isEditingFaq ? faqPayload : f); notify("FAQ đã được cập nhật.", 'success'); } else { updatedFaqs = [faqPayload, ...faqs]; notify("FAQ đã được thêm.", 'success'); } setFaqs(updatedFaqs); setLocalStorageItem(Constants.FAQ_STORAGE_KEY, updatedFaqs); resetFaqForm(); };
  const handleEditFaq = (faq: FaqItem) => { if (!hasPermission(['manageFaqs'])) { notify("Không có quyền.", "error"); return; } setFaqFormData({ ...faq }); setIsEditingFaq(faq.id); setShowFaqForm(true); setActiveView('faqs'); };
  const handleDeleteFaq = (faqId: string) => { if (!hasPermission(['manageFaqs'])) { notify("Không có quyền.", "error"); return; } if (window.confirm("Xóa FAQ này?")) { const updated = faqs.filter(f => f.id !== faqId); setFaqs(updated); setLocalStorageItem(Constants.FAQ_STORAGE_KEY, updated); notify("FAQ đã được xóa.", 'warning'); }};
  const handleStaffInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const {name, value, type} = e.target; const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value; setStaffFormData(prev => ({ ...prev, [name]: val })); };
  const resetStaffForm = () => { setStaffFormData(initialStaffFormState); setIsEditingStaff(null); setShowStaffForm(false); };
  const handleStaffFormSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!hasPermission(['manageStaff'])) { notify("Không có quyền.", "error"); return; } if (!staffFormData.email || !staffFormData.username) { notify("Email và Tên là bắt buộc.", "error"); return;} if (isEditingStaff) { const { password, ...updates } = staffFormData; const finalUpdates = password ? staffFormData : updates; const success = await updateUser(isEditingStaff, finalUpdates); if (success) notify("Nhân viên đã được cập nhật.", 'success'); else notify("Lỗi cập nhật.", 'error'); } else { if (!staffFormData.password) { notify("Mật khẩu là bắt buộc.", "error"); return;} const newUser = await addUser({ ...staffFormData, role: 'staff' }); if (newUser) notify("Nhân viên mới đã được thêm.", 'success'); else notify("Lỗi thêm.", 'error'); } resetStaffForm(); };
  const handleEditStaff = (staff: User) => { if (!hasPermission(['manageStaff'])) { notify("Không có quyền.", "error"); return; } const { password, ...formData } = staff; setStaffFormData({ ...formData, password: '', isLocked: staff.isLocked || false }); setIsEditingStaff(staff.id); setShowStaffForm(true); setActiveView('staff'); };
  const handleDeleteUser = async (userId: string, userType: 'staff' | 'customer') => { if (!hasPermission(['manageStaff']) && userType === 'staff') { notify("Không có quyền xóa nhân viên.", "error"); return; } if (userType === 'customer' && !hasPermission(['viewCustomers'])) { notify("Không có quyền xóa khách hàng.", "error"); return;} const userToDelete = authUsers.find(s => s.id === userId); if (userToDelete && userToDelete.email === currentUser?.email) { notify("Không thể xóa chính mình.", "error"); return; } if (window.confirm(`Xóa người dùng ${userType === 'staff' ? 'nhân viên' : 'khách hàng'} này?`)) { const success = await deleteUser(userId); if (success) notify(`Người dùng ${userType === 'staff' ? 'nhân viên' : 'khách hàng'} đã được xóa.`, 'warning'); else notify("Lỗi xóa.", 'error'); }};
  const handleToggleUserLock = async (userId: string, currentLockStatus: boolean | undefined) => { if (!hasPermission(['manageStaff'])) { notify("Không có quyền khóa/mở khóa người dùng.", "error"); return; } const success = await updateUser(userId, { isLocked: !currentLockStatus }); if (success) notify(`Người dùng đã được ${!currentLockStatus ? 'khóa' : 'mở khóa'}.`, 'info'); else notify("Lỗi cập nhật trạng thái khóa.", 'error');};
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => { if (!hasPermission(['manageOrders'])) { notify("Không có quyền.", "error"); return; } setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)); notify(`Đơn hàng #${orderId} cập nhật: "${newStatus}".`, 'info'); };
  const handleOrderFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setOrderFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSaveOrderShippingInfo = () => { if (!editingOrderShipping || !hasPermission(['manageOrders'])) return; setOrders(orders.map(o => o.id === editingOrderShipping.id ? editingOrderShipping : o)); notify(`Thông tin vận chuyển đơn #${editingOrderShipping.id.slice(-6)} đã cập nhật.`, 'success'); setEditingOrderShipping(null);};
  const handleDiscountInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { const { name, value, type } = e.target; const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseFloat(value) || 0 : value; setDiscountFormData(prev => ({ ...prev, [name]: val })); };
  const resetDiscountForm = () => { setDiscountFormData(initialDiscountFormState); setIsEditingDiscount(null); setShowDiscountForm(false); };
  const handleDiscountFormSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!hasPermission(['manageDiscounts'])) { notify("Không có quyền.", "error"); return; } const payload: DiscountCode = { id: isEditingDiscount || `dc-${Date.now()}`, ...discountFormData, timesUsed: discounts.find(d => d.id === isEditingDiscount)?.timesUsed || 0, }; let updated; if (isEditingDiscount) { updated = discounts.map(d => d.id === isEditingDiscount ? payload : d); notify(`Mã "${payload.code}" đã được cập nhật.`, 'success'); } else { updated = [payload, ...discounts]; notify(`Mã "${payload.code}" đã được thêm.`, 'success'); } setDiscounts(updated); setLocalStorageItem(Constants.DISCOUNTS_STORAGE_KEY, updated); resetDiscountForm(); };
  const handleEditDiscount = (discount: DiscountCode) => { if (!hasPermission(['manageDiscounts'])) { notify("Không có quyền.", "error"); return; } setDiscountFormData({ ...discount }); setIsEditingDiscount(discount.id); setShowDiscountForm(true); setActiveView('discounts'); };
  const handleDeleteDiscount = (discountId: string) => { if (!hasPermission(['manageDiscounts'])) { notify("Không có quyền.", "error"); return; } if (window.confirm("Xóa mã giảm giá này?")) { const code = discounts.find(d=>d.id===discountId)?.code; const updated = discounts.filter(d => d.id !== discountId); setDiscounts(updated); setLocalStorageItem(Constants.DISCOUNTS_STORAGE_KEY, updated); notify(`Mã "${code || 'Không tên'}" đã được xóa.`, 'warning'); }};
  const handleThemeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = e.target; setThemeSettingsForm(prev => ({ ...prev, [name]: value })); };
  const handleSaveThemeSettings = () => { if (!hasPermission(['manageTheme'])) { notify("Không có quyền.", "error"); return; } setLocalStorageItem(Constants.THEME_SETTINGS_STORAGE_KEY, themeSettingsForm); setThemeSettings(themeSettingsForm); notify("Theme đã được cập nhật. Tải lại trang để xem thay đổi.", 'success'); document.documentElement.style.setProperty('--color-primary-default', themeSettingsForm.primaryColorDefault); document.documentElement.style.setProperty('--color-primary-light', themeSettingsForm.primaryColorLight); document.documentElement.style.setProperty('--color-primary-dark', themeSettingsForm.primaryColorDark); document.documentElement.style.setProperty('--color-secondary-default', themeSettingsForm.secondaryColorDefault); document.documentElement.style.setProperty('--color-secondary-light', themeSettingsForm.secondaryColorLight); document.documentElement.style.setProperty('--color-secondary-dark', themeSettingsForm.secondaryColorDark);};
  const handleMenuLinkInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value, type } = e.target; const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseInt(value, 10) || 0 : value; setMenuLinkFormData(prev => ({ ...prev, [name]: val })); };
  const resetMenuLinkForm = () => { setMenuLinkFormData(initialMenuLinkFormState); setEditingMenuLink(null); setShowMenuForm(false); };
  const handleMenuLinkFormSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!hasPermission(['manageMenu'])) { notify("Không có quyền.", "error"); return; } const payload: CustomMenuLink = { ...initialMenuLinkFormState, ...menuLinkFormData, id: editingMenuLink?.id || `menu-${Date.now()}`, originalPath: editingMenuLink?.originalPath || menuLinkFormData.path }; let updated; if (editingMenuLink) { updated = customMenu.map(m => m.id === editingMenuLink.id ? payload : m); notify(`Link "${payload.label}" đã cập nhật.`, 'success'); } else { updated = [...customMenu, payload]; notify(`Link "${payload.label}" đã thêm.`, 'success'); } setCustomMenu(updated.sort((a,b) => a.order - b.order)); setLocalStorageItem(Constants.CUSTOM_MENU_STORAGE_KEY, updated.sort((a,b) => a.order - b.order)); resetMenuLinkForm();};
  const handleEditMenuLink = (link: CustomMenuLink) => { if (!hasPermission(['manageMenu'])) { notify("Không có quyền.", "error"); return; } setMenuLinkFormData({ ...link }); setEditingMenuLink(link); setShowMenuForm(true); setActiveView('menu_settings'); };
  const handleDeleteMenuLink = (linkId: string) => { if (!hasPermission(['manageMenu'])) { notify("Không có quyền.", "error"); return; } if (window.confirm("Xóa link menu này?")) { const label = customMenu.find(m=>m.id===linkId)?.label; const updated = customMenu.filter(m => m.id !== linkId); setCustomMenu(updated); setLocalStorageItem(Constants.CUSTOM_MENU_STORAGE_KEY, updated); notify(`Link "${label || 'Không tên'}" đã xóa.`, 'warning'); }};
  const handleAddItemToSiteSettingArray = (sectionKey: keyof SiteSettings, fieldKey: string, newItemTemplate: any) => { setSiteSettingsForm(prev => { const currentSection = prev[sectionKey] as any; const currentArray = Array.isArray(currentSection?.[fieldKey]) ? currentSection[fieldKey] : []; const newItemWithId = { ...newItemTemplate, id: `${fieldKey.slice(0,-1)}-${Date.now()}` }; return { ...prev, [sectionKey]: { ...currentSection, [fieldKey]: [...currentArray, newItemWithId] } }; }); };
  const handleRemoveItemFromSiteSettingArray = (sectionKey: keyof SiteSettings, fieldKey: string, itemIdToRemove: string) => { setSiteSettingsForm(prev => { const currentSection = prev[sectionKey] as any; const currentArray = Array.isArray(currentSection?.[fieldKey]) ? currentSection[fieldKey] : []; return { ...prev, [sectionKey]: { ...currentSection, [fieldKey]: currentArray.filter((item: any) => item.id !== itemIdToRemove) } }; }); };
  const handleMediaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { try { const file = e.target.files[0]; const dataUrl = await fileToDataUrl(file); const newMediaItem: MediaItem = { id: `media-${Date.now()}`, url: dataUrl, name: file.name, type: file.type, uploadedAt: new Date().toISOString() }; const updatedMedia = [newMediaItem, ...siteMedia]; setSiteMedia(updatedMedia); setLocalStorageItem(Constants.MEDIA_LIBRARY_STORAGE_KEY, updatedMedia); notify(`Ảnh "${file.name}" đã được tải lên.`, "success"); } catch (error) { notify("Lỗi tải ảnh lên.", "error"); } } };
  const handleDeleteMediaItem = (mediaId: string) => { if (window.confirm("Xóa ảnh này khỏi thư viện?")) { const updatedMedia = siteMedia.filter(item => item.id !== mediaId); setSiteMedia(updatedMedia); setLocalStorageItem(Constants.MEDIA_LIBRARY_STORAGE_KEY, updatedMedia); notify("Ảnh đã được xóa.", "warning"); }};
  const copyMediaUrl = (url: string) => { navigator.clipboard.writeText(url).then(() => notify("Đã sao chép URL ảnh!", "success")).catch(() => notify("Lỗi sao chép URL.", "error")); };
  const handleDeleteChatLog = (logId: string) => { if (window.confirm("Xóa lịch sử chat này?")) { const updatedLogs = chatLogs.filter(log => log.id !== logId); setChatLogs(updatedLogs); setLocalStorageItem(Constants.CHAT_LOGS_STORAGE_KEY, updatedLogs); notify("Lịch sử chat đã được xóa.", "warning"); if (viewingChatLog?.id === logId) setViewingChatLog(null); }};

  // Styled Form Components
  const FormSectionTitle: React.FC<{children: React.ReactNode}> = ({children}) => <h3 className="admin-form-subsection-title">{children}</h3>;

  const InputField: React.FC<{label: string, name: string, value: string | number | undefined, onChange: any, section?: keyof SiteSettings, field?: string, index?: number, subField?: string, type?: string, placeholder?: string, required?: boolean, disabled?: boolean, helpText?: string}> = 
    ({label, name, value, onChange, section, field, index, subField, type = 'text', placeholder, required = false, disabled = false, helpText }) => (
    <div className="admin-form-group">
        <label htmlFor={`${section}_${field}_${name}_${index}_${subField}`} className="block text-sm font-medium text-admin-text-secondary mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
        <input type={type} id={`${section}_${field}_${name}_${index}_${subField}`} name={name} value={value || ''} onChange={e => onChange(e, section, index, field)} placeholder={placeholder} required={required} disabled={disabled} />
        {helpText && <p className="form-input-description">{helpText}</p>}
    </div>
  );
  const TextAreaField: React.FC<{label: string, name: string, value: string | undefined, onChange: any, section?: keyof SiteSettings, field?: string, index?: number, subField?: string, rows?: number, required?: boolean, placeholder?: string}> = 
    ({label, name, value, onChange, section, field, index, subField, rows = 3, required = false, placeholder}) => (
    <div className="admin-form-group">
        <label htmlFor={`${section}_${field}_${name}_${index}_${subField}`} className="block text-sm font-medium text-admin-text-secondary mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
        <textarea id={`${section}_${field}_${name}_${index}_${subField}`} name={name} value={value || ''} onChange={e => onChange(e, section, index, field)} rows={rows} required={required} placeholder={placeholder}></textarea>
    </div>
  );
  const SelectField: React.FC<{label: string, name: string, value: string | number | undefined, onChange: any, section?: keyof SiteSettings, field?: string, index?: number, subField?: string, required?: boolean, children: React.ReactNode}> = 
  ({label, name, value, onChange, section, field, index, subField, required = false, children}) => (
    <div className="admin-form-group">
        <label htmlFor={`${section}_${field}_${name}_${index}_${subField}`} className="block text-sm font-medium text-admin-text-secondary mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
        <select id={`${section}_${field}_${name}_${index}_${subField}`} name={name} value={value || ''} onChange={e => onChange(e, section, index, field)} required={required}>
            {children}
        </select>
    </div>
  );
  const CheckboxField: React.FC<{label: string, name: string, checked: boolean | undefined, onChange: any, section?: keyof SiteSettings, field?: string, index?: number, subField?: string}> = 
    ({label, name, checked, onChange, section, field, index, subField}) => ( 
    <div className="admin-form-group-checkbox"> 
        <input type="checkbox" id={`${section}_${field}_${name}_${index}_${subField}`} name={name} checked={checked || false} onChange={e => onChange(e, section, index, field)} />
        <label htmlFor={`${section}_${field}_${name}_${index}_${subField}`} className="ml-2 text-sm font-medium text-admin-text-secondary">{label}</label>
    </div>
  );

  const filterAndSortOrders = () => {
    return orders
        .filter(order => {
            if (orderFilters.status && order.status !== orderFilters.status) return false;
            if (orderFilters.customerName && !order.customerInfo.fullName.toLowerCase().includes(orderFilters.customerName.toLowerCase())) return false;
            const orderDate = new Date(order.orderDate);
            if (orderFilters.dateFrom && orderDate < new Date(orderFilters.dateFrom)) return false;
            if (orderFilters.dateTo && orderDate > new Date(orderFilters.dateTo)) return false;
            return true;
        })
        .sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  };

  const filteredOrders = filterAndSortOrders();

  const renderContent = () => {
    if (!hasPermission(['viewDashboard'])) return <div className="admin-card"><div className="admin-card-body">Bạn không có quyền truy cập trang quản trị.</div></div>;

    switch(activeView) {
      case 'dashboard':
        return hasPermission(['viewDashboard']) ? <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="admin-card !shadow-none"><div className="admin-card-body">Doanh thu hôm nay: <strong>{(orders.filter(o => new Date(o.orderDate).toDateString() === new Date().toDateString()).reduce((sum, o) => sum + o.totalAmount, 0)).toLocaleString('vi-VN')}₫</strong></div></Card>
            <Card className="admin-card !shadow-none"><div className="admin-card-body">Đơn hàng mới: <strong>{orders.filter(o => o.status === 'Chờ xử lý').length}</strong></div></Card>
            <Card className="admin-card !shadow-none"><div className="admin-card-body">Sản phẩm sắp hết: <strong>{products.filter(p => p.stock > 0 && p.stock < 5).length}</strong></div></Card>
            <Card className="admin-card !shadow-none"><div className="admin-card-body">Khách hàng mới: <strong>{customerUsers.length}</strong></div></Card>
          </div>
          <Card className="admin-card !shadow-none">
            <div className="admin-card-header"><h3 className="admin-card-title">Đơn hàng gần đây</h3></div>
            <div className="admin-card-body !p-0"><table className="admin-table"><thead><tr><th>Mã ĐH</th><th>Khách hàng</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>{orders.slice(0, 5).map(o => <tr key={o.id}><td>#{o.id.slice(-6)}</td><td>{o.customerInfo.fullName}</td><td>{new Date(o.orderDate).toLocaleDateString('vi-VN')}</td><td>{o.totalAmount.toLocaleString('vi-VN')}₫</td><td>{o.status}</td></tr>)}</tbody></table></div>
          </Card>
        </div> : null;

      case 'products':
        if (!hasPermission(['viewProducts'])) return null;
        return <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Quản lý Sản phẩm ({products.length})</h3>
            {hasPermission(['manageProducts']) && <Button onClick={() => { setIsEditingProduct(null); setProductFormData(initialProductFormState); setShowProductForm(true); }}><i className="fas fa-plus mr-2"></i>Thêm Sản phẩm</Button>}
          </div>
          {showProductForm ? (
            <Card className="admin-card !shadow-lg mb-6"><div className="admin-card-header"><h3 className="admin-card-title">{isEditingProduct ? "Chỉnh sửa Sản phẩm" : "Thêm Sản phẩm mới"}</h3></div><form onSubmit={handleProductFormSubmit} className="admin-card-body grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <FormSectionTitle>Thông tin cơ bản</FormSectionTitle>
                <div><label>Tên sản phẩm</label><input type="text" name="name" value={productFormData.name} onChange={handleProductInputChange} required /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label>Danh mục chính</label><select name="mainCategorySlug" value={productFormData.mainCategorySlug} onChange={handleProductInputChange}>{Constants.PRODUCT_CATEGORIES_HIERARCHY.map(mc => <option key={mc.slug} value={mc.slug}>{mc.name}</option>)}</select></div>
                  <div><label>Danh mục con</label><select name="subCategorySlug" value={productFormData.subCategorySlug} onChange={handleProductInputChange}>{Constants.PRODUCT_CATEGORIES_HIERARCHY.find(mc => mc.slug === productFormData.mainCategorySlug)?.subCategories.map(sc => <option key={sc.slug} value={sc.slug}>{sc.name}</option>)}</select></div>
                </div>
                <div><label>Mô tả ngắn</label><textarea name="shortDescription" value={productFormData.shortDescription} onChange={handleProductInputChange} rows={2}></textarea></div>
                <div><label>Mô tả chi tiết</label><textarea name="description" value={productFormData.description} onChange={handleProductInputChange} rows={5}></textarea></div>
                <FormSectionTitle>Giá & Kho hàng</FormSectionTitle>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label>Giá bán (VNĐ)</label><input type="number" name="price" value={productFormData.price} onChange={handleProductInputChange} required /></div>
                  <div><label>Giá gốc (nếu có)</label><input type="number" name="originalPrice" value={productFormData.originalPrice} onChange={handleProductInputChange} /></div>
                  <div><label>Số lượng kho</label><input type="number" name="stock" value={productFormData.stock} onChange={handleProductInputChange} required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label>Hãng sản xuất</label><input type="text" name="brand" value={productFormData.brand} onChange={handleProductInputChange} /></div>
                    <div><label>Tình trạng</label><select name="status" value={productFormData.status} onChange={handleProductInputChange}><option value="Mới">Mới</option><option value="Cũ">Cũ</option><option value="Like new">Like new</option></select></div>
                </div>
              </div>
              <div className="md:col-span-1 space-y-4">
                 <FormSectionTitle>Hình ảnh</FormSectionTitle>
                 {productFormData.imageUrlsData.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input type="text" value={url} onChange={(e) => handleProductImageUrlChange(index, e.target.value)} placeholder={`URL ảnh ${index + 1}`} className="flex-grow"/>
                        <Button type="button" variant="danger" size="sm" onClick={() => removeProductImageUrlField(index)}><i className="fas fa-trash"></i></Button>
                    </div>
                 ))}
                 <Button type="button" variant="outline" size="sm" onClick={addProductImageUrlField}>Thêm URL ảnh</Button>
                 <div><label>Hoặc tải lên (sẽ ghi đè URL)</label><input type="file" onChange={handleProductImageFileChange} multiple accept="image/*" /></div>
                 <FormSectionTitle>Thông số kỹ thuật (JSON)</FormSectionTitle>
                 <textarea name="specifications" value={productFormData.specifications} onChange={handleProductInputChange} rows={6} placeholder='{ "CPU": "Intel Core i9", "RAM": "32GB" }'></textarea>
                 <FormSectionTitle>SEO & Hiển thị</FormSectionTitle>
                 <input type="text" name="tagsString" value={productFormData.tagsString} onChange={handleProductInputChange} placeholder="Tags (cách nhau bởi dấu phẩy)" />
                 <input type="text" name="slug" value={productFormData.slug} onChange={handleProductInputChange} placeholder="URL Slug (tùy chọn)" />
                 <input type="text" name="seoMetaTitle" value={productFormData.seoMetaTitle} onChange={handleProductInputChange} placeholder="SEO Meta Title" />
                 <textarea name="seoMetaDescription" value={productFormData.seoMetaDescription} onChange={handleProductInputChange} placeholder="SEO Meta Description" rows={2}></textarea>
                 <div className="admin-form-group-checkbox"><input type="checkbox" name="isVisible" checked={productFormData.isVisible} onChange={handleProductInputChange} id="prod_visible" /><label htmlFor="prod_visible">Hiển thị sản phẩm</label></div>
                 <div className="flex gap-2 mt-4"><Button type="submit" isLoading={false}>{isEditingProduct ? 'Cập nhật' : 'Lưu'}</Button><Button type="button" variant="outline" onClick={resetProductForm}>Hủy</Button></div>
              </div>
            </form></Card>
          ) : null}
          <Card className="admin-card !shadow-none"><div className="admin-card-body !p-0"><table className="admin-table"><thead><tr><th>Sản phẩm</th><th>Giá</th><th>Kho</th><th>Hiển thị</th><th></th></tr></thead><tbody>{products.map(p => <tr key={p.id}><td><div className="flex items-center"><img src={p.imageUrls[0] || ''} className="w-10 h-10 object-cover rounded mr-3"/><span className="font-semibold">{p.name}</span></div></td><td>{p.price.toLocaleString('vi-VN')}₫</td><td>{p.stock}</td><td>{p.isVisible ? 'Có' : 'Không'}</td><td className="text-right">{hasPermission(['manageProducts']) && <><Button size="sm" variant="ghost" onClick={() => handleEditProduct(p)}><i className="fas fa-edit"></i></Button><Button size="sm" variant="ghost" className="text-danger-text" onClick={() => handleDeleteProduct(p.id)}><i className="fas fa-trash"></i></Button></>}</td></tr>)}</tbody></table></div></Card>
        </div>;

      case 'articles':
        if (!hasPermission(['viewArticles'])) return null;
         return <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Quản lý Bài viết ({articles.length})</h3>
            {hasPermission(['manageArticles']) && <Button onClick={() => { setIsEditingArticle(null); setArticleFormData(initialArticleFormState); setShowArticleForm(true); }}><i className="fas fa-plus mr-2"></i>Thêm Bài viết</Button>}
          </div>
          {showArticleForm && (
            <Card className="admin-card !shadow-lg mb-6"><div className="admin-card-header"><h3 className="admin-card-title">{isEditingArticle ? 'Chỉnh sửa Bài viết' : 'Thêm Bài viết mới'}</h3></div><form onSubmit={handleArticleFormSubmit} className="admin-card-body space-y-4">
              <input type="text" name="title" placeholder="Tiêu đề" value={articleFormData.title} onChange={handleArticleInputChange} required />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" name="author" placeholder="Tác giả" value={articleFormData.author} onChange={handleArticleInputChange} required />
                <input type="date" name="date" value={articleFormData.date} onChange={handleArticleInputChange} required />
                <select name="category" value={articleFormData.category} onChange={handleArticleInputChange}>{Constants.ARTICLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
              </div>
              <textarea name="summary" placeholder="Tóm tắt" value={articleFormData.summary} onChange={handleArticleInputChange} rows={2} required></textarea>
              <textarea name="content" placeholder="Nội dung (hỗ trợ Markdown)" value={articleFormData.content} onChange={handleArticleInputChange} rows={10} required></textarea>
              <div><label>Ảnh đại diện (URL hoặc tải lên)</label><input type="text" name="imageUrl" placeholder="URL Ảnh" value={articleFormData.imageUrl} onChange={handleArticleInputChange} /><input type="file" onChange={handleArticleImageUpload} accept="image/*" /></div>
              <div className="flex gap-2"><Button type="submit">{isEditingArticle ? 'Cập nhật' : 'Lưu'}</Button><Button type="button" variant="outline" onClick={resetArticleForm}>Hủy</Button></div>
            </form></Card>
          )}
          <Card className="admin-card !shadow-none"><div className="admin-card-body !p-0"><table className="admin-table"><thead><tr><th>Tiêu đề</th><th>Tác giả</th><th>Ngày</th><th></th></tr></thead><tbody>{articles.map(a => <tr key={a.id}><td><div className="flex items-center"><img src={a.imageUrl || ''} className="w-12 h-10 object-cover rounded mr-3"/><span className="font-semibold">{a.title}</span></div></td><td>{a.author}</td><td>{new Date(a.date).toLocaleDateString('vi-VN')}</td><td className="text-right">{hasPermission(['manageArticles']) && <><Button size="sm" variant="ghost" onClick={() => handleEditArticle(a)}><i className="fas fa-edit"></i></Button><Button size="sm" variant="ghost" className="text-danger-text" onClick={() => handleDeleteArticle(a.id)}><i className="fas fa-trash"></i></Button></>}</td></tr>)}</tbody></table></div></Card>
        </div>;

      case 'site_settings':
        if (!hasPermission(['manageSiteSettings'])) return null;
        const toggleSection = (sectionName: string) => setOpenSiteSettingsSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveSiteSettings(); }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cài đặt Trang & Hệ thống</h3>
              <Button type="submit"><i className="fas fa-save mr-2"></i>Lưu Cài đặt</Button>
            </div>
            <Card className="admin-card !shadow-none">
              <div className="admin-card-body">
                <button type="button" className="w-full text-left font-bold text-lg mb-2" onClick={() => toggleSection('general')}>Thông Tin Chung {openSiteSettingsSections.general ? '[-]' : '[+]'}</button>
                {openSiteSettingsSections.general && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                    <InputField label="Tên công ty" name="companyName" value={siteSettingsForm.companyName} onChange={(e:any) => setSiteSettingsForm(prev => ({...prev, companyName: e.target.value}))} />
                    <InputField label="Slogan" name="companySlogan" value={siteSettingsForm.companySlogan} onChange={(e:any) => setSiteSettingsForm(prev => ({...prev, companySlogan: e.target.value}))} />
                    <InputField label="Số điện thoại" name="companyPhone" value={siteSettingsForm.companyPhone} onChange={(e:any) => setSiteSettingsForm(prev => ({...prev, companyPhone: e.target.value}))} />
                    <InputField label="Email" name="companyEmail" value={siteSettingsForm.companyEmail} onChange={(e:any) => setSiteSettingsForm(prev => ({...prev, companyEmail: e.target.value}))} />
                    <div className="md:col-span-2"><InputField label="Địa chỉ" name="companyAddress" value={siteSettingsForm.companyAddress} onChange={(e:any) => setSiteSettingsForm(prev => ({...prev, companyAddress: e.target.value}))} /></div>
                  </div>
                )}
                
                <button type="button" className="w-full text-left font-bold text-lg mt-4 mb-2" onClick={() => toggleSection('homepageBanners')}>Banner Trang Chủ {openSiteSettingsSections.homepageBanners ? '[-]' : '[+]'}</button>
                {openSiteSettingsSections.homepageBanners && siteSettingsForm.homepageBanners && siteSettingsForm.homepageBanners.map((banner, index) => (
                    <div key={banner.id || index} className="p-4 border rounded-lg mb-4 bg-slate-50 relative">
                        <FormSectionTitle>Banner #{index + 1}</FormSectionTitle>
                        <CheckboxField label="Hoạt động" name="isActive" checked={banner.isActive} onChange={e => handleSiteSettingInputChange(e, 'homepageBanners', index)} />
                        <InputField label="Tiêu đề phụ (Pre-title)" name="preTitle" value={banner.preTitle} onChange={e => handleSiteSettingInputChange(e, 'homepageBanners', index)} />
                        <InputField label="Tiêu đề chính" name="title" value={banner.title} onChange={e => handleSiteSettingInputChange(e, 'homepageBanners', index)} />
                        <TextAreaField label="Mô tả (Subtitle)" name="subtitle" value={banner.subtitle} onChange={e => handleSiteSettingInputChange(e, 'homepageBanners', index)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-admin-text-secondary mb-1.5">Ảnh nền (Background Image)</label>
                            <input type="text" name="backgroundImageUrl" value={banner.backgroundImageUrl} onChange={(e) => handleSiteSettingInputChange(e, 'homepageBanners', index)} placeholder="URL ảnh nền" />
                            <input type="file" className="mt-2" onChange={(e) => handleSiteImageUpload(e, 'homepageBanners', 'backgroundImageUrl', index)} />
                            {banner.backgroundImageUrl && <img src={banner.backgroundImageUrl} alt="Preview" className="mt-2 h-24 w-auto rounded" />}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-admin-text-secondary mb-1.5">Ảnh cột phải (Right Column Image)</label>
                            <input type="text" name="rightColumnImageUrl" value={banner.rightColumnImageUrl || ''} onChange={(e) => handleSiteSettingInputChange(e, 'homepageBanners', index)} placeholder="URL ảnh cột phải" />
                            <input type="file" className="mt-2" onChange={(e) => handleSiteImageUpload(e, 'homepageBanners', 'rightColumnImageUrl', index)} />
                            {banner.rightColumnImageUrl && <img src={banner.rightColumnImageUrl} alt="Preview" className="mt-2 h-24 w-auto rounded" />}
                          </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <InputField label="Text nút chính" name="primaryButtonText" value={banner.primaryButtonText} onChange={e => handleSiteSettingInputChange(e, 'homepageBanners', index)} />
                            <InputField label="Link nút chính" name="primaryButtonLink" value={banner.primaryButtonLink} onChange={e => handleSiteSettingInputChange(e, 'homepageBanners', index)} />
                        </div>
                    </div>
                ))}

              </div>
            </Card>
          </form>
        );
      
      case 'theme_settings':
        if (!hasPermission(['manageTheme'])) return null;
        return <Card className="admin-card !shadow-none"><div className="admin-card-header"><h3 className="admin-card-title">Cài đặt Theme màu</h3></div><form onSubmit={(e) => {e.preventDefault(); handleSaveThemeSettings();}} className="admin-card-body grid grid-cols-2 gap-6">
            <div><label>Màu chính (Default)</label><input type="color" name="primaryColorDefault" value={themeSettingsForm.primaryColorDefault} onChange={handleThemeColorChange}/></div>
            <div><label>Màu phụ (Default)</label><input type="color" name="secondaryColorDefault" value={themeSettingsForm.secondaryColorDefault} onChange={handleThemeColorChange}/></div>
            <Button type="submit" className="col-span-2">Lưu Theme</Button>
        </form></Card>;

      default: return <div>Chọn một mục từ menu</div>;
    }
  };

  const renderSidebarItem = (item: MenuItemConfig, isChild = false) => {
    if (!hasPermission(item.permission)) return null;

    const isActive = activeView === item.id;
    const isParentOpen = item.children && openMenus[item.id];
    
    const itemClasses = `w-full flex items-center p-3 my-1 rounded-md transition-colors text-sm ${
        isChild ? 'pl-10' : 'pl-4'
    } ${
        isActive 
        ? 'bg-admin-sidebarActiveBg text-admin-sidebarActiveText font-semibold shadow-inner' 
        : 'text-admin-sidebarText hover:bg-admin-sidebarActiveBg/50 hover:text-admin-sidebarTextHover'
    }`;

    if (item.children) {
        return (
            <div key={item.id}>
                <button className={itemClasses} onClick={() => { setOpenMenus(prev => ({...prev, [item.id]: !prev[item.id]})); setActiveView(item.id as AdminView); }}>
                    <i className={`fas ${item.icon} w-6 text-center mr-3`}></i>
                    <span className="flex-grow text-left">{item.label}</span>
                    <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isParentOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {isParentOpen && (
                    <div className="border-l border-slate-600 ml-6">
                        {item.children.map(child => renderSidebarItem(child, true))}
                    </div>
                )}
            </div>
        );
    }

    return (
      <button key={item.id} className={itemClasses} onClick={() => setActiveView(item.id as AdminView)}>
        <i className={`fas ${item.icon} w-6 text-center mr-3`}></i>
        {item.label}
        {item.count !== undefined && item.count > 0 && <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{item.count}</span>}
      </button>
    );
  };


  return (
    <div className="min-h-screen bg-admin-contentBg">
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
         <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Trang Quản Trị</h2>
             <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-2xl text-slate-400 hover:text-white"><i className="fas fa-times"></i></button>
        </div>
        <nav className="p-2">
            {MENU_CONFIG.map(item => renderSidebarItem(item))}
        </nav>
      </aside>
      <main className="admin-main-content">
        <header className="admin-page-header flex justify-between items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-2xl text-slate-600"><i className="fas fa-bars"></i></button>
            <h1 className="admin-page-title hidden md:block">{MENU_CONFIG.flatMap(m => m.children ? m.children : m).find(m => m.id === activeView)?.label || "Tổng Quan"}</h1>
             <div className="flex items-center gap-4">
                <span className="text-sm text-admin-textSecondary hidden sm:inline">Xin chào, <strong>{currentUser?.username}</strong></span>
                <i className="fas fa-user-circle text-2xl text-admin-textSecondary"></i>
            </div>
        </header>
        <div className="admin-content-area">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;

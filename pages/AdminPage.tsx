
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
  const handleSiteSettingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, section?: keyof SiteSettings, field?: string, index?: number, subField?: string) => { const { name, value, type } = e.target; const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value; setSiteSettingsForm(prev => { const newSettings = JSON.parse(JSON.stringify(prev)); if (section && field && typeof index === 'number' && subField && Array.isArray((newSettings[section] as any)?.[subField])) { const arrayToUpdate = [...(newSettings[section] as any)[subField]]; arrayToUpdate[index] = { ...arrayToUpdate[index], [name]: val }; (newSettings[section] as any)[subField] = arrayToUpdate; } else if (section && field && typeof index === 'number' && Array.isArray((newSettings[section] as any)?.[field])) { const arrayToUpdate = [...(newSettings[section] as any)[field]]; arrayToUpdate[index] = { ...arrayToUpdate[index], [name]: val }; (newSettings[section] as any)[field] = arrayToUpdate; } else if (section && field) { (newSettings[section] as any) = { ...(newSettings[section] as object), [field]: val }; } else { (newSettings as any)[name] = val; } return newSettings; }); };
  const handleSiteImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof SiteSettings | {section: keyof SiteSettings, field: string, index?: number, subField?: string} ) => { if (e.target.files && e.target.files[0]) { try { const dataUrl = await fileToDataUrl(e.target.files[0]); if (typeof fieldName === 'string') { setSiteSettingsForm(prev => ({...prev, [fieldName]: dataUrl})); } else if (typeof fieldName === 'object') { const { section, field, index, subField } = fieldName; setSiteSettingsForm(prev => { const newSettings = JSON.parse(JSON.stringify(prev)); if (typeof index === 'number' && subField && Array.isArray((newSettings[section] as any)?.[subField])) { const arrayToUpdate = [...(newSettings[section] as any)[subField]]; arrayToUpdate[index] = { ...arrayToUpdate[index], [field]: dataUrl }; (newSettings[section] as any)[subField] = arrayToUpdate; } else if (typeof index === 'number' && Array.isArray(newSettings[section])) { const arrayToUpdate = [...(newSettings[section] as any[])]; arrayToUpdate[index] = { ...arrayToUpdate[index], [field]: dataUrl }; (newSettings[section] as any) = arrayToUpdate; } else if (section && field) { (newSettings[section] as any) = { ...(newSettings[section] as object), [field]: dataUrl }; } return newSettings; }); } } catch (error) { notify(`Lỗi tải ảnh lên.`, "error"); } } };
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
        <input type={type} id={`${section}_${field}_${name}_${index}_${subField}`} name={name} value={value || ''} onChange={e => onChange(e, section, field, index, subField)} placeholder={placeholder} required={required} disabled={disabled} />
        {helpText && <p className="form-input-description">{helpText}</p>}
    </div>
  );
  const TextAreaField: React.FC<{label: string, name: string, value: string | undefined, onChange: any, section?: keyof SiteSettings, field?: string, index?: number, subField?: string, rows?: number, required?: boolean, placeholder?: string}> = 
    ({label, name, value, onChange, section, field, index, subField, rows = 3, required = false, placeholder}) => (
    <div className="admin-form-group">
        <label htmlFor={`${section}_${field}_${name}_${index}_${subField}`} className="block text-sm font-medium text-admin-text-secondary mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
        <textarea id={`${section}_${field}_${name}_${index}_${subField}`} name={name} value={value || ''} onChange={e => onChange(e, section, field, index, subField)} rows={rows} required={required} placeholder={placeholder}></textarea>
    </div>
  );
  const SelectField: React.FC<{label: string, name: string, value: string | number | undefined, onChange: any, section?: keyof SiteSettings, field?: string, index?: number, subField?: string, required?: boolean, children: React.ReactNode}> = 
  ({label, name, value, onChange, section, field, index, subField, required = false, children}) => (
    <div className="admin-form-group">
        <label htmlFor={`${section}_${field}_${name}_${index}_${subField}`} className="block text-sm font-medium text-admin-text-secondary mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
        <select id={`${section}_${field}_${name}_${index}_${subField}`} name={name} value={value || ''} onChange={e => onChange(e, section, field, index, subField)} required={required}>
            {children}
        </select>
    </div>
  );
  const CheckboxField: React.FC<{label: string, name: string, checked: boolean | undefined, onChange: any, section?: keyof SiteSettings, field?: string, index?: number, subField?: string}> = 
    ({label, name, checked, onChange, section, field, index, subField}) => ( 
    <div className="admin-form-group-checkbox"> 
        <input type="checkbox" id={`${section}_${field}_${name}_${index}_${subField}`} name={name} checked={checked || false} onChange={e => onChange(e, section, field, index, subField)} /> 
        <label htmlFor={`${section}_${field}_${name}_${index}_${subField}`}>{label}</label> 
    </div> 
  );
  const ImageUploadField: React.FC<{label: string, value: string | undefined, name: string, onUpload: (e: React.ChangeEvent<HTMLInputElement>, fieldName: any) => void, onChange: any, section?: keyof SiteSettings, field?: string, index?: number, subField?: string, required?: boolean}> = 
    ({label, value, name, onUpload, onChange, section, field, index, subField, required = false}) => { 
    const fieldIdentifier = section ? { section, field, index, subField } : name; 
    return ( 
      <div className="admin-form-group"> 
        <label htmlFor={`${section}_${field}_${name}_${index}_${subField}_url`} className="block text-sm font-medium text-admin-text-secondary mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label> 
        <input type="text" id={`${section}_${field}_${name}_${index}_${subField}_url`} name={name} value={value || ''} onChange={e => onChange(e, section, field, index, subField)} className="mb-2" placeholder="https://example.com/image.jpg hoặc tải lên bên dưới" required={required && (!value || !value.startsWith('data:image'))}/> 
        <input type="file" id={`${section}_${field}_${name}_${index}_${subField}_upload`} onChange={(e) => onUpload(e, fieldIdentifier)} accept="image/*" /> 
        {value && value.startsWith('data:image') && <ImageUploadPreview src={value} onRemove={() => onChange({target: {name, value: ''}}, section, field, index, subField)} className="mt-2" />} 
        {value && !value.startsWith('data:image') && value.trim() !== '' && <img src={value} alt="Xem trước" className="mt-2 max-h-24 rounded border border-admin-card-border"/>} 
      </div> 
    );
  };

  const SiteSettingsAccordion: React.FC<{title: string, sectionKey: string, isOpen: boolean, toggleSection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, children: React.ReactNode}> = ({title, sectionKey, isOpen, toggleSection, children}) => ( <div className="mb-3 border border-admin-card-border rounded-lg"> <button onClick={() => toggleSection(prev => ({...prev, [sectionKey]: !prev[sectionKey]}))} className={`w-full flex justify-between items-center p-3 text-left font-semibold text-admin-text-primary rounded-t-lg ${isOpen ? 'bg-slate-200' : 'bg-slate-50 hover:bg-slate-100'}`}> {title} <i className={`fas fa-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i> </button> {isOpen && <div className="p-4 border-t border-admin-card-border bg-admin-card-bg rounded-b-lg">{children}</div>} </div> );

  const AdminSidebar: React.FC<{
    activeView: AdminView;
    onSelectView: (view: AdminView) => void;
    unreadNotificationCount: number;
    currentUser: User | null;
    onToggleSidebar: () => void;
    isSidebarOpenProp: boolean; 
    menuConfig: MenuItemConfig[];
    openMenus: Record<string, boolean>;
    toggleMenu: (menuKey: string) => void;
  }> = ({ activeView, onSelectView, unreadNotificationCount, currentUser, onToggleSidebar, isSidebarOpenProp, menuConfig, openMenus, toggleMenu }) => {
    
    return (
      <aside className={`admin-sidebar scrollbar-hide ${isSidebarOpenProp ? 'open' : ''}`}>
        <div className="admin-sidebar-header flex items-center justify-between">
            <div className="flex items-center">
                <img src={currentUser?.imageUrl || `https://ui-avatars.com/api/?name=${currentUser?.username?.charAt(0) || 'A'}&background=0D8ABC&color=fff&size=48`} alt="User Avatar" className="admin-sidebar-user-avatar" />
                <div>
                    <div className="admin-sidebar-user-name">{currentUser?.username || 'Admin'}</div>
                    <div className="admin-sidebar-user-role">{currentUser?.staffRole || currentUser?.role}</div>
                </div>
            </div>
             <button onClick={onToggleSidebar} className="md:hidden text-admin-sidebar-text hover:text-admin-sidebar-text-hover text-xl">
                <i className="fas fa-times"></i>
            </button>
        </div>
        <nav className="admin-sidebar-nav">
          {menuConfig.map(item => (
            hasPermission(item.permission) && (
              <div key={item.id}>
                <a
                  href="#"
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (item.children && item.children.length > 0) {
                        toggleMenu(item.id.toString());
                        const isChildActive = item.children.some(child => child.id === activeView);
                        if (!isChildActive) {
                             onSelectView(item.id as AdminView); 
                        }
                    } else if (!item.children) { 
                        onSelectView(item.id as AdminView);
                    }
                    if (isSidebarOpenProp && window.innerWidth < 768 && (!item.children || item.children.some(c => c.id === activeView))) onToggleSidebar(); 
                  }}
                  className={`admin-sidebar-nav-item ${activeView === item.id && !item.children ? 'active' : ''} ${(item.children && openMenus[item.id.toString()]) || (item.children && item.children.some(c => c.id === activeView)) ? 'font-semibold text-admin-sidebar-text-hover bg-admin-sidebar-active-bg/50' : ''}`}
                  title={item.label}
                  aria-expanded={item.children ? openMenus[item.id.toString()] : undefined}
                >
                  <i className={`fas ${item.icon} admin-icon`}></i>
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && <span className="admin-badge">{item.count > 9 ? '9+' : item.count}</span>}
                  {item.children && <i className={`fas fa-chevron-down text-xs ml-auto transition-transform ${openMenus[item.id.toString()] ? 'rotate-180' : ''}`}></i>}
                </a>
                {item.children && openMenus[item.id.toString()] && (
                    <div className="admin-sidebar-sub-menu">
                        {item.children.map(child => (
                            hasPermission(child.permission) && (
                                <a
                                    key={child.id}
                                    href="#"
                                    onClick={(e) => { 
                                        e.preventDefault(); 
                                        onSelectView(child.id as AdminView);
                                        if (isSidebarOpenProp && window.innerWidth < 768) onToggleSidebar();
                                    }}
                                    className={`admin-sidebar-nav-item ${activeView === child.id ? 'active' : ''}`}
                                    title={child.label}
                                >
                                   <i className={`fas ${child.icon} admin-icon opacity-70`}></i> <span>{child.label}</span>
                                </a>
                            )
                        ))}
                    </div>
                )}
              </div>
            )
          ))}
        </nav>
      </aside>
    );
  };

  const StatCard: React.FC<{title: string, value: string | number, icon: string, colorClass: string, animationDelay?: string, linkTo?: AdminView }> = ({ title, value, icon, colorClass, animationDelay, linkTo }) => {
    const content = (
        <div className={`admin-card admin-stat-card animate-admin-widget-load ${linkTo ? 'cursor-pointer hover:shadow-lg' : ''}`} style={{animationDelay}} onClick={linkTo ? () => setActiveView(linkTo) : undefined}>
            <div className={`admin-icon-wrapper ${colorClass}`}> <i className={`fas ${icon} text-xl`}></i> </div>
            <div> <div className="admin-stat-card-value">{value}</div> <div className="admin-stat-card-label">{title}</div> </div>
        </div>
    );
    return linkTo ? <div onClick={() => setActiveView(linkTo)}>{content}</div> : content;
  };
  const ChartPlaceholder: React.FC<{title: string, type: 'Bar' | 'Line' | 'Pie', animationDelay?: string}> = ({ title, type, animationDelay }) => (
    <div className="admin-card animate-admin-widget-load" style={{animationDelay}}>
        <div className="admin-card-header"><h3 className="admin-card-title">{title} ({type} Chart)</h3></div>
        <div className="admin-card-body"> <div className="admin-chart-placeholder"> <i className={`fas fa-chart-${type.toLowerCase() === 'pie' ? 'pie' : type.toLowerCase() === 'line' ? 'line' : 'bar'} text-3xl mr-2`}></i> Placeholder </div> </div>
    </div>
  );

  const DashboardView: React.FC = () => {
    const totalProducts = products.length;
    const totalArticles = articles.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => order.status === 'Hoàn thành' ? sum + order.totalAmount : sum, 0);
    const processingOrders = orders.filter(o => o.status === 'Chờ xử lý' || o.status === 'Đang chuẩn bị').length;

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="Tổng Sản Phẩm" value={totalProducts} icon="fa-box" colorClass="bg-admin-accent-blue" animationDelay="0.1s" linkTo="products" />
            <StatCard title="Tổng Bài Viết" value={totalArticles} icon="fa-newspaper" colorClass="bg-admin-accent-teal" animationDelay="0.2s" linkTo="articles"/>
            <StatCard title="Đơn Hàng (Đang Xử Lý)" value={processingOrders} icon="fa-spinner" colorClass="bg-yellow-500" animationDelay="0.3s" linkTo="orders"/>
            <StatCard title="Doanh Thu (Hoàn Thành)" value={`${totalRevenue.toLocaleString()}₫`} icon="fa-dollar-sign" colorClass="bg-green-500" animationDelay="0.4s" linkTo="orders"/>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPlaceholder title="Hoạt Động Truy Cập (Placeholder)" type="Line" animationDelay="0.5s" />
            <ChartPlaceholder title="Phân Bổ Trạng Thái Đơn Hàng (Placeholder)" type="Pie" animationDelay="0.6s" />
        </div>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="admin-card animate-admin-widget-load" style={{animationDelay: "0.7s"}}>
                <div className="admin-card-header"><h3 className="admin-card-title">Sản Phẩm Bán Chạy (Placeholder)</h3></div>
                <div className="admin-card-body">
                    <ul className="list-disc list-inside text-sm text-gray-600">
                        <li>Sản phẩm A - Đã bán: 150</li>
                        <li>Sản phẩm B - Đã bán: 120</li>
                        <li>Sản phẩm C - Đã bán: 95</li>
                    </ul>
                </div>
            </div>
            <div className="admin-card animate-admin-widget-load" style={{animationDelay: "0.8s"}}>
                <div className="admin-card-header"><h3 className="admin-card-title">Cảnh Báo Hệ Thống (Placeholder)</h3></div>
                <div className="admin-card-body">
                    <p className="text-sm text-yellow-600"><i className="fas fa-exclamation-triangle mr-2"></i>Dung lượng ổ đĩa sắp đầy (90%)</p>
                    <p className="text-sm text-gray-600"><i className="fas fa-check-circle mr-2 text-green-500"></i>Backup dữ liệu hoàn tất.</p>
                </div>
            </div>
        </div>
        <div className="admin-card mt-6 animate-admin-widget-load" style={{animationDelay: "0.9s"}}>
            <div className="admin-card-header"><h3 className="admin-card-title">Đơn Hàng Mới Nhất</h3></div>
            <div className="admin-card-body p-0"> <table className="admin-table"> <thead> <tr><th>ID</th><th>Khách Hàng</th><th>Tổng Tiền</th><th>Trạng Thái</th></tr> </thead> <tbody> {orders.slice(0,5).map(order => ( <tr key={order.id}> <td>#{order.id.slice(-6)}</td> <td>{order.customerInfo.fullName}</td> <td>{order.totalAmount.toLocaleString()}₫</td> <td><span className={`px-2 py-0.5 text-xs rounded-full ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' : order.status === 'Đã hủy' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span></td> </tr> ))} </tbody> </table> </div>
        </div>
      </div>
    );
  };
  
  const renderSiteSettings = () => {
    if (!hasPermission(['manageSiteSettings'])) return <p>Không có quyền truy cập.</p>;
    
    const renderArrayManager = (
        sectionKey: keyof SiteSettings, 
        fieldKey: string, 
        itemTemplate: any, 
        itemRenderer: (item: any, index: number) => React.ReactNode,
        sectionTitle: string
    ) => {
        const itemsArray = (siteSettingsForm[sectionKey] as any)?.[fieldKey] || [];
        return (
            <div className="my-4 p-3 border border-gray-300 rounded-md bg-slate-50">
                <h4 className="text-md font-semibold mb-2 text-gray-700">{sectionTitle} ({itemsArray.length})</h4>
                {itemsArray.map((item: any, index: number) => (
                    <div key={item.id || index} className="p-3 mb-2 border border-gray-200 rounded bg-white shadow-sm relative">
                        {itemRenderer(item, index)}
                        <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveItemFromSiteSettingArray(sectionKey, fieldKey, item.id)} className="absolute top-2 right-2 !p-1.5 !text-xs">
                            <i className="fas fa-times"></i> Xóa
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => handleAddItemToSiteSettingArray(sectionKey, fieldKey, itemTemplate)} className="mt-2">
                    <i className="fas fa-plus mr-1"></i> Thêm mục
                </Button>
            </div>
        );
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header"><h2 className="admin-card-title">Cài đặt Trang & Hệ Thống</h2></div>
            <div className="admin-card-body">
                <Button onClick={handleSaveSiteSettings} className="mb-6 bg-admin-accent-blue hover:bg-blue-700 text-white sticky top-2 z-20">Lưu Tất Cả Cài Đặt</Button>
                
                <SiteSettingsAccordion title="Thông tin chung" sectionKey="general" isOpen={openSiteSettingsSections['general']} toggleSection={setOpenSiteSettingsSections}> 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2"> 
                        <InputField label="Tên công ty" name="companyName" value={siteSettingsForm.companyName} onChange={handleSiteSettingInputChange} /> 
                        <InputField label="Khẩu hiệu" name="companySlogan" value={siteSettingsForm.companySlogan} onChange={handleSiteSettingInputChange} /> 
                        <InputField label="Điện thoại" name="companyPhone" value={siteSettingsForm.companyPhone} onChange={handleSiteSettingInputChange} /> 
                        <InputField label="Email" name="companyEmail" value={siteSettingsForm.companyEmail} onChange={handleSiteSettingInputChange} /> 
                    </div> 
                    <TextAreaField label="Địa chỉ" name="companyAddress" value={siteSettingsForm.companyAddress} onChange={handleSiteSettingInputChange} /> 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2"> 
                        <ImageUploadField label="Logo trang web (URL hoặc tải lên)" value={siteSettingsForm.siteLogoUrl} name="siteLogoUrl" onUpload={(e) => handleSiteImageUpload(e, 'siteLogoUrl')} onChange={handleSiteSettingInputChange} /> 
                        <InputField label="Meta Title mặc định" name="defaultMetaTitle" value={siteSettingsForm.defaultMetaTitle} onChange={handleSiteSettingInputChange} /> 
                    </div>
                    <TextAreaField label="Meta Description mặc định" name="defaultMetaDescription" value={siteSettingsForm.defaultMetaDescription} onChange={handleSiteSettingInputChange} /> 
                    <InputField label="Meta Keywords mặc định" name="defaultMetaKeywords" value={siteSettingsForm.defaultMetaKeywords} onChange={handleSiteSettingInputChange} /> 
                </SiteSettingsAccordion>
                
                <SiteSettingsAccordion title="Homepage: Banner" sectionKey="homepageBanners" isOpen={openSiteSettingsSections.homepageBanners} toggleSection={setOpenSiteSettingsSections}>
                    {renderArrayManager('homepageBanners' as any, 'homepageBanners', Constants.INITIAL_SITE_SETTINGS.homepageBanners[0] || {id:'', title:'', order:0, isActive:true}, (item: HomepageBannerSettings, index:number) => (
                      <div className="space-y-3">
                        <InputField label="ID Banner" name="id" value={item.id} onChange={(e: any) => handleSiteSettingInputChange(e, 'homepageBanners' as any, 'homepageBanners', index)} disabled />
                        <InputField label="Tiêu đề chính" name="title" value={item.title} onChange={(e) => handleSiteSettingInputChange(e, 'homepageBanners' as any, 'homepageBanners', index)} />
                        <InputField label="Tiêu đề phụ (Pre-title)" name="preTitle" value={item.preTitle} onChange={(e) => handleSiteSettingInputChange(e, 'homepageBanners' as any, 'homepageBanners', index)} />
                        <TextAreaField label="Mô tả ngắn (Subtitle)" name="subtitle" value={item.subtitle} onChange={(e) => handleSiteSettingInputChange(e, 'homepageBanners' as any, 'homepageBanners', index)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <ImageUploadField label="Ảnh nền" name="backgroundImageUrl" value={item.backgroundImageUrl} onUpload={(e) => handleSiteImageUpload(e, {section: 'homepageBanners' as any, field: 'backgroundImageUrl', index})} onChange={(e) => handleSiteSettingInputChange(e, 'homepageBanners' as any, 'homepageBanners', index)} />
                            <ImageUploadField label="Ảnh cột phải" name="rightColumnImageUrl" value={item.rightColumnImageUrl} onUpload={(e) => handleSiteImageUpload(e, {section: 'homepageBanners' as any, field: 'rightColumnImageUrl', index})} onChange={(e) => handleSiteSettingInputChange(e, 'homepageBanners' as any, 'homepageBanners', index)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <InputField label="Text nút chính" name="primaryButtonText" value={item.primaryButtonText} onChange={(e) => handleSiteSettingInputChange(e, 'homepageBanners' as any, 'homepageBanners', index)} />
                            <InputField label="Link nút chính" name="primaryButtonLink" value={item.primaryButtonLink} onChange={(e) => handleSiteSettingInputChange(e, 'homepageBanners' as any, 'homepageBanners', index)} />
                        </div>
                        <CheckboxField label="Hoạt động" name="isActive" checked={item.isActive} onChange={(e) => handleSiteSettingInputChange(e, 'homepageBanners' as any, 'homepageBanners', index)}/>
                        <InputField label="Thứ tự" name="order" type="number" value={item.order} onChange={(e) => handleSiteSettingInputChange(e, 'homepageBanners' as any, 'homepageBanners', index)} />
                      </div>
                    ), "Quản lý các Banner")}
                </SiteSettingsAccordion>

                <SiteSettingsAccordion title="Homepage: Giới thiệu (About)" sectionKey="homepageAbout" isOpen={openSiteSettingsSections.homepageAbout} toggleSection={setOpenSiteSettingsSections}>
                    <CheckboxField label="Hiển thị mục này" name="enabled" checked={siteSettingsForm.homepageAbout.enabled} onChange={handleSiteSettingInputChange} section="homepageAbout" field="enabled" />
                    <InputField label="Tiêu đề chính" name="title" value={siteSettingsForm.homepageAbout.title} onChange={handleSiteSettingInputChange} section="homepageAbout" field="title" />
                    <InputField label="Tiêu đề phụ (Pre-title)" name="preTitle" value={siteSettingsForm.homepageAbout.preTitle} onChange={handleSiteSettingInputChange} section="homepageAbout" field="preTitle" />
                    <TextAreaField label="Mô tả" name="description" value={siteSettingsForm.homepageAbout.description} onChange={handleSiteSettingInputChange} section="homepageAbout" field="description" rows={5}/>
                    <ImageUploadField label="Ảnh chính" name="imageUrl" value={siteSettingsForm.homepageAbout.imageUrl} onUpload={(e) => handleSiteImageUpload(e, {section: 'homepageAbout', field: 'imageUrl'})} onChange={handleSiteSettingInputChange} section="homepageAbout" field="imageUrl" />
                    {renderArrayManager('homepageAbout', 'features', Constants.INITIAL_SITE_SETTINGS.homepageAbout.features[0] || {id:'', icon:'fas fa-check', title:'', description:'', link:''}, (item, index) => (
                        <div className="space-y-3">
                            <InputField label="Icon (FontAwesome)" name="icon" value={item.icon} onChange={handleSiteSettingInputChange} section="homepageAbout" field="features" index={index} />
                            <InputField label="Tiêu đề Feature" name="title" value={item.title} onChange={handleSiteSettingInputChange} section="homepageAbout" field="features" index={index} />
                            <TextAreaField label="Mô tả Feature" name="description" value={item.description} onChange={handleSiteSettingInputChange} section="homepageAbout" field="features" index={index} rows={2}/>
                            <InputField label="Link Feature (tùy chọn)" name="link" value={item.link} onChange={handleSiteSettingInputChange} section="homepageAbout" field="features" index={index} />
                        </div>
                    ), "Các Điểm Nổi Bật (Features)")}
                    <InputField label="Text nút" name="buttonText" value={siteSettingsForm.homepageAbout.buttonText} onChange={handleSiteSettingInputChange} section="homepageAbout" field="buttonText" />
                    <InputField label="Link nút" name="buttonLink" value={siteSettingsForm.homepageAbout.buttonLink} onChange={handleSiteSettingInputChange} section="homepageAbout" field="buttonLink" />
                </SiteSettingsAccordion>

                <SiteSettingsAccordion title="Homepage: Lợi ích Dịch vụ" sectionKey="homepageServicesBenefits" isOpen={openSiteSettingsSections.homepageServicesBenefits} toggleSection={setOpenSiteSettingsSections}>
                     <CheckboxField label="Hiển thị mục này" name="enabled" checked={siteSettingsForm.homepageServicesBenefits.enabled} onChange={handleSiteSettingInputChange} section="homepageServicesBenefits" field="enabled" />
                     <InputField label="Tiêu đề chính" name="title" value={siteSettingsForm.homepageServicesBenefits.title} onChange={handleSiteSettingInputChange} section="homepageServicesBenefits" field="title" />
                     <InputField label="Tiêu đề phụ (Pre-title)" name="preTitle" value={siteSettingsForm.homepageServicesBenefits.preTitle} onChange={handleSiteSettingInputChange} section="homepageServicesBenefits" field="preTitle" />
                     {renderArrayManager('homepageServicesBenefits', 'benefits', Constants.INITIAL_SITE_SETTINGS.homepageServicesBenefits.benefits[0] || {id:'', iconClass:'fas fa-star', title:'', description:'', link:'', bgImageUrlSeed:'', order:0}, (item, index) => (
                        <div className="space-y-3">
                            <InputField label="Icon (FontAwesome)" name="iconClass" value={item.iconClass} onChange={handleSiteSettingInputChange} section="homepageServicesBenefits" field="benefits" index={index} />
                            <InputField label="Tiêu đề Lợi ích" name="title" value={item.title} onChange={handleSiteSettingInputChange} section="homepageServicesBenefits" field="benefits" index={index} />
                            <TextAreaField label="Mô tả Lợi ích" name="description" value={item.description} onChange={handleSiteSettingInputChange} section="homepageServicesBenefits" field="benefits" index={index} rows={2}/>
                            <InputField label="Link (tùy chọn)" name="link" value={item.link} onChange={handleSiteSettingInputChange} section="homepageServicesBenefits" field="benefits" index={index} />
                            <InputField label="Seed ảnh nền (Picsum)" name="bgImageUrlSeed" value={item.bgImageUrlSeed} onChange={handleSiteSettingInputChange} section="homepageServicesBenefits" field="benefits" index={index} />
                            <InputField label="Thứ tự" name="order" type="number" value={item.order} onChange={handleSiteSettingInputChange} section="homepageServicesBenefits" field="benefits" index={index} />
                        </div>
                    ), "Danh Sách Lợi Ích")}
                </SiteSettingsAccordion>
                
                <SiteSettingsAccordion title="Cài đặt SMTP" sectionKey="smtpSettings" isOpen={openSiteSettingsSections.smtpSettings} toggleSection={setOpenSiteSettingsSections}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        <InputField label="Host" name="host" value={siteSettingsForm.smtpSettings.host} onChange={handleSiteSettingInputChange} section="smtpSettings" field="host"/>
                        <InputField label="Port" name="port" type="number" value={siteSettingsForm.smtpSettings.port} onChange={handleSiteSettingInputChange} section="smtpSettings" field="port"/>
                        <InputField label="User" name="user" value={siteSettingsForm.smtpSettings.user} onChange={handleSiteSettingInputChange} section="smtpSettings" field="user"/>
                        <InputField label="Password" name="pass" type="password" value={siteSettingsForm.smtpSettings.pass} onChange={handleSiteSettingInputChange} section="smtpSettings" field="pass"/>
                    </div>
                    <CheckboxField label="Secure (SSL/TLS)" name="secure" checked={siteSettingsForm.smtpSettings.secure} onChange={handleSiteSettingInputChange} section="smtpSettings" field="secure"/>
                </SiteSettingsAccordion>

                <SiteSettingsAccordion title="Cổng Thanh Toán" sectionKey="paymentGateways" isOpen={openSiteSettingsSections.paymentGateways} toggleSection={setOpenSiteSettingsSections}>
                    <CheckboxField label="Kích hoạt Momo" name="momoEnabled" checked={siteSettingsForm.paymentGateways.momoEnabled} onChange={handleSiteSettingInputChange} section="paymentGateways" field="momoEnabled"/>
                    <CheckboxField label="Kích hoạt VNPay" name="vnPayEnabled" checked={siteSettingsForm.paymentGateways.vnPayEnabled} onChange={handleSiteSettingInputChange} section="paymentGateways" field="vnPayEnabled"/>
                    <CheckboxField label="Kích hoạt PayPal" name="paypalEnabled" checked={siteSettingsForm.paymentGateways.paypalEnabled} onChange={handleSiteSettingInputChange} section="paymentGateways" field="paypalEnabled"/>
                </SiteSettingsAccordion>

                <div className="mt-6">
                    <Button type="button" variant="outline" className="border-gray-400 text-gray-600">Sao Lưu & Phục Hồi Dữ Liệu (Conceptual)</Button>
                </div>
            </div>
        </div>
    );
  };
  
  const renderActiveAdminView = () => {
    const menuItemIsParent = MENU_CONFIG.find(item => item.id === activeView && item.children && item.children.length > 0);
    if (menuItemIsParent) {
        return <div className="admin-card"><div className="admin-card-body"><p className="text-center text-gray-500 py-8">Đang tải mục con...</p></div></div>;
    }

    switch (activeView) {
      case 'dashboard': return hasPermission(['viewDashboard']) ? <DashboardView /> : <p>Không có quyền xem Tổng Quan.</p>;
      case 'products': return ( <div className="admin-card"> <div className="admin-card-header flex justify-between items-center"> <h2 className="admin-card-title">🛒 Quản lý Sản phẩm</h2> {hasPermission(['manageProducts']) && <Button onClick={() => {setShowProductForm(true); setIsEditingProduct(null); setProductFormData(initialProductFormState);}} className="bg-admin-accent-blue hover:bg-blue-700 text-white">Thêm Sản phẩm</Button>} </div> <div className="admin-card-body"> {showProductForm && hasPermission(['manageProducts']) && ( <Card className="mb-6 p-6 bg-slate-50 border border-slate-200"> <h3 className="text-xl font-medium mb-4 text-admin-text-primary">{isEditingProduct ? '📝 Sửa Sản phẩm' : '✨ Thêm Sản phẩm Mới'}</h3> <form onSubmit={handleProductFormSubmit} className="space-y-5"> 
      
      <FormSectionTitle>Thông tin cơ bản</FormSectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        <InputField label="Tên sản phẩm" name="name" value={productFormData.name} onChange={handleProductInputChange} required />
        <InputField label="ID Sản phẩm (SKU)" name="id" value={productFormData.id || 'Sẽ được tạo tự động'} onChange={() => {}} disabled />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        <SelectField label="Danh mục chính" name="mainCategorySlug" value={productFormData.mainCategorySlug} onChange={handleProductInputChange} required > {Constants.PRODUCT_CATEGORIES_HIERARCHY.map(mc => <option key={mc.slug} value={mc.slug}>{mc.name}</option>)} </SelectField>
        <SelectField label="Danh mục phụ" name="subCategorySlug" value={productFormData.subCategorySlug} onChange={handleProductInputChange} required > {(Constants.PRODUCT_CATEGORIES_HIERARCHY.find(mc => mc.slug === productFormData.mainCategorySlug)?.subCategories || []).map(sc => <option key={sc.slug} value={sc.slug}>{sc.name}</option>)} </SelectField>
      </div>
      <TextAreaField label="Mô tả ngắn sản phẩm" name="shortDescription" value={productFormData.shortDescription} onChange={handleProductInputChange} rows={3}/>
      <TextAreaField label="Mô tả chi tiết sản phẩm" name="description" value={productFormData.description} onChange={handleProductInputChange} rows={6}/>

      <FormSectionTitle>Giá & Kho hàng</FormSectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        <InputField label="Giá bán / Giá khuyến mãi (VNĐ)" name="price" type="number" value={productFormData.price} onChange={handleProductInputChange} required />
        <InputField label="Giá gốc (VNĐ)" name="originalPrice" type="number" value={productFormData.originalPrice || ''} onChange={handleProductInputChange} placeholder="Bỏ trống nếu không giảm giá" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        <InputField label="Số lượng trong kho" name="stock" type="number" value={productFormData.stock} onChange={handleProductInputChange} required />
        <SelectField label="Tình trạng sản phẩm" name="status" value={productFormData.status} onChange={handleProductInputChange} > <option value="Mới">Mới</option><option value="Cũ">Cũ</option><option value="Like new">Like new</option> </SelectField>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        <InputField label="Hãng sản xuất" name="brand" value={productFormData.brand} onChange={handleProductInputChange} />
        <InputField label="Tags (VD: Mới, Hot, Gaming)" name="tagsString" value={productFormData.tagsString} onChange={handleProductInputChange} placeholder="Phân cách bằng dấu phẩy" />
      </div>
      <CheckboxField label="Hiển thị sản phẩm" name="isVisible" checked={productFormData.isVisible} onChange={handleProductInputChange} />
      
      <FormSectionTitle>Hình ảnh</FormSectionTitle>
      <div className="admin-form-group"> <label className="block text-sm font-medium text-admin-text-secondary mb-1.5">Ảnh đại diện & Bộ sưu tập ảnh (Ảnh đầu tiên là ảnh đại diện)</label> {productFormData.imageUrlsData.map((url, index) => ( <div key={index} className="flex items-center mb-2"> <input type="text" value={url} onChange={(e) => handleProductImageUrlChange(index, e.target.value)} placeholder="https://example.com/image.jpg" className="flex-grow mr-2 !p-2.5 !text-sm" /> <Button type="button" variant="danger" size="sm" onClick={() => removeProductImageUrlField(index)}><i className="fas fa-times"></i></Button> </div> ))} 
      <div className="flex items-center mt-2">
        <Button type="button" variant="outline" size="sm" onClick={addProductImageUrlField} className="mr-3">Thêm URL Ảnh</Button> 
        <label htmlFor="productImageFiles" className="text-sm font-medium text-admin-text-secondary mr-2">Hoặc tải lên:</label> 
        <input type="file" id="productImageFiles" multiple onChange={handleProductImageFileChange} accept="image/*" className="!p-0"/> 
      </div>
      <div className="flex flex-wrap gap-2 mt-2"> {productFormData.imageUrlsData.filter(url => url.startsWith('data:image')).map((dataUrl, index) => ( <ImageUploadPreview key={`preview-${index}`} src={dataUrl} onRemove={() => removeProductImageUrlField(productFormData.imageUrlsData.findIndex(u => u === dataUrl))} /> ))} </div> </div>
      
      <FormSectionTitle>Thông số & SEO</FormSectionTitle>
      <TextAreaField label="Thông số kỹ thuật (JSON)" name="specifications" value={productFormData.specifications} onChange={handleProductInputChange} rows={5} placeholder='{ "CPU": "Intel Core i5", "RAM": "16GB" }'/>
      <InputField label="Đường dẫn tùy chỉnh (slug)" name="slug" value={productFormData.slug} onChange={handleProductInputChange} placeholder="vi-du-san-pham-moi" helpText="Nếu bỏ trống, sẽ tự tạo từ tên sản phẩm." />
      <InputField label="SEO Meta Title" name="seoMetaTitle" value={productFormData.seoMetaTitle} onChange={handleProductInputChange} />
      <TextAreaField label="SEO Meta Description" name="seoMetaDescription" value={productFormData.seoMetaDescription} onChange={handleProductInputChange} rows={3}/>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-admin-card-border"> <Button type="button" variant="outline" onClick={resetProductForm}>Hủy Bỏ</Button> <Button type="submit" variant="primary" className="font-semibold">{isEditingProduct ? 'Lưu Sản Phẩm' : 'Lưu & Thêm Mới'}</Button> </div> </form> </Card> )} <div className="overflow-x-auto"> <table className="admin-table"> <thead> <tr><th>Ảnh</th><th>Tên</th><th>Giá bán</th><th>Kho</th><th>Hiển thị</th>{hasPermission(['manageProducts']) && <th>Hành động</th>}</tr> </thead> <tbody> {products.map(product => ( <tr key={product.id}> <td className="py-2 px-3"><img src={(product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://via.placeholder.com/50')} alt={product.name} className="w-10 h-10 object-cover rounded"/></td> <td>{product.name}</td><td>{product.price.toLocaleString()}₫</td><td>{product.stock}</td><td>{product.isVisible !== false ? '✔️' : '❌'}</td> {hasPermission(['manageProducts']) && (<td><Button size="sm" variant="ghost" onClick={() => handleEditProduct(product)} className="mr-2 !text-admin-accent-blue hover:!text-blue-700">Sửa</Button><Button size="sm" variant="ghost" onClick={() => handleDeleteProduct(product.id)} className="!text-red-600 hover:!text-red-800">Xóa</Button></td>)} </tr> ))} </tbody> </table> </div> </div> </div> );
      case 'articles': return ( <div className="admin-card"> <div className="admin-card-header flex justify-between items-center"><h2 className="admin-card-title">Quản lý Bài viết</h2>{hasPermission(['manageArticles']) && <Button onClick={() => {setShowArticleForm(true); setIsEditingArticle(null); setArticleFormData(initialArticleFormState);}} className="bg-admin-accent-blue hover:bg-blue-700 text-white">Thêm Bài viết</Button>}</div> <div className="admin-card-body"> {showArticleForm && hasPermission(['manageArticles']) && ( <Card className="mb-6 p-6 bg-slate-50 border border-slate-200"> <h3 className="text-xl font-medium mb-4 text-admin-text-primary">{isEditingArticle ? 'Sửa Bài viết' : 'Thêm Bài viết Mới'}</h3> <form onSubmit={handleArticleFormSubmit} className="space-y-5"> <InputField label="Tiêu đề" name="title" value={articleFormData.title} onChange={handleArticleInputChange} required/> <TextAreaField label="Tóm tắt" name="summary" value={articleFormData.summary} onChange={handleArticleInputChange} required/> <ImageUploadField label="Ảnh bìa" name="imageUrl" value={articleFormData.imageUrl} onUpload={handleArticleImageUpload} onChange={handleArticleInputChange} /> <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1"><InputField label="Tác giả" name="author" value={articleFormData.author} onChange={handleArticleInputChange} required/><InputField label="Ngày đăng" name="date" type="date" value={articleFormData.date} onChange={handleArticleInputChange} required/><SelectField label="Chuyên mục" name="category" value={articleFormData.category} onChange={handleArticleInputChange} required>{Constants.ARTICLE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</SelectField></div> <TextAreaField label="Nội dung (Markdown)" name="content" value={articleFormData.content} onChange={handleArticleInputChange} rows={10} required/> <div className="flex justify-end space-x-3 pt-3 border-t border-admin-card-border"> <Button type="button" variant="outline" onClick={resetArticleForm}>Hủy</Button> <Button type="submit" className="bg-admin-accent-blue hover:bg-blue-700">{isEditingArticle ? 'Lưu' : 'Thêm'}</Button> </div> </form> </Card> )} <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Tiêu đề</th><th>Chuyên mục</th><th>Ngày</th>{hasPermission(['manageArticles']) && <th>Hành động</th>}</tr></thead><tbody>{articles.map(article => (<tr key={article.id}><td>{article.title}</td><td>{article.category}</td><td>{new Date(article.date).toLocaleDateString()}</td>{hasPermission(['manageArticles']) && <td><Button size="sm" variant="ghost" onClick={() => handleEditArticle(article)} className="mr-2 !text-admin-accent-blue hover:!text-blue-700">Sửa</Button><Button size="sm" variant="ghost" onClick={() => handleDeleteArticle(article.id)} className="!text-red-600 hover:!text-red-800">Xóa</Button></td>}</tr>))}</tbody></table></div> </div> </div> );
      case 'media_library':
            if (!hasPermission(['manageSiteSettings'])) return <p>Không có quyền.</p>;
            return (
                <div className="admin-card">
                    <div className="admin-card-header flex justify-between items-center">
                        <h2 className="admin-card-title">Thư Viện Media</h2>
                        <div className="admin-form-group !mb-0"><label htmlFor="mediaUpload" className="bg-admin-accent-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md cursor-pointer text-sm">Tải Lên Ảnh Mới</label><input type="file" id="mediaUpload" onChange={handleMediaFileUpload} accept="image/*" className="hidden" /></div>
                    </div>
                    <div className="admin-card-body">
                        {siteMedia.length === 0 ? <p>Chưa có ảnh nào trong thư viện.</p> : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {siteMedia.map(item => (
                                    <div key={item.id} className="group relative border border-admin-card-border rounded-md overflow-hidden aspect-square">
                                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex flex-col items-center justify-center p-2">
                                            <p className="text-xs text-white opacity-0 group-hover:opacity-100 truncate w-full text-center mb-1">{item.name}</p>
                                            <Button size="sm" variant="ghost" onClick={() => copyMediaUrl(item.url)} className="!text-white !text-xs opacity-0 group-hover:opacity-100 !mb-1"><i className="fas fa-copy mr-1"></i> Sao chép URL</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDeleteMediaItem(item.id)} className="!text-xs opacity-0 group-hover:opacity-100"><i className="fas fa-trash mr-1"></i> Xóa</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );

      case 'site_settings': return renderSiteSettings();
      case 'faqs': return ( <div className="admin-card"> <div className="admin-card-header flex justify-between items-center"> <h2 className="admin-card-title">Quản lý FAQs</h2> {hasPermission(['manageFaqs']) && <Button onClick={() => {setShowFaqForm(true); setIsEditingFaq(null); setFaqFormData(initialFaqFormState);}} className="bg-admin-accent-blue hover:bg-blue-700 text-white">Thêm FAQ</Button>} </div> <div className="admin-card-body"> {showFaqForm && hasPermission(['manageFaqs']) && ( <Card className="mb-6 p-6 bg-slate-50 border border-slate-200"> <h3 className="text-xl font-medium mb-4 text-admin-text-primary">{isEditingFaq ? 'Sửa FAQ' : 'Thêm FAQ Mới'}</h3> <form onSubmit={handleFaqFormSubmit} className="space-y-5"> <InputField label="Câu hỏi" name="question" value={faqFormData.question} onChange={handleFaqInputChange} required /> <TextAreaField label="Câu trả lời (Markdown)" name="answer" value={faqFormData.answer} onChange={handleFaqInputChange} rows={5} required /> <InputField label="Chuyên mục (tùy chọn)" name="category" value={faqFormData.category} onChange={handleFaqInputChange} /> <CheckboxField label="Hiển thị công khai" name="isVisible" checked={faqFormData.isVisible} onChange={handleFaqInputChange} /> <div className="flex justify-end space-x-3 pt-3 border-t border-admin-card-border"> <Button type="button" variant="outline" onClick={resetFaqForm}>Hủy</Button> <Button type="submit" className="bg-admin-accent-blue hover:bg-blue-700">{isEditingFaq ? 'Lưu' : 'Thêm'}</Button> </div> </form> </Card> )} <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Câu hỏi</th><th>Chuyên mục</th><th>Hiển thị</th>{hasPermission(['manageFaqs']) && <th>Hành động</th>}</tr></thead><tbody>{faqs.map(faq => (<tr key={faq.id}><td>{faq.question}</td><td>{faq.category}</td><td>{faq.isVisible ? 'Có' : 'Không'}</td>{hasPermission(['manageFaqs']) && <td><Button size="sm" variant="ghost" onClick={() => handleEditFaq(faq)} className="mr-2 !text-admin-accent-blue hover:!text-blue-700">Sửa</Button><Button size="sm" variant="ghost" onClick={() => handleDeleteFaq(faq.id)} className="!text-red-600 hover:!text-red-800">Xóa</Button></td>}</tr>))}</tbody></table></div> </div> </div> );
      case 'staff': return ( <div className="admin-card"> <div className="admin-card-header flex justify-between items-center"> <h2 className="admin-card-title">Quản lý Nhân Viên</h2> {hasPermission(['manageStaff']) && <Button onClick={() => { setShowStaffForm(true); setIsEditingStaff(null); setStaffFormData(initialStaffFormState); }} className="bg-admin-accent-blue hover:bg-blue-700 text-white">Thêm Nhân Viên</Button>} </div> <div className="admin-card-body"> <p className="text-sm text-gray-600 mb-4">Tổng số nhân viên: {staffUsers.length}</p> {showStaffForm && hasPermission(['manageStaff']) && ( <Card className="mb-6 p-6 bg-slate-50 border border-slate-200"> <h3 className="text-xl font-medium mb-4 text-admin-text-primary">{isEditingStaff ? 'Sửa Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới'}</h3> <form onSubmit={handleStaffFormSubmit} className="space-y-5"> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1"> <InputField label="Tên đăng nhập" name="username" value={staffFormData.username} onChange={handleStaffInputChange} required /> <InputField label="Email" name="email" type="email" value={staffFormData.email} onChange={handleStaffInputChange} required /> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1"> <InputField label="Mật khẩu" name="password" type="password" value={staffFormData.password || ''} onChange={handleStaffInputChange} placeholder={isEditingStaff ? "Để trống nếu không đổi" : "Bắt buộc"} required={!isEditingStaff} /> <SelectField label="Vai trò nhân viên" name="staffRole" value={staffFormData.staffRole} onChange={handleStaffInputChange} > {Constants.STAFF_ROLE_OPTIONS_CONST.map(role => <option key={role} value={role}>{role}</option>)} </SelectField> </div> <CheckboxField label="Khóa tài khoản" name="isLocked" checked={staffFormData.isLocked} onChange={handleStaffInputChange}/> <div className="flex justify-end space-x-3 pt-3 border-t border-admin-card-border"> <Button type="button" variant="outline" onClick={resetStaffForm}>Hủy</Button> <Button type="submit" className="bg-admin-accent-blue hover:bg-blue-700">{isEditingStaff ? 'Lưu Thay Đổi' : 'Thêm Nhân Viên'}</Button> </div> </form> </Card> )} <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th>{hasPermission(['manageStaff']) && <th>Hành động</th>}</tr></thead><tbody>{staffUsers.map(user => (<tr key={user.id}><td>{user.username}</td><td>{user.email}</td><td>{user.staffRole || user.role}</td><td>{user.isLocked ? <span className="text-red-500 font-semibold">Đã khóa</span> : <span className="text-green-500">Hoạt động</span>}</td>{hasPermission(['manageStaff']) && (<td><Button size="sm" variant="ghost" onClick={() => handleEditStaff(user)} className="mr-1 !text-admin-accent-blue hover:!text-blue-700">Sửa</Button><Button size="sm" variant="ghost" onClick={() => handleToggleUserLock(user.id, user.isLocked)} className={`mr-1 !text-xs ${user.isLocked ? '!text-green-600' : '!text-yellow-600'}`}>{user.isLocked ? 'Mở khóa' : 'Khóa'}</Button>{user.email !== currentUser?.email && <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user.id, 'staff')} className="!text-red-600 hover:!text-red-800">Xóa</Button>}</td>)}</tr>))}</tbody></table></div> </div> </div> );
       case 'customers': return ( <div className="admin-card"> <div className="admin-card-header"><h2 className="admin-card-title">Quản lý Khách Hàng</h2></div> <div className="admin-card-body"> <p className="text-sm text-gray-600 mb-4">Tổng số khách hàng: {customerUsers.length}</p> {hasPermission(['viewCustomers']) ? ( <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Tên</th><th>Email</th><th>Trạng thái</th>{hasPermission(['manageStaff']) && <th>Hành động</th>}</tr></thead><tbody>{customerUsers.map(user => (<tr key={user.id}><td>{user.username}</td><td>{user.email}</td><td>{user.isLocked ? <span className="text-red-500 font-semibold">Đã khóa</span> : <span className="text-green-500">Hoạt động</span>}</td>{hasPermission(['manageStaff']) && (<td><Button size="sm" variant="ghost" onClick={() => handleToggleUserLock(user.id, user.isLocked)} className={`mr-1 !text-xs ${user.isLocked ? '!text-green-600' : '!text-yellow-600'}`}>{user.isLocked ? 'Mở khóa' : 'Khóa'}</Button><Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user.id, 'customer')} className="!text-red-600 hover:!text-red-800">Xóa</Button></td>)}</tr>))}</tbody></table></div> ) : <p>Không có quyền xem danh sách khách hàng.</p>} </div> </div> );
        case 'orders':
            if (!hasPermission(['viewOrders'])) return <p>Không có quyền xem Đơn hàng.</p>;
            const filteredOrders = orders.filter(order => 
                (orderFilters.status ? order.status === orderFilters.status : true) &&
                (orderFilters.customerName ? order.customerInfo.fullName.toLowerCase().includes(orderFilters.customerName.toLowerCase()) : true) &&
                (orderFilters.dateFrom ? new Date(order.orderDate) >= new Date(orderFilters.dateFrom) : true) &&
                (orderFilters.dateTo ? new Date(order.orderDate) <= new Date(orderFilters.dateTo) : true)
            );
            return (
                <div className="admin-card">
                    <div className="admin-card-header"><h2 className="admin-card-title">Quản lý Đơn hàng ({filteredOrders.length})</h2></div>
                    <div className="admin-card-body">
                        <div className="mb-6 p-4 border rounded-md bg-slate-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 items-end">
                            <InputField label="Tên khách hàng" name="customerName" value={orderFilters.customerName} onChange={handleOrderFilterChange}/>
                            <SelectField label="Trạng thái" name="status" value={orderFilters.status} onChange={handleOrderFilterChange}><option value="">Tất cả</option>{Constants.ORDER_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</SelectField>
                            <InputField label="Từ ngày" name="dateFrom" type="date" value={orderFilters.dateFrom} onChange={handleOrderFilterChange}/>
                            <InputField label="Đến ngày" name="dateTo" type="date" value={orderFilters.dateTo} onChange={handleOrderFilterChange}/>
                        </div>
                        <div className="flex space-x-2 mb-4">
                             <Button variant="outline" size="sm" onClick={() => alert("Chức năng xuất Excel/PDF đang được phát triển.")}>Xuất Excel/PDF</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="admin-table">
                                <thead><tr><th>ID</th><th>Khách Hàng</th><th>Ngày Đặt</th><th>Tổng Tiền</th><th>Trạng Thái</th><th>Vận Chuyển</th><th>Hành Động</th></tr></thead>
                                <tbody>
                                    {filteredOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>#{order.id.slice(-6)}</td>
                                            <td>{order.customerInfo.fullName}</td>
                                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                            <td>{order.totalAmount.toLocaleString()}₫</td>
                                            <td>
                                                {hasPermission(['manageOrders']) ? (
                                                    <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)} className="!p-1.5 !text-xs !rounded-md">
                                                        {Constants.ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                                                    </select>
                                                ) : (
                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' : order.status === 'Đã hủy' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                                                )}
                                            </td>
                                            <td>{order.shippingInfo?.carrier || 'N/A'} - {order.shippingInfo?.trackingNumber || 'N/A'}</td>
                                            <td>
                                                <Button size="sm" variant="ghost" onClick={() => setViewingOrder(order)} className="!text-admin-accent-blue hover:!text-blue-700 mr-1">Xem</Button>
                                                {hasPermission(['manageOrders']) && <Button size="sm" variant="ghost" onClick={() => {setEditingOrderShipping(order); setViewingOrder(order);}} className="!text-purple-600 hover:!text-purple-800 text-xs">Vận chuyển</Button>}
                                                {hasPermission(['manageOrders']) && <Button size="sm" variant="ghost" onClick={() => alert("Chức năng tạo hóa đơn đang được phát triển.")} className="!text-green-600 hover:!text-green-800 text-xs">Hóa đơn</Button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {viewingOrder && (
                             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
                                <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                    <div className="admin-card-header flex justify-between items-center"> <h3 className="admin-card-title">Chi tiết Đơn hàng #{viewingOrder.id.slice(-6)}</h3> <Button variant="ghost" size="sm" onClick={() => {setViewingOrder(null); setEditingOrderShipping(null);}} className="!text-gray-500 hover:!text-gray-700">&times;</Button> </div>
                                    <div className="admin-card-body">
                                        {editingOrderShipping && editingOrderShipping.id === viewingOrder.id ? (
                                            <form onSubmit={(e) => {e.preventDefault(); handleSaveOrderShippingInfo();}} className="space-y-4">
                                                <InputField label="Đơn vị vận chuyển" name="carrier" value={editingOrderShipping.shippingInfo?.carrier} onChange={(e:any) => setEditingOrderShipping(prev => prev ? {...prev, shippingInfo: {...prev.shippingInfo, carrier: e.target.value}} : null)}/>
                                                <InputField label="Mã vận đơn" name="trackingNumber" value={editingOrderShipping.shippingInfo?.trackingNumber} onChange={(e:any) => setEditingOrderShipping(prev => prev ? {...prev, shippingInfo: {...prev.shippingInfo, trackingNumber: e.target.value}} : null)}/>
                                                <SelectField label="Trạng thái vận chuyển" name="shippingStatus" value={editingOrderShipping.shippingInfo?.shippingStatus} onChange={(e:any) => setEditingOrderShipping(prev => prev ? {...prev, shippingInfo: {...prev.shippingInfo, shippingStatus: e.target.value}} : null)}><option value="Chưa giao">Chưa giao</option><option value="Đang lấy hàng">Đang lấy hàng</option><option value="Đang giao">Đang giao</option><option value="Đã giao">Đã giao</option><option value="Gặp sự cố">Gặp sự cố</option></SelectField>
                                                <Button type="submit">Lưu thông tin vận chuyển</Button>
                                            </form>
                                        ) : (
                                            <> <p><strong>Khách hàng:</strong> {viewingOrder.customerInfo.fullName}</p> <p><strong>Vận chuyển:</strong> {viewingOrder.shippingInfo?.carrier || 'N/A'} - {viewingOrder.shippingInfo?.trackingNumber || 'N/A'} ({viewingOrder.shippingInfo?.shippingStatus || 'Chưa cập nhật'})</p> <h4 className="font-semibold mt-3 mb-1">Các sản phẩm:</h4> <ul className="list-disc list-inside text-sm"> {viewingOrder.items.map(item => ( <li key={item.productId}>{item.productName} (x{item.quantity}) - {item.price.toLocaleString()}₫</li> ))} </ul> <p className="font-bold mt-2">Tổng cộng: {viewingOrder.totalAmount.toLocaleString()}₫</p> </>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'chat_logs':
            if (!hasPermission(['viewOrders'])) return <p>Không có quyền xem Lịch sử Chat.</p>; 
            return (
                <div className="admin-card">
                    <div className="admin-card-header"><h2 className="admin-card-title">Lịch sử Chat ({chatLogs.length})</h2></div>
                    <div className="admin-card-body">
                        {chatLogs.length === 0 ? <p>Chưa có lịch sử chat nào.</p> : (
                            <div className="overflow-x-auto">
                                <table className="admin-table">
                                    <thead><tr><th>Người dùng</th><th>SĐT</th><th>Thời gian</th><th>Hành động</th></tr></thead>
                                    <tbody>
                                        {chatLogs.map(log => (
                                            <tr key={log.id}>
                                                <td>{log.userName}</td>
                                                <td>{log.userPhone}</td>
                                                <td>{new Date(log.startTime).toLocaleString()}</td>
                                                <td>
                                                    <Button size="sm" variant="ghost" onClick={() => setViewingChatLog(log)} className="!text-admin-accent-blue hover:!text-blue-700 mr-1">Xem</Button>
                                                    <Button size="sm" variant="danger" onClick={() => handleDeleteChatLog(log.id)} className="text-xs">Xóa</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {viewingChatLog && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
                                <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
                                    <div className="admin-card-header flex justify-between items-center">
                                        <h3 className="admin-card-title">Chat với {viewingChatLog.userName} ({viewingChatLog.userPhone})</h3>
                                        <Button variant="ghost" size="sm" onClick={() => setViewingChatLog(null)} className="!text-gray-500 hover:!text-gray-700">&times;</Button>
                                    </div>
                                    <div className="admin-card-body flex-grow overflow-y-auto p-4 bg-bgCanvas">
                                        {viewingChatLog.messages.map(msg => (
                                            <ChatMessageComponent key={msg.id} message={msg} />
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'discounts': if (!hasPermission(['manageDiscounts'])) return <p>Không có quyền.</p>; return ( <div className="admin-card"> <div className="admin-card-header flex justify-between items-center"> <h2 className="admin-card-title">Quản lý Mã Giảm Giá</h2> <Button onClick={() => {setShowDiscountForm(true); setIsEditingDiscount(null); setDiscountFormData(initialDiscountFormState);}} className="bg-admin-accent-blue hover:bg-blue-700 text-white">Thêm Mã</Button> </div> <div className="admin-card-body"> {showDiscountForm && ( <Card className="mb-6 p-6 bg-slate-50 border border-slate-200"> <h3 className="text-xl font-medium mb-4">{isEditingDiscount ? 'Sửa Mã Giảm Giá' : 'Thêm Mã Mới'}</h3> <form onSubmit={handleDiscountFormSubmit} className="space-y-4"> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1"> <InputField label="Mã code" name="code" value={discountFormData.code} onChange={handleDiscountInputChange} required /> <SelectField label="Loại" name="type" value={discountFormData.type} onChange={handleDiscountInputChange}><option value="percentage">Phần trăm</option><option value="fixed_amount">Số tiền cố định</option></SelectField> </div> <InputField label="Giá trị" name="value" type="number" value={discountFormData.value} onChange={handleDiscountInputChange} required /> <TextAreaField label="Mô tả (tùy chọn)" name="description" value={discountFormData.description} onChange={handleDiscountInputChange} rows={2}/> <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1"> <InputField label="Ngày hết hạn (tùy chọn)" name="expiryDate" type="date" value={discountFormData.expiryDate} onChange={handleDiscountInputChange} /> <InputField label="Chi tiêu tối thiểu (tùy chọn)" name="minSpend" type="number" value={discountFormData.minSpend} onChange={handleDiscountInputChange} /> </div> <InputField label="Giới hạn sử dụng (0=không giới hạn)" name="usageLimit" type="number" value={discountFormData.usageLimit} onChange={handleDiscountInputChange} /> <CheckboxField label="Kích hoạt" name="isActive" checked={discountFormData.isActive} onChange={handleDiscountInputChange}/> <div className="flex justify-end space-x-3 pt-3 border-t border-admin-card-border"> <Button type="button" variant="outline" onClick={resetDiscountForm}>Hủy</Button> <Button type="submit" className="bg-admin-accent-blue hover:bg-blue-700">{isEditingDiscount ? 'Lưu' : 'Thêm'}</Button> </div> </form> </Card> )} <div className="overflow-x-auto"> <table className="admin-table"> <thead><tr><th>Code</th><th>Loại</th><th>Giá trị</th><th>Hết hạn</th><th>Kích hoạt</th><th>Đã dùng</th><th>Hành động</th></tr></thead> <tbody> {discounts.map(d => ( <tr key={d.id}> <td>{d.code}</td><td>{d.type === 'percentage' ? 'Phần trăm' : 'Cố định'}</td><td>{d.type === 'percentage' ? `${d.value}%` : `${d.value.toLocaleString()}₫`}</td><td>{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : 'N/A'}</td><td>{d.isActive ? 'Có' : 'Không'}</td><td>{d.timesUsed || 0}/{d.usageLimit || '∞'}</td> <td><Button size="sm" variant="ghost" onClick={() => handleEditDiscount(d)} className="mr-2 !text-admin-accent-blue hover:!text-blue-700">Sửa</Button><Button size="sm" variant="ghost" onClick={() => handleDeleteDiscount(d.id)} className="!text-red-600 hover:!text-red-800">Xóa</Button></td> </tr> ))} </tbody> </table> </div> </div> </div> );
        case 'theme_settings': if (!hasPermission(['manageTheme'])) return <p>Không có quyền.</p>; return ( <div className="admin-card"> <div className="admin-card-header"><h2 className="admin-card-title">Cài đặt Theme Màu</h2></div> <div className="admin-card-body"> <form onSubmit={(e) => { e.preventDefault(); handleSaveThemeSettings(); }} className="space-y-5 max-w-lg"> <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3"> <div> <InputField label="Màu Chính (Mặc định)" name="primaryColorDefault" type="color" value={themeSettingsForm.primaryColorDefault} onChange={handleThemeColorChange} /> <div style={{backgroundColor: themeSettingsForm.primaryColorDefault}} className="w-full h-10 mt-1 rounded border border-gray-300"></div> </div> <div> <InputField label="Màu Chính (Sáng)" name="primaryColorLight" type="color" value={themeSettingsForm.primaryColorLight} onChange={handleThemeColorChange} /> <div style={{backgroundColor: themeSettingsForm.primaryColorLight}} className="w-full h-10 mt-1 rounded border border-gray-300"></div> </div> <div> <InputField label="Màu Chính (Tối)" name="primaryColorDark" type="color" value={themeSettingsForm.primaryColorDark} onChange={handleThemeColorChange} /> <div style={{backgroundColor: themeSettingsForm.primaryColorDark}} className="w-full h-10 mt-1 rounded border border-gray-300"></div> </div> <div> <InputField label="Màu Phụ (Mặc định)" name="secondaryColorDefault" type="color" value={themeSettingsForm.secondaryColorDefault} onChange={handleThemeColorChange} /> <div style={{backgroundColor: themeSettingsForm.secondaryColorDefault}} className="w-full h-10 mt-1 rounded border border-gray-300"></div> </div> <div> <InputField label="Màu Phụ (Sáng)" name="secondaryColorLight" type="color" value={themeSettingsForm.secondaryColorLight} onChange={handleThemeColorChange} /> <div style={{backgroundColor: themeSettingsForm.secondaryColorLight}} className="w-full h-10 mt-1 rounded border border-gray-300"></div> </div> <div> <InputField label="Màu Phụ (Tối)" name="secondaryColorDark" type="color" value={themeSettingsForm.secondaryColorDark} onChange={handleThemeColorChange} /> <div style={{backgroundColor: themeSettingsForm.secondaryColorDark}} className="w-full h-10 mt-1 rounded border border-gray-300"></div> </div> </div> <Button type="submit" className="bg-admin-accent-blue hover:bg-blue-700">Lưu Theme</Button> </form> </div> </div> );
        case 'menu_settings': if (!hasPermission(['manageMenu'])) return <p>Không có quyền.</p>; return ( <div className="admin-card"> <div className="admin-card-header flex justify-between items-center"> <h2 className="admin-card-title">Quản lý Menu Điều Hướng</h2> <Button onClick={() => {setShowMenuForm(true); setEditingMenuLink(null); setMenuLinkFormData(initialMenuLinkFormState);}} className="bg-admin-accent-blue hover:bg-blue-700 text-white">Thêm Link Menu</Button> </div> <div className="admin-card-body"> {showMenuForm && ( <Card className="mb-6 p-6 bg-slate-50 border border-slate-200"> <h3 className="text-xl font-medium mb-4">{editingMenuLink ? 'Sửa Link Menu' : 'Thêm Link Menu Mới'}</h3> <form onSubmit={handleMenuLinkFormSubmit} className="space-y-4"> <InputField label="Nhãn hiển thị" name="label" value={menuLinkFormData.label} onChange={handleMenuLinkInputChange} required /> <InputField label="Đường dẫn (VD: /shop)" name="path" value={menuLinkFormData.path} onChange={handleMenuLinkInputChange} required /> <InputField label="Thứ tự hiển thị" name="order" type="number" value={menuLinkFormData.order} onChange={handleMenuLinkInputChange} required /> <InputField label="Icon (Font Awesome class, VD: fas fa-home)" name="icon" value={menuLinkFormData.icon} onChange={handleMenuLinkInputChange} /> <CheckboxField label="Hiển thị" name="isVisible" checked={menuLinkFormData.isVisible} onChange={handleMenuLinkInputChange}/> <div className="flex justify-end space-x-3 pt-3 border-t border-admin-card-border"> <Button type="button" variant="outline" onClick={resetMenuLinkForm}>Hủy</Button> <Button type="submit" className="bg-admin-accent-blue hover:bg-blue-700">{editingMenuLink ? 'Lưu' : 'Thêm'}</Button> </div> </form> </Card> )} <div className="overflow-x-auto"> <table className="admin-table"> <thead><tr><th>Nhãn</th><th>Đường dẫn</th><th>Icon</th><th>Thứ tự</th><th>Hiển thị</th><th>Hành động</th></tr></thead> <tbody> {customMenu.map(link => ( <tr key={link.id}> <td>{link.label}</td><td>{link.path}</td><td><i className={link.icon || ''}></i> {link.icon}</td><td>{link.order}</td><td>{link.isVisible ? 'Có' : 'Không'}</td> <td> <Button size="sm" variant="ghost" onClick={() => handleEditMenuLink(link)} className="mr-2 !text-admin-accent-blue hover:!text-blue-700">Sửa</Button> {!link.originalPath && <Button size="sm" variant="ghost" onClick={() => handleDeleteMenuLink(link.id)} className="!text-red-600 hover:!text-red-800">Xóa</Button>} </td> </tr> ))} </tbody> </table> </div> </div> </div> );
        case 'notifications_panel': if (!hasPermission(['viewNotifications'])) return <p>Không có quyền xem thông báo.</p>; return ( <div className="admin-card"> <div className="admin-card-header flex justify-between items-center"> <h2 className="admin-card-title">Bảng Thông Báo ({unreadNotificationCount} chưa đọc)</h2> {adminNotifications.length > 0 && <Button variant="outline" size="sm" onClick={clearAdminNotifications}>Xóa tất cả</Button>} </div> <div className="admin-card-body"> {adminNotifications.length === 0 ? <p>Không có thông báo nào.</p> : ( <ul className="space-y-3"> {adminNotifications.map(n => ( <li key={n.id} className={`p-3 rounded-md border ${n.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-admin-accent-blue shadow-sm'}`}> <div className="flex justify-between items-start"> <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>{n.message}</p> {!n.isRead && <Button size="sm" variant="ghost" onClick={() => markAdminNotificationRead(n.id)} className="text-xs !text-blue-600 hover:!text-blue-800 !p-1">Đánh dấu đã đọc</Button>} </div> <p className={`text-xs ${n.isRead ? 'text-gray-400' : 'text-blue-500'} mt-1`}>{new Date(n.timestamp).toLocaleString()}</p> </li> ))} </ul> )} </div> </div> );
        case 'analytics_revenue': case 'analytics_inventory': case 'analytics_promo':
            if (!hasPermission(['viewAnalytics'])) return <p>Không có quyền.</p>;
            const titleMap = { analytics_revenue: "Dự Đoán Doanh Thu", analytics_inventory: "Gợi Ý Nhập Hàng", analytics_promo: "Gợi Ý Khuyến Mãi Thông Minh" };
            return ( <div className="admin-card"><div className="admin-card-header"><h2 className="admin-card-title">{titleMap[activeView]} (Placeholder)</h2></div><div className="admin-card-body"><p className="text-gray-500">Tính năng phân tích và AI cho mục này đang được phát triển. Hãy quay lại sau để khám phá các thông tin chi tiết và gợi ý thông minh!</p><div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700"><i className="fas fa-lightbulb mr-2"></i>Sử dụng Gemini API để cung cấp các insight giá trị.</div></div></div> );
      default: return <p>Chọn một mục từ menu.</p>;
    }
  };

  return (
    <div className="flex admin-panel-body">
      <AdminSidebar 
        activeView={activeView} 
        onSelectView={setActiveView} 
        unreadNotificationCount={unreadNotificationCount}
        currentUser={currentUser}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpenProp={isSidebarOpen}
        menuConfig={MENU_CONFIG}
        openMenus={openMenus}
        toggleMenu={(menuKey) => setOpenMenus(prev => ({...prev, [menuKey]: !prev[menuKey]}))}
      />
      <main className="admin-main-content flex-1">
        <header className="admin-page-header md:flex justify-between items-center">
          <h1 className="admin-page-title">
            {MENU_CONFIG.flatMap(m => m.children ? m.children : m).find(item => item.id === activeView)?.label || 'Bảng Điều Khiển'}
          </h1>
          <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-600 hover:text-primary">
            <i className="fas fa-bars"></i> Menu
          </Button>
        </header>
        {renderActiveAdminView()}
      </main>
    </div>
  );
};

export default AdminPage;
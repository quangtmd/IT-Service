
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card'; 
import { 
    Product, Article, User, StaffRole, Order, OrderStatus, AdminNotification, UserRole, 
    FaqItem, DiscountCode, SiteThemeSettings, CustomMenuLink, SiteSettings,
    MediaItem, ChatLogSession
} from '../types';
import * as Constants from '../constants.tsx';
import { MOCK_PRODUCTS as INITIAL_MOCK_PRODUCTS, MOCK_ARTICLES as ALL_MOCK_ARTICLES, MOCK_ORDERS } from '../data/mockData';
import { useAuth, AdminPermission } from '../contexts/AuthContext';
import HRMProfileView from '../components/admin/HRMProfileView';
import ProductManagementView from '../components/admin/ProductManagementView';
import ArticleManagementView from '../components/admin/ArticleManagementView';
import OrderManagementView from '../components/admin/OrderManagementView';
import CustomerManagementView from '../components/admin/CustomerManagementView';
import DiscountManagementView from '../components/admin/DiscountManagementView';
import FaqManagementView from '../components/admin/FaqManagementView';
import ChatLogView from '../components/admin/ChatLogView';
import SiteSettingsView from '../components/admin/SiteSettingsView';
import MediaLibraryView from '../components/admin/MediaLibraryView';
import NotificationsView from '../components/admin/NotificationsView';


// Helper functions
const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; } 
    catch (error) { console.error(`Lỗi đọc localStorage key "${key}":`, error); return defaultValue; }
};
const setLocalStorageItem = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        const eventMap: Record<string, string> = {
            [Constants.SITE_CONFIG_STORAGE_KEY]: 'siteSettingsUpdated', [Constants.PRODUCTS_STORAGE_KEY]: 'productsUpdated',
            'adminArticles_v1': 'articlesUpdated', [Constants.CHAT_LOGS_STORAGE_KEY]: 'chatLogsUpdated',
            [Constants.ORDERS_STORAGE_KEY]: 'ordersUpdated'
        };
        if (eventMap[key]) window.dispatchEvent(new CustomEvent(eventMap[key]));
    } catch (error) { console.error(`Lỗi cài đặt localStorage key "${key}":`, error); }
};

type AdminView = 
  | 'dashboard' | 'products' | 'articles' | 'media_library' | 'faqs' 
  | 'staff' | 'customers' 
  | 'orders' | 'discounts' | 'chat_logs' 
  | 'theme_settings' | 'menu_settings' | 'site_settings'
  | 'notifications_panel'
  // Placeholders
  | 'accounting_dashboard' | 'hrm_dashboard' | 'analytics_dashboard';

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
        currentUser, users: authUsers,
        adminNotifications, hasPermission,
    } = useAuth();
    
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        content_management: true, sales_management: true, hrm_management: true,
    });
    
    // --- STATE MANAGEMENT FOR ADMIN DATA ---
    const [products, setProducts] = useState<Product[]>(() => getLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, INITIAL_MOCK_PRODUCTS));
    const [articles, setArticles] = useState<Article[]>(() => getLocalStorageItem('adminArticles_v1', ALL_MOCK_ARTICLES));
    const [orders, setOrders] = useState<Order[]>(() => getLocalStorageItem(Constants.ORDERS_STORAGE_KEY, MOCK_ORDERS));
    const [customerUsers, setCustomerUsers] = useState<User[]>([]);

    useEffect(() => {
      setCustomerUsers(authUsers.filter(u => u.role === 'customer'));
    }, [authUsers]);

    const handleDataUpdate = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, key: string, newValue: T[]) => {
        setter(newValue);
        setLocalStorageItem(key, newValue);
    }, []);

    const onProductsUpdate = (newProducts: Product[]) => handleDataUpdate(setProducts, Constants.PRODUCTS_STORAGE_KEY, newProducts);
    const onArticlesUpdate = (newArticles: Article[]) => handleDataUpdate(setArticles, 'adminArticles_v1', newArticles);
    const onOrdersUpdate = (newOrders: Order[]) => handleDataUpdate(setOrders, Constants.ORDERS_STORAGE_KEY, newOrders);

    useEffect(() => {
        const handleStorageEvents = () => {
            setProducts(getLocalStorageItem(Constants.PRODUCTS_STORAGE_KEY, INITIAL_MOCK_PRODUCTS));
            setArticles(getLocalStorageItem('adminArticles_v1', ALL_MOCK_ARTICLES));
            setOrders(getLocalStorageItem(Constants.ORDERS_STORAGE_KEY, MOCK_ORDERS));
        };
        
        window.addEventListener('productsUpdated', handleStorageEvents);
        window.addEventListener('articlesUpdated', handleStorageEvents);
        window.addEventListener('ordersUpdated', handleStorageEvents);
        
        document.body.classList.add('admin-panel-active');
        return () => {
            document.body.classList.remove('admin-panel-active');
            window.removeEventListener('productsUpdated', handleStorageEvents);
            window.removeEventListener('articlesUpdated', handleStorageEvents);
            window.removeEventListener('ordersUpdated', handleStorageEvents);
        };
    }, []);

    const unreadNotificationCount = adminNotifications.filter(n => !n.isRead).length;
    const MENU_CONFIG: MenuItemConfig[] = useMemo(() => [
        { id: 'dashboard', label: 'Tổng Quan', icon: 'fas fa-tachometer-alt', permission: ['viewDashboard'] },
        { 
            id: 'sales_management', label: 'Quản Lý Bán Hàng', icon: 'fas fa-chart-line', permission: ['viewSales'],
            children: [
                { id: 'orders', label: 'Đơn Hàng', icon: 'fas fa-receipt', permission: ['viewOrders'] },
                { id: 'discounts', label: 'Mã Giảm Giá', icon: 'fas fa-tags', permission: ['manageDiscounts'] },
                { id: 'customers', label: 'Khách Hàng', icon: 'fas fa-user-friends', permission: ['viewCustomers'] },
                { id: 'chat_logs', label: 'Lịch Sử Chat', icon: 'fas fa-comments', permission: ['viewOrders'] },
            ]
        },
        { 
            id: 'content_management', label: 'Quản Trị Website', icon: 'fas fa-file-alt', permission: ['viewContent'],
            children: [
                { id: 'products', label: 'Sản Phẩm', icon: 'fas fa-box-open', permission: ['viewProducts'] },
                { id: 'articles', label: 'Bài Viết', icon: 'fas fa-newspaper', permission: ['viewArticles'] },
                { id: 'media_library', label: 'Thư Viện Media', icon: 'fas fa-photo-video', permission: ['manageSiteSettings'] },
                { id: 'faqs', label: 'FAQs', icon: 'fas fa-question-circle', permission: ['manageFaqs'] },
            ]
        },
        { 
            id: 'hrm_management', label: 'Quản Lý Nhân Sự (HRM)', icon: 'fas fa-users-cog', permission: ['viewHrm'],
            children: [
                { id: 'hrm_dashboard', label: 'Hồ Sơ Nhân Sự', icon: 'fas fa-id-card', permission: ['manageEmployees'] },
            ]
        },
        { 
            id: 'accounting_management', label: 'Tài Chính - Kế Toán', icon: 'fas fa-calculator', permission: ['viewAccounting'],
            children: [
                { id: 'accounting_dashboard', label: 'Tổng Quan Tài Chính', icon: 'fas fa-chart-pie', permission: ['viewReports'] },
            ]
        },
        {
            id: 'settings_management', label: 'Danh Mục & Cấu Hình', icon: 'fas fa-cogs', permission: ['viewAppearance'], 
            children: [
                { id: 'site_settings', label: 'Cài Đặt Trang', icon: 'fas fa-cog', permission: ['manageSiteSettings'] }, 
                { id: 'theme_settings', label: 'Theme Màu', icon: 'fas fa-palette', permission: ['manageTheme'] },
                { id: 'menu_settings', label: 'Menu Điều Hướng', icon: 'fas fa-list-ul', permission: ['manageMenu'] },
            ]
        },
        { id: 'notifications_panel', label: 'Thông Báo', icon: 'fas fa-bell', count: unreadNotificationCount, permission: ['viewNotifications'] },
    ], [unreadNotificationCount]);

    const handleMenuClick = (viewId: AdminView | string, isParent: boolean) => {
        if (isParent) {
            setOpenMenus(prev => ({ ...prev, [viewId]: !prev[viewId] }));
        } else {
            setActiveView(viewId as AdminView);
            setIsMobileSidebarOpen(false);
        }
    };
    
    const renderContent = () => {
        const currentMenuItem = MENU_CONFIG.flatMap(m => m.children || m).find(i => i.id === activeView);
        if (currentMenuItem && !hasPermission(currentMenuItem.permission)) {
            if (hasPermission(['viewDashboard'])) {
                setActiveView('dashboard');
            }
            return <div className="admin-card"><div className="admin-card-body">Bạn không có quyền truy cập mục này.</div></div>;
        }

        switch(activeView) {
            case 'dashboard': return <DashboardView orders={orders} products={products} customers={customerUsers} />;
            case 'products': return <ProductManagementView products={products} onUpdate={onProductsUpdate} />;
            case 'articles': return <ArticleManagementView articles={articles} onUpdate={onArticlesUpdate} />;
            case 'orders': return <OrderManagementView orders={orders} onUpdate={onOrdersUpdate} />;
            case 'hrm_dashboard': return <HRMProfileView />;
            case 'customers': return <CustomerManagementView />;
            case 'discounts': return <DiscountManagementView />;
            case 'faqs': return <FaqManagementView />;
            case 'chat_logs': return <ChatLogView />;
            case 'media_library': return <MediaLibraryView />;
            case 'site_settings':
            case 'theme_settings':
            case 'menu_settings':
                return <SiteSettingsView initialTab={activeView} />;
            case 'notifications_panel': return <NotificationsView />;

            case 'accounting_dashboard': return <div className="admin-card"><div className="admin-card-body">Module Kế toán đang trong kế hoạch phát triển.</div></div>;
            case 'analytics_dashboard': return <div className="admin-card"><div className="admin-card-body">Module Phân tích Báo cáo đang trong kế hoạch phát triển.</div></div>;

            default: return <div className="admin-card"><div className="admin-card-body"><h3 className="admin-card-title">{currentMenuItem?.label || 'Chào mừng'}</h3><p>Tính năng này đang được phát triển.</p></div></div>;
        }
    };

    return (
        <div className="admin-wrapper">
            <AdminSidebar 
                isOpen={isMobileSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onClose={() => setIsMobileSidebarOpen(false)}
                onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
                activeView={activeView}
                openMenus={openMenus}
                onMenuClick={handleMenuClick}
                menuConfig={MENU_CONFIG}
                authContext={{ currentUser, hasPermission }}
            />
            <main className={`admin-main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                <AdminHeader 
                    onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
                    pageTitle={MENU_CONFIG.flatMap(m => m.children || m).find(i => i.id === activeView)?.label || "Tổng Quan"}
                    currentUser={currentUser}
                />
                <div className="admin-content-area">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

// --- Sub-components for AdminPage ---

const AdminSidebar: React.FC<{
    isOpen: boolean; isCollapsed: boolean; onClose: () => void; onToggleCollapse: () => void;
    activeView: AdminView; openMenus: Record<string, boolean>;
    onMenuClick: (viewId: string, isParent: boolean) => void;
    menuConfig: MenuItemConfig[];
    authContext: { currentUser: User | null; hasPermission: (p: AdminPermission[]) => boolean; };
}> = ({ isOpen, isCollapsed, onClose, onToggleCollapse, activeView, openMenus, onMenuClick, menuConfig, authContext }) => {
    
    const renderSidebarItem = (item: MenuItemConfig, isChild = false) => {
        if (!authContext.hasPermission(item.permission)) return null;

        const isActive = activeView === item.id;
        const isParentOpen = !!item.children && !!openMenus[item.id];
        
        const itemClasses = `w-full flex items-center p-3 my-1 rounded-md transition-colors text-sm ${
            isChild ? '' : ''
        } ${
            isActive 
            ? 'bg-primary/90 text-white font-semibold shadow-inner' 
            : 'text-gray-300 hover:bg-slate-700 hover:text-white'
        }`;

        if (item.children) {
            return (
                <div key={item.id}>
                    <button className={`${itemClasses} justify-between`} onClick={() => onMenuClick(item.id, true)}>
                        <div className="flex items-center">
                            <i className={`fas ${item.icon} w-6 text-center mr-3`}></i>
                            <span className={`admin-nav-label ${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
                        </div>
                        <i className={`fas fa-chevron-right text-xs transition-transform duration-200 ${isParentOpen ? 'rotate-90' : ''} ${isCollapsed ? 'hidden' : ''}`}></i>
                    </button>
                    <div className={`pl-6 mt-1 border-l border-slate-700 ml-5 transition-all duration-300 ease-in-out overflow-hidden ${isParentOpen ? 'max-h-96' : 'max-h-0'} ${isCollapsed ? 'hidden' : ''}`}>
                        {item.children.map(child => renderSidebarItem(child, true))}
                    </div>
                </div>
            );
        }

        return (
          <button key={item.id} className={itemClasses} onClick={() => onMenuClick(item.id, false)}>
            <i className={`fas ${item.icon} w-6 text-center mr-3`}></i>
            <span className={`admin-nav-label ${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
            {!isCollapsed && item.count !== undefined && item.count > 0 && 
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{item.count}</span>
            }
          </button>
        );
    };
    
    return (
        <>
            <div className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header justify-between">
                    {!isCollapsed && <Link to="/home"><span className="text-xl font-bold text-white">IQ Technology</span></Link>}
                    <button onClick={onToggleCollapse} className="hidden md:block text-slate-400 hover:text-white text-lg">
                        <i className={`fas ${isCollapsed ? 'fa-align-right' : 'fa-align-left'}`}></i>
                    </button>
                </div>
                <nav className="flex-grow p-2">
                    {menuConfig.map(item => renderSidebarItem(item))}
                </nav>
                <div className="admin-sidebar-footer">
                    <Link to="/home" className="flex items-center p-2 text-slate-400 hover:text-white rounded-md">
                        <i className="fas fa-globe w-6 text-center mr-3"></i>
                        {!isCollapsed && <span className="text-sm">Về trang chủ</span>}
                    </Link>
                </div>
            </aside>
        </>
    );
};

const AdminHeader: React.FC<{
    onMobileMenuOpen: () => void;
    pageTitle: string;
    currentUser: User | null;
}> = ({ onMobileMenuOpen, pageTitle, currentUser }) => (
    <header className="admin-page-header flex justify-between items-center">
        <div className="flex items-center">
            <button onClick={onMobileMenuOpen} className="md:hidden text-2xl text-slate-600 mr-4"><i className="fas fa-bars"></i></button>
            <h1 className="admin-page-title">{pageTitle}</h1>
        </div>
         <div className="flex items-center gap-4">
            <span className="text-sm text-admin-textSecondary hidden sm:inline">Xin chào, <strong>{currentUser?.username}</strong></span>
            <Link to="/home">
                <i className="fas fa-user-circle text-2xl text-admin-textSecondary hover:text-primary"></i>
            </Link>
        </div>
    </header>
);

const DashboardView: React.FC<{
    orders: Order[];
    products: Product[];
    customers: User[];
}> = ({ orders, products, customers }) => {
    const totalRevenue = orders.filter(o => o.status === 'Hoàn thành').reduce((sum, o) => sum + o.totalAmount, 0);
    const newOrdersCount = orders.filter(o => o.status === 'Chờ xử lý').length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 5).length;
    
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card className="admin-card !shadow-sm"><div className="admin-card-body">
                    <h4 className="text-sm text-admin-textSecondary">Tổng Doanh Thu</h4>
                    <p className="text-2xl font-bold text-admin-textPrimary">{totalRevenue.toLocaleString('vi-VN')}₫</p>
                </div></Card>
                <Card className="admin-card !shadow-sm"><div className="admin-card-body">
                    <h4 className="text-sm text-admin-textSecondary">Đơn Hàng Mới</h4>
                    <p className="text-2xl font-bold text-admin-textPrimary">{newOrdersCount}</p>
                </div></Card>
                <Card className="admin-card !shadow-sm"><div className="admin-card-body">
                    <h4 className="text-sm text-admin-textSecondary">Sản Phẩm Sắp Hết</h4>
                    <p className="text-2xl font-bold text-admin-textPrimary">{lowStockCount}</p>
                </div></Card>
                <Card className="admin-card !shadow-sm"><div className="admin-card-body">
                    <h4 className="text-sm text-admin-textSecondary">Tổng Khách Hàng</h4>
                    <p className="text-2xl font-bold text-admin-textPrimary">{customers.length}</p>
                </div></Card>
            </div>
            <Card className="admin-card">
                <div className="admin-card-header"><h3 className="admin-card-title">5 Đơn hàng gần nhất</h3></div>
                <div className="admin-card-body !p-0 overflow-x-auto">
                    <table className="admin-table">
                        <thead><tr><th>Mã ĐH</th><th>Khách hàng</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead>
                        <tbody>
                            {orders.slice(0, 5).map(o => (
                                <tr key={o.id}>
                                    <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{o.id.slice(-6)}</span></td>
                                    <td>{o.customerInfo.fullName}</td>
                                    <td>{new Date(o.orderDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="font-semibold">{o.totalAmount.toLocaleString('vi-VN')}₫</td>
                                    <td><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{o.status}</span></td>
                                    <td><Button size="sm" variant="ghost">Chi tiết</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};


export default AdminPage;
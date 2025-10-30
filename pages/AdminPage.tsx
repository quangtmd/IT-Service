import React, { useState, useEffect, useMemo } from 'react';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/ui/Button';
import { 
    User, AdminNotification
} from '../types';
// Fix: Import AdminPermission from where it is defined.
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
import HomepageManagementView from '../components/admin/HomepageManagementView';
import FinancialManagementView from '../components/admin/FinancialManagementView';
import DashboardView from '../components/admin/DashboardView'; // Import the new dashboard view
import ServiceTicketView from '../components/admin/ServiceTicketView';
import InventoryView from '../components/admin/InventoryView';

type AdminView = 
  | 'dashboard' | 'products' | 'articles' | 'media_library' | 'faqs' 
  | 'staff' | 'customers' 
  | 'orders' | 'discounts' | 'chat_logs' 
  | 'theme_settings' | 'menu_settings' | 'site_settings'
  | 'notifications_panel'
  | 'homepage_management'
  | 'accounting_dashboard' | 'hrm_dashboard' | 'analytics_dashboard'
  | 'service_tickets' | 'inventory';

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
        currentUser,
        adminNotifications, hasPermission,
    } = useAuth();
    
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        content_management: true, sales_management: true, hrm_management: true, operations_management: true,
    });

    useEffect(() => {
        document.body.classList.add('admin-panel-active');
        return () => {
            document.body.classList.remove('admin-panel-active');
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
            id: 'operations_management', label: 'Vận hành', icon: 'fas fa-cogs', permission: ['viewProducts'],
            children: [
                { id: 'products', label: 'Sản Phẩm', icon: 'fas fa-box-open', permission: ['viewProducts'] },
                { id: 'inventory', label: 'Kho hàng & Tồn kho', icon: 'fas fa-warehouse', permission: ['viewProducts'] },
                { id: 'service_tickets', label: 'Dịch vụ Sửa chữa', icon: 'fas fa-tools', permission: ['manageOrders'] },
            ]
        },
        { 
            id: 'content_management', label: 'Quản Trị Website', icon: 'fas fa-file-alt', permission: ['viewContent'],
            children: [
                { id: 'homepage_management', label: 'Quản lý Trang chủ', icon: 'fas fa-home', permission: ['manageSiteSettings'] },
                { id: 'articles', label: 'Bài Viết', icon: 'fas fa-newspaper', permission: ['viewArticles'] },
                { id: 'media_library', label: 'Thư Viện Media', icon: 'fas fa-photo-video', permission: ['manageSiteSettings'] },
                { id: 'faqs', label: 'FAQs', icon: 'fas fa-question-circle', permission: ['manageFaqs'] },
            ]
        },
        { 
            id: 'hrm_management', label: 'Quản Lý Nhân Sự', icon: 'fas fa-users-cog', permission: ['viewHrm'],
            children: [
                { id: 'hrm_dashboard', label: 'Hồ Sơ Nhân Sự', icon: 'fas fa-id-card', permission: ['manageEmployees'] },
            ]
        },
        { 
            id: 'accounting_management', label: 'Tài Chính', icon: 'fas fa-calculator', permission: ['viewAccounting'],
            children: [
                { id: 'accounting_dashboard', label: 'Tổng Quan Tài Chính', icon: 'fas fa-chart-pie', permission: ['viewReports'] },
            ]
        },
        {
            id: 'settings_management', label: 'Cấu Hình Hệ Thống', icon: 'fas fa-sliders-h', permission: ['viewAppearance'], 
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
            case 'dashboard': return <DashboardView setActiveView={setActiveView as (view: string) => void} />;
            case 'products': return <ProductManagementView />;
            case 'inventory': return <InventoryView />;
            case 'service_tickets': return <ServiceTicketView />;
            case 'articles': return <ArticleManagementView />;
            case 'orders': return <OrderManagementView />;
            case 'hrm_dashboard': return <HRMProfileView />;
            case 'customers': return <CustomerManagementView />;
            case 'discounts': return <DiscountManagementView />;
            case 'faqs': return <FaqManagementView />;
            case 'chat_logs': return <ChatLogView />;
            case 'media_library': return <MediaLibraryView />;
            case 'homepage_management': return <HomepageManagementView />;
            case 'site_settings':
            case 'theme_settings':
            case 'menu_settings':
                return <SiteSettingsView initialTab={activeView} />;
            case 'notifications_panel': return <NotificationsView />;
            case 'accounting_dashboard': return <FinancialManagementView />;
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
                    {!isCollapsed && <ReactRouterDOM.Link to="/home"><span className="text-xl font-bold text-white">IQ Technology</span></ReactRouterDOM.Link>}
                    <button onClick={onToggleCollapse} className="hidden md:block text-slate-400 hover:text-white text-lg">
                        <i className={`fas ${isCollapsed ? 'fa-align-right' : 'fa-align-left'}`}></i>
                    </button>
                </div>
                <nav className="flex-grow p-2">
                    {menuConfig.map(item => renderSidebarItem(item))}
                </nav>
                <div className="admin-sidebar-footer">
                    <ReactRouterDOM.Link to="/home" className="flex items-center p-2 text-slate-400 hover:text-white rounded-md">
                        <i className="fas fa-globe w-6 text-center mr-3"></i>
                        {!isCollapsed && <span className="text-sm">Về trang chủ</span>}
                    </ReactRouterDOM.Link>
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
            <ReactRouterDOM.Link to="/home">
                <i className="fas fa-user-circle text-2xl text-admin-textSecondary hover:text-primary"></i>
            </ReactRouterDOM.Link>
        </div>
    </header>
);

export default AdminPage;

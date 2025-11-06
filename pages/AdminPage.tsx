import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, AdminNotification, AdminView } from '../types';
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
import DashboardView from '../components/admin/DashboardView'; // Import the new DashboardView
import InventoryView from '../components/admin/InventoryView';
import ServiceTicketView from '../components/admin/ServiceTicketView';
import QuotationManagementView from '../components/admin/QuotationManagementView';


interface MenuItemConfig {
    id: AdminView | string; 
    label: string;
    icon: string;
    permission: AdminPermission[];
    count?: number;
    children?: MenuItemConfig[];
}


const AdminPage: React.FC = () => {
    const { currentUser, adminNotifications, hasPermission } = useAuth();
    
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        sales_crm: true,
        service_management: true,
        cms_marketing: true,
        inventory_logistics: false,
        finance_accounting: false,
        reporting_analytics: false,
        settings_management: false,
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
        
        // I. Sales & CRM
        { 
            id: 'sales_crm', label: 'Bán hàng & CRM', icon: 'fas fa-hand-holding-usd', permission: ['viewSales'],
            children: [
                { id: 'customers', label: 'Khách Hàng', icon: 'fas fa-users', permission: ['viewCustomers'] },
                { id: 'quotations', label: 'Báo Giá', icon: 'fas fa-file-invoice-dollar', permission: ['manageOrders'] },
                { id: 'orders', label: 'Đơn Hàng', icon: 'fas fa-receipt', permission: ['viewOrders'] },
                { id: 'discounts', label: 'Khuyến Mãi', icon: 'fas fa-tags', permission: ['manageDiscounts'] },
                { id: 'returns', label: 'Hoàn Trả', icon: 'fas fa-undo-alt', permission: ['manageOrders'] },
            ]
        },
        
        // II. Service Management
        {
            id: 'service_management', label: 'Quản lý Dịch vụ', icon: 'fas fa-concierge-bell', permission: ['manageOrders'],
            children: [
                 { id: 'service_tickets', label: 'Dịch vụ Sửa chữa', icon: 'fas fa-tools', permission: ['manageOrders'] },
                 { id: 'warranties', label: 'Quản lý Bảo hành', icon: 'fas fa-shield-alt', permission: ['manageOrders'] },
                 { id: 'chat_logs', label: 'Lịch Sử Chat', icon: 'fas fa-headset', permission: ['viewOrders'] },
            ]
        },

        // III. CMS & Marketing
        { 
            id: 'cms_marketing', label: 'Website & Nội dung', icon: 'fas fa-desktop', permission: ['viewContent'],
            children: [
                { id: 'homepage_management', label: 'Quản lý Trang chủ', icon: 'fas fa-home', permission: ['manageSiteSettings'] },
                { id: 'products', label: 'Sản Phẩm', icon: 'fas fa-box-open', permission: ['viewProducts'] },
                { id: 'articles', label: 'Bài Viết', icon: 'fas fa-newspaper', permission: ['viewArticles'] },
                { id: 'media_library', label: 'Thư Viện Media', icon: 'fas fa-photo-video', permission: ['manageSiteSettings'] },
                { id: 'faqs', label: 'FAQs', icon: 'fas fa-question-circle', permission: ['manageFaqs'] },
                { id: 'seo_analytics', label: 'SEO & Analytics', icon: 'fas fa-chart-line', permission: ['manageSiteSettings'] },
                { id: 'email_marketing', label: 'Email Marketing', icon: 'fas fa-envelope-open-text', permission: ['manageSiteSettings'] },
            ]
        },

        // IV. Inventory & Logistics
        { 
            id: 'inventory_logistics', label: 'Kho & Tồn kho', icon: 'fas fa-warehouse', permission: ['manageProducts'],
            children: [
                { id: 'inventory', label: 'Quản lý Tồn kho', icon: 'fas fa-boxes', permission: ['manageProducts'] },
                { id: 'goods_receipts', label: 'Phiếu Nhập Kho', icon: 'fas fa-dolly', permission: ['manageProducts'] },
                { id: 'delivery_notes', label: 'Phiếu Xuất Kho', icon: 'fas fa-truck-loading', permission: ['manageProducts'] },
                { id: 'shipping_management', label: 'Quản lý Vận chuyển', icon: 'fas fa-shipping-fast', permission: ['manageOrders'] },
            ]
        },
        
        // V. Finance & Accounting
        { 
            id: 'finance_accounting', label: 'Tài chính - Kế toán', icon: 'fas fa-calculator', permission: ['viewAccounting'],
            children: [
                { id: 'accounting_dashboard', label: 'Giao dịch Thu/Chi', icon: 'fas fa-exchange-alt', permission: ['viewReports'] },
                { id: 'receivables_payables', label: 'Công nợ', icon: 'fas fa-book', permission: ['viewReports'] },
                { id: 'cash_flow', label: 'Sổ Quỹ', icon: 'fas fa-wallet', permission: ['viewReports'] },
            ]
        },

        // VI. Reporting & Analytics
        { 
            id: 'reporting_analytics', label: 'Báo cáo & Phân tích', icon: 'fas fa-chart-pie', permission: ['viewReports'],
            children: [
                { id: 'reports_dashboard', label: 'Báo cáo Tổng hợp', icon: 'fas fa-chart-bar', permission: ['viewReports'] },
            ]
        },
        
        // Separated for clarity
        {
            id: 'settings_management', label: 'Hệ Thống', icon: 'fas fa-cogs', permission: ['viewAppearance'], 
            children: [
                { id: 'hrm_dashboard', label: 'Quản lý Nhân sự', icon: 'fas fa-id-card', permission: ['manageEmployees'] },
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
    
    const renderPlaceholder = (title: string) => (
        <div className="admin-card">
            <div className="admin-card-body">
                <h3 className="admin-card-title">{title}</h3>
                <p>Tính năng này đang được phát triển.</p>
            </div>
        </div>
    );

    const renderContent = () => {
        const currentMenuItem = MENU_CONFIG.flatMap(m => m.children || m).find(i => i.id === activeView);
        if (currentMenuItem && !hasPermission(currentMenuItem.permission)) {
            if (hasPermission(['viewDashboard'])) {
                setActiveView('dashboard');
            }
            return <div className="admin-card"><div className="admin-card-body">Bạn không có quyền truy cập mục này.</div></div>;
        }

        switch(activeView) {
            case 'dashboard': return <DashboardView setActiveView={setActiveView} />;
            // Sales & CRM
            case 'customers': return <CustomerManagementView />;
            case 'orders': return <OrderManagementView />;
            case 'discounts': return <DiscountManagementView />;
            case 'quotations': return <QuotationManagementView />;
            case 'returns': return renderPlaceholder('Quản lý Hoàn trả');
            // Service
            case 'service_tickets': return <ServiceTicketView />;
            case 'warranties': return renderPlaceholder('Quản lý Bảo hành');
            case 'chat_logs': return <ChatLogView />;
            // CMS
            case 'homepage_management': return <HomepageManagementView />;
            case 'products': return <ProductManagementView />;
            case 'articles': return <ArticleManagementView />;
            case 'media_library': return <MediaLibraryView />;
            case 'faqs': return <FaqManagementView />;
            case 'seo_analytics': return <SiteSettingsView initialTab={'site_settings'} />; // Map to general settings for now
            case 'email_marketing': return renderPlaceholder('Quản lý Email Marketing');
            // Inventory
            case 'inventory': return <InventoryView />;
            case 'goods_receipts': return renderPlaceholder('Quản lý Phiếu Nhập Kho');
            case 'delivery_notes': return renderPlaceholder('Quản lý Phiếu Xuất Kho');
            case 'shipping_management': return renderPlaceholder('Quản lý Vận chuyển');
            // Finance
            case 'accounting_dashboard': return <FinancialManagementView />;
            case 'receivables_payables': return renderPlaceholder('Quản lý Công nợ');
            case 'cash_flow': return renderPlaceholder('Quản lý Sổ Quỹ');
             // Reports
            case 'reports_dashboard': return renderPlaceholder('Báo cáo Tổng hợp');
            // System
            case 'hrm_dashboard': return <HRMProfileView />;
            case 'site_settings':
            case 'theme_settings':
            case 'menu_settings':
                return <SiteSettingsView initialTab={activeView} />;
            // Other
            case 'notifications_panel': return <NotificationsView />;

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

export default AdminPage;
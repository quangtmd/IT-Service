

// Fix: Import useNavigate from react-router-dom
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminView, AdminPermission } from '../types';
import Button from '../components/ui/Button';

// Import all Admin view components
import DashboardView from '../components/admin/DashboardView';
import ProductManagementView from '../components/admin/ProductManagementView';
import OrderManagementView from '../components/admin/OrderManagementView';
import CustomerManagementView from '../components/admin/CustomerManagementView';
import ArticleManagementView from '../components/admin/ArticleManagementView';
import DiscountManagementView from '../components/admin/DiscountManagementView';
import FaqManagementView from '../components/admin/FaqManagementView';
import SiteSettingsView from '../components/admin/SiteSettingsView';
import HomepageManagementView from '../components/admin/HomepageManagementView';
import MediaLibraryView from '../components/admin/MediaLibraryView';
import NotificationsView from '../components/admin/NotificationsView';
import ChatLogView from '../components/admin/ChatLogView';
import FinancialManagementView from '../components/admin/FinancialManagementView';
import HRMProfileView from '../components/admin/HRMProfileView';
import QuotationManagementView from '../components/admin/QuotationManagementView';
import ServiceTicketView from '../components/admin/ServiceTicketView';
import WarrantyManagementView from '../components/admin/WarrantyManagementView';
// Fix: Import InventoryManagementView from the correct file, assuming it's the default export
import InventoryManagementView from '../components/admin/InventoryView';
// Fix: Remove imports for components that are not provided and will be replaced by placeholders.
// import ReportsView from '../components/admin/ReportsView';
// import EmailMarketingView from '../components/admin/EmailMarketingView';
// import ShippingManagementView from '../components/admin/ShippingManagementView';


interface NavItem {
  id: AdminView;
  label: string;
  icon: string;
  permissions: AdminPermission[];
}

interface NavGroup {
    groupLabel: string;
    icon: string;
    items: NavItem[];
}

const NAV_STRUCTURE: NavGroup[] = [
    { groupLabel: "Tổng quan", icon: 'fas fa-tachometer-alt', items: [
        { id: 'dashboard', label: 'Bảng điều khiển', icon: 'fa-chart-pie', permissions: ['viewDashboard'] },
        { id: 'notifications_panel', label: 'Thông báo', icon: 'fa-bell', permissions: ['viewNotifications'] },
    ]},
    { groupLabel: "Bán hàng & CRM", icon: 'fas fa-shopping-cart', items: [
        { id: 'orders', label: 'Đơn hàng', icon: 'fa-receipt', permissions: ['viewSales'] },
        { id: 'quotations', label: 'Báo giá', icon: 'fa-file-invoice-dollar', permissions: ['viewSales'] },
        { id: 'customers', label: 'Khách hàng', icon: 'fa-users', permissions: ['viewUsers'] },
        { id: 'discounts', label: 'Khuyến mãi', icon: 'fa-tags', permissions: ['viewSales'] },
    ]},
     { groupLabel: "Dịch vụ", icon: 'fas fa-concierge-bell', items: [
        { id: 'tickets', label: 'Sửa chữa', icon: 'fa-tools', permissions: ['viewSales'] },
        { id: 'warranties', label: 'Bảo hành', icon: 'fa-shield-alt', permissions: ['viewSales'] },
        { id: 'chat_logs', label: 'Lịch sử Chat', icon: 'fa-history', permissions: ['viewDashboard'] },
    ]},
    { groupLabel: "Website & Nội dung", icon: 'fas fa-desktop', items: [
        { id: 'products', label: 'Sản phẩm', icon: 'fa-box-open', permissions: ['viewContent'] },
        { id: 'articles', label: 'Bài viết', icon: 'fa-newspaper', permissions: ['viewContent'] },
        { id: 'media_library', label: 'Thư viện Media', icon: 'fa-photo-video', permissions: ['viewContent'] },
        { id: 'faqs', label: 'FAQs', icon: 'fa-question-circle', permissions: ['viewContent'] },
        { id: 'marketing_email', label: 'Email Marketing', icon: 'fa-envelope-open-text', permissions: ['viewContent'] },
    ]},
     { groupLabel: "Kho & Vận hành", icon: 'fas fa-warehouse', items: [
        { id: 'inventory_dashboard', label: 'Tồn kho', icon: 'fa-boxes', permissions: ['viewSales'] },
        { id: 'inventory_in', label: 'Nhập kho', icon: 'fa-arrow-circle-down', permissions: ['viewSales'] },
        { id: 'inventory_out', label: 'Xuất kho', icon: 'fa-arrow-circle-up', permissions: ['viewSales'] },
        { id: 'inventory_suppliers', label: 'Nhà cung cấp', icon: 'fa-truck-loading', permissions: ['viewSales'] },
        { id: 'shipping_management', label: 'Vận chuyển', icon: 'fa-shipping-fast', permissions: ['viewSales'] },
    ]},
     { groupLabel: "Tài chính & Nhân sự", icon: 'fas fa-wallet', items: [
        { id: 'financial_transactions', label: 'Sổ giao dịch', icon: 'fa-exchange-alt', permissions: ['viewAccounting'] },
        { id: 'financial_debts', label: 'Công nợ', icon: 'fa-book', permissions: ['viewAccounting'] },
        { id: 'financial_accounts', label: 'Sổ quỹ', icon: 'fa-cash-register', permissions: ['viewAccounting'] },
        { id: 'hrm_profiles', label: 'Nhân sự', icon: 'fa-id-card', permissions: ['viewHrm'] },
        { id: 'hrm_payroll', label: 'Bảng lương', icon: 'fa-money-check-alt', permissions: ['viewHrm'] },
    ]},
    { groupLabel: "Báo cáo & Phân tích", icon: 'fas fa-chart-bar', items: [
        { id: 'reports_dashboard', label: 'Xem báo cáo', icon: 'fa-chart-line', permissions: ['viewAnalytics'] },
    ]},
    { groupLabel: "Cài đặt hệ thống", icon: 'fas fa-cogs', items: [
        { id: 'homepage_settings', label: 'Trang chủ', icon: 'fa-home', permissions: ['manageSiteSettings'] },
        { id: 'site_settings', label: 'Cài đặt chung & SEO', icon: 'fa-globe', permissions: ['manageSiteSettings'] },
        { id: 'theme_settings', label: 'Giao diện', icon: 'fa-palette', permissions: ['manageTheme'] },
        { id: 'menu_settings', label: 'Menu', icon: 'fa-bars', permissions: ['manageMenu'] },
    ]},
];

// Fix: Add missing view titles for 'shipping_management' and 'hrm_profiles'
const VIEW_TITLES: Record<AdminView, string> = {
    dashboard: 'Bảng điều khiển',
    notifications_panel: 'Thông báo',
    orders: 'Quản lý Đơn hàng',
    quotations: 'Quản lý Báo giá',
    customers: 'Quản lý Khách hàng',
    discounts: 'Quản lý Khuyến mãi',
    tickets: 'Quản lý Sửa chữa',
    warranties: 'Quản lý Bảo hành',
    chat_logs: 'Lịch sử Chatbot',
    products: 'Quản lý Sản phẩm',
    articles: 'Quản lý Bài viết',
    media_library: 'Thư viện Media',
    faqs: 'Quản lý FAQs',
    marketing_email: 'Email Marketing',
    inventory_dashboard: 'Quản lý Tồn kho',
    inventory_in: 'Quản lý Nhập kho',
    inventory_out: 'Quản lý Xuất kho',
    inventory_suppliers: 'Quản lý Nhà cung cấp',
    shipping_management: 'Quản lý Vận chuyển',
    financial_transactions: 'Quản lý Giao dịch Tài chính',
    financial_debts: 'Quản lý Công nợ',
    financial_accounts: 'Quản lý Sổ quỹ',
    hrm_profiles: 'Quản lý Nhân sự',
    hrm_payroll: 'Quản lý Bảng lương',
    reports_dashboard: 'Báo cáo & Phân tích',
    reports_sales: 'Báo cáo Bán hàng',
    reports_customers: 'Báo cáo Khách hàng',
    reports_inventory: 'Báo cáo Tồn kho',
    homepage_settings: 'Quản lý Trang chủ',
    site_settings: 'Cài đặt Chung & SEO',
    theme_settings: 'Cài đặt Giao diện',
    menu_settings: 'Cài đặt Menu',
    financial_dashboard: 'Tổng quan Tài chính',
};


const AdminPage: React.FC = () => {
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [openMenus, setOpenMenus] = useState<string[]>([NAV_STRUCTURE[0].groupLabel]);
    const { hasPermission, currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = (groupLabel: string) => {
        setOpenMenus(prev => prev.includes(groupLabel) ? prev.filter(g => g !== groupLabel) : [...prev, groupLabel]);
    };

    const handleLogout = () => {
        logout();
        navigate('/home');
    }

    const renderView = () => {
        // A helper to avoid giant switch case
        // Fix: Replace missing/unprovided components with placeholders to resolve TS errors.
        const PlaceholderView = ({featureName}: {featureName: string}) => (
            <div className="admin-card">
                <div className="admin-card-body">
                    <p className="text-center text-textMuted py-8">
                        <i className="fas fa-tools text-4xl mb-4"></i><br/>
                        Tính năng {featureName} đang được phát triển.
                    </p>
                </div>
            </div>
        );

        const componentMap: Record<AdminView, React.ComponentType<any>> = {
            dashboard: DashboardView,
            notifications_panel: NotificationsView,
            orders: OrderManagementView,
            quotations: QuotationManagementView,
            customers: CustomerManagementView,
            discounts: DiscountManagementView,
            tickets: ServiceTicketView,
            warranties: WarrantyManagementView,
            chat_logs: ChatLogView,
            products: ProductManagementView,
            articles: ArticleManagementView,
            media_library: MediaLibraryView,
            faqs: FaqManagementView,
            marketing_email: () => <PlaceholderView featureName="Email Marketing" />,
            inventory_dashboard: () => <InventoryManagementView initialTab="inventory" />,
            inventory_in: () => <InventoryManagementView initialTab="import" />,
            inventory_out: () => <InventoryManagementView initialTab="export" />,
            inventory_suppliers: () => <InventoryManagementView initialTab="suppliers" />,
            shipping_management: () => <PlaceholderView featureName="Quản lý Vận chuyển" />,
            financial_transactions: () => <FinancialManagementView initialTab="transactions" />,
            financial_debts: () => <FinancialManagementView initialTab="debts" />,
            financial_accounts: () => <FinancialManagementView initialTab="accounts" />,
            hrm_profiles: HRMProfileView,
            hrm_payroll: () => <FinancialManagementView initialTab="payroll" />,
            reports_dashboard: () => <PlaceholderView featureName="Báo cáo & Phân tích" />,
            homepage_settings: HomepageManagementView,
            site_settings: () => <SiteSettingsView initialTab="site_settings" />,
            theme_settings: () => <SiteSettingsView initialTab="theme_settings" />,
            menu_settings: () => <SiteSettingsView initialTab="menu_settings" />,
            // Default cases for views that might not have a dedicated component yet
            financial_dashboard: () => <FinancialManagementView initialTab="overview" />,
            reports_sales: () => <PlaceholderView featureName="Báo cáo Bán hàng" />,
            reports_customers: () => <PlaceholderView featureName="Báo cáo Khách hàng" />,
            reports_inventory: () => <PlaceholderView featureName="Báo cáo Tồn kho" />,
        };
        const Component = componentMap[activeView];
        if (Component) {
            // Special case for Dashboard to pass setActiveView
            if (activeView === 'dashboard') {
                return <DashboardView setActiveView={setActiveView} />;
            }
            return <Component />;
        }
        return <p>Tính năng đang được phát triển.</p>;
    };

    return (
        <div className="admin-wrapper">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                     <svg width="100" height="36" viewBox="0 0 100 36" xmlns="http://www.w3.org/2000/svg">
                        <style>{`.logo-main-red { font-family: Impact, sans-serif; font-size: 28px; fill: var(--color-primary-default); font-style: italic; } .logo-main-white { font-family: Impact, sans-serif; font-size: 28px; fill: #ffffff; font-style: italic; }`}</style>
                        <text x="0" y="25" className="logo-main-red">IQ</text>
                        <text x="28" y="25" className="logo-main-white">TECH</text>
                    </svg>
                </div>
                <nav className="admin-sidebar-nav">
                    {NAV_STRUCTURE.map(group => (
                        <div key={group.groupLabel}>
                            <div
                                className={`admin-nav-parent ${openMenus.includes(group.groupLabel) ? 'open' : ''}`}
                                onClick={() => toggleMenu(group.groupLabel)}
                            >
                                <i className={`fas ${group.icon} admin-nav-icon`}></i>
                                <span className="admin-nav-label">{group.groupLabel}</span>
                                <i className="fas fa-chevron-right admin-nav-arrow"></i>
                            </div>
                            <div className="admin-nav-children">
                                {group.items.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveView(item.id)}
                                        className={`admin-nav-item admin-nav-child ${activeView === item.id ? 'active' : ''}`}
                                    >
                                        <i className={`fas ${item.icon} admin-nav-icon`}></i>
                                        <span className="admin-nav-label">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
                <div className="admin-sidebar-footer">
                     <div className="relative group">
                          <button className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 w-full text-left">
                            <img src={currentUser?.imageUrl || `https://ui-avatars.com/api/?name=${currentUser?.username.charAt(0)}&background=random`} alt="avatar" className="w-8 h-8 rounded-full" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-slate-200 truncate">{currentUser?.username}</p>
                                <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
                            </div>
                          </button>
                          <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-950 border border-slate-700 rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
                            <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                                <i className="fas fa-sign-out-alt w-6"></i>Đăng xuất
                            </button>
                          </div>
                     </div>
                </div>
            </aside>
            <main className="admin-main-content">
                 <div className="admin-page-header">
                    <h1 className="admin-page-title">{VIEW_TITLES[activeView] || "Trang Quản trị"}</h1>
                </div>
                {renderView()}
            </main>
        </div>
    );
};

export default AdminPage;

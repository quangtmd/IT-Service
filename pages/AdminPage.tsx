

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// FIX: Import AdminPermission from types.ts where it is now defined.
import { AdminPermission, AdminView } from '../types';

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
import InventoryView from '../components/admin/InventoryView';
import QuotationManagementView from '../components/admin/QuotationManagementView';
import ServiceTicketView from '../components/admin/ServiceTicketView';
import WarrantyManagementView from '../components/admin/WarrantyManagementView';


interface NavItem {
  id: AdminView;
  label: string;
  icon: string;
  permissions: AdminPermission[];
}

interface NavGroup {
    groupLabel: string;
    items: NavItem[];
}

const NAV_STRUCTURE: NavGroup[] = [
    { groupLabel: "Tổng quan", items: [
        { id: 'dashboard', label: 'Bảng điều khiển', icon: 'fa-tachometer-alt', permissions: ['viewDashboard'] },
        { id: 'notifications_panel', label: 'Thông báo', icon: 'fa-bell', permissions: ['viewNotifications'] },
    ]},
    { groupLabel: "Bán hàng", items: [
        { id: 'orders', label: 'Đơn hàng', icon: 'fa-receipt', permissions: ['viewSales', 'viewOrders'] },
        { id: 'products', label: 'Sản phẩm', icon: 'fa-box-open', permissions: ['viewContent', 'viewProducts'] },
        { id: 'customers', label: 'Khách hàng', icon: 'fa-users', permissions: ['viewUsers', 'viewCustomers'] },
        { id: 'discounts', label: 'Mã giảm giá', icon: 'fa-tags', permissions: ['viewSales', 'manageDiscounts'] },
        { id: 'quotations', label: 'Báo giá', icon: 'fa-file-invoice-dollar', permissions: ['viewSales'] },
    ]},
    { groupLabel: "Nội dung", items: [
        { id: 'articles', label: 'Bài viết', icon: 'fa-newspaper', permissions: ['viewContent', 'viewArticles'] },
        { id: 'faqs', label: 'FAQs', icon: 'fa-question-circle', permissions: ['viewContent', 'manageFaqs'] },
        { id: 'media_library', label: 'Thư viện Media', icon: 'fa-photo-video', permissions: ['viewContent'] },
    ]},
    { groupLabel: "Hệ thống", items: [
        { id: 'homepage_settings', label: 'Trang chủ', icon: 'fa-home', permissions: ['viewAppearance', 'manageSiteSettings'] },
        { id: 'site_settings', label: 'Cài đặt chung', icon: 'fa-cogs', permissions: ['manageSiteSettings'] },
        { id: 'theme_settings', label: 'Theme', icon: 'fa-palette', permissions: ['viewAppearance', 'manageTheme'] },
        { id: 'menu_settings', label: 'Menu', icon: 'fa-bars', permissions: ['viewAppearance', 'manageMenu'] },
    ]},
    { groupLabel: "Vận hành", items: [
        { id: 'inventory', label: 'Tồn kho', icon: 'fa-warehouse', permissions: ['viewSales'] },
        { id: 'hrm_profiles', label: 'Nhân sự', icon: 'fa-id-card', permissions: ['viewHrm', 'manageEmployees'] },
        { id: 'financial_transactions', label: 'Tài chính', icon: 'fa-wallet', permissions: ['viewAccounting'] },
        { id: 'chat_logs', label: 'Lịch sử Chat', icon: 'fa-history', permissions: ['viewDashboard'] },
    ]},
];

const AdminPage: React.FC = () => {
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const { hasPermission } = useAuth();

    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView setActiveView={setActiveView} />;
            case 'products': return <ProductManagementView />;
            case 'orders': return <OrderManagementView />;
            case 'customers': return <CustomerManagementView />;
            case 'articles': return <ArticleManagementView />;
            case 'discounts': return <DiscountManagementView />;
            case 'faqs': return <FaqManagementView />;
            case 'site_settings': return <SiteSettingsView initialTab="site_settings" />;
            case 'theme_settings': return <SiteSettingsView initialTab="theme_settings" />;
            case 'menu_settings': return <SiteSettingsView initialTab="menu_settings" />;
            case 'homepage_settings': return <HomepageManagementView />;
            case 'media_library': return <MediaLibraryView />;
            case 'notifications_panel': return <NotificationsView />;
            case 'chat_logs': return <ChatLogView />;
            case 'financial_transactions': return <FinancialManagementView />;
            case 'hrm_profiles': return <HRMProfileView />;
            case 'inventory': return <InventoryView />;
            case 'quotations': return <QuotationManagementView />;
            case 'tickets': return <ServiceTicketView />;
            case 'warranties': return <WarrantyManagementView />;
            default: return <p>Chọn một mục từ menu.</p>;
        }
    };

    return (
        <div className="flex bg-gray-100">
            <aside className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
                <div className="p-4 text-center font-bold text-lg border-b border-gray-700">Admin Panel</div>
                <nav className="flex-grow p-2">
                    {NAV_STRUCTURE.map(group => (
                        hasPermission(group.items.flatMap(item => item.permissions)) && (
                            <div key={group.groupLabel} className="mb-4">
                                <h4 className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{group.groupLabel}</h4>
                                {group.items.filter(item => hasPermission(item.permissions)).map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveView(item.id)}
                                        className={`w-full text-left flex items-center p-2 rounded-md text-sm transition-colors ${
                                            activeView === item.id
                                                ? 'bg-primary text-white'
                                                : 'text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        <i className={`fas ${item.icon} w-6 text-center mr-2`}></i>
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        )
                    ))}
                </nav>
            </aside>
            <main className="flex-grow p-6">
                {renderView()}
            </main>
        </div>
    );
};

export default AdminPage;
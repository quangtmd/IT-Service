import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, AdminNotification, AdminView, AdminPermission } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// Import existing views
import HRMProfileView from '../../components/admin/HRMProfileView';
import ProductManagementView from '../../components/admin/ProductManagementView';
import ArticleManagementView from '../../components/admin/ArticleManagementView';
import OrderManagementView from '../../components/admin/OrderManagementView';
import CustomerManagementView from '../../components/admin/CustomerManagementView';
import DiscountManagementView from '../../components/admin/DiscountManagementView';
import FaqManagementView from '../../components/admin/FaqManagementView';
import ChatLogView from '../../components/admin/ChatLogView';
import SiteSettingsView from '../../components/admin/SiteSettingsView';
import MediaLibraryView from '../../components/admin/MediaLibraryView';
import NotificationsView from '../../components/admin/NotificationsView';
import HomepageManagementView from '../../components/admin/HomepageManagementView';
import FinancialManagementView from '../../components/admin/FinancialManagementView';
import DashboardView from '../../components/admin/DashboardView';
import ServiceTicketView from '../../components/admin/ServiceTicketView';
import InventoryView from '../../components/admin/InventoryView';

// Import new Inventory & Logistics views
import StockReceiptsView from '../../components/admin/StockReceiptsView';
import StockIssuesView from '../../components/admin/StockIssuesView';
import StockTransfersView from '../../components/admin/StockTransfersView';
import ShippingManagementView from '../../components/admin/ShippingManagementView';


// Import new form pages
import ProductFormPage from './ProductFormPage';
import UserFormPage from './UserFormPage';
import ArticleFormPage from './ArticleFormPage';
import DiscountFormPage from './DiscountFormPage';
import FaqFormPage from './FaqFormPage';
import TransactionFormPage from './TransactionFormPage';
import QuotationFormPage from './QuotationFormPage';
import CustomerFormPage from './CustomerFormPage';
import CustomerProfilePage from './CustomerProfilePage';
import OrderFormPage from './OrderFormPage';
import ReturnFormPage from './ReturnFormPage';
import SupplierFormPage from './SupplierFormPage';
import ServiceTicketFormPage from './ServiceTicketFormPage';
import WarrantyFormPage from './WarrantyFormPage';
import StockReceiptFormPage from './StockReceiptFormPage';
import StockIssueFormPage from './StockIssueFormPage';
import StockTransferFormPage from './StockTransferFormPage';


// Import new placeholder/skeleton views
import QuotationManagementView from '../../components/admin/QuotationManagementView';
import WarrantyManagementView from '../../components/admin/WarrantyManagementView';
import ReturnManagementView from '../../components/admin/ReturnManagementView';
import SupplierManagementView from '../../components/admin/SupplierManagementView';


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
    const location = ReactRouterDOM.useLocation();
    const navigate = ReactRouterDOM.useNavigate();

    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        'sales_crm': true, 'service_warranty': true, 'cms_marketing': true, 'inventory_logistics': true,
        'finance_accounting': false, 'procurement': false, 'system_hr': false,
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
            id: 'sales_crm', label: 'Bán Hàng & CRM', icon: 'fas fa-hand-holding-usd', permission: ['viewSales'],
            children: [
                { id: 'customers', label: 'Khách Hàng', icon: 'fas fa-users', permission: ['viewCustomers'] },
                { id: 'quotations', label: 'Báo Giá', icon: 'fas fa-file-invoice-dollar', permission: ['viewQuotations'] },
                { id: 'orders', label: 'Đơn Hàng', icon: 'fas fa-receipt', permission: ['viewOrders'] },
                { id: 'discounts', label: 'Mã Giảm Giá', icon: 'fas fa-tags', permission: ['manageDiscounts'] },
                { id: 'returns', label: 'Hoàn Trả', icon: 'fas fa-undo-alt', permission: ['manageOrders'] },
                { id: 'suppliers', label: 'Nhà Cung Cấp', icon: 'fas fa-truck-loading', permission: ['viewSuppliers'] },
            ]
        },
        // II. Service & Warranty
        {
            id: 'service_warranty', label: 'Dịch Vụ & Bảo Hành', icon: 'fas fa-tools', permission: ['viewService'],
            children: [
                { id: 'service_tickets', label: 'Phiếu Sửa Chữa', icon: 'fas fa-ticket-alt', permission: ['manageServiceTickets'] },
                { id: 'warranty_tickets', label: 'Phiếu Bảo Hành', icon: 'fas fa-shield-alt', permission: ['manageWarranty'] },
                { id: 'chat_logs', label: 'Lịch Sử Chat', icon: 'fas fa-comments', permission: ['viewChatLogs'] },
            ]
        },
         // III. CMS & Marketing
        {
            id: 'cms_marketing', label: 'Website & Marketing', icon: 'fas fa-desktop', permission: ['viewContent'],
            children: [
                { id: 'homepage_management', label: 'Quản lý Trang chủ', icon: 'fas fa-home', permission: ['manageSiteSettings'] },
                { id: 'products', label: 'Sản Phẩm', icon: 'fas fa-box-open', permission: ['viewProducts'] },
                { id: 'articles', label: 'Bài Viết', icon: 'fas fa-newspaper', permission: ['viewArticles'] },
                { id: 'media_library', label: 'Thư Viện Media', icon: 'fas fa-photo-video', permission: ['manageMedia'] },
                { id: 'email_marketing', label: 'Email Marketing', icon: 'fas fa-envelope-open-text', permission: ['viewAnalytics'] },
                { id: 'seo_management', label: 'Quản lý SEO', icon: 'fas fa-search-dollar', permission: ['viewAnalytics'] },
            ]
        },
        // IV. Inventory & Logistics
        {
            id: 'inventory_logistics', label: 'Kho & Logistics', icon: 'fas fa-warehouse', permission: ['viewInventory'],
            children: [
                { id: 'inventory', label: 'Tồn Kho', icon: 'fas fa-boxes', permission: ['viewInventory'] },
                { id: 'stock_receipts', label: 'Phiếu Nhập Kho', icon: 'fas fa-dolly-flatbed', permission: ['manageInventory'] },
                { id: 'stock_issues', label: 'Phiếu Xuất Kho', icon: 'fas fa-dolly', permission: ['manageInventory'] },
                { id: 'shipping', label: 'Vận Chuyển', icon: 'fas fa-shipping-fast', permission: ['manageOrders'] },
                { id: 'stock_transfers', label: 'Điều Chuyển Kho', icon: 'fas fa-exchange-alt', permission: ['manageInventory'] },
            ]
        },
         // V. Finance & Accounting
        {
            id: 'finance_accounting', label: 'Tài Chính - Kế Toán', icon: 'fas fa-calculator', permission: ['viewAccounting'],
            children: [
                { id: 'accounting_dashboard', label: 'Tổng Quan Tài Chính', icon: 'fas fa-chart-pie', permission: ['viewAccounting'] },
                { id: 'invoices', label: 'Hóa Đơn / Phiếu Thu', icon: 'fas fa-file-invoice', permission: ['manageTransactions'] },
                { id: 'expenses', label: 'Phiếu Chi', icon: 'fas fa-file-export', permission: ['manageTransactions'] },
                { id: 'debt_management', label: 'Công Nợ', icon: 'fas fa-book', permission: ['viewAccounting'] },
                { id: 'cashflow_forecast', label: 'Dự Báo Dòng Tiền', icon: 'fas fa-water', permission: ['viewAccounting'] },
                { id: 'payment_approval', label: 'Phê Duyệt Chi', icon: 'fas fa-check-double', permission: ['viewAccounting'] },
            ]
        },
        // VI. Procurement
        {
            id: 'procurement', label: 'Mua Hàng', icon: 'fas fa-shopping-cart', permission: ['viewProcurement'],
            children: [
                { id: 'purchase_requests', label: 'Yêu Cầu Mua Hàng (PR)', icon: 'fas fa-file-signature', permission: ['viewProcurement'] },
                { id: 'purchase_orders', label: 'Đơn Đặt Hàng (PO)', icon: 'fas fa-file-alt', permission: ['viewProcurement'] },
                { id: 'procurement_approval', label: 'Duyệt & Nhập Kho', icon: 'fas fa-clipboard-check', permission: ['viewProcurement'] },
            ]
        },
        // VII. System & HR
        {
            id: 'system_hr', label: 'Hệ Thống & Nhân Sự', icon: 'fas fa-users-cog', permission: ['viewSystem'],
            children: [
                { id: 'hrm_dashboard', label: 'Hồ Sơ Nhân Sự', icon: 'fas fa-id-card', permission: ['viewHrm'] },
                { id: 'user_permissions', label: 'Phân Quyền Người Dùng', icon: 'fas fa-user-shield', permission: ['manageEmployees'] },
                { id: 'site_settings', label: 'Cài Đặt Chung', icon: 'fas fa-cog', permission: ['manageSiteSettings'] },
                { id: 'activity_log', label: 'Nhật Ký Hoạt Động', icon: 'fas fa-history', permission: ['viewSystem'] },
                { id: 'contract_management', label: 'Quản Lý Hợp Đồng', icon: 'fas fa-file-contract', permission: ['viewSystem'] },
                { id: 'asset_management', label: 'Quản Lý Tài Sản', icon: 'fas fa-laptop-house', permission: ['viewSystem'] },
                { id: 'kpi_management', label: 'KPI & Hiệu Suất', icon: 'fas fa-chart-line', permission: ['viewHrm'] },
            ]
        },
        // Other top-level items
        { id: 'notifications_panel', label: 'Thông Báo', icon: 'fas fa-bell', count: unreadNotificationCount, permission: ['viewNotifications'] },
    ], [unreadNotificationCount]);

    // Determine the active view based on URL path
    useEffect(() => {
        const path = location.pathname;
        const parts = path.split('/');
        const adminIndex = parts.indexOf('admin');
        if (adminIndex === -1) {
            setActiveView('dashboard');
            return;
        }

        const viewCandidates = [
            'products', 'hrm_dashboard', 'articles', 'discounts', 'faqs', 
            'accounting_dashboard', 'quotations', 'customers', 'orders', 
            'returns', 'suppliers', 'service_tickets', 'warranty_tickets',
            'inventory', 'stock_receipts', 'stock_issues', 'shipping', 'stock_transfers'
        ];

        let foundView = null;
        for (const candidate of viewCandidates) {
            if(path.startsWith(`/admin/${candidate}`)) {
                foundView = candidate;
                break;
            }
        }
        
        if (foundView) {
             setActiveView(foundView as AdminView);
        } else {
            const lastSegment = parts[adminIndex + 1] || 'dashboard';
            const allMenuItems = MENU_CONFIG.flatMap(m => m.children ? m.children : m);
            const matchingItem = allMenuItems.find(item => item.id === lastSegment);
            setActiveView(matchingItem ? matchingItem.id as AdminView : 'dashboard');
        }
    }, [location.pathname, MENU_CONFIG]);


    const handleMenuClick = (viewId: AdminView | string, isParent: boolean) => {
        if (isParent) {
            setOpenMenus(prev => ({ ...prev, [viewId]: !prev[viewId] }));
        } else {
            navigate(`/admin/${viewId}`);
            setIsMobileSidebarOpen(false);
        }
    };

    const renderContent = (currentView: AdminView) => {
        const allMenuItems = MENU_CONFIG.flatMap(m => m.children ? m.children : m);
        const currentMenuItem = allMenuItems.find(i => i.id === currentView);

        if (currentMenuItem && !hasPermission(currentMenuItem.permission)) {
            if (hasPermission(['viewDashboard'])) {
                setActiveView('dashboard');
            }
            return <div className="admin-card"><div className="admin-card-body">Bạn không có quyền truy cập mục này.</div></div>;
        }

        switch(currentView) {
            case 'dashboard': return <DashboardView setActiveView={setActiveView} />;
            case 'products': return <ProductManagementView />;
            case 'articles': return <ArticleManagementView />;
            case 'orders': return <OrderManagementView />;
            case 'hrm_dashboard': return <HRMProfileView />;
            case 'customers': return <CustomerManagementView />;
            case 'discounts': return <DiscountManagementView />;
            case 'faqs': return <FaqManagementView />;
            case 'chat_logs': return <ChatLogView />;
            case 'media_library': return <MediaLibraryView />;
            case 'homepage_management': return <HomepageManagementView />;
            case 'site_settings': return <SiteSettingsView initialTab="site_settings" />;
            case 'theme_settings': return <SiteSettingsView initialTab="theme_settings" />;
            case 'menu_settings': return <SiteSettingsView initialTab="menu_settings" />;
            case 'notifications_panel': return <NotificationsView />;
            case 'accounting_dashboard': return <FinancialManagementView />;
            case 'inventory': return <InventoryView />;
            case 'service_tickets': return <ServiceTicketView />;
            case 'quotations': return <QuotationManagementView />;
            case 'warranty_tickets': return <WarrantyManagementView />;
            case 'returns': return <ReturnManagementView />;
            case 'suppliers': return <SupplierManagementView />;
            case 'stock_receipts': return <StockReceiptsView />;
            case 'stock_issues': return <StockIssuesView />;
            case 'stock_transfers': return <StockTransfersView />;
            case 'shipping': return <ShippingManagementView />;
            default: return (
                <div className="admin-card">
                    <div className="admin-card-body text-center py-12">
                         <i className="fas fa-cogs text-4xl text-gray-300 mb-4"></i>
                         <h3 className="text-xl font-semibold text-textBase">Tính năng "{currentMenuItem?.label || 'Không xác định'}"</h3>
                         <p className="text-textMuted mt-2">Module này đang trong quá trình phát triển và sẽ sớm được ra mắt.</p>
                    </div>
                </div>
            );
        }
    };

    const getPageTitle = useMemo(() => {
        const path = location.pathname;
        if (path.startsWith('/admin/products/new')) return 'Thêm Sản phẩm Mới';
        if (path.startsWith('/admin/products/edit/')) return 'Chỉnh sửa Sản phẩm';
        if (path.startsWith('/admin/hrm_dashboard/new')) return 'Thêm Nhân viên Mới';
        if (path.startsWith('/admin/hrm_dashboard/edit/')) return 'Chỉnh sửa Hồ sơ Nhân sự';
        if (path.startsWith('/admin/customers/new')) return 'Thêm Khách hàng Mới';
        if (path.startsWith('/admin/customers/edit/')) return 'Chỉnh sửa Khách hàng';
        if (path.startsWith('/admin/customers/view/')) return 'Hồ sơ Khách hàng';
        if (path.startsWith('/admin/articles/new')) return 'Thêm Bài viết Mới';
        if (path.startsWith('/admin/articles/edit/')) return 'Chỉnh sửa Bài viết';
        if (path.startsWith('/admin/discounts/new')) return 'Thêm Mã giảm giá Mới';
        if (path.startsWith('/admin/discounts/edit/')) return 'Chỉnh sửa Mã giảm giá';
        if (path.startsWith('/admin/faqs/new')) return 'Thêm FAQ Mới';
        if (path.startsWith('/admin/faqs/edit/')) return 'Chỉnh sửa FAQ';
        if (path.startsWith('/admin/accounting_dashboard/transactions/new')) return 'Thêm Giao dịch Mới';
        if (path.startsWith('/admin/accounting_dashboard/transactions/edit/')) return 'Chỉnh sửa Giao dịch';
        if (path.startsWith('/admin/quotations/new')) return 'Tạo Báo giá Mới';
        if (path.startsWith('/admin/quotations/edit/')) return 'Chỉnh sửa Báo giá';
        if (path.startsWith('/admin/orders/new')) return 'Tạo Đơn hàng Mới';
        if (path.startsWith('/admin/orders/edit/')) return 'Chỉnh sửa Đơn hàng';
        if (path.startsWith('/admin/returns/new')) return 'Tạo Phiếu Hoàn Trả';
        if (path.startsWith('/admin/returns/edit/')) return 'Chỉnh sửa Phiếu Hoàn Trả';
        if (path.startsWith('/admin/suppliers/new')) return 'Thêm Nhà Cung Cấp';
        if (path.startsWith('/admin/suppliers/edit/')) return 'Chỉnh sửa Nhà Cung Cấp';
        if (path.startsWith('/admin/service_tickets/new')) return 'Tạo Phiếu Dịch Vụ';
        if (path.startsWith('/admin/service_tickets/edit/')) return 'Chỉnh sửa Phiếu Dịch Vụ';
        if (path.startsWith('/admin/warranty_tickets/new')) return 'Tạo Phiếu Bảo hành';
        if (path.startsWith('/admin/warranty_tickets/edit/')) return 'Chỉnh sửa Phiếu Bảo hành';
        if (path.startsWith('/admin/stock_receipts/new')) return 'Tạo Phiếu Nhập Kho';
        if (path.startsWith('/admin/stock_receipts/edit/')) return 'Sửa Phiếu Nhập Kho';
        if (path.startsWith('/admin/stock_issues/new')) return 'Tạo Phiếu Xuất Kho';
        if (path.startsWith('/admin/stock_issues/edit/')) return 'Sửa Phiếu Xuất Kho';
        if (path.startsWith('/admin/stock_transfers/new')) return 'Tạo Phiếu Điều Chuyển';
        if (path.startsWith('/admin/stock_transfers/edit/')) return 'Sửa Phiếu Điều Chuyển';


        const allMenuItems = MENU_CONFIG.flatMap(m => m.children ? m.children : m);
        return allMenuItems.find(i => i.id === activeView)?.label || "Tổng Quan";
    }, [activeView, location.pathname, MENU_CONFIG]);


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
                    pageTitle={getPageTitle}
                    currentUser={currentUser}
                />
                <div className="admin-content-area">
                    <ReactRouterDOM.Routes>
                        {/* Define form pages first as they are more specific */}
                        <ReactRouterDOM.Route path="/products/new" element={<ProductFormPage />} />
                        <ReactRouterDOM.Route path="/products/edit/:productId" element={<ProductFormPage />} />
                        <ReactRouterDOM.Route path="/hrm_dashboard/new" element={<UserFormPage />} />
                        <ReactRouterDOM.Route path="/hrm_dashboard/edit/:userId" element={<UserFormPage />} />
                        <ReactRouterDOM.Route path="/customers/new" element={<CustomerFormPage />} />
                        <ReactRouterDOM.Route path="/customers/edit/:customerId" element={<CustomerFormPage />} />
                        <ReactRouterDOM.Route path="/customers/view/:customerId" element={<CustomerProfilePage />} />
                        <ReactRouterDOM.Route path="/articles/new" element={<ArticleFormPage />} />
                        <ReactRouterDOM.Route path="/articles/edit/:articleId" element={<ArticleFormPage />} />
                        <ReactRouterDOM.Route path="/discounts/new" element={<DiscountFormPage />} />
                        <ReactRouterDOM.Route path="/discounts/edit/:discountId" element={<DiscountFormPage />} />
                        <ReactRouterDOM.Route path="/faqs/new" element={<FaqFormPage />} />
                        <ReactRouterDOM.Route path="/faqs/edit/:faqId" element={<FaqFormPage />} />
                        <ReactRouterDOM.Route path="/accounting_dashboard/transactions/new" element={<TransactionFormPage />} />
                        <ReactRouterDOM.Route path="/accounting_dashboard/transactions/edit/:transactionId" element={<TransactionFormPage />} />
                        <ReactRouterDOM.Route path="/quotations/new" element={<QuotationFormPage />} />
                        <ReactRouterDOM.Route path="/quotations/edit/:quotationId" element={<QuotationFormPage />} />
                        <ReactRouterDOM.Route path="/orders/new" element={<OrderFormPage />} />
                        <ReactRouterDOM.Route path="/orders/edit/:orderId" element={<OrderFormPage />} />
                        <ReactRouterDOM.Route path="/returns/new" element={<ReturnFormPage />} />
                        <ReactRouterDOM.Route path="/returns/edit/:returnId" element={<ReturnFormPage />} />
                        <ReactRouterDOM.Route path="/suppliers/new" element={<SupplierFormPage />} />
                        <ReactRouterDOM.Route path="/suppliers/edit/:supplierId" element={<SupplierFormPage />} />
                        <ReactRouterDOM.Route path="/service_tickets/new" element={<ServiceTicketFormPage />} />
                        <ReactRouterDOM.Route path="/service_tickets/edit/:ticketId" element={<ServiceTicketFormPage />} />
                        <ReactRouterDOM.Route path="/warranty_tickets/new" element={<WarrantyFormPage />} />
                        <ReactRouterDOM.Route path="/warranty_tickets/edit/:ticketId" element={<WarrantyFormPage />} />
                        <ReactRouterDOM.Route path="/stock_receipts/new" element={<StockReceiptFormPage />} />
                        <ReactRouterDOM.Route path="/stock_receipts/edit/:id" element={<StockReceiptFormPage />} />
                        <ReactRouterDOM.Route path="/stock_issues/new" element={<StockIssueFormPage />} />
                        <ReactRouterDOM.Route path="/stock_issues/edit/:id" element={<StockIssueFormPage />} />
                        <ReactRouterDOM.Route path="/stock_transfers/new" element={<StockTransferFormPage />} />
                        <ReactRouterDOM.Route path="/stock_transfers/edit/:id" element={<StockTransferFormPage />} />
                        
                        {/* Generic route for views */}
                        <ReactRouterDOM.Route path="/:viewId/*" element={renderContent(activeView)} />
                        <ReactRouterDOM.Route path="/" element={renderContent('dashboard')} />
                    </ReactRouterDOM.Routes>
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

    const renderSidebarItem = (item: MenuItemConfig) => {
        if (!authContext.hasPermission(item.permission)) return null;

        const isParentOpen = !!item.children && !!openMenus[item.id];

        if (item.children) {
             const hasActiveChild = item.children.some(child => activeView === child.id);
            return (
                <div key={item.id}>
                    <button
                        className={`w-full flex items-center justify-between p-3 my-1 rounded-md transition-colors text-sm font-semibold
                                    ${hasActiveChild ? 'text-white' : 'text-gray-400 hover:bg-slate-700 hover:text-white'}`}
                        onClick={() => onMenuClick(item.id, true)}
                    >
                        <div className="flex items-center">
                            <i className={`fas ${item.icon} w-6 text-center mr-3`}></i>
                            <span className={`admin-nav-label ${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
                        </div>
                        <i className={`fas fa-chevron-right text-xs transition-transform duration-200 ${isParentOpen ? 'rotate-90' : ''} ${isCollapsed ? 'hidden' : ''}`}></i>
                    </button>
                    <div className={`pl-6 mt-1 border-l-2 border-slate-700 ml-5 transition-all duration-300 ease-in-out overflow-hidden ${isParentOpen ? 'max-h-[500px]' : 'max-h-0'} ${isCollapsed ? 'hidden' : ''}`}>
                        {item.children.map(child => renderChildItem(child))}
                    </div>
                </div>
            );
        }

        return renderChildItem(item); // Render as a child item if it has no children
    };

    const renderChildItem = (item: MenuItemConfig) => {
        if (!authContext.hasPermission(item.permission)) return null;
        const isActive = activeView === item.id;
        return (
             <button key={item.id}
                className={`w-full flex items-center p-2.5 my-0.5 rounded-md transition-colors text-sm ${isActive ? 'bg-primary/90 text-white font-semibold shadow-inner' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}
                onClick={() => onMenuClick(item.id, false)}
            >
                <i className={`fas ${item.icon} w-6 text-center mr-3`}></i>
                <span className={`admin-nav-label ${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
                {!isCollapsed && item.count !== undefined && item.count > 0 &&
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{item.count > 9 ? '9+' : item.count}</span>
                }
            </button>
        );
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header justify-between">
                    {!isCollapsed && <ReactRouterDOM.Link to="/"><span className="text-xl font-bold text-white">IQ Technology</span></ReactRouterDOM.Link>}
                    <button onClick={onToggleCollapse} className="hidden lg:block text-slate-400 hover:text-white text-lg">
                        <i className={`fas ${isCollapsed ? 'fa-align-right' : 'fa-align-left'}`}></i>
                    </button>
                     <button onClick={onClose} className="lg:hidden text-2xl text-slate-400 hover:text-white">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <nav className="flex-grow p-2">
                    {menuConfig.map(item => renderSidebarItem(item))}
                </nav>
                <div className="admin-sidebar-footer">
                    <ReactRouterDOM.Link to="/" className="flex items-center p-2 text-slate-400 hover:text-white rounded-md">
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
            <button onClick={onMobileMenuOpen} className="lg:hidden text-2xl text-slate-600 mr-4"><i className="fas fa-bars"></i></button>
            <h1 className="admin-page-title">{pageTitle}</h1>
        </div>
         <div className="flex items-center gap-4">
            <span className="text-sm text-admin-textSecondary hidden sm:inline">Xin chào, <strong>{currentUser?.username}</strong></span>
            <ReactRouterDOM.Link to="/">
                <i className="fas fa-user-circle text-2xl text-admin-textSecondary hover:text-primary"></i>
            </ReactRouterDOM.Link>
        </div>
    </header>
);

export default AdminPage;

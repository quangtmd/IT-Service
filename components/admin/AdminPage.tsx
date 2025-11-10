import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { User, AdminNotification, AdminView } from '../types';
import { useAuth, AdminPermission } from '../contexts/AuthContext';

// Import existing views
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
import DashboardView from '../components/admin/DashboardView';
import InventoryView from '../components/admin/InventoryView';
import ServiceTicketView from '../components/admin/ServiceTicketView';

// Import new form pages
import ProductFormPage from './admin/ProductFormPage';
import UserFormPage from './admin/UserFormPage';
import ArticleFormPage from './admin/ArticleFormPage';
import DiscountFormPage from './admin/DiscountFormPage';
import FaqFormPage from './admin/FaqFormPage';
import TransactionFormPage from './admin/TransactionFormPage';
import QuotationFormPage from './admin/QuotationFormPage';
import CustomerFormPage from './admin/CustomerFormPage';


// Import new placeholder/skeleton views
import QuotationManagementView from '../components/admin/QuotationManagementView';
import WarrantyManagementView from '../components/admin/WarrantyManagementView';
import ReturnManagementView from '../components/admin/ReturnManagementView';
import SupplierManagementView from '../components/admin/SupplierManagementView';


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
        'sales_crm': true, 'service_warranty': true, 'cms_marketing': true, 'inventory_logistics': false,
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
                { id: 'service_tickets', label: 'Ticket Hỗ Trợ (Helpdesk)', icon: 'fas fa-headset', permission: ['manageServiceTickets'] },
            ]
        },
        // II. Service & Warranty
        {
            id: 'service_warranty', label: 'Dịch Vụ & Bảo Hành', icon: 'fas fa-tools', permission: ['viewService'],
            children: [
                { id: 'service_tickets', label: 'Phiếu Sửa Chữa', icon: 'fas fa-ticket-alt', permission: ['manageServiceTickets'] },
                { id: 'warranty_claims', label: 'Phiếu Bảo Hành', icon: 'fas fa-shield-alt', permission: ['manageWarranty'] },
                { id: 'chat_logs', label: 'Lịch Sử Chat', icon: 'fas fa-comments', permission: ['viewChatLogs'] },
            ]
        },
         // III. CMS & Marketing
        {
            id: 'cms_marketing', label: 'Website & Marketing', icon: 'fas fa-desktop', permission:


// This file contains all the core type definitions for the application.

// --- UTILITY TYPES ---
export type Maybe<T> = T | null | undefined;

// --- AUTH & USER TYPES ---
export type UserRole = 'admin' | 'staff' | 'customer';
export const USER_ROLES_CONST: UserRole[] = ['admin', 'staff', 'customer'];

export type StaffRole = 'Quản lý Bán hàng' | 'Biên tập Nội dung' | 'Trưởng nhóm Kỹ thuật' | 'Chuyên viên Hỗ trợ' | 'Nhân viên Toàn quyền';
export const STAFF_ROLE_OPTIONS: StaffRole[] = ['Quản lý Bán hàng', 'Biên tập Nội dung', 'Trưởng nhóm Kỹ thuật', 'Chuyên viên Hỗ trợ', 'Nhân viên Toàn quyền'];

export type UserStatus = 'Đang hoạt động' | 'Tạm khóa';
export const USER_STATUS_OPTIONS: UserStatus[] = ['Đang hoạt động', 'Tạm khóa'];

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  staffRole?: StaffRole;
  joinDate?: string;
  status?: UserStatus;
  isLocked?: boolean;
  
  // Contact Info
  phone?: string;
  address?: string;
  imageUrl?: string;
  
  // CRM Info (for customers)
  gender?: 'Nam' | 'Nữ' | 'Khác';
  dateOfBirth?: string;
  leadSource?: string; // e.g., 'Facebook', 'Website', 'Referral'
  customerGroup?: 'Mới' | 'Thường' | 'VIP' | 'Sỉ';
  loyaltyPoints?: number;
  debtStatus?: string;

  // HRM Info (for staff)
  position?: string; // e.g., 'Kỹ thuật viên', 'Nhân viên kinh doanh'
}

export type AdminPermission = 
  // General
  | 'viewDashboard'
  | 'viewNotifications'
  // Website Content Management
  | 'viewContent'
  | 'manageProducts'
  | 'viewProducts'
  | 'manageArticles'
  | 'viewArticles'
  | 'manageFaqs'
  // User Management
  | 'viewUsers'
  | 'manageStaff'
  | 'viewCustomers'
  // Sales Management
  | 'viewSales'
  | 'manageOrders'
  | 'viewOrders'
  | 'manageDiscounts'
  // Appearance & Settings
  | 'viewAppearance'
  | 'manageTheme'
  | 'manageMenu'
  | 'manageSiteSettings'
  // HRM (Future)
  | 'viewHrm'
  | 'manageEmployees'
  | 'managePayroll'
  // Accounting (Future)
  | 'viewAccounting'
  | 'manageInvoices'
  | 'viewReports'
  // High-level (Future)
  | 'viewAnalytics';

export interface AdminNotification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  isRead: boolean;
}

// --- E-COMMERCE TYPES ---
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  costPrice?: number; // Giá vốn
  stock: number;
  category: string; 
  mainCategory: string;
  subCategory: string;
  brand?: string;
  imageUrls: string[];
  description: string;
  shortDescription?: string;
  specifications: Record<string, string>;
  tags?: string[];
  isVisible: boolean;
  rating?: number;
  reviews?: number;
  variants?: any; // For size/color
}

export interface CartItem extends Product {
  quantity: number;
}

export interface PCComponent {
  type: string;
  name: string;
  price: number;
  details?: string;
}
export interface CustomPCBuildCartItem extends CartItem {
  isCustomBuild: true;
  buildComponents: Record<string, { name: string; price?: number }>;
  imageUrl: string;
}

export type OrderStatus = 'Chờ xử lý' | 'Đã xác nhận' | 'Đang chuẩn bị' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';
export const ORDER_STATUSES: OrderStatus[] = ['Chờ xử lý', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Hoàn thành', 'Đã hủy'];

export interface CheckoutFormData {
    fullName: string;
    phone: string;
    address: string;
    email: string;
    notes?: string;
}

export interface PaymentInfo {
    method: 'Thanh toán khi nhận hàng (COD)' | 'Chuyển khoản ngân hàng' | 'Momo' | 'VNPay';
    status: 'Chưa thanh toán' | 'Đã thanh toán' | 'Thanh toán thất bại';
    amountToPay?: number; // For deposits
    transactionId?: string;
}

export interface Order {
  id: string;
  customerInfo: CheckoutFormData;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  discountCode?: string;
  discountAmount?: number;
  shippingInfo?: string;
  orderDate: string;
  status: OrderStatus;
  paymentInfo: PaymentInfo;
}

export interface DiscountCode {
    id: string;
    name?: string;
    code: string;
    type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
    value: number;
    description?: string;
    expiryDate?: string;
    isActive: boolean;
    minSpend?: number;
    usageLimit?: number;
    timesUsed?: number;
    appliesTo?: { type: 'products' | 'categories', ids: string[] }; // Scope
}

// --- CONTENT & SITE SETTINGS ---
export interface MainCategoryInfo {
  name: string;
  slug: string;
  icon?: string;
  subCategories: SubCategoryInfo[];
}
export interface SubCategoryInfo {
  name: string;
  slug: string;
}
export type ProductCategoryHierarchy = MainCategoryInfo[];

export interface Article {
  id: string;
  title: string;
  summary: string;
  content?: string;
  imageUrl?: string;
  author: string;
  date: string;
  category: string;
  isAIGenerated?: boolean;
  imageSearchQuery?: string;
  tags?: string[];
  canonicalUrl?: string;
  robots?: string;
  viewCount?: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
  slug: string;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  description: string;
  imageUrl: string;
  technologiesUsed: string[];
  completionDate: string;
  category: string;
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  avatarUrl: string;
  role: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category: string;
    isVisible: boolean;
}

export interface NavLinkItem {
  label: string;
  path: string;
  icon?: string;
  authRequired?: boolean;
}
export interface CustomMenuLink extends NavLinkItem {
    id: string;
    order: number;
    isVisible: boolean;
    originalPath: string; // To identify core links
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  quote: string;
  imageUrl: string;
}

export interface StoreImage {
    id: string;
    url: string;
    caption: string;
}

// --- HOMEPAGE SPECIFIC SETTINGS ---
export interface HomepageBannerSettings {
    id: string;
    preTitle: string;
    title: string;
    subtitle: string;
    backgroundImageUrl: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    order: number;
    isActive: boolean;
    decorTopLeftImageUrl?: string;
    decorBottomRightImageUrl?: string;
}
export interface HomepageAboutFeature {
    id: string;
    icon: string;
    title: string;
    description: string;
    link?: string;
}
export interface HomepageAboutSettings {
    enabled: boolean;
    preTitle: string;
    title: string;
    description: string;
    imageUrl: string;
    imageDetailUrl?: string;
    imageAltText?: string;
    imageDetailAltText?: string;
    features: HomepageAboutFeature[];
    buttonText: string;
    buttonLink: string;
}
export interface HomepageServiceBenefit {
    id: string;
    iconClass: string;
    title: string;
    description: string;
    link: string;
    order: number;
}
export interface HomepageServicesBenefitsSettings {
    enabled: boolean;
    preTitle: string;
    title: string;
    sectionTitleIconUrl?: string;
    benefits: HomepageServiceBenefit[];
}
export interface HomepageWhyChooseUsFeature {
    id: string;
    iconClass: string;
    title: string;
    description: string;
}
export interface HomepageWhyChooseUsSettings {
    enabled: boolean;
    preTitle: string;
    title: string;
    description: string;
    mainImageUrl: string;
    experienceStatNumber: string;
    experienceStatLabel: string;
    features: HomepageWhyChooseUsFeature[];
    contactButtonText: string;
    contactButtonLink: string;
    contactSectionText?: string;
    sectionTitleIconUrl?: string;
}
export interface HomepageStatItem {
    id: string;
    iconClass: string;
    count: string;
    label: string;
    order: number;
}
export interface HomepageStatsCounterSettings {
    enabled: boolean;
    stats: HomepageStatItem[];
}
export interface HomepageFeaturedProjectsSettings {
    enabled: boolean;
    preTitle: string;
    title: string;
    buttonText: string;
    buttonLink: string;
    featuredServiceIds: string[];
    sectionTitleIconUrl?: string;
}
export interface HomepageTestimonialItem {
    id: string;
    name: string;
    quote: string;
    avatarUrl: string;
    role: string;
    order: number;
}
export interface HomepageTestimonialsSettings {
    enabled: boolean;
    preTitle: string;
    title: string;
    testimonials: HomepageTestimonialItem[];
    sectionTitleIconUrl?: string;
}
export interface HomepageBrandLogo {
    id: string;
    name: string;
    logoUrl: string;
    order: number;
}
export interface HomepageBrandLogosSettings {
    enabled: boolean;
    logos: HomepageBrandLogo[];
}
export interface HomepageProcessStep {
    id: string;
    stepNumber: string;
    title: string;
    description: string;
    imageUrlSeed: string;
    alignRight?: boolean;
    order: number;
}
export interface HomepageProcessSettings {
    enabled: boolean;
    preTitle: string;
    title: string;
    steps: HomepageProcessStep[];
    sectionTitleIconUrl?: string;
}
export interface HomepageCallToActionSettings {
    enabled: boolean;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    backgroundImageUrl?: string;
}
export interface HomepageBlogPreviewSettings {
    enabled: boolean;
    preTitle: string;
    title: string;
    featuredArticleId?: string;
    otherArticleIds?: string[];
    sectionTitleIconUrl?: string;
}
export interface HomepageContactSectionSettings {
    enabled: boolean;
    preTitle: string;
    title: string;
    sectionTitleIconUrl?: string;
}

// --- GLOBAL SITE SETTINGS ---
export interface SMTPSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
}
export interface PaymentGatewaySettings {
  momoEnabled: boolean;
  vnPayEnabled: boolean;
  paypalEnabled: boolean;
}
export interface MediaItem {
    id: string;
    url: string;
    name: string;
    type: string;
    uploadedAt: string;
}

export interface SiteSettings {
  companyName: string;
  companySlogan: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;

  siteLogoUrl: string;
  siteFaviconUrl: string;
  
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultMetaKeywords: string;
  
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  robotsTxt?: string;

  aboutPageTitle: string;
  aboutPageSubtitle: string;
  ourStoryContentMarkdown: string;
  missionStatementMarkdown: string;
  visionStatementMarkdown: string;
  teamMembers: TeamMember[];
  storeImages: StoreImage[];

  contactPageTitle: string;
  contactPageSubtitle: string;
  workingHours: string;
  mapEmbedUrl: string;

  socialFacebookUrl: string;
  socialZaloUrl: string;
  socialYoutubeUrl: string;
  socialInstagramUrl: string;
  socialTwitterUrl: string;

  // Homepage Sections
  homepageBanners: HomepageBannerSettings[];
  homepageAbout: HomepageAboutSettings;
  homepageServicesBenefits: HomepageServicesBenefitsSettings;
  homepageWhyChooseUs: HomepageWhyChooseUsSettings;
  homepageStatsCounter: HomepageStatsCounterSettings;
  homepageFeaturedProjects: HomepageFeaturedProjectsSettings;
  homepageTestimonials: HomepageTestimonialsSettings;
  homepageBrandLogos: HomepageBrandLogosSettings;
  homepageProcess: HomepageProcessSettings;
  homepageCallToAction: HomepageCallToActionSettings;
  homepageBlogPreview: HomepageBlogPreviewSettings;
  homepageContactSection: HomepageContactSectionSettings;

  // System Settings
  smtpSettings: SMTPSettings;
  paymentGateways: PaymentGatewaySettings;
  siteMediaLibrary: MediaItem[];
}

export interface SiteThemeSettings {
  primaryColorDefault: string;
  primaryColorLight: string;
  primaryColorDark: string;
  secondaryColorDefault: string;
  secondaryColorLight: string;
  secondaryColorDark: string;
}

export interface PricingPlan {
    id: string;
    name: string;
    price: string;
    period: string;
    isPopular: boolean;
    features: string[];
    buttonText: string;
    buttonLink: string;
    originalPrice?: string;
    saveText?: string;
}


// --- AI & CHATBOT TYPES ---
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  imageUrl?: string;
}

export interface AIRecommendedComponent {
  name: string;
  reasoning: string;
}

export interface AIBuildResponse {
  cpu?: AIRecommendedComponent;
  motherboard?: AIRecommendedComponent;
  ram?: AIRecommendedComponent;
  gpu?: AIRecommendedComponent;
  ssd?: AIRecommendedComponent;
  psu?: AIRecommendedComponent;
  case?: AIRecommendedComponent;
  error?: string;
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface PCBuildSuggestion {
    name: string;
    total_price: number;
    reasoning: string;
    components: {
        CPU: string;
        GPU: string;
        RAM: string;
        Motherboard: string;
        SSD: string;
        PSU: string;
        Case: string;
    };
}

export interface AIBuildSuggestionsResponse {
    suggestions: PCBuildSuggestion[];
}

export interface ChatLogSession {
    id: string;
    userName: string;
    userPhone: string;
    startTime: string;
    endTime?: string;
    messages: ChatMessage[];
    notes?: string;
}

// --- FINANCIAL & HRM TYPES ---
export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'Doanh thu Bán hàng' | 'Thu nội bộ' | 'Chi phí Nhà Cung Cấp' | 'Chi phí Lương' | 'Chi phí Vận hành' | 'Chi phí Marketing' | 'Chi phí Khác';

export interface FinancialTransaction {
    id: string;
    date: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    description: string;
    relatedEntity?: string; // e.g., Customer name, Supplier name
    invoiceNumber?: string;
}

export interface PayrollRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    payPeriod: string; // "YYYY-MM"
    baseSalary: number;
    bonus: number;
    deduction: number;
    finalSalary: number;
    notes: string;
    status: 'Chưa thanh toán' | 'Đã thanh toán';
}

export interface ServerInfo {
    outboundIp: string;
}

// Fix: Add 'shipping_management' and 'hrm_profiles' to AdminView type
export type AdminView = 
  // Main
  | 'dashboard'
  // Sales & CRM
  | 'orders'
  | 'quotations'
  | 'customers'
  | 'discounts'
  // Services
  | 'tickets'
  | 'warranties'
  | 'chat_logs'
  // CMS & Marketing
  | 'products'
  | 'articles'
  | 'media_library'
  | 'faqs'
  | 'marketing_email'
  // Inventory
  | 'inventory_dashboard'
  | 'inventory_in'
  | 'inventory_out'
  | 'inventory_suppliers'
  // Finance
  | 'financial_dashboard'
  | 'financial_transactions'
  | 'financial_debts'
  | 'financial_accounts'
  | 'hrm_payroll'
  // Reports
  | 'reports_dashboard'
  | 'reports_sales'
  | 'reports_customers'
  | 'reports_inventory'
  // System & Settings
  | 'homepage_settings'
  | 'site_settings'
  | 'theme_settings'
  | 'menu_settings'
  | 'notifications_panel'
  | 'shipping_management'
  | 'hrm_profiles';


// --- Inventory, Service, Finance, Marketing (New) ---

export interface ServiceTicket {
  id: string;
  customer_id: string;
  product_name: string;
  product_serial?: string;
  reported_issue: string;
  reception_date: string;
  completion_date?: string;
  status: 'Mới tạo' | 'Chờ báo giá' | 'Chờ linh kiện' | 'Đang sửa chữa' | 'Hoàn thành' | 'Đã hủy';
  inspection_fee?: number;
  component_cost?: number;
  labor_cost?: number;
  total_cost?: number;
  notes?: string;
}

export interface WarrantyTicket {
    id: string;
    original_order_id: string;
    customer_id: string;
    product_name: string;
    product_serial?: string;
    reported_issue: string;
    actual_issue?: string;
    reception_date: string;
    completion_date?: string;
    status: 'Mới tạo' | 'Đang kiểm tra' | 'Chờ linh kiện' | 'Đang xử lý' | 'Hoàn thành' | 'Từ chối bảo hành';
    solution?: 'Sửa chữa' | 'Đổi mới' | 'Hoàn tiền';
    notes?: string;
    internal_cost?: number;
}


export interface QuotationItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}
export interface Quotation {
  id: string;
  customer_id?: string;
  customerInfo?: { name: string, email: string };
  creation_date: string;
  expiry_date?: string;
  items: QuotationItem[];
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount: number;
  status: 'Nháp' | 'Đã gửi' | 'Đã chấp nhận' | 'Hết hạn' | 'Đã hủy';
  terms?: string;
}

export interface Supplier {
    id: string;
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
}

export interface StockEntryItem {
    productId: string;
    productName: string;
    quantity: number;
    costPrice?: number; // Only for 'in' type
}

export interface StockEntry {
    id: string;
    type: 'in' | 'out';
    entry_date: string;
    supplier_id?: string;
    order_id?: string;
    employee_name: string;
    items: StockEntryItem[];
    total_value?: number; // Only for 'in' type
    reason?: string;
}

export interface Shipment {
    id: string;
    order_id: string;
    shipping_partner: string;
    tracking_code?: string;
    status: 'Đã lấy hàng' | 'Đang giao' | 'Phát thành công' | 'Thất bại';
    shipping_fee?: number;
}

export interface Debt {
    id: string;
    entity_id: string; // Customer or Supplier ID
    entity_name: string;
    type: 'receivable' | 'payable'; // Phải thu | Phải trả
    amount: number;
    due_date: string;
    status: 'Chưa đến hạn' | 'Quá hạn' | 'Đã thanh toán';
}

export interface Account {
    id: string;
    name: string;
    type: 'Tiền mặt' | 'Ngân hàng';
    initial_balance: number;
    current_balance?: number; // Calculated on frontend/backend
}
// Fix: Add Inventory interface
export interface Inventory {
    product_id: string;
    product_name: string;
    warehouse_id: string;
    warehouse_name: string;
    quantity: number;
    last_updated: string;
}

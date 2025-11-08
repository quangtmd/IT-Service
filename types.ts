// types.ts

// --- CORE ENTITIES ---

export interface Product {
    id: string;
    name: string;
    mainCategory: string;
    subCategory: string;
    category: string; // This might be redundant, but seems to be used. Let's keep it.
    description: string;
    shortDescription?: string;
    price: number;
    originalPrice?: number;
    stock: number;
    imageUrls?: string[];
    brand?: string;
    tags?: string[];
    specifications: Record<string, string>;
    rating?: number;
    reviews?: number;
    isVisible?: boolean;
    is_featured?: boolean;
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

export interface Article {
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    author: string;
    date: string; // ISO date string
    category: string;
    content: string;
    isAIGenerated?: boolean;
    imageSearchQuery?: string;
}

// --- USER & AUTH ---
export type UserRole = 'admin' | 'staff' | 'customer';
export type StaffRole = 'Quản lý Bán hàng' | 'Biên tập Nội dung' | 'Trưởng nhóm Kỹ thuật' | 'Chuyên viên Hỗ trợ' | 'Nhân viên Toàn quyền';
export const STAFF_ROLE_OPTIONS: StaffRole[] = ['Quản lý Bán hàng', 'Biên tập Nội dung', 'Trưởng nhóm Kỹ thuật', 'Chuyên viên Hỗ trợ', 'Nhân viên Toàn quyền'];

export type UserStatus = 'Đang hoạt động' | 'Tạm khóa';
export const USER_STATUS_OPTIONS: UserStatus[] = ['Đang hoạt động', 'Tạm khóa'];
export type DebtStatus = 'Không có' | 'Có nợ' | 'Quá hạn';

export interface User {
    id: string;
    username: string;
    email: string;
    password?: string;
    role: UserRole;
    staffRole?: StaffRole;
    imageUrl?: string;
    phone?: string;
    address?: string;
    joinDate?: string;
    status?: UserStatus;
    position?: string;
    isLocked?: boolean;
    dateOfBirth?: string;
    origin?: string;
    loyaltyPoints?: number;
    debtStatus?: DebtStatus;
    assignedStaffId?: string;
}

export interface AdminNotification {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: string;
    isRead: boolean;
}

// --- CART & ORDER ---
export interface CartItem extends Product {
    quantity: number;
}

export interface CustomPCBuildCartItem extends CartItem {
    isCustomBuild: true;
    buildComponents: Record<string, { name: string; price?: number }>;
    imageUrl: string; // Overwrite to be required string for custom build.
}

export interface CheckoutFormData {
    fullName: string;
    phone: string;
    address: string;
    email: string;
    notes: string;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface PaymentInfo {
    method: 'Thanh toán khi nhận hàng (COD)' | 'Chuyển khoản ngân hàng' | 'Tiền mặt';
    status: 'Chưa thanh toán' | 'Đã thanh toán';
    amountToPay?: number;
}

export type OrderStatus = 'Phiếu tạm' | 'Chờ xử lý' | 'Đã xác nhận' | 'Đang chuẩn bị' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';

export interface Order {
    id: string;
    userId?: string;
    customerInfo: CheckoutFormData;
    items: OrderItem[];
    totalAmount: number;
    orderDate: string;
    status: OrderStatus;
    paymentInfo: PaymentInfo;
}


// --- PC BUILDER & AI ---
export interface PCComponent {
    type: string;
    name: string;
    price: number;
    details: string;
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


// --- CHATBOT ---
export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot' | 'system';
    timestamp: Date;
    imageUrl?: string;
}

export interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    };
}

export interface ChatLogSession {
    id: string;
    userName: string;
    userPhone: string;
    startTime: string; // ISO string
    messages: ChatMessage[];
}

// --- SITE CONFIG & UI ---

export interface NavLinkItem {
  label: string;
  path: string;
  icon?: string;
  authRequired?: boolean;
}

export interface SubCategoryInfo {
    name: string;
    slug: string;
}

export interface MainCategoryInfo {
    name: string;
    slug: string;
    icon: string;
    subCategories: SubCategoryInfo[];
}

export type ProductCategoryHierarchy = MainCategoryInfo[];

export interface Testimonial {
    id: string;
    name: string;
    quote: string;
    avatarUrl: string;
    role: string;
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

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isVisible: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  description?: string;
  expiryDate?: string;
  isActive: boolean;
  minSpend?: number;
  usageLimit?: number; // per user
  timesUsed: number;
}

export interface SiteThemeSettings {
  primaryColorDefault: string;
  primaryColorLight: string;
  primaryColorDark: string;
  secondaryColorDefault: string;
  secondaryColorLight: string;
  secondaryColorDark: string;
}

export interface CustomMenuLink {
  id: string;
  label: string;
  path: string;
  order: number;
  isVisible: boolean;
  originalPath: string; // to prevent editing of core paths
  icon?: string;
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
    saveText?: string;
    originalPrice?: string;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  uploadedAt: string;
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
  imageDetailUrl: string;
  imageAltText: string;
  imageDetailAltText: string;
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
  benefits: HomepageServiceBenefit[];
  sectionTitleIconUrl?: string; // Optional
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
  contactSectionText?: string; // Optional
  sectionTitleIconUrl?: string; // Optional
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
    otherArticleIds: string[];
    sectionTitleIconUrl?: string;
}

export interface HomepageContactSectionSettings {
    enabled: boolean;
    preTitle: string;
    title: string;
    sectionTitleIconUrl?: string;
}

// --- SITE SETTINGS (Master Object) ---
export interface SMTPSettings { host: string; port: number; user: string; pass: string; secure: boolean; }
export interface PaymentGatewaySettings { momoEnabled: boolean; vnPayEnabled: boolean; paypalEnabled: boolean; }

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

  // Homepage sections
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
  
  // Advanced settings
  smtpSettings: SMTPSettings;
  paymentGateways: PaymentGatewaySettings;
  siteMediaLibrary: MediaItem[];
}

// ADMIN & ERP TYPES

export type AdminView = 'dashboard' | 'products' | 'articles' | 'orders' | 'customers' | 'discounts' | 'faqs' | 'chat_logs' | 'site_settings' | 'media_library' | 'homepage_management' | 'notifications_panel' | 'hrm_dashboard' | 'theme_settings' | 'menu_settings' | 'accounting_dashboard' | 'inventory' | 'service_tickets' | 'quotations' | 'warranty_claims' | 'returns' | 'suppliers';

export type AdminPermission = 
  // General
  | 'viewDashboard' | 'viewNotifications'
  // Sales & CRM
  | 'viewSales' | 'viewCustomers' | 'manageCustomers' | 'viewQuotations' | 'viewOrders' | 'manageOrders' | 'manageDiscounts' | 'viewSuppliers' | 'viewHelpdesk'
  // Service
  | 'viewService' | 'manageServiceTickets' | 'manageWarranty' | 'viewChatLogs'
  // Content
  | 'viewContent' | 'viewProducts' | 'manageProducts' | 'viewArticles' | 'manageArticles' | 'manageMedia' | 'manageFaqs'
  // Inventory
  | 'viewInventory' | 'manageInventory'
  // Finance
  | 'viewAccounting' | 'manageTransactions' | 'managePayroll'
  // Procurement
  | 'viewProcurement'
  // HR & System
  | 'viewSystem' | 'viewHrm' | 'manageEmployees' | 'manageSiteSettings' | 'manageTheme' | 'manageMenu'
  // Analytics
  | 'viewAnalytics'
  // Multi-branch
  | 'viewBranches';


export interface ServiceTicket {
  id: string;
  ticket_code?: string;
  customer_info?: { fullName: string; phone: string; address: string };
  deviceName: string;
  deviceType: string;
  serialNumber?: string;
  reportedIssue: string;
  status: 'Mới' | 'Đang xử lý' | 'Chờ linh kiện' | 'Hoàn thành' | 'Đã đóng';
  createdAt: string; // ISO
  updatedAt: string; // ISO
  assignedTo?: string; // staff user id
  notes?: string;
  cost?: number;
}

export interface Inventory {
  id: string;
  product_id: string;
  product_name?: string;
  warehouse_id: string;
  warehouse_name?: string;
  quantity: number;
  last_updated: string;
}

export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'Doanh thu Bán hàng' | 'Thu nội bộ' | 'Chi phí Nhà Cung Cấp' | 'Chi phí Lương' | 'Chi phí Vận hành' | 'Chi phí Marketing' | 'Chi phí Khác';

export interface FinancialTransaction {
  id: string;
  date: string; // ISO
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  relatedEntity?: string; // e.g., customer id, supplier id
  invoiceNumber?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  payPeriod: string; // YYYY-MM
  baseSalary: number;
  bonus: number;
  deduction: number;
  finalSalary: number;
  status: 'Chưa thanh toán' | 'Đã thanh toán';
  notes?: string;
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
  customerInfo?: { name: string; email: string };
  creation_date: string; // ISO
  expiry_date?: string; // ISO
  items: QuotationItem[];
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount: number;
  status: 'Nháp' | 'Đã gửi' | 'Đã chấp nhận' | 'Hết hạn' | 'Đã hủy';
  terms?: string;
}


export interface ReturnTicket {
  id: string;
  orderId: string;
  reason: string;
  status: 'Đang chờ' | 'Đã duyệt' | 'Đã từ chối';
  refundAmount?: number;
  createdAt: string; // ISO
}

export interface Supplier {
  id: string;
  name: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  paymentTerms?: string;
}

// Fix: Add ServerInfo interface for use in DashboardView
export interface ServerInfo {
    outboundIp: string;
    message: string;
}

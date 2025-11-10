// This file centralizes all type definitions for the application.

// --- Base & Utility Types ---
export type AdminView = 
  | 'dashboard' | 'products' | 'articles' | 'orders' | 'customers' | 'discounts' 
  | 'faqs' | 'chat_logs' | 'site_settings' | 'media_library' | 'notifications_panel'
  | 'homepage_management' | 'theme_settings' | 'menu_settings'
  | 'hrm_dashboard' | 'accounting_dashboard' | 'inventory' | 'service_tickets'
  | 'quotations' | 'warranty_claims' | 'returns' | 'suppliers';

export type NavLinkItem = {
  label: string;
  path: string;
  icon?: string;
  authRequired?: boolean;
};

// --- Site Configuration & Content ---

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
    originalPath: string;
    icon?: string;
    children?: CustomMenuLink[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isVisible: boolean;
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

// --- Homepage Specific Settings ---
export interface HomepageBannerSettings {
    id: string;
    preTitle?: string;
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
    benefits: HomepageServiceBenefit[];
    sectionTitleIconUrl?: string;
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
    order: number;
    alignRight?: boolean;
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
    featuredArticleId: string;
    otherArticleIds: string[];
    sectionTitleIconUrl?: string;
}
export interface HomepageContactSectionSettings {
    enabled: boolean;
    preTitle: string;
    title: string;
    sectionTitleIconUrl?: string;
}


// --- Site Settings ---
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

  // System settings
  smtpSettings: SMTPSettings;
  paymentGateways: PaymentGatewaySettings;
  siteMediaLibrary: MediaItem[];
}

// --- E-commerce & Products ---

export interface SubCategoryInfo {
  name: string;
  slug: string;
}
export interface MainCategoryInfo {
  name: string;
  slug: string;
  icon?: string;
  subCategories: SubCategoryInfo[];
}
export type ProductCategoryHierarchy = MainCategoryInfo[];

export interface Product {
  id: string;
  name: string;
  mainCategory: string;
  subCategory: string;
  category: string; // Kept for legacy compatibility
  price: number;
  originalPrice?: number;
  description: string;
  shortDescription?: string;
  imageUrls: string[];
  specifications: Record<string, string>;
  stock: number;
  brand?: string;
  tags?: string[];
  rating?: number;
  reviews?: number;
  status?: 'Mới' | 'Cũ';
  isVisible: boolean;
  is_featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}
export interface CustomPCBuildCartItem extends CartItem {
  isCustomBuild: true;
  buildComponents: {
    [key: string]: { name: string; price?: number };
  };
  imageUrl: string;
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
  usageLimit?: number;
  timesUsed: number;
}

export type OrderStatus = 'Chờ xử lý' | 'Đang xác nhận' | 'Đang chuẩn bị' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';
export const ORDER_STATUS_OPTIONS: OrderStatus[] = ['Chờ xử lý', 'Đang xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Hoàn thành', 'Đã hủy'];

export interface CheckoutFormData {
    fullName: string;
    phone: string;
    address: string;
    email: string;
    notes: string;
}

export interface PaymentInfo {
    method: 'Thanh toán khi nhận hàng (COD)' | 'Chuyển khoản ngân hàng' | 'Momo' | 'VNPay' | 'PayPal';
    status: 'Chưa thanh toán' | 'Đã thanh toán' | 'Thanh toán thất bại';
    amountToPay?: number; // For deposits
}

export interface Order {
  id: string;
  userId?: string;
  customerInfo: CheckoutFormData;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  totalAmount: number;
  orderDate: string;
  status: OrderStatus;
  paymentInfo: PaymentInfo;
}

// --- Services, Projects, Articles ---

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  imageUrl: string;
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
  imageSearchQuery?: string;
  author: string;
  date: string;
  category: string;
  content?: string;
  isAIGenerated?: boolean;
}
export interface Testimonial {
    id: string;
    name: string;
    quote: string;
    avatarUrl: string;
    role: string;
}

// --- Users & HRM ---

export type UserRole = 'admin' | 'staff' | 'customer';
export type StaffRole = 'Quản lý Bán hàng' | 'Biên tập Nội dung' | 'Trưởng nhóm Kỹ thuật' | 'Chuyên viên Hỗ trợ' | 'Nhân viên Toàn quyền';
export type UserStatus = 'Đang hoạt động' | 'Tạm khóa';
export type DebtStatus = 'Không có' | 'Có nợ' | 'Quá hạn';

export const USER_ROLES: UserRole[] = ['admin', 'staff', 'customer'];
export const STAFF_ROLE_OPTIONS: StaffRole[] = ['Quản lý Bán hàng', 'Biên tập Nội dung', 'Trưởng nhóm Kỹ thuật', 'Chuyên viên Hỗ trợ', 'Nhân viên Toàn quyền'];
export const USER_STATUS_OPTIONS: UserStatus[] = ['Đang hoạt động', 'Tạm khóa'];

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  staffRole?: StaffRole;
  imageUrl?: string;
  joinDate?: string;
  status?: UserStatus;
  position?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  // CRM fields for customers
  origin?: string;
  loyaltyPoints?: number;
  debtStatus?: DebtStatus;
  assignedStaffId?: string;
  isLocked?: boolean;
}

export interface AdminNotification {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: string;
    isRead: boolean;
}

// --- PC Builder ---
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

// --- AI & Chatbot ---

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
    startTime: string;
    messages: ChatMessage[];
}

// --- Financial & Other Business Types ---
export type TransactionType = 'income' | 'expense';
export type TransactionCategory =
    | 'Doanh thu Bán hàng'
    | 'Thu nội bộ'
    | 'Chi phí Nhà Cung Cấp'
    | 'Chi phí Lương'
    | 'Chi phí Vận hành'
    | 'Chi phí Marketing'
    | 'Chi phí Khác';

export interface FinancialTransaction {
  id: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  relatedEntity?: string; // e.g., customer name, supplier name
  invoiceNumber?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  payPeriod: string; // e.g., '2024-07'
  baseSalary: number;
  bonus: number;
  deduction: number;
  finalSalary: number;
  notes: string;
  status: 'Chưa thanh toán' | 'Đã thanh toán';
}

export interface ServiceTicket {
  id: string;
  ticket_code?: string;
  customer_info?: {
      id?: string;
      fullName: string;
      phone: string;
      address?: string;
  };
  deviceName: string;
  deviceType: string;
  serialNumber?: string;
  reportedIssue: string;
  status: 'Mới' | 'Đang xử lý' | 'Chờ linh kiện' | 'Hoàn thành' | 'Đã đóng';
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  product_name?: string; // Joined from products table
  warehouse_name?: string; // Joined from warehouses table
}

export interface Quotation {
  id: string;
  customer_id: string;
  creation_date: string;
  expiry_date: string;
  total_amount: number;
  status: 'Nháp' | 'Đã gửi' | 'Đã chấp nhận' | 'Hết hạn' | 'Đã hủy';
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
  customerInfo?: { // Added for frontend display
      name: string;
      email: string;
  };
}
export interface ReturnTicket {
  id: string;
  orderId: string;
  reason: string;
  status: 'Đang chờ' | 'Đã duyệt' | 'Đã từ chối';
  createdAt: string;
  updatedAt?: string;
  refundAmount?: number;
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

export interface PricingPlan {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    saveText?: string;
    period: string;
    isPopular: boolean;
    features: string[];
    buttonText: string;
    buttonLink: string;
}

// Fix: Add ServerInfo interface
export interface ServerInfo {
  outboundIp: string;
}
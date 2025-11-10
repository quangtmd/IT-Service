// This file aggregates all TypeScript types used across the application.

// --- Core & Auth ---
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
  position?: string; // e.g., 'Founder & CEO'
  status?: UserStatus;
  joinDate?: string;
  phone?: string;
  address?: string;
  imageUrl?: string;
  isLocked?: boolean;
  dateOfBirth?: string;
  origin?: string; // CRM: 'Website', 'Facebook', etc.
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

// --- E-Commerce ---
export interface Product {
  id: string;
  name: string;
  mainCategory: string;
  subCategory: string;
  category: string; // Often a combination or duplicate for simpler filtering
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  imageUrls: string[];
  brand?: string;
  stock: number;
  specifications: Record<string, string | number>;
  tags?: string[];
  rating?: number;
  reviews?: number;
  isVisible: boolean;
  is_featured?: boolean;
  [key: string]: any; // Allow for other dynamic properties if needed
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomPCBuildCartItem extends CartItem {
  isCustomBuild: true;
  buildComponents: { [key: string]: { name: string, price?: number } };
}

export type OrderStatus = 'Phiếu tạm' | 'Chờ xử lý' | 'Đã xác nhận' | 'Đang chuẩn bị' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface PaymentInfo {
    method: 'Thanh toán khi nhận hàng (COD)' | 'Chuyển khoản ngân hàng' | 'Tiền mặt';
    status: 'Chưa thanh toán' | 'Đã thanh toán' | 'Đã cọc';
    amountToPay?: number; // For deposits
}

export interface Order {
  id: string;
  userId?: string;
  customerInfo: CheckoutFormData;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string;
  status: OrderStatus;
  paymentInfo: PaymentInfo;
  notes?: string;
}

export interface CheckoutFormData {
    fullName: string;
    phone: string;
    address: string;
    email: string;
    notes?: string;
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
    timesUsed?: number;
}

export interface ReturnTicket {
  id: string;
  orderId: string;
  reason: string;
  status: 'Đang chờ' | 'Đã duyệt' | 'Đã từ chối';
  refundAmount?: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  paymentTerms: string;
}

export interface Inventory {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  product_name?: string;
  warehouse_name?: string;
}

// --- Content Management (CMS) ---

export interface Article {
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    author: string;
    date: string;
    category: string;
    content: string;
    isAIGenerated?: boolean;
    imageSearchQuery?: string;
}

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

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isVisible: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatarUrl: string;
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
    caption?: string;
}

export interface MediaItem {
    id: string;
    url: string; // dataURL
    name: string;
    type: string;
    uploadedAt: string;
}

// --- PC Builder ---
export interface PCComponent {
  type: string;
  name: string;
  price: number;
  details: string;
}

// --- AI & Chatbot ---

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  imageUrl?: string;
}

export interface ChatLogSession {
  id: string;
  userName: string;
  userPhone: string;
  startTime: string;
  messages: ChatMessage[];
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


export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

// --- Site Configuration & Navigation ---
// Fix: Add ServerInfo type for DashboardView
export interface ServerInfo {
  outboundIp: string;
}

export interface NavLinkItem {
  label: string;
  path: string;
  icon: string;
  authRequired?: boolean;
}

export interface CustomMenuLink {
    id: string;
    label: string;
    path: string;
    order: number;
    isVisible: boolean;
    originalPath?: string; // To know if it's a default link
    // Fix: Make icon required to match NavLinkItem and prevent type errors.
    icon: string;
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

export interface SiteThemeSettings {
    primaryColorDefault: string;
    primaryColorLight: string;
    primaryColorDark: string;
    secondaryColorDefault: string;
    secondaryColorLight: string;
    secondaryColorDark: string;
}

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
    benefits: HomepageServiceBenefit[];
    sectionTitleIconUrl?: string; // Optional icon for the pre-title
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
    contactSectionText?: string; // Optional text near the button
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

// Admin Panel related types
export type AdminView = 
  | 'dashboard' | 'products' | 'articles' | 'orders' | 'customers' 
  | 'hrm_dashboard' | 'discounts' | 'faqs' | 'chat_logs'
  | 'site_settings' | 'theme_settings' | 'menu_settings' | 'media_library' | 'notifications_panel'
  | 'homepage_management' | 'accounting_dashboard'
  | 'inventory' | 'service_tickets' | 'quotations' | 'warranty_claims' | 'returns' | 'suppliers'
  | string; // Allow for other string IDs

// --- Financial Types ---
export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'Doanh thu Bán hàng' | 'Doanh thu Dịch vụ' | 'Chi phí Lương' | 'Chi phí Marketing' | 'Chi phí Vận hành' | 'Chi phí Nhập hàng' | 'Khác';
export interface FinancialTransaction {
    id: string;
    date: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    description: string;
    orderId?: string;
    relatedParty?: string; // Customer or Supplier
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
// Fix: Add missing Debt type
export interface Debt {
    id: string;
    customerId: string;
    orderId?: string;
    amount: number;
    amountPaid: number;
    debtDate: string;
    dueDate?: string;
    status: 'Đang nợ' | 'Quá hạn' | 'Đã thanh toán';
}

// --- Service & Warranty ---
export interface ServiceTicket {
  id: string;
  ticket_code: string;
  customerId?: string;
  customer_info: {
    fullName: string;
    phone: string;
  };
  deviceName: string;
  reported_issue: string;
  status: 'Mới' | 'Đang xử lý' | 'Chờ linh kiện' | 'Hoàn thành' | 'Đã đóng';
  createdAt: string;
  updatedAt: string;
  assigneeId?: string;
  notes?: string;
}

export interface WarrantyClaim {
  id: string;
  claim_code: string;
  order_id: string;
  customer_id?: string;
  customer_name: string;
  product_id: string;
  product_name: string;
  reported_issue: string;
  status: 'Đang tiếp nhận' | 'Đang xử lý' | 'Chờ linh kiện' | 'Hoàn thành' | 'Từ chối';
  created_at: string;
  updated_at: string;
  notes?: string;
}

// --- Quotations ---
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
  creation_date: string;
  expiry_date: string;
  items: QuotationItem[];
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount: number;
  status: 'Nháp' | 'Đã gửi' | 'Đã chấp nhận' | 'Hết hạn' | 'Đã hủy';
  terms?: string;
}
import React from 'react';

// Moved from AuthContext to prevent circular dependency
export type AdminPermission = 
  // General
  | 'viewDashboard' | 'viewNotifications'
  // Sales & CRM
  | 'viewSales' | 'viewCustomers' | 'manageCustomers' | 'viewQuotations' | 'viewOrders' | 'manageOrders' | 'manageDiscounts' | 'viewSuppliers' | 'viewHelpdesk'
  // Service & Warranty
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
  | 'viewBranches'
  ;

export interface Product {
  id: string;
  name: string;
  mainCategory: string; 
  subCategory: string;  
  category: string; 
  price: number;
  originalPrice?: number;
  imageUrls: string[]; 
  description: string; // Detailed description
  shortDescription?: string; // New field for short description
  specifications: Record<string, string>;
  stock: number;
  status?: 'Mới' | 'Cũ' | 'Like new';
  rating?: number;
  reviews?: number;
  brand?: string;
  tags: string[]; // Changed from optional to required, default to []
  brandLogoUrl?: string;
  isVisible?: boolean; // New field for product visibility
  is_featured?: boolean; // Added for featured products
  seoMetaTitle?: string; // New SEO field
  seoMetaDescription?: string; // New SEO field
  slug?: string; // New field for custom URL slug
  productCode?: string; // Added for inventory management
  purchasePrice?: number; // Added for inventory management
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string; // FontAwesome class string
  imageUrl: string; 
  slug: string;     
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  author: string;
  date: string;
  category: string; 
  content?: string; 
  isAIGenerated?: boolean; // New field to mark AI-generated articles
  imageSearchQuery?: string; // New field for AI-suggested image search term
}

export interface CartItem extends Product {
  quantity: number;
  isCustomBuild?: boolean; 
  buildComponents?: Record<string, { name: string; price?: number }>; 
}

export interface CustomPCBuildCartItem extends Product {
  id: string;
  name: string; 
  price: number;
  quantity: number;
  description: string; 
  imageUrl: string; 
  isCustomBuild: true;
  buildComponents: Record<string, { name: string; price?: number }>; 
  mainCategory: "PC Xây Dựng";
  subCategory: "Theo Yêu Cầu";
  category: "PC Xây Dựng";
  imageUrls: [string]; 
  tags: string[];
  specifications: Record<string, string>;
  stock: number; 
}


export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  avatarUrl: string;
  role?: string;
}

export interface NavLinkItem {
  label: string;
  path: string;
  icon?: React.ReactNode; 
  authRequired?: boolean;
  hideWhenAuth?: boolean; 
}

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


export interface PCComponent {
  type: 'CPU' | 'Motherboard' | 'RAM' | 'GPU' | 'SSD' | 'PSU' | 'Case' | string; 
  name: string;
  price?: number;
  imageUrl?: string;
  details?: string;
}

export interface PCBuildConfiguration {
  cpu?: PCComponent;
  motherboard?: PCComponent;
  ram?: PCComponent;
  gpu?: PCComponent;
  ssd?: PCComponent;
  psu?: PCComponent;
  case?: PCComponent;
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

export interface SuggestedComponent {
  CPU: string;
  GPU: string;
  RAM: string;
  Motherboard: string;
  SSD: string;
  PSU: string;
  Case: string;
}

export interface PCBuildSuggestion {
  name: string;
  total_price: number;
  reasoning: string;
  components: SuggestedComponent;
}

export interface AIBuildSuggestionsResponse {
  suggestions: PCBuildSuggestion[];
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web: GroundingChunkWeb;
}

export type AdminView = 
  | 'dashboard'
  // Sales & CRM
  | 'customers' | 'quotations' | 'orders' | 'discounts' | 'returns' | 'suppliers' | 'helpdesk_tickets'
  // Service & Warranty
  | 'service_tickets' | 'warranty_claims' | 'chat_logs' | 'warranty_tickets'
  // CMS & Marketing
  | 'products' | 'articles' | 'media_library' | 'email_marketing' | 'seo_management'
  // Inventory & Logistics
  | 'inventory' | 'stock_receipts' | 'stock_issues' | 'shipping' | 'stock_transfers'
  // Finance & Accounting
  | 'accounting_dashboard' | 'invoices' | 'expenses' | 'debt_management' | 'cashflow_forecast' | 'payment_approval'
  // Procurement
  | 'purchase_requests' | 'purchase_orders' | 'procurement_approval'
  // System & HR
  | 'hrm_dashboard' | 'user_permissions' | 'site_settings' | 'activity_log' | 'contract_management' | 'asset_management' | 'kpi_management'
  // Analytics & Automation
  | 'workflows' | 'notification_center' | 'ai_forecast' | 'branch_reports' | 'system_backup'
  // Multi-branch
  | 'branch_list' | 'branch_permissions' | 'reports_by_branch'
  // Old/Misc that need to be categorized
  | 'faqs' | 'theme_settings' | 'menu_settings' | 'notifications_panel' | 'homepage_management'
  ;

export type UserRole = 'admin' | 'staff' | 'customer';
export type StaffRole = 'Quản lý Bán hàng' | 'Biên tập Nội dung' | 'Trưởng nhóm Kỹ thuật' | 'Chuyên viên Hỗ trợ' | 'Nhân viên Toàn quyền';
export const STAFF_ROLE_OPTIONS: StaffRole[] = ['Quản lý Bán hàng', 'Biên tập Nội dung', 'Trưởng nhóm Kỹ thuật', 'Chuyên viên Hỗ trợ', 'Nhân viên Toàn quyền'];
export type UserStatus = 'Đang hoạt động' | 'Tạm nghỉ' | 'Đã nghỉ việc';
export const USER_STATUS_OPTIONS: UserStatus[] = ['Đang hoạt động', 'Tạm nghỉ', 'Đã nghỉ việc'];


export type DebtStatus = 'Không có' | 'Có nợ' | 'Quá hạn';

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; 
  role: UserRole;
  staffRole?: StaffRole; 
  imageUrl?: string; 
  isLocked?: boolean; 

  // HRM Fields
  position?: string;
  phone?: string;
  address?: string;
  joinDate?: string; 
  status?: UserStatus;
  
  // CRM Fields (for customers)
  dateOfBirth?: string;
  origin?: string;
  loyaltyPoints?: number;
  debtStatus?: DebtStatus;
  assignedStaffId?: string;
}

export interface Project {
  id: string;
  title: string;
  client?: string;
  description: string;
  imageUrl: string;
  technologiesUsed?: string[];
  completionDate?: string;
  category?: string; 
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  address: string;
  email: string;
  notes?: string;
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

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'Chờ xử lý' | 'Đang xác nhận' | 'Đang chuẩn bị' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy' | 'Đã xác nhận' | 'Phiếu tạm';

export interface ShippingInfo {
  carrier?: string;
  trackingNumber?: string;
  shippingStatus?: 'Chưa giao' | 'Đang lấy hàng' | 'Đang giao' | 'Đã giao' | 'Gặp sự cố';
}

export interface PaymentInfo {
  method: 'Thanh toán khi nhận hàng (COD)' | 'Chuyển khoản ngân hàng' | 'Tiền mặt';
  status: 'Chưa thanh toán' | 'Đã thanh toán' | 'Đã cọc';
  transactionId?: string; 
  amountToPay?: number; 
}

export interface Order {
  id: string;
  userId?: string; 
  customerInfo: CheckoutFormData;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string; 
  status: OrderStatus;
  shippingInfo?: ShippingInfo; 
  paymentInfo: PaymentInfo;
  cost?: number; // Added for profit calculation
  paidAmount?: number; // Added for debt calculation
  creatorId?: string; // Added for reports
  profit?: number; // Added for reports
}

export interface AdminNotification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string; 
  isRead: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string; 
  category?: string;
  isVisible?: boolean;
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
  icon?: string; 
  isVisible: boolean;
  originalPath?: string; 
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

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  saveText?: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
  buttonLink?: string;
}

// --- Homepage Content Specific Types ---
export interface HomepageBannerSettings { 
  id: string; 
  preTitle?: string;
  title: string;
  subtitle: string;
  backgroundImageUrl: string; 
  rightColumnImageUrl?: string; 
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageAltText?: string;
  decorTopLeftImageUrl?: string; 
  decorBottomRightImageUrl?: string;
  decorExtraImageUrl?: string; 
  decorExtraText?: string;
  sectionTitleIconUrl?: string; 
  order: number; 
  isActive: boolean; 
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
  preTitle?: string;
  title: string;
  description: string;
  imageUrl: string; 
  imageDetailUrl?: string; 
  imageDetailAltText?: string;
  imageAltText?: string;
  features: HomepageAboutFeature[];
  buttonText: string;
  buttonLink: string;
  sectionTitleIconUrl?: string; 
}

export interface HomepageServiceBenefit {
  id: string;
  iconClass: string;
  title: string;
  description: string;
  link: string;
  bgImageUrlSeed?: string;
  order: number;
}
export interface HomepageServicesBenefitsSettings {
  enabled: boolean;
  preTitle?: string;
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
  preTitle?: string;
  title: string;
  description: string;
  mainImageUrl: string; 
  experienceStatNumber?: string; 
  experienceStatLabel?: string; 
  features: HomepageWhyChooseUsFeature[];
  contactButtonText: string;
  contactButtonLink: string;
  contactSectionText?: string; 
  decorTopLeftImageUrl?: string;
  decorBottomRightImageUrl?: string;
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
  sectionTitleIconUrl?: string; 
}

export interface HomepageFeaturedProjectsItem { 
  id: string; 
  displayOrder: number;
}
export interface HomepageFeaturedProjectsSettings {
  enabled: boolean;
  preTitle?: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  featuredServiceIds: string[]; 
  sectionTitleIconUrl?: string; 
}

export interface HomepageTestimonialItem extends Testimonial { 
    order: number;
}
export interface HomepageTestimonialsSettings {
  enabled: boolean;
  preTitle?: string;
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
  sectionTitleIconUrl?: string; 
}

export interface HomepageProcessStep {
  id: string;
  stepNumber: string; 
  title: string;
  description: string;
  imageUrlSeed: string; 
  shapeUrlSeed?: string; 
  alignRight?: boolean;
  order: number;
}
export interface HomepageProcessSettings {
  enabled: boolean;
  preTitle?: string;
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
  sectionTitleIconUrl?: string; 
}

export interface HomepageBlogPreviewSettings {
  enabled: boolean;
  preTitle?: string;
  title: string;
  featuredArticleId?: string; 
  otherArticleIds: string[]; 
  sectionTitleIconUrl?: string; 
}

export interface HomepageContactSectionSettings {
  enabled: boolean;
  preTitle?: string;
  title: string;
  sectionTitleIconUrl?: string; 
}

export interface LEDBoardItem {
  id: string;
  title: string;
  content: string;
  highlight: string;
  isEnabled: boolean;
  order: number;
  imageUrl?: string;
}

export interface HomepageLEDBoardSettings {
  enabled: boolean;
  items: LEDBoardItem[];
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
  momoApiKey?: string; 
  vnPayApiKey?: string;
  paypalClientId?: string;
}
export interface MediaItem {
  id: string;
  url: string; 
  name: string;
  type: string; 
  uploadedAt: string;
}

// --- Main Site Settings ---
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

  // About Page Specific
  aboutPageTitle: string;
  aboutPageSubtitle: string;
  ourStoryContentMarkdown: string;
  missionStatementMarkdown: string;
  visionStatementMarkdown: string;
  teamMembers: TeamMember[];
  storeImages: StoreImage[];

  // Contact Page Specific
  contactPageTitle: string;
  contactPageSubtitle: string;
  workingHours: string;
  mapEmbedUrl: string; 

  socialFacebookUrl: string;
  socialZaloUrl: string;
  socialYoutubeUrl: string;
  socialInstagramUrl?: string;
  socialTwitterUrl?: string;

  // Homepage Content Sections
  homepageBanners: HomepageBannerSettings[]; 
  homepageLEDBoard?: HomepageLEDBoardSettings; // Added
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

// --- NEW FINANCIAL TYPES ---
export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'Doanh thu Bán hàng' | 'Thu nội bộ' | 'Chi phí Nhà Cung Cấp' | 'Chi phí Lương' | 'Chi phí Vận hành' | 'Chi phí Marketing' | 'Chi phí Khác';

export interface FinancialTransaction {
  id: string;
  date: string; // ISO string date
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  relatedEntity?: string; 
  invoiceNumber?: string;
}

export interface PayrollRecord {
  id: string; 
  employeeId: string;
  employeeName: string;
  payPeriod: string; 
  baseSalary: number;
  bonus: number;
  deduction: number;
  finalSalary: number;
  notes: string;
  status: 'Chưa thanh toán' | 'Đã thanh toán';
}

export interface Inventory {
  product_id: string;
  warehouse_id: string;
  product_name: string;
  warehouse_name: string;
  quantity: number;
}

export interface ServerInfo {
  outboundIp: string;
}

// --- NEW CRM & SALES TYPES ---
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
  creation_date: string; // ISO
  expiry_date?: string; // ISO
  items: QuotationItem[];
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount: number;
  status: 'Nháp' | 'Đã gửi' | 'Đã chấp nhận' | 'Đã hủy' | 'Hết hạn';
  terms?: string;
}

export interface WarrantyClaim {
    id: string;
    claim_code: string;
    order_id: string;
    product_id: string;
    product_name: string;
    customer_id?: string;
    customer_name: string;
    reported_issue: string;
    status: 'Đang tiếp nhận' | 'Đang xử lý' | 'Chờ linh kiện' | 'Hoàn thành' | 'Từ chối';
    created_at: string; // ISO
}

// Added WarrantyTicket if used separately
export interface WarrantyTicket {
    id: string;
    ticketNumber?: string;
    createdAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  paymentTerms?: string;
}

export type ReturnTicketStatus = 'Đang chờ' | 'Đã duyệt' | 'Đã từ chối';
export interface ReturnTicket {
  id: string;
  orderId: string;
  reason?: string;
  status: ReturnTicketStatus;
  refundAmount?: number;
  createdAt: string; // ISO
}

export type ServiceTicketStatus = 'Mới' | 'Đang xử lý' | 'Chờ linh kiện' | 'Hoàn thành' | 'Đã đóng';
export interface ServiceTicket {
  id: string;
  ticket_code: string;
  customer_info?: {
    fullName: string;
    phone: string;
  };
  customerId?: string;
  deviceName: string;
  reported_issue: string;
  createdAt: string; // ISO string date
  status: ServiceTicketStatus;
  assigneeId?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

// New Interfaces for Inventory & Logistics
export interface Warehouse {
  id: string;
  name: string;
  location?: string;
}

export interface StockReceiptItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
}

export interface StockReceipt {
  id: string;
  receiptNumber: string;
  supplierId: string;
  supplierName?: string;
  date: string;
  items: StockReceiptItem[];
  subTotal?: number;
  totalAmount: number;
  discount?: number;
  amountPaid: number;
  paymentMethod?: string;
  status: 'Nháp' | 'Hoàn thành' | 'Đã hủy';
  notes?: string;
}

export interface StockIssueItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface StockIssue {
  id: string;
  issueNumber: string;
  orderId?: string;
  date: string;
  items: StockIssueItem[];
  status: 'Nháp' | 'Hoàn thành' | 'Đã hủy';
  notes?: string;
}

export interface StockTransferItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  date: string;
  sourceWarehouseId: string;
  sourceWarehouseName?: string;
  destWarehouseId: string;
  destWarehouseName?: string;
  items: StockTransferItem[];
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Đang vận chuyển' | 'Hoàn thành' | 'Đã hủy';
  approverId?: string;
  notes?: string;
}

// New Interfaces for Marketing & Audit
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'Nháp' | 'Đã gửi';
  sentAt?: string;
}

export interface EmailSubscriber {
  id: number;
  email: string;
  name?: string;
  subscribedAt: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  source: string;
  cost: number;
  clicks: number;
  conversions: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  targetType: string;
  targetId: string;
  ipAddress: string;
}

// Placeholders for missing types referenced in code
export interface Debt { id: string; }
export interface PaymentApproval { id: string; }
export interface CashflowForecastData { }

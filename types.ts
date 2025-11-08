import React from 'react';
import { AdminPermission } from './contexts/AuthContext';

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

// FIX: Modified CustomPCBuildCartItem to extend Product directly and explicitly define its properties.
// This ensures it correctly implements all Product properties (including `specifications` and `stock`)
// while also adding custom build-specific fields, resolving type compatibility issues with `addToCart`.
export interface CustomPCBuildCartItem extends Product {
  id: string;
  name: string; 
  price: number;
  quantity: number;
  description: string; 
  imageUrl: string; // For CustomPCBuildCartItem, this will usually be a single generic image.
  isCustomBuild: true;
  buildComponents: Record<string, { name: string; price?: number }>; 
  mainCategory: "PC Xây Dựng";
  subCategory: "Theo Yêu Cầu";
  category: "PC Xây Dựng";
  imageUrls: [string]; // Override Product's string[] to a single-element tuple for custom builds
  tags: string[];

  // Explicitly defining specifications and stock to satisfy Product interface,
  // even if they are empty or default for a custom build.
  specifications: Record<string, string>;
  stock: number; 

  // Other optional Product fields can be implicitly inherited or set to undefined
  // if not relevant for a custom build product representation.
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

// New Type for Chat Log Sessions
export interface ChatLogSession {
  id: string; // Unique ID for the session
  userName: string;
  userPhone: string;
  startTime: string; // ISO string date
  messages: ChatMessage[];
  // Optionally, add end time, duration, etc.
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

// Updated AdminView to include all new modules
export type AdminView = 
  | 'dashboard'
  // Sales & CRM
  | 'customers' | 'quotations' | 'orders' | 'discounts' | 'returns' | 'suppliers' | 'helpdesk_tickets'
  // Service & Warranty
  | 'service_tickets' | 'warranty_claims' | 'chat_logs'
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


export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; 
  role: UserRole;
  staffRole?: StaffRole; 
  imageUrl?: string; 
  isLocked?: boolean; // Added for user locking

  // HRM Fields
  position?: string;
  phone?: string;
  address?: string;
  joinDate?: string; // ISO string date
  status?: UserStatus;
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

export type OrderStatus = 'Chờ xử lý' | 'Đang chuẩn bị' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';

export interface ShippingInfo {
  carrier?: string;
  trackingNumber?: string;
  shippingStatus?: 'Chưa giao' | 'Đang lấy hàng' | 'Đang giao' | 'Đã giao' | 'Gặp sự cố';
}

export interface PaymentInfo {
  method: 'Thanh toán khi nhận hàng (COD)' | 'Chuyển khoản ngân hàng';
  status: 'Chưa thanh toán' | 'Đã thanh toán' | 'Đã cọc';
  transactionId?: string; // Optional: For online gateway transaction IDs
  amountToPay?: number; // Optional: To store deposit/full amount to be paid
}

export interface Order {
  id: string;
  customerInfo: CheckoutFormData;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string; 
  status: OrderStatus;
  shippingInfo?: ShippingInfo; // Added for shipping management
  paymentInfo: PaymentInfo;
}

export interface AdminNotification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string; 
  isRead: boolean;
}

// New types for Admin Panel Expansion
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
export interface HomepageBannerSettings { // Renamed from SiteBanner to HomepageBannerSettings for clarity
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
  order: number; // Added for managing multiple banners
  isActive: boolean; // Added for managing multiple banners
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

export interface SMTPSettings {
  host: string;
  port: number;
  user: string;
  pass: string; // Consider secure storage for this if it were a real app
  secure: boolean; // true for 465, false for other ports
}
export interface PaymentGatewaySettings {
  momoEnabled: boolean;
  vnPayEnabled: boolean;
  paypalEnabled: boolean;
  momoApiKey?: string; // Example, real app would have more complex config
  vnPayApiKey?: string;
  paypalClientId?: string;
}
export interface MediaItem {
  id: string;
  url: string; // dataURL or external URL
  name: string;
  type: string; // e.g., 'image/jpeg', 'image/png'
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
  homepageBanners: HomepageBannerSettings[]; // Changed to array for multiple banners
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
  relatedEntity?: string; // e.g., Supplier Name, Customer Name, Employee Name
  invoiceNumber?: string;
}

export interface PayrollRecord {
  id: string; // e.g., 'payroll-2024-08-user001'
  employeeId: string;
  employeeName: string;
  payPeriod: string; // e.g., '2024-08'
  baseSalary: number;
  bonus: number;
  deduction: number;
  finalSalary: number;
  notes: string;
  status: 'Chưa thanh toán' | 'Đã thanh toán';
}
// Fix: Add missing ServiceTicket, Inventory, and ServerInfo types.
export interface ServiceTicket {
  id: string;
  ticket_code: string;
  customer_info: {
    fullName: string;
    phone: string;
  } | null;
  device_name: string;
  reported_issue: string;
  created_at: string; // ISO string date
  status: 'open' | 'in_progress' | 'awaiting_parts' | 'resolved' | 'closed';
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
  customerInfo?: { name: string, email: string }; // Denormalized for display
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
    customer_name: string;
    reported_issue: string;
    status: 'Đang tiếp nhận' | 'Đang xử lý' | 'Chờ linh kiện' | 'Hoàn thành' | 'Từ chối';
    created_at: string; // ISO
}
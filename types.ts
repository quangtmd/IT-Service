import React from 'react';
import { AdminPermission } from './contexts/AuthContext';

// --- Database-aligned Types ---

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentCategoryId: number | null;
  // For frontend processing
  subCategories?: ProductCategory[]; 
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  price: number;
  images: string[] | null;
  category_id: number | null;
  brand: string | null;
  is_published: boolean;
  specs: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  // Joined from categories table
  categoryName?: string;
  // Legacy support for forms
  originalPrice?: number;
  stock: number; // Added from localDataService logic
}


export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  summary: string | null;
  image_url: string | null;
  author_id: string | null;
  category_id: number | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  // For frontend convenience
  author?: string; 
  category?: string;
  isAIGenerated?: boolean;
  imageSearchQuery?: string;
  imageUrl?: string; // Alias for image_url
  createdAt: string; // From old type
  updatedAt: string; // From old type
}


export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  product_name: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export const ORDER_STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];


export interface Order {
  id: number;
  user_id: string | null;
  status: OrderStatus;
  total_amount: number;
  customer_info: CheckoutFormData; 
  shipping_address: any; 
  payment_details: any; 
  created_at: string;
  updated_at: string;
  // Populated by the backend
  items: OrderItem[]; 
  // For frontend compatibility
  totalAmount: number;
  customerInfo: CheckoutFormData;
  paymentDetails: any;
  createdAt: string;
  updatedAt: string;
}

// --- NEW DB TYPES ---
export interface ServiceTicket {
  id: number;
  ticket_code: string;
  customer_id: string | null;
  customer_info: any;
  device_name: string;
  serial_number: string | null;
  reported_issue: string;
  diagnosis: string | null;
  status: 'open' | 'in_progress' | 'awaiting_parts' | 'resolved' | 'closed';
  assigned_to_user_id: string | null;
  quote_for_repair_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string | null;
  is_active: boolean;
}

export interface Inventory {
  product_id: number;
  warehouse_id: number;
  quantity: number;
  // Joined fields
  product_name?: string;
  warehouse_name?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  tax_code: string | null;
}

export interface Bill {
  id: number;
  supplier_id: number;
  bill_number: string | null;
  bill_date: string;
  due_date: string | null;
  total_amount: number;
  status: 'draft' | 'submitted' | 'paid' | 'void';
  created_at: string;
  // Joined field
  supplier_name?: string;
}

export interface EmployeeProfile {
    user_id: string;
    full_name: string;
    date_of_birth: string | null;
    national_id_number: string | null;
    phone?: string; // Not in DB, but useful
    address?: string; // Not in DB, but useful
    join_date: string | null;
    status: UserStatus;
}


// --- Frontend-specific Types ---

export type CartItem = (Product & {
  quantity: number;
}) | CustomPCBuildCartItem;


export interface CustomPCBuildCartItem {
  id: string; // Keep as string for temporary client-side ID
  name: string; 
  price: number;
  quantity: number;
  description: string; 
  isCustomBuild: true;
  buildComponents: Record<string, { name: string; price?: number }>; 
  // For cart display
  images: [string];
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
}

export interface ChatLogSession {
  id: string;
  userName: string;
  userPhone: string;
  startTime: string;
  messages: ChatMessage[];
}

export interface PCComponent {
  type: string; 
  name: string;
  price?: number;
  imageUrl?: string;
  details?: string;
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
  CPU: string; GPU: string; RAM: string; Motherboard: string;
  SSD: string; PSU: string; Case: string;
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
  isLocked?: boolean; 

  position?: string;
  phone?: string;
  address?: string;
  joinDate?: string;
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

export interface MainCategoryInfo extends ProductCategory {
  icon: string;
  subCategories: ProductCategory[];
}

export type SubCategoryInfo = ProductCategory;

export type OrderStatusAdmin = 'Chờ xử lý' | 'Đang chuẩn bị' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';
export const ORDER_STATUS_ADMIN_OPTIONS: OrderStatusAdmin[] = ['Chờ xử lý', 'Đang chuẩn bị', 'Đang giao', 'Hoàn thành', 'Đã hủy'];


export interface ShippingInfo {
  carrier?: string;
  trackingNumber?: string;
  shippingStatus?: 'Chưa giao' | 'Đang lấy hàng' | 'Đang giao' | 'Đã giao' | 'Gặp sự cố';
}

export interface PaymentInfo {
  method: 'Thanh toán khi nhận hàng (COD)' | 'Chuyển khoản ngân hàng';
  status: 'Chưa thanh toán' | 'Đã thanh toán' | 'Đã cọc';
  transactionId?: string; 
  amountToPay?: number; 
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

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
  slug: string;
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

export interface HomepageFeaturedProjectItem { 
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
  socialInstagramUrl?: string;
  socialTwitterUrl?: string;

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

  smtpSettings: SMTPSettings;
  paymentGateways: PaymentGatewaySettings;
  siteMediaLibrary: MediaItem[];
  
  // FIX: Add missing optional properties for FAQs and Discount Codes to support centralized site configuration.
  faqs?: FaqItem[];
  discountCodes?: DiscountCode[];
}

// --- NEW FINANCIAL TYPES ---
export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'Doanh thu Bán hàng' | 'Thu nội bộ' | 'Chi phí Nhà Cung Cấp' | 'Chi phí Lương' | 'Chi phí Vận hành' | 'Chi phí Marketing' | 'Chi phí Khác';

export interface FinancialTransaction {
  id: string;
  date: string; 
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
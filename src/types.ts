import React from 'react';

// Moved AdminPermission from AuthContext to break circular dependency
export type AdminPermission = 
  | 'viewDashboard' | 'viewNotifications'
  | 'viewSales' | 'viewCustomers' | 'manageCustomers' | 'viewQuotations' | 'viewOrders' | 'manageOrders' | 'manageDiscounts' | 'viewSuppliers' | 'viewHelpdesk'
  | 'viewService' | 'manageServiceTickets' | 'manageWarranty' | 'viewChatLogs'
  | 'viewContent' | 'viewProducts' | 'manageProducts' | 'viewArticles' | 'manageArticles' | 'manageMedia' | 'manageFaqs'
  | 'viewInventory' | 'manageInventory'
  | 'viewAccounting' | 'manageTransactions' | 'managePayroll'
  | 'viewProcurement'
  | 'viewSystem' | 'viewHrm' | 'manageEmployees' | 'manageSiteSettings' | 'manageTheme' | 'manageMenu'
  | 'viewAnalytics'
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
  description: string;
  shortDescription?: string;
  specifications: Record<string, string>;
  stock: number;
  status?: 'Mới' | 'Cũ' | 'Like new';
  rating?: number;
  reviews?: number;
  brand?: string;
  tags: string[];
  brandLogoUrl?: string;
  isVisible?: boolean;
  is_featured?: boolean;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  slug?: string;
  // Added fields
  productCode?: string;
  purchasePrice?: number;
  wholesalePrice?: number;
  hasVAT?: boolean;
  barcode?: string;
  unit?: string;
  warrantyPeriod?: number;
  countryOfOrigin?: string;
  yearOfManufacture?: number;
  supplierId?: string;
  supplierName?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
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
  isAIGenerated?: boolean;
  imageSearchQuery?: string;
  tags?: string[];
  slug?: string;
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
  icon?: string; 
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
  | 'reports'
  | 'partners'
  | 'system_management'
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
  salary?: number;
  
  // CRM Fields (for customers)
  dateOfBirth?: string;
  origin?: string;
  loyaltyPoints?: number;
  debtStatus?: DebtStatus;
  assignedStaffId?: string;
  createdAt?: string;
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
  purchasePrice?: number;
  unit?: string;
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
  creatorId?: string;
  creatorName?: string;
  customerInfo: CheckoutFormData;
  items: OrderItem[];
  subtotal?: number;
  totalAmount: number;
  paidAmount?: number;
  cost?: number;
  profit?: number;
  orderDate: string; 
  status: OrderStatus;
  shippingInfo?: ShippingInfo; 
  paymentInfo: PaymentInfo;
  notes?: string;
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

// --- LED Board Item ---
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
  altText?: string;
  associatedEntityType?: 'product' | 'article';
  associatedEntityId?: string;
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
  homepageLEDBoard?: HomepageLEDBoardSettings; // Added LED board settings
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

export type WarrantyTicketStatus = 
  | 'Mới Tạo' | 'Chờ duyệt' | 'Đã duyệt' | 'Đang sửa chữa' | 'Hoàn thành' | 'Đã trả khách' 
  | 'Chờ linh kiện' | 'Đợi KH đồng ý giá' | 'Đợi KH nhận lại' 
  | 'Từ chối bảo hành' | 'Hủy' | 'Lập chứng từ' | 'Đang duyệt' | 'Đang thực hiện' | 'Chờ xem lại';

export interface WarrantyTicketItem {
    id: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    price: number;
}

export interface WarrantyTicket {
    id: string;
    ticketNumber: string;
    productModel?: string;
    productSerial?: string;
    customerName: string;
    creatorName?: string;
    customerPhone?: string;
    totalAmount: number;
    status: WarrantyTicketStatus;
    createdAt: string;
    reportedIssue: string;
    resolution_notes?: string;
    receiveDate?: string;
    returnDate?: string;
    orderId?: string;
    productId?: string;
    customerId?: string;
    creatorId?: string;
    priority?: 'Bình thường' | 'Gấp';
    warrantyType?: string;
    technician_notes?: string;
    repairDate?: string;
    returnStaffId?: string;
    returnStaffName?: string;
    items?: WarrantyTicketItem[];
    serviceFee?: number;
    discount?: number;
    vat?: number;
    transactionType?: 'Sửa chữa' | 'Bảo dưỡng' | 'Thay thế' | 'Bảo hành';
    department?: string;
    departmentCode?: string;
    currency?: string;
    totalQuantity?: number;
    paymentStatus?: 'Chưa thanh toán' | 'Đã thanh toán' | 'Công nợ';
    paymentNotes?: string;
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

export type ServiceTicketStatus = 'Mới' | 'Mới tiếp nhận' | 'Đang xử lý' | 'Chờ linh kiện' | 'Đợi KH đồng ý giá' | 'Đợi KH nhận lại' | 'Hoàn thành' | 'Đã đóng' | 'Không đồng ý sửa máy' | 'Hủy bỏ';
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
  invoiceId?: string;
  receiverId?: string;
  work_items?: string;
  appointment_date?: string;
  physical_condition?: string;
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
  paymentMethod?: 'Tiền mặt' | 'Thẻ';
  status: 'Nháp' | 'Hoàn thành' | 'Công nợ';
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
  status: 'Nháp' | 'Đã gửi' | 'Đang gửi';
  sentAt?: string;
  createdAt: string;
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
  startDate?: string;
  endDate?: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  username: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  ipAddress?: string;
}

export interface Debt {
    id: string;
    entityId: string; // Customer or Supplier ID
    entityName: string;
    entityType: 'customer' | 'supplier';
    type: 'receivable' | 'payable'; // Phải thu | Phải trả
    amount: number;
    dueDate?: string;
    relatedTransactionId?: string;
    status: 'Chưa thanh toán' | 'Đã thanh toán' | 'Quá hạn';
}

export interface PaymentApproval {
    id: string;
    requestorId: string;
    approverId?: string;
    amount: number;
    description: string;
    relatedTransactionId?: string;
    status: 'Chờ duyệt' | 'Đã duyệt' | 'Đã từ chối';
    createdAt: string;
}

export interface CashflowForecastData {
    [month: string]: {
        income: number;
        expense: number;
    };
}

export interface BackendHealthStatus {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  errorCode?: string;
  message?: string;
}

export interface Contract {
  id: string;
  name: string;
  partnerName: string;
  partnerType: 'customer' | 'supplier' | 'employee';
  startDate: string;
  endDate: string;
  fileUrl?: string;
  status: 'active' | 'expired' | 'terminated';
}

export interface Asset {
  id: string;
  name: string;
  serialNumber?: string;
  purchaseDate: string;
  value: number;
  assignedToId?: string;
  assignedToName?: string;
  status: 'in_use' | 'in_storage' | 'decommissioned';
}

export interface KPI {
  id: string;
  name: string;
  targetValue: number;
  unit: string;
  period: 'monthly' | 'quarterly' | 'yearly';
}

export interface EmployeeKPI {
  id: string;
  employeeId: string;
  kpiId: string;
  actualValue: number;
  period: string; // e.g., '2024-08'
}
export interface ProductReview {
    id: string;
    productId: string;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: string;
}
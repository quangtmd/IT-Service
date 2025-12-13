
import { 
    NavLinkItem, ProductCategoryHierarchy, StaffRole, SiteSettings, FaqItem, DiscountCode, 
    SiteThemeSettings, CustomMenuLink, PricingPlan, UserRole,
    HomepageBannerSettings, HomepageAboutSettings, HomepageAboutFeature, 
    HomepageServiceBenefit, HomepageServicesBenefitsSettings,
    HomepageWhyChooseUsFeature, HomepageWhyChooseUsSettings,
    HomepageStatItem, HomepageStatsCounterSettings,
    HomepageFeaturedProjectsSettings, HomepageTestimonialItem, HomepageTestimonialsSettings,
    HomepageBrandLogo, HomepageBrandLogosSettings,
    HomepageProcessStep, HomepageProcessSettings,
    HomepageCallToActionSettings, HomepageBlogPreviewSettings, HomepageContactSectionSettings,
    SMTPSettings, PaymentGatewaySettings, MediaItem, Warehouse, StockReceipt,
    TeamMember, StoreImage, Testimonial,
    LEDBoardItem, HomepageLEDBoardSettings
} from './types';

export const ADMIN_EMAIL = "quangtmdit@gmail.com"; 

export const API_KEY_ERROR_MESSAGE = "API Key chưa được cấu hình. Vui lòng đặt biến môi trường VITE_GEMINI_API_KEY.";

// --- BACKEND API CONFIGURATION ---
// FIX: Sử dụng URL Backend chính xác để đảm bảo kết nối
export const BACKEND_API_BASE_URL = "https://it-service-app-n9as.onrender.com";

// --- STORAGE KEYS ---
export const SITE_LOGO_STORAGE_KEY = "siteLogoUrl_v1";
export const SITE_CONFIG_STORAGE_KEY = 'siteConfiguration_v3';
export const FAQ_STORAGE_KEY = 'siteFAQs_v1';
export const DISCOUNTS_STORAGE_KEY = 'siteDiscountCodes_v1';
export const THEME_SETTINGS_STORAGE_KEY = 'siteThemeSettings_v1';
export const CUSTOM_MENU_STORAGE_KEY = 'siteCustomMenu_v1';
export const PRODUCTS_STORAGE_KEY = 'siteProducts_v1';
export const ORDERS_STORAGE_KEY = 'siteOrders_v1';
export const CHAT_LOGS_STORAGE_KEY = 'siteChatLogs_v1'; // For storing chat logs
export const CHATBOT_AUTO_OPENED_KEY = 'chatbotAutoOpened_v1'; // Uses sessionStorage for per-session auto-open
export const FINANCIAL_TRANSACTIONS_STORAGE_KEY = 'siteFinancialTransactions_v1';
export const PAYROLL_RECORDS_STORAGE_KEY = 'sitePayrollRecords_v1';
export const ADMIN_NOTIFICATIONS_STORAGE_KEY = 'adminNotifications_v1';
export const WAREHOUSES_STORAGE_KEY = 'siteWarehouses_v1';
export const STOCK_RECEIPTS_STORAGE_KEY = 'siteStockReceipts_v1';
export const STOCK_ISSUES_STORAGE_KEY = 'siteStockIssues_v1';
export const STOCK_TRANSFERS_STORAGE_KEY = 'siteStockTransfers_v1';
export const RECENTLY_VIEWED_STORAGE_KEY = 'recentlyViewedProducts_v1';


// --- BANKING INFO ---
export const BANK_ACCOUNT_NAME = "TRAN MINH QUANG";
export const BANK_ACCOUNT_NUMBER = "0501000136537";
export const BANK_NAME = "Vietcombank (Ngân hàng TMCP Ngoại thương Việt Nam)";
export const VIETCOMBANK_ID = "970436";
export const DEPOSIT_PERCENTAGE = 0.3; // 30% deposit

// --- COMPANY INFO & NAVIGATION ---
export const COMPANY_NAME = "IQ Technology";
export const COMPANY_SLOGAN = "Giải Pháp Công Nghệ Toàn Diện";
export const COMPANY_PHONE = "0911.855.055";
export const COMPANY_EMAIL = "quangtmdit@gmail.com";
export const COMPANY_ADDRESS = "10 Huỳnh Thúc Kháng, Hải Châu, Đà Nẵng";
export const WORKING_HOURS = "Thứ 2 - Thứ 7: 8:00 - 18:00";
export const MAP_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.113824884246!2d108.22155801485837!3d16.05944398888798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219a843555555%3A0x925181abe76a1351!2zS2nhu4d0IDEvMSBIdeG7s25oIFRow7pjIEtow6FuZywgQsOsbmggSGnDqm4sIEjhuqNpIENow6J1LCDEkMOgIE7hurVuZywgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1657880788645!5m2!1svi!2s";
export const PC_BUILDER_PATH = '/pc-builder';

export const NAVIGATION_LINKS_BASE: NavLinkItem[] = [
  { label: 'Trang chủ', path: '/', icon: 'fas fa-home' },
  { label: 'Sản phẩm', path: '/shop', icon: 'fas fa-store' },
  { label: 'Xây dựng PC', path: PC_BUILDER_PATH, icon: 'fas fa-tools' },
  { label: 'Dịch vụ IT', path: '/services', icon: 'fas fa-headset' },
  { label: 'Dự án', path: '/projects', icon: 'fas fa-project-diagram' },
  { label: 'Tin tức', path: '/blog', icon: 'fas fa-newspaper' },
  { label: 'Về chúng tôi', path: '/about', icon: 'fas fa-info-circle' },
  { label: 'Liên hệ', path: '/contact', icon: 'fas fa-envelope' },
];

export const GENERIC_PC_BUILD_IMAGE_URL = 'https://hanoicomputercdn.com/media/product/250_65321_hacom_general_pc_gaming_001.png';

// --- CATEGORIES & USE CASES ---
export const PRODUCT_CATEGORIES_HIERARCHY: ProductCategoryHierarchy = [
  { name: "Máy tính để bàn (PC)", slug: "may_tinh_de_ban", icon: "fas fa-desktop", subCategories: [ { name: "Máy tính văn phòng", slug: "pc_van_phong" }, {name: "Máy tính Gaming", slug: "pc_gaming"}, {name: "Workstation (Máy trạm)", slug:"pc_workstation"}, { name: "Máy đồng bộ", slug: "pc_dong_bo" }, ] },
  { name: "Laptop", slug: "laptop", icon: "fas fa-laptop", subCategories: [ { name: "Laptop văn phòng", slug: "laptop_van_phong" }, {name: "Laptop Gaming", slug: "laptop_gaming"}, {name: "MacBook", slug:"macbook"}, { name: "Laptop cũ", slug: "laptop_cu" }, ] },
  { name: "Linh kiện máy tính", slug: "linh_kien_may_tinh", icon: "fas fa-microchip", subCategories: [ { name: "CPU (Vi xử lý Intel, AMD)", slug: "cpu" }, { name: "RAM (DDR4, DDR5…)", slug: "ram" }, { name: "Ổ cứng HDD / SSD (SATA, NVMe)", slug: "storage" }, { name: "VGA (Card màn hình)", slug: "vga" }, { name: "Bo mạch chủ (Mainboard)", slug: "mainboard"}, { name: "Nguồn máy tính (PSU)", slug: "psu"}, { name: "Vỏ máy (Case)", slug: "case"}, { name: "Tản nhiệt (Khí, Nước)", slug: "cooling"} ] },
  { name: "Thiết bị ngoại vi", slug: "thiet_bi_ngoai_vi", icon: "fas fa-keyboard", subCategories: [ { name: "Màn hình (LCD, LED, 2K, 4K, Gaming…)", slug: "man_hinh" }, { name: "Bàn phím (Cơ, Giả cơ, Thường)", slug: "ban_phim" }, { name: "Chuột (Gaming, Văn phòng)", slug: "chuot" }, { name: "Tai nghe (Có dây, Không dây)", slug: "tai_nghe" } ] },
  { name: "Camera giám sát", slug: "camera_giam_sat", icon: "fas fa-video", subCategories: [ { name: "Camera IP (WiFi / LAN)", slug: "camera_ip" }, { name: "Đầu ghi hình (DVR, NVR)", slug: "dau_ghi_hinh" } ] },
  { name: "Thiết bị mạng", slug: "thiet_bi_mang", icon: "fas fa-wifi", subCategories: [ { name: "Router WiFi (TP-Link, Asus, UniFi…)", slug: "router_wifi" }, { name: "Switch mạng (PoE, Thường)", slug: "switch_mang" } ] },
  { name: "Phần mềm & dịch vụ", slug: "phan_mem_dich_vu", icon: "fas fa-cogs", subCategories: [ { name: "Bản quyền Windows, Office", slug: "ban_quyen_phan_mem" }, { name: "Dịch vụ cài đặt (Tận nơi / Online)", slug: "dich_vu_cai_dat" } ] },
  { name: "Phụ kiện & thiết bị khác", slug: "phu_kien_khac", icon: "fas fa-plug", subCategories: [ { name: "Cáp chuyển, Hub USB, Docking", slug: "cap_hub_docking" }, { name: "Balo, Túi chống sốc", slug: "balo_tui" } ] },
  { name: "PC Xây Dựng", slug: "pc_xay_dung", icon: "fas fa-tools", subCategories: [ { name: "Theo Yêu Cầu", slug: "theo_yeu_cau" } ] }
];
export const ARTICLE_CATEGORIES: string[] = ['Dịch vụ IT', 'Hướng dẫn', 'So sánh', 'Đánh giá', 'Bảo mật', 'Tin tức công nghệ'];
export const USE_CASES = ['PC Gaming', 'PC Đồ họa - Render', 'PC Văn phòng', 'PC Workstation', 'PC Streamer'];


// --- INITIAL DYNAMIC DATA ---

export const INITIAL_WAREHOUSES: Warehouse[] = [
    { id: 'wh001', name: 'Kho Chính', location: '10 Huỳnh Thúc Kháng, Đà Nẵng' },
    { id: 'wh002', name: 'Kho Dịch vụ', location: '10 Huỳnh Thúc Kháng, Đà Nẵng' },
];

export const INITIAL_STOCK_RECEIPTS: StockReceipt[] = [
    {
        id: 'sr001', receiptNumber: 'PN000001', supplierId: 'SUP001', supplierName: 'Nhà phân phối Tin học Mai Hoàng',
        date: new Date().toISOString(),
        items: [
            { productId: 'CPU001', productName: 'CPU Intel Core i5-14600K', quantity: 10, purchasePrice: 8000000 },
            { productId: 'VGA001', productName: 'VGA GIGABYTE GeForce RTX 4060', quantity: 5, purchasePrice: 8200000 },
        ],
        subTotal: 121000000,
        discount: 0,
        totalAmount: 121000000,
        amountPaid: 121000000,
        paymentMethod: 'Tiền mặt',
        status: 'Hoàn thành'
    }
];

export const INITIAL_HOMEPAGE_BANNERS: HomepageBannerSettings[] = [
    {
        id: 'banner1',
        preTitle: "GIẢI PHÁP CÔNG NGHỆ CHO DOANH NGHIỆP",
        title: "Đối Tác Công Nghệ Tin Cậy Của Doanh Nghiệp",
        subtitle: "Chúng tôi cung cấp chuyên môn và sự hỗ trợ để giúp bạn vượt qua sự phức tạp của bối cảnh kỹ thuật số, đảm bảo công nghệ của bạn phù hợp với mục tiêu kinh doanh.",
        backgroundImageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1920&auto=format&fit=crop",
        rightColumnImageUrl: "https://polite-opossum.10web.cloud/wp-content/uploads/sites/91/2024/02/Group_gLnp.png",
        primaryButtonText: "Dịch Vụ Của Chúng Tôi",
        primaryButtonLink: "/services",
        secondaryButtonText: "Liên Hệ Ngay",
        secondaryButtonLink: "/contact",
        order: 1,
        isActive: true,
    }
];

export const INITIAL_LED_BOARD_ITEMS: LEDBoardItem[] = [
  { id: 'led1', title: 'KHUYẾN MÃI HOT', content: 'Giảm ngay 20% cho dịch vụ Build PC Gaming trọn gói trong tháng này!', highlight: 'Ưu đãi có hạn', isEnabled: true, order: 1 },
  { id: 'led2', title: 'DỊCH VỤ MỚI', content: 'Miễn phí vệ sinh & bảo dưỡng PC khi nâng cấp Ram/SSD tại cửa hàng.', highlight: 'Đặt lịch ngay', isEnabled: true, order: 2 },
  { id: 'led3', title: 'HỖ TRỢ 24/7', content: 'Đội ngũ kỹ thuật viên sẵn sàng hỗ trợ sự cố tận nơi cho doanh nghiệp.', highlight: 'Hotline: 0911.855.055', isEnabled: true, order: 3 },
];

export const INITIAL_HOMEPAGE_LED_BOARD: HomepageLEDBoardSettings = {
  enabled: true,
  items: INITIAL_LED_BOARD_ITEMS,
};

export const INITIAL_HOMEPAGE_ABOUT_FEATURES: HomepageAboutFeature[] = [
  { id: 'feat1', icon: 'fas fa-briefcase', title: 'Dịch vụ IT Doanh Nghiệp', description: 'Giảm chi phí và lao động phòng CNTT.', link: '/services' },
  { id: 'feat2', icon: 'fas fa-lightbulb', title: 'Giải pháp CNTT Doanh Nghiệp', description: 'Cung cấp các giải pháp CNTT tối ưu cho Doanh Nghiệp', link: '/services' }
];

export const INITIAL_HOMEPAGE_ABOUT: HomepageAboutSettings = {
  enabled: true,
  preTitle: "VỀ CHÚNG TÔI",
  title: "IQ Technology Hiểu Nỗi Lo Của Bạn Về CNTT Và Cam Kết Mang Đến Chất Lượng Tốt Nhất!",
  description: "Tại IQ Technology, chúng tôi chuyên cung cấp các giải pháp và dịch vụ IT toàn diện phù hợp với nhu cầu và mục tiêu độc đáo của các doanh nghiệp ở mọi quy mô. Với một...",
  imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1784&auto=format&fit=crop",
  features: INITIAL_HOMEPAGE_ABOUT_FEATURES,
  buttonText: "Tìm Hiểu Thêm",
  buttonLink: "/about",
};

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
    { id: 'tm001', name: 'Trần Minh Quang', role: 'Founder & CEO', quote: 'Đam mê công nghệ và luôn tìm kiếm giải pháp tối ưu nhất cho khách hàng.', imageUrl: 'https://picsum.photos/seed/ceo/200/200' },
    { id: 'tm002', name: 'Lê Hùng', role: 'Trưởng nhóm Kỹ thuật', quote: 'Không có vấn đề gì về phần cứng mà chúng tôi không thể giải quyết.', imageUrl: 'https://picsum.photos/seed/techlead/200/200' },
    { id: 'tm003', name: 'Nguyễn Thị Lan', role: 'Trưởng phòng Kinh doanh', quote: 'Sự hài lòng của khách hàng là ưu tiên hàng đầu của chúng tôi.', imageUrl: 'https://picsum.photos/seed/saleslead/200/200' },
];

export const INITIAL_STORE_IMAGES: StoreImage[] = [
    { id: 'si001', url: 'https://images.unsplash.com/photo-1558137623-ce9384355333?q=80&w=800&auto=format&fit=crop', caption: 'Khu vực trưng bày sản phẩm' },
    { id: 'si002', url: 'https://images.unsplash.com/photo-1603561588824-0c4a171d6b82?q=80&w=800&auto=format&fit=crop', caption: 'Xưởng dịch vụ kỹ thuật' },
];

export const INITIAL_FAQS: FaqItem[] = [
    { id: 'faq1', question: 'Cửa hàng có hỗ trợ trả góp không?', answer: 'Có, chúng tôi hỗ trợ trả góp qua thẻ tín dụng và các công ty tài chính. Vui lòng liên hệ để biết thêm chi tiết.', category: 'Thanh toán', isVisible: true },
    { id: 'faq2', question: 'Thời gian bảo hành sản phẩm là bao lâu?', answer: 'Thời gian bảo hành tùy thuộc vào từng sản phẩm và nhà sản xuất, thường từ 12 đến 36 tháng. Thông tin chi tiết được ghi rõ trên trang sản phẩm.', category: 'Bảo hành', isVisible: true },
];

export const INITIAL_DISCOUNT_CODES: DiscountCode[] = [
    { id: 'dc1', code: 'WELCOME10', type: 'percentage', value: 10, description: 'Giảm 10% cho đơn hàng đầu tiên', isActive: true },
];

export const INITIAL_THEME_SETTINGS: SiteThemeSettings = {
    primaryColorDefault: '#ef4444', primaryColorLight: '#f87171', primaryColorDark: '#dc2626',
    secondaryColorDefault: '#991b1b', secondaryColorLight: '#b91c1c', secondaryColorDark: '#7f1d1d',
};

export const INITIAL_CUSTOM_MENU_LINKS: CustomMenuLink[] = NAVIGATION_LINKS_BASE.map((link, index) => ({
    ...link,
    id: `menu-${index}`,
    order: index + 1,
    isVisible: true,
}));

export const MOCK_PRICING_PLANS_DATA: PricingPlan[] = [
    { id: 'plan1', name: 'IT Doanh nghiệp cơ bản', price: 'Liên hệ', period: '', features: ['Hỗ trợ từ xa 8/5', 'Bảo trì định kỳ', 'Tư vấn phần mềm'], buttonLink: '/contact' },
    { id: 'plan2', name: 'IT Doanh nghiệp Pro', price: 'Liên hệ', period: '', features: ['Mọi thứ trong gói Cơ bản', 'Hỗ trợ tận nơi', 'Quản trị máy chủ', 'Bảo mật nâng cao'], isPopular: true, buttonLink: '/contact' },
    { id: 'plan3', name: 'IT Toàn diện (VIP)', price: 'Liên hệ', period: '', features: ['Mọi thứ trong gói Pro', 'Hỗ trợ 24/7', 'Quản trị hệ thống mạng', 'Backup & Recovery'], buttonLink: '/contact' },
    { id: 'plan4', name: 'Gói tùy chỉnh', price: 'Liên hệ', period: '', features: ['Thiết kế giải pháp riêng', 'Phù hợp mọi quy mô', 'Chi phí linh hoạt'], buttonLink: '/contact' }
];

export const MOCK_TESTIMONIALS_DATA: Testimonial[] = [
  { id: '1', name: 'Nguyễn Văn An', quote: 'Dịch vụ sửa chữa PC rất nhanh chóng và chuyên nghiệp. Máy tôi giờ chạy êm ru. Cảm ơn IQ Technology!', avatarUrl: `https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=100&auto=format&fit=crop`, role: 'Khách hàng Cá nhân' },
  { id: '2', name: 'Trần Thị Bích Hợp', quote: 'Được tư vấn cấu hình PC Gaming rất ưng ý, giá cả cũng hợp lý. Các bạn kỹ thuật viên nhiệt tình.', avatarUrl: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop`, role: 'Game thủ' },
  { id: '3', name: 'Công ty TNHH ABC', quote: 'IQ Technology đã hỗ trợ chúng tôi bảo trì toàn bộ hệ thống máy tính văn phòng. Rất hài lòng về chất lượng và thái độ phục vụ.', avatarUrl: `https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop`, role: 'Khách hàng Doanh nghiệp' },
];

export const INITIAL_HOMEPAGE_SERVICES_BENEFITS: HomepageServicesBenefitsSettings = {
    enabled: true,
    preTitle: "DỊCH VỤ CỦA CHÚNG TÔI",
    title: "Giải Pháp IT Toàn Diện & Chuyên Nghiệp",
    benefits: [
      { id: 'benefit1', order: 1, iconClass: 'fas fa-shield-alt', title: 'Bảo Mật & An Toàn', description: 'Bảo vệ dữ liệu và hệ thống của bạn khỏi các mối đe dọa an ninh mạng.', link: '/services' },
      { id: 'benefit2', order: 2, iconClass: 'fas fa-headset', title: 'Hỗ Trợ Kỹ Thuật 24/7', description: 'Đội ngũ chuyên gia luôn sẵn sàng giải quyết mọi sự cố của bạn.', link: '/services' },
      { id: 'benefit3', order: 3, iconClass: 'fas fa-cloud-upload-alt', title: 'Giải Pháp Đám Mây', description: 'Tối ưu hóa hạ tầng, tăng cường linh hoạt với công nghệ điện toán đám mây.', link: '/services' }
    ]
};

export const INITIAL_HOMEPAGE_WHY_CHOOSE_US: HomepageWhyChooseUsSettings = {
    enabled: true,
    preTitle: "TẠI SAO CHỌN CHÚNG TÔI",
    title: "Đối Tác Công Nghệ Đáng Tin Cậy",
    description: "Với kinh nghiệm và sự tận tâm, chúng tôi cam kết mang lại các giải pháp IT hiệu quả, giúp doanh nghiệp bạn vận hành mượt mà và phát triển bền vững.",
    mainImageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=800&auto=format&fit=crop',
    experienceStatNumber: '10+',
    experienceStatLabel: 'Năm kinh nghiệm',
    features: [
      { id: 'wcu1', iconClass: 'fas fa-users-cog', title: 'Đội ngũ chuyên gia', description: 'Kỹ thuật viên lành nghề, giàu kinh nghiệm thực chiến.' },
      { id: 'wcu2', iconClass: 'fas fa-handshake', title: 'Đối tác tin cậy', description: 'Luôn đặt lợi ích của khách hàng lên hàng đầu.' },
      { id: 'wcu3', iconClass: 'fas fa-lightbulb', title: 'Giải pháp sáng tạo', description: 'Cập nhật công nghệ mới nhất để giải quyết vấn đề của bạn.' }
    ],
    contactButtonText: "Liên Hệ Tư Vấn",
    contactButtonLink: "/contact"
};

export const INITIAL_HOMEPAGE_STATS_COUNTER: HomepageStatsCounterSettings = {
    enabled: true,
    stats: [
        { id: 'stat1', order: 1, iconClass: 'fas fa-users', count: '500+', label: 'Khách hàng tin tưởng' },
        { id: 'stat2', order: 2, iconClass: 'fas fa-project-diagram', count: '1000+', label: 'Dự án hoàn thành' },
        { id: 'stat3', order: 3, iconClass: 'fas fa-award', count: '10+', label: 'Năm kinh nghiệm' },
        { id: 'stat4', order: 4, iconClass: 'fas fa-headset', count: '24/7', label: 'Hỗ trợ' }
    ]
};

export const INITIAL_HOMEPAGE_FEATURED_PROJECTS: HomepageFeaturedProjectsSettings = {
    enabled: true,
    preTitle: "DỰ ÁN NỔI BẬT",
    title: "Các Dịch Vụ Chính Của Chúng Tôi",
    buttonText: "Xem Tất Cả Dịch Vụ",
    buttonLink: "/services",
    featuredServiceIds: ['svc001', 'svc002', 'svc006']
};

export const INITIAL_HOMEPAGE_TESTIMONIALS: HomepageTestimonialsSettings = {
    enabled: true,
    preTitle: "KHÁCH HÀNG NÓI VỀ CHÚNG TÔI",
    title: "Phản Hồi Từ Những Người Đã Tin Tưởng",
    testimonials: MOCK_TESTIMONIALS_DATA.map((t, i) => ({ ...t, order: i + 1 }))
};

export const INITIAL_HOMEPAGE_BRAND_LOGOS: HomepageBrandLogosSettings = {
    enabled: true,
    logos: [
        { id: 'logo1', order: 1, name: 'Intel', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282020%2C_dark_blue%29.svg' },
        { id: 'logo2', order: 2, name: 'AMD', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg' },
        { id: 'logo3', order: 3, name: 'NVIDIA', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Nvidia_logo.svg/320px-Nvidia_logo.svg.png' },
        { id: 'logo4', order: 4, name: 'ASUS', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Asus_logo.svg' },
        { id: 'logo5', order: 5, name: 'GIGABYTE', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Gigabyte_Technology_logo.svg/320px-Gigabyte_Technology_logo.svg.png' }
    ]
};

export const INITIAL_HOMEPAGE_PROCESS: HomepageProcessSettings = {
    enabled: true,
    preTitle: "QUY TRÌNH LÀM VIỆC",
    title: "Chúng Tôi Làm Việc Như Thế Nào?",
    steps: [
        { id: 'step1', order: 1, stepNumber: '01', title: 'Tiếp nhận yêu cầu', description: 'Lắng nghe và phân tích nhu cầu của khách hàng.', imageUrlSeed: 'contact' },
        { id: 'step2', order: 2, stepNumber: '02', title: 'Tư vấn giải pháp', description: 'Đề xuất các phương án tối ưu và phù hợp nhất.', imageUrlSeed: 'consulting', alignRight: true },
        { id: 'step3', order: 3, stepNumber: '03', title: 'Triển khai', description: 'Thực hiện dự án theo kế hoạch đã thống nhất.', imageUrlSeed: 'implementation' },
        { id: 'step4', order: 4, stepNumber: '04', title: 'Bàn giao & Hỗ trợ', description: 'Nghiệm thu và tiếp tục đồng hành cùng khách hàng.', imageUrlSeed: 'support', alignRight: true }
    ]
};

export const INITIAL_HOMEPAGE_CALL_TO_ACTION: HomepageCallToActionSettings = {
    enabled: true,
    title: "Sẵn Sàng Nâng Cấp Hệ Thống Công Nghệ Của Bạn?",
    description: "Liên hệ với chúng tôi ngay hôm nay để nhận tư vấn miễn phí từ các chuyên gia hàng đầu.",
    buttonText: "Nhận Tư Vấn Ngay",
    buttonLink: "/contact"
};

export const INITIAL_HOMEPAGE_BLOG_PREVIEW: HomepageBlogPreviewSettings = {
    enabled: true,
    preTitle: "TIN TỨC & BLOG",
    title: "Cập Nhật Kiến Thức Công Nghệ Mới Nhất",
    otherArticleIds: ['it001', 'it002', 'it005']
};

export const INITIAL_HOMEPAGE_CONTACT_SECTION: HomepageContactSectionSettings = {
    enabled: true,
    preTitle: "LIÊN HỆ",
    title: "Kết Nối Với Chúng Tôi"
};

export const INITIAL_SMTP_SETTINGS: SMTPSettings = {
    host: 'smtp.example.com', port: 587, user: 'user@example.com', pass: '', secure: false
};

export const INITIAL_PAYMENT_GATEWAYS: PaymentGatewaySettings = {
    momoEnabled: false, vnPayEnabled: true, paypalEnabled: false
};

export const INITIAL_SITE_SETTINGS: SiteSettings = {
    companyName: COMPANY_NAME,
    companySlogan: COMPANY_SLOGAN,
    companyPhone: COMPANY_PHONE,
    companyEmail: COMPANY_EMAIL,
    companyAddress: COMPANY_ADDRESS,
    siteLogoUrl: '',
    siteFaviconUrl: '',
    defaultMetaTitle: `${COMPANY_NAME} - PC Parts & IT Services`,
    defaultMetaDescription: 'Cung cấp linh kiện PC, máy tính và dịch vụ IT chuyên nghiệp tại Đà Nẵng.',
    defaultMetaKeywords: 'linh kiện pc, máy tính đà nẵng, dịch vụ it',

    aboutPageTitle: `Về ${COMPANY_NAME}`,
    aboutPageSubtitle: "Đối tác công nghệ tin cậy của bạn.",
    ourStoryContentMarkdown: "Câu chuyện của chúng tôi bắt đầu với niềm đam mê công nghệ và mong muốn mang lại những giải pháp tốt nhất cho khách hàng.",
    missionStatementMarkdown: "Sứ mệnh của chúng tôi là cung cấp sản phẩm và dịch vụ công nghệ chất lượng cao với giá cả hợp lý.",
    visionStatementMarkdown: "Trở thành công ty công nghệ hàng đầu tại miền Trung Việt Nam.",
    teamMembers: INITIAL_TEAM_MEMBERS,
    storeImages: INITIAL_STORE_IMAGES,

    contactPageTitle: "Liên Hệ Với Chúng Tôi",
    contactPageSubtitle: "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.",
    workingHours: WORKING_HOURS,
    mapEmbedUrl: MAP_EMBED_URL,

    socialFacebookUrl: 'https://facebook.com',
    socialZaloUrl: 'https://zalo.me',
    socialYoutubeUrl: 'https://youtube.com',

    homepageBanners: INITIAL_HOMEPAGE_BANNERS,
    homepageLEDBoard: INITIAL_HOMEPAGE_LED_BOARD, 
    homepageAbout: INITIAL_HOMEPAGE_ABOUT,
    homepageServicesBenefits: INITIAL_HOMEPAGE_SERVICES_BENEFITS,
    homepageWhyChooseUs: INITIAL_HOMEPAGE_WHY_CHOOSE_US,
    homepageStatsCounter: INITIAL_HOMEPAGE_STATS_COUNTER,
    homepageFeaturedProjects: INITIAL_HOMEPAGE_FEATURED_PROJECTS,
    homepageTestimonials: INITIAL_HOMEPAGE_TESTIMONIALS,
    homepageBrandLogos: INITIAL_HOMEPAGE_BRAND_LOGOS,
    homepageProcess: INITIAL_HOMEPAGE_PROCESS,
    homepageCallToAction: INITIAL_HOMEPAGE_CALL_TO_ACTION,
    homepageBlogPreview: INITIAL_HOMEPAGE_BLOG_PREVIEW,
    homepageContactSection: INITIAL_HOMEPAGE_CONTACT_SECTION,

    smtpSettings: INITIAL_SMTP_SETTINGS,
    paymentGateways: INITIAL_PAYMENT_GATEWAYS,
    siteMediaLibrary: []
};

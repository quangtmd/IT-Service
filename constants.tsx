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
    SMTPSettings, PaymentGatewaySettings, MediaItem
} from './types';

export const ADMIN_EMAIL = "quangtmdit@gmail.com"; 

export const API_KEY_ERROR_MESSAGE = "API Key chưa được cấu hình. Vui lòng đặt biến môi trường VITE_GEMINI_API_KEY.";
// In development, this will be an empty string to use the Vite proxy. In production, it will be the deployed backend URL.
export const BACKEND_API_BASE_URL = process.env.VITE_BACKEND_API_BASE_URL || ""; 

// --- STORAGE KEYS ---
export const SITE_LOGO_STORAGE_KEY = "siteLogoUrl_v1";
export const SITE_CONFIG_STORAGE_KEY = 'siteConfiguration_v3';
export const FAQ_STORAGE_KEY = 'siteFAQs_v1';
export const DISCOUNTS_STORAGE_KEY = 'siteDiscountCodes_v1';
export const THEME_SETTINGS_STORAGE_KEY = 'siteThemeSettings_v1';
export const CUSTOM_MENU_STORAGE_KEY = 'siteCustomMenu_v1';
// These are now fetched from API, but keys can be used for caching if needed
export const PRODUCTS_STORAGE_KEY = 'siteProducts_v1';
export const ORDERS_STORAGE_KEY = 'siteOrders_v1';
export const CHAT_LOGS_STORAGE_KEY = 'siteChatLogs_v1'; // For storing chat logs
export const CHATBOT_AUTO_OPENED_KEY = 'chatbotAutoOpened_v1';
export const FINANCIAL_TRANSACTIONS_STORAGE_KEY = 'siteFinancialTransactions_v1';
export const PAYROLL_RECORDS_STORAGE_KEY = 'sitePayrollRecords_v1';
export const ADMIN_NOTIFICATIONS_STORAGE_KEY = 'adminNotifications_v1';


// --- BANKING INFO ---
export const BANK_ACCOUNT_NAME = "TRAN MINH QUANG";
export const BANK_ACCOUNT_NUMBER = "0501000136537";
export const BANK_NAME = "Vietcombank (Ngân hàng TMCP Ngoại thương Việt Nam)";
export const VIETCOMBANK_ID = "970436";
export const DEPOSIT_PERCENTAGE = 0.3; // 30% deposit

// --- INITIAL DYNAMIC DATA (Managed by Admin, stored in localStorage) ---

const INITIAL_HOMEPAGE_BANNERS: HomepageBannerSettings[] = [
    {
        id: 'banner1',
        preTitle: "GIẢI PHÁP CÔNG NGHỆ CHO DOANH NGHIỆP",
        title: "Đối Tác Công Nghệ Tin Cậy Của Doanh Nghiệp",
        subtitle: "Chúng tôi cung cấp chuyên môn và sự hỗ trợ để giúp bạn vượt qua sự phức tạp của bối cảnh kỹ thuật số, đảm bảo công nghệ của bạn phù hợp với mục tiêu kinh doanh.",
        backgroundImageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1920&auto=format&fit=crop",
        primaryButtonText: "Dịch Vụ Của Chúng Tôi",
        primaryButtonLink: "/services",
        secondaryButtonText: "Liên Hệ Ngay",
        secondaryButtonLink: "/contact",
        order: 1,
        isActive: true,
        decorTopLeftImageUrl: "https://polite-opossum.10web.cloud/wp-content/uploads/sites/91/2024/02/Group-1_p2gL.png",
        decorBottomRightImageUrl: "https://polite-opossum.10web.cloud/wp-content/uploads/sites/91/2024/02/Group_gLnp.png"
    },
    {
        id: 'banner2',
        preTitle: "DỊCH VỤ IT SÁNG TẠO",
        title: "Thúc Đẩy Doanh Nghiệp Với Công Nghệ Tiên Tiến",
        subtitle: "Từ giải pháp đám mây đến an ninh mạng, chúng tôi cung cấp các dịch vụ sáng tạo phù hợp với nhu cầu kinh doanh độc đáo của bạn, giúp bạn luôn đi đầu.",
        backgroundImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1920&auto=format&fit=crop",
        primaryButtonText: "Khám Phá Giải Pháp",
        primaryButtonLink: "/services",
        secondaryButtonText: "Nhận Báo Giá",
        secondaryButtonLink: "/contact",
        order: 2,
        isActive: true,
        decorTopLeftImageUrl: "https://polite-opossum.10web.cloud/wp-content/uploads/sites/91/2024/02/Group-1_p2gL.png",
        decorBottomRightImageUrl: "https://polite-opossum.10web.cloud/wp-content/uploads/sites/91/2024/02/Group_gLnp.png"
    },
    {
        id: 'banner3',
        preTitle: "HỖ TRỢ IT TIN CẬY",
        title: "Vận Hành Mượt Mà Với Hỗ Trợ IT Chủ Động",
        subtitle: "Đội ngũ tận tâm của chúng tôi cung cấp dịch vụ giám sát và hỗ trợ 24/7 để đảm bảo hệ thống của bạn luôn hoạt động trơn tru, giảm thiểu thời gian chết và tối đa hóa năng suất.",
        backgroundImageUrl: "https://images.unsplash.com/photo-1531403009284-440993d21634?q=80&w=1920&auto=format&fit=crop",
        primaryButtonText: "Xem Gói Hỗ Trợ",
        primaryButtonLink: "/services",
        secondaryButtonText: "Về Chúng Tôi",
        secondaryButtonLink: "/about",
        order: 3,
        isActive: true,
        decorTopLeftImageUrl: "https://polite-opossum.10web.cloud/wp-content/uploads/sites/91/2024/02/Group-1_p2gL.png",
        decorBottomRightImageUrl: "https://polite-opossum.10web.cloud/wp-content/uploads/sites/91/2024/02/Group_gLnp.png"
    }
];

const INITIAL_HOMEPAGE_ABOUT_FEATURES: HomepageAboutFeature[] = [
  { id: 'feat1', icon: 'fas fa-briefcase', title: 'Dịch vụ IT Doanh Nghiệp', description: 'Giảm chi phí và lao động phòng CNTT.', link: '/services' },
  { id: 'feat2', icon: 'fas fa-lightbulb', title: 'Giải pháp CNTT Doanh Nghiệp', description: 'Cung cấp các giải pháp CNTT tối ưu cho Doanh Nghiệp', link: '/services' }
];
const INITIAL_HOMEPAGE_ABOUT: HomepageAboutSettings = {
  enabled: true,
  preTitle: "VỀ CHÚNG TÔI",
  title: "IQ Technology Hiểu Nỗi Lo Của Bạn Về CNTT Và Cam Kết Mang Đến Chất Lượng Tốt Nhất!",
  description: "Tại IQ Technology, chúng tôi chuyên cung cấp các giải pháp và dịch vụ IT toàn diện phù hợp với nhu cầu và mục tiêu độc đáo của các doanh nghiệp ở mọi quy mô. Với một đội ngũ các chuyên gia tận tâm và cam kết về chất lượng và uy tín, chúng tôi tin rằng sẽ đem lại hiệu quả để thúc đẩy sự đổi mới, nâng cao năng suất và tối ưu chi phí về CNTT của công ty bạn.",
  imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1770&auto=format&fit=crop",
  imageDetailUrl: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?q=80&w=1770&auto=format&fit=crop",
  imageAltText: "Về Chúng Tôi - Nhóm Kỹ Thuật Hợp Tác",
  imageDetailAltText: "Về Chúng Tôi - Chi Tiết Phòng Máy Chủ",
  features: INITIAL_HOMEPAGE_ABOUT_FEATURES,
  buttonText: "Tham Khảo Thêm",
  buttonLink: "/about",
};

const INITIAL_HOMEPAGE_SERVICE_BENEFITS: HomepageServiceBenefit[] = [
  { id: 'sb1', iconClass: 'fas fa-dollar-sign', title: 'Tiết Kiệm Chi Phí', description: 'Dịch vụ CNTT giúp doanh nghiệp của bạn có thể giảm đáng kể chi phí liên quan đến việc tuyển dụng, đào tạo và duy trì nhân viên CNTT...', link: '/services', order: 1 },
  { id: 'sb2', iconClass: 'fas fa-users-cog', title: 'Chuyên Môn Cao', description: 'Chúng tôi mang đến một đội ngũ các chuyên gia CNTT nhiệt huyết và có kinh nghiệm chuyên môn về các lĩnh vực khác nhau như hỗ trợ helpdesk, cấu hình mạng,...', link: '/services', order: 2 },
  { id: 'sb3', iconClass: 'fas fa-cogs', title: 'Chủ Động Và Linh Hoạt', description: 'Công ty chúng tôi cung cấp các giải pháp CNTT có thể mở rộng và linh hoạt có thể thích ứng với các nhu cầu thay đổi của các doanh nghiệp khi phát triển hoặc cắt giảm...', link: '/services', order: 3 },
  { id: 'sb4', iconClass: 'fas fa-headset', title: 'Hỗ Trợ 24/7', description: 'Công ty chúng tôi hiểu tầm quan trọng của hoạt động CNTT không bị gián đoạn đối với doanh nghiệp. Đó là lý do tại sao chúng tôi luôn hỗ trợ ngay lập tức khi có sự cố...', link: '/services', order: 4 },
  { id: 'sb5', iconClass: 'fas fa-bullseye', title: 'Tập Trung Vào Cốt Lõi', description: 'Việc thuê ngoài các dịch vụ CNTT cho phép doanh nghiệp tập trung vào năng lực cốt lõi. Bằng cách giao các nhiệm vụ CNTT cho đội ngũ chuyên gia của chúng tôi..', link: '/services', order: 5 },
  { id: 'sb6', iconClass: 'fas fa-shield-alt', title: 'Tuân Thủ Bảo Mật', description: 'Công ty chúng tôi hiểu tầm quan trọng của bảo mật dữ liệu. Vì vậy chúng tôi luôn cam kết bảo mật và bảo vệ tài số của các Doanh nghiệp...', link: '/services', order: 6 },
];
const INITIAL_HOMEPAGE_SERVICES_BENEFITS: HomepageServicesBenefitsSettings = {
  enabled: true,
  preTitle: "DỊCH VỤ IT THUÊ NGOÀI TẠI IQ",
  title: "Các Lợi Ích Tiêu Biểu Từ Dịch Vụ & Giải Pháp Của IQ",
  benefits: INITIAL_HOMEPAGE_SERVICE_BENEFITS,
};

const INITIAL_HOMEPAGE_WHYCHOOSEUS_FEATURES: HomepageWhyChooseUsFeature[] = [
  { id: 'wcu1', iconClass: 'fas fa-users-cog', title: 'Đội Ngũ IT Chuyên Nghiệp', description: 'Đội ngũ của chúng tôi bao gồm các kỹ thuật viên CNTT có tay nghề cao và có kinh nghiệm, luôn trau dồi và đổi mới công nghệ.' },
  { id: 'wcu2', iconClass: 'fas fa-headset', title: 'Hỗ Trợ Sự Cố 24/7', description: 'Các giải pháp của chúng tôi có thể được tùy chỉnh để phù hợp với các mô hình Doanh Nghiệp, luôn sẵn sàng hỗ trợ khi hệ thống CNTT gặp sự cố.' },
  { id: 'wcu3', iconClass: 'fas fa-chart-line', title: 'Cắt Giảm Chi Phí, Chất Lượng Đảm Bảo', description: 'Tiết kiệm tiền cho tiền lương, trợ cấp và chi phí chung trong khi vẫn nhận được hỗ trợ và dịch vụ CNTT chất lượng cao.' },
];
const INITIAL_HOMEPAGE_WHYCHOOSEUS: HomepageWhyChooseUsSettings = {
  enabled: true,
  preTitle: "TẠI SAO LẠI LỰA CHỌN IQ?",
  title: "Dịch Vụ IT Tốt Nhất Tại Đà Nẵng",
  description: "Tại IQ Technology, chúng tôi hiểu rằng việc chọn đúng đối tác CNTT là rất quan trọng đối với sự thành công của doanh nghiệp của bạn. Với kinh nghiệm nhiều năm trong lĩnh vực thuê ngoài CNTT, chúng tôi luôn cam kết không ngừng phát triển và mang đến các giải pháp tốt nhất cho Doanh nghiệp, chúng tôi là sự lựa chọn hàng đầu cho tất cả các nhu cầu CNTT của bạn. Đây là lý do tại sao bạn nên cân nhắc hợp tác với chúng tôi!",
  mainImageUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1770&auto=format&fit=crop",
  experienceStatNumber: "10+",
  experienceStatLabel: "Năm kinh nghiệm",
  features: INITIAL_HOMEPAGE_WHYCHOOSEUS_FEATURES,
  contactButtonText: "Liên Hệ Ngay",
  contactButtonLink: "/contact",
  contactSectionText: "Bạn Cần Tư Vấn Chuyên Sâu Hơn?",
};

const INITIAL_HOMEPAGE_STATS: HomepageStatItem[] = [
  { id: 'stat1', iconClass: 'fas fa-handshake', count: '20+', label: 'Khách Hàng Doanh Nghiệp', order: 1 },
  { id: 'stat2', iconClass: 'fas fa-tasks', count: '100+', label: 'Dự Án Đã Triển Khai', order: 2 },
  { id: 'stat3', iconClass: 'fas fa-smile-beam', count: '98%+', label: 'Khách Hàng Hài Lòng', order: 3 },
  { id: 'stat4', iconClass: 'fas fa-lightbulb', count: '50+', label: 'Giải Pháp Công Nghệ', order: 4 },
];
const INITIAL_HOMEPAGE_STATS_COUNTER: HomepageStatsCounterSettings = {
  enabled: true,
  stats: INITIAL_HOMEPAGE_STATS,
};

const INITIAL_HOMEPAGE_FEATURED_PROJECTS: HomepageFeaturedProjectsSettings = {
  enabled: true,
  preTitle: "DỊCH VỤ VÀ GIẢI PHÁP CỦA IQ",
  title: "Các Dịch Vụ & Giải Pháp Được Cung Cấp Bởi IQ",
  buttonText: "Xem Chi Tiết",
  buttonLink: "/services",
  featuredServiceIds: ['svc001','svc002','svc003','svc004'], 
};

const INITIAL_HOMEPAGE_TESTIMONIALS_ITEMS: HomepageTestimonialItem[] = [
    { id: 'tm_home1', name: 'Nguyễn Văn An', quote: 'Dịch vụ IT của IQ Technology rất chuyên nghiệp và hiệu quả. Đội ngũ hỗ trợ nhanh chóng, giải quyết vấn đề triệt để. Tôi rất hài lòng!', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop', role: 'Giám đốc Công ty ABC', order: 1},
    { id: 'tm_home2', name: 'Trần Thị Bích Hợp', quote: 'Nhờ IQ Technology, hệ thống mạng và máy chủ của chúng tôi hoạt động ổn định hơn hẳn. Chi phí dịch vụ cũng rất hợp lý.', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', role: 'Trưởng phòng IT XYZ Corp', order: 2},
    { id: 'tm_home3', name: 'Lê Hoàng Long', quote: 'Tôi đánh giá cao sự tận tâm và kiến thức chuyên môn của các bạn kỹ thuật viên IQ. Họ luôn đưa ra giải pháp tối ưu nhất.', avatarUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&auto=format&fit=crop', role: 'Chủ Doanh Nghiệp Startup', order: 3},
];
const INITIAL_HOMEPAGE_TESTIMONIALS: HomepageTestimonialsSettings = {
  enabled: true,
  preTitle: "ĐÁNH GIÁ",
  title: "Khách Hàng Nói Gì Về Chúng Tôi",
  testimonials: INITIAL_HOMEPAGE_TESTIMONIALS_ITEMS,
};

const INITIAL_HOMEPAGE_BRAND_LOGOS_ITEMS: HomepageBrandLogo[] = [
  { id: 'brand1', name: 'TechCorp', logoUrl: 'https://cdn.worldvectorlogo.com/logos/microsoft-5.svg', order: 1 },
  { id: 'brand2', name: 'Innovate Inc', logoUrl: 'https://cdn.worldvectorlogo.com/logos/intel-7.svg', order: 2 },
  { id: 'brand3', name: 'Cyber Solutions', logoUrl: 'https://cdn.worldvectorlogo.com/logos/cisco-2.svg', order: 3 },
  { id: 'brand4', name: 'NetSys', logoUrl: 'https://cdn.worldvectorlogo.com/logos/dell-1.svg', order: 4 },
  { id: 'brand5', name: 'DataFlow Ltd', logoUrl: 'https://cdn.worldvectorlogo.com/logos/hp-3.svg', order: 5 },
];
const INITIAL_HOMEPAGE_BRAND_LOGOS: HomepageBrandLogosSettings = {
  enabled: true,
  logos: INITIAL_HOMEPAGE_BRAND_LOGOS_ITEMS,
};

const INITIAL_HOMEPAGE_PROCESS_STEPS: HomepageProcessStep[] = [
  { id: 'p1', stepNumber: '01', title: 'Liên Hệ & Tư Vấn', description: 'Tiếp nhận yêu cầu, tư vấn sơ bộ và hẹn lịch khảo sát thực tế tại doanh nghiệp của khách hàng.', imageUrlSeed: 'techConsultationV1', order: 1 },
  { id: 'p2', stepNumber: '02', title: 'Khảo Sát & Đánh Giá', description: 'Kiểm tra toàn diện cơ sở hạ tầng CNTT, xác định vấn đề, nhu cầu và các lĩnh vực cần cải tiến.', imageUrlSeed: 'itAssessmentV1', alignRight: true, order: 2 },
  { id: 'p3', stepNumber: '03', title: 'Đề Xuất & Báo Giá', description: 'Lập đề xuất giải pháp chi tiết, minh bạch kèm báo giá cạnh tranh, phù hợp với yêu cầu đã thu thập.', imageUrlSeed: 'techProposalV1', order: 3 },
  { id: 'p4', stepNumber: '04', title: 'Triển Khai & Hỗ Trợ', description: 'Thực hiện giải pháp, cài đặt, đào tạo (nếu có) và bắt đầu dịch vụ hỗ trợ, giám sát hệ thống.', imageUrlSeed: 'itImplementationSupportV1', alignRight: true, order: 4 },
];
const INITIAL_HOMEPAGE_PROCESS: HomepageProcessSettings = {
  enabled: true,
  preTitle: "QUY TRÌNH CÔNG VIỆC",
  title: "Quy Trình Kết Nối Với Khách Hàng",
  steps: INITIAL_HOMEPAGE_PROCESS_STEPS,
};

const INITIAL_HOMEPAGE_CALLTOACTION: HomepageCallToActionSettings = {
  enabled: true,
  title: "Mở Khóa Tiềm Năng CNTT Của Doanh Nghiệp Với Chi Phí Tối Ưu",
  description: "Chúng tôi cung cấp các dịch vụ CNTT đáng tin cậy với chi phí tối ưu. Cung cấp các giải pháp toàn diện như hỗ trợ helpdesk, cấu hình mạng, an ninh mạng và dịch vụ CNTT doanh nghiệp. Các kỹ thuật viên của chúng tôi đảm bảo chất lượng và dịch vụ, cho phép bạn tập trung vào việc phát triển doanh nghiệp của mình và giảm đi nỗi lo về vận hành CNTT.",
  buttonText: "Báo Giá Chi Tiết",
  buttonLink: "/contact",
};

const INITIAL_HOMEPAGE_BLOG_PREVIEW: HomepageBlogPreviewSettings = {
  enabled: true,
  preTitle: "TIN TỨC & CHIA SẺ",
  title: "Cập Nhật Tin Tức Từ IQ",
  featuredArticleId: 'it005', 
  otherArticleIds: ['it001', 'it002'], 
};

const INITIAL_HOMEPAGE_CONTACT_SECTION: HomepageContactSectionSettings = {
  enabled: true,
  preTitle: "LIÊN HỆ VỚI IQ",
  title: "Kết Nối Với Chúng Tôi!",
};

const INITIAL_SMTP_SETTINGS: SMTPSettings = {
  host: '', port: 587, user: '', pass: '', secure: false,
};
const INITIAL_PAYMENT_GATEWAYS: PaymentGatewaySettings = {
  momoEnabled: false, vnPayEnabled: false, paypalEnabled: false,
};
const INITIAL_MEDIA_LIBRARY: MediaItem[] = [];


export const INITIAL_SITE_SETTINGS: SiteSettings = {
  companyName: "IQ Technology",
  companySlogan: "Giải Pháp Công Nghệ Tối Ưu Cho Bạn",
  companyPhone: "0911.855.055",
  companyEmail: "quangtmdit@gmail.com", 
  companyAddress: "Số 10 Huỳnh Thúc Kháng, Quận Hải Châu, TP. Đà Nẵng",
  
  siteLogoUrl: '', 
  siteFaviconUrl: '/favicon.ico', 

  defaultMetaTitle: "IQ Technology - Linh Kiện PC & Dịch Vụ IT Đà Nẵng",
  defaultMetaDescription: "Chuyên cung cấp linh kiện máy tính, PC gaming, workstation, laptop và các dịch vụ IT chuyên nghiệp, sửa chữa, bảo trì tại Đà Nẵng.",
  defaultMetaKeywords: "linh kiện pc đà nẵng, pc gaming, dịch vụ it, sửa máy tính đà nẵng, iq technology",

  aboutPageTitle: "Về IQ Technology",
  aboutPageSubtitle: "Tìm hiểu về đội ngũ, sứ mệnh và cam kết của chúng tôi.",
  ourStoryContentMarkdown: `### Hành Trình Phát Triển\n**IQ Technology** được thành lập với niềm đam mê công nghệ và khát vọng mang đến những giải pháp tối ưu cho khách hàng tại Đà Nẵng và trên toàn quốc.\n\nChúng tôi khởi đầu từ một cửa hàng nhỏ chuyên cung cấp linh kiện máy tính. Với sự tận tâm và không ngừng học hỏi, IQ Technology đã phát triển thành một đơn vị uy tín, cung cấp đa dạng các sản phẩm từ PC gaming, workstation, laptop cho đến các thiết bị mạng, camera an ninh.\n\nSong song đó, mảng dịch vụ IT của chúng tôi cũng lớn mạnh, trở thành đối tác tin cậy cho nhiều cá nhân và doanh nghiệp trong việc sửa chữa, bảo trì, nâng cấp hệ thống và tư vấn các giải pháp công nghệ hiệu quả.`,
  missionStatementMarkdown: "Mang đến cho khách hàng những sản phẩm công nghệ **chất lượng cao nhất** với giá cả cạnh tranh và dịch vụ hậu mãi **tận tâm, chuyên nghiệp**.",
  visionStatementMarkdown: "Trở thành **đơn vị hàng đầu** trong lĩnh vực cung cấp linh kiện PC và giải pháp IT toàn diện tại Việt Nam, được khách hàng **tin tưởng và lựa chọn**.",
  teamMembers: [
    { id: 'tm1', name: 'Trần Minh Quang', role: 'Founder & CEO', quote: 'Công nghệ là đam mê, phục vụ khách hàng là sứ mệnh.', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop' },
    { id: 'tm2', name: 'Lê Thị Bích H.', role: 'Trưởng phòng Kỹ thuật', quote: 'Không có vấn đề nào không thể giải quyết.', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop' },
    { id: 'tm3', name: 'Phạm Văn Hùng K.', role: 'Chuyên viên Tư vấn', quote: 'Luôn lắng nghe để mang đến giải pháp phù hợp.', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
  ],
  storeImages: [
    {id: 'si1', url: 'https://images.unsplash.com/photo-1556742111-a3297a0af568?q=80&w=1770&auto=format&fit=crop', caption: 'Mặt tiền cửa hàng IQ Technology'},
    {id: 'si2', url: 'https://images.unsplash.com/photo-1601597500908-1c4c8d5c95f1?q=80&w=1848&auto=format&fit=crop', caption: 'Không gian trưng bày sản phẩm'},
  ],

  contactPageTitle: "Liên Hệ Với IQ Technology",
  contactPageSubtitle: "Chúng tôi luôn sẵn lòng lắng nghe và hỗ trợ bạn. Đừng ngần ngại!",
  workingHours: "Thứ 2 - Thứ 7: 8:00 - 18:00. Chủ Nhật: 9:00 - 17:00",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.110159196503!2d108.22008031530003!3d16.05975298888796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252a13%3A0x1df0cb4b86727e06!2sDa%20Nang%2C%20Vietnam!5e0!3m2!1sen!2s!4v1628888888888!5m2!1sen!2s", // Bản đồ Đà Nẵng chung

  socialFacebookUrl: "https://facebook.com/iqtechnologydanang",
  socialZaloUrl: "https://zalo.me/0911855055",
  socialYoutubeUrl: "https://youtube.com/channel/iqtechnology",
  socialInstagramUrl: "https://instagram.com/iqtechnology",
  socialTwitterUrl: "",

  homepageBanners: INITIAL_HOMEPAGE_BANNERS,
  homepageAbout: INITIAL_HOMEPAGE_ABOUT,
  homepageServicesBenefits: INITIAL_HOMEPAGE_SERVICES_BENEFITS,
  homepageWhyChooseUs: INITIAL_HOMEPAGE_WHYCHOOSEUS,
  homepageStatsCounter: INITIAL_HOMEPAGE_STATS_COUNTER,
  homepageFeaturedProjects: INITIAL_HOMEPAGE_FEATURED_PROJECTS,
  homepageTestimonials: INITIAL_HOMEPAGE_TESTIMONIALS,
  homepageBrandLogos: INITIAL_HOMEPAGE_BRAND_LOGOS,
  homepageProcess: INITIAL_HOMEPAGE_PROCESS,
  homepageCallToAction: INITIAL_HOMEPAGE_CALLTOACTION,
  homepageBlogPreview: INITIAL_HOMEPAGE_BLOG_PREVIEW,
  homepageContactSection: INITIAL_HOMEPAGE_CONTACT_SECTION,

  smtpSettings: INITIAL_SMTP_SETTINGS,
  paymentGateways: INITIAL_PAYMENT_GATEWAYS,
  siteMediaLibrary: INITIAL_MEDIA_LIBRARY,
};

export const COMPANY_NAME = INITIAL_SITE_SETTINGS.companyName;
export const COMPANY_SLOGAN = INITIAL_SITE_SETTINGS.companySlogan;
export const COMPANY_PHONE = INITIAL_SITE_SETTINGS.companyPhone;
export const COMPANY_EMAIL = INITIAL_SITE_SETTINGS.companyEmail; 
export const COMPANY_ADDRESS = INITIAL_SITE_SETTINGS.companyAddress;

export const INITIAL_FAQS: FaqItem[] = [
  { id: 'faq_g1', question: 'Thời gian bảo hành sản phẩm là bao lâu?', answer: 'Thời gian bảo hành tùy thuộc vào từng loại sản phẩm và nhà sản xuất, thường từ 12 đến 36 tháng. Thông tin chi tiết được ghi rõ trên phiếu bảo hành và mô tả sản phẩm.', category: 'Chính sách', isVisible: true },
  { id: 'faq_s1', question: 'IQ Technology có hỗ trợ lắp đặt tận nơi không?', answer: 'Có, chúng tôi cung cấp dịch vụ lắp đặt PC, hệ thống mạng, camera tận nơi tại Đà Nẵng và các khu vực lân cận. Vui lòng liên hệ để biết thêm chi tiết.', category: 'Dịch vụ', isVisible: true },
  { id: 'faq_s2', question: 'Làm thế nào để yêu cầu dịch vụ sửa chữa?', answer: 'Bạn có thể gọi hotline, gửi email, chat trực tiếp trên website hoặc mang máy trực tiếp đến cửa hàng của chúng tôi để được hỗ trợ.', category: 'Dịch vụ', isVisible: true },
];

export const INITIAL_DISCOUNT_CODES: DiscountCode[] = [
  { id: 'dc_welcome', name: 'Chào mừng thành viên mới', code: 'WELCOME10', type: 'percentage', value: 10, description: 'Giảm 10% cho đơn hàng đầu tiên của khách hàng mới.', expiryDate: '2024-12-31', isActive: true, minSpend: 500000, usageLimit: 1, timesUsed: 0 },
  { id: 'dc_freeship', name: 'Miễn phí vận chuyển', code: 'FREESHIP500K', type: 'fixed_amount', value: 30000, description: 'Miễn phí vận chuyển (tối đa 30k) cho đơn hàng từ 500k.', isActive: true, minSpend: 500000, timesUsed: 0 },
];

export const INITIAL_THEME_SETTINGS: SiteThemeSettings = {
  primaryColorDefault: '#ef4444', 
  primaryColorLight: '#f87171',  
  primaryColorDark: '#dc2626',   
  secondaryColorDefault: '#991b1b', 
  secondaryColorLight: '#b91c1c', 
  secondaryColorDark: '#7f1d1d',  
};

export const PC_BUILDER_PATH = '/pc-builder'; 

export const NAVIGATION_LINKS_BASE: Omit<CustomMenuLink, 'order' | 'isVisible' | 'originalPath' | 'id'>[] = [
  { label: 'Trang chủ', path: '/home', icon: 'fas fa-home' },
  { label: 'Sản phẩm', path: '/shop', icon: 'fas fa-store' },
  { label: 'Xây dựng PC', path: PC_BUILDER_PATH, icon: 'fas fa-tools'}, 
  { label: 'Gợi ý Cấu hình', path: '/pc-build-suggestions', icon: 'fas fa-magic' },
  { label: 'Dịch vụ IT', path: '/services', icon: 'fas fa-concierge-bell' },
  { label: 'Dự án', path: '/projects', icon: 'fas fa-project-diagram' },
  { label: 'Blog', path: '/blog', icon: 'fas fa-newspaper' },
  { label: 'Giới thiệu', path: '/about', icon: 'fas fa-info-circle' },
  { label: 'Liên hệ', path: '/contact', icon: 'fas fa-address-book' },
];

export const INITIAL_CUSTOM_MENU_LINKS: CustomMenuLink[] = NAVIGATION_LINKS_BASE.map((link, index) => ({
    id: link.path, 
    label: link.label,
    path: link.path,
    order: index + 1,
    isVisible: true,
    originalPath: link.path, 
    icon: link.icon,
}));

export const FALLBACK_NAV_LOGGED_OUT: NavLinkItem[] = INITIAL_CUSTOM_MENU_LINKS
    .filter(link => link.isVisible && link.path !== PC_BUILDER_PATH)
    .sort((a,b) => a.order - b.order);

export const FALLBACK_NAV_LOGGED_IN: NavLinkItem[] = [
    ...FALLBACK_NAV_LOGGED_OUT,
    { label: 'Quản trị', path: '/admin', icon: 'fas fa-user-shield', authRequired: true }
];


export const GENERIC_PC_BUILD_IMAGE_URL = "https://images.unsplash.com/photo-1627045236365-b153d09a9f28?q=80&w=800&auto=format&fit=crop"; 
export const PC_COMPONENT_TYPES: Array<string> = [ 'CPU (Vi xử lý)', 'Bo mạch chủ', 'RAM', 'Ổ cứng', 'Card màn hình (VGA)', 'Nguồn máy tính (PSU)', 'Vỏ máy (Case)', 'Tản nhiệt', 'Màn hình', 'Bàn phím', 'Chuột', 'Tai nghe', 'Webcam', 'Microphone', 'Loa máy tính' ];
export const USE_CASES = ['Chơi Game', 'Học tập', 'Văn phòng', 'Đồ họa - Video', 'Lập trình', 'Giải trí đa phương tiện'];
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
export const ARTICLE_CATEGORIES = ["Mẹo vặt", "Hướng dẫn", "So sánh", "Khuyến mãi", "Tin tức công nghệ", "Đánh giá sản phẩm", "Dịch vụ IT", "Bảo mật"];
export const USER_ROLES_CONST: UserRole[] = ['admin', 'staff', 'customer'];
export const STAFF_ROLE_OPTIONS_CONST: StaffRole[] = ['Quản lý Bán hàng', 'Biên tập Nội dung', 'Trưởng nhóm Kỹ thuật', 'Chuyên viên Hỗ trợ', 'Nhân viên Toàn quyền'];
export const ORDER_STATUSES: Array<import('./types').OrderStatus> = ['Chờ xử lý', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Hoàn thành', 'Đã hủy'];
export const DEFAULT_SITE_LOGO_URL = ''; 

export const MOCK_PRICING_PLANS_DATA: PricingPlan[] = [
  {
    id: 'it_svc_1',
    name: 'Gói Cơ Bản',
    price: '1.500.000',
    period: 'đ/tháng',
    isPopular: false,
    features: [
      'Hỗ trợ từ xa (8 giờ/tháng)',
      'Giám sát hệ thống 24/7',
      'Hỗ trợ qua Ticket/Email',
      'Thời gian phản hồi: < 4 giờ',
      'Bảo trì định kỳ (1 lần/tháng)',
      'Tư vấn công nghệ cơ bản',
      'Báo cáo hiệu suất hàng tháng'
    ],
    buttonText: 'Chọn Gói Này',
    buttonLink: '/contact'
  },
  {
    id: 'it_svc_2',
    name: 'Gói Phổ Biến',
    price: '3.000.000',
    period: 'đ/tháng',
    isPopular: true,
    features: [
      'Hỗ trợ từ xa (20 giờ/tháng)',
      'Giám sát hệ thống 24/7',
      'Hỗ trợ qua Ticket/Email/Phone',
      'Thời gian phản hồi: < 2 giờ',
      'Bảo trì định kỳ (2 lần/tháng)',
      'Quản lý bản vá & cập nhật',
      'Bảo mật End-point cơ bản',
      'Báo cáo & phân tích chi tiết'
    ],
    buttonText: 'Chọn Gói Này',
    buttonLink: '/contact'
  },
  {
    id: 'it_svc_3',
    name: 'Gói Cao Cấp',
    price: '5.500.000',
    period: 'đ/tháng',
    isPopular: false,
    features: [
      'Hỗ trợ từ xa không giới hạn',
      'Hỗ trợ tận nơi (4 giờ/tháng)',
      'Giám sát & cảnh báo chuyên sâu',
      'Ưu tiên hỗ trợ: < 1 giờ',
      'Bảo trì định kỳ hàng tuần',
      'Quản lý sao lưu dữ liệu',
      'Bảo mật End-point nâng cao',
      'Tư vấn chiến lược CNTT'
    ],
    buttonText: 'Chọn Gói Này',
    buttonLink: '/contact'
  },
  {
    id: 'it_svc_4',
    name: 'Gói Doanh Nghiệp',
    price: 'Liên hệ',
    period: '',
    isPopular: false,
    features: [
      'Tất cả tính năng Gói Cao Cấp',
      'Kỹ thuật viên chuyên trách',
      'Hỗ trợ tận nơi không giới hạn',
      'Quản lý dự án CNTT',
      'Đào tạo người dùng',
      'Kiểm tra bảo mật định kỳ',
      'Cam kết dịch vụ (SLA)',
      'Tùy chỉnh theo yêu cầu'
    ],
    buttonText: 'Liên Hệ Tư Vấn',
    buttonLink: '/contact'
  },
];


export const MOCK_FAQ_DATA_SERVICES: FaqItem[] = [
    { id: 'sf1', question: 'Các loại hình doanh nghiệp mà IQ Technology phục vụ là gì?', answer: 'Chúng tôi phục vụ các doanh nghiệp đa dạng về quy mô và ngành nghề, từ startups, doanh nghiệp nhỏ và vừa (SMEs), đến các tập đoàn lớn. Giải pháp IT của chúng tôi được tùy chỉnh để đáp ứng nhu cầu đặc thù của mỗi khách hàng.', category: 'Dịch vụ Chung', isVisible: true },
    { id: 'sf2', question: 'IQ Technology cung cấp những dịch vụ IT nào?', answer: 'Chúng tôi cung cấp một loạt các dịch vụ IT, bao gồm hỗ trợ IT Helpdesk, dịch vụ IT Managed, tư vấn giải pháp công nghệ, chuyển đổi số, bảo trì hệ thống, an ninh mạng, và nhiều hơn nữa.', category: 'Dịch vụ Chung', isVisible: true },
    { id: 'sf3', question: 'Quy trình làm việc của IQ Technology diễn ra như thế nào?', answer: 'Quy trình của chúng tôi bắt đầu bằng việc lắng nghe và tư vấn để hiểu rõ nhu cầu IT của bạn. Sau đó, chúng tôi phát triển một kế hoạch tùy chỉnh. Đội ngũ kỹ thuật sẽ triển khai kế hoạch, đồng thời cung cấp hỗ trợ và giám sát liên tục để đảm bảo hệ thống của bạn hoạt động trơn tru và an toàn.', category: 'Quy trình', isVisible: true },
];
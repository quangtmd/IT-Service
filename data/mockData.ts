import { Service, Testimonial, PCComponent, Project, User, Order, AdminNotification, UserRole, StaffRole, Article, DebtStatus } from '../types';
import React from 'react'; 
import { ADMIN_EMAIL } from '../constants';

export const MOCK_SERVICES: Service[] = [
  { 
    id: 'svc001', 
    name: 'Thiết Kế & Phát Triển Web Chuyên Nghiệp', 
    description: 'Chúng tôi cung cấp giải pháp website toàn diện, từ thiết kế UX/UI hiện đại, trực quan đến phát triển frontend & backend mạnh mẽ, đảm bảo tối ưu hóa SEO và mang lại trải nghiệm người dùng vượt trội.', 
    icon: 'fas fa-laptop-code', 
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1770&auto=format&fit=crop',
    slug: 'thiet-ke-phat-trien-web' 
  },
  { 
    id: 'svc002', 
    name: 'Quản Trị Hệ Thống Mạng Doanh Nghiệp', 
    description: 'Dịch vụ quản trị, giám sát và bảo trì hệ thống mạng chuyên nghiệp cho doanh nghiệp. Đảm bảo hệ thống của bạn hoạt động ổn định, an toàn, hiệu quả với hiệu suất tối đa.', 
    icon: 'fas fa-network-wired', 
    imageUrl: 'https://images.unsplash.com/photo-1587135304381-e3f43845b4ca?q=80&w=1770&auto=format&fit=crop',
    slug: 'quan-tri-he-thong-mang'
  },
  { 
    id: 'svc003', 
    name: 'Giải Pháp Lưu Trữ & Sao Lưu Đám Mây', 
    description: 'Tư vấn và triển khai các giải pháp lưu trữ đám mây (Cloud Storage) và sao lưu dữ liệu (Cloud Backup) linh hoạt, an toàn và tiết kiệm chi phí cho cá nhân và doanh nghiệp.', 
    icon: 'fas fa-cloud-upload-alt', 
    imageUrl: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=1770&auto=format&fit=crop',
    slug: 'luu-tru-sao-luu-dam-may'
  },
  { 
    id: 'svc004', 
    name: 'Hỗ Trợ Kỹ Thuật Từ Xa Nhanh Chóng', 
    description: 'Đội ngũ kỹ thuật viên chuyên nghiệp của chúng tôi sẵn sàng giải quyết nhanh chóng các sự cố máy tính, phần mềm qua TeamViewer, UltraViewer, đảm bảo công việc của bạn không bị gián đoạn.', 
    icon: 'fas fa-headset', 
    imageUrl: 'https://images.unsplash.com/photo-1616587894285-3d17c752531a?q=80&w=1770&auto=format&fit=crop',
    slug: 'ho-tro-ky-thuat-tu-xa'
  },
  { 
    id: 'svc005', 
    name: 'Tư Vấn & Triển Khai Chuyển Đổi Số', 
    description: 'Đánh giá toàn diện hiện trạng công nghệ và tư vấn lộ trình chuyển đổi số tối ưu, giúp doanh nghiệp của bạn tự động hóa quy trình, nâng cao năng lực cạnh tranh và phát triển bền vững.', 
    icon: 'fas fa-project-diagram', 
    imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1774&auto=format&fit=crop',
    slug: 'tu-van-chuyen-doi-so'
  },
  { 
    id: 'svc006', 
    name: 'Bảo Mật Hệ Thống & An Toàn Dữ Liệu', 
    description: 'Dịch vụ kiểm tra, đánh giá lỗ hổng và triển khai các giải pháp bảo mật tiên tiến. Phòng chống hiệu quả virus, mã độc, tấn công mạng, bảo vệ an toàn tuyệt đối cho dữ liệu quan trọng.', 
    icon: 'fas fa-shield-alt', 
    imageUrl: 'https://images.unsplash.com/photo-1558006511-aa7131a44e53?q=80&w=1770&auto=format&fit=crop',
    slug: 'bao-mat-he-thong-du-lieu'
  },
];

// Fix: Add missing MOCK_ARTICLES export
export const MOCK_ARTICLES: Article[] = [
    {
        id: 'it001',
        title: 'Top 5 Lợi Ích Của Dịch Vụ IT Thuê Ngoài Cho Doanh Nghiệp',
        summary: 'Khám phá cách dịch vụ IT thuê ngoài có thể giúp doanh nghiệp của bạn tiết kiệm chi phí, tăng cường bảo mật và tập trung vào hoạt động kinh doanh cốt lõi.',
        imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1770&auto=format&fit=crop',
        author: 'Trần Minh Quang',
        date: '2024-07-15T10:00:00Z',
        category: 'Dịch vụ IT',
        content: 'Nội dung chi tiết về lợi ích của IT thuê ngoài...'
    },
    {
        id: 'it002',
        title: 'Hướng Dẫn Xây Dựng Cấu Hình PC Gaming Tối Ưu Ngân Sách',
        summary: 'Bạn muốn xây dựng một dàn PC gaming mạnh mẽ mà không tốn quá nhiều chi phí? Bài viết này sẽ hướng dẫn bạn cách chọn lựa linh kiện thông minh.',
        imageUrl: 'https://images.unsplash.com/photo-1598986646512-921b0d2c6948?q=80&w=1853&auto=format&fit=crop',
        author: 'Lê Hùng',
        date: '2024-07-12T14:30:00Z',
        category: 'Hướng dẫn',
        content: 'Nội dung chi tiết về build PC gaming...'
    },
     {
        id: 'it003',
        title: 'So Sánh Card Đồ Họa NVIDIA và AMD: Lựa Chọn Nào Cho Bạn?',
        summary: 'Cuộc chiến không hồi kết giữa hai ông lớn NVIDIA và AMD. Chúng tôi sẽ phân tích ưu và nhược điểm của các dòng card đồ họa mới nhất để giúp bạn đưa ra lựa chọn đúng đắn.',
        imageUrl: 'https://images.unsplash.com/photo-1591463925312-dce92543a655?q=80&w=1770&auto=format&fit=crop',
        author: 'Admin',
        date: '2024-07-10T11:00:00Z',
        category: 'So sánh',
    },
    {
        id: 'it005',
        title: 'Tại Sao Doanh Nghiệp Cần Đầu Tư Vào An Ninh Mạng Ngay Hôm Nay?',
        summary: 'Các mối đe dọa an ninh mạng ngày càng tinh vi. Tìm hiểu lý do tại sao việc đầu tư vào các giải pháp bảo mật là cực kỳ quan trọng để bảo vệ dữ liệu và uy tín của doanh nghiệp bạn.',
        imageUrl: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?q=80&w=1769&auto=format&fit=crop',
        author: 'Nguyễn Thị An',
        date: '2024-07-18T09:00:00Z',
        category: 'Bảo mật',
        content: 'Nội dung chi tiết về an ninh mạng...'
    }
];


export const MOCK_TESTIMONIALS: Testimonial[] = [
  { id: '1', name: 'Nguyễn Văn An', quote: 'Dịch vụ sửa chữa PC rất nhanh chóng và chuyên nghiệp. Máy tôi giờ chạy êm ru. Cảm ơn IQ Technology!', avatarUrl: `https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=100&auto=format&fit=crop`, role: 'Khách hàng Cá nhân' },
  { id: '2', name: 'Trần Thị Bích Hợp', quote: 'Được tư vấn cấu hình PC Gaming rất ưng ý, giá cả cũng hợp lý. Các bạn kỹ thuật viên nhiệt tình.', avatarUrl: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop`, role: 'Game thủ' },
  { id: '3', name: 'Công ty TNHH ABC', quote: 'IQ Technology đã hỗ trợ chúng tôi bảo trì toàn bộ hệ thống máy tính văn phòng. Rất hài lòng về chất lượng và thái độ phục vụ.', avatarUrl: `https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop`, role: 'Khách hàng Doanh nghiệp' },
];


export const MOCK_PC_COMPONENTS: Record<string, PCComponent[]> = {
  CPU: [
    { type: 'CPU', name: 'Intel Core i5-13600K', price: 8000000, details: '14 Nhân, 20 Luồng' },
    { type: 'CPU', name: 'AMD Ryzen 5 7600X', price: 7500000, details: '6 Nhân, 12 Luồng' },
    { type: 'CPU', name: 'Intel Core i9-13900K', price: 15000000, details: '24 Nhân, 32 Luồng' },
  ],
  'Bo mạch chủ': [
    { type: 'Motherboard', name: 'ASUS B760M-PLUS WIFI D4', price: 4500000, details: 'DDR4, LGA1700' },
    { type: 'Motherboard', name: 'Gigabyte B650 AORUS ELITE AX', price: 6000000, details: 'DDR5, AM5' },
    { type: 'Motherboard', name: 'MSI Z790 TOMAHAWK WIFI', price: 8000000, details: 'DDR5, LGA1700' },
  ],
  RAM: [
    { type: 'RAM', name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz', price: 1500000, details: '16GB DDR4' },
    { type: 'RAM', name: 'Kingston Fury Beast 32GB (2x16GB) DDR5 5600MHz', price: 3500000, details: '32GB DDR5' },
  ],
  'Card màn hình': [
    { type: 'GPU', name: 'NVIDIA GeForce RTX 3060 12GB', price: 9000000, details: '12GB GDDR6' },
    { type: 'GPU', name: 'AMD Radeon RX 6700 XT 12GB', price: 10000000, details: '12GB GDDR6' },
    { type: 'GPU', name: 'NVIDIA GeForce RTX 4070 Ti 12GB', price: 22000000, details: '12GB GDDR6X' },
  ],
  'Ổ cứng': [
    { type: 'SSD', name: 'Samsung 970 EVO Plus 1TB NVMe M.2', price: 2500000, details: '1TB NVMe Gen3' },
    { type: 'SSD', name: 'Western Digital SN850X 2TB NVMe M.2', price: 5000000, details: '2TB NVMe Gen4' },
    { type: 'HDD', name: 'Seagate Barracuda 2TB 7200RPM SATA', price: 1500000, details: '2TB HDD SATA' },
  ],
  'Nguồn máy tính': [
    { type: 'PSU', name: 'Cooler Master MWE Bronze V2 650W', price: 1500000, details: '650W 80+ Bronze' },
    { type: 'PSU', name: 'Corsair RM750e 750W 80+ Gold', price: 2800000, details: '750W 80+ Gold' },
  ],
  'Vỏ case': [
    { type: 'Case', name: 'Corsair 4000D Airflow', price: 2000000, details: 'Mid-Tower ATX' },
    { type: 'Case', name: 'NZXT H5 Flow', price: 2200000, details: 'Mid-Tower ATX' },
  ],
};

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj001',
        title: 'Triển Khai Hệ Thống Mạng LAN & Wi-Fi Cho Văn Phòng Công Ty XYZ',
        client: 'Công Ty TNHH Giải Pháp XYZ',
        description: 'Tư vấn, thiết kế và thi công toàn bộ hệ thống mạng nội bộ cho văn phòng mới 200m2, bao gồm đi dây mạng CAT6, lắp đặt switch, router, access point UniFi, và cấu hình firewall bảo mật. Đảm bảo kết nối ổn định cho 50+ thiết bị.',
        imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600&auto=format&fit=crop',
        technologiesUsed: ['Mạng UniFi', 'Cáp CAT6', 'Cấu hình Firewall', 'Phân đoạn VLAN'],
        completionDate: '15-05-2024',
        category: 'Hệ thống mạng doanh nghiệp'
    },
    {
        id: 'proj002',
        title: 'Lắp Đặt Hệ Thống Camera Giám Sát An Ninh Cho Biệt Thự Anh An',
        client: 'Anh Nguyễn Văn An',
        description: 'Lắp đặt trọn gói 8 camera IP Hikvision Full Color có màu ban đêm, đầu ghi hình NVR, ổ cứng chuyên dụng. Cấu hình xem qua mạng từ xa trên điện thoại, máy tính. Bảo hành 24 tháng.',
        imageUrl: 'https://images.unsplash.com/photo-1617394884784-5111b138c21a?q=80&w=600&auto=format&fit=crop',
        technologiesUsed: ['Camera IP Hikvision', 'Cài đặt NVR', 'Cấu hình Xem từ xa', 'Tích hợp NAS'],
        completionDate: '20-06-2024',
        category: 'Giải pháp Camera an ninh'
    },
    {
        id: 'proj003',
        title: 'Nâng Cấp Dàn PC Gaming & Streaming Cho Streamer "ProGamerVN"',
        client: 'Streamer ProGamerVN',
        description: 'Tư vấn và nâng cấp toàn bộ dàn PC cũ lên cấu hình mới nhất với Intel Core i9, RTX 4090, 64GB RAM DDR5, tản nhiệt nước custom. Tối ưu hóa cho việc chơi game AAA max settings và streaming chất lượng cao trên Twitch/YouTube.',
        imageUrl: 'https://images.unsplash.com/photo-1593152167428-9a22c79599a2?q=80&w=600&auto=format&fit=crop',
        technologiesUsed: ['Linh kiện PC Cao cấp', 'Tản nhiệt nước Custom', 'Cài đặt OBS', 'Tối ưu Hiệu năng'],
        completionDate: '10-07-2024',
        category: 'PC Build Cao Cấp'
    },
    {
        id: 'proj004',
        title: 'Xây Dựng Hệ Thống Lưu Trữ NAS Cho Studio Thiết Kế Đồ Họa',
        client: 'Pixel Perfect Studio',
        description: 'Cung cấp giải pháp lưu trữ tập trung NAS Synology, dung lượng 20TB. Cấu hình RAID, phân quyền người dùng, backup tự động cho các máy trạm thiết kế. Đảm bảo an toàn dữ liệu và truy cập nhanh chóng.',
        imageUrl: 'https://images.unsplash.com/photo-1626244243254-d3d6061352ca?q=80&w=600&auto=format&fit=crop',
        technologiesUsed: ['NAS Synology', 'Cấu hình RAID', 'Giải pháp Sao lưu Dữ liệu', 'Kiểm soát Truy cập Người dùng'],
        completionDate: '01-04-2024',
        category: 'Lưu trữ dữ liệu & Sao lưu'
    }
];

export const MOCK_STAFF_USERS: User[] = [
  { id: 'staff001', username: 'Nhân Viên Sales', email: 'sales01@iqtech.com', role: 'staff', staffRole: 'Quản lý Bán hàng', password: 'password123', phone: '0912345678', position: 'Quản lý bán hàng' },
  { id: 'staff002', username: 'Kỹ Thuật Viên', email: 'tech01@iqtech.com', role: 'staff', staffRole: 'Trưởng nhóm Kỹ thuật', password: 'password123', phone: '0912345679', position: 'Trưởng nhóm kỹ thuật' },
  { id: 'staff003', username: 'Biên Tập Viên', email: 'content01@iqtech.com', role: 'staff', staffRole: 'Biên tập Nội dung', password: 'password123', phone: '0912345680', position: 'Biên tập viên' },
];

export const MOCK_CUSTOMER_USERS: User[] = [
    {
        id: 'customer001', username: 'Nguyễn Thị Hà', email: 'ha.nguyen@example.com', password: 'password123', role: 'customer',
        dateOfBirth: '1990-05-15', phone: '0901234567', address: '123 Đường Trần Phú, Đà Nẵng', origin: 'Website',
        loyaltyPoints: 150, debtStatus: 'Không có', assignedStaffId: 'staff001',
        lastOrderDate: '2024-07-20T10:30:00Z', totalSpent: 15000000,
    },
    {
        id: 'customer002', username: 'Trần Văn Long', email: 'long.tran@example.com', password: 'password123', role: 'customer',
        dateOfBirth: '1988-11-22', phone: '0907654321', address: '456 Đường Lê Lợi, TP.HCM', origin: 'Facebook Ads',
        loyaltyPoints: 300, debtStatus: 'Có nợ', assignedStaffId: 'staff001',
        lastOrderDate: '2024-07-25T14:00:00Z', totalSpent: 32000000,
    },
    {
        id: 'customer003', username: 'Lê Thanh Thảo', email: 'thao.le@example.com', password: 'password123', role: 'customer',
        dateOfBirth: '1995-03-08', phone: '0912233445', address: '789 Đường Hai Bà Trưng, Hà Nội', origin: 'Giới thiệu',
        loyaltyPoints: 80, debtStatus: 'Không có', assignedStaffId: 'staff002',
        lastOrderDate: '2024-06-10T09:00:00Z', totalSpent: 8000000,
    },
    {
        id: 'customer004', username: 'Phạm Minh Đức', email: 'duc.pham@example.com', password: 'password123', role: 'customer',
        dateOfBirth: '1992-07-01', phone: '0988777666', address: '101 Đường Hoàng Diệu, Cần Thơ', origin: 'Website',
        loyaltyPoints: 20, debtStatus: 'Quá hạn', assignedStaffId: 'staff001',
        lastOrderDate: '2024-05-01T11:00:00Z', totalSpent: 2500000,
    },
];


export const MOCK_ADMIN_NOTIFICATIONS: AdminNotification[] = [
    {
        id: 'notif001',
        message: 'Đơn hàng #order003 vừa được tạo.',
        type: 'info',
        timestamp: new Date().toISOString(),
        isRead: false,
    },
    {
        id: 'notif002',
        message: 'Sản phẩm "CPU Intel Core i9-13900K" sắp hết hàng (còn 2).',
        type: 'warning',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
    }
];
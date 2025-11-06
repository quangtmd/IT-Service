-- =================================================================
-- BẮT ĐẦU SCRIPT SQL - SAO CHÉP TẤT CẢ MỌI THỨ TỪ ĐÂY XUỐNG DƯỚI
-- HÃY XÓA SẠCH CÁC CÂU LỆNH CŨ TRƯỚC KHI DÁN VÀ CHẠY SCRIPT NÀY
-- =================================================================

SET FOREIGN_KEY_CHECKS=0;

-- Drop tables in reverse order of dependency to avoid foreign key errors
DROP TABLE IF EXISTS
    Inventory, Warehouses, ServiceTickets, PayrollRecords, FinancialTransactions,
    ChatLogSessions, MediaItems, Orders, Products, ProductCategories,
    Articles, ArticleCategories, Projects, Services, Testimonials, FaqItems,
    DiscountCodes, CustomMenuLinks, SiteSettings, users;

SET FOREIGN_KEY_CHECKS=1;

-- =================================================================
-- 1. CORE BUSINESS TABLES
-- =================================================================

-- Users Table: Stores all users (admin, staff, customer)
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Hashed password
    role ENUM('admin', 'staff', 'customer') NOT NULL,
    staffRole VARCHAR(255) COMMENT 'Specific role for staff, e.g., Quản lý Bán hàng',
    imageUrl TEXT,
    isLocked BOOLEAN DEFAULT FALSE,
    position VARCHAR(255) COMMENT 'HRM field: Job position',
    phone VARCHAR(20),
    address TEXT,
    joinDate DATE COMMENT 'HRM field: Date of joining',
    status ENUM('Đang hoạt động', 'Tạm nghỉ', 'Đã nghỉ việc') DEFAULT 'Đang hoạt động',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product Categories Table: Hierarchical categories for products
CREATE TABLE ProductCategories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(255),
    parent_category_id INT NULL,
    FOREIGN KEY (parent_category_id) REFERENCES ProductCategories(id) ON DELETE SET NULL
);

-- Products Table: Main product catalog
CREATE TABLE Products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT,
    price DECIMAL(12, 0) NOT NULL,
    originalPrice DECIMAL(12, 0),
    imageUrls JSON,
    description TEXT,
    shortDescription TEXT,
    specifications JSON,
    stock INT NOT NULL DEFAULT 0,
    status VARCHAR(50) COMMENT 'e.g., Mới, Cũ, Like new',
    rating FLOAT DEFAULT 0,
    reviews INT DEFAULT 0,
    brand VARCHAR(255),
    tags JSON,
    brandLogoUrl VARCHAR(255),
    is_published BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    seoMetaTitle VARCHAR(255),
    seoMetaDescription TEXT,
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES ProductCategories(id) ON DELETE SET NULL
);

-- Orders Table: Customer orders
CREATE TABLE Orders (
    id VARCHAR(255) PRIMARY KEY,
    customerInfo JSON NOT NULL COMMENT 'Customer details like name, phone, address',
    items JSON NOT NULL COMMENT 'Array of ordered items',
    totalAmount DECIMAL(12, 0) NOT NULL,
    orderDate DATETIME NOT NULL,
    status ENUM('Chờ xử lý', 'Đang chuẩn bị', 'Đang giao', 'Hoàn thành', 'Đã hủy') NOT NULL,
    shippingInfo JSON COMMENT 'e.g., carrier, trackingNumber',
    paymentInfo JSON NOT NULL COMMENT 'e.g., method, status, transactionId',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- =================================================================
-- 2. CONTENT MANAGEMENT TABLES
-- =================================================================

-- Article Categories Table
CREATE TABLE ArticleCategories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL
);

-- Articles Table: Blog posts, news, guides
CREATE TABLE Articles (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    imageUrl TEXT,
    author VARCHAR(255),
    date DATETIME NOT NULL,
    category VARCHAR(255), -- This could be a FK to ArticleCategories
    content LONGTEXT,
    isAIGenerated BOOLEAN DEFAULT FALSE,
    imageSearchQuery VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE Services (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    imageUrl TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE Projects (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    client VARCHAR(255),
    description TEXT,
    imageUrl TEXT,
    technologiesUsed JSON,
    completionDate DATE,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MediaItems Table: Central library for all uploaded media
CREATE TABLE MediaItems (
    id VARCHAR(255) PRIMARY KEY,
    url LONGTEXT NOT NULL,
    name VARCHAR(255),
    type VARCHAR(100),
    uploadedAt DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials Table
CREATE TABLE Testimonials (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quote TEXT,
    avatarUrl TEXT,
    role VARCHAR(255),
    sort_order INT DEFAULT 0
);

-- FaqItems Table
CREATE TABLE FaqItems (
    id VARCHAR(255) PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT,
    category VARCHAR(255),
    isVisible BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);


-- =================================================================
-- 3. SALES & CUSTOMER SUPPORT TABLES
-- =================================================================

-- ChatLogSessions Table
CREATE TABLE ChatLogSessions (
    id VARCHAR(255) PRIMARY KEY,
    userName VARCHAR(255) NOT NULL,
    userPhone VARCHAR(255),
    startTime DATETIME NOT NULL,
    messages JSON,
    isRead BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DiscountCodes Table
CREATE TABLE DiscountCodes (
    id VARCHAR(255) PRIMARY KEY,
    code VARCHAR(255) UNIQUE NOT NULL,
    type ENUM('percentage', 'fixed_amount') NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    description TEXT,
    expiryDate DATE,
    isActive BOOLEAN DEFAULT TRUE,
    minSpend DECIMAL(12, 0),
    usageLimit INT,
    timesUsed INT DEFAULT 0
);

-- ServiceTickets Table
CREATE TABLE ServiceTickets (
    id VARCHAR(255) PRIMARY KEY,
    ticket_code VARCHAR(255) UNIQUE NOT NULL,
    customer_info JSON,
    device_name VARCHAR(255),
    reported_issue TEXT,
    status ENUM('Đã tiếp nhận', 'Đang chẩn đoán', 'Chờ linh kiện', 'Đang sửa chữa', 'Sẵn sàng trả', 'Đã trả khách') DEFAULT 'Đã tiếp nhận',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- =================================================================
-- 4. FINANCIAL & INVENTORY TABLES
-- =================================================================

-- FinancialTransactions Table
CREATE TABLE FinancialTransactions (
    id VARCHAR(255) PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(12, 0) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    relatedEntity VARCHAR(255) COMMENT 'e.g., Supplier, Customer, Employee Name',
    invoiceNumber VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PayrollRecords Table
CREATE TABLE PayrollRecords (
    id VARCHAR(255) PRIMARY KEY,
    employeeId VARCHAR(255) NOT NULL,
    employeeName VARCHAR(255) NOT NULL,
    payPeriod VARCHAR(7) NOT NULL COMMENT 'Format: YYYY-MM',
    baseSalary DECIMAL(12, 0) DEFAULT 0,
    bonus DECIMAL(12, 0) DEFAULT 0,
    deduction DECIMAL(12, 0) DEFAULT 0,
    finalSalary DECIMAL(12, 0) NOT NULL,
    notes TEXT,
    status ENUM('Chưa thanh toán', 'Đã thanh toán') NOT NULL,
    UNIQUE KEY (employeeId, payPeriod)
);

-- Warehouses Table
CREATE TABLE Warehouses (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT
);

-- Inventory Table (Junction table for Products and Warehouses)
CREATE TABLE Inventory (
    product_id VARCHAR(255),
    warehouse_id VARCHAR(255),
    quantity INT NOT NULL,
    PRIMARY KEY (product_id, warehouse_id),
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES Warehouses(id) ON DELETE CASCADE
);

-- =================================================================
-- 5. SYSTEM & CONFIGURATION TABLES
-- =================================================================

-- CustomMenuLinks Table
CREATE TABLE CustomMenuLinks (
    id VARCHAR(255) PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    sort_order INT DEFAULT 0,
    isVisible BOOLEAN DEFAULT TRUE,
    originalPath VARCHAR(255)
);

-- SiteSettings Key-Value Table
CREATE TABLE SiteSettings (
    settingKey VARCHAR(255) PRIMARY KEY,
    settingValue LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =================================================================
-- 6. INITIAL DATA INSERTION
-- =================================================================

-- Insert Admin User
INSERT INTO users (id, username, email, password, role, staffRole) VALUES
('admin001', 'Admin Quang', 'quangtmdit@gmail.com', 'password123', 'admin', 'Nhân viên Toàn quyền');

-- Insert Main Product Categories
INSERT INTO ProductCategories (id, name, slug, icon, parent_category_id) VALUES
(1, 'Máy tính để bàn (PC)', 'may_tinh_de_ban', 'fas fa-desktop', NULL),
(2, 'Laptop', 'laptop', 'fas fa-laptop', NULL),
(3, 'Linh kiện máy tính', 'linh_kien_may_tinh', 'fas fa-microchip', NULL),
(4, 'Thiết bị ngoại vi', 'thiet_bi_ngoai_vi', 'fas fa-keyboard', NULL),
(5, 'Camera giám sát', 'camera_giam_sat', 'fas fa-video', NULL),
(6, 'Thiết bị mạng', 'thiet_bi_mang', 'fas fa-wifi', NULL),
(7, 'Phần mềm & dịch vụ', 'phan_mem_dich_vu', 'fas fa-cogs', NULL),
(8, 'Phụ kiện & thiết bị khác', 'phu_kien_khac', 'fas fa-plug', NULL),
(9, 'PC Xây Dựng', 'pc_xay_dung', 'fas fa-tools', NULL);

-- Insert Sub-Categories
-- Note: AUTO_INCREMENT will handle IDs starting from 10
INSERT INTO ProductCategories (name, slug, parent_category_id) VALUES
('Máy tính văn phòng', 'pc_van_phong', 1), ('Máy tính Gaming', 'pc_gaming', 1), ('Workstation (Máy trạm)', 'pc_workstation', 1), ('Máy đồng bộ', 'pc_dong_bo', 1),
('Laptop văn phòng', 'laptop_van_phong', 2), ('Laptop Gaming', 'laptop_gaming', 2), ('MacBook', 'macbook', 2), ('Laptop cũ', 'laptop_cu', 2),
('CPU (Vi xử lý Intel, AMD)', 'cpu', 3), ('RAM (DDR4, DDR5…)', 'ram', 3), ('Ổ cứng HDD / SSD (SATA, NVMe)', 'storage', 3), ('VGA (Card màn hình)', 'vga', 3), ('Bo mạch chủ (Mainboard)', 'mainboard', 3), ('Nguồn máy tính (PSU)', 'psu', 3), ('Vỏ máy (Case)', 'case', 3), ('Tản nhiệt (Khí, Nước)', 'cooling', 3),
('Màn hình (LCD, LED, 2K, 4K, Gaming…)', 'man_hinh', 4), ('Bàn phím (Cơ, Giả cơ, Thường)', 'ban_phim', 4), ('Chuột (Gaming, Văn phòng)', 'chuot', 4), ('Tai nghe (Có dây, Không dây)', 'tai_nghe', 4),
('Camera IP (WiFi / LAN)', 'camera_ip', 5), ('Đầu ghi hình (DVR, NVR)', 'dau_ghi_hinh', 5),
('Router WiFi (TP-Link, Asus, UniFi…)', 'router_wifi', 6), ('Switch mạng (PoE, Thường)', 'switch_mang', 6),
('Bản quyền Windows, Office', 'ban_quyen_phan_mem', 7), ('Dịch vụ cài đặt (Tận nơi / Online)', 'dich_vu_cai_dat', 7),
('Cáp chuyển, Hub USB, Docking', 'cap_hub_docking', 8), ('Balo, Túi chống sốc', 'balo_tui', 8),
('Theo Yêu Cầu', 'theo_yeu_cau', 9);

-- =================================================================
-- 7. MOCK PRODUCTS INSERTION - DỮ LIỆU SẢN PHẨM MẪU
-- The category_id corresponds to the auto-incremented IDs of sub-categories
-- PC Văn phòng (ID: 10)
-- PC Gaming (ID: 11)
-- Workstation (ID: 12)
-- Laptop văn phòng (ID: 14)
-- ... and so on
-- =================================================================

-- PC Văn phòng (category_id: 10)
INSERT INTO Products (id, name, category_id, price, originalPrice, imageUrls, shortDescription, specifications, stock, brand, tags, is_featured) VALUES
('PCVP001', 'PC Văn Phòng IQ Office Standard', 10, 7590000, 8500000, '["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800&auto=format&fit=crop"]', 'Cấu hình tối ưu cho công việc văn phòng, học tập online. Mượt mà với các tác vụ Word, Excel, lướt web.', '{"CPU": "Intel Core i3-12100", "RAM": "8GB DDR4 3200MHz", "SSD": "256GB NVMe", "Mainboard": "H610M"}', 50, 'IQ Tech', '["Văn phòng", "Học tập"]', true),
('PCVP002', 'PC Văn Phòng Dell Vostro 3910', 10, 9890000, 10500000, '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop"]', 'Máy bộ Dell ổn định, bền bỉ, bảo hành chính hãng. Hiệu năng tốt cho doanh nghiệp.', '{"CPU": "Intel Core i5-12400", "RAM": "8GB DDR4 3200MHz", "SSD": "512GB NVMe", "OS": "Windows 11 Home SL"}', 30, 'Dell', '["Máy bộ", "Doanh nghiệp"]', false),
('PCVP003', 'PC All-in-One HP 24-cb1012d', 10, 14500000, NULL, '["https://images.unsplash.com/photo-1611263201408-9993b6e82a93?q=80&w=800&auto=format&fit=crop"]', 'Thiết kế tinh tế, gọn gàng. Màn hình 24 inch Full HD sắc nét, tích hợp sẵn loa và webcam.', '{"CPU": "Intel Core i5-1235U", "RAM": "8GB DDR4", "SSD": "512GB NVMe", "Display": "23.8 inch FHD IPS"}', 25, 'HP', '["All-in-One", "Gọn gàng"]', true),
('PCVP004', 'PC Mini Intel NUC', 10, 8200000, NULL, '["https://images.unsplash.com/photo-1627045236365-b153d09a9f28?q=80&w=800&auto=format&fit=crop"]', 'Siêu nhỏ gọn, tiết kiệm không gian, hiệu năng mạnh mẽ cho mọi tác vụ văn phòng.', '{"CPU": "Intel Core i5-1135G7", "RAM": "8GB DDR4", "SSD": "256GB NVMe", "Graphics": "Intel Iris Xe"}', 15, 'Intel', '["Mini PC", "Tiết kiệm không gian"]', false),
('PCVP005', 'PC Văn Phòng Lenovo ThinkCentre Neo', 10, 11500000, 12500000, '["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop"]', 'Độ tin cậy cao từ dòng ThinkCentre, bảo mật cấp doanh nghiệp, hiệu năng ổn định.', '{"CPU": "Intel Core i5-13500", "RAM": "16GB DDR4", "SSD": "512GB NVMe", "OS": "Windows 11 Pro"}', 20, 'Lenovo', '["Doanh nghiệp", "Bền bỉ"]', false);

-- PC Gaming (category_id: 11)
INSERT INTO Products (id, name, category_id, price, originalPrice, imageUrls, shortDescription, specifications, stock, brand, tags, is_featured) VALUES
('PCGM001', 'PC Gaming IQ Eagle', 11, 15990000, 17500000, '["https://images.unsplash.com/photo-1598986646512-921b0d2c6948?q=80&w=800&auto=format&fit=crop"]', 'Cấu hình chiến mượt các game eSports phổ biến: Valorant, CS2, LOL ở độ phân giải Full HD.', '{"CPU": "Intel Core i5-12400F", "RAM": "16GB DDR4 3200MHz", "SSD": "512GB NVMe", "VGA": "NVIDIA RTX 3050 8GB"}', 20, 'IQ Tech', '["eSports", "Full HD", "Bán chạy"]', true),
('PCGM002', 'PC Gaming IQ Beast Master 2K', 11, 28500000, 31000000, '["https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=800&auto=format&fit=crop"]', 'Sức mạnh vượt trội cho trải nghiệm gaming 2K. Thiết kế hầm hố với LED RGB.', '{"CPU": "AMD Ryzen 5 7600", "RAM": "16GB DDR5 5200MHz", "SSD": "1TB NVMe Gen4", "VGA": "NVIDIA RTX 4060 8GB"}', 15, 'IQ Tech', '["Gaming 2K", "RGB", "Khuyến mãi"]', true),
('PCGM003', 'PC Gaming High-End IQ Titan X', 11, 45990000, NULL, '["https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?q=80&w=800&auto=format&fit=crop"]', 'Cấu hình đỉnh cao, cân mọi tựa game AAA ở độ phân giải 4K. Tản nhiệt nước AIO mát mẻ.', '{"CPU": "Intel Core i7-14700K", "RAM": "32GB DDR5 6000MHz", "SSD": "1TB NVMe Gen4", "VGA": "NVIDIA RTX 4070 Ti 12GB"}', 10, 'IQ Tech', '["Gaming 4K", "High-end", "Tản nhiệt nước"]', false),
('PCGM004', 'PC Gaming ASUS ROG Strix G16CH', 11, 35000000, 38000000, '["https://images.unsplash.com/photo-1616432525019-58b2e31c8d76?q=80&w=800&auto=format&fit=crop"]', 'Máy bộ gaming từ ASUS ROG, thiết kế độc đáo, hiệu năng được tinh chỉnh tối ưu.', '{"CPU": "Intel Core i7-13700F", "RAM": "16GB DDR4", "SSD": "1TB NVMe", "VGA": "NVIDIA RTX 4060 Ti"}', 8, 'ASUS', '["Máy bộ", "ROG"]', false),
('PCGM005', 'PC Gaming Entry Level IQ Flash', 11, 11990000, NULL, '["https://images.unsplash.com/photo-1625041400649-5d4f3b06420a?q=80&w=800&auto=format&fit=crop"]', 'Lựa chọn tuyệt vời để bắt đầu với gaming PC, có thể nâng cấp dễ dàng trong tương lai.', '{"CPU": "AMD Ryzen 5 5600G", "RAM": "16GB DDR4 3200MHz", "SSD": "512GB NVMe", "Graphics": "Radeon Vega 7 Graphics"}', 30, 'IQ Tech', '["Giá rẻ", "APU", "Nâng cấp"]', false);

-- CPU (category_id: 18)
INSERT INTO Products (id, name, category_id, price, originalPrice, imageUrls, shortDescription, specifications, stock, brand, tags, is_featured) VALUES
('CPU001', 'CPU Intel Core i5-14600K', 18, 8590000, 9200000, '["https://images.unsplash.com/photo-1627398292454-245842239121?q=80&w=800&auto=format&fit=crop"]', 'Hiệu năng gaming và làm việc đa nhiệm vượt trội. Tần số turbo cao, hỗ trợ ép xung.', '{"Socket": "LGA 1700", "Nhân/Luồng": "14/20", "Xung nhịp Turbo": "5.3 GHz", "TDP": "125W"}', 40, 'Intel', '["Gaming", "Mới nhất"]', true),
('CPU002', 'CPU AMD Ryzen 7 7800X3D', 18, 10490000, NULL, '["https://images.unsplash.com/photo-1591799264318-7e6e74e3c84e?q=80&w=800&auto=format&fit=crop"]', 'Vua gaming với công nghệ 3D V-Cache, mang lại FPS cực cao trong hầu hết các tựa game.', '{"Socket": "AM5", "Nhân/Luồng": "8/16", "Xung nhịp Turbo": "5.0 GHz", "Cache L3": "96MB"}', 25, 'AMD', '["Gaming", "3D V-Cache", "Bán chạy"]', true),
('CPU003', 'CPU Intel Core i9-14900K', 18, 16990000, NULL, '["https://images.unsplash.com/photo-1616441588820-a6f059c11b34?q=80&w=800&auto=format&fit=crop"]', 'CPU mạnh nhất cho người dùng cuối, hiệu năng đỉnh cao cho cả gaming và các tác vụ sáng tạo nội dung.', '{"Socket": "LGA 1700", "Nhân/Luồng": "24/32", "Xung nhịp Turbo": "6.0 GHz", "TDP": "125W"}', 10, 'Intel', '["High-end", "Sáng tạo"]', false),
('CPU004', 'CPU AMD Ryzen 5 7600', 18, 5500000, 6000000, '["https://images.unsplash.com/photo-1633519114754-1f8d4a97e688?q=80&w=800&auto=format&fit=crop"]', 'Lựa chọn p/p tốt nhất cho gaming tầm trung trên nền tảng AM5, hiệu năng mạnh mẽ.', '{"Socket": "AM5", "Nhân/Luồng": "6/12", "Xung nhịp Turbo": "5.1 GHz", "TDP": "65W"}', 50, 'AMD', '["Tầm trung", "Giá tốt"]', false),
('CPU005', 'CPU Intel Core i3-12100F', 18, 2350000, NULL, '["https://images.unsplash.com/photo-158223328-985338787334?q=80&w=800&auto=format&fit=crop"]', 'CPU giá rẻ nhưng có hiệu năng đơn nhân mạnh, lựa chọn tuyệt vời cho các bộ PC gaming giá rẻ.', '{"Socket": "LGA 1700", "Nhân/Luồng": "4/8", "Xung nhịp Turbo": "4.3 GHz", "TDP": "58W"}', 60, 'Intel', '["Giá rẻ", "Gaming"]', false);

-- VGA (category_id: 21)
INSERT INTO Products (id, name, category_id, price, originalPrice, imageUrls, shortDescription, specifications, stock, brand, tags, is_featured) VALUES
('VGA001', 'VGA GIGABYTE GeForce RTX 4060 WINDFORCE OC 8G', 21, 8690000, 9500000, '["https://images.unsplash.com/photo-1627885793933-568b2f34a81a?q=80&w=800&auto=format&fit=crop"]', 'Hiệu năng tốt cho gaming Full HD, hỗ trợ DLSS 3. Tản nhiệt WINDFORCE mát mẻ.', '{"GPU": "RTX 4060", "Bộ nhớ": "8GB GDDR6", "Giao tiếp": "PCIe 4.0"}', 30, 'Gigabyte', '["RTX 40 series", "Full HD", "Khuyến mãi"]', true),
('VGA002', 'VGA ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB', 21, 25990000, NULL, '["https://images.unsplash.com/photo-1591463925312-dce92543a655?q=80&w=800&auto=format&fit=crop"]', 'Sức mạnh vượt trội cho gaming 2K và 4K. Linh kiện TUF bền bỉ, tản nhiệt hiệu quả.', '{"GPU": "RTX 4070 Ti SUPER", "Bộ nhớ": "16GB GDDR6X", "Giao tiếp": "PCIe 4.0"}', 10, 'ASUS', '["Gaming 4K", "TUF Gaming"]', false),
('VGA003', 'VGA MSI GeForce RTX 3060 VENTUS 2X 12G OC', 21, 7490000, 8200000, '["https://images.unsplash.com/photo-1633519114754-1f8d4a97e688?q=80&w=800&auto=format&fit=crop"]', 'Card đồ họa quốc dân, cân tốt các game eSports và nhiều game AAA ở Full HD.', '{"GPU": "RTX 3060", "Bộ nhớ": "12GB GDDR6", "Giao tiếp": "PCIe 4.0"}', 40, 'MSI', '["Bán chạy", "Quốc dân"]', false),
('VGA004', 'VGA SAPPHIRE PULSE Radeon RX 7800 XT 16GB', 21, 14500000, NULL, '["https://images.unsplash.com/photo-1616441588820-a6f059c11b34?q=80&w=800&auto=format&fit=crop"]', 'Đối thủ nặng ký trong phân khúc gaming 2K, p/p cực tốt so với đội xanh.', '{"GPU": "RX 7800 XT", "Bộ nhớ": "16GB GDDR6", "Giao tiếp": "PCIe 4.0"}', 15, 'Sapphire', '["AMD", "Gaming 2K"]', false),
('VGA005', 'VGA GIGABYTE GeForce RTX 4090 GAMING OC 24G', 21, 52990000, NULL, '["https://images.unsplash.com/photo-1627885793933-568b2f34a81a?q=80&w=800&auto=format&fit=crop"]', 'Card đồ họa mạnh nhất thế giới, dành cho trải nghiệm gaming 4K và các tác vụ AI, đồ họa chuyên nghiệp.', '{"GPU": "RTX 4090", "Bộ nhớ": "24GB GDDR6X", "Giao tiếp": "PCIe 4.0"}', 5, 'Gigabyte', '["Flagship", "High-end"]', false);

-- Màn hình (category_id: 26)
INSERT INTO Products (id, name, category_id, price, originalPrice, imageUrls, shortDescription, specifications, stock, brand, tags, is_featured) VALUES
('SCR001', 'Màn hình LG 27GP850-B 27 inch 2K 165Hz Nano IPS', 26, 7990000, 8990000, '["https://images.unsplash.com/photo-1593640495253-2319d27a185e?q=80&w=800&auto=format&fit=crop"]', 'Màn hình gaming 2K đỉnh cao với tấm nền Nano IPS cho màu sắc rực rỡ và tốc độ phản hồi 1ms.', '{"Kích thước": "27 inch", "Độ phân giải": "2560x1440 (2K)", "Tần số quét": "165Hz", "Tấm nền": "Nano IPS"}', 20, 'LG', '["Gaming", "2K", "165Hz", "Bán chạy"]', true),
('SCR002', 'Màn hình Dell UltraSharp U2723QE 27 inch 4K IPS', 26, 12500000, NULL, '["https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=800&auto=format&fit=crop"]', 'Dành cho dân đồ họa chuyên nghiệp. Độ phân giải 4K, màu sắc chính xác, tích hợp hub USB-C tiện lợi.', '{"Kích thước": "27 inch", "Độ phân giải": "3840x2160 (4K)", "Tấm nền": "IPS Black", "Cổng kết nối": "USB-C (DP 1.4, Power Delivery 90W)"}', 15, 'Dell', '["Đồ họa", "4K", "USB-C"]', false),
('SCR003', 'Màn hình Samsung Odyssey G5 32 inch Cong 1000R 2K 144Hz', 26, 7290000, 8000000, '["https://images.unsplash.com/photo-1616588589676-62b3bd4d2b96?q=80&w=800&auto=format&fit=crop"]', 'Trải nghiệm cong đắm chìm với độ cong 1000R, hoàn hảo cho các tựa game nhập vai và đua xe.', '{"Kích thước": "32 inch", "Độ cong": "1000R", "Độ phân giải": "2560x1440 (2K)", "Tần số quét": "144Hz"}', 18, 'Samsung', '["Màn hình cong", "Gaming"]', false),
('SCR004', 'Màn hình ViewSonic VX2428 24 inch FHD 165Hz IPS', 26, 3590000, NULL, '["https://images.unsplash.com/photo-1606226131653-b248b11319b8?q=80&w=800&auto=format&fit=crop"]', 'Màn hình gaming giá rẻ p/p tốt, tần số quét cao cho game eSports.', '{"Kích thước": "24 inch", "Độ phân giải": "1920x1080 (FHD)", "Tần số quét": "165Hz", "Tấm nền": "IPS"}', 40, 'ViewSonic', '["Giá rẻ", "eSports"]', false),
('SCR005', 'Màn hình di động ASUS ZenScreen MB16ACV 15.6 inch FHD IPS', 26, 5500000, NULL, '["https://images.unsplash.com/photo-1587584180293-270561571f37?q=80&w=800&auto=format&fit=crop"]', 'Mở rộng không gian làm việc của bạn mọi lúc mọi nơi với màn hình di động mỏng nhẹ, kết nối chỉ qua một cáp USB-C.', '{"Kích thước": "15.6 inch", "Độ phân giải": "1920x1080 (FHD)", "Kết nối": "USB-C", "Trọng lượng": "0.78kg"}', 22, 'ASUS', '["Màn hình di động", "Linh hoạt"]', false);

-- =================================================================
-- KẾT THÚC SCRIPT SQL - BẠN CHỈ CẦN SAO CHÉP MỌI THỨ Ở TRÊN
-- =================================================================



# IQ Technology - HƯỚNG DẪN CÀI ĐẶT VÀ TRIỂN KHAI

---

## 1. Run Locally (Chạy trên máy tính cá nhân)

This project consists of two main parts: a **Frontend** (React app) and a **Backend** (Node.js API server). You must run both simultaneously for the application to work correctly.

**Prerequisites:**
- Node.js
- A local MySQL database server installed and running. (e.g., via [XAMPP](https://www.apachefriends.org/index.html), [WAMP](https://www.wampserver.com/en/), [MAMP](https://www.mamp.info/en/mamp-mac/), or a direct install).

---

### Step 1: Database Setup (Important!)

For local development, using a local database is strongly recommended to avoid network and IP whitelisting issues with remote databases.

1.  **Start your local MySQL server.**
2.  **Create a new database.** You can use a tool like phpMyAdmin or a command-line client. Name it `iq_technology_db`.
    ```sql
    CREATE DATABASE iq_technology_db;
    ```
3.  **Create the tables.** Go to your database tool, open your `iq_technology_db` database, go to the SQL tab, and **paste the entire SQL script from the top of this file** and run it. This will create all necessary tables and insert initial data.

---

### Step 2: Backend Setup

The backend server connects to your local MySQL database and provides APIs for the frontend.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create an environment file.** Copy the example file to create your own local configuration.
    ```bash
    cp .env.example .env
    ```
3.  **Configure your database connection.** Open the newly created `.env` file and update the credentials to match your local MySQL setup. (For default XAMPP/MAMP/WAMP, the user is often `root` with an empty password).

4.  **Install backend dependencies:**
    ```bash
    npm install
    ```

5.  **Start the backend server:**
    ```bash
    npm start
    ```
    The server will start on `http://localhost:3001`. **Keep this terminal window open.** If it connects to the database successfully, you will see a `✅ Kết nối tới database MySQL thành công!` message. If it fails, it will print a detailed error and stop.

---

### Step 3: Frontend Setup

In a **new, separate terminal window**, set up and run the React frontend.

1.  **Navigate to the project root directory** (if you are in the `backend` directory, run `cd ..`).

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```
3.  **Set your Environment Variables:**
    Create a file named `.env` in the project root (if it doesn't exist) and add your Gemini API key. The backend URL for local development is handled automatically by the proxy.
    ```
    # .env file in the project's root directory
    VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
4.  **Run the frontend app:**
    ```bash
    npm run dev
    ```
The application will now be accessible in your browser (usually at `http://localhost:3000`) and should be able to communicate with your local backend API.

---

## 2. Deploy to Render (Manual Method)

This manual method is more reliable than using a Blueprint. We will create two separate services: a **Web Service** for the backend and a **Static Site** for the frontend.

### Step 1: Database Setup on Remote Server

1.  **Create a remote MySQL database** on a cloud provider (e.g., Hostinger, Aiven, PlanetScale).
2.  **IMPORTANT:** Access your remote database management tool (like phpMyAdmin) and **run the SQL script from the top of this file**. This creates the required tables.
3.  Keep your remote database credentials (Host, User, Password, Database Name) ready.

---

### Step 2: Deploy the Backend (Web Service)

1.  Go to your [Render Dashboard](https://dashboard.render.com/) and click **"New +"** > **"Web Service"**.
2.  Connect your GitHub account and select your `IT-Service` repository.
3.  Configure the service:
    -   **Name:** `it-service-backend` (use this exact name for consistency)
    -   **Root Directory:** `backend`
    -   **Runtime:** `Node`
    -   **Build Command:** `npm install`
    -   **Start Command:** `npm start`
    -   **Plan:** `Free` (or a paid plan if needed)
4.  Scroll to **"Advanced"** and go to the **"Environment"** tab.
5.  Add the following **Environment Variables** using your remote database credentials:
    -   `DB_HOST`
    -   `DB_USER`
    -   `DB_PASSWORD`
    -   `DB_NAME`
6.  Click **"Create Web Service"**.
7.  Once deployed, **copy the URL** of your backend service (e.g., `https://it-service-backend-xxxx.onrender.com`).

---

### Step 3: Deploy the Frontend (Static Site)

1.  Go back to the [Render Dashboard](https://dashboard.render.com/) and click **"New +"** > **"Static Site"**.
2.  Select the same GitHub repository.
3.  Configure the service:
    -   **Name:** `it-service-frontend`
    -   **Root Directory:** (leave blank)
    -   **Build Command:** `npm install && npm run build`
    -   **Publish Directory:** `dist`
4.  Go to **"Advanced"** > **"Environment"**.
5.  Add the following **Environment Variables**:
    -   **Key:** `VITE_GEMINI_API_KEY`, **Value:** (Your Google Gemini API Key)
    -   **Key:** `VITE_BACKEND_API_BASE_URL`, **Value:** **Paste the backend URL you copied.**
6.  Click **"Create Static Site"**.

---

### Step 4: Access Your Application

**QUAN TRỌNG:** Sau khi triển khai xong, bạn sẽ có hai (2) URL: một cho backend và một cho frontend.

-   URL của `it-service-backend`: (ví dụ: `https://it-service-backend-xxxx.onrender.com`) - Đây chỉ là API. Truy cập vào đây sẽ chỉ thấy một trang chào mừng.
-   URL của `it-service-frontend`: (ví dụ: `https://it-service-frontend.onrender.com`) - **ĐÂY LÀ URL CỦA TRANG WEB CỦA BẠN.**

**Bạn phải sử dụng URL của frontend để xem và sử dụng ứng dụng của mình.**

---

## 3. Troubleshooting (Xử lý sự cố)

### Lỗi: "Lỗi Kết Nối Đến Máy Chủ (Backend)" trên website

This is the most common deployment error. It means the backend service on Render is crashing, usually because it cannot connect to your remote database.

1.  **Go to your Render Dashboard**, find the `it-service-backend` service, and click on the **"Logs"** tab.
2.  Look for a detailed error message in red. The backend is now programmed to tell you the **exact reason** for the failure.

#### If the log says `ETIMEDOUT`, `ENOTFOUND`, or mentions IP addresses:

This is an **IP Whitelisting problem**. Your database provider (Hostinger) is blocking Render.
<br/>
<img width="900" alt="Hostinger Remote MySQL" src="https://github.com/user-attachments/assets/70ff379d-d6a0-4bd4-a3f2-8959fc9332e1" />

**How to Fix:**
1.  On Render, go to your `it-service-backend` service and click the **"Networking"** tab.
2.  Find and copy the **"Static Outbound IP Address"**.
3.  Log in to your **Hostinger hPanel**.
4.  Go to **Databases** -> **Remote MySQL**.
5.  Under **"Host"**, paste the Render IP address you copied.
6.  Under **"Database"**, select the database you are using.
7.  Click **"Create"**.
8.  Go back to your `it-service-backend` service on Render and click **"Manual Deploy"** -> **"Deploy latest commit"**.

#### If the log says `ER_ACCESS_DENIED_ERROR`:

Your `DB_USER` or `DB_PASSWORD` is wrong.
**How to Fix:** Go to the **"Environment"** tab of your `it-service-backend` service on Render and carefully re-enter your database username and password.

#### If the log says `ER_BAD_DB_ERROR`:

Your `DB_NAME` is wrong.
**How to Fix:** Go to the **"Environment"** tab of your `it-service-backend` service on Render and correct the database name.

#### If the log says `ER_NO_SUCH_TABLE`:

The backend connected successfully, but you forgot to create the tables.
**How to Fix:** Go to your remote database (e.g., via phpMyAdmin) and run the SQL script from the top of this file.

-- =================================================================
-- BẮT ĐẦU SCRIPT SQL - SAO CHÉP TẤT CẢ MỌI THỨ TỪ ĐÂY XUỐNG DƯỚI
-- SCRIPT NÀY SẼ XÓA VÀ TẠO LẠI TẤT CẢ CÁC BẢNG ĐỂ ĐẢM BẢO CẤU TRÚC LUÔN ĐÚNG
-- =================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- =================================================================
-- 1. DROP ALL TABLES TO ENSURE A CLEAN SLATE
-- This is the safest way to apply schema updates and prevent errors like "Unknown column".
-- =================================================================
DROP TABLE IF EXISTS `StockEntryItems`, `StockEntries`, `Shipments`, `ServiceTickets`, `Quotations`, `Projects`, `ProductReviews`, `ProductCategories`, `ProductBrands`, `PayrollRecords`, `Orders`, `MediaLibrary`, `LeaveRequests`, `KPIs`, `Invoices`, `Inventory`, `FinancialTransactions`, `FinancialAccounts`, `Faqs`, `Employees`, `EmployeeKPIs`, `DiscountCodes`, `Debts`, `Contracts`, `ChatLogSessions`, `AuditLogs`, `Assets`, `Articles`, `ArticleCategories`, `UserDetails`, `Tasks`, `Warehouses`, `WarrantyTickets`, `SiteSettings`, `Returns`, `Suppliers`, `Products`, `Users`;


-- =================================================================
-- 2. CREATE ALL TABLES WITH THE LATEST STRUCTURE
-- =================================================================

CREATE TABLE `Users` (
  `id` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','customer') NOT NULL,
  `staffRole` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isLocked` tinyint(1) DEFAULT 0,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `imageUrl` text,
  `status` enum('Đang hoạt động','Tạm nghỉ','Đã nghỉ việc') DEFAULT 'Đang hoạt động',
  `dateOfBirth` date DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `loyaltyPoints` int(11) DEFAULT 0,
  `debtStatus` enum('Không có','Có nợ','Quá hạn') DEFAULT 'Không có',
  `assignedStaffId` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ProductCategories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `parentId` varchar(255) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Products` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `shortDescription` text,
  `price` decimal(15,2) NOT NULL,
  `originalPrice` decimal(15,2) DEFAULT NULL,
  `costPrice` decimal(15,2) DEFAULT NULL,
  `stock` int(11) NOT NULL,
  `categoryId` varchar(255) DEFAULT NULL,
  `mainCategory` varchar(255) DEFAULT NULL,
  `subCategory` varchar(255) DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `imageUrls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`imageUrls`)),
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `isVisible` tinyint(1) DEFAULT 1,
  `rating` float DEFAULT NULL,
  `reviews` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Mới',
  `productCode` varchar(255) DEFAULT NULL,
  `printName` varchar(255) DEFAULT NULL,
  `purchasePrice` decimal(15,2) DEFAULT NULL,
  `wholesalePrice` decimal(15,2) DEFAULT NULL,
  `hasVAT` tinyint(1) DEFAULT 0,
  `barcode` varchar(255) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `warrantyPeriod` int(11) DEFAULT NULL,
  `countryOfOrigin` varchar(255) DEFAULT NULL,
  `yearOfManufacture` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Orders` (
  `id` varchar(255) NOT NULL,
  `userId` varchar(255) DEFAULT NULL,
  `creatorId` varchar(255) DEFAULT NULL,
  `customerInfo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`customerInfo`)),
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `subtotal` decimal(15,2) DEFAULT 0.00,
  `totalAmount` decimal(15,2) NOT NULL,
  `paidAmount` decimal(15,2) DEFAULT 0.00,
  `cost` decimal(15,2) DEFAULT 0.00,
  `profit` decimal(15,2) DEFAULT 0.00,
  `status` enum('Chờ xử lý','Đang xác nhận','Đã xác nhận','Đang chuẩn bị','Đang giao','Hoàn thành','Đã hủy','Phiếu tạm') NOT NULL,
  `paymentInfo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`paymentInfo`)),
  `shippingInfo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`shippingInfo`)),
  `orderDate` datetime NOT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Warehouses` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Inventory` (
  `productId` varchar(255) NOT NULL,
  `warehouseId` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Suppliers` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contactInfo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`contactInfo`)),
  `paymentTerms` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `FinancialTransactions` (
  `id` varchar(255) NOT NULL,
  `accountId` varchar(255) DEFAULT NULL,
  `type` enum('income','expense') NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text,
  `transactionDate` date NOT NULL,
  `relatedEntity` varchar(255) DEFAULT NULL,
  `invoiceNumber` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `PayrollRecords` (
  `id` varchar(255) NOT NULL,
  `employeeId` varchar(255) NOT NULL,
  `employeeName` varchar(255) DEFAULT NULL,
  `payPeriod` varchar(7) NOT NULL,
  `baseSalary` decimal(15,2) DEFAULT NULL,
  `bonus` decimal(15,2) DEFAULT NULL,
  `deduction` decimal(15,2) DEFAULT NULL,
  `finalSalary` decimal(15,2) DEFAULT NULL,
  `status` enum('Chưa thanh toán','Đã thanh toán') NOT NULL,
  `notes` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Quotations` (
  `id` varchar(255) NOT NULL,
  `customer_id` varchar(255) DEFAULT NULL,
  `customerInfo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`customerInfo`)),
  `creation_date` datetime NOT NULL,
  `expiry_date` datetime DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `subtotal` decimal(15,2) NOT NULL,
  `discount_amount` decimal(15,2) DEFAULT NULL,
  `tax_amount` decimal(15,2) DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `status` enum('Nháp','Đã gửi','Đã chấp nhận','Hết hạn','Đã hủy') NOT NULL,
  `terms` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ArticleCategories` (`id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `slug` varchar(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Articles` (`id` varchar(255) NOT NULL, `title` varchar(255) NOT NULL, `summary` text, `content` longtext, `author` varchar(255) DEFAULT NULL, `category` varchar(255) DEFAULT NULL, `imageUrl` text, `date` datetime NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Assets` (`id` varchar(255) NOT NULL, `name` varchar(255) DEFAULT NULL, `serialNumber` varchar(255) DEFAULT NULL, `purchaseDate` date DEFAULT NULL, `value` decimal(15,2) DEFAULT NULL, `assignedTo` varchar(255) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `AuditLogs` (`id` int(11) NOT NULL, `userId` varchar(255) DEFAULT NULL, `action` varchar(255) NOT NULL, `target` varchar(255) DEFAULT NULL, `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)), `ipAddress` varchar(45) DEFAULT NULL, `timestamp` timestamp NULL DEFAULT current_timestamp()) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `ChatLogSessions` (`id` varchar(255) NOT NULL, `userName` varchar(255) DEFAULT NULL, `userPhone` varchar(20) DEFAULT NULL, `startTime` timestamp NULL DEFAULT current_timestamp(), `messages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`messages`))) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Contracts` (`id` varchar(255) NOT NULL, `name` varchar(255) DEFAULT NULL, `partnerName` varchar(255) DEFAULT NULL, `startDate` date DEFAULT NULL, `endDate` date DEFAULT NULL, `fileUrl` text) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Debts` (`id` varchar(255) NOT NULL, `entityId` varchar(255) NOT NULL, `entityType` enum('customer','supplier') NOT NULL, `type` enum('receivable','payable') NOT NULL, `amount` decimal(15,2) NOT NULL, `dueDate` date DEFAULT NULL, `status` varchar(100) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `DiscountCodes` (`id` varchar(255) NOT NULL, `code` varchar(255) NOT NULL, `type` enum('percentage','fixed_amount') NOT NULL, `value` decimal(10,2) NOT NULL, `description` text, `expiryDate` date DEFAULT NULL, `isActive` tinyint(1) DEFAULT 1) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `EmployeeKPIs` (`id` varchar(255) NOT NULL, `employeeId` varchar(255) NOT NULL, `kpiId` varchar(255) NOT NULL, `actualValue` decimal(15,2) DEFAULT NULL, `period` varchar(50) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Employees` (`userId` varchar(255) NOT NULL, `position` varchar(255) DEFAULT NULL, `joinDate` date DEFAULT NULL, `salary` decimal(15,2) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Faqs` (`id` varchar(255) NOT NULL, `question` text NOT NULL, `answer` text NOT NULL, `category` varchar(255) DEFAULT NULL, `isVisible` tinyint(1) DEFAULT 1) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `FinancialAccounts` (`id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `type` varchar(100) DEFAULT NULL, `balance` decimal(15,2) DEFAULT 0.00) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Invoices` (`id` varchar(255) NOT NULL, `orderId` varchar(255) DEFAULT NULL, `amount` decimal(15,2) NOT NULL, `status` enum('unpaid','paid','overdue') NOT NULL, `dueDate` date DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `KPIs` (`id` varchar(255) NOT NULL, `name` varchar(255) DEFAULT NULL, `targetValue` decimal(15,2) DEFAULT NULL, `unit` varchar(50) DEFAULT NULL, `period` varchar(50) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `LeaveRequests` (`id` varchar(255) NOT NULL, `employeeId` varchar(255) NOT NULL, `startDate` date DEFAULT NULL, `endDate` date DEFAULT NULL, `reason` text, `status` enum('pending','approved','rejected') DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `MediaLibrary` (`id` varchar(255) NOT NULL, `url` text NOT NULL, `name` varchar(255) DEFAULT NULL, `type` varchar(100) DEFAULT NULL, `uploadedAt` timestamp NULL DEFAULT current_timestamp()) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `ProductBrands` (`id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `ProductReviews` (`id` varchar(255) NOT NULL, `productId` varchar(255) NOT NULL, `userId` varchar(255) NOT NULL, `rating` tinyint(4) NOT NULL, `comment` text, `createdAt` timestamp NULL DEFAULT current_timestamp()) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Projects` (`id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `managerId` varchar(255) DEFAULT NULL, `startDate` date DEFAULT NULL, `endDate` date DEFAULT NULL, `budget` decimal(15,2) DEFAULT NULL, `status` varchar(100) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `ServiceTickets` (
  `id` varchar(255) NOT NULL,
  `ticket_code` varchar(255) DEFAULT NULL,
  `customerId` varchar(255) DEFAULT NULL,
  `deviceName` varchar(255) DEFAULT NULL,
  `reported_issue` text,
  `status` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  `assigneeId` varchar(255) DEFAULT NULL,
  `rating` tinyint(1) DEFAULT NULL,
  `customer_info` JSON,
  `invoiceId` VARCHAR(255) NULL,
  `receiverId` VARCHAR(255) NULL,
  `work_items` TEXT NULL,
  `appointment_date` DATETIME NULL,
  `physical_condition` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Shipments` (`id` varchar(255) NOT NULL, `orderId` varchar(255) NOT NULL, `trackingCode` varchar(255) DEFAULT NULL, `shippingPartner` varchar(255) DEFAULT NULL, `status` varchar(255) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `SiteSettings` (`settingKey` varchar(255) NOT NULL, `settingValue` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settingValue`)), `updatedAt` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `StockEntries` (`id` varchar(255) NOT NULL, `type` enum('in','out') NOT NULL, `entryDate` timestamp NULL DEFAULT current_timestamp(), `supplierId` varchar(255) DEFAULT NULL, `orderId` varchar(255) DEFAULT NULL, `notes` text) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `StockEntryItems` (`stockEntryId` varchar(255) NOT NULL, `productId` varchar(255) NOT NULL, `quantity` int(11) NOT NULL, `costPrice` decimal(15,2) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Tasks` (`id` varchar(255) NOT NULL, `projectId` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `assigneeId` varchar(255) DEFAULT NULL, `dueDate` date DEFAULT NULL, `status` varchar(100) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `UserDetails` (`userId` varchar(255) NOT NULL, `fullName` varchar(255) DEFAULT NULL, `phone` varchar(20) DEFAULT NULL, `address` text, `imageUrl` text, `dateOfBirth` date DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Returns` (`id` varchar(255) NOT NULL, `orderId` varchar(255) NOT NULL, `reason` text, `status` ENUM('Đang chờ','Đã duyệt','Đã từ chối') NOT NULL DEFAULT 'Đang chờ', `refundAmount` decimal(15,2) DEFAULT NULL, `createdAt` timestamp NULL DEFAULT current_timestamp()) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `WarrantyTickets` (
  `id` varchar(255) NOT NULL,
  `ticketNumber` varchar(255) NOT NULL,
  `productModel` varchar(255) DEFAULT NULL,
  `productSerial` varchar(255) DEFAULT NULL,
  `customerName` varchar(255) NOT NULL,
  `customerPhone` varchar(255) DEFAULT NULL,
  `creatorId` varchar(255) DEFAULT NULL,
  `totalAmount` decimal(15,2) DEFAULT 0.00,
  `status` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `reportedIssue` text,
  `resolution_notes` text,
  `receiveDate` datetime DEFAULT NULL,
  `returnDate` datetime DEFAULT NULL,
  `orderId` varchar(255) DEFAULT NULL,
  `productId` varchar(255) DEFAULT NULL,
  `customerId` varchar(255) DEFAULT NULL,
  `warrantyCenter` varchar(255) DEFAULT NULL,
  `priority` varchar(255) DEFAULT 'Bình thường',
  `warrantyType` varchar(255) DEFAULT NULL,
  `technician_notes` text,
  `repairDate` datetime DEFAULT NULL,
  `returnStaffId` varchar(255) DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `serviceFee` decimal(15,2) DEFAULT 0.00,
  `discount` decimal(15,2) DEFAULT 0.00,
  `vat` decimal(5,2) DEFAULT 0.00,
  `transactionType` varchar(50) DEFAULT 'Sửa chữa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =================================================================
-- 3. ADD INDEXES & CONSTRAINTS
-- =================================================================
ALTER TABLE `Users` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `email` (`email`);
ALTER TABLE `ProductCategories` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `slug` (`slug`), ADD KEY `parentId` (`parentId`);
ALTER TABLE `Products` ADD PRIMARY KEY (`id`), ADD KEY `categoryId` (`categoryId`);
ALTER TABLE `Orders` ADD PRIMARY KEY (`id`), ADD KEY `userId` (`userId`), ADD KEY `creatorId` (`creatorId`);
ALTER TABLE `Warehouses` ADD PRIMARY KEY (`id`);
ALTER TABLE `Inventory` ADD PRIMARY KEY (`productId`,`warehouseId`), ADD KEY `warehouseId` (`warehouseId`);
ALTER TABLE `Suppliers` ADD PRIMARY KEY (`id`);
ALTER TABLE `FinancialTransactions` ADD PRIMARY KEY (`id`), ADD KEY `accountId` (`accountId`);
ALTER TABLE `PayrollRecords` ADD PRIMARY KEY (`id`), ADD KEY `employeeId` (`employeeId`);
ALTER TABLE `Quotations` ADD PRIMARY KEY (`id`), ADD KEY `customer_id` (`customer_id`);
ALTER TABLE `ArticleCategories` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`), ADD UNIQUE KEY `slug` (`slug`);
ALTER TABLE `Articles` ADD PRIMARY KEY (`id`);
ALTER TABLE `Assets` ADD PRIMARY KEY (`id`), ADD KEY `assignedTo` (`assignedTo`);
ALTER TABLE `AuditLogs` ADD PRIMARY KEY (`id`);
ALTER TABLE `ChatLogSessions` ADD PRIMARY KEY (`id`);
ALTER TABLE `Contracts` ADD PRIMARY KEY (`id`);
ALTER TABLE `Debts` ADD PRIMARY KEY (`id`);
ALTER TABLE `DiscountCodes` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `code` (`code`);
ALTER TABLE `EmployeeKPIs` ADD PRIMARY KEY (`id`), ADD KEY `employeeId` (`employeeId`), ADD KEY `kpiId` (`kpiId`);
ALTER TABLE `Employees` ADD PRIMARY KEY (`userId`);
ALTER TABLE `Faqs` ADD PRIMARY KEY (`id`);
ALTER TABLE `FinancialAccounts` ADD PRIMARY KEY (`id`);
ALTER TABLE `Invoices` ADD PRIMARY KEY (`id`), ADD KEY `orderId` (`orderId`);
ALTER TABLE `KPIs` ADD PRIMARY KEY (`id`);
ALTER TABLE `LeaveRequests` ADD PRIMARY KEY (`id`), ADD KEY `employeeId` (`employeeId`);
ALTER TABLE `MediaLibrary` ADD PRIMARY KEY (`id`);
ALTER TABLE `ProductBrands` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`);
ALTER TABLE `ProductReviews` ADD PRIMARY KEY (`id`), ADD KEY `productId` (`productId`), ADD KEY `userId` (`userId`);
ALTER TABLE `Projects` ADD PRIMARY KEY (`id`), ADD KEY `managerId` (`managerId`);
ALTER TABLE `ServiceTickets` ADD PRIMARY KEY (`id`), ADD KEY `customerId` (`customerId`);
ALTER TABLE `Shipments` ADD PRIMARY KEY (`id`), ADD KEY `orderId` (`orderId`);
ALTER TABLE `SiteSettings` ADD PRIMARY KEY (`settingKey`);
ALTER TABLE `StockEntries` ADD PRIMARY KEY (`id`), ADD KEY `supplierId` (`supplierId`), ADD KEY `orderId` (`orderId`);
ALTER TABLE `StockEntryItems` ADD PRIMARY KEY (`stockEntryId`,`productId`), ADD KEY `productId` (`productId`);
ALTER TABLE `Tasks` ADD PRIMARY KEY (`id`), ADD KEY `projectId` (`projectId`), ADD KEY `assigneeId` (`assigneeId`);
ALTER TABLE `UserDetails` ADD PRIMARY KEY (`userId`);
ALTER TABLE `Returns` ADD PRIMARY KEY (`id`), ADD KEY `orderId` (`orderId`);
ALTER TABLE `WarrantyTickets` ADD PRIMARY KEY (`id`), ADD KEY `orderId` (`orderId`), ADD KEY `productId` (`productId`), ADD KEY `customerId` (`customerId`), ADD KEY `creatorId` (`creatorId`);
ALTER TABLE `AuditLogs` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- =================================================================
-- 4. INITIAL DATA INSERTION (Sẽ bỏ qua nếu dữ liệu đã tồn tại)
-- =================================================================

INSERT IGNORE INTO `Users` (`id`, `username`, `email`, `password`, `role`, `staffRole`, `status`, `isLocked`, `phone`, `address`, `dateOfBirth`, `origin`, `loyaltyPoints`, `debtStatus`, `assignedStaffId`) VALUES
('cust001', 'Nguyễn Văn An', 'an.nguyen@email.com', 'password123', 'customer', NULL, 'Đang hoạt động', 0, '0905123456', '123 Nguyễn Văn Linh, Đà Nẵng', '1990-05-15', 'Website', 150, 'Không có', 'staff002'),
('cust002', 'Trần Thị Bích', 'bich.tran@email.com', 'password123', 'customer', NULL, 'Đang hoạt động', 0, '0935987654', '45 Lê Duẩn, Đà Nẵng', '1995-11-20', 'Facebook Ads', 20, 'Có nợ', 'staff002'),
('cust003', 'Lê Hoàng Long', 'long.le@email.com', 'password123', 'customer', NULL, 'Đang hoạt động', 0, '0978111222', 'K12/3 Phan Châu Trinh, Đà Nẵng', '1988-01-30', 'Giới thiệu', 500, 'Không có', 'staff002'),
('cust004', 'Phạm Thị Mai', 'mai.pham@email.com', 'password123', 'customer', NULL, 'Đang hoạt động', 0, '0945333444', '78 Hùng Vương, Đà Nẵng', '2001-03-10', 'Website', 0, 'Không có', NULL),
('cust005', 'Võ Thành Trung', 'trung.vo@email.com', 'password123', 'customer', NULL, 'Đang hoạt động', 1, '0988555666', '34/5 Hoàng Diệu, Đà Nẵng', '1999-07-25', 'Khác', 80, 'Quá hạn', 'staff002'),
('staff001', 'Lê Hùng', 'hung.le@iqtech.com', 'password123', 'staff', 'Trưởng nhóm Kỹ thuật', 'Đang hoạt động', 0, '0911855055', 'Văn phòng IQ Tech', NULL, NULL, NULL, NULL, NULL),
('staff002', 'Nguyễn Thị Lan', 'lan.nguyen@iqtech.com', 'password123', 'staff', 'Quản lý Bán hàng', 'Đang hoạt động', 0, '0911855056', 'Văn phòng IQ Tech', NULL, NULL, NULL, NULL, NULL),
('user001', 'Quang Trần', 'quangtmdit@gmail.com', 'password123', 'admin', 'Nhân viên Toàn quyền', 'Đang hoạt động', 0, '0911855055', 'Văn phòng IQ Tech', NULL, NULL, NULL, NULL, NULL);

INSERT IGNORE INTO `ProductCategories` (`id`, `name`, `slug`, `parentId`, `icon`) VALUES
('may_tinh_de_ban', 'Máy tính để bàn (PC)', 'may_tinh_de_ban', NULL, 'fas fa-desktop'),
('laptop', 'Laptop', 'laptop', NULL, 'fas fa-laptop'),
('linh_kien_may_tinh', 'Linh kiện máy tính', 'linh_kien_may_tinh', NULL, 'fas fa-microchip'),
('thiet_bi_ngoai_vi', 'Thiết bị ngoại vi', 'thiet_bi_ngoai_vi', NULL, 'fas fa-keyboard'),
('camera_giam_sat', 'Camera giám sát', 'camera_giam_sat', NULL, 'fas fa-video'),
('thiet_bi_mang', 'Thiết bị mạng', 'thiet_bi_mang', NULL, 'fas fa-wifi'),
('phan_mem_dich_vu', 'Phần mềm & dịch vụ', 'phan_mem_dich_vu', NULL, 'fas fa-cogs'),
('phu_kien_khac', 'Phụ kiện & thiết bị khác', 'phu_kien_khac', NULL, 'fas fa-plug'),
('pc_van_phong', 'Máy tính văn phòng', 'pc_van_phong', 'may_tinh_de_ban', NULL),
('pc_gaming', 'Máy tính Gaming', 'pc_gaming', 'may_tinh_de_ban', NULL),
('pc_workstation', 'Workstation (Máy trạm)', 'pc_workstation', 'may_tinh_de_ban', NULL),
('pc_dong_bo', 'Máy đồng bộ', 'pc_dong_bo', 'may_tinh_de_ban', NULL),
('laptop_van_phong', 'Laptop văn phòng', 'laptop_van_phong', 'laptop', NULL),
('laptop_gaming', 'Laptop Gaming', 'laptop_gaming', 'laptop', NULL),
('macbook', 'MacBook', 'macbook', 'laptop', NULL),
('laptop_cu', 'Laptop cũ', 'laptop_cu', 'laptop', NULL),
('cpu', 'CPU (Vi xử lý Intel, AMD)', 'cpu', 'linh_kien_may_tinh', NULL),
('ram', 'RAM (DDR4, DDR5…)', 'ram', 'linh_kien_may_tinh', NULL),
('storage', 'Ổ cứng HDD / SSD (SATA, NVMe)', 'storage', 'linh_kien_may_tinh', NULL),
('vga', 'VGA (Card màn hình)', 'vga', 'linh_kien_may_tinh', NULL),
('mainboard', 'Bo mạch chủ (Mainboard)', 'mainboard', 'linh_kien_may_tinh', NULL),
('psu', 'Nguồn máy tính (PSU)', 'psu', 'linh_kien_may_tinh', NULL),
('case', 'Vỏ máy (Case)', 'case', 'linh_kien_may_tinh', NULL),
('cooling', 'Tản nhiệt (Khí, Nước)', 'cooling', 'linh_kien_may_tinh', NULL),
('man_hinh', 'Màn hình (LCD, LED, 2K, 4K, Gaming…)', 'man_hinh', 'thiet_bi_ngoai_vi', NULL),
('ban_phim', 'Bàn phím (Cơ, Giả cơ, Thường)', 'ban_phim', 'thiet_bi_ngoai_vi', NULL),
('chuot', 'Chuột (Gaming, Văn phòng)', 'chuot', 'thiet_bi_ngoai_vi', NULL),
('tai_nghe', 'Tai nghe (Có dây, Không dây)', 'tai_nghe', 'thiet_bi_ngoai_vi', NULL),
('camera_ip', 'Camera IP (WiFi / LAN)', 'camera_ip', 'camera_giam_sat', NULL),
('dau_ghi_hinh', 'Đầu ghi hình (DVR, NVR)', 'dau_ghi_hinh', 'camera_giam_sat', NULL),
('router_wifi', 'Router WiFi (TP-Link, Asus, UniFi…)', 'router_wifi', 'thiet_bi_mang', NULL),
('switch_mang', 'Switch mạng (PoE, Thường)', 'switch_mang', 'thiet_bi_mang', NULL),
('ban_quyen_phan_mem', 'Bản quyền Windows, Office', 'ban_quyen_phan_mem', 'phan_mem_dich_vu', NULL),
('dich_vu_cai_dat', 'Dịch vụ cài đặt (Tận nơi / Online)', 'dich_vu_cai_dat', 'phan_mem_dich_vu', NULL),
('cap_hub_docking', 'Cáp chuyển, Hub USB, Docking', 'cap_hub_docking', 'phu_kien_khac', NULL),
('balo_tui', 'Balo, Túi chống sốc', 'balo_tui', 'phu_kien_khac', NULL);

INSERT IGNORE INTO `Warehouses` (`id`, `name`, `location`) VALUES 
('WH001', 'Kho Chính', '10 Huỳnh Thúc Kháng, Đà Nẵng'), 
('WH002', 'Kho Phụ', 'K1/2 Lê Đình Lý, Đà Nẵng');

INSERT IGNORE INTO `Suppliers` (`id`, `name`, `contactInfo`, `paymentTerms`) VALUES 
('SUP001', 'Nhà phân phối Tin học Mai Hoàng', '{\"email\":\"contact@maihoang.com.vn\", \"phone\":\"02436285868\"}', 'Thanh toán gối đầu 30 ngày'), 
('SUP002', 'Công ty máy tính Vĩnh Xuân (SPC)', '{\"email\":\"info@spc.com.vn\", \"phone\":\"02838326085\"}', 'Thanh toán ngay khi nhận hàng'),
('SUP003', 'Công ty máy tính Viễn Sơn', '{\"email\":\"info@microstar.vn\", \"phone\":\"02838326085\"}', 'Thanh toán cuối tháng');

INSERT IGNORE INTO `FinancialAccounts` (`id`, `name`, `type`, `balance`) VALUES
('ACC001', 'Tiền mặt', 'cash', 50000000.00),
('ACC002', 'Vietcombank', 'bank', 250000000.00),
('ACC003', 'Công nợ phải thu', 'receivable', 0.00);

INSERT IGNORE INTO `FinancialTransactions` (`id`, `accountId`, `type`, `category`, `amount`, `description`, `transactionDate`) VALUES
('TRN001', 'ACC001', 'expense', 'Chi phí Vận hành', 5000000.00, 'Trả tiền thuê mặt bằng T10/2025', '2025-10-01'),
('TRN002', 'ACC002', 'income', 'Doanh thu Bán hàng', 15990000.00, 'Thanh toán đơn hàng #ORD001', '2025-10-02'),
('TRN003', 'ACC001', 'expense', 'Chi phí Nhà Cung Cấp', 20000000.00, 'Trả tiền hàng cho Mai Hoàng', '2025-10-03');

INSERT IGNORE INTO `Employees` (`userId`, `position`, `joinDate`, `salary`) VALUES
('staff001', 'Lê Hùng', '2022-01-15', 18000000.00),
('staff002', 'Nguyễn Thị Lan', '2021-08-20', 22000000.00),
('user001', 'Giám đốc', '2020-01-01', 35000000.00);

INSERT IGNORE INTO `PayrollRecords` (`id`, `employeeId`, `employeeName`, `payPeriod`, `baseSalary`, `bonus`, `deduction`, `finalSalary`, `status`, `notes`) VALUES
('PAY-2025-09-staff001', 'staff001', 'Lê Hùng', '2025-09', 18000000.00, 1000000.00, 0.00, 19000000.00, 'Đã thanh toán', 'Thưởng hoàn thành tốt dự án'),
('PAY-2025-09-staff002', 'staff002', 'Nguyễn Thị Lan', '2025-09', 22000000.00, 5000000.00, 0.00, 27000000.00, 'Đã thanh toán', 'Thưởng doanh số vượt chỉ tiêu');

INSERT IGNORE INTO `DiscountCodes` (`id`, `code`, `type`, `value`, `description`, `expiryDate`, `isActive`) VALUES
('DC001', 'WELCOME10', 'percentage', 10.00, 'Giảm 10% cho khách hàng mới', '2025-12-31', 1),
('DC002', 'FREESHIP', 'fixed_amount', 30000.00, 'Freeship cho đơn hàng từ 500k', NULL, 1);

INSERT IGNORE INTO `KPIs` (`id`, `name`, `targetValue`, `unit`, `period`) VALUES
('KPI01', 'Doanh số tháng', 500000000.00, 'VNĐ', 'Tháng'),
('KPI02', 'Số ticket hỗ trợ đã giải quyết', 100.00, 'ticket', 'Tháng');

INSERT IGNORE INTO `Projects` (`id`, `name`, `managerId`, `startDate`, `endDate`, `budget`, `status`) VALUES
('PROJ001', 'Triển khai hệ thống mạng cho cty ABC', 'staff001', '2025-09-01', '2025-09-30', 50000000.00, 'Hoàn thành'),
('PROJ002', 'Nâng cấp hệ thống PC phòng net XYZ', 'staff001', '2025-10-05', '2025-10-25', 150000000.00, 'Đang triển khai');

INSERT IGNORE INTO `Tasks` (`id`, `projectId`, `name`, `assigneeId`, `dueDate`, `status`) VALUES
('TASK001', 'PROJ002', 'Khảo sát hiện trạng', 'staff001', '2025-10-06', 'Hoàn thành'),
('TASK002', 'PROJ002', 'Lên cấu hình và báo giá', 'staff002', '2025-10-08', 'Đang thực hiện');

INSERT IGNORE INTO `Contracts` (`id`, `name`, `partnerName`, `startDate`, `endDate`) VALUES
('CTR001', 'Hợp đồng bảo trì hệ thống cty ABC', 'Công ty TNHH ABC', '2025-10-01', '2026-10-01');

INSERT IGNORE INTO `Assets` (`id`, `name`, `serialNumber`, `purchaseDate`, `value`, `assignedTo`) VALUES
('ASSET001', 'Laptop Dell Vostro 5590', 'SVN12345XYZ', '2022-01-20', 22000000.00, 'staff001');

INSERT IGNORE INTO `LeaveRequests` (`id`, `employeeId`, `startDate`, `endDate`, `reason`, `status`) VALUES
('LEAVE001', 'staff002', '2025-09-10', '2025-09-11', 'Việc gia đình', 'approved');

INSERT IGNORE INTO `Debts` (`id`, `entityId`, `entityType`, `type`, `amount`, `dueDate`, `status`) VALUES
('DEBT001', 'cust002', 'customer', 'receivable', 5000000.00, '2025-11-15', 'Chưa thanh toán');

INSERT IGNORE INTO `Returns` (`id`, `orderId`, `reason`, `status`, `refundAmount`, `createdAt`) VALUES
('RET001', 'ORD001', 'Sản phẩm lỗi card màn hình, không lên hình', 'Đã duyệt', 15990000.00, '2025-10-10 10:00:00'),
('RET002', 'ORD002', 'Khách đổi ý, muốn nâng cấp lên sản phẩm khác', 'Đang chờ', 0.00, '2025-10-11 14:00:00');

INSERT IGNORE INTO `Products` (`id`, `name`, `price`, `originalPrice`, `stock`, `categoryId`, `mainCategory`, `subCategory`, `brand`, `imageUrls`, `shortDescription`, `specifications`, `tags`, `isVisible`) VALUES
('PCVP001', 'PC Văn Phòng IQ Office Standard', 7590000.00, 8500000.00, 50, 'pc_van_phong', 'Máy tính để bàn (PC)', 'Máy tính văn phòng', 'IQ Tech', '[\"https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?q=80&w=800\"]', 'Cấu hình tối ưu cho công việc văn phòng, học tập online. Mượt mà với các tác vụ Word, Excel, lướt web.', '{\"CPU\": \"Intel Core i3-12100\", \"RAM\": \"8GB DDR4 3200MHz\", \"SSD\": \"256GB NVMe\", \"Mainboard\": \"H610M\"}', '[\"Văn phòng\", \"Học tập\"]', 1),
('PCVP002', 'PC Văn Phòng Dell Vostro 3910', 9890000.00, 10500000.00, 30, 'pc_van_phong', 'Máy tính để bàn (PC)', 'Máy tính văn phòng', 'Dell', '[\"https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?q=80&w=800\"]', 'Máy bộ Dell ổn định, bền bỉ, bảo hành chính hãng. Hiệu năng tốt cho doanh nghiệp.', '{\"CPU\": \"Intel Core i5-12400\", \"RAM\": \"8GB DDR4 3200MHz\", \"SSD\": \"512GB NVMe\", \"OS\": \"Windows 11 Home SL\"}', '[\"Máy bộ\", \"Doanh nghiệp\"]', 1),
('PCGM001', 'PC Gaming IQ Eagle', 15990000.00, 17500000.00, 20, 'pc_gaming', 'Máy tính để bàn (PC)', 'Máy tính Gaming', 'IQ Tech', '[\"https://images.unsplash.com/photo-1604367233930-2ae34a974b85?q=80&w=800\"]', 'Cấu hình chiến mượt các game eSports phổ biến: Valorant, CS2, LOL ở độ phân giải Full HD.', '{\"CPU\": \"Intel Core i5-12400F\", \"RAM\": \"16GB DDR4 3200MHz\", \"SSD\": \"512GB NVMe\", \"VGA\": \"NVIDIA RTX 3050 8GB\"}', '[\"eSports\", \"Full HD\", \"Bán chạy\", \"Nổi bật\"]', 1),
('PCGM002', 'PC Gaming IQ Beast Master 2K', 28500000.00, 31000000.00, 15, 'pc_gaming', 'Máy tính để bàn (PC)', 'Máy tính Gaming', 'IQ Tech', '[\"https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=800\"]', 'Sức mạnh vượt trội cho trải nghiệm gaming 2K. Thiết kế hầm hố với LED RGB.', '{\"CPU\": \"AMD Ryzen 5 7600\", \"RAM\": \"16GB DDR5 5200MHz\", \"SSD\": \"1TB NVMe Gen4\", \"VGA\": \"NVIDIA RTX 4060 8GB\"}', '[\"Gaming 2K\", \"RGB\", \"Khuyến mãi\", \"Nổi bật\"]', 1),
('PCGM003', 'PC Gaming High-End IQ Titan X', 45990000.00, NULL, 10, 'pc_gaming', 'Máy tính để bàn (PC)', 'Máy tính Gaming', 'IQ Tech', '[\"https://images.unsplash.com/photo-1627045236365-b153d09a9f28?q=80&w=800\"]', 'Cấu hình đỉnh cao, cân mọi tựa game AAA ở độ phân giải 4K. Tản nhiệt nước AIO mát mẻ.', '{\"CPU\": \"Intel Core i7-14700K\", \"RAM\": \"32GB DDR5 6000MHz\", \"SSD\": \"1TB NVMe Gen4\", \"VGA\": \"NVIDIA RTX 4070 Ti 12GB\"}', '[\"Gaming 4K\", \"High-end\", \"Tản nhiệt nước\"]', 1),
('LTGM001', 'Laptop Gaming Acer Nitro 5 Eagle', 21500000.00, 24000000.00, 25, 'laptop_gaming', 'Laptop', 'Laptop Gaming', 'Acer', '[\"https://images.unsplash.com/photo-1663180436839-44243a8ace3e?q=80&w=800\"]', 'Laptop gaming quốc dân với hiệu năng mạnh mẽ, tản nhiệt tốt và màn hình 144Hz.', '{\"CPU\": \"Intel Core i5-12500H\", \"RAM\": \"16GB DDR5\", \"SSD\": \"512GB NVMe\", \"VGA\": \"NVIDIA RTX 3050Ti 4GB\", \"Display\": \"15.6 inch FHD 144Hz\"}', '[\"Laptop Gaming\", \"Bán chạy\", \"Nổi bật\"]', 1),
('LTGM002', 'Laptop Gaming ASUS ROG Strix G16', 38990000.00, NULL, 12, 'laptop_gaming', 'Laptop', 'Laptop Gaming', 'ASUS', '[\"https://images.unsplash.com/photo-1683939982704-9e7b26759d09?q=80&w=800\"]', 'Thiết kế đậm chất ROG, hiệu năng đỉnh cao với CPU Intel Gen 13 và card RTX 40 series.', '{\"CPU\": \"Intel Core i7-13650HX\", \"RAM\": \"16GB DDR5\", \"SSD\": \"512GB NVMe\", \"VGA\": \"NVIDIA RTX 4060 8GB\", \"Display\": \"16 inch FHD+ 165Hz\"}', '[\"Laptop Gaming\", \"ROG\"]', 1),
('CPU001', 'CPU Intel Core i5-14600K', 8590000.00, 9200000.00, 40, 'cpu', 'Linh kiện máy tính', 'CPU (Vi xử lý Intel, AMD)', 'Intel', '[\"https://images.unsplash.com/photo-1638018229415-e23f33923485?q=80&w=800\"]', 'Hiệu năng gaming và làm việc đa nhiệm vượt trội.', '{\"Socket\": \"LGA 1700\", \"Nhân/Luồng\": \"14/20\"}', '[\"Gaming\", \"Mới nhất\", \"Nổi bật\"]', 1),
('CPU002', 'CPU AMD Ryzen 7 7800X3D', 10490000.00, NULL, 25, 'cpu', 'Linh kiện máy tính', 'CPU (Vi xử lý Intel, AMD)', 'AMD', '[\"https://images.unsplash.com/photo-1635299113227-463d1a953e7f?q=80&w=800\"]', 'Vua gaming với công nghệ 3D V-Cache.', '{\"Socket\": \"AM5\", \"Nhân/Luồng\": \"8/16\"}', '[\"Gaming\", \"3D V-Cache\", \"Bán chạy\"]', 1),
('CPU003', 'CPU Intel Core i9-14900K', 16990000.00, NULL, 10, 'cpu', 'Linh kiện máy tính', 'CPU (Vi xử lý Intel, AMD)', 'Intel', '[\"https://images.unsplash.com/photo-1610482613532-9aeb891f7956?q=80&w=800\"]', 'CPU mạnh nhất cho người dùng cuối.', '{\"Socket\": \"LGA 1700\", \"Nhân/Luồng\": \"24/32\"}', '[\"High-end\", \"Sáng tạo\"]', 1),
('CPU004', 'CPU AMD Ryzen 5 7600', 5500000.00, 6000000.00, 50, 'cpu', 'Linh kiện máy tính', 'CPU (Vi xử lý Intel, AMD)', 'AMD', '[\"https://images.unsplash.com/photo-1591799264318-7e6e74e3dce9?q=80&w=800\"]', 'Lựa chọn p/p tốt nhất cho gaming tầm trung.', '{\"Socket\": \"AM5\", \"Nhân/Luồng\": \"6/12\"}', '[\"Tầm trung\", \"Giá tốt\"]', 1),
('VGA001', 'VGA GIGABYTE GeForce RTX 4060 WINDFORCE OC 8G', 8690000.00, 9500000.00, 30, 'vga', 'Linh kiện máy tính', 'VGA (Card màn hình)', 'Gigabyte', '[\"https://images.unsplash.com/photo-1678846395536-09a8263d4109?q=80&w=800\"]', 'Hiệu năng tốt cho gaming Full HD, hỗ trợ DLSS 3.', '{\"GPU\": \"RTX 4060\", \"Bộ nhớ\": \"8GB GDDR6\"}', '[\"RTX 40 series\", \"Full HD\", \"Khuyến mãi\", \"Nổi bật\"]', 1),
('VGA002', 'VGA ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB', 25990000.00, NULL, 10, 'vga', 'Linh kiện máy tính', 'VGA (Card màn hình)', 'ASUS', '[\"https://images.unsplash.com/photo-1694652467926-38d61741b002?q=80&w=800\"]', 'Sức mạnh vượt trội cho gaming 2K và 4K.', '{\"GPU\": \"RTX 4070 Ti SUPER\", \"Bộ nhớ\": \"16GB GDDR6X\"}', '[\"Gaming 4K\", \"TUF Gaming\"]', 1),
('VGA003', 'VGA MSI GeForce RTX 3060 VENTUS 2X 12G OC', 7490000.00, 8200000.00, 40, 'vga', 'Linh kiện máy tính', 'VGA (Card màn hình)', 'MSI', '[\"https://images.unsplash.com/photo-1616763355548-1b606f439f86?q=80&w=800\"]', 'Card đồ họa quốc dân, cân tốt các game eSports.', '{\"GPU\": \"RTX 3060\", \"Bộ nhớ\": \"12GB GDDR6\"}', '[\"Bán chạy\", \"Quốc dân\"]', 1),
('VGA004', 'VGA SAPPHIRE PULSE Radeon RX 7800 XT 16GB', 14500000.00, NULL, 15, 'vga', 'Linh kiện máy tính', 'VGA (Card màn hình)', 'Sapphire', '[\"https://images.unsplash.com/photo-1635399912066-8803a02a8ad?q=80&w=800\"]', 'Đối thủ nặng ký trong phân khúc gaming 2K.', '{\"GPU\": \"RX 7800 XT\", \"Bộ nhớ\": \"16GB GDDR6\"}', '[\"AMD\", \"Gaming 2K\"]', 1),
('SCR001', 'Màn hình LG 27GP850-B 27 inch 2K 165Hz Nano IPS', 7990000.00, 8990000.00, 20, 'man_hinh', 'Thiết bị ngoại vi', 'Màn hình (LCD, LED, 2K, 4K, Gaming…)', 'LG', '[\"https://images.unsplash.com/photo-1586221532552-32a24683f3b9?q=80&w=800\"]', 'Màn hình gaming 2K đỉnh cao với tấm nền Nano IPS.', '{\"Kích thước\": \"27 inch\", \"Độ phân giải\": \"2K (2560x1440)\", \"Tần số quét\": \"165Hz\"}', '[\"Gaming\", \"2K\", \"165Hz\", \"Bán chạy\"]', 1),
('SCR002', 'Màn hình Dell UltraSharp U2723QE 27 inch 4K IPS', 12500000.00, NULL, 15, 'man_hinh', 'Thiết bị ngoại vi', 'Màn hình (LCD, LED, 2K, 4K, Gaming…)', 'Dell', '[\"https://images.unsplash.com/photo-1593344484962-796b16d00ea2?q=80&w=800\"]', 'Dành cho dân đồ họa chuyên nghiệp, màu sắc chính xác.', '{\"Kích thước\": \"27 inch\", \"Độ phân giải\": \"4K (3840x2160)\", \"Tấm nền\": \"IPS Black\"}', '[\"Đồ họa\", \"4K\", \"USB-C\"]', 1),
('SCR003', 'Màn hình ViewSonic VX2428 24 inch FHD 165Hz IPS', 3590000.00, NULL, 40, 'man_hinh', 'Thiết bị ngoại vi', 'Màn hình (LCD, LED, 2K, 4K, Gaming…)', 'ViewSonic', '[\"https://images.unsplash.com/photo-1616296495912-a2da806e3954?q=80&w=800\"]', 'Màn hình gaming giá rẻ p/p tốt cho game eSports.', '{\"Kích thước\": \"24 inch\", \"Độ phân giải\": \"FHD (1920x1080)\", \"Tần số quét\": \"165Hz\"}', '[\"Giá rẻ\", \"eSports\"]', 1),
('RAM001', 'RAM Corsair Vengeance 32GB (2x16GB) DDR5 5600MHz', 2890000.00, 3200000.00, 50, 'ram', 'Linh kiện máy tính', 'RAM (DDR4, DDR5…)', 'Corsair', '[\"https://images.unsplash.com/photo-1631023916298-7514e2392736?q=80&w=800\"]', 'Dung lượng lớn, tốc độ cao cho gaming và làm việc.', '{\"Dung lượng\": \"32GB (2x16GB)\", \"Loại\": \"DDR5\", \"Tốc độ\": \"5600MHz\"}', '[\"DDR5\", \"32GB\"]', 1),
('RAM002', 'RAM Kingston Fury Beast 16GB (2x8GB) DDR4 3200MHz', 1190000.00, NULL, 100, 'ram', 'Linh kiện máy tính', 'RAM (DDR4, DDR5…)', 'Kingston', '[\"https://images.unsplash.com/photo-1592424002-952a19721169?q=80&w=800\"]', 'Kit RAM DDR4 phổ thông, p/p tốt nhất.', '{\"Dung lượng\": \"16GB (2x8GB)\", \"Loại\": \"DDR4\", \"Tốc độ\": \"3200MHz\"}', '[\"DDR4\", \"16GB\", \"Bán chạy\", \"Nổi bật\"]', 1),
('SSD001', 'Ổ cứng SSD Samsung 980 Pro 1TB PCIe 4.0 NVMe', 2990000.00, 3500000.00, 60, 'storage', 'Linh kiện máy tính', 'Ổ cứng HDD / SSD (SATA, NVMe)', 'Samsung', '[\"https://images.unsplash.com/photo-1619424079461-a37a9a4b3749?q=80&w=800\"]', 'Tốc độ đọc ghi siêu nhanh, lựa chọn hàng đầu cho gaming và các tác vụ nặng.', '{\"Dung lượng\": \"1TB\", \"Giao tiếp\": \"PCIe 4.0 NVMe\", \"Tốc độ đọc\": \"7000 MB/s\"}', '[\"SSD\", \"NVMe\", \"Gen4\", \"Nổi bật\"]', 1),
('SSD002', 'Ổ cứng SSD Kingston NV2 500GB PCIe 4.0 NVMe', 890000.00, NULL, 80, 'storage', 'Linh kiện máy tính', 'Ổ cứng HDD / SSD (SATA, NVMe)', 'Kingston', '[\"https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800\"]', 'SSD NVMe Gen 4 giá rẻ, lựa chọn nâng cấp tuyệt vời cho máy tính.', '{\"Dung lượng\": \"500GB\", \"Giao tiếp\": \"PCIe 4.0 NVMe\", \"Tốc độ đọc\": \"3500 MB/s\"}', '[\"SSD\", \"NVMe\", \"Giá rẻ\"]', 1),
('MAIN001', 'Mainboard ASUS TUF GAMING B760M-PLUS WIFI D4', 4590000.00, 5000000.00, 30, 'mainboard', 'Linh kiện máy tính', 'Bo mạch chủ (Mainboard)', 'ASUS', '[\"https://images.unsplash.com/photo-1593344484962-796b16d00ea2?q=80&w=800\"]', 'Mainboard B760 bền bỉ, đầy đủ kết nối, hỗ trợ RAM DDR4.', '{\"Socket\": \"LGA 1700\", \"Chipset\": \"B760\", \"RAM\": \"DDR4\"}', '[\"Mainboard\", \"B760\", \"TUF\"]', 1),
('MAIN002', 'Mainboard GIGABYTE B650M AORUS ELITE AX', 5290000.00, NULL, 25, 'mainboard', 'Linh kiện máy tính', 'Bo mạch chủ (Mainboard)', 'Gigabyte', '[\"https://images.unsplash.com/photo-1631023916298-7514e2392736?q=80&w=800\"]', 'Dành cho CPU AMD Ryzen 7000 series, hỗ trợ RAM DDR5, PCIe 5.0.', '{\"Socket\": \"AM5\", \"Chipset\": \"B650\", \"RAM\": \"DDR5\"}', '[\"Mainboard\", \"B650\", \"AORUS\"]', 1),
('PSU001', 'Nguồn Corsair RM850e 850W 80 Plus Gold Full Modular', 3150000.00, NULL, 45, 'psu', 'Linh kiện máy tính', 'Nguồn máy tính (PSU)', 'Corsair', '[\"https://images.unsplash.com/photo-1605714323671-55a53e4b553e?q=80&w=800\"]', 'Nguồn công suất lớn, hiệu suất cao, full modular tiện lợi.', '{\"Công suất\": \"850W\", \"Chứng nhận\": \"80 Plus Gold\", \"Modular\": \"Full\"}', '[\"Nguồn\", \"850W\", \"Gold\"]', 1),
('CASE001', 'Vỏ máy tính NZXT H5 Flow', 2250000.00, NULL, 35, 'case', 'Linh kiện máy tính', 'Vỏ máy (Case)', 'NZXT', '[\"https://images.unsplash.com/photo-1627045236365-b153d09a9f28?q=80&w=800\"]', 'Thiết kế tối giản, mặt lưới thoáng khí, tối ưu luồng gió.', '{\"Loại\": \"Mid Tower\", \"Màu\": \"Trắng\", \"Chất liệu\": \"Thép, Kính cường lực\"}', '[\"Case\", \"Trắng\", \"Thoáng khí\"]', 1),
('KEY001', 'Bàn phím cơ AKKO 3087 v2 World Tour Tokyo', 1690000.00, 1990000.00, 50, 'ban_phim', 'Thiết bị ngoại vi', 'Bàn phím (Cơ, Giả cơ, Thường)', 'AKKO', '[\"https://images.unsplash.com/photo-1627161683077-e34782348d81?q=80&w=800\"]', 'Thiết kế độc đáo, cảm giác gõ tuyệt vời.', '{\"Layout\": \"TKL (87 phím)\", \"Switch\": \"Akko (Pink, Orange)\", \"Keycap\": \"PBT Dye-sub\"}', '[\"Bàn phím cơ\", \"TKL\", \"Nổi bật\"]', 1),
('MSE001', 'Chuột Logitech G Pro X Superlight Wireless', 2790000.00, NULL, 40, 'chuot', 'Thiết bị ngoại vi', 'Chuột (Gaming, Văn phòng)', 'Logitech', '[\"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800\"]', 'Chuột không dây siêu nhẹ, lựa chọn hàng đầu của game thủ chuyên nghiệp.', '{\"Kết nối\": \"Không dây (Lightspeed)\", \"Trọng lượng\": \"<63g\", \"Cảm biến\": \"HERO 25K\"}', '[\"Chuột không dây\", \"Gaming\", \"Siêu nhẹ\", \"Bán chạy\"]', 1);

INSERT IGNORE INTO `Inventory` (`productId`, `warehouseId`, `quantity`) VALUES
('PCVP001', 'WH001', 50), ('PCVP002', 'WH001', 30), ('PCGM001', 'WH001', 20), ('PCGM002', 'WH001', 15), ('PCGM003', 'WH001', 10),
('LTGM001', 'WH001', 25), ('LTGM002', 'WH001', 12), ('CPU001', 'WH001', 40), ('CPU002', 'WH001', 25), ('CPU003', 'WH001', 10),
('CPU004', 'WH001', 50), ('VGA001', 'WH001', 30), ('VGA002', 'WH001', 10), ('VGA003', 'WH001', 40), ('VGA004', 'WH001', 15),
('SCR001', 'WH001', 20), ('SCR002', 'WH001', 15), ('SCR003', 'WH001', 40), ('RAM001', 'WH001', 50), ('RAM002', 'WH001', 100),
('SSD001', 'WH001', 60), ('SSD002', 'WH001', 80), ('MAIN001', 'WH001', 30), ('MAIN002', 'WH001', 25), ('PSU001', 'WH001', 45),
('CASE001', 'WH001', 35), ('KEY001', 'WH001', 50), ('MSE001', 'WH001', 40);

INSERT IGNORE INTO `Articles` (`id`, `title`, `summary`, `author`, `category`, `date`) VALUES 
('art001', 'Lợi Ích Của Dịch Vụ IT Thuê Ngoài', 'Khám phá cách dịch vụ IT thuê ngoài giúp doanh nghiệp.', 'Quang Trần', 'Dịch vụ IT', '2024-07-25 10:00:00'),
('art002', 'Hướng dẫn build PC Gaming 20 triệu', 'Tự xây dựng cấu hình PC Gaming mạnh mẽ trong tầm giá 20 triệu đồng.', 'Lê Hùng', 'Hướng dẫn', '2024-07-26 11:00:00');

INSERT IGNORE INTO `Faqs` (`id`, `question`, `answer`, `category`, `isVisible`) VALUES
('faq001', 'Thời gian bảo hành là bao lâu?', 'Tùy sản phẩm, thường từ 12-36 tháng.', 'Chính sách', 1),
('faq002', 'Có hỗ trợ lắp đặt tận nơi không?', 'Có, chúng tôi hỗ trợ lắp đặt tại Đà Nẵng.', 'Dịch vụ', 1);

INSERT IGNORE INTO `Orders` (`id`, `userId`, `creatorId`, `customerInfo`, `items`, `totalAmount`, `status`, `paymentInfo`, `orderDate`) VALUES
('ORD001', 'cust001', 'user001', '{\"fullName\":\"Nguyễn Văn An\",\"phone\":\"0905123456\",\"address\":\"123 Nguyễn Văn Linh, Đà Nẵng\",\"email\":\"an.nguyen@email.com\"}', '[{\"productId\":\"PCGM001\",\"productName\":\"PC Gaming IQ Eagle\",\"quantity\":1,\"price\":15990000}]', 15990000.00, 'Hoàn thành', '{\"method\":\"Chuyển khoản ngân hàng\",\"status\":\"Đã thanh toán\"}', '2025-10-02 14:30:00'),
('ORD002', 'cust002', 'staff002', '{\"fullName\":\"Trần Thị Bích\",\"phone\":\"0935987654\",\"address\":\"45 Lê Duẩn, Đà Nẵng\",\"email\":\"bich.tran@email.com\"}', '[{\"productId\":\"LTGM001\",\"productName\":\"Laptop Gaming Acer Nitro 5 Eagle\",\"quantity\":1,\"price\":21500000}]', 21500000.00, 'Đang giao', '{\"method\":\"Thanh toán khi nhận hàng (COD)\",\"status\":\"Chưa thanh toán\"}', '2025-10-10 09:00:00');

INSERT IGNORE INTO `Invoices` (`id`, `orderId`, `amount`, `status`, `dueDate`) VALUES
('INV001', 'ORD001', 15990000.00, 'paid', '2025-10-02');

INSERT IGNORE INTO `ServiceTickets` (`id`, `ticket_code`, `customerId`, `deviceName`, `reported_issue`, `status`, `createdAt`, `assigneeId`, `rating`, `customer_info`, `invoiceId`, `receiverId`, `work_items`, `appointment_date`) VALUES
('TCK001', 'TCK-001', 'cust002', 'Laptop Dell Inspiron', 'Máy không lên nguồn', 'Mới', '2025-10-08 09:00:00', 'staff001', NULL, '{\"fullName\": \"Trần Thị Bích\", \"phone\": \"0935987654\"}', 'INV-S001', 'staff002', 'Kiểm tra nguồn, mainboard', '2025-10-10 14:00:00'),
('TCK002', 'TCK-002', 'cust003', 'PC Gaming', 'Máy tính tự khởi động lại khi chơi game', 'Đang xử lý', '2025-10-09 11:00:00', 'staff001', NULL, '{\"fullName\": \"Lê Hoàng Long\", \"phone\": \"0978111222\"}', NULL, 'staff002', 'Vệ sinh, test RAM, test VGA', NULL);

INSERT IGNORE INTO `WarrantyTickets` (`id`, `ticketNumber`, `productModel`, `productSerial`, `customerName`, `customerPhone`, `creatorId`, `totalAmount`, `status`, `reportedIssue`, `receiveDate`, `returnDate`) VALUES
('WT001', 'SBN24040000012-002-001', 'S1001', 'AB2C9D', 'C NHUNG', '0938161567', 'user001', 0.00, 'Mới Tạo', 'mixer bị hư', '2024-04-06', '2024-04-16'),
('WT002', 'SBN24040000012-002', 'MKK-N1', 'D2F5CF', 'C NHUNG', '0938161567', 'user001', 0.00, 'Mới Tạo', 'mixer bị hư', '2024-04-06', '2024-04-16');

INSERT IGNORE INTO `ProductReviews` (`id`, `productId`, `userId`, `rating`, `comment`) VALUES
('REV001', 'PCGM001', 'cust001', 5, 'Máy chạy rất mượt, shop tư vấn nhiệt tình!');

INSERT IGNORE INTO `ChatLogSessions` (`id`, `userName`, `userPhone`, `startTime`, `messages`) VALUES 
('chat-1762505066584', 'nguyen van 2', '3216549877', '2025-11-07 08:44:26', '[{\"id\":\"1762505066584\",\"text\":\"Xin chào nguyen van 2! Tôi là trợ lý AI của IQ Technology. Tôi có thể giúp gì cho bạn?\",\"sender\":\"bot\",\"timestamp\":\"2025-11-07T08:44:26.584Z\"}]');

COMMIT;
-- =================================================================
-- KẾT THÚC SCRIPT SQL
-- =================================================================
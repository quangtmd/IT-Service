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
DROP TABLE IF EXISTS `AdCampaigns`, `EmailCampaigns`, `EmailSubscribers`, `StockReceipts`, `StockIssues`, `StockTransfers`, `StockEntryItems`, `StockEntries`, `Shipments`, `ServiceTickets`, `Quotations`, `Projects`, `ProductReviews`, `ProductCategories`, `ProductBrands`, `PayrollRecords`, `Orders`, `MediaLibrary`, `LeaveRequests`, `KPIs`, `Invoices`, `Inventory`, `FinancialTransactions`, `FinancialAccounts`, `Faqs`, `Employees`, `EmployeeKPIs`, `DiscountCodes`, `Debts`, `Contracts`, `ChatLogSessions`, `AuditLogs`, `Assets`, `Articles`, `ArticleCategories`, `UserDetails`, `Tasks`, `Warehouses`, `WarrantyTickets`, `SiteSettings`, `Returns`, `Suppliers`, `Products`, `Users`, `PaymentApprovals`;


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
  `yearOfManufacture` int(11) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `seoMetaTitle` varchar(255) DEFAULT NULL,
  `seoMetaDescription` text
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

CREATE TABLE `StockReceipts` (
  `id` varchar(255) NOT NULL,
  `receiptNumber` varchar(255) NOT NULL,
  `supplierId` varchar(255) NOT NULL,
  `supplierName` varchar(255) DEFAULT NULL,
  `date` datetime NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `totalAmount` decimal(15,2) NOT NULL,
  `notes` text,
  `status` enum('Nháp','Hoàn thành') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `StockIssues` (
  `id` varchar(255) NOT NULL,
  `issueNumber` varchar(255) NOT NULL,
  `orderId` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `notes` text,
  `status` enum('Nháp','Hoàn thành') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `StockTransfers` (
  `id` varchar(255) NOT NULL,
  `transferNumber` varchar(255) NOT NULL,
  `sourceWarehouseId` varchar(255) NOT NULL,
  `sourceWarehouseName` varchar(255) DEFAULT NULL,
  `destWarehouseId` varchar(255) NOT NULL,
  `destWarehouseName` varchar(255) DEFAULT NULL,
  `date` datetime NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `notes` text,
  `status` enum('Chờ duyệt','Đã duyệt','Đang vận chuyển','Hoàn thành','Đã hủy') NOT NULL,
  `approverId` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ArticleCategories` (`id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `slug` varchar(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Articles` (
    `id` varchar(255) NOT NULL,
    `title` varchar(255) NOT NULL,
    `summary` text,
    `content` longtext,
    `author` varchar(255) DEFAULT NULL,
    `category` varchar(255) DEFAULT NULL,
    `imageUrl` text,
    `date` datetime NOT NULL,
    `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
    `slug` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Assets` (`id` varchar(255) NOT NULL, `name` varchar(255) DEFAULT NULL, `serialNumber` varchar(255) DEFAULT NULL, `purchaseDate` date DEFAULT NULL, `value` decimal(15,2) DEFAULT NULL, `assignedTo` varchar(255) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `AuditLogs` (`id` int(11) NOT NULL, `userId` varchar(255) DEFAULT NULL, `action` varchar(255) NOT NULL, `target` varchar(255) DEFAULT NULL, `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)), `ipAddress` varchar(45) DEFAULT NULL, `timestamp` timestamp NULL DEFAULT current_timestamp()) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `ChatLogSessions` (`id` varchar(255) NOT NULL, `userName` varchar(255) DEFAULT NULL, `userPhone` varchar(20) DEFAULT NULL, `startTime` timestamp NULL DEFAULT current_timestamp(), `messages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`messages`))) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Contracts` (`id` varchar(255) NOT NULL, `name` varchar(255) DEFAULT NULL, `partnerName` varchar(255) DEFAULT NULL, `startDate` date DEFAULT NULL, `endDate` date DEFAULT NULL, `fileUrl` text) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `DiscountCodes` (`id` varchar(255) NOT NULL, `code` varchar(255) NOT NULL, `type` enum('percentage','fixed_amount') NOT NULL, `value` decimal(10,2) NOT NULL, `description` text, `expiryDate` date DEFAULT NULL, `isActive` tinyint(1) DEFAULT 1) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `EmployeeKPIs` (`id` varchar(255) NOT NULL, `employeeId` varchar(255) NOT NULL, `kpiId` varchar(255) NOT NULL, `actualValue` decimal(15,2) DEFAULT NULL, `period` varchar(50) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Employees` (`userId` varchar(255) NOT NULL, `position` varchar(255) DEFAULT NULL, `joinDate` date DEFAULT NULL, `salary` decimal(15,2) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Faqs` (`id` varchar(255) NOT NULL, `question` text NOT NULL, `answer` text NOT NULL, `category` varchar(255) DEFAULT NULL, `isVisible` tinyint(1) DEFAULT 1) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `FinancialAccounts` (`id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `type` varchar(100) DEFAULT NULL, `balance` decimal(15,2) DEFAULT 0.00) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Invoices` (`id` varchar(255) NOT NULL, `orderId` varchar(255) DEFAULT NULL, `amount` decimal(15,2) NOT NULL, `status` enum('unpaid','paid','overdue') NOT NULL, `dueDate` date DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `KPIs` (`id` varchar(255) NOT NULL, `name` varchar(255) DEFAULT NULL, `targetValue` decimal(15,2) DEFAULT NULL, `unit` varchar(50) DEFAULT NULL, `period` varchar(50) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `LeaveRequests` (`id` varchar(255) NOT NULL, `employeeId` varchar(255) NOT NULL, `startDate` date DEFAULT NULL, `endDate` date DEFAULT NULL, `reason` text, `status` enum('pending','approved','rejected') DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `MediaLibrary` (
    `id` varchar(255) NOT NULL,
    `url` text NOT NULL,
    `name` varchar(255) DEFAULT NULL,
    `type` varchar(100) DEFAULT NULL,
    `uploadedAt` timestamp NULL DEFAULT current_timestamp(),
    `altText` varchar(255) DEFAULT NULL,
    `associatedEntityType` varchar(50) DEFAULT NULL,
    `associatedEntityId` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `ProductBrands` (`id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `ProductReviews` (
  `id` varchar(255) NOT NULL,
  `productId` varchar(255) NOT NULL,
  `userId` varchar(255) DEFAULT NULL,
  `reviewerName` varchar(255) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text,
  `createdAt` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `totalAmount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `reportedIssue` text,
  `resolution_notes` text,
  `receiveDate` datetime DEFAULT NULL,
  `returnDate` datetime DEFAULT NULL,
  `orderId` varchar(255) DEFAULT NULL,
  `productId` varchar(255) DEFAULT NULL,
  `customerId` varchar(255) DEFAULT NULL,
  `priority` varchar(255) DEFAULT 'Bình thường',
  `warrantyType` varchar(255) DEFAULT NULL,
  `technician_notes` text,
  `repairDate` datetime DEFAULT NULL,
  `returnStaffId` varchar(255) DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]' CHECK (json_valid(`items`)),
  `serviceFee` decimal(15,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `vat` decimal(5,2) NOT NULL DEFAULT 0.00,
  `transactionType` varchar(50) DEFAULT 'Sửa chữa',
  `department` varchar(255) DEFAULT NULL,
  `departmentCode` varchar(255) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'VND',
  `totalQuantity` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `Debts` (
  `id` varchar(255) NOT NULL,
  `entityId` varchar(255) NOT NULL COMMENT 'Customer or Supplier ID',
  `entityName` varchar(255) DEFAULT NULL,
  `entityType` enum('customer','supplier') NOT NULL,
  `type` enum('receivable','payable') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `dueDate` date DEFAULT NULL,
  `relatedTransactionId` varchar(255) DEFAULT NULL,
  `status` enum('Chưa thanh toán','Đã thanh toán','Quá hạn') NOT NULL DEFAULT 'Chưa thanh toán'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `PaymentApprovals` (
  `id` varchar(255) NOT NULL,
  `requestorId` varchar(255) NOT NULL,
  `approverId` varchar(255) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text NOT NULL,
  `relatedTransactionId` varchar(255) DEFAULT NULL,
  `status` enum('Chờ duyệt','Đã duyệt','Đã từ chối') NOT NULL DEFAULT 'Chờ duyệt',
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `EmailSubscribers` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `subscribedAt` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `EmailCampaigns` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `content` longtext,
  `status` enum('Nháp','Đã gửi','Đang gửi') NOT NULL DEFAULT 'Nháp',
  `sentAt` datetime DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `AdCampaigns` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `source` varchar(100) DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT 0.00,
  `clicks` int(11) DEFAULT 0,
  `conversions` int(11) DEFAULT 0,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================
-- 3. ADD INDEXES & CONSTRAINTS
-- =================================================================
ALTER TABLE `Users` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `email` (`email`);
ALTER TABLE `ProductCategories` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `slug` (`slug`), ADD KEY `parentId` (`parentId`);
ALTER TABLE `Products` ADD PRIMARY KEY (`id`), ADD KEY `categoryId` (`categoryId`), ADD KEY `slug` (`slug`);
ALTER TABLE `Orders` ADD PRIMARY KEY (`id`), ADD KEY `userId` (`userId`), ADD KEY `creatorId` (`creatorId`);
ALTER TABLE `Warehouses` ADD PRIMARY KEY (`id`);
ALTER TABLE `Inventory` ADD PRIMARY KEY (`productId`,`warehouseId`), ADD KEY `warehouseId` (`warehouseId`);
ALTER TABLE `Suppliers` ADD PRIMARY KEY (`id`);
ALTER TABLE `FinancialTransactions` ADD PRIMARY KEY (`id`), ADD KEY `accountId` (`accountId`);
ALTER TABLE `PayrollRecords` ADD PRIMARY KEY (`id`), ADD KEY `employeeId` (`employeeId`);
ALTER TABLE `Quotations` ADD PRIMARY KEY (`id`), ADD KEY `customer_id` (`customer_id`);
ALTER TABLE `StockReceipts` ADD PRIMARY KEY (`id`), ADD KEY `supplierId` (`supplierId`);
ALTER TABLE `StockIssues` ADD PRIMARY KEY (`id`), ADD KEY `orderId` (`orderId`);
ALTER TABLE `StockTransfers` ADD PRIMARY KEY (`id`), ADD KEY `sourceWarehouseId` (`sourceWarehouseId`), ADD KEY `destWarehouseId` (`destWarehouseId`), ADD KEY `approverId` (`approverId`);
ALTER TABLE `ArticleCategories` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`), ADD UNIQUE KEY `slug` (`slug`);
ALTER TABLE `Articles` ADD PRIMARY KEY (`id`), ADD KEY `slug` (`slug`);
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
ALTER TABLE `PaymentApprovals` ADD PRIMARY KEY (`id`);
ALTER TABLE `EmailSubscribers` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `email` (`email`);
ALTER TABLE `EmailCampaigns` ADD PRIMARY KEY (`id`);
ALTER TABLE `AdCampaigns` ADD PRIMARY KEY (`id`);
ALTER TABLE `AuditLogs` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `EmailSubscribers` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
('user001', 'Duy Quang', 'duyquang@email.com', 'password123', 'admin', 'Nhân viên Toàn quyền', 'Đang hoạt động', 0, '0911855055', 'Văn phòng IQ Tech', NULL, NULL, NULL, NULL, NULL);

INSERT IGNORE INTO `Warehouses` (`id`, `name`, `location`) VALUES 
('WH001', 'Kho Chính', '10 Huỳnh Thúc Kháng, Đà Nẵng'), 
('WH002', 'Kho Phụ', 'K1/2 Lê Đình Lý, Đà Nẵng');

INSERT IGNORE INTO `Suppliers` (`id`, `name`, `contactInfo`, `paymentTerms`) VALUES 
('SUP001', 'Nhà phân phối Tin học Mai Hoàng', '{\"email\":\"contact@maihoang.com.vn\", \"phone\":\"02436285868\"}', 'Thanh toán gối đầu 30 ngày'), 
('SUP002', 'Công ty máy tính Vĩnh Xuân (SPC)', '{\"email\":\"info@spc.com.vn\", \"phone\":\"02838326085\"}', 'Thanh toán ngay khi nhận hàng'),
('SUP003', 'Công ty máy tính Viễn Sơn', '{\"email\":\"info@microstar.vn\", \"phone\":\"02838326085\"}', 'Thanh toán cuối tháng');

INSERT IGNORE INTO `EmailSubscribers` (`email`, `name`) VALUES 
('subscriber1@email.com', 'Nguyễn Văn A'), 
('subscriber2@email.com', 'Trần Thị B');

INSERT IGNORE INTO `EmailCampaigns` (`id`, `name`, `subject`, `status`) VALUES 
('CAMP001', 'Khuyến mãi tháng 11', '🔥 GIẢM SỐC - Black Friday Sale!', 'Đã gửi');

INSERT IGNORE INTO `AdCampaigns` (`id`, `name`, `source`, `cost`, `clicks`, `conversions`) VALUES
('AD001', 'Quảng cáo PC Gaming Facebook T10', 'Facebook', 5000000.00, 1200, 15);

INSERT IGNORE INTO `ProductReviews` (`id`, `productId`, `reviewerName`, `rating`, `comment`) VALUES
('REV001', 'PCGM001', 'Nguyễn Văn An', 5, 'Máy chạy rất mượt, shop tư vấn nhiệt tình!');

COMMIT;
-- =================================================================
-- KẾT THÚC SCRIPT SQL
-- =================================================================
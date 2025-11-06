# IQ Technology - IT Services & PC Store Web Application

This is a modern web application for a PC components retailer and IT service provider, featuring an AI-powered chatbot and component recommendations. This version is architected with a full backend API and a comprehensive SQL database.

## Database Setup (SQL Schema)

This application uses a MySQL database. To begin, create a database and then execute the entire SQL script below. This script will drop any existing tables to ensure a clean setup and create a complete, robust schema for all application modules.

**Note:** This script is designed to be run in its entirety.

```sql
--
-- IQ Technology - Comprehensive SQL Schema
-- Version 2.0
--
-- This script drops all existing tables and rebuilds the entire database structure
-- for all modules including Core, CMS, E-commerce, CRM, Services, Finance, HRM,
-- Project Management, Asset Management, and Security.
--

SET FOREIGN_KEY_CHECKS=0;

-- Drop existing tables for a clean slate
DROP TABLE IF EXISTS
  `Users`, `UserDetails`, `SiteSettings`, `MediaLibrary`, `Articles`, `ArticleCategories`,
  `Pages`, `Menus`, `MenuItems`, `Faqs`, `FaqCategories`, `Products`, `ProductCategories`,
  `ProductBrands`, `ProductReviews`, `Orders`, `OrderItems`, `DiscountCodes`, `Warehouses`,
  `Inventory`, `Suppliers`, `StockEntries`, `StockEntryItems`, `Shipments`, `Customers`,
  `Interactions`, `ChatLogSessions`, `Services`, `ServiceTickets`, `WarrantyTickets`,
  `FinancialAccounts`, `FinancialTransactions`, `Debts`, `Invoices`, `InvoiceItems`, `Payments`,
  `Employees`, `PayrollRecords`, `LeaveRequests`, `KPIs`, `EmployeeKPIs`, `Projects`,
  `Tasks`, `Assets`, `Contracts`, `Roles`, `Permissions`, `RolePermissions`, `UserRoles`, `AuditLogs`;

SET FOREIGN_KEY_CHECKS=1;

--
-- Module: Core System & Users
--
CREATE TABLE `Users` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','staff','customer') NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` ENUM('Đang hoạt động','Tạm khóa') DEFAULT 'Đang hoạt động',
  `isLocked` BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `UserDetails` (
  `userId` VARCHAR(255) NOT NULL PRIMARY KEY,
  `fullName` VARCHAR(255),
  `phone` VARCHAR(20),
  `address` TEXT,
  `imageUrl` TEXT,
  `dateOfBirth` DATE,
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `SiteSettings` (
  `settingKey` VARCHAR(255) NOT NULL PRIMARY KEY,
  `settingValue` JSON,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `MediaLibrary` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `url` TEXT NOT NULL,
  `name` VARCHAR(255),
  `type` VARCHAR(100),
  `uploadedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Module: Content Management System (CMS)
--
CREATE TABLE `ArticleCategories` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `slug` VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Articles` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT,
  `content` LONGTEXT,
  `authorId` VARCHAR(255),
  `categoryId` VARCHAR(255),
  `imageUrl` TEXT,
  `publishedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`authorId`) REFERENCES `Users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`categoryId`) REFERENCES `ArticleCategories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Faqs` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `category` VARCHAR(255),
  `isVisible` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Module: E-commerce & Inventory
--
CREATE TABLE `ProductCategories` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `parentId` VARCHAR(255),
  `icon` VARCHAR(100),
  FOREIGN KEY (`parentId`) REFERENCES `ProductCategories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ProductBrands` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Products` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(15,2) NOT NULL,
  `originalPrice` DECIMAL(15,2),
  `costPrice` DECIMAL(15,2),
  `stock` INT NOT NULL,
  `categoryId` VARCHAR(255),
  `mainCategory` VARCHAR(255),
  `subCategory` VARCHAR(255),
  `brand` VARCHAR(255),
  `imageUrls` JSON,
  `specifications` JSON,
  `tags` JSON,
  `isVisible` BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (`categoryId`) REFERENCES `ProductCategories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ProductReviews` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `productId` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) NOT NULL,
  `rating` TINYINT NOT NULL,
  `comment` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`productId`) REFERENCES `Products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Orders` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(255),
  `customerInfo` JSON NOT NULL,
  `totalAmount` DECIMAL(15,2) NOT NULL,
  `status` ENUM('Chờ xử lý','Đã xác nhận','Đang chuẩn bị','Đang giao','Hoàn thành','Đã hủy') NOT NULL,
  `paymentInfo` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `OrderItems` (
  `orderId` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(15,2) NOT NULL,
  PRIMARY KEY (`orderId`, `productId`),
  FOREIGN KEY (`orderId`) REFERENCES `Orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `Products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `DiscountCodes` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `code` VARCHAR(255) NOT NULL UNIQUE,
  `type` ENUM('percentage','fixed_amount') NOT NULL,
  `value` DECIMAL(10,2) NOT NULL,
  `description` TEXT,
  `expiryDate` DATE,
  `isActive` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Warehouses` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `location` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Inventory` (
  `productId` VARCHAR(255) NOT NULL,
  `warehouseId` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  PRIMARY KEY (`productId`, `warehouseId`),
  FOREIGN KEY (`productId`) REFERENCES `Products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`warehouseId`) REFERENCES `Warehouses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Suppliers` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `contactInfo` JSON
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `StockEntries` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `type` ENUM('in', 'out') NOT NULL,
  `entryDate` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `supplierId` VARCHAR(255),
  `orderId` VARCHAR(255),
  `notes` TEXT,
  FOREIGN KEY (`supplierId`) REFERENCES `Suppliers`(`id`),
  FOREIGN KEY (`orderId`) REFERENCES `Orders`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `StockEntryItems` (
  `stockEntryId` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `costPrice` DECIMAL(15,2),
  PRIMARY KEY (`stockEntryId`, `productId`),
  FOREIGN KEY (`stockEntryId`) REFERENCES `StockEntries`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `Products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Shipments` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `orderId` VARCHAR(255) NOT NULL,
  `trackingCode` VARCHAR(255),
  `shippingPartner` VARCHAR(255),
  `status` VARCHAR(255),
  FOREIGN KEY (`orderId`) REFERENCES `Orders`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Module: Customer Relationship Management (CRM)
--
CREATE TABLE `ChatLogSessions` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `userName` VARCHAR(255),
  `userPhone` VARCHAR(20),
  `startTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `messages` JSON
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Module: Services
--
CREATE TABLE `ServiceTickets` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `customerId` VARCHAR(255),
  `productName` VARCHAR(255),
  `issueDescription` TEXT,
  `status` VARCHAR(255),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customerId`) REFERENCES `Users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `WarrantyTickets` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `orderId` VARCHAR(255),
  `productId` VARCHAR(255),
  `issueDescription` TEXT,
  `status` VARCHAR(255),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`orderId`) REFERENCES `Orders`(`id`),
  FOREIGN KEY (`productId`) REFERENCES `Products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Module: Finance
--
CREATE TABLE `FinancialAccounts` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `type` VARCHAR(100),
  `balance` DECIMAL(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `FinancialTransactions` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `accountId` VARCHAR(255),
  `type` ENUM('income', 'expense') NOT NULL,
  `category` VARCHAR(255),
  `amount` DECIMAL(15,2) NOT NULL,
  `description` TEXT,
  `transactionDate` DATE NOT NULL,
  FOREIGN KEY (`accountId`) REFERENCES `FinancialAccounts`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Debts` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `entityId` VARCHAR(255) NOT NULL,
  `entityType` ENUM('customer', 'supplier') NOT NULL,
  `type` ENUM('receivable', 'payable') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `dueDate` DATE,
  `status` VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Invoices` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `orderId` VARCHAR(255),
  `amount` DECIMAL(15,2) NOT NULL,
  `status` ENUM('unpaid', 'paid', 'overdue') NOT NULL,
  `dueDate` DATE,
  FOREIGN KEY (`orderId`) REFERENCES `Orders`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Module: Human Resource Management (HRM)
--
CREATE TABLE `Employees` (
  `userId` VARCHAR(255) NOT NULL PRIMARY KEY,
  `position` VARCHAR(255),
  `joinDate` DATE,
  `salary` DECIMAL(15,2),
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `PayrollRecords` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `employeeId` VARCHAR(255) NOT NULL,
  `payPeriod` VARCHAR(7) NOT NULL, -- YYYY-MM
  `baseSalary` DECIMAL(15,2),
  `bonus` DECIMAL(15,2),
  `deduction` DECIMAL(15,2),
  `finalSalary` DECIMAL(15,2),
  `status` ENUM('Chưa thanh toán', 'Đã thanh toán') NOT NULL,
  `notes` TEXT,
  FOREIGN KEY (`employeeId`) REFERENCES `Employees`(`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `LeaveRequests` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `employeeId` VARCHAR(255) NOT NULL,
  `startDate` DATE,
  `endDate` DATE,
  `reason` TEXT,
  `status` ENUM('pending', 'approved', 'rejected'),
  FOREIGN KEY (`employeeId`) REFERENCES `Employees`(`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `KPIs` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255),
  `targetValue` DECIMAL(15,2),
  `unit` VARCHAR(50),
  `period` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `EmployeeKPIs` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `employeeId` VARCHAR(255) NOT NULL,
  `kpiId` VARCHAR(255) NOT NULL,
  `actualValue` DECIMAL(15,2),
  `period` VARCHAR(50),
  FOREIGN KEY (`employeeId`) REFERENCES `Employees`(`userId`),
  FOREIGN KEY (`kpiId`) REFERENCES `KPIs`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Module: Project Management
--
CREATE TABLE `Projects` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `managerId` VARCHAR(255),
  `startDate` DATE,
  `endDate` DATE,
  `budget` DECIMAL(15,2),
  `status` VARCHAR(100),
  FOREIGN KEY (`managerId`) REFERENCES `Users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Tasks` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `projectId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `assigneeId` VARCHAR(255),
  `dueDate` DATE,
  `status` VARCHAR(100),
  FOREIGN KEY (`projectId`) REFERENCES `Projects`(`id`),
  FOREIGN KEY (`assigneeId`) REFERENCES `Users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Module: Asset & Legal
--
CREATE TABLE `Assets` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255),
  `serialNumber` VARCHAR(255),
  `purchaseDate` DATE,
  `value` DECIMAL(15,2),
  `assignedTo` VARCHAR(255),
  FOREIGN KEY (`assignedTo`) REFERENCES `Users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Contracts` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255),
  `partnerName` VARCHAR(255),
  `startDate` DATE,
  `endDate` DATE,
  `fileUrl` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Module: Security & Access Control
--
CREATE TABLE `AuditLogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` VARCHAR(255),
  `action` VARCHAR(255) NOT NULL,
  `target` VARCHAR(255),
  `details` JSON,
  `ipAddress` VARCHAR(45),
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- INSERT INITIAL DATA
--
INSERT INTO `Users` (`id`, `username`, `email`, `password`, `role`) VALUES
('user001', 'Quang Trần', 'quangtmdit@gmail.com', 'password123', 'admin'),
('staff001', 'Nhân Viên Sales', 'sales01@iqtech.com', 'password123', 'staff'),
('cust001', 'Nguyễn Văn An', 'an.nguyen@email.com', 'password123', 'customer');

INSERT INTO `Products` (`id`, `name`, `price`, `stock`, `mainCategory`, `subCategory`, `brand`, `specifications`, `tags`, `isVisible`) VALUES
('cpu001', 'Intel Core i5-13600K', 8000000.00, 15, 'Linh kiện máy tính', 'CPU', 'Intel', '{\"Socket\":\"LGA1700\"}', '[\"Nổi bật\"]', 1),
('gpu001', 'NVIDIA GeForce RTX 4070', 15000000.00, 10, 'Linh kiện máy tính', 'VGA', 'NVIDIA', '{\"VRAM\":\"12GB\"}', '[\"Gaming\"]', 1);

INSERT INTO `Articles` (`id`, `title`, `summary`, `authorId`, `publishedAt`, `categoryId`) VALUES
('art001', 'Lợi Ích Của Dịch Vụ IT Thuê Ngoài', 'Khám phá cách dịch vụ IT thuê ngoài giúp doanh nghiệp.', 'user001', '2024-07-25 10:00:00', NULL);

COMMIT;

```

## Backend Setup (Node.js/Express)

1.  **Install Dependencies:**
    In the `backend` directory, run:
    ```bash
    npm install
    ```
2.  **Create `.env` File:**
    In the `backend` directory, create a file named `.env` and add your database connection details:

    ```env
    DB_HOST=your_database_host
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_NAME=your_database_name
    PORT=3001
    ```

3.  **Run Backend Server:**
    From the `backend` directory, run:
    ```bash
    npm start
    ```
    The backend API server will start on port 3001.

## Frontend Setup (Vite/React)

1.  **Install Dependencies:**
    In the project's root directory, run:
    ```bash
    npm install
    ```
2.  **Create `.env` File:**
    In the project's root directory, create a `.env` file and add your Gemini API key:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key
    ```
    For production deployment on services like Render, also add:
    ```env
    VITE_BACKEND_API_BASE_URL=your_deployed_backend_url
    ```
3.  **Run Frontend Development Server:**
    From the root directory, run:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:3000`. API requests to `/api` will be proxied to the backend server at `http://localhost:3001`.

## Admin Login

To access the admin panel, use the default credentials:
*   **Email:** `quangtmdit@gmail.com`
*   **Password:** `password123`

Navigate to `/admin` after logging in.

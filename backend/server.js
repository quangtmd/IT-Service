import express from 'express';
import cors from 'cors';
import pool from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- AUTO-MIGRATION & SEEDING ---
const initializeDatabase = async (connection) => {
    console.log("🔄 Đang khởi tạo cấu trúc Database...");
    
    const schemaQueries = [
        `CREATE TABLE IF NOT EXISTS \`Users\` (
          \`id\` varchar(255) NOT NULL,
          \`username\` varchar(255) NOT NULL,
          \`email\` varchar(255) NOT NULL,
          \`password\` varchar(255) NOT NULL,
          \`role\` enum('admin','staff','customer') NOT NULL,
          \`staffRole\` varchar(255) DEFAULT NULL,
          \`createdAt\` timestamp NULL DEFAULT current_timestamp(),
          \`updatedAt\` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          \`isLocked\` tinyint(1) DEFAULT 0,
          \`phone\` varchar(20) DEFAULT NULL,
          \`address\` text,
          \`imageUrl\` text,
          \`status\` enum('Đang hoạt động','Tạm nghỉ','Đã nghỉ việc') DEFAULT 'Đang hoạt động',
          \`dateOfBirth\` date DEFAULT NULL,
          \`origin\` varchar(255) DEFAULT NULL,
          \`loyaltyPoints\` int(11) DEFAULT 0,
          \`debtStatus\` enum('Không có','Có nợ','Quá hạn') DEFAULT 'Không có',
          \`assignedStaffId\` varchar(255) DEFAULT NULL,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`email\` (\`email\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`Products\` (
          \`id\` varchar(255) NOT NULL,
          \`name\` varchar(255) NOT NULL,
          \`description\` text,
          \`shortDescription\` text,
          \`price\` decimal(15,2) NOT NULL,
          \`originalPrice\` decimal(15,2) DEFAULT NULL,
          \`costPrice\` decimal(15,2) DEFAULT NULL,
          \`stock\` int(11) NOT NULL,
          \`categoryId\` varchar(255) DEFAULT NULL,
          \`mainCategory\` varchar(255) DEFAULT NULL,
          \`subCategory\` varchar(255) DEFAULT NULL,
          \`brand\` varchar(255) DEFAULT NULL,
          \`imageUrls\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`imageUrls\`)),
          \`specifications\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`specifications\`)),
          \`tags\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`tags\`)),
          \`isVisible\` tinyint(1) DEFAULT 1,
          \`rating\` float DEFAULT NULL,
          \`reviews\` int(11) DEFAULT NULL,
          \`status\` varchar(50) DEFAULT 'Mới',
          \`productCode\` varchar(255) DEFAULT NULL,
          \`printName\` varchar(255) DEFAULT NULL,
          \`purchasePrice\` decimal(15,2) DEFAULT NULL,
          \`wholesalePrice\` decimal(15,2) DEFAULT NULL,
          \`hasVAT\` tinyint(1) DEFAULT 0,
          \`barcode\` varchar(255) DEFAULT NULL,
          \`unit\` varchar(50) DEFAULT NULL,
          \`warrantyPeriod\` int(11) DEFAULT NULL,
          \`countryOfOrigin\` varchar(255) DEFAULT NULL,
          \`yearOfManufacture\` int(11) DEFAULT NULL,
          \`slug\` varchar(255) DEFAULT NULL,
          \`seoMetaTitle\` varchar(255) DEFAULT NULL,
          \`seoMetaDescription\` text,
          \`supplierId\` varchar(255) DEFAULT NULL,
          \`supplierName\` varchar(255) DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`Orders\` (
          \`id\` varchar(255) NOT NULL,
          \`userId\` varchar(255) DEFAULT NULL,
          \`creatorId\` varchar(255) DEFAULT NULL,
          \`customerInfo\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`customerInfo\`)),
          \`items\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`items\`)),
          \`subtotal\` decimal(15,2) DEFAULT 0.00,
          \`totalAmount\` decimal(15,2) NOT NULL,
          \`paidAmount\` decimal(15,2) DEFAULT 0.00,
          \`cost\` decimal(15,2) DEFAULT 0.00,
          \`profit\` decimal(15,2) DEFAULT 0.00,
          \`status\` enum('Chờ xử lý','Đang xác nhận','Đã xác nhận','Đang chuẩn bị','Đang giao','Hoàn thành','Đã hủy','Phiếu tạm') NOT NULL,
          \`paymentInfo\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`paymentInfo\`)),
          \`shippingInfo\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`shippingInfo\`)),
          \`orderDate\` datetime NOT NULL,
          \`notes\` text DEFAULT NULL,
          \`createdAt\` timestamp NULL DEFAULT current_timestamp(),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`Articles\` (
            \`id\` varchar(255) NOT NULL,
            \`title\` varchar(255) NOT NULL,
            \`summary\` text,
            \`content\` longtext,
            \`author\` varchar(255) DEFAULT NULL,
            \`category\` varchar(255) DEFAULT NULL,
            \`imageUrl\` text,
            \`date\` datetime NOT NULL,
            \`tags\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`tags\`)),
            \`slug\` varchar(255) DEFAULT NULL,
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`FinancialTransactions\` (
          \`id\` varchar(255) NOT NULL,
          \`accountId\` varchar(255) DEFAULT NULL,
          \`type\` enum('income','expense') NOT NULL,
          \`category\` varchar(255) DEFAULT NULL,
          \`amount\` decimal(15,2) NOT NULL,
          \`description\` text,
          \`transactionDate\` date NOT NULL,
          \`relatedEntity\` varchar(255) DEFAULT NULL,
          \`invoiceNumber\` varchar(255) DEFAULT NULL,
           PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`PayrollRecords\` (
          \`id\` varchar(255) NOT NULL,
          \`employeeId\` varchar(255) NOT NULL,
          \`employeeName\` varchar(255) DEFAULT NULL,
          \`payPeriod\` varchar(7) NOT NULL,
          \`baseSalary\` decimal(15,2) DEFAULT NULL,
          \`bonus\` decimal(15,2) DEFAULT NULL,
          \`deduction\` decimal(15,2) DEFAULT NULL,
          \`finalSalary\` decimal(15,2) DEFAULT NULL,
          \`status\` enum('Chưa thanh toán','Đã thanh toán') NOT NULL,
          \`notes\` text,
           PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`Debts\` (\`id\` varchar(255) NOT NULL, \`entityId\` varchar(255) NOT NULL, \`entityName\` varchar(255) DEFAULT NULL, \`entityType\` enum('customer','supplier') NOT NULL, \`type\` enum('receivable','payable') NOT NULL, \`amount\` decimal(15,2) NOT NULL, \`dueDate\` date DEFAULT NULL, \`relatedTransactionId\` varchar(255) DEFAULT NULL, \`status\` enum('Chưa thanh toán','Đã thanh toán','Quá hạn') NOT NULL DEFAULT 'Chưa thanh toán', PRIMARY KEY (\`id\`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`PaymentApprovals\` ( \`id\` varchar(255) NOT NULL, \`requestorId\` varchar(255) NOT NULL, \`approverId\` varchar(255) DEFAULT NULL, \`amount\` decimal(15,2) NOT NULL, \`description\` text NOT NULL, \`relatedTransactionId\` varchar(255) DEFAULT NULL, \`status\` enum('Chờ duyệt','Đã duyệt','Đã từ chối') NOT NULL DEFAULT 'Chờ duyệt', \`createdAt\` timestamp NULL DEFAULT current_timestamp(), \`updatedAt\` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (\`id\`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`Suppliers\` ( \`id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`contactInfo\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`contactInfo\`)), \`paymentTerms\` text, PRIMARY KEY (\`id\`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`Warehouses\` ( \`id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`location\` text, PRIMARY KEY (\`id\`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`StockReceipts\` ( \`id\` varchar(255) NOT NULL, \`receiptNumber\` varchar(255) NOT NULL, \`supplierId\` varchar(255) NOT NULL, \`supplierName\` varchar(255) DEFAULT NULL, \`date\` datetime NOT NULL, \`items\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`items\`)), \`totalAmount\` decimal(15,2) NOT NULL, \`notes\` text, \`status\` enum('Nháp','Hoàn thành', 'Công nợ') NOT NULL, \`subTotal\` decimal(15,2) NOT NULL DEFAULT 0, \`discount\` decimal(15,2) NOT NULL DEFAULT 0, \`amountPaid\` decimal(15,2) NOT NULL DEFAULT 0, \`paymentMethod\` enum('Tiền mặt','Thẻ') NOT NULL DEFAULT 'Tiền mặt', PRIMARY KEY (\`id\`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`StockIssues\` ( \`id\` varchar(255) NOT NULL, \`issueNumber\` varchar(255) NOT NULL, \`orderId\` varchar(255) NOT NULL, \`date\` datetime NOT NULL, \`items\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`items\`)), \`notes\` text, \`status\` enum('Nháp','Hoàn thành') NOT NULL, PRIMARY KEY (\`id\`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`StockTransfers\` ( \`id\` varchar(255) NOT NULL, \`transferNumber\` varchar(255) NOT NULL, \`sourceWarehouseId\` varchar(255) NOT NULL, \`sourceWarehouseName\` varchar(255) DEFAULT NULL, \`destWarehouseId\` varchar(255) NOT NULL, \`destWarehouseName\` varchar(255) DEFAULT NULL, \`date\` datetime NOT NULL, \`items\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`items\`)), \`notes\` text, \`status\` enum('Chờ duyệt','Đã duyệt','Đang vận chuyển','Hoàn thành','Đã hủy') NOT NULL, \`approverId\` varchar(255) DEFAULT NULL, PRIMARY KEY (\`id\`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`ServiceTickets\` ( \`id\` varchar(255) NOT NULL, \`ticket_code\` varchar(255) DEFAULT NULL, \`customerId\` varchar(255) DEFAULT NULL, \`deviceName\` varchar(255) DEFAULT NULL, \`reported_issue\` text, \`status\` varchar(255) DEFAULT NULL, \`createdAt\` timestamp NULL DEFAULT current_timestamp(), \`assigneeId\` varchar(255) DEFAULT NULL, \`rating\` tinyint(1) DEFAULT NULL, \`customer_info\` JSON, \`invoiceId\` VARCHAR(255) NULL, \`receiverId\` VARCHAR(255) NULL, \`work_items\` TEXT NULL, \`appointment_date\` DATETIME NULL, \`physical_condition\` TEXT NULL, PRIMARY KEY (\`id\`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`WarrantyTickets\` ( \`id\` varchar(255) NOT NULL, \`ticketNumber\` varchar(255) NOT NULL, \`productModel\` varchar(255) DEFAULT NULL, \`productSerial\` varchar(255) DEFAULT NULL, \`customerName\` varchar(255) NOT NULL, \`customerPhone\` varchar(255) DEFAULT NULL, \`creatorId\` varchar(255) DEFAULT NULL, \`totalAmount\` decimal(15,2) NOT NULL DEFAULT 0.00, \`status\` varchar(255) NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT current_timestamp(), \`reportedIssue\` text, \`resolution_notes\` text, \`receiveDate\` datetime DEFAULT NULL, \`returnDate\` datetime DEFAULT NULL, \`orderId\` varchar(255) DEFAULT NULL, \`productId\` varchar(255) DEFAULT NULL, \`customerId\` varchar(255) DEFAULT NULL, \`priority\` varchar(255) DEFAULT 'Bình thường', \`warrantyType\` varchar(255) DEFAULT NULL, \`technician_notes\` text, \`repairDate\` datetime DEFAULT NULL, \`returnStaffId\` varchar(255) DEFAULT NULL, \`items\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]' CHECK (json_valid(\`items\`)), \`serviceFee\` decimal(15,2) NOT NULL DEFAULT 0.00, \`discount\` decimal(15,2) NOT NULL DEFAULT 0.00, \`vat\` decimal(5,2) NOT NULL DEFAULT 0.00, \`transactionType\` varchar(50) DEFAULT 'Sửa chữa', \`department\` varchar(255) DEFAULT NULL, \`departmentCode\` varchar(255) DEFAULT NULL, \`currency\` varchar(10) DEFAULT 'VND', \`totalQuantity\` int(11) DEFAULT 0, PRIMARY KEY (\`id\`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`Returns\` (\`id\` varchar(255) NOT NULL, \`orderId\` varchar(255) NOT NULL, \`reason\` text, \`status\` ENUM('Đang chờ','Đã duyệt','Đã từ chối') NOT NULL DEFAULT 'Đang chờ', \`refundAmount\` decimal(15,2) DEFAULT NULL, \`createdAt\` timestamp NULL DEFAULT current_timestamp(), PRIMARY KEY (\`id\`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`Quotations\` ( \`id\` varchar(255) NOT NULL, \`customer_id\` varchar(255) DEFAULT NULL, \`customerInfo\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`customerInfo\`)), \`creation_date\` datetime NOT NULL, \`expiry_date\` datetime DEFAULT NULL, \`items\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`items\`)), \`subtotal\` decimal(15,2) NOT NULL, \`discount_amount\` decimal(15,2) DEFAULT NULL, \`tax_amount\` decimal(15,2) DEFAULT NULL, \`total_amount\` decimal(15,2) NOT NULL, \`status\` enum('Nháp','Đã gửi','Đã chấp nhận','Hết hạn','Đã hủy') NOT NULL, \`terms\` text, PRIMARY KEY (\`id\`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`Faqs\` (\`id\` varchar(255) NOT NULL, \`question\` text NOT NULL, \`answer\` text NOT NULL, \`category\` varchar(255) DEFAULT NULL, \`isVisible\` tinyint(1) DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`DiscountCodes\` (\`id\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`type\` enum('percentage','fixed_amount') NOT NULL, \`value\` decimal(10,2) NOT NULL, \`description\` text, \`expiryDate\` date DEFAULT NULL, \`isActive\` tinyint(1) DEFAULT 1, PRIMARY KEY (\`id\`), UNIQUE KEY \`code\` (\`code\`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        
        `CREATE TABLE IF NOT EXISTS \`ChatLogSessions\` (\`id\` varchar(255) NOT NULL, \`userName\` varchar(255) DEFAULT NULL, \`userPhone\` varchar(20) DEFAULT NULL, \`startTime\` timestamp NULL DEFAULT current_timestamp(), \`messages\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`messages\`))) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`MediaLibrary\` ( \`id\` varchar(255) NOT NULL, \`url\` text NOT NULL, \`name\` varchar(255) DEFAULT NULL, \`type\` varchar(100) DEFAULT NULL, \`uploadedAt\` timestamp NULL DEFAULT current_timestamp(), \`altText\` varchar(255) DEFAULT NULL, \`associatedEntityType\` varchar(50) DEFAULT NULL, \`associatedEntityId\` varchar(255) DEFAULT NULL, PRIMARY KEY (\`id\`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    ];

    try {
        for (const query of schemaQueries) {
            await connection.query(query);
        }
        console.log("✅ Cấu trúc Database đã được cập nhật!");
    } catch (error) {
        console.error("❌ Lỗi khởi tạo cấu trúc DB:", error);
    }
};

const seedDatabase = async (connection) => {
    console.log("🌱 Đang kiểm tra dữ liệu mẫu...");
    try {
        const [countRows] = await connection.query('SELECT COUNT(*) as count FROM Products');
        if (countRows[0].count > 0) {
            console.log("👌 Database đã có dữ liệu, bỏ qua seeding.");
            return;
        }

        console.log("⚠️ Database trống. Đang thêm dữ liệu mẫu...");

        // Seed Users
        await connection.query(`
            INSERT IGNORE INTO \`Users\` (\`id\`, \`username\`, \`email\`, \`password\`, \`role\`, \`staffRole\`, \`status\`, \`isLocked\`, \`phone\`, \`address\`) VALUES
            ('staff001', 'Lê Hùng', 'hung.le@iqtechnology.com.vn', 'password123', 'staff', 'Trưởng nhóm Kỹ thuật', 'Đang hoạt động', 0, '0911855055', 'Văn phòng IQ Tech'),
            ('staff002', 'Nguyễn Thị Lan', 'lan.nguyen@iqtechnology.com.vn', 'password123', 'staff', 'Quản lý Bán hàng', 'Đang hoạt động', 0, '0911855056', 'Văn phòng IQ Tech'),
            ('user001', 'Duy Quang', 'quang.tran@iqtechnology.com.vn', 'password123', 'admin', 'Nhân viên Toàn quyền', 'Đang hoạt động', 0, '0911855055', 'Văn phòng IQ Tech'),
            ('cust001', 'Nguyễn Văn An', 'an.nguyen@email.com', 'password123', 'customer', NULL, 'Đang hoạt động', 0, '0905123456', '123 Nguyễn Văn Linh, Đà Nẵng');
        `);

        // Seed Products
        await connection.query(`
            INSERT IGNORE INTO \`Products\` (\`id\`, \`name\`, \`mainCategory\`, \`subCategory\`, \`price\`, \`originalPrice\`, \`stock\`, \`brand\`, \`tags\`, \`imageUrls\`, \`specifications\`, \`purchasePrice\`, \`wholesalePrice\`, \`productCode\`, \`supplierId\`, \`unit\`, \`isVisible\`) VALUES
            ('CPU001', 'CPU Intel Core i9-14900K', 'Linh kiện máy tính', 'CPU (Vi xử lý Intel, AMD)', 15990000, 17500000, 15, 'Intel', '["Nổi bật", "Gaming", "Mới"]', '["https://hanoicomputercdn.com/media/product/84214_cpu_intel_core_i9_14900k_1.png"]', '{}', 14500000, 15000000, 'CPU-INT-14900K', 'SUP001', 'Cái', 1),
            ('VGA001', 'VGA GIGABYTE GeForce RTX 4070 Ti SUPER', 'Linh kiện máy tính', 'VGA (Card màn hình)', 25490000, 27000000, 10, 'GIGABYTE', '["Nổi bật", "Gaming"]', '["https://hanoicomputercdn.com/media/product/85223_vga_gigabyte_geforce_rtx_4070_ti_super_gaming_oc_16gb_gddr6x_1.png"]', '{}', 23000000, 24000000, 'VGA-GIGA-4070TIS', 'SUP002', 'Cái', 1),
            ('RAM001', 'RAM Kingston Fury Beast RGB 32GB (2x16GB) DDR5 6000MHz', 'Linh kiện máy tính', 'RAM (DDR4, DDR5…)', 3290000, 3500000, 30, 'Kingston', '["Bán chạy"]', '["https://hanoicomputercdn.com/media/product/78396_ram_kingston_fury_beast_rgb_32gb_2x16gb_ddr5_bus_6000mhz_kf560c36bbeak2_32_1.png"]', '{}', 2800000, 3000000, 'RAM-KING-D532GB6000', 'SUP003', 'Bộ', 1),
            ('SSD001', 'Ổ cứng SSD Samsung 990 PRO 2TB NVMe PCIe 4.0', 'Linh kiện máy tính', 'Ổ cứng HDD / SSD (SATA, NVMe)', 4490000, 5000000, 25, 'Samsung', '["Bán chạy", "Tốc độ cao"]', '["https://hanoicomputercdn.com/media/product/77353_ssd_samsung_990_pro_2tb_pcie_gen4_x4_nvme_2_0_v_nand_m_2_mz_v9p2t0bw_1.png"]', '{}', 3900000, 4200000, 'SSD-SS-990P2TB', 'SUP001', 'Cái', 1),
            ('MAIN001', 'Mainboard ASUS ROG STRIX Z790-E GAMING WIFI II', 'Linh kiện máy tính', 'Bo mạch chủ (Mainboard)', 16490000, NULL, 8, 'ASUS', '["Gaming", "High-end"]', '["https://hanoicomputercdn.com/media/product/84128_mainboard_asus_rog_strix_z790_e_gaming_wifi_ii_ddr5_1.png"]', '{}', 15000000, 15500000, 'MAIN-ASUS-Z790E2', 'SUP002', 'Cái', 1),
            ('PSU001', 'Nguồn Cooler Master MWE Gold V2 850W - 80 Plus Gold', 'Linh kiện máy tính', 'Nguồn máy tính (PSU)', 2890000, 3200000, 18, 'Cooler Master', '["Bán chạy"]', '["https://hanoicomputercdn.com/media/product/64757_mwe_850_gold_v2_full_modular__1_.png"]', '{}', 2500000, 2700000, 'PSU-CM-850GV2', 'SUP003', 'Cái', 1),
            ('CASE001', 'Vỏ case NZXT H6 Flow RGB Black', 'Linh kiện máy tính', 'Vỏ máy (Case)', 3290000, NULL, 12, 'NZXT', '["Mới", "Đẹp"]', '["https://hanoicomputercdn.com/media/product/84705_vo_case_nzxt_h6_flow_rgb_black_1.png"]', '{}', 2900000, 3100000, 'CASE-NZXT-H6FRGB', 'SUP004', 'Cái', 1),
            ('LCD001', 'Màn hình LG UltraGear 27GR93U-B 4K 144Hz', 'Thiết bị ngoại vi', 'Màn hình (LCD, LED, 2K, 4K, Gaming…)', 13990000, 15500000, 20, 'LG', '["Gaming", "4K"]', '["https://hanoicomputercdn.com/media/product/83281_lg_27gr93u_b_1.png"]', '{}', 12500000, 13000000, 'LCD-LG-27GR93U', 'SUP001', 'Cái', 1),
            ('LAP001', 'Laptop Gaming Acer Predator Helios Neo 16', 'Laptop', 'Laptop Gaming', 37990000, 42000000, 7, 'Acer', '["Nổi bật", "Gaming"]', '["https://hanoicomputercdn.com/media/product/85429_laptop_gaming_acer_predator_helios_neo_16_phn16_72_9154_nh_qlxsv_002__1_.png"]', '{}', 35000000, 36000000, 'LAP-ACER-HELNEO16', 'SUP005', 'Cái', 1),
            ('PCGM001', 'PC GAMING IQ EAGLE', 'Máy tính để bàn (PC)', 'Máy tính Gaming', 28990000, 32000000, 5, 'IQ Technology', '["Bán chạy", "Nổi bật"]', '["https://hanoicomputercdn.com/media/product/85055_pc_gaming_hacom_thor_1.png"]', '{}', 26000000, 27500000, 'PCGM-IQ-EAGLE', NULL, 'Bộ', 1),
            ('PCGM002', 'PC GAMING STREAMER PRO', 'Máy tính để bàn (PC)', 'Máy tính Gaming', 48500000, 55000000, 3, 'IQ Technology', '["Nổi bật", "High-end"]', '["https://hanoicomputercdn.com/media/product/85461_pc_gaming_hacom_ghost_1.png"]', '{}', 45000000, 46500000, 'PCGM-IQ-STREAMER', NULL, 'Bộ', 1),
            ('CPU002', 'CPU AMD Ryzen 7 7800X3D', 'Linh kiện máy tính', 'CPU (Vi xử lý Intel, AMD)', 10490000, 11500000, 18, 'AMD', '["Gaming", "3D V-Cache"]', '["https://hanoicomputercdn.com/media/product/80267_cpu_amd_ryzen_7_7800x3d_1.png"]', '{}', 9500000, 10000000, 'CPU-AMD-7800X3D', 'SUP002', 'Cái', 1);
        `);
        
         // Seed Warehouses
        await connection.query(`
            INSERT IGNORE INTO \`Warehouses\` (\`id\`, \`name\`, \`location\`) VALUES 
            ('WH001', 'Kho Chính', '10 Huỳnh Thúc Kháng, Đà Nẵng'), 
            ('WH002', 'Kho Phụ', 'K1/2 Lê Đình Lý, Đà Nẵng');
        `);
        
        // Seed Suppliers
        await connection.query(`
             INSERT IGNORE INTO \`Suppliers\` (\`id\`, \`name\`, \`contactInfo\`, \`paymentTerms\`) VALUES 
            ('SUP001', 'Nhà phân phối Tin học Mai Hoàng', '{"email":"contact@maihoang.com.vn", "phone":"02436285868", "address":"241 Phố Vọng, Hai Bà Trưng, Hà Nội"}', 'Thanh toán gối đầu 30 ngày'), 
            ('SUP002', 'Công ty máy tính Vĩnh Xuân (SPC)', '{"email":"info@spc.com.vn", "phone":"02838326085", "address":"393-395-397 Sư Vạn Hạnh, Phường 12, Quận 10, TP.HCM"}', 'Thanh toán ngay khi nhận hàng'),
            ('SUP003', 'Công ty máy tính Viễn Sơn', '{"email":"info@microstar.vn", "phone":"02838326085", "address":"162B Bùi Thị Xuân, Phường Phạm Ngũ Lão, Quận 1, TP.HCM"}', 'Thanh toán cuối tháng'),
            ('SUP004', 'TNC Store', '{"email":"cskh@tncstore.vn", "phone":"0912345678", "address":"172 Lê Thanh Nghị, Hai Bà Trưng, Hà Nội"}', 'Thanh toán ngay'),
            ('SUP005', 'An Phát Computer', '{"email":"kinhdoanh@anphatpc.com.vn", "phone":"0923456789", "address":"49 Thái Hà, Đống Đa, Hà Nội"}', 'Công nợ 15 ngày');
        `);

        console.log("✅ Đã thêm dữ liệu mẫu thành công!");
    } catch (error) {
        console.error("❌ Lỗi khi thêm dữ liệu mẫu:", error);
    }
};

// --- DB CONNECTION CHECK ---
let dbStatus = { status: 'unknown', error: null, tableExists: false };

const checkDbConnection = async () => {
    try {
        const connection = await pool.getConnection();
        try {
            await connection.query('SELECT 1');
            
            // --- RUN MIGRATIONS & SEEDING ---
            await initializeDatabase(connection);
            await seedDatabase(connection);
            
            dbStatus = { status: 'connected', error: null, tableExists: true };
            console.log("✅ Kết nối DB thành công và đã cập nhật Schema!");

        } catch (tableError) {
             console.error("⚠️ Lỗi khi khởi tạo DB:", tableError);
             dbStatus = { status: 'error', error: tableError, tableExists: false };
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("\n⚠️ CẢNH BÁO: KHÔNG THỂ KẾT NỐI DATABASE");
        console.error("Chi tiết lỗi:", error.message);
        dbStatus = { status: 'error', error: { code: error.code, message: error.message }, tableExists: false };
    }
};
checkDbConnection();

// --- HELPERS ---
const deserializeProduct = (p) => ({
    ...p,
    imageUrls: typeof p.imageUrls === 'string' ? JSON.parse(p.imageUrls || '[]') : p.imageUrls,
    specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications || '{}') : p.specifications,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : p.tags,
    isVisible: Boolean(p.isVisible), 
    price: Number(p.price),
    stock: Number(p.stock),
});

const deserializeOrder = (o) => ({
    ...o,
    customerInfo: typeof o.customerInfo === 'string' ? JSON.parse(o.customerInfo || '{}') : o.customerInfo,
    items: typeof o.items === 'string' ? JSON.parse(o.items || '[]') : o.items,
    paymentInfo: typeof o.paymentInfo === 'string' ? JSON.parse(o.paymentInfo || '{}') : o.paymentInfo,
    shippingInfo: typeof o.shippingInfo === 'string' ? JSON.parse(o.shippingInfo || '{}') : o.shippingInfo,
    totalAmount: Number(o.totalAmount),
});

const deserializeUser = (u) => {
    const { password, ...userWithoutPassword } = u;
    return userWithoutPassword;
};

// ==========================================================================
// API ROUTER
// ==========================================================================
const apiRouter = express.Router();

apiRouter.get('/health', async (req, res) => {
    if (dbStatus.status !== 'connected') await checkDbConnection();
    if (dbStatus.status === 'connected') {
        res.status(200).json({ status: 'ok', database: 'connected', tableExists: dbStatus.tableExists });
    } else {
        res.status(500).json({ status: 'error', database: 'disconnected', error: dbStatus.error });
    }
});

// === PRODUCTS ===

// 1. Featured Products - MUST BE DEFINED BEFORE /:id
apiRouter.get('/products/featured', async (req, res) => {
    console.log('Fetching featured products...');
    try {
        const query = `SELECT * FROM Products ORDER BY price DESC LIMIT 4`;
        const [rows] = await pool.query(query);
        res.json(rows.map(deserializeProduct));
    } catch (error) {
        console.error("Lỗi lấy sản phẩm nổi bật:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// 2. Products List
apiRouter.get('/products', async (req, res) => {
    try {
        const { mainCategory, subCategory, q, tags, limit = 1000, page = 1 } = req.query;
        let baseQuery = `FROM Products p`;
        const whereClauses = ['1=1'];
        const params = [];
        
        if (mainCategory) { whereClauses.push('p.mainCategory = ?'); params.push(mainCategory); }
        if (subCategory) { whereClauses.push('p.subCategory = ?'); params.push(subCategory); }
        if (q) { whereClauses.push('(p.name LIKE ? OR p.brand LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
        if (tags) { whereClauses.push('p.tags LIKE ?'); params.push(`%${tags}%`); }
        
        const whereString = ' WHERE ' + whereClauses.join(' AND ');
        
        const [countRows] = await pool.query(`SELECT COUNT(p.id) as total ${baseQuery} ${whereString}`, params);
        const totalProducts = countRows[0].total;

        const offset = (Number(page) - 1) * Number(limit);
        const productQuery = `SELECT p.* ${baseQuery} ${whereString} ORDER BY p.id DESC LIMIT ? OFFSET ?`;
        const [products] = await pool.query(productQuery, [...params, Number(limit), offset]);
        
        res.json({ products: products.map(deserializeProduct), totalProducts });
    } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// 3. Product Detail (Dynamic ID) - MUST BE LAST in /products
apiRouter.get('/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM Products WHERE id = ?`, [req.params.id]);
        if (rows.length > 0) {
            res.json(deserializeProduct(rows[0]));
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// Product Mutations
apiRouter.post('/products', async (req, res) => {
    try {
        const p = req.body;
        const id = p.id || `prod-${Date.now()}`;
        const imageUrls = JSON.stringify(p.imageUrls || []);
        const specifications = JSON.stringify(p.specifications || {});
        const tags = JSON.stringify(p.tags || []);
        const query = `INSERT INTO Products (id, name, mainCategory, subCategory, price, originalPrice, stock, brand, tags, imageUrls, specifications, isVisible, hasVAT, purchasePrice, wholesalePrice, productCode, supplierId, unit, seoMetaTitle, seoMetaDescription, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(query, [
            id, p.name, p.mainCategory, p.subCategory, p.price, p.originalPrice, p.stock, p.brand, tags, imageUrls, specifications,
            p.isVisible, p.hasVAT, p.purchasePrice, p.wholesalePrice, p.productCode, p.supplierId, p.unit, p.seoMetaTitle, p.seoMetaDescription, p.slug
        ]);
        const [rows] = await pool.query('SELECT * FROM Products WHERE id = ?', [id]);
        res.json(deserializeProduct(rows[0]));
    } catch (error) {
        console.error("Lỗi thêm sản phẩm:", error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.put('/products/:id', async (req, res) => {
    try {
        const updates = req.body;
        const id = req.params.id;
        
        // Handle JSON fields
        if (updates.imageUrls) updates.imageUrls = JSON.stringify(updates.imageUrls);
        if (updates.specifications) updates.specifications = JSON.stringify(updates.specifications);
        if (updates.tags) updates.tags = JSON.stringify(updates.tags);

        const fields = Object.keys(updates).filter(k => k !== 'id');
        if (fields.length === 0) return res.json({ message: "No updates" });

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => updates[f]);
        
        await pool.query(`UPDATE Products SET ${setClause} WHERE id = ?`, [...values, id]);
        
        const [rows] = await pool.query('SELECT * FROM Products WHERE id = ?', [id]);
        res.json(deserializeProduct(rows[0]));
    } catch (error) {
        console.error("Lỗi cập nhật sản phẩm:", error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.delete('/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        res.status(500).json({ message: error.message });
    }
});


// === USERS ===
apiRouter.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Users');
        res.json(rows.map(deserializeUser));
    } catch (error) {
        console.error("Lỗi lấy danh sách users:", error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'Email không tồn tại.' });
        
        const user = rows[0];
        if (user.password !== password) return res.status(401).json({ message: 'Mật khẩu không đúng.' });
        
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

apiRouter.post('/users', async (req, res) => {
    try {
        const user = req.body;
        const id = user.id || `user-${crypto.randomUUID()}`;
        const query = `INSERT INTO Users (id, username, email, password, role, staffRole, phone, address, imageUrl, status, joinDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(query, [
            id, user.username, user.email, user.password, user.role, user.staffRole, 
            user.phone, user.address, user.imageUrl, user.status, user.joinDate
        ]);
        const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [id]);
        res.json(deserializeUser(rows[0]));
    } catch (error) {
        console.error("Lỗi tạo user:", error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.put('/users/:id', async (req, res) => {
    try {
        const updates = req.body;
        const id = req.params.id;
        
        const fields = Object.keys(updates).filter(k => k !== 'id');
        if (fields.length === 0) return res.json({ message: "No updates" });

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => updates[f]);
        
        await pool.query(`UPDATE Users SET ${setClause} WHERE id = ?`, [...values, id]);
        
        const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [id]);
        res.json(deserializeUser(rows[0]));
    } catch (error) {
        console.error("Lỗi cập nhật user:", error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.delete('/users/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error("Lỗi xóa user:", error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.get('/users/:userId/orders', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Orders WHERE userId = ? ORDER BY orderDate DESC', [req.params.userId]);
        res.json(rows.map(deserializeOrder));
    } catch (error) {
        console.error("Lỗi lấy đơn hàng của user:", error);
        res.status(500).json({ message: error.message });
    }
});

// === ORDERS ===

apiRouter.get('/orders', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Orders ORDER BY orderDate DESC');
        res.json(rows.map(deserializeOrder));
    } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng:", error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.get('/orders/customer/:customerId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Orders WHERE userId = ? ORDER BY orderDate DESC', [req.params.customerId]);
        res.json(rows.map(deserializeOrder));
    } catch (error) {
        console.error("Lỗi lấy đơn hàng của customer:", error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.post('/orders', async (req, res) => {
    try {
        const order = req.body;
        const id = order.id || `order-${Date.now()}`;
        
        const customerInfo = JSON.stringify(order.customerInfo);
        const items = JSON.stringify(order.items);
        const paymentInfo = JSON.stringify(order.paymentInfo);
        const shippingInfo = JSON.stringify(order.shippingInfo || {});

        const query = `INSERT INTO Orders (id, userId, creatorId, customerInfo, items, subtotal, totalAmount, paidAmount, cost, profit, status, paymentInfo, shippingInfo, orderDate, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await pool.query(query, [
            id, order.userId, order.creatorId, customerInfo, items, 
            order.subtotal, order.totalAmount, order.paidAmount, order.cost, order.profit,
            order.status, paymentInfo, shippingInfo, order.orderDate, order.notes
        ]);
        
        const [rows] = await pool.query('SELECT * FROM Orders WHERE id = ?', [id]);
        res.json(deserializeOrder(rows[0]));
    } catch (error) {
        console.error("Lỗi tạo đơn hàng:", error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.put('/orders/:id', async (req, res) => {
    try {
        const updates = req.body;
        const id = req.params.id;
        
        if (updates.customerInfo) updates.customerInfo = JSON.stringify(updates.customerInfo);
        if (updates.items) updates.items = JSON.stringify(updates.items);
        if (updates.paymentInfo) updates.paymentInfo = JSON.stringify(updates.paymentInfo);
        if (updates.shippingInfo) updates.shippingInfo = JSON.stringify(updates.shippingInfo);

        const fields = Object.keys(updates).filter(k => k !== 'id');
        if (fields.length === 0) return res.json({ message: "No updates" });

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => updates[f]);
        
        await pool.query(`UPDATE Orders SET ${setClause} WHERE id = ?`, [...values, id]);
        
        const [rows] = await pool.query('SELECT * FROM Orders WHERE id = ?', [id]);
        res.json(deserializeOrder(rows[0]));
    } catch (error) {
        console.error("Lỗi cập nhật đơn hàng:", error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.delete('/orders/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Orders WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error("Lỗi xóa đơn hàng:", error);
        res.status(500).json({ message: error.message });
    }
});

// === FINANCIALS (Payroll, Transactions) ===

// Get Transactions
apiRouter.get('/financials/transactions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM FinancialTransactions ORDER BY transactionDate DESC');
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy giao dịch:", error);
        res.status(500).json({ message: error.message });
    }
});

// Add Transaction
apiRouter.post('/financials/transactions', async (req, res) => {
    try {
        const t = req.body;
        const id = t.id || `trans-${Date.now()}`;
        const query = `INSERT INTO FinancialTransactions (id, type, category, amount, description, transactionDate, relatedEntity, invoiceNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(query, [id, t.type, t.category, t.amount, t.description, t.date || t.transactionDate, t.relatedEntity, t.invoiceNumber]);
        
        const [rows] = await pool.query('SELECT * FROM FinancialTransactions WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        console.error("Lỗi thêm giao dịch:", error);
        res.status(500).json({ message: error.message });
    }
});

// Update Transaction
apiRouter.put('/financials/transactions/:id', async (req, res) => {
    try {
        const updates = req.body;
        const id = req.params.id;
        const fields = Object.keys(updates).filter(k => k !== 'id');
        if (fields.length === 0) return res.json({ message: "No updates" });
        
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => updates[f]);
        
        await pool.query(`UPDATE FinancialTransactions SET ${setClause} WHERE id = ?`, [...values, id]);
        const [rows] = await pool.query('SELECT * FROM FinancialTransactions WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

apiRouter.delete('/financials/transactions/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM FinancialTransactions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Payroll
apiRouter.get('/financials/payroll', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM PayrollRecords');
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy bảng lương:", error);
        res.status(500).json({ message: error.message });
    }
});

// Save Payroll (Batch Insert/Update)
apiRouter.post('/financials/payroll', async (req, res) => {
    try {
        const records = req.body; // Expecting an array of PayrollRecords
        if (!Array.isArray(records)) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ (phải là mảng)." });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            for (const r of records) {
                // Check if exists
                const [existing] = await connection.query('SELECT id FROM PayrollRecords WHERE id = ?', [r.id]);
                if (existing.length > 0) {
                    await connection.query(`UPDATE PayrollRecords SET employeeId=?, employeeName=?, payPeriod=?, baseSalary=?, bonus=?, deduction=?, finalSalary=?, status=?, notes=? WHERE id=?`, 
                    [r.employeeId, r.employeeName, r.payPeriod, r.baseSalary, r.bonus, r.deduction, r.finalSalary, r.status, r.notes, r.id]);
                } else {
                    await connection.query(`INSERT INTO PayrollRecords (id, employeeId, employeeName, payPeriod, baseSalary, bonus, deduction, finalSalary, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [r.id, r.employeeId, r.employeeName, r.payPeriod, r.baseSalary, r.bonus, r.deduction, r.finalSalary, r.status, r.notes]);
                }
            }
            await connection.commit();
            res.json({ message: "Lưu bảng lương thành công" });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Lỗi lưu bảng lương:", error);
        res.status(500).json({ message: error.message });
    }
});

// === ARTICLES ===
apiRouter.get('/articles', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Articles ORDER BY date DESC');
        // Parse JSON tags
        const articles = rows.map(a => ({
            ...a,
            tags: typeof a.tags === 'string' ? JSON.parse(a.tags) : a.tags
        }));
        res.json(articles);
    } catch (error) {
        console.error("Lỗi lấy bài viết:", error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.post('/articles', async (req, res) => {
    try {
        const a = req.body;
        const id = a.id || `art-${Date.now()}`;
        const tags = JSON.stringify(a.tags || []);
        await pool.query(`INSERT INTO Articles (id, title, summary, content, author, category, imageUrl, date, tags, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, a.title, a.summary, a.content, a.author, a.category, a.imageUrl, a.date, tags, a.slug]);
        const [rows] = await pool.query('SELECT * FROM Articles WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        console.error("Lỗi thêm bài viết:", error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.put('/articles/:id', async (req, res) => {
    try {
        const updates = req.body;
        if (updates.tags) updates.tags = JSON.stringify(updates.tags);
        const fields = Object.keys(updates).filter(k => k !== 'id');
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => updates[f]);
        await pool.query(`UPDATE Articles SET ${setClause} WHERE id = ?`, [...values, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

apiRouter.delete('/articles/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Articles WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// === API 404 HANDLER ===
// This captures any request starting with /api that wasn't handled above.
apiRouter.use('*', (req, res) => {
    res.status(404).json({ message: `API Endpoint not found: ${req.originalUrl}` });
});

// Register the API Router at /api
app.use('/api', apiRouter);


// --- SERVE STATIC FILES (PRODUCTION) ---
if (process.env.NODE_ENV === 'production') {
    const projectRoot = path.resolve(__dirname, '..');
    const frontendDistPath = path.join(projectRoot, 'dist');
    
    app.use(express.static(frontendDistPath));

    // Handle React Routing, return all non-API requests to React app
    app.get('*', (req, res) => {
        // If it somehow got here with /api, it means apiRouter didn't catch it (unlikely with the * handler above),
        // but just in case, we don't want to return HTML for an API call.
        if (req.path.startsWith('/api/')) {
             return res.status(404).json({ message: `API endpoint not found (Static Fallback): ${req.path}` });
        }
        res.sendFile(path.resolve(frontendDistPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});
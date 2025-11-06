# IQ Technology - IT Services & PC Store Web Application

Đây là một ứng dụng web hiện đại được xây dựng cho một nhà bán lẻ linh kiện PC và nhà cung cấp dịch vụ CNTT, có chatbot hỗ trợ bởi AI và các tính năng đề xuất linh kiện.

## Thiết lập Cơ sở dữ liệu (Database Setup)

Ứng dụng này sử dụng cơ sở dữ liệu SQL (ví dụ: MySQL, MariaDB) để lưu trữ dữ liệu. Để bắt đầu, bạn cần tạo một cơ sở dữ liệu và sau đó thực thi các câu lệnh SQL dưới đây để tạo các bảng cần thiết và chèn dữ liệu mẫu.

**Lưu ý:** Sao chép và chạy toàn bộ khối lệnh SQL này trong công cụ quản lý cơ sở dữ liệu của bạn (như phpMyAdmin, DBeaver, MySQL Workbench).

```sql
--
-- Cấu trúc bảng cho `Articles` (Bài viết)
--
CREATE TABLE `Articles` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `summary` text NOT NULL,
  `content` longtext,
  `imageUrl` varchar(255) DEFAULT NULL,
  `author` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `category` varchar(255) NOT NULL,
  `isAIGenerated` tinyint(1) DEFAULT '0',
  `imageSearchQuery` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đổ dữ liệu cho bảng `Articles`
--
INSERT INTO `Articles` (`id`, `title`, `summary`, `content`, `imageUrl`, `author`, `date`, `category`, `isAIGenerated`, `imageSearchQuery`) VALUES
('it001', 'Top 5 Lợi Ích Của Dịch Vụ IT Thuê Ngoài Cho Doanh Nghiệp', 'Khám phá cách dịch vụ IT thuê ngoài có thể giúp doanh nghiệp của bạn tiết kiệm chi phí, tăng cường bảo mật và tập trung vào hoạt động kinh doanh cốt lõi.', 'Nội dung chi tiết về lợi ích của IT thuê ngoài...', 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1770&auto=format&fit=crop', 'Trần Minh Quang', '2024-07-15 10:00:00', 'Dịch vụ IT', 0, NULL),
('it002', 'Hướng Dẫn Xây Dựng Cấu Hình PC Gaming Tối Ưu Ngân Sách', 'Bạn muốn xây dựng một dàn PC gaming mạnh mẽ mà không tốn quá nhiều chi phí? Bài viết này sẽ hướng dẫn bạn cách chọn lựa linh kiện thông minh.', 'Nội dung chi tiết về build PC gaming...', 'https://images.unsplash.com/photo-1598986646512-921b0d2c6948?q=80&w=1853&auto=format&fit=crop', 'Lê Hùng', '2024-07-12 14:30:00', 'Hướng dẫn', 0, NULL),
('it003', 'So Sánh Card Đồ Họa NVIDIA và AMD: Lựa Chọn Nào Cho Bạn?', 'Cuộc chiến không hồi kết giữa hai ông lớn NVIDIA và AMD. Chúng tôi sẽ phân tích ưu và nhược điểm của các dòng card đồ họa mới nhất để giúp bạn đưa ra lựa chọn đúng đắn.', NULL, 'https://images.unsplash.com/photo-1591463925312-dce92543a655?q=80&w=1770&auto=format&fit=crop', 'Admin', '2024-07-10 11:00:00', 'So sánh', 0, NULL),
('it005', 'Tại Sao Doanh Nghiệp Cần Đầu Tư Vào An Ninh Mạng Ngay Hôm Nay?', 'Các mối đe dọa an ninh mạng ngày càng tinh vi. Tìm hiểu lý do tại sao việc đầu tư vào các giải pháp bảo mật là cực kỳ quan trọng để bảo vệ dữ liệu và uy tín của doanh nghiệp bạn.', 'Nội dung chi tiết về an ninh mạng...', 'https://images.unsplash.com/photo-1562813733-b31f71025d54?q=80&w=1769&auto=format&fit=crop', 'Nguyễn Thị An', '2024-07-18 09:00:00', 'Bảo mật', 0, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho `ChatLogSessions`
--
CREATE TABLE `ChatLogSessions` (
  `id` varchar(255) NOT NULL,
  `userName` varchar(255) NOT NULL,
  `userPhone` varchar(20) NOT NULL,
  `startTime` datetime NOT NULL,
  `endTime` datetime DEFAULT NULL,
  `messages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `notes` TEXT DEFAULT NULL COMMENT 'Ghi chú của nhân viên hỗ trợ'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đổ dữ liệu cho bảng `ChatLogSessions`
--
INSERT INTO `ChatLogSessions` (`id`, `userName`, `userPhone`, `startTime`, `endTime`, `messages`, `notes`) VALUES
('chat-1693824123456', 'Nguyễn Văn A', '0905123456', '2024-07-20 10:00:00', '2024-07-20 10:15:00', '[{\"id\":\"msg1\",\"text\":\"Chào bạn, tôi cần tư vấn về dịch vụ mạng.\",\"sender\":\"user\",\"timestamp\":\"2024-07-20T03:00:00.000Z\"},{\"id\":\"msg2\",\"text\":\"Chào anh A, IQ Technology có thể giúp gì cho anh?\",\"sender\":\"bot\",\"timestamp\":\"2024-07-20T03:00:05.000Z\"}]', 'Khách hàng quan tâm gói mạng cho văn phòng 20 người. Đã hẹn gọi lại tư vấn chi tiết.');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho `DiscountCodes`
--
CREATE TABLE `DiscountCodes` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `type` enum('percentage','fixed_amount') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `description` text,
  `expiryDate` date DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `minSpend` decimal(15,2) DEFAULT NULL,
  `usageLimit` int(11) DEFAULT NULL,
  `timesUsed` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đổ dữ liệu cho bảng `DiscountCodes`
--
INSERT INTO `DiscountCodes` (`id`, `name`, `code`, `type`, `value`, `description`, `expiryDate`, `isActive`, `minSpend`, `usageLimit`, `timesUsed`) VALUES
('dc_freeship', 'Miễn phí vận chuyển', 'FREESHIP500K', 'fixed_amount', 30000.00, 'Miễn phí vận chuyển (tối đa 30k) cho đơn hàng từ 500k.', NULL, 1, 500000.00, NULL, 0),
('dc_welcome', 'Chào mừng thành viên mới', 'WELCOME10', 'percentage', 10.00, 'Giảm 10% cho đơn hàng đầu tiên của khách hàng mới.', '2024-12-31', 1, 500000.00, 1, 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho `Faqs`
--
CREATE TABLE `Faqs` (
  `id` varchar(255) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `isVisible` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đổ dữ liệu cho bảng `Faqs`
--
INSERT INTO `Faqs` (`id`, `question`, `answer`, `category`, `isVisible`) VALUES
('faq_g1', 'Thời gian bảo hành sản phẩm là bao lâu?', 'Thời gian bảo hành tùy thuộc vào từng loại sản phẩm và nhà sản xuất, thường từ 12 đến 36 tháng. Thông tin chi tiết được ghi rõ trên phiếu bảo hành và mô tả sản phẩm.', 'Chính sách', 1),
('faq_s1', 'IQ Technology có hỗ trợ lắp đặt tận nơi không?', 'Có, chúng tôi cung cấp dịch vụ lắp đặt PC, hệ thống mạng, camera tận nơi tại Đà Nẵng và các khu vực lân cận. Vui lòng liên hệ để biết thêm chi tiết.', 'Dịch vụ', 1),
('faq_s2', 'Làm thế nào để yêu cầu dịch vụ sửa chữa?', 'Bạn có thể gọi hotline, gửi email, chat trực tiếp trên website hoặc mang máy trực tiếp đến cửa hàng của chúng tôi để được hỗ trợ.', 'Dịch vụ', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho `Orders`
--
CREATE TABLE `Orders` (
  `id` varchar(255) NOT NULL,
  `customerInfo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `totalAmount` decimal(15,2) NOT NULL,
  `orderDate` datetime NOT NULL,
  `status` enum('Chờ xử lý','Đã xác nhận','Đang chuẩn bị','Đang giao','Hoàn thành','Đã hủy') NOT NULL,
  `paymentInfo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đổ dữ liệu cho bảng `Orders`
--
INSERT INTO `Orders` (`id`, `customerInfo`, `items`, `totalAmount`, `orderDate`, `status`, `paymentInfo`) VALUES
('order-1693824987654', '{\"fullName\":\"Trần Văn B\",\"phone\":\"0912345678\",\"address\":\"123 Lê Lợi, Đà Nẵng\",\"email\":\"tranvanb@example.com\"}', '[{\"productId\":\"cpu001\",\"productName\":\"Intel Core i5-13600K\",\"quantity\":1,\"price\":8000000}]', 8000000.00, '2024-07-20 12:00:00', 'Hoàn thành', '{\"method\":\"Thanh toán khi nhận hàng (COD)\",\"status\":\"Đã thanh toán\"}'),
('order-1693825123456', '{\"fullName\":\"Lê Thị C\",\"phone\":\"0987654321\",\"address\":\"456 Nguyễn Văn Linh, Đà Nẵng\",\"email\":\"lethic@example.com\"}', '[{\"productId\":\"gpu001\",\"productName\":\"NVIDIA GeForce RTX 4070\",\"quantity\":1,\"price\":15000000},{\"productId\":\"ram002\",\"productName\":\"Corsair Vengeance 32GB DDR5\",\"quantity\":1,\"price\":3500000}]', 18500000.00, '2024-07-21 09:30:00', 'Đang giao', '{\"method\":\"Chuyển khoản ngân hàng\",\"status\":\"Đã thanh toán\"}');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho `Products`
--
CREATE TABLE `Products` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `originalPrice` decimal(15,2) DEFAULT NULL,
  `stock` int(11) NOT NULL,
  `category` varchar(255) NOT NULL,
  `mainCategory` varchar(255) NOT NULL,
  `subCategory` varchar(255) NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `imageUrls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text NOT NULL,
  `shortDescription` text,
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tags` text,
  `isVisible` tinyint(1) NOT NULL DEFAULT '1',
  `rating` decimal(3,2) DEFAULT NULL,
  `reviews` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đổ dữ liệu cho bảng `Products`
--
INSERT INTO `Products` (`id`, `name`, `price`, `originalPrice`, `stock`, `category`, `mainCategory`, `subCategory`, `brand`, `imageUrls`, `description`, `shortDescription`, `specifications`, `tags`, `isVisible`, `rating`, `reviews`) VALUES
('cpu001', 'Intel Core i5-13600K', 8000000.00, 8500000.00, 15, 'Linh kiện máy tính > CPU', 'Linh kiện máy tính', 'CPU', 'Intel', '[\"https://images.unsplash.com/photo-1627885928325-a8b2f153a863?q=80&w=600&auto=format&fit=crop\"]', 'Vi xử lý Intel Core i5 thế hệ 13 mạnh mẽ, phù hợp cho gaming và làm việc.', '14 nhân, 20 luồng, Turbo Boost 5.1GHz', '{\"Socket\":\"LGA1700\",\"Số nhân\":\"14\",\"Số luồng\":\"20\"}', 'Nổi bật, CPU', 1, 4.80, 152);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho `Users`
--
CREATE TABLE `Users` (
  `id` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','staff','customer') NOT NULL,
  `staffRole` enum('Quản lý Bán hàng','Biên tập Nội dung','Trưởng nhóm Kỹ thuật','Chuyên viên Hỗ trợ','Nhân viên Toàn quyền') DEFAULT NULL,
  `joinDate` datetime DEFAULT NULL,
  `status` enum('Đang hoạt động','Tạm khóa') DEFAULT 'Đang hoạt động',
  `isLocked` tinyint(1) DEFAULT '0',
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `imageUrl` varchar(255) DEFAULT NULL,
  `gender` enum('Nam','Nữ','Khác') DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `leadSource` varchar(255) DEFAULT NULL,
  `customerGroup` enum('Mới','Thường','VIP','Sỉ') DEFAULT 'Mới',
  `loyaltyPoints` int(11) DEFAULT '0',
  `debtStatus` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đổ dữ liệu cho bảng `Users`
--
INSERT INTO `Users` (`id`, `username`, `email`, `password`, `role`, `staffRole`, `joinDate`, `status`, `isLocked`, `phone`, `address`, `imageUrl`, `gender`, `dateOfBirth`, `leadSource`, `customerGroup`, `loyaltyPoints`, `debtStatus`, `position`) VALUES
('staff001', 'Nhân Viên Sales', 'sales01@iqtech.com', 'password123', 'staff', 'Quản lý Bán hàng', NULL, 'Đang hoạt động', 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Mới', 0, NULL, NULL),
('staff002', 'Kỹ Thuật Viên', 'tech01@iqtech.com', 'password123', 'staff', 'Trưởng nhóm Kỹ thuật', NULL, 'Đang hoạt động', 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Mới', 0, NULL, NULL),
('staff003', 'Biên Tập Viên', 'content01@iqtech.com', 'password123', 'staff', 'Biên tập Nội dung', NULL, 'Đang hoạt động', 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Mới', 0, NULL, NULL),
('user001', 'Quang Trần', 'quangtmdit@gmail.com', 'password123', 'admin', 'Nhân viên Toàn quyền', '2024-01-01 00:00:00', 'Đang hoạt động', 0, '0911855055', '123 Đà Nẵng', NULL, 'Nam', '1990-01-01', 'Website', 'VIP', 1500, 'Không nợ', 'CEO');


--
-- Cấu trúc bảng cho `Quotations` (Báo giá)
--
CREATE TABLE `Quotations` (
  `id` varchar(255) NOT NULL,
  `customer_id` varchar(255) DEFAULT NULL,
  `creation_date` datetime NOT NULL,
  `expiry_date` datetime DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `discount_amount` decimal(15,2) DEFAULT '0.00',
  `tax_amount` decimal(15,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) NOT NULL,
  `status` enum('Nháp','Đã gửi','Đã chấp nhận','Hết hạn','Đã hủy') NOT NULL,
  `terms` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đổ dữ liệu cho bảng `Quotations`
--
INSERT INTO `Quotations` (`id`, `customer_id`, `creation_date`, `expiry_date`, `items`, `subtotal`, `discount_amount`, `tax_amount`, `total_amount`, `status`, `terms`) VALUES
('quote-1693826123456', 'user001', '2024-07-22 14:00:00', '2024-07-29 14:00:00', '[{\"productId\":\"cpu001\",\"productName\":\"Intel Core i5-13600K\",\"quantity\":5,\"price\":7900000}]', 39500000.00, 500000.00, 0.00, 39000000.00, 'Đã gửi', 'Thanh toán 50% trước khi giao hàng.');


--
-- Cấu trúc bảng cho `ServiceTickets` (Phiếu sửa chữa)
--
CREATE TABLE `ServiceTickets` (
  `id` VARCHAR(255) NOT NULL,
  `customer_id` VARCHAR(255) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_serial` VARCHAR(255) DEFAULT NULL,
  `reported_issue` TEXT NOT NULL,
  `reception_date` DATETIME NOT NULL,
  `completion_date` DATETIME DEFAULT NULL,
  `status` ENUM('Mới tạo', 'Chờ báo giá', 'Chờ linh kiện', 'Đang sửa chữa', 'Hoàn thành', 'Đã hủy') NOT NULL,
  `inspection_fee` DECIMAL(15,2) DEFAULT 0.00,
  `component_cost` DECIMAL(15,2) DEFAULT 0.00,
  `labor_cost` DECIMAL(15,2) DEFAULT 0.00,
  `total_cost` DECIMAL(15,2) DEFAULT 0.00,
  `notes` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đổ dữ liệu cho bảng `ServiceTickets`
--
INSERT INTO `ServiceTickets` (`id`, `customer_id`, `product_name`, `product_serial`, `reported_issue`, `reception_date`, `status`, `total_cost`) VALUES
('svc-tkt-1', 'user001', 'Laptop Dell XPS 15', 'ABC123XYZ', 'Máy không lên nguồn, không có đèn báo.', '2024-07-21 09:00:00', 'Đang sửa chữa', 1500000.00);

--
-- Cấu trúc bảng cho `WarrantyTickets` (Phiếu bảo hành)
--
CREATE TABLE `WarrantyTickets` (
  `id` VARCHAR(255) NOT NULL,
  `original_order_id` VARCHAR(255) NOT NULL,
  `customer_id` VARCHAR(255) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_serial` VARCHAR(255) DEFAULT NULL,
  `reported_issue` TEXT NOT NULL,
  `actual_issue` TEXT,
  `reception_date` DATETIME NOT NULL,
  `completion_date` DATETIME DEFAULT NULL,
  `status` ENUM('Mới tạo', 'Đang kiểm tra', 'Chờ linh kiện', 'Đang xử lý', 'Hoàn thành', 'Từ chối bảo hành') NOT NULL,
  `solution` ENUM('Sửa chữa', 'Đổi mới', 'Hoàn tiền') DEFAULT NULL,
  `notes` TEXT,
  `internal_cost` DECIMAL(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đổ dữ liệu cho bảng `WarrantyTickets`
--
INSERT INTO `WarrantyTickets` (`id`, `original_order_id`, `customer_id`, `product_name`, `product_serial`, `reported_issue`, `reception_date`, `status`, `solution`, `notes`) VALUES
('warr-tkt-1', 'order-1693824987654', 'user001', 'Nguồn Antec 650W', 'XYZ987ABC', 'Nguồn máy tính kêu to khi tải nặng.', '2024-07-22 14:00:00', 'Hoàn thành', 'Đổi mới', 'Lỗi quạt từ nhà sản xuất, đã đổi sản phẩm mới cho khách.');


--
-- Khóa chính cho các bảng
--
ALTER TABLE `Articles` ADD PRIMARY KEY (`id`);
ALTER TABLE `ChatLogSessions` ADD PRIMARY KEY (`id`);
ALTER TABLE `DiscountCodes` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `code` (`code`);
ALTER TABLE `Faqs` ADD PRIMARY KEY (`id`);
ALTER TABLE `Orders` ADD PRIMARY KEY (`id`);
ALTER TABLE `Products` ADD PRIMARY KEY (`id`);
ALTER TABLE `Users` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `email` (`email`);
ALTER TABLE `Quotations` ADD PRIMARY KEY (`id`);
ALTER TABLE `ServiceTickets` ADD PRIMARY KEY (`id`);
ALTER TABLE `WarrantyTickets` ADD PRIMARY KEY (`id`);

COMMIT;
```

## Thiết lập Backend

1.  **Cài đặt Dependencies:**
    Trong thư mục `backend`, chạy lệnh:
    ```bash
    npm install
    ```
2.  **Tạo file `.env`:**
    Trong thư mục `backend`, tạo một file có tên là `.env` và thêm các biến môi trường sau, thay thế các giá trị bằng thông tin kết nối cơ sở dữ liệu của bạn:

    ```env
    DB_HOST=your_database_host
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_NAME=your_database_name
    PORT=3001
    ```

3.  **Chạy Backend Server:**
    Vẫn trong thư mục `backend`, chạy lệnh:
    ```bash
    npm start
    ```
    Server backend sẽ khởi động trên cổng 3001 (hoặc cổng bạn đã chỉ định trong file `.env`).

## Thiết lập Frontend

1.  **Cài đặt Dependencies:**
    Trong thư mục gốc của dự án (nơi có file `package.json`), chạy lệnh:
    ```bash
    npm install
    ```
2.  **Tạo file `.env`:**
    Trong thư mục gốc của dự án, tạo một file `.env` và thêm khóa API Gemini của bạn:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key
    ```
3.  **Chạy Frontend Development Server:**
    Vẫn trong thư mục gốc, chạy lệnh:
    ```bash
    npm run dev
    ```
    Ứng dụng sẽ có thể truy cập tại `http://localhost:3000` (hoặc cổng khác nếu 3000 đã được sử dụng). Frontend sẽ tự động proxy các yêu cầu `/api` đến backend server đang chạy trên cổng 3001.

## Đăng nhập quản trị

Để truy cập vào trang quản trị, sử dụng thông tin đăng nhập mặc định:
*   **Email:** `quangtmdit@gmail.com`
*   **Password:** `password123`

Sau khi đăng nhập, truy cập vào đường dẫn `/admin` để vào trang quản trị.

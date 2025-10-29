const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
// Railway hoặc Hostinger sẽ cung cấp biến PORT. Nếu không có, dùng cổng 3001 cho local.
const port = process.env.PORT || 3001; 

// Kích hoạt CORS để React App (chạy ở cổng khác) có thể gọi API
app.use(cors());
app.use(express.json());

/*
-- HƯỚNG DẪN CÀI ĐẶT DATABASE MYSQL --
1. Hãy chắc chắn rằng bạn đã cài đặt MySQL Server.
2. Tạo một database mới, ví dụ: CREATE DATABASE iq_technology_db;
3. Chạy câu lệnh SQL dưới đây để tạo bảng 'products':

CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mainCategory VARCHAR(255),
    subCategory VARCHAR(255),
    category VARCHAR(255),
    price DECIMAL(10, 0) NOT NULL,
    originalPrice DECIMAL(10, 0),
    imageUrls JSON, -- Lưu dưới dạng mảng JSON: '["url1", "url2"]'
    description TEXT,
    shortDescription TEXT,
    specifications JSON, -- Lưu dưới dạng đối tượng JSON: '{"CPU": "Intel Core i5", "RAM": "16GB"}'
    stock INT NOT NULL,
    status VARCHAR(50),
    rating FLOAT,
    reviews INT,
    brand VARCHAR(255),
    tags JSON, -- Lưu dưới dạng mảng JSON: '["tag1", "tag2"]'
    brandLogoUrl VARCHAR(255),
    isVisible BOOLEAN DEFAULT TRUE,
    seoMetaTitle VARCHAR(255),
    seoMetaDescription TEXT,
    slug VARCHAR(255) UNIQUE
);

4. Chạy câu lệnh SQL dưới đây để tạo bảng 'orders':
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    customerInfo JSON NOT NULL, -- { fullName, phone, address, email, notes }
    items JSON NOT NULL, -- [{ productId, productName, quantity, price }]
    totalAmount DECIMAL(12, 0) NOT NULL,
    orderDate DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'Chờ xử lý', 'Đang chuẩn bị', 'Đang giao', 'Hoàn thành', 'Đã hủy'
    shippingInfo JSON, -- { carrier, trackingNumber, shippingStatus }
    paymentInfo JSON NOT NULL -- { method, status, transactionId, amountToPay }
);

5. Thêm một vài dữ liệu mẫu vào bảng 'products'.
*/


// --- CẤU HÌNH KẾT NỐI MYSQL ---
// Đọc thông tin kết nối từ các biến môi trường.
// Các biến môi trường này cần được thiết lập trên server hosting của bạn (ví dụ: Hostinger, Railway).
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  port: process.env.MYSQLPORT || 3306
};

// Kiểm tra các biến môi trường cần thiết
if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    console.error('FATAL ERROR: Database configuration is missing. Please set MYSQLHOST/DB_HOST, MYSQLUSER/DB_USER, MYSQLPASSWORD/DB_PASSWORD, and MYSQLDATABASE/DB_NAME environment variables.');
    process.exit(1);
}


let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('Đã tạo kết nối MySQL pool thành công.');
} catch (error) {
    console.error('Lỗi khi tạo kết nối MySQL pool:', error);
    process.exit(1); // Thoát ứng dụng nếu không thể tạo pool
}

// --- HELPERS FOR JSON FIELDS ---

// PRODUCTS
const parseJsonFields = (product) => {
    try {
        if (product.imageUrls && typeof product.imageUrls === 'string') product.imageUrls = JSON.parse(product.imageUrls);
        if (product.specifications && typeof product.specifications === 'string') product.specifications = JSON.parse(product.specifications);
        if (product.tags && typeof product.tags === 'string') product.tags = JSON.parse(product.tags);
    } catch (e) {
        console.error(`Lỗi khi phân tích JSON cho sản phẩm ID ${product.id}:`, e);
        if (typeof product.imageUrls !== 'object' || product.imageUrls === null) product.imageUrls = [];
        if (typeof product.specifications !== 'object' || product.specifications === null) product.specifications = {};
        if (typeof product.tags !== 'object' || product.tags === null) product.tags = [];
    }
    return product;
}
const prepareProductForDb = (product) => {
    const dbProduct = { ...product };
    if (Array.isArray(dbProduct.imageUrls)) dbProduct.imageUrls = JSON.stringify(dbProduct.imageUrls);
    if (typeof dbProduct.specifications === 'object' && dbProduct.specifications !== null) dbProduct.specifications = JSON.stringify(dbProduct.specifications);
    if (Array.isArray(dbProduct.tags)) dbProduct.tags = JSON.stringify(dbProduct.tags);
    return dbProduct;
};

// ORDERS
const parseOrderJsonFields = (order) => {
    try {
        if (order.customerInfo && typeof order.customerInfo === 'string') order.customerInfo = JSON.parse(order.customerInfo);
        if (order.items && typeof order.items === 'string') order.items = JSON.parse(order.items);
        if (order.shippingInfo && typeof order.shippingInfo === 'string') order.shippingInfo = JSON.parse(order.shippingInfo);
        if (order.paymentInfo && typeof order.paymentInfo === 'string') order.paymentInfo = JSON.parse(order.paymentInfo);
    } catch (e) {
        console.error(`Lỗi khi phân tích JSON cho đơn hàng ID ${order.id}:`, e);
    }
    return order;
};
const prepareOrderForDb = (order) => {
    const dbOrder = { ...order };
    if (typeof dbOrder.customerInfo === 'object') dbOrder.customerInfo = JSON.stringify(dbOrder.customerInfo);
    if (Array.isArray(dbOrder.items)) dbOrder.items = JSON.stringify(dbOrder.items);
    if (typeof dbOrder.shippingInfo === 'object' && dbOrder.shippingInfo !== null) dbOrder.shippingInfo = JSON.stringify(dbOrder.shippingInfo);
    if (typeof dbOrder.paymentInfo === 'object') dbOrder.paymentInfo = JSON.stringify(dbOrder.paymentInfo);
    return dbOrder;
};

// Share category hierarchy with backend for slug mapping
const PRODUCT_CATEGORIES_HIERARCHY = [
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

const MOCK_SERVICES = [
  { id: 'svc001', name: 'Thiết Kế & Phát Triển Web Chuyên Nghiệp', description: 'Chúng tôi cung cấp giải pháp website toàn diện, từ thiết kế UX/UI hiện đại, trực quan đến phát triển frontend & backend mạnh mẽ, đảm bảo tối ưu hóa SEO và mang lại trải nghiệm người dùng vượt trội.', icon: 'fas fa-laptop-code', imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1770&auto=format&fit=crop', slug: 'thiet-ke-phat-trien-web' },
  { id: 'svc002', name: 'Quản Trị Hệ Thống Mạng Doanh Nghiệp', description: 'Dịch vụ quản trị, giám sát và bảo trì hệ thống mạng chuyên nghiệp cho doanh nghiệp. Đảm bảo hệ thống của bạn hoạt động ổn định, an toàn, hiệu quả với hiệu suất tối đa.', icon: 'fas fa-network-wired', imageUrl: 'https://images.unsplash.com/photo-1587135304381-e3f43845b4ca?q=80&w=1770&auto=format&fit=crop', slug: 'quan-tri-he-thong-mang'},
  { id: 'svc003', name: 'Giải Pháp Lưu Trữ & Sao Lưu Đám Mây', description: 'Tư vấn và triển khai các giải pháp lưu trữ đám mây (Cloud Storage) và sao lưu dữ liệu (Cloud Backup) linh hoạt, an toàn và tiết kiệm chi phí cho cá nhân và doanh nghiệp.', icon: 'fas fa-cloud-upload-alt', imageUrl: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=1770&auto=format&fit=crop', slug: 'luu-tru-sao-luu-dam-may' },
  { id: 'svc004', name: 'Hỗ Trợ Kỹ Thuật Từ Xa Nhanh Chóng', description: 'Đội ngũ kỹ thuật viên chuyên nghiệp của chúng tôi sẵn sàng giải quyết nhanh chóng các sự cố máy tính, phần mềm qua TeamViewer, UltraViewer, đảm bảo công việc của bạn không bị gián đoạn.', icon: 'fas fa-headset', imageUrl: 'https://images.unsplash.com/photo-1616587894285-3d17c752531a?q=80&w=1770&auto=format&fit=crop', slug: 'ho-tro-ky-thuat-tu-xa'},
  { id: 'svc005', name: 'Tư Vấn & Triển Khai Chuyển Đổi Số', description: 'Đánh giá toàn diện hiện trạng công nghệ và tư vấn lộ trình chuyển đổi số tối ưu, giúp doanh nghiệp của bạn tự động hóa quy trình, nâng cao năng lực cạnh tranh và phát triển bền vững.', icon: 'fas fa-project-diagram', imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1774&auto=format&fit=crop', slug: 'tu-van-chuyen-doi-so' },
  { id: 'svc006', name: 'Bảo Mật Hệ Thống & An Toàn Dữ Liệu', description: 'Dịch vụ kiểm tra, đánh giá lỗ hổng và triển khai các giải pháp bảo mật tiên tiến. Phòng chống hiệu quả virus, mã độc, tấn công mạng, bảo vệ an toàn tuyệt đối cho dữ liệu quan trọng.', icon: 'fas fa-shield-alt', imageUrl: 'https://images.unsplash.com/photo-1558006511-aa7131a44e53?q=80&w=1770&auto=format&fit=crop', slug: 'bao-mat-he-thong-du-lieu' },
];


// --- PRODUCTS API ENDPOINTS ---

app.get('/api/products', async (req, res) => {
  try {
    const { q, mainCategory, subCategory, brand, status, tags, page = 1, limit = 12 } = req.query;

    let whereClauses = ["isVisible = TRUE"];
    const params = [];

    if (q) {
        whereClauses.push("(name LIKE ? OR brand LIKE ? OR description LIKE ? OR tags LIKE ?)");
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (mainCategory) {
        const mainCatInfo = PRODUCT_CATEGORIES_HIERARCHY.find(c => c.slug === mainCategory || c.name === mainCategory);
        if (mainCatInfo) {
            whereClauses.push("mainCategory = ?");
            params.push(mainCatInfo.name);

            // Nested subcategory check for accuracy
            if (subCategory) {
                const subCatInfo = mainCatInfo.subCategories.find(sc => sc.slug === subCategory || sc.name === subCategory);
                if (subCatInfo) {
                    whereClauses.push("subCategory = ?");
                    params.push(subCatInfo.name);
                }
            }
        }
    } else if (subCategory) { // Handle subcategory search without main category
        let subCatName = null;
        for (const mainCat of PRODUCT_CATEGORIES_HIERARCHY) {
            const subCatInfo = mainCat.subCategories.find(sc => sc.slug === subCategory || sc.name === subCategory);
            if (subCatInfo) {
                subCatName = subCatInfo.name;
                break;
            }
        }
        if (subCatName) {
            whereClauses.push("subCategory = ?");
            params.push(subCatName);
        }
    }

    if (brand) {
        whereClauses.push("brand = ?");
        params.push(brand);
    }
    if (status) {
        whereClauses.push("status = ?");
        params.push(status);
    }
    if (tags) {
      whereClauses.push("tags LIKE ?");
      params.push(`%"${tags}"%`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Query for total count
    const countQuery = `SELECT COUNT(*) as total FROM products ${whereString}`;
    const [countRows] = await pool.query(countQuery, params);
    const totalProducts = countRows[0].total;

    // Query for paginated data
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    const dataQuery = `SELECT * FROM products ${whereString} ORDER BY id DESC LIMIT ? OFFSET ?`;
    const dataParams = [...params, limitNum, offset];

    const [rows] = await pool.query(dataQuery, dataParams);
    const products = rows.map(parseJsonFields);

    res.json({ products, totalProducts });
  } catch (err) {
    console.error("Lỗi khi truy vấn sản phẩm:", err);
    res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu sản phẩm.' });
  }
});

app.get('/api/products/featured', async (req, res) => {
    try {
        // Using LIKE instead of JSON_CONTAINS for robustness, in case the 'tags' column is not a valid JSON type in the database.
        // This is less efficient but safer against potential server crashes from SQL errors.
        const query = `
            SELECT * FROM products
            WHERE isVisible = TRUE
            AND (
                tags LIKE ? 
                OR (originalPrice IS NOT NULL AND price < originalPrice)
            )
            ORDER BY id DESC
            LIMIT 8
        `;
        const params = ['%"Bán chạy"%'];
        
        const [rows] = await pool.query(query, params);
        
        const products = rows.map(parseJsonFields);

        res.json(products);
    } catch (err) {
        console.error("Lỗi khi truy vấn sản phẩm nổi bật (v4 - using LIKE):", err);
        res.status(500).json({ error: 'Lỗi server khi lấy sản phẩm nổi bật.' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [productId]);
        if (rows.length > 0) {
            const product = parseJsonFields(rows[0]);
            res.json(product);
        } else {
            res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
        }
    } catch (err) {
        console.error(`Lỗi khi truy vấn sản phẩm ID ${productId}:`, err);
        res.status(500).json({ error: 'Lỗi server.' });
    }
});

app.post('/api/products', async (req, res) => {
    const newProductData = req.body;
    const productForDb = prepareProductForDb(newProductData);
    try {
        await pool.query("INSERT INTO products SET ?", [productForDb]);
        const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [productForDb.id]);
        res.status(201).json(parseJsonFields(rows[0]));
    } catch (err) {
        console.error("Lỗi khi tạo sản phẩm:", err);
        res.status(500).json({ error: 'Lỗi server khi tạo sản phẩm.' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    const updatedProductData = req.body;
    delete updatedProductData.id; 
    const productForDb = prepareProductForDb(updatedProductData);
    try {
        const [result] = await pool.query("UPDATE products SET ? WHERE id = ?", [productForDb, productId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm để cập nhật.' });
        }
        const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [productId]);
        res.json(parseJsonFields(rows[0]));
    } catch (err) {
        console.error(`Lỗi khi cập nhật sản phẩm ID ${productId}:`, err);
        res.status(500).json({ error: 'Lỗi server khi cập nhật sản phẩm.' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const [result] = await pool.query("DELETE FROM products WHERE id = ?", [productId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm để xóa.' });
        }
        res.status(200).json({ message: 'Sản phẩm đã được xóa thành công.' });
    } catch (err) {
        console.error(`Lỗi khi xóa sản phẩm ID ${productId}:`, err);
        res.status(500).json({ error: 'Lỗi server khi xóa sản phẩm.' });
    }
});


// --- SERVICES API ENDPOINTS ---
app.get('/api/services/search', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.json(MOCK_SERVICES.slice(0, 3)); // Return a few if no query
  }
  const lowerQuery = query.toLowerCase();
  const results = MOCK_SERVICES.filter(s => 
    s.name.toLowerCase().includes(lowerQuery) || 
    s.description.toLowerCase().includes(lowerQuery)
  );
  res.json(results);
});


// --- ORDERS API ENDPOINTS ---

// GET all orders
app.get('/api/orders', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM orders ORDER BY orderDate DESC");
        const orders = rows.map(parseOrderJsonFields);
        res.json(orders);
    } catch (err) {
        console.error("Lỗi khi truy vấn đơn hàng:", err);
        res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu đơn hàng.' });
    }
});

// POST a new order
app.post('/api/orders', async (req, res) => {
    const newOrderData = req.body;
    // Đảm bảo orderDate là đối tượng Date hợp lệ của SQL
    newOrderData.orderDate = new Date(newOrderData.orderDate);

    const orderForDb = prepareOrderForDb(newOrderData);
    try {
        await pool.query("INSERT INTO orders SET ?", [orderForDb]);
        const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [newOrderData.id]);
        res.status(201).json(parseOrderJsonFields(rows[0]));
    } catch (err) {
        console.error("Lỗi khi tạo đơn hàng:", err);
        res.status(500).json({ error: 'Lỗi server khi tạo đơn hàng.' });
    }
});

// PUT to update an order's status
app.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Trạng thái mới là bắt buộc.' });
    }

    try {
        const [result] = await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng để cập nhật.' });
        }
        const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
        res.json(parseOrderJsonFields(rows[0]));
    } catch (err) {
        console.error(`Lỗi khi cập nhật trạng thái đơn hàng ID ${id}:`, err);
        res.status(500).json({ error: 'Lỗi server khi cập nhật trạng thái.' });
    }
});


// Khởi động server
app.listen(port, () => {
  console.log(`Backend server đang chạy tại http://localhost:${port}`);
});
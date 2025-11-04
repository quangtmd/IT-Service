const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
// Railway hoặc Hostinger sẽ cung cấp biến PORT. Nếu không có, dùng cổng 3001 cho local.
const port = process.env.PORT || 3001; 

// Kích hoạt CORS để React App (chạy ở cổng khác) có thể gọi API
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for potential base64 images

/*
-- HƯỚNG DẪN CÀI ĐẶT DATABASE MYSQL --
1. Hãy chắc chắn rằng bạn đã cài đặt MySQL Server.
2. Tạo một database mới, ví dụ: CREATE DATABASE iq_technology_db;
3. Chạy các câu lệnh SQL dưới đây để tạo bảng cần thiết:

CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mainCategory VARCHAR(255),
    subCategory VARCHAR(255),
    category VARCHAR(255),
    price DECIMAL(12, 0) NOT NULL,
    originalPrice DECIMAL(12, 0),
    imageUrls JSON,
    description TEXT,
    shortDescription TEXT,
    specifications JSON,
    stock INT NOT NULL,
    status VARCHAR(50),
    rating FLOAT,
    reviews INT,
    brand VARCHAR(255),
    tags JSON,
    brandLogoUrl VARCHAR(255),
    isVisible BOOLEAN DEFAULT TRUE,
    seoMetaTitle VARCHAR(255),
    seoMetaDescription TEXT,
    slug VARCHAR(255) UNIQUE
);

CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    customerInfo JSON NOT NULL,
    items JSON NOT NULL,
    totalAmount DECIMAL(12, 0) NOT NULL,
    orderDate DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL,
    shippingInfo JSON,
    paymentInfo JSON NOT NULL
);

CREATE TABLE articles (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    imageUrl TEXT,
    author VARCHAR(255),
    date DATETIME NOT NULL,
    category VARCHAR(255),
    content TEXT,
    isAIGenerated BOOLEAN DEFAULT FALSE,
    imageSearchQuery VARCHAR(255)
);

CREATE TABLE mediaLibrary (
    id VARCHAR(255) PRIMARY KEY,
    url LONGTEXT NOT NULL,
    name VARCHAR(255),
    type VARCHAR(100),
    uploadedAt DATETIME NOT NULL
);

*/


// --- CẤU HÌNH KẾT NỐI MYSQL ---
// Đọc thông tin kết nối từ các biến môi trường (ưu tiên) hoặc dùng giá trị fallback.
// Các biến môi trường này cần được thiết lập trên server hosting của bạn (ví dụ: Hostinger, Railway).
const dbConfig = {
  host: process.env.DB_HOST || '194.59.164.14',
  user: process.env.DB_USER || 'u573621538_IT',
  password: process.env.DB_PASSWORD || 'Aaa0908225224',
  database: process.env.DB_NAME || 'u573621538_Itservice',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};


let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('Đã tạo kết nối MySQL pool thành công.');
} catch (error) {
    console.error('Lỗi khi tạo kết nối MySQL pool:', error);
    process.exit(1); // Thoát ứng dụng nếu không thể tạo pool
}

// --- JSON PARSING HELPERS ---
const parseJsonFields = (item, fields) => {
    const newItem = { ...item };
    for (const field of fields) {
        try {
            if (newItem[field] && typeof newItem[field] === 'string') {
                newItem[field] = JSON.parse(newItem[field]);
            }
        } catch (e) {
            console.error(`Lỗi khi phân tích JSON cho trường ${field} của item ID ${newItem.id}:`, e);
             if (['imageUrls', 'tags', 'items'].includes(field)) {
                newItem[field] = [];
            } else {
                newItem[field] = {};
            }
        }
    }
    return newItem;
};

const prepareJsonFieldsForDb = (item, fields) => {
    const dbItem = { ...item };
    for (const field of fields) {
        if (typeof dbItem[field] === 'object' && dbItem[field] !== null) {
            dbItem[field] = JSON.stringify(dbItem[field]);
        }
    }
    return dbItem;
};

const PRODUCT_JSON_FIELDS = ['imageUrls', 'specifications', 'tags'];
const ORDER_JSON_FIELDS = ['customerInfo', 'items', 'shippingInfo', 'paymentInfo'];

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


// --- PRODUCTS API ENDPOINTS ---

app.get('/api/products', async (req, res) => {
  try {
    const getCategoryNameFromSlug_Backend = (slug, type) => {
        if (type === 'main') {
            const mainCat = PRODUCT_CATEGORIES_HIERARCHY.find(c => c.slug === slug);
            return mainCat ? mainCat.name : null;
        }
        if (type === 'sub') {
            for (const mainCat of PRODUCT_CATEGORIES_HIERARCHY) {
                const subCat = mainCat.subCategories.find(sc => sc.slug === slug);
                if (subCat) return subCat.name;
            }
            return null;
        }
        return null;
    };

    const { q, mainCategory, subCategory, brand, status, tags, page = 1, limit = 12 } = req.query;

    let whereClauses = ["isVisible = TRUE"];
    const params = [];

    if (q) {
        whereClauses.push("(name LIKE ? OR brand LIKE ? OR description LIKE ? OR JSON_SEARCH(tags, 'one', ?) IS NOT NULL)");
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (mainCategory) {
        const mainCategoryName = getCategoryNameFromSlug_Backend(mainCategory, 'main');
        if (mainCategoryName) {
            whereClauses.push("mainCategory = ?");
            params.push(mainCategoryName);
        }
    }
    if (subCategory) {
        const subCategoryName = getCategoryNameFromSlug_Backend(subCategory, 'sub');
        if (subCategoryName) {
            whereClauses.push("subCategory = ?");
            params.push(subCategoryName);
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
      whereClauses.push("JSON_CONTAINS(tags, JSON_QUOTE(?))");
      params.push(tags);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM products ${whereString}`;
    const [countRows] = await pool.query(countQuery, params);
    const totalProducts = countRows[0].total;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    const dataQuery = `SELECT * FROM products ${whereString} ORDER BY id DESC LIMIT ? OFFSET ?`;
    const dataParams = [...params, limitNum, offset];

    const [rows] = await pool.query(dataQuery, dataParams);
    const products = rows.map(p => parseJsonFields(p, PRODUCT_JSON_FIELDS));

    res.json({ products, totalProducts });
  } catch (err) {
    console.error("Lỗi khi truy vấn sản phẩm:", err);
    res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu sản phẩm.' });
  }
});

app.get('/api/products/featured', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            (SELECT * FROM products WHERE isVisible = TRUE AND JSON_CONTAINS(tags, '["Bán chạy"]'))
            UNION
            (SELECT * FROM products WHERE isVisible = TRUE AND originalPrice IS NOT NULL AND id NOT IN (SELECT id FROM products WHERE JSON_CONTAINS(tags, '["Bán chạy"]')))
            LIMIT 4
        `);
        const products = rows.map(p => parseJsonFields(p, PRODUCT_JSON_FIELDS));
        res.json(products);
    } catch (err) {
        console.error("Lỗi khi truy vấn sản phẩm nổi bật:", err);
        res.status(500).json({ error: 'Lỗi server.' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
        if (rows.length > 0) {
            res.json(parseJsonFields(rows[0], PRODUCT_JSON_FIELDS));
        } else {
            res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        await pool.query("INSERT INTO products SET ?", [prepareJsonFieldsForDb(req.body, PRODUCT_JSON_FIELDS)]);
        const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.body.id]);
        res.status(201).json(parseJsonFields(rows[0], PRODUCT_JSON_FIELDS));
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi tạo sản phẩm.' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const productForDb = prepareJsonFieldsForDb(req.body, PRODUCT_JSON_FIELDS);
        delete productForDb.id;
        const [result] = await pool.query("UPDATE products SET ? WHERE id = ?", [productForDb, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
        const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
        res.json(parseJsonFields(rows[0], PRODUCT_JSON_FIELDS));
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi cập nhật sản phẩm.' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
        res.status(200).json({ message: 'Sản phẩm đã được xóa.' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi xóa sản phẩm.' });
    }
});


// --- ORDERS API ENDPOINTS ---

app.get('/api/orders', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM orders ORDER BY orderDate DESC");
        res.json(rows.map(o => parseJsonFields(o, ORDER_JSON_FIELDS)));
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi lấy đơn hàng.' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = { ...req.body, orderDate: new Date(req.body.orderDate) };
        await pool.query("INSERT INTO orders SET ?", [prepareJsonFieldsForDb(newOrder, ORDER_JSON_FIELDS)]);
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi tạo đơn hàng.' });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const [result] = await pool.query("UPDATE orders SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
        res.json({ message: 'Cập nhật trạng thái thành công.' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi cập nhật trạng thái.' });
    }
});


// --- ARTICLES API ENDPOINTS ---

app.get('/api/articles', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM articles ORDER BY date DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi lấy bài viết.' });
    }
});

app.get('/api/articles/:id', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM articles WHERE id = ?", [req.params.id]);
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});

app.post('/api/articles', async (req, res) => {
    try {
        const newArticle = { ...req.body, date: new Date(req.body.date) };
        await pool.query("INSERT INTO articles SET ?", [newArticle]);
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi tạo bài viết.' });
    }
});

app.put('/api/articles/:id', async (req, res) => {
    try {
        const articleData = { ...req.body };
        delete articleData.id;
        const [result] = await pool.query("UPDATE articles SET ? WHERE id = ?", [articleData, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
        res.json({ id: req.params.id, ...articleData });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi cập nhật bài viết.' });
    }
});

app.delete('/api/articles/:id', async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM articles WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
        res.status(200).json({ message: 'Bài viết đã được xóa.' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi xóa bài viết.' });
    }
});

// --- MEDIA LIBRARY API ENDPOINTS ---

app.get('/api/media-library', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM mediaLibrary ORDER BY uploadedAt DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi lấy media.' });
    }
});

app.post('/api/media-library', async (req, res) => {
    try {
        const newItem = { ...req.body, uploadedAt: new Date(req.body.uploadedAt) };
        await pool.query("INSERT INTO mediaLibrary SET ?", [newItem]);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi thêm media.' });
    }
});

app.delete('/api/media-library/:id', async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM mediaLibrary WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy media.' });
        res.status(200).json({ message: 'Media đã được xóa.' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi xóa media.' });
    }
});


// Khởi động server
app.listen(port, () => {
  console.log(`Backend server đang chạy tại http://localhost:${port}`);
});

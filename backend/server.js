const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
// Railway sẽ cung cấp biến PORT. Nếu không có, dùng cổng 3001 cho local.
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
    price DECIMAL(10, 2) NOT NULL,
    originalPrice DECIMAL(10, 2),
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

4. Thêm một vài dữ liệu mẫu vào bảng 'products'.
*/


// --- CẤU HÌNH KẾT NỐI MYSQL ---
// Đọc thông tin kết nối từ các biến môi trường mà Railway cung cấp
// Sẽ tự động dùng các biến này khi được deploy trên Railway.
const dbConfig = {
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'your_password', // Thay 'your_password' bằng mật khẩu local của bạn
  database: process.env.MYSQLDATABASE || 'iq_technology_db', // Thay 'iq_technology_db' bằng tên DB local của bạn
  port: process.env.MYSQLPORT || 3306
};

let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('Đã tạo kết nối MySQL pool thành công.');
} catch (error) {
    console.error('Lỗi khi tạo kết nối MySQL pool:', error);
    process.exit(1); // Thoát ứng dụng nếu không thể tạo pool
}

// Hàm trợ giúp để xử lý các trường JSON
const parseJsonFields = (product) => {
    try {
        if (product.imageUrls && typeof product.imageUrls === 'string') product.imageUrls = JSON.parse(product.imageUrls);
        if (product.specifications && typeof product.specifications === 'string') product.specifications = JSON.parse(product.specifications);
        if (product.tags && typeof product.tags === 'string') product.tags = JSON.parse(product.tags);
    } catch (e) {
        console.error(`Lỗi khi phân tích JSON cho sản phẩm ID ${product.id}:`, e);
        // Đặt giá trị mặc định để tránh lỗi ở frontend
        if (typeof product.imageUrls !== 'object' || product.imageUrls === null) product.imageUrls = [];
        if (typeof product.specifications !== 'object' || product.specifications === null) product.specifications = {};
        if (typeof product.tags !== 'object' || product.tags === null) product.tags = [];
    }
    return product;
}

// --- TẠO CÁC ĐƯỜNG DẪN API (ENDPOINTS) ---

// API để lấy TẤT CẢ sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE isVisible = TRUE");
    const products = rows.map(parseJsonFields);
    res.json(products);
  } catch (err) {
    console.error("Lỗi khi truy vấn sản phẩm:", err);
    res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu sản phẩm.' });
  }
});

// API để lấy các sản phẩm NỔI BẬT (ví dụ: có tag 'Bán chạy' hoặc có khuyến mãi)
app.get('/api/products/featured', async (req, res) => {
    try {
        // Ưu tiên sản phẩm có tag 'Bán chạy', nếu không đủ thì lấy sản phẩm có khuyến mãi
        const [rows] = await pool.query(`
            (SELECT * FROM products WHERE isVisible = TRUE AND JSON_CONTAINS(tags, '["Bán chạy"]'))
            UNION
            (SELECT * FROM products WHERE isVisible = TRUE AND originalPrice IS NOT NULL AND id NOT IN (SELECT id FROM products WHERE JSON_CONTAINS(tags, '["Bán chạy"]')))
            LIMIT 4
        `);
        const products = rows.map(parseJsonFields);
        res.json(products);
    } catch (err) {
        console.error("Lỗi khi truy vấn sản phẩm nổi bật:", err);
        res.status(500).json({ error: 'Lỗi server.' });
    }
});


// API để lấy MỘT sản phẩm theo ID
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


// Khởi động server
app.listen(port, () => {
  console.log(`Backend server đang chạy tại http://localhost:${port}`);
});

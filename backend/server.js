const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000; // Use Render's port, fallback to 10000

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Tăng giới hạn payload cho media

/*
-- HƯỚNG DẪN CÀI ĐẶT DATABASE MYSQL --
1.  Tạo một database mới, ví dụ: `CREATE DATABASE iq_technology_db;`
2.  Chạy LẦN LƯỢT các câu lệnh SQL dưới đây để tạo tất cả các bảng cần thiết.

-- Bảng Sản phẩm --
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL, mainCategory VARCHAR(255), subCategory VARCHAR(255),
    category VARCHAR(255), price DECIMAL(12, 0) NOT NULL, originalPrice DECIMAL(12, 0), imageUrls JSON,
    description TEXT, shortDescription TEXT, specifications JSON, stock INT NOT NULL, status VARCHAR(50),
    rating FLOAT, reviews INT, brand VARCHAR(255), tags JSON, brandLogoUrl VARCHAR(255),
    isVisible BOOLEAN DEFAULT TRUE, seoMetaTitle VARCHAR(255), seoMetaDescription TEXT, slug VARCHAR(255) UNIQUE
);

-- Bảng Đơn hàng --
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY, customerInfo JSON NOT NULL, items JSON NOT NULL, totalAmount DECIMAL(12, 0) NOT NULL,
    orderDate DATETIME NOT NULL, status VARCHAR(50) NOT NULL, shippingInfo JSON, paymentInfo JSON NOT NULL
);

-- Bảng Bài viết --
CREATE TABLE articles (
    id VARCHAR(255) PRIMARY KEY, title VARCHAR(255) NOT NULL, summary TEXT, imageUrl TEXT,
    author VARCHAR(255), date DATETIME NOT NULL, category VARCHAR(255), content LONGTEXT,
    isAIGenerated BOOLEAN DEFAULT FALSE, imageSearchQuery VARCHAR(255)
);

-- Bảng Thư viện Media --
CREATE TABLE media_library (
    id VARCHAR(255) PRIMARY KEY, url LONGTEXT NOT NULL, name VARCHAR(255), type VARCHAR(100), uploadedAt DATETIME NOT NULL
);

-- Bảng FAQs --
CREATE TABLE faqs (
    id VARCHAR(255) PRIMARY KEY, question TEXT NOT NULL, answer TEXT, category VARCHAR(100), isVisible BOOLEAN DEFAULT TRUE
);

-- Bảng Mã giảm giá --
CREATE TABLE discount_codes (
    id VARCHAR(255) PRIMARY KEY, code VARCHAR(100) NOT NULL UNIQUE, type VARCHAR(50) NOT NULL, value DECIMAL(10, 2) NOT NULL,
    description TEXT, expiryDate DATE, isActive BOOLEAN DEFAULT TRUE, minSpend DECIMAL(12, 0),
    usageLimit INT, timesUsed INT DEFAULT 0
);

-- Bảng Cài đặt Trang --
CREATE TABLE site_settings (
    settingKey VARCHAR(255) PRIMARY KEY, settingValue JSON
);
*/


const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'iq_technology_db',
  port: process.env.MYSQLPORT || 3306,
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
    process.exit(1);
}

// --- HELPERS FOR JSON FIELDS ---
const parseJsonFields = (obj, fields) => {
    if (!obj) return obj;
    for (const field of fields) {
        try {
            if (obj[field] && typeof obj[field] === 'string') {
                obj[field] = JSON.parse(obj[field]);
            }
        } catch (e) {
            console.error(`Lỗi khi phân tích JSON cho trường ${field} của ID ${obj.id}:`, e);
            obj[field] = Array.isArray(obj[field]) ? [] : {};
        }
    }
    return obj;
};

const prepareForDb = (obj, fields) => {
    const dbObj = { ...obj };
    for (const field of fields) {
        if (typeof dbObj[field] === 'object' && dbObj[field] !== null) {
            dbObj[field] = JSON.stringify(dbObj[field]);
        }
    }
    return dbObj;
};

// Generic CRUD handlers
const createApiEndpoints = (tableName, jsonFields = []) => {
    app.get(`/api/${tableName}`, async (req, res) => {
        try {
            const [rows] = await pool.query(`SELECT * FROM ${tableName}`);
            res.json(rows.map(row => parseJsonFields(row, jsonFields)));
        } catch (err) {
            res.status(500).json({ error: `Lỗi server khi lấy dữ liệu ${tableName}.` });
        }
    });

    app.post(`/api/${tableName}`, async (req, res) => {
        const newItem = req.body;
        if (!newItem.id) newItem.id = `${tableName.slice(0, 4)}-${Date.now()}`;
        try {
            await pool.query(`INSERT INTO ${tableName} SET ?`, [prepareForDb(newItem, jsonFields)]);
            res.status(201).json(newItem);
        } catch (err) {
             res.status(500).json({ error: `Lỗi server khi tạo ${tableName}: ${err.message}` });
        }
    });

    app.put(`/api/${tableName}/:id`, async (req, res) => {
        const { id } = req.params;
        const updates = req.body;
        delete updates.id;
        try {
            const [result] = await pool.query(`UPDATE ${tableName} SET ? WHERE id = ?`, [prepareForDb(updates, jsonFields), id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy đối tượng để cập nhật.' });
            res.json({ id, ...updates });
        } catch (err) {
            res.status(500).json({ error: `Lỗi server khi cập nhật ${tableName}: ${err.message}` });
        }
    });

    app.delete(`/api/${tableName}/:id`, async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy đối tượng để xóa.' });
            res.status(200).json({ message: 'Đã xóa thành công.' });
        } catch (err) {
            res.status(500).json({ error: `Lỗi server khi xóa ${tableName}.` });
        }
    });
};


// --- PRODUCTS API (Custom implementation for filtering) ---

app.get('/api/products', async (req, res) => {
  try {
    const { q, mainCategory, subCategory, brand, status, tags, page = 1, limit = 12 } = req.query;
    let whereClauses = ["isVisible = TRUE"];
    const params = [];

    if (q) {
        whereClauses.push("(name LIKE ? OR brand LIKE ? OR description LIKE ? OR JSON_SEARCH(tags, 'one', ?) IS NOT NULL)");
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (mainCategory) {
        whereClauses.push("mainCategory = ?");
        params.push(mainCategory);
    }
    if (subCategory) {
        whereClauses.push("subCategory = ?");
        params.push(subCategory);
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
    const products = rows.map(p => parseJsonFields(p, ['imageUrls', 'specifications', 'tags']));
    res.json({ products, totalProducts });

  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu sản phẩm.' });
  }
});

app.get('/api/products/featured', async (req, res) => {
    try {
        const query = `SELECT * FROM products WHERE isVisible = TRUE AND JSON_CONTAINS(tags, JSON_QUOTE('Bán chạy')) LIMIT 8`;
        const [rows] = await pool.query(query);
        res.json(rows.map(p => parseJsonFields(p, ['imageUrls', 'specifications', 'tags'])));
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi lấy sản phẩm nổi bật.' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
        if (rows.length > 0) {
            res.json(parseJsonFields(rows[0], ['imageUrls', 'specifications', 'tags']));
        } else {
            res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
createApiEndpoints('products', ['imageUrls', 'specifications', 'tags']);


// --- ORDERS API (Custom implementation) ---
createApiEndpoints('orders', ['customerInfo', 'items', 'shippingInfo', 'paymentInfo']);
app.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Trạng thái mới là bắt buộc.' });
    try {
        await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: 'Cập nhật trạng thái thành công.' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi cập nhật trạng thái.' });
    }
});

// --- Generic CRUD for other tables ---
createApiEndpoints('articles');
createApiEndpoints('media_library');
createApiEndpoints('faqs');
createApiEndpoints('discount_codes');

// --- Site Settings API (Special case) ---
app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM site_settings");
        const settings = rows.reduce((acc, row) => {
            acc[row.settingKey] = parseJsonFields(row, ['settingValue']).settingValue;
            return acc;
        }, {});
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi lấy cài đặt.' });
    }
});

app.post('/api/settings', async (req, res) => {
    const settings = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        for (const [key, value] of Object.entries(settings)) {
            const query = `INSERT INTO site_settings (settingKey, settingValue) VALUES (?, ?) ON DUPLICATE KEY UPDATE settingValue = ?`;
            const stringValue = JSON.stringify(value);
            await connection.query(query, [key, stringValue, stringValue]);
        }
        await connection.commit();
        res.json({ message: 'Cài đặt đã được lưu.' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: `Lỗi server khi lưu cài đặt: ${err.message}` });
    } finally {
        connection.release();
    }
});

// Add root route for health checks
app.get('/', (req, res) => {
  res.send('✅ Backend server is running OK!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

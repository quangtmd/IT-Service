const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config(); // Tải các biến môi trường từ file .env

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

/*
-- HƯỚNG DẪN CÀI ĐẶT DATABASE MYSQL --
1. Hãy chắc chắn rằng bạn đã cài đặt MySQL Server trên máy tính của bạn (dùng XAMPP, MAMP, WAMP, etc.).
2. Tạo một database mới, ví dụ: CREATE DATABASE iq_technology_db;
3. Chạy các câu lệnh SQL dưới đây để tạo bảng cần thiết:

CREATE TABLE ProductCategories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_category_id INT NULL 
);

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
    stock INT NOT NULL,
    status VARCHAR(50),
    rating FLOAT,
    reviews INT,
    brand VARCHAR(255),
    tags JSON,
    brandLogoUrl VARCHAR(255),
    is_published BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE, -- Thêm cột này
    seoMetaTitle VARCHAR(255),
    seoMetaDescription TEXT,
    slug VARCHAR(255) UNIQUE,
    FOREIGN KEY (category_id) REFERENCES ProductCategories(id)
);

CREATE TABLE Orders (
    id VARCHAR(255) PRIMARY KEY,
    customerInfo JSON NOT NULL,
    items JSON NOT NULL,
    totalAmount DECIMAL(12, 0) NOT NULL,
    orderDate DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL,
    shippingInfo JSON,
    paymentInfo JSON NOT NULL
);

CREATE TABLE Articles (
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

CREATE TABLE MediaItems (
    id VARCHAR(255) PRIMARY KEY,
    url LONGTEXT NOT NULL,
    name VARCHAR(255),
    type VARCHAR(100),
    uploadedAt DATETIME NOT NULL
);

*/


// --- CẤU HÌNH KẾT NỐI MYSQL ---
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'iq_technology_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

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


// --- SERVER STARTUP LOGIC ---
const startServer = async () => {
    let pool;
    try {
        pool = mysql.createPool(dbConfig);
        // Attempt to get a connection to validate credentials.
        const connection = await pool.getConnection();
        console.log('✅ Kết nối tới database MySQL thành công!');
        connection.release();
    } catch (error) {
        console.error('❌ LỖI KẾT NỐI DATABASE:', error.message);
        console.error('------------------------------------------------------------------');
        console.error('👉 Vui lòng kiểm tra lại các mục sau:');
        console.error('   1. Server MySQL của bạn (local hoặc remote) đang chạy.');
        console.error('   2. Thông tin trong file `backend/.env` (nếu chạy local) là chính xác.');
        console.error('   3. Các biến môi trường (DB_HOST, DB_USER, etc.) trên Render đã được cài đặt đúng.');
        console.error('   4. Địa chỉ IP của server (local hoặc Render) đã được cho phép (whitelisted) để kết nối tới database.');
        console.error('------------------------------------------------------------------');
        process.exit(1); // Exit the process if DB connection fails
    }

    // --- PRODUCTS API ENDPOINTS ---

    app.get('/api/products', async (req, res) => {
      try {
        const { q, mainCategory, subCategory, brand, status, tags, page = 1, limit = 12 } = req.query;
        
        const whereClauses = ["p.is_published = TRUE"];
        const params = [];

        // Pre-fetch category IDs if a main category is specified
        if (mainCategory) {
            const [mainCatRows] = await pool.query("SELECT id FROM ProductCategories WHERE slug = ? AND parent_category_id IS NULL", [mainCategory]);
            if (mainCatRows.length > 0) {
                const mainCatId = mainCatRows[0].id;
                const [subCatRows] = await pool.query("SELECT id FROM ProductCategories WHERE parent_category_id = ?", [mainCatId]);
                let categoryIdsToFilter = subCatRows.map(row => row.id);
                categoryIdsToFilter.push(mainCatId); // Include the main category itself
                
                if (categoryIdsToFilter.length > 0) {
                    whereClauses.push("p.category_id IN (?)");
                    params.push(categoryIdsToFilter);
                }
            }
        }
        
        // Build the rest of the query
        let selectClause = "SELECT p.*, c.name as categoryName, c.slug as categorySlug, mc.name as mainCategoryName";
        let countSelectClause = "SELECT COUNT(p.id) as total";
        let fromClause = `
          FROM Products p 
          LEFT JOIN ProductCategories c ON p.category_id = c.id
          LEFT JOIN ProductCategories mc ON c.parent_category_id = mc.id
        `;

        if (subCategory) {
            const [subCatRow] = await pool.query("SELECT id FROM ProductCategories WHERE slug = ?", [subCategory]);
            if(subCatRow.length > 0){
                whereClauses.push("p.category_id = ?");
                params.push(subCatRow[0].id);
            }
        }

        if (q) {
            whereClauses.push("(p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)");
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
       
        if (brand) {
            whereClauses.push("p.brand = ?");
            params.push(brand);
        }
        if (status) {
            whereClauses.push("p.status = ?");
            params.push(status);
        }
        if (tags) {
             try {
                const [checkTagsColumn] = await pool.query("SHOW COLUMNS FROM Products LIKE 'tags'");
                if (checkTagsColumn.length > 0) {
                    whereClauses.push("JSON_SEARCH(p.tags, 'one', ?) IS NOT NULL");
                    params.push(tags);
                }
            } catch (e) { console.warn("Could not check for 'tags' column, skipping filter.") }
        }

        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const countQuery = `${countSelectClause} ${fromClause} ${whereString}`;
        const [countRows] = await pool.query(countQuery, params);
        const totalProducts = countRows[0].total;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;
        
        const dataQuery = `${selectClause} ${fromClause} ${whereString} ORDER BY p.id DESC LIMIT ? OFFSET ?`;
        const dataParams = [...params, limitNum, offset];

        const [rows] = await pool.query(dataQuery, dataParams);

        const products = rows.map(p => {
            const parsed = parseJsonFields(p, PRODUCT_JSON_FIELDS);
            parsed.mainCategory = p.mainCategoryName || p.categoryName || 'N/A';
            parsed.subCategory = p.categoryName || 'N/A';
            parsed.category = p.categoryName || 'N/A';
            return parsed;
        });

        res.json({ products, totalProducts });
      } catch (err) {
        console.error("Lỗi khi truy vấn sản phẩm:", err);
        res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu sản phẩm.' });
      }
    });

    app.get('/api/products/featured', async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT * FROM Products 
                WHERE is_published = TRUE AND is_featured = TRUE 
                ORDER BY id DESC 
                LIMIT 8
            `);
            const products = rows.map(p => parseJsonFields(p, PRODUCT_JSON_FIELDS));
            res.json(products);
        } catch (err) {
            console.error("Lỗi khi truy vấn sản phẩm nổi bật:", err);
            // Fallback for when is_featured column doesn't exist yet
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                try {
                    const [fallbackRows] = await pool.query(`
                        SELECT * FROM Products 
                        WHERE is_published = TRUE 
                        ORDER BY reviews DESC, rating DESC 
                        LIMIT 4`
                    );
                    const fallbackProducts = fallbackRows.map(p => parseJsonFields(p, PRODUCT_JSON_FIELDS));
                    return res.json(fallbackProducts);
                } catch (fallbackErr) {
                     return res.status(500).json({ error: 'Lỗi server.' });
                }
            }
            res.status(500).json({ error: 'Lỗi server.' });
        }
    });

    app.get('/api/products/:id', async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT * FROM Products WHERE id = ?", [req.params.id]);
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
            await pool.query("INSERT INTO Products SET ?", [prepareJsonFieldsForDb(req.body, PRODUCT_JSON_FIELDS)]);
            const [rows] = await pool.query("SELECT * FROM Products WHERE id = ?", [req.body.id]);
            res.status(201).json(parseJsonFields(rows[0], PRODUCT_JSON_FIELDS));
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server khi tạo sản phẩm.' });
        }
    });

    app.put('/api/products/:id', async (req, res) => {
        try {
            const productForDb = prepareJsonFieldsForDb(req.body, PRODUCT_JSON_FIELDS);
            delete productForDb.id;
            const [result] = await pool.query("UPDATE Products SET ? WHERE id = ?", [productForDb, req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
            const [rows] = await pool.query("SELECT * FROM Products WHERE id = ?", [req.params.id]);
            res.json(parseJsonFields(rows[0], PRODUCT_JSON_FIELDS));
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server khi cập nhật sản phẩm.' });
        }
    });

    app.delete('/api/products/:id', async (req, res) => {
        try {
            const [result] = await pool.query("DELETE FROM Products WHERE id = ?", [req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
            res.status(200).json({ message: 'Sản phẩm đã được xóa.' });
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server khi xóa sản phẩm.' });
        }
    });


    // --- ORDERS API ENDPOINTS ---

    app.get('/api/orders', async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT * FROM Orders ORDER BY orderDate DESC");
            res.json(rows.map(o => parseJsonFields(o, ORDER_JSON_FIELDS)));
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server khi lấy đơn hàng.' });
        }
    });

    app.post('/api/orders', async (req, res) => {
        try {
            // Destructure and rebuild the order object for security and correctness
            const { customerInfo, items, totalAmount, paymentInfo } = req.body;
    
            // Explicitly map items to ensure compatibility and correctness
            const orderItems = items.map((item) => ({
                productId: item.productId || item.id, // Handle both 'productId' and 'id'
                productName: item.productName || item.name, // Handle both 'productName' and 'name'
                quantity: item.quantity,
                price: item.price,
            }));
            
            // Explicitly include notes to ensure it's saved.
            const finalCustomerInfo = {
                fullName: customerInfo.fullName,
                phone: customerInfo.phone,
                address: customerInfo.address,
                email: customerInfo.email,
                notes: customerInfo.notes || '', // Ensure notes field is present and defaults to empty string
            };
    
            const newOrder = {
                id: req.body.id || `order-${Date.now()}`,
                customerInfo: finalCustomerInfo,
                items: orderItems,
                totalAmount: totalAmount,
                orderDate: new Date(), // Use reliable server time
                status: 'Chờ xử lý',
                paymentInfo: paymentInfo,
                shippingInfo: req.body.shippingInfo || null,
            };
    
            await pool.query("INSERT INTO Orders SET ?", [prepareJsonFieldsForDb(newOrder, ORDER_JSON_FIELDS)]);
            res.status(201).json(newOrder);
        } catch (err) {
            console.error("Lỗi khi tạo đơn hàng:", err); // Log the actual error on the server for debugging
            res.status(500).json({ error: 'Lỗi server khi tạo đơn hàng.' });
        }
    });

    app.put('/api/orders/:id/status', async (req, res) => {
        try {
            const [result] = await pool.query("UPDATE Orders SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
            res.json({ message: 'Cập nhật trạng thái thành công.' });
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server khi cập nhật trạng thái.' });
        }
    });


    // --- ARTICLES API ENDPOINTS ---

    app.get('/api/articles', async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT * FROM Articles ORDER BY date DESC");
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server khi lấy bài viết.' });
        }
    });

    app.get('/api/articles/:id', async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT * FROM Articles WHERE id = ?", [req.params.id]);
            if (rows.length > 0) res.json(rows[0]);
            else res.status(404).json({ error: 'Không tìm thấy bài viết.' });
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server.' });
        }
    });

    app.post('/api/articles', async (req, res) => {
        try {
            const newArticle = { ...req.body, date: new Date(req.body.date) };
            await pool.query("INSERT INTO Articles SET ?", [newArticle]);
            res.status(201).json(newArticle);
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server khi tạo bài viết.' });
        }
    });

    app.put('/api/articles/:id', async (req, res) => {
        try {
            const articleData = { ...req.body };
            delete articleData.id;
            const [result] = await pool.query("UPDATE Articles SET ? WHERE id = ?", [articleData, req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
            res.json({ id: req.params.id, ...articleData });
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server khi cập nhật bài viết.' });
        }
    });

    app.delete('/api/articles/:id', async (req, res) => {
        try {
            const [result] = await pool.query("DELETE FROM Articles WHERE id = ?", [req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
            res.status(200).json({ message: 'Bài viết đã được xóa.' });
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server khi xóa bài viết.' });
        }
    });

    // --- MEDIA ITEMS API ENDPOINTS ---

    app.get('/api/media-items', async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT * FROM MediaItems ORDER BY uploadedAt DESC");
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server khi lấy media.' });
        }
    });

    app.post('/api/media-items', async (req, res) => {
        try {
            const newItem = { ...req.body, uploadedAt: new Date(req.body.uploadedAt) };
            await pool.query("INSERT INTO MediaItems SET ?", [newItem]);
            res.status(201).json(newItem);
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server khi thêm media.' });
        }
    });

    app.delete('/api/media-items/:id', async (req, res) => {
        try {
            const [result] = await pool.query("DELETE FROM MediaItems WHERE id = ?", [req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy media.' });
            res.status(200).json({ message: 'Media đã được xóa.' });
        } catch (err) {
            res.status(500).json({ error: 'Lỗi server khi xóa media.' });
        }
    });

    // Khởi động server
    app.listen(port, () => {
      console.log(`🚀 Backend server đang chạy tại http://localhost:${port}`);
    });
};

// Run the server
startServer();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000; // Use Render's port, fallback to 10000

// Cấu hình CORS để cho phép tất cả các origin (sử dụng cho chẩn đoán)
// Đây là một biện pháp tạm thời để xác định xem lỗi có phải do CORS hay không.
app.use(cors());

app.use(express.json({ limit: '50mb' })); // Tăng giới hạn payload cho media

/*
-- HƯỚNG DẪN CÀI ĐẶT DATABASE MYSQL --
Vui lòng xem file `SETUP_DATABASE.sql` trong cùng thư mục này để biết hướng dẫn chi tiết.
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

app.post('/api/products', async (req, res) => {
    // This custom handler addresses the "Unknown column 'id'" error by excluding 'id' from the insert query.
    // This assumes the 'products' table has an auto-incrementing primary key.
    const { id, ...productData } = req.body;
    try {
        const dbReadyData = prepareForDb(productData, ['imageUrls', 'specifications', 'tags']);
        const [result] = await pool.query('INSERT INTO products SET ?', [dbReadyData]);
        const insertedId = result.insertId;
        // Respond with the full product object, now including the new database-generated ID.
        res.status(201).json({ ...req.body, id: insertedId });
    } catch (err) {
        res.status(500).json({ error: `Lỗi server khi tạo products: ${err.message}` });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id;
    try {
        const [result] = await pool.query('UPDATE products SET ? WHERE id = ?', [prepareForDb(updates, ['imageUrls', 'specifications', 'tags']), id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy đối tượng để cập nhật.' });
        res.json({ id, ...updates });
    } catch (err) {
        res.status(500).json({ error: `Lỗi server khi cập nhật products: ${err.message}` });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy đối tượng để xóa.' });
        res.status(200).json({ message: 'Đã xóa thành công.' });
    } catch (err) {
        res.status(500).json({ error: `Lỗi server khi xóa products: ${err.message}` });
    }
});


// --- PRODUCTS API (Custom implementation for filtering) ---

app.get('/api/products', async (req, res) => {
  try {
    const { q, mainCategory, subCategory, brand, status, tags, page = 1, limit = 12 } = req.query;
    let whereClauses = ["isVisible = TRUE"];
    const params = [];

    if (q) {
        whereClauses.push("(name LIKE ? OR brand LIKE ? OR description LIKE ? OR tags LIKE ?)");
        const searchTerm = `%${q}%`;
        // Note the escaped quotes to match the string within the JSON array `["tag1", "tag2"]`
        params.push(searchTerm, searchTerm, searchTerm, `%\"${q}\"%`);
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
      whereClauses.push("tags LIKE ?");
      params.push(`%\"${tags}\"%`);
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
        const query = `SELECT * FROM products WHERE isVisible = TRUE AND tags LIKE '%"Bán chạy"%' LIMIT 8`;
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

// Nâng cấp route gốc thành health check toàn diện
app.get('/', async (req, res) => {
    try {
        // Cố gắng lấy một kết nối từ pool để kiểm tra
        const connection = await pool.getConnection();
        // Ping database để xác nhận kết nối hoạt động
        await connection.ping();
        // Trả lại kết nối cho pool
        connection.release();
        
        // Trả về trang thái thành công
        res.status(200).send(`
            <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
                <h1 style="color: #28a745;">✅ Backend server is running OK!</h1>
                <p style="color: #17a2b8; font-weight: bold;">✔️ Kết nối đến cơ sở dữ liệu MySQL đã thành công.</p>
                <p>Điều này có nghĩa là các biến môi trường (DB_HOST, DB_USER, etc.) đã chính xác và IP của máy chủ Render đã được whitelist trên Hostinger.</p>
            </div>
        `);
    } catch (error) {
        // Nếu có lỗi, trả về trang thái thất bại với thông tin chi tiết
        console.error("Lỗi kiểm tra sức khỏe - Kết nối CSDL thất bại:", error);
        res.status(500).send(`
            <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
                <h1 style="color: #dc3545;">❌ Backend server is running, BUT...</h1>
                <p style="color: #ffc107; font-weight: bold;">⚠️ Không thể kết nối đến cơ sở dữ liệu MySQL.</p>
                <p><strong>Vui lòng kiểm tra lại các mục sau:</strong></p>
                <ul style="padding-left: 20px;">
                    <li><strong>Biến môi trường trên Render:</strong> Đảm bảo các biến <code>DB_HOST</code>, <code>DB_USER</code>, <code>DB_PASSWORD</code>, <code>DB_NAME</code> đã được thiết lập chính xác.</li>
                    <li><strong>Cấu hình Remote MySQL trên Hostinger:</strong> Đảm bảo địa chỉ IP của dịch vụ Render đã được thêm vào danh sách "Access host".</li>
                    <li><strong>Tường lửa hoặc vấn đề mạng:</strong> Đảm bảo không có cấu hình nào khác đang chặn kết nối.</li>
                </ul>
                <p><strong>Thông tin lỗi chi tiết:</strong></p>
                <pre style="background: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap; word-wrap: break-word;">${error.message}</pre>
            </div>
        `);
    }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
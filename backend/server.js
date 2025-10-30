const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'iq_technology_db',
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true 
};

let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('Đã tạo kết nối MySQL pool thành công.');
} catch (error) {
    console.error('Lỗi khi tạo kết nối MySQL pool:', error);
    process.exit(1);
}

// --- UTILITY FUNCTIONS ---
const parseJsonFields = (item, fields) => {
    const newItem = { ...item };
    for (const field of fields) {
        if (newItem[field] && typeof newItem[field] === 'string') {
            try {
                newItem[field] = JSON.parse(newItem[field]);
            } catch (e) {
                console.error(`Error parsing JSON field "${field}" for item:`, item, e);
                newItem[field] = Array.isArray(fields) ? [] : {};
            }
        }
    }
    return newItem;
};
const parseProductFields = (product) => parseJsonFields(product, ['images', 'specs']);
const parseOrderFields = (order) => parseJsonFields(order, ['items', 'customerInfo', 'shippingAddress', 'paymentDetails']);

// --- API: HEALTH CHECK ---
app.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        res.status(200).send(`
            <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
                <h1 style="color: #28a745;">✅ Backend server is running OK!</h1>
                <p style="color: #17a2b8; font-weight: bold;">✔️ Kết nối đến cơ sở dữ liệu MySQL đã thành công.</p>
                <p>Server đang lắng nghe trên cổng: ${PORT}</p>
            </div>
        `);
    } catch (error) {
        console.error('Lỗi kiểm tra sức khỏe:', error);
        res.status(500).send(`
            <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
                <h1 style="color: #dc3545;">❌ Backend server is running, but DB connection FAILED!</h1>
                <pre style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word;">${error.message}</pre>
            </div>
        `);
    }
});


// --- API: AUTH & USERS ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // NOTE: In a real app, passwords should be hashed and compared with bcrypt.
        // This is a simplified version for demonstration. The DB field is password_hash.
        const [rows] = await pool.query("SELECT id, username, email, is_locked FROM Users WHERE email = ? AND password_hash = ?", [email, password]);
        if (rows.length > 0) {
            if (rows[0].is_locked) {
                return res.status(403).json({ error: 'Tài khoản đã bị khóa.' });
            }
            res.json(rows[0]);
        } else {
            res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id, u.username, u.email, u.image_url as imageUrl, u.is_locked as isLocked,
                ep.full_name as fullName, ep.date_of_birth as dateOfBirth, ep.phone, ep.address,
                ep.join_date as joinDate, ep.status,
                c.job_title as position,
                (SELECT r.name FROM Roles r JOIN UserRoles ur ON r.id = ur.role_id WHERE ur.user_id = u.id LIMIT 1) as role,
                c.job_title as staffRole 
            FROM Users u
            LEFT JOIN EmployeeProfiles ep ON u.id = ep.user_id
            LEFT JOIN Contracts c ON u.id = c.employee_id AND c.is_active = TRUE
        `;
        const [users] = await pool.query(query);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- API: PRODUCT CATEGORIES ---
app.get('/api/product_categories', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name, slug, description, parent_category_id as parentCategoryId FROM ProductCategories ORDER BY name");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API: PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const { q, categoryId, brand, page = 1, limit = 12 } = req.query;
        let whereClauses = [];
        const params = [];

        if (q) {
            whereClauses.push("(p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)");
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        if (categoryId) {
            whereClauses.push("p.category_id = ?");
            params.push(categoryId);
        }
        if (brand) {
            whereClauses.push("p.brand = ?");
            params.push(brand);
        }
        
        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const countQuery = `SELECT COUNT(*) as total FROM Products p ${whereString}`;
        const [countRows] = await pool.query(countQuery, params);
        const totalProducts = countRows[0].total;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;
        
        const dataQuery = `SELECT p.*, c.name as categoryName FROM Products p LEFT JOIN ProductCategories c ON p.category_id = c.id ${whereString} ORDER BY p.id DESC LIMIT ? OFFSET ?`;
        const [rows] = await pool.query(dataQuery, [...params, limitNum, offset]);
        
        const parsedRows = rows.map(p => parseJsonFields(p, ['images', 'specs']));

        res.json({ products: parsedRows, totalProducts });
    } catch (err) {
        res.status(500).json({ error: `Lỗi server khi lấy sản phẩm: ${err.message}` });
    }
});

app.get('/api/products/featured', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM Products ORDER BY created_at DESC LIMIT 8");
        const parsedRows = rows.map(p => parseJsonFields(p, ['images', 'specs']));
        res.json(parsedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/products/:id', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as categoryName 
            FROM Products p 
            LEFT JOIN ProductCategories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        if (rows.length > 0) {
            const product = parseJsonFields(rows[0], ['images', 'specs']);
            res.json(product);
        } else {
            res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    const { name, slug, sku, description, price, images, category_id, brand, is_published, specs } = req.body;
    try {
        const query = `INSERT INTO Products (name, slug, sku, description, price, images, category_id, brand, is_published, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await pool.query(query, [name, slug, sku, description, price, JSON.stringify(images || []), category_id, brand, is_published, JSON.stringify(specs || {})]);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, slug, sku, description, price, images, category_id, brand, is_published, specs } = req.body;
    try {
        const query = `UPDATE Products SET name=?, slug=?, sku=?, description=?, price=?, images=?, category_id=?, brand=?, is_published=?, specs=? WHERE id=?`;
        await pool.query(query, [name, slug, sku, description, price, JSON.stringify(images || []), category_id, brand, is_published, JSON.stringify(specs || {}), id]);
        res.json({ id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Products WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- API: Orders ---
app.get('/api/orders', async (req, res) => {
    try {
        const query = `
            SELECT o.*, 
                   (SELECT JSON_ARRAYAGG(
                       JSON_OBJECT(
                           'id', oi.id, 
                           'orderId', oi.order_id, 
                           'productId', oi.product_id,
                           'quantity', oi.quantity,
                           'priceAtPurchase', oi.price_at_purchase,
                           'productName', oi.product_name
                        )
                   ) 
                   FROM OrderItems oi
                   WHERE oi.order_id = o.id) as items
            FROM Orders o
            ORDER BY o.created_at DESC
        `;
        const [orders] = await pool.query(query);
        const parsedOrders = orders.map(o => parseJsonFields(o, ['items', 'customer_info', 'shipping_address', 'payment_details']));
        res.json(parsedOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const { userId, totalAmount, customerInfo, shippingAddress, paymentDetails, items } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const orderQuery = `INSERT INTO Orders (user_id, total_amount, status, customer_info, shipping_address, payment_details) VALUES (?, ?, ?, ?, ?, ?)`;
        const [orderResult] = await connection.query(orderQuery, [
            userId || null, 
            totalAmount, 
            'pending',
            JSON.stringify(customerInfo),
            JSON.stringify(shippingAddress || customerInfo),
            JSON.stringify(paymentDetails)
        ]);
        const orderId = orderResult.insertId;

        if (items && items.length > 0) {
            const itemPromises = items.map((item) => {
                const itemQuery = "INSERT INTO OrderItems (order_id, product_id, quantity, price_at_purchase, product_name) VALUES (?, ?, ?, ?, ?)";
                return connection.query(itemQuery, [orderId, item.productId, item.quantity, item.priceAtPurchase, item.productName]);
            });
            await Promise.all(itemPromises);
        }
        
        await connection.commit();
        res.status(201).json({ id: orderId, ...req.body });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query("UPDATE Orders SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: 'Cập nhật trạng thái thành công.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API: ARTICLES (from DB) ---
app.get('/api/articles', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Articles ORDER BY published_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API: Service Tickets ---
app.get('/api/service_tickets', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ServiceTickets ORDER BY created_at DESC');
        res.json(rows.map(row => parseJsonFields(row, ['customer_info'])));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- API: Inventory ---
app.get('/api/inventory', async (req, res) => {
    try {
        const query = `
            SELECT i.product_id, p.name as product_name, i.warehouse_id, w.name as warehouse_name, i.quantity
            FROM Inventory i
            JOIN Products p ON i.product_id = p.id
            JOIN Warehouses w ON i.warehouse_id = w.id
            ORDER BY p.name, w.name
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- API: Financials (Suppliers & Bills) ---
app.get('/api/suppliers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Suppliers ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bills', async (req, res) => {
    try {
        const query = `
            SELECT b.*, s.name as supplier_name
            FROM Bills b
            LEFT JOIN Suppliers s ON b.supplier_id = s.id
            ORDER BY b.bill_date DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API: SITE SETTINGS ---
app.get('/api/site_settings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM SiteSettings');
        const settings = rows.reduce((acc, row) => {
            acc[row.setting_key] = parseJsonFields(row, ['setting_value']).setting_value;
            return acc;
        }, {});
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/site_settings', async (req, res) => {
    const settings = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const query = `INSERT INTO SiteSettings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`;
        for (const [key, value] of Object.entries(settings)) {
            await connection.query(query, [key, JSON.stringify(value)]);
        }
        await connection.commit();
        res.status(200).json({ message: 'Settings saved successfully' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});


app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

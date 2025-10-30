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
    if (!item) return item;
    const newItem = { ...item };
    for (const field of fields) {
        if (newItem[field] && typeof newItem[field] === 'string') {
            try {
                newItem[field] = JSON.parse(newItem[field]);
            } catch (e) {
                console.error(`Error parsing JSON field "${field}" for item:`, item, e);
                // Assign a default based on expected type (array for images, object for others)
                newItem[field] = field === 'images' ? [] : {};
            }
        }
    }
    return newItem;
};

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
        const [userRows] = await pool.query("SELECT id, username, email, image_url as imageUrl, is_locked as isLocked FROM users WHERE email = ? AND password_hash = ?", [email, password]);
        
        if (userRows.length > 0) {
            const user = userRows[0];
            if (user.isLocked) {
                return res.status(403).json({ error: 'Tài khoản đã bị khóa.' });
            }

            // Fetch user role
            const [roleRows] = await pool.query(
                `SELECT r.name as roleName 
                 FROM roles r 
                 JOIN userroles ur ON r.id = ur.role_id 
                 WHERE ur.user_id = ?`, 
                [user.id]
            );

            // Fetch staff-specific details if the user is a staff/admin
            let staffDetails = {};
            const userRole = roleRows.length > 0 ? roleRows[0].roleName : 'customer';

            if (userRole === 'admin' || userRole === 'staff') {
                 const [contractRows] = await pool.query(
                    `SELECT job_title FROM contracts WHERE employee_id = ? AND is_active = TRUE`,
                    [user.id]
                 );
                 if (contractRows.length > 0) {
                    staffDetails = {
                        staffRole: contractRows[0].job_title,
                        position: contractRows[0].job_title
                    }
                 }
            }

            const fullUserPayload = {
                ...user,
                role: userRole,
                ...staffDetails
            };

            res.json(fullUserPayload);
        } else {
            res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id, u.username, u.email, u.image_url as imageUrl, u.is_locked as isLocked,
                ep.full_name as fullName, ep.date_of_birth as dateOfBirth,
                ep.join_date as joinDate, ep.status,
                c.job_title as position,
                (SELECT r.name FROM roles r JOIN userroles ur ON r.id = ur.role_id WHERE ur.user_id = u.id LIMIT 1) as role,
                c.job_title as staffRole 
            FROM users u
            LEFT JOIN employeeprofiles ep ON u.id = ep.user_id
            LEFT JOIN contracts c ON u.id = c.employee_id AND c.is_active = TRUE
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
        const [rows] = await pool.query("SELECT id, name, slug, description, parent_category_id as parentCategoryId FROM productcategories ORDER BY name");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API: PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const { q, categoryId, brand, page = 1, limit = 12 } = req.query;
        let whereClauses = ["p.is_published = TRUE"];
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
        
        const countQuery = `SELECT COUNT(*) as total FROM products p ${whereString}`;
        const [countRows] = await pool.query(countQuery, params);
        const totalProducts = countRows[0].total;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;
        
        const dataQuery = `
            SELECT p.*, c.name as categoryName,
                COALESCE((SELECT SUM(i.quantity) FROM inventory i WHERE i.product_id = p.id), 0) as stock,
                pc.specs
            FROM products p
            LEFT JOIN productcategories c ON p.category_id = c.id
            LEFT JOIN pccomponents pc ON p.id = pc.product_id
            ${whereString} 
            ORDER BY p.created_at DESC 
            LIMIT ? OFFSET ?`;

        const [rows] = await pool.query(dataQuery, [...params, limitNum, offset]);
        const parsedRows = rows.map(p => parseJsonFields(p, ['images', 'specs']));

        res.json({ products: parsedRows, totalProducts });
    } catch (err) {
        res.status(500).json({ error: `Lỗi server khi lấy sản phẩm: ${err.message}` });
    }
});

app.get('/api/products/featured', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as categoryName,
                COALESCE((SELECT SUM(i.quantity) FROM inventory i WHERE i.product_id = p.id), 0) as stock,
                pc.specs
            FROM products p
            LEFT JOIN productcategories c ON p.category_id = c.id
            LEFT JOIN pccomponents pc ON p.id = pc.product_id
            WHERE p.is_published = TRUE
            ORDER BY p.created_at DESC 
            LIMIT 8`;
        const [rows] = await pool.query(query);
        const parsedRows = rows.map(p => parseJsonFields(p, ['images', 'specs']));
        res.json(parsedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/products/:id', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as categoryName,
                COALESCE((SELECT SUM(i.quantity) FROM inventory i WHERE i.product_id = p.id), 0) as stock,
                pc.specs
            FROM products p 
            LEFT JOIN productcategories c ON p.category_id = c.id
            LEFT JOIN pccomponents pc ON p.id = pc.product_id
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
        // This is a simplified version. A real app would handle specs and inventory separately.
        const query = `INSERT INTO products (name, slug, sku, description, price, images, category_id, brand, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await pool.query(query, [name, slug, sku, description, price, JSON.stringify(images || []), category_id, brand, is_published]);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, slug, sku, description, price, images, category_id, brand, is_published, specs } = req.body;
    try {
        // This is a simplified version. A real app would handle specs and inventory separately.
        const query = `UPDATE products SET name=?, slug=?, sku=?, description=?, price=?, images=?, category_id=?, brand=?, is_published=? WHERE id=?`;
        await pool.query(query, [name, slug, sku, description, price, JSON.stringify(images || []), category_id, brand, is_published, id]);
        res.json({ id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        // In a real app with foreign keys, you might need to delete from child tables first or set ON DELETE CASCADE
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- API: Orders ---
app.get('/api/orders', async (req, res) => {
    try {
        const query = `
            SELECT o.id, o.user_id, o.status, o.total_amount, o.customer_info, o.shipping_address, o.payment_details, o.created_at, o.updated_at,
                   (SELECT JSON_ARRAYAGG(
                       JSON_OBJECT(
                           'id', oi.id, 
                           'order_id', oi.order_id, 
                           'product_id', oi.product_id,
                           'quantity', oi.quantity,
                           'price_at_purchase', oi.price_at_purchase,
                           'product_name', oi.product_name
                        )
                   ) 
                   FROM orderitems oi
                   WHERE oi.order_id = o.id) as items
            FROM orders o
            ORDER BY o.created_at DESC
        `;
        const [orders] = await pool.query(query);
        // Massage data for frontend compatibility
        const massagedOrders = orders.map(o => ({
            ...o,
            customerInfo: o.customer_info,
            totalAmount: o.total_amount,
            createdAt: o.created_at,
            updatedAt: o.updated_at,
            paymentDetails: o.payment_details
        }));
        const parsedOrders = massagedOrders.map(o => parseJsonFields(o, ['items', 'customerInfo', 'shipping_address', 'paymentDetails']));
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
        
        const orderQuery = `INSERT INTO orders (user_id, total_amount, status, customer_info, shipping_address, payment_details) VALUES (?, ?, ?, ?, ?, ?)`;
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
                const itemQuery = "INSERT INTO orderitems (order_id, product_id, quantity, price_at_purchase, product_name) VALUES (?, ?, ?, ?, ?)";
                return connection.query(itemQuery, [orderId, item.productId, item.quantity, item.priceAtPurchase, item.productName]);
            });
            await Promise.all(itemPromises);
        }
        
        await connection.commit();
        res.status(201).json({ id: orderId, ...req.body, order_id: orderId });
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
        await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
        res.json({ message: 'Cập nhật trạng thái thành công.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API: ARTICLES (from DB) ---
app.get('/api/articles', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT a.*, u.username as author, ac.name as category
            FROM articles a
            LEFT JOIN users u ON a.author_id = u.id
            LEFT JOIN articlecategories ac ON a.category_id = ac.id
            ORDER BY a.published_at DESC
        `);
        // Massage data for frontend compatibility
        const massagedData = rows.map(a => ({
            ...a,
            imageUrl: a.image_url,
            createdAt: a.created_at,
            updatedAt: a.updated_at,
        }))
        res.json(massagedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API: Service Tickets ---
app.get('/api/service_tickets', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM servicetickets ORDER BY created_at DESC');
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
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            JOIN warehouses w ON i.warehouse_id = w.id
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
        const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bills', async (req, res) => {
    try {
        const query = `
            SELECT b.*, s.name as supplier_name
            FROM bills b
            LEFT JOIN suppliers s ON b.supplier_id = s.id
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
        const [rows] = await pool.query('SELECT * FROM sitesettings');
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
        const query = `INSERT INTO sitesettings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`;
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
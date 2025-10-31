const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch'); // Mặc dù Node 18+ có sẵn, thêm để đảm bảo tương thích

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- DATABASE CONFIGURATION ---
const dbConfig = {
  host: process.env.MYSQLHOST || '194.59.164.14',
  user: process.env.MYSQLUSER || 'u573621538_ltservice',
  password: process.env.MYSQLPASSWORD || 'Aa0908225224',
  database: (process.env.MYSQLDATABASE || 'u573621538_ltservice').toLowerCase(),
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true 
};

let pool;

// --- DATABASE SEEDING ---
const ensureAdminUserExists = async () => {
    const adminEmail = 'quangtmdit@gmail.com';
    const adminPassword = 'A@a0908225224';
    const connection = await pool.getConnection();
    try {
        console.log('Kiểm tra sự tồn tại của người dùng admin...');
        const [userRows] = await connection.query('SELECT id FROM users WHERE email = ?', [adminEmail]);

        if (userRows.length === 0) {
            console.log('Người dùng admin không tồn tại. Đang tạo...');
            
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

            await connection.beginTransaction();

            const [userResult] = await connection.query(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                ['Quang Admin', adminEmail, hashedPassword]
            );
            const newUserId = userResult.insertId;

            const [roleRows] = await connection.query('SELECT id FROM roles WHERE name = ?', ['Admin']);
            if (roleRows.length > 0) {
                const adminRoleId = roleRows[0].id;
                await connection.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [newUserId, adminRoleId]);
                console.log('Đã tạo thành công người dùng admin và gán vai trò.');
            } else {
                console.error('Không tìm thấy vai trò "Admin". Bỏ qua việc gán vai trò.');
            }
            
            await connection.commit();
        } else {
            console.log('Người dùng admin đã tồn tại.');
        }
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi khi khởi tạo người dùng admin:', error);
    } finally {
        connection.release();
    }
};


// --- API HELPER ---
const handleQuery = async (res, query, params = []) => {
    try {
        const [results] = await pool.query(query, params);
        return res.json(results);
    } catch (error) {
        console.error('SQL Error:', error.message);
        return res.status(500).json({ error: 'Database query failed', details: error.message });
    }
};

// --- NEW SERVER INFO API ---
app.get('/api/server-info', async (req, res) => {
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const outboundIp = ipData.ip;
        res.json({ outboundIp: outboundIp, port: PORT });
    } catch (error) {
        console.error('Could not fetch outbound IP:', error);
        res.status(500).json({ error: 'Không thể lấy địa chỉ IP của máy chủ.', details: error.message });
    }
});


// --- AUTH & USER API ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc.' });
    }
    try {
        const [userRows] = await pool.query(
            `SELECT u.id, u.email, u.username, u.image_url as imageUrl, u.password_hash, u.is_locked
             FROM users u 
             WHERE u.email = ?`,
            [email]
        );

        if (userRows.length === 0) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
        }

        const user = userRows[0];
        
        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
             return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
        }
        
        if (user.is_locked) {
            return res.status(403).json({ error: 'Tài khoản đã bị khóa.' });
        }

        const [roleRows] = await pool.query(
            `SELECT r.name 
             FROM roles r
             JOIN user_roles ur ON r.id = ur.role_id
             WHERE ur.user_id = ?`, [user.id]
        );
        const roles = roleRows.map(r => r.name);
        const userRole = roles.includes('Admin') ? 'admin' : roles.includes('Staff') ? 'staff' : 'customer';

        const [permissionRows] = await pool.query(
            `SELECT p.name
             FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             JOIN roles r ON rp.role_id = r.id
             JOIN user_roles ur ON r.id = ur.role_id
             WHERE ur.user_id = ?`, [user.id]
        );
        const permissions = permissionRows.map(p => p.name);

        const responsePayload = {
            id: user.id,
            email: user.email,
            username: user.username,
            imageUrl: user.imageUrl,
            role: userRole,
            roles: roles,
            permissions: permissions
        };

        res.json(responsePayload);
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Lỗi server khi đăng nhập.' });
    }
});

app.get('/api/users', (req, res) => handleQuery(res, 'SELECT id, username, email, image_url as imageUrl, is_locked as isLocked, created_at as createdAt, updated_at as updatedAt FROM users'));


// --- PRODUCTS & CATEGORIES API ---
app.get('/api/product_categories', (req, res) => handleQuery(res, 'SELECT id, name, slug, description, parent_category_id as parentCategoryId FROM product_categories'));
app.get('/api/products', (req, res) => handleQuery(res, 'SELECT p.*, c.name as categoryName FROM products p LEFT JOIN product_categories c ON p.category_id = c.id ORDER BY p.created_at DESC'));
app.get('/api/products/featured', (req, res) => handleQuery(res, 'SELECT p.*, c.name as categoryName FROM products p LEFT JOIN product_categories c ON p.category_id = c.id WHERE p.is_featured = 1 LIMIT 4'));
app.get('/api/products/:id', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT p.*, c.name as categoryName FROM products p LEFT JOIN product_categories c ON p.category_id = c.id WHERE p.id = ?', [req.params.id]);
        if (results.length > 0) {
            try {
                if(results[0].specs && typeof results[0].specs === 'string') {
                    results[0].specs = JSON.parse(results[0].specs);
                }
                 if(results[0].images && typeof results[0].images === 'string') {
                    results[0].images = JSON.parse(results[0].images);
                }
            } catch (e) {
                console.error(`Could not parse JSON for product ${results[0].id}`);
            }
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('SQL Error:', error.message);
        res.status(500).json({ error: 'Database query failed', details: error.message });
    }
});


// --- ARTICLES & CATEGORIES API ---
app.get('/api/article_categories', (req, res) => handleQuery(res, 'SELECT * FROM article_categories'));
app.get('/api/articles', (req, res) => handleQuery(res, 'SELECT a.*, u.username as author, ac.name as category FROM articles a LEFT JOIN users u ON a.author_id = u.id LEFT JOIN article_categories ac ON a.category_id = ac.id ORDER BY a.created_at DESC'));

// --- ORDERS API ---
app.get('/api/orders', async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        for (let order of orders) {
            const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
            order.items = items;
             try {
                order.customer_info = JSON.parse(order.customer_info);
                order.shipping_address = JSON.parse(order.shipping_address);
                order.payment_details = JSON.parse(order.payment_details);
            } catch (e) {
                console.error(`Could not parse JSON for order ${order.id}`);
            }
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const { userId, totalAmount, customerInfo, shippingAddress, paymentDetails, items } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, customer_info, shipping_address, payment_details, status) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, totalAmount, JSON.stringify(customerInfo), JSON.stringify(shippingAddress), JSON.stringify(paymentDetails), 'pending']
        );
        const orderId = orderResult.insertId;

        if (items && items.length > 0) {
            const itemValues = items.map(item => [orderId, item.productId, item.quantity, item.priceAtPurchase, item.productName]);
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, product_name) VALUES ?',
                [itemValues]
            );
        }

        await connection.commit();
        const [newOrderRow] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        const newOrder = newOrderRow[0];
        try {
            newOrder.customer_info = JSON.parse(newOrder.customer_info);
            newOrder.shipping_address = JSON.parse(newOrder.shipping_address);
            newOrder.payment_details = JSON.parse(newOrder.payment_details);
        } catch(e) { /* ignore */ }
        
        res.status(201).json(newOrder);

    } catch (error) {
        await connection.rollback();
        console.error('Failed to create order:', error);
        res.status(500).json({ error: 'Failed to create order', details: error.message });
    } finally {
        connection.release();
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- SITE SETTINGS API (Key-Value Store) ---
app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM site_settings');
        const settings = rows.reduce((acc, row) => {
            try {
                if (row.setting_value && (row.setting_value.startsWith('{') || row.setting_value.startsWith('['))) {
                    acc[row.setting_key] = JSON.parse(row.setting_value);
                } else {
                    acc[row.setting_key] = row.setting_value;
                }
            } catch (e) {
                acc[row.setting_key] = row.setting_value;
            }
            return acc;
        }, {});
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/settings', async (req, res) => {
    const settings = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        for (const key in settings) {
            const value = (typeof settings[key] === 'object') ? JSON.stringify(settings[key]) : settings[key];
            await connection.query(
                'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
        }
        await connection.commit();
        res.json({ message: 'Cài đặt đã được lưu.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});


// --- OTHER MODULES API ---
app.get('/api/service_tickets', (req, res) => handleQuery(res, 'SELECT * FROM service_tickets ORDER BY created_at DESC'));
app.get('/api/inventory', (req, res) => handleQuery(res, 'SELECT i.*, p.name as product_name, w.name as warehouse_name FROM inventory i JOIN products p ON i.product_id = p.id JOIN warehouses w ON i.warehouse_id = w.id'));
app.get('/api/suppliers', (req, res) => handleQuery(res, 'SELECT * FROM suppliers ORDER BY name ASC'));
app.get('/api/bills', (req, res) => handleQuery(res, 'SELECT b.*, s.name as supplier_name FROM bills b JOIN suppliers s ON b.supplier_id = s.id ORDER BY b.bill_date DESC'));
app.get('/api/employee_profiles', (req, res) => handleQuery(res, 'SELECT * FROM employee_profiles'));


// --- Server Start ---
async function startServer() {
    try {
        pool = mysql.createPool(dbConfig);
        await pool.query('SELECT 1');
        console.log('Đã kết nối thành công tới MySQL.');

        await ensureAdminUserExists();
        
        app.listen(PORT, () => {
            console.log(`Backend server đang chạy trên cổng ${PORT}`);
        });

    } catch (error) {
        console.error('Không thể kết nối tới MySQL:', error);
        // Don't exit on connection error, allow server to run for info endpoint.
        // process.exit(1);
        
        // Instead, just start the server to serve the info endpoint
        app.listen(PORT, () => {
            console.log(`Backend server đang chạy trên cổng ${PORT} (CHẾ ĐỘ HẠN CHẾ do lỗi CSDL).`);
        });
    }
}

startServer();
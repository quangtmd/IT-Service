const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
// fetch is globally available in modern Node.js environments like Render's default.

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- Serve Static Files from the React build ---
// This serves the built frontend files (index.html, JS, CSS)
app.use(express.static(path.join(__dirname, '../dist')));


// --- DATABASE CONFIGURATION ---
// IMPORTANT: Rely on environment variables from the hosting provider (e.g., Render).
// The user MUST set these environment variables correctly in their Render service.
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
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
                'INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)',
                ['Quang Admin', adminEmail, hashedPassword]
            );
            const newUserId = userResult.insertId;

            const [roleRows] = await connection.query('SELECT id FROM roles WHERE name = ?', ['Admin']);
            if (roleRows.length > 0) {
                const adminRoleId = roleRows[0].id;
                await connection.query('INSERT INTO user_roles (userId, roleId) VALUES (?, ?)', [newUserId, adminRoleId]);
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
            `SELECT u.id, u.email, u.username, u.imageUrl, u.passwordHash, u.isLocked
             FROM users u 
             WHERE u.email = ?`,
            [email]
        );

        if (userRows.length === 0) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
        }

        const user = userRows[0];
        
        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
             return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
        }
        
        if (user.isLocked) {
            return res.status(403).json({ error: 'Tài khoản đã bị khóa.' });
        }

        const [roleRows] = await pool.query(
            `SELECT r.name 
             FROM roles r
             JOIN user_roles ur ON r.id = ur.roleId
             WHERE ur.userId = ?`, [user.id]
        );
        const roles = roleRows.map(r => r.name);
        const userRole = roles.includes('Admin') ? 'admin' : roles.includes('Staff') ? 'staff' : 'customer';

        const [permissionRows] = await pool.query(
            `SELECT p.name
             FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permissionId
             JOIN roles r ON rp.roleId = r.id
             JOIN user_roles ur ON r.id = ur.roleId
             WHERE ur.userId = ?`, [user.id]
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

app.get('/api/users', (req, res) => handleQuery(res, 'SELECT id, username, email, imageUrl, isLocked, createdAt, updatedAt FROM users'));


// --- PRODUCTS & CATEGORIES API ---
app.get('/api/product_categories', (req, res) => handleQuery(res, 'SELECT id, name, slug, description, parentCategoryId FROM product_categories'));

app.get('/api/products', async (req, res) => {
    const { q, categoryId, brand, featured, page = 1, limit = 1000 } = req.query;
    
    let whereClauses = [];
    let params = [];
    let joinClause = 'LEFT JOIN product_categories c ON p.categoryId = c.id';

    if (q) {
        whereClauses.push('(p.name LIKE ? OR p.sku LIKE ? OR p.brand LIKE ?)');
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }
    if (categoryId) {
        whereClauses.push('p.categoryId = ?');
        params.push(categoryId);
    }
    if (brand) {
        whereClauses.push('p.brand = ?');
        params.push(brand);
    }
    if (featured === 'true') {
        whereClauses.push('p.isFeatured = 1');
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    const countQuery = `SELECT COUNT(p.id) as total FROM products p ${whereString}`;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    const dataQuery = `SELECT p.*, c.name as categoryName FROM products p ${joinClause} ${whereString} ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`;
    const dataParams = [...params, limitNum, offset];

    try {
        const [countResult] = await pool.query(countQuery, params);
        const totalProducts = countResult[0].total;

        const [products] = await pool.query(dataQuery, dataParams);
        
        // Parse JSON fields
        const parsedProducts = products.map(p => {
            try {
                if (p.specs && typeof p.specs === 'string') p.specs = JSON.parse(p.specs);
                if (p.images && typeof p.images === 'string') p.images = JSON.parse(p.images);
            } catch (e) {
                console.error(`Could not parse JSON for product ${p.id}`);
            }
            return p;
        });
        
        res.json({ products: parsedProducts, totalProducts });
    } catch (error) {
        console.error('SQL Error:', error.message);
        return res.status(500).json({ error: 'Database query failed', details: error.message });
    }
});


app.get('/api/products/featured', (req, res) => handleQuery(res, 'SELECT p.*, c.name as categoryName FROM products p LEFT JOIN product_categories c ON p.categoryId = c.id WHERE p.isFeatured = 1 LIMIT 4'));

app.get('/api/products/:id', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT p.*, c.name as categoryName FROM products p LEFT JOIN product_categories c ON p.categoryId = c.id WHERE p.id = ?', [req.params.id]);
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
app.get('/api/articles', (req, res) => handleQuery(res, 'SELECT a.*, u.username as author, ac.name as category FROM articles a LEFT JOIN users u ON a.authorId = u.id LEFT JOIN article_categories ac ON a.categoryId = ac.id ORDER BY a.createdAt DESC'));

// --- ORDERS API ---
app.get('/api/orders', async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY createdAt DESC');
        for (let order of orders) {
            const [items] = await pool.query('SELECT * FROM order_items WHERE orderId = ?', [order.id]);
            order.items = items;
             try {
                order.customerInfo = JSON.parse(order.customerInfo);
                order.shippingAddress = JSON.parse(order.shippingAddress);
                order.paymentDetails = JSON.parse(order.paymentDetails);
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
            'INSERT INTO orders (userId, totalAmount, customerInfo, shippingAddress, paymentDetails, status) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, totalAmount, JSON.stringify(customerInfo), JSON.stringify(shippingAddress), JSON.stringify(paymentDetails), 'pending']
        );
        const orderId = orderResult.insertId;

        if (items && items.length > 0) {
            const itemValues = items.map(item => [orderId, item.productId, item.quantity, item.priceAtPurchase, item.productName]);
            await connection.query(
                'INSERT INTO order_items (orderId, productId, quantity, priceAtPurchase, productName) VALUES ?',
                [itemValues]
            );
        }

        await connection.commit();
        const [newOrderRow] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        const newOrder = newOrderRow[0];
        try {
            newOrder.customerInfo = JSON.parse(newOrder.customerInfo);
            newOrder.shippingAddress = JSON.parse(newOrder.shippingAddress);
            newOrder.paymentDetails = JSON.parse(newOrder.paymentDetails);
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

// --- DEDICATED SITE SETTINGS HELPERS & API ---
const getSetting = async (key, defaultValue = null) => {
    try {
        const [rows] = await pool.query('SELECT settingValue FROM site_settings WHERE settingKey = ?', [key]);
        if (rows.length === 0) return defaultValue;
        const value = rows[0].settingValue;
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    } catch (error) {
        console.error(`Error getting setting for key ${key}:`, error);
        return defaultValue;
    }
};

const saveSetting = async (key, value) => {
    const finalValue = (typeof value === 'object') ? JSON.stringify(value) : value;
    await pool.query(
        'INSERT INTO site_settings (settingKey, settingValue) VALUES (?, ?) ON DUPLICATE KEY UPDATE settingValue = ?',
        [key, finalValue, finalValue]
    );
};

// Main settings endpoint (for general info)
app.get('/api/settings', async (req, res) => handleQuery(res, 'SELECT * FROM site_settings'));
app.post('/api/settings', async (req, res) => { /* ... existing implementation ... */ });

// Dedicated endpoints for sub-data
app.get('/api/faqs', async (req, res) => res.json(await getSetting('faqs', [])));
app.post('/api/faqs', async (req, res) => {
    await saveSetting('faqs', req.body);
    res.json({ message: 'FAQs updated.' });
});

app.get('/api/discounts', async (req, res) => res.json(await getSetting('discountCodes', [])));
app.post('/api/discounts', async (req, res) => {
    await saveSetting('discountCodes', req.body);
    res.json({ message: 'Discounts updated.' });
});

app.get('/api/media-library', async (req, res) => res.json(await getSetting('siteMediaLibrary', [])));
app.post('/api/media-library', async (req, res) => {
    await saveSetting('siteMediaLibrary', req.body);
    res.json({ message: 'Media library updated.' });
});


// --- OTHER MODULES API ---
app.get('/api/service_tickets', (req, res) => handleQuery(res, 'SELECT * FROM service_tickets ORDER BY createdAt DESC'));
app.get('/api/inventory', (req, res) => handleQuery(res, 'SELECT i.*, p.name as productName, w.name as warehouseName FROM inventory i JOIN products p ON i.productId = p.id JOIN warehouses w ON i.warehouseId = w.id'));
app.get('/api/suppliers', (req, res) => handleQuery(res, 'SELECT * FROM suppliers ORDER BY name ASC'));
app.get('/api/bills', (req, res) => handleQuery(res, 'SELECT b.*, s.name as supplierName FROM bills b JOIN suppliers s ON b.supplierId = s.id ORDER BY b.billDate DESC'));
app.get('/api/employee_profiles', (req, res) => handleQuery(res, 'SELECT * FROM employee_profiles'));


// --- SPA Fallback ---
// This should be the LAST route. It serves the frontend's index.html
// for any request that doesn't match an API route.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});


// --- Server Start ---
async function startServer() {
    // Check for required environment variables
    if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
        console.error('CRITICAL: Missing database environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).');
        process.exit(1);
    }

    try {
        pool = mysql.createPool(dbConfig);
        // Test connection
        const connection = await pool.getConnection();
        await connection.query('SELECT 1');
        connection.release();
        
        console.log('Đã kết nối thành công tới MySQL.');

        // Seeding moved after successful connection test
        await ensureAdminUserExists();
        
        app.listen(PORT, () => {
            console.log(`Backend server đang chạy trên cổng ${PORT}`);
            console.log(`Your service is live 🚀`);
            console.log(`//////////////////////////////////////////////////`);
            console.log(`Available at your primary URL https://it-service-1.onrender.com`);
            console.log(`//////////////////////////////////////////////////`);
        });

    } catch (error) {
        console.error('CRITICAL: Không thể khởi động server do lỗi kết nối CSDL. Vui lòng kiểm tra lại thông tin kết nối và quyền truy cập từ xa.');
        console.error(error);
        process.exit(1); // Exit with error code to signal a failed deployment
    }
}

startServer();
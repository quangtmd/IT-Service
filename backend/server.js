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

const parseProductFields = (product) => {
    if (product.images && typeof product.images === 'string') {
        try {
            product.images = JSON.parse(product.images);
        } catch (e) {
            console.error(`Error parsing images for product ${product.id}:`, product.images, e);
            product.images = []; // Fallback
        }
    }
    if (product.specs && typeof product.specs === 'string') {
        try {
            product.specs = JSON.parse(product.specs);
        } catch (e) {
            console.error(`Error parsing specs for product ${product.id}:`, product.specs, e);
            product.specs = {}; // Fallback
        }
    }
    return product;
};

// --- API: Product Categories ---
app.get('/api/product_categories', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM `categories` ORDER BY name");
        res.json(rows);
    } catch (err) {
        console.error("Error fetching product categories:", err.message);
        res.status(500).json({ error: 'Lỗi server khi lấy danh mục sản phẩm.' });
    }
});

// --- API: Products ---
app.get('/api/products', async (req, res) => {
    try {
        const { q, categoryId, brand, page = 1, limit = 12 } = req.query;
        let whereClauses = [];
        const params = [];

        if (q) {
            whereClauses.push("(name LIKE ? OR brand LIKE ? OR description LIKE ?)");
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        if (categoryId) {
            whereClauses.push("categoryId = ?");
            params.push(categoryId);
        }
        if (brand) {
            whereClauses.push("brand = ?");
            params.push(brand);
        }
        
        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const countQuery = `SELECT COUNT(*) as total FROM products ${whereString}`;
        const [countRows] = await pool.query(countQuery, params);
        const totalProducts = countRows[0].total;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;
        
        const dataQuery = `SELECT * FROM products ${whereString} ORDER BY id DESC LIMIT ? OFFSET ?`;
        const [rows] = await pool.query(dataQuery, [...params, limitNum, offset]);
        
        const parsedRows = rows.map(parseProductFields);

        res.json({ products: parsedRows, totalProducts });
    } catch (err) {
        console.error("Error fetching products:", err.message);
        res.status(500).json({ error: `Lỗi server khi lấy sản phẩm: ${err.message}` });
    }
});

app.get('/api/products/featured', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM products ORDER BY createdAt DESC LIMIT 8");
        const parsedRows = rows.map(parseProductFields);
        res.json(parsedRows);
    } catch (err) {
        console.error("Error fetching featured products:", err.message);
        res.status(500).json({ error: `Lỗi server khi lấy sản phẩm nổi bật: ${err.message}` });
    }
});


app.get('/api/products/:id', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as categoryName 
            FROM products p 
            LEFT JOIN \`categories\` c ON p.categoryId = c.id
            WHERE p.id = ?
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        if (rows.length > 0) {
            const product = parseProductFields(rows[0]);
            res.json(product);
        } else {
            res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
        }
    } catch (err) {
        console.error("Error fetching product by ID:", err.message);
        res.status(500).json({ error: `Lỗi server: ${err.message}` });
    }
});

app.post('/api/products', async (req, res) => {
    const { name, description, price, stock, images, categoryId, brand, specs } = req.body;
    try {
        const query = `INSERT INTO products (name, description, price, stock, images, categoryId, brand, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await pool.query(query, [name, description, price, stock, JSON.stringify(images || []), categoryId, brand, JSON.stringify(specs || {})]);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error("Error creating product:", err.message);
        res.status(500).json({ error: `Lỗi server khi tạo sản phẩm: ${err.message}` });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, images, categoryId, brand, specs } = req.body;
    try {
        const query = `UPDATE products SET name=?, description=?, price=?, stock=?, images=?, categoryId=?, brand=?, specs=? WHERE id=?`;
        await pool.query(query, [name, description, price, stock, JSON.stringify(images || []), categoryId, brand, JSON.stringify(specs || {}), id]);
        res.json({ id, ...req.body });
    } catch (err) {
        console.error("Error updating product:", err.message);
        res.status(500).json({ error: `Lỗi server khi cập nhật sản phẩm: ${err.message}` });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        console.error("Error deleting product:", err.message);
        res.status(500).json({ error: `Lỗi server khi xóa sản phẩm: ${err.message}` });
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
                           'orderId', oi.orderId, 
                           'productId', oi.productId,
                           'quantity', oi.quantity,
                           'priceAtPurchase', oi.priceAtPurchase,
                           'productName', oi.productName
                        )
                   ) 
                   FROM \`order items\` oi 
                   WHERE oi.orderId = o.id) as items
            FROM orders o
            ORDER BY o.createdAt DESC
        `;
        const [orders] = await pool.query(query);
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err.message);
        res.status(500).json({ error: `Lỗi server khi lấy đơn hàng: ${err.message}` });
    }
});

app.post('/api/orders', async (req, res) => {
    const { userId, totalAmount, customerInfo, shippingAddress, paymentDetails, items } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const orderQuery = `INSERT INTO orders (userId, totalAmount, status, customerInfo, shippingAddress, paymentDetails) VALUES (?, ?, ?, ?, ?, ?)`;
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
                const itemQuery = "INSERT INTO `order items` (orderId, productId, quantity, priceAtPurchase, productName) VALUES (?, ?, ?, ?, ?)";
                return connection.query(itemQuery, [orderId, item.productId, item.quantity, item.priceAtPurchase, item.productName]);
            });
            await Promise.all(itemPromises);
        }
        
        await connection.commit();
        res.status(201).json({ id: orderId, ...req.body });
    } catch (err) {
        await connection.rollback();
        console.error("Error creating order:", err.message);
        res.status(500).json({ error: `Lỗi server khi tạo đơn hàng: ${err.message}` });
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
        console.error("Error updating order status:", err.message);
        res.status(500).json({ error: `Lỗi server khi cập nhật trạng thái: ${err.message}` });
    }
});


// Health check endpoint
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
                <p style="color: #ffc107;">Lỗi kết nối đến cơ sở dữ liệu MySQL. Vui lòng kiểm tra lại:</p>
                <ul style="list-style-type: square; margin-left: 20px;">
                    <li><strong>Biến môi trường:</strong> DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.</li>
                    <li><strong>Quyền truy cập:</strong> Đảm bảo IP của máy chủ Render đã được thêm vào "Remote MySQL" trên Hostinger.</li>
                    <li><strong>Thông tin chi tiết lỗi:</strong></li>
                </ul>
                <pre style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word;">${error.message}</pre>
            </div>
        `);
    }
});


app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
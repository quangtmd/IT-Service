
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', true);
app.use(cors()); // Allow all CORS requests for development
app.use(express.json({ limit: '10mb' }));

// --- LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- HELPERS ---
const deserializeProduct = (p) => ({
    ...p,
    imageUrls: typeof p.imageUrls === 'string' ? JSON.parse(p.imageUrls || '[]') : p.imageUrls,
    specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications || '{}') : p.specifications,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : p.tags,
    isVisible: Boolean(p.isVisible), 
    price: Number(p.price),
    stock: Number(p.stock),
});
const deserializeUser = (u) => {
    const { password, ...userWithoutPassword } = u;
    return userWithoutPassword;
};

// --- DB CONNECTION CHECK & INIT ---
let dbStatus = { status: 'unknown', error: null, tableExists: false };
const checkDbConnection = async () => {
    try {
        const connection = await pool.getConnection();
        try {
            await connection.query('SELECT 1');
            console.log("✅ Kết nối DB thành công!");
            
            // Auto-migration: Ensure is_featured column exists
            try {
                await connection.query("SELECT is_featured FROM Products LIMIT 1");
            } catch (err) {
                console.log("⚠️ Cột is_featured chưa tồn tại, đang thêm...");
                await connection.query("ALTER TABLE Products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE");
                console.log("✅ Đã thêm cột is_featured.");
            }

            dbStatus = { status: 'connected', error: null, tableExists: true };
        } catch (tableError) {
             console.error("⚠️ Lỗi DB:", tableError);
             dbStatus = { status: 'error', error: tableError, tableExists: false };
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("\n⚠️ CẢNH BÁO: KHÔNG THỂ KẾT NỐI DATABASE");
        dbStatus = { status: 'error', error: { code: error.code, message: error.message }, tableExists: false };
    }
};
checkDbConnection();


// ==========================================================================
// API ROUTER
// ==========================================================================
const apiRouter = express.Router();

apiRouter.get('/health', async (req, res) => {
    if (dbStatus.status !== 'connected') await checkDbConnection();
    res.json(dbStatus);
});

// === USERS ===
// Static user routes first
apiRouter.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Users');
        res.json(rows.map(deserializeUser));
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: error.message });
    }
});

apiRouter.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'Email không tồn tại.' });
        const user = rows[0];
        if (user.password !== password) return res.status(401).json({ message: 'Mật khẩu không đúng.' });
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Dynamic user routes (e.g. /users/:id) would go here

// === PRODUCTS ===

// 1. Featured Products (EXPLICIT STATIC ROUTES FIRST)
// These must be defined BEFORE /products/:id to prevent ":id" from capturing "featured"
const getFeaturedHandler = async (req, res) => {
    // console.log("DEBUG: Hit featured products endpoint");
    try {
        // Prioritize products marked as featured, then expensive ones
        const query = `SELECT * FROM Products WHERE isVisible = 1 ORDER BY is_featured DESC, price DESC LIMIT 4`;
        const [rows] = await pool.query(query);
        res.json(rows.map(deserializeProduct));
    } catch (error) {
        console.error("Lỗi lấy sản phẩm nổi bật:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

apiRouter.get('/products/featured', getFeaturedHandler); 
apiRouter.get('/featured-products', getFeaturedHandler); 

// 2. Product List & Filter (General Route)
apiRouter.get('/products', async (req, res) => {
    try {
        const { mainCategory, subCategory, q, tags, limit = 1000, page = 1, is_featured } = req.query;
        let baseQuery = `FROM Products p`;
        const whereClauses = ['1=1'];
        const params = [];
        
        if (mainCategory) { whereClauses.push('p.mainCategory = ?'); params.push(mainCategory); }
        if (subCategory) { whereClauses.push('p.subCategory = ?'); params.push(subCategory); }
        if (q) { whereClauses.push('(p.name LIKE ? OR p.brand LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
        if (tags) { whereClauses.push('p.tags LIKE ?'); params.push(`%${tags}%`); }
        if (is_featured === 'true') { whereClauses.push('p.is_featured = 1'); }
        
        const whereString = ' WHERE ' + whereClauses.join(' AND ');
        const [countRows] = await pool.query(`SELECT COUNT(p.id) as total ${baseQuery} ${whereString}`, params);
        const totalProducts = countRows[0].total;

        const offset = (Number(page) - 1) * Number(limit);
        const productQuery = `SELECT p.* ${baseQuery} ${whereString} ORDER BY p.id DESC LIMIT ? OFFSET ?`;
        const [products] = await pool.query(productQuery, [...params, Number(limit), offset]);
        
        res.json({ products: products.map(deserializeProduct), totalProducts });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// 3. Product Detail (Dynamic ID Route LAST)
apiRouter.get('/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM Products WHERE id = ?`, [req.params.id]);
        if (rows.length > 0) {
            res.json(deserializeProduct(rows[0]));
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// === FINANCIALS ===
apiRouter.get('/financials/transactions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM FinancialTransactions ORDER BY transactionDate DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

apiRouter.get('/financials/payroll', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM PayrollRecords');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

apiRouter.post('/financials/payroll', async (req, res) => {
    try {
        const records = req.body;
        if (!Array.isArray(records)) return res.status(400).json({ message: "Input must be array" });
        for (const record of records) {
            const { id, employeeId, employeeName, payPeriod, baseSalary, bonus, deduction, finalSalary, status, notes } = record;
            await pool.query(
                `INSERT INTO PayrollRecords (id, employeeId, employeeName, payPeriod, baseSalary, bonus, deduction, finalSalary, status, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE baseSalary=VALUES(baseSalary), bonus=VALUES(bonus), deduction=VALUES(deduction), finalSalary=VALUES(finalSalary), status=VALUES(status), notes=VALUES(notes)`,
                [id, employeeId, employeeName, payPeriod, baseSalary, bonus, deduction, finalSalary, status, notes]
            );
        }
        res.json({ message: "Saved" });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// === ORDERS ===
// 1. General Order List
apiRouter.get('/orders', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Orders ORDER BY orderDate DESC');
        res.json(rows.map(order => ({
            ...order,
            items: JSON.parse(order.items || '[]'),
            customerInfo: JSON.parse(order.customerInfo || '{}'),
            paymentInfo: JSON.parse(order.paymentInfo || '{}'),
            shippingInfo: JSON.parse(order.shippingInfo || '{}'),
        })));
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// 2. Specific Order Routes (e.g. by Customer) - Place before generic :id if any
const getOrdersByCustomer = async (req, res) => {
    try {
        // Param is called 'userId' in route, but we use it as customerId
        const userId = req.params.userId;
        const [rows] = await pool.query('SELECT * FROM Orders WHERE userId = ? ORDER BY orderDate DESC', [userId]);
        res.json(rows.map(order => ({
            ...order,
            items: JSON.parse(order.items || '[]'),
            customerInfo: JSON.parse(order.customerInfo || '{}'),
            paymentInfo: JSON.parse(order.paymentInfo || '{}'),
            shippingInfo: JSON.parse(order.shippingInfo || '{}'),
        })));
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Map both route styles to the same handler to support different frontend service patterns
apiRouter.get('/users/:userId/orders', getOrdersByCustomer);
apiRouter.get('/orders/customer/:userId', getOrdersByCustomer);


// Mount API Router
app.use('/api', apiRouter);

// 404 Handler for API requests
app.use('/api/*', (req, res) => {
    console.log(`❌ 404 Not Found (API catch-all): ${req.originalUrl}`);
    res.status(404).json({ message: `API endpoint not found: ${req.originalUrl}` });
});

// Root route for health check
app.get('/', (req, res) => {
    res.send("Backend is running!");
});

// Serve Static Files (only in production)
if (process.env.NODE_ENV === 'production') {
    const projectRoot = path.resolve(__dirname, '..');
    app.use(express.static(path.join(projectRoot, 'dist')));
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
             return res.status(404).json({ message: `API not found: ${req.path}` });
        }
        res.sendFile(path.resolve(projectRoot, 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

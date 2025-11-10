import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for data URLs

// Simple logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// --- API Endpoints ---

// Helper function to handle DB queries
async function handleQuery(res, query, params = []) {
    try {
        const [results] = await pool.query(query, params);
        res.json(results);
    } catch (err) {
        console.error("Database query error:", err);
        res.status(500).json({ message: "Lỗi cơ sở dữ liệu", error: err.message });
    }
}

// GET all from a table
const getAllHandler = (tableName) => (req, res) => handleQuery(res, `SELECT * FROM ?? ORDER BY id DESC`, [tableName]);

// GET one by ID
const getByIdHandler = (tableName) => (req, res) => handleQuery(res, `SELECT * FROM ?? WHERE id = ?`, [tableName, req.params.id]);

// DELETE by ID
const deleteByIdHandler = (tableName) => async (req, res) => {
    try {
        const [result] = await pool.query(`DELETE FROM ?? WHERE id = ?`, [tableName, req.params.id]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Không tìm thấy đối tượng để xóa." });
        }
    } catch (err) {
        console.error(`Error deleting from ${tableName}:`, err);
        res.status(500).json({ message: `Lỗi khi xóa từ ${tableName}`, error: err.message });
    }
};

// Users
app.get('/api/users', getAllHandler('Users'));
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    // In a real app, you'd hash and compare the password. Here we simplify.
    const query = password 
      ? `SELECT * FROM Users WHERE email = ? AND password = ?`
      : `SELECT * FROM Users WHERE email = ?`;
    const params = password ? [email, password] : [email];
    try {
        const [results] = await pool.query(query, params);
        if (results.length > 0) {
            const { password, ...user } = results[0];
            res.json(user);
        } else {
            res.status(401).json({ message: "Email hoặc mật khẩu không chính xác." });
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Lỗi server khi đăng nhập." });
    }
});
app.post('/api/users', (req, res) => { /* ... complex logic ... */ res.status(501).send(); });
app.put('/api/users/:id', (req, res) => { /* ... complex logic ... */ res.status(501).send(); });
app.delete('/api/users/:id', deleteByIdHandler('Users'));


// Products
app.get('/api/products', async (req, res) => {
    try {
        // Basic filtering
        let whereClauses = [];
        let params = [];
        if (req.query.is_featured) {
            whereClauses.push('is_featured = ?');
            params.push(req.query.is_featured === 'true' ? 1 : 0);
        }
         if (req.query.mainCategory) {
            whereClauses.push('mainCategory = ?');
            params.push(req.query.mainCategory);
        }
         if (req.query.subCategory) {
            whereClauses.push('subCategory = ?');
            params.push(req.query.subCategory);
        }
        if(req.query.q) {
             whereClauses.push('name LIKE ?');
             params.push(`%${req.query.q}%`);
        }
        
        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        
        const countQuery = `SELECT COUNT(*) as total FROM Products ${whereSql}`;
        const [countResult] = await pool.query(countQuery, params);
        const totalProducts = countResult[0].total;

        const limit = parseInt(req.query.limit || '1000', 10);
        const page = parseInt(req.query.page || '1', 10);
        const offset = (page - 1) * limit;

        const dataQuery = `SELECT * FROM Products ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`;
        const [products] = await pool.query(dataQuery, [...params, limit, offset]);

        res.json({ products, totalProducts });
    } catch(err) {
         console.error("Database query error:", err);
        res.status(500).json({ message: "Lỗi cơ sở dữ liệu", error: err.message });
    }
});
app.get('/api/products/:id', getByIdHandler('Products'));
app.post('/api/products', (req, res) => res.status(501).send());
app.put('/api/products/:id', (req, res) => res.status(501).send());
app.delete('/api/products/:id', deleteByIdHandler('Products'));

// Articles
app.get('/api/articles', getAllHandler('Articles'));
app.get('/api/articles/:id', getByIdHandler('Articles'));
app.post('/api/articles', (req, res) => res.status(501).send());
app.put('/api/articles/:id', (req, res) => res.status(501).send());
app.delete('/api/articles/:id', deleteByIdHandler('Articles'));

// Orders
app.get('/api/orders', getAllHandler('Orders'));
app.get('/api/orders/customer/:customerId', (req, res) => handleQuery(res, 'SELECT * FROM Orders WHERE userId = ? ORDER BY orderDate DESC', [req.params.customerId]));
app.post('/api/orders', (req, res) => res.status(501).send());
app.put('/api/orders/:id', (req, res) => res.status(501).send());
app.delete('/api/orders/:id', deleteByIdHandler('Orders'));

// Service Tickets
app.get('/api/service-tickets', getAllHandler('ServiceTickets'));
app.post('/api/service-tickets', (req, res) => res.status(501).send());
app.put('/api/service-tickets/:id', (req, res) => res.status(501).send());
app.delete('/api/service-tickets/:id', deleteByIdHandler('ServiceTickets'));

// Warranty Claims
app.get('/api/warranty-tickets', getAllHandler('WarrantyClaims'));
app.post('/api/warranty-tickets', (req, res) => res.status(501).send());
app.put('/api/warranty-tickets/:id', (req, res) => res.status(501).send());
app.delete('/api/warranty-tickets/:id', deleteByIdHandler('WarrantyClaims'));


// Other placeholders to prevent 404s
app.get('/api/chatlogs', (req, res) => res.json([]));
app.post('/api/chatlogs', (req, res) => res.status(201).json(req.body));
app.get('/api/server-info', (req, res) => res.json({ outboundIp: 'Not available in local dev' }));
app.get('/api/media', (req, res) => res.json([]));
app.post('/api/media', (req, res) => res.status(201).json({id: `media-${Date.now()}`, ...req.body}));
app.delete('/api/media/:id', (req, res) => res.status(204).send());
app.get('/api/financials/transactions', (req, res) => res.json([]));
app.post('/api/financials/transactions', (req, res) => res.status(201).send());
app.get('/api/financials/payroll', (req, res) => res.json([]));
app.post('/api/financials/payroll', (req, res) => res.status(204).send());
app.get('/api/inventory', (req, res) => res.json([]));
app.get('/api/quotations', (req, res) => res.json([]));
app.delete('/api/quotations/:id', (req, res) => res.status(204).send());
app.get('/api/returns', (req, res) => res.json([]));
app.delete('/api/returns/:id', (req, res) => res.status(204).send());
app.get('/api/suppliers', (req, res) => res.json([]));
app.delete('/api/suppliers/:id', (req, res) => res.status(204).send());


// Final catch-all for 404s
app.use((req, res, next) => {
  res.status(404).json({ message: `API endpoint không tồn tại: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi server không xác định.' });
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// --- Database Connection ---
let pool;
try {
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log("Successfully connected to the database.");
} catch (error) {
    console.error("FATAL: Could not create database connection pool.", error);
    process.exit(1);
}


// --- API Endpoints ---

// Health Check
app.get('/api', (req, res) => {
    res.json({ message: 'IQ Technology Backend API is running.' });
});

// Products
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Products');
        // This is a simplified version. In a real app, you'd parse req.query for filtering/pagination.
        // For now, we return all and let the client filter for simplicity.
        res.json({ products: rows, totalProducts: rows.length });
    } catch (error) {
        res.status(500).json({ error: 'Database query failed', details: error.message });
    }
});
app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Products WHERE id = ?', [req.params.id]);
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).json({ error: 'Product not found' });
    } catch (error) {
        res.status(500).json({ error: 'Database query failed' });
    }
});
app.post('/api/products', async (req, res) => {
    const newProduct = req.body;
    newProduct.id = `prod-${Date.now()}`; // Generate ID server-side
    try {
        await pool.query('INSERT INTO Products SET ?', [newProduct]);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});
// Add PUT and DELETE for products...

// Users
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, email, role, staffRole, status, isLocked FROM Users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Database query failed' });
    }
});
// Add POST, PUT, DELETE for users...


// Orders
app.get('/api/orders', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Orders ORDER BY orderDate DESC');
        // In a real app, JSON fields would be parsed.
        res.json(rows.map(row => ({
            ...row,
            customerInfo: JSON.parse(row.customerInfo),
            items: JSON.parse(row.items),
            paymentInfo: JSON.parse(row.paymentInfo)
        })));
    } catch (error) {
        res.status(500).json({ error: 'Database query failed', details: error.message });
    }
});
app.post('/api/orders', async (req, res) => {
    const newOrder = req.body;
    // Serialize JSON fields for storage
    const orderToInsert = {
        ...newOrder,
        customerInfo: JSON.stringify(newOrder.customerInfo),
        items: JSON.stringify(newOrder.items),
        paymentInfo: JSON.stringify(newOrder.paymentInfo)
    };
    try {
        await pool.query('INSERT INTO Orders SET ?', [orderToInsert]);
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
});
// Add PUT for order status...


// Articles
app.get('/api/articles', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Articles ORDER BY date DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Database query failed' });
    }
});
// Add POST, PUT, DELETE for articles...

// --- Placeholder endpoints for new modules ---
const createPlaceholderEndpoints = (path, name) => {
    app.get(`/api/${path}`, (req, res) => res.json([]));
    app.post(`/api/${path}`, (req, res) => res.status(201).json({ message: `${name} created.` }));
    app.put(`/api/${path}/:id`, (req, res) => res.json({ message: `${name} updated.` }));
    app.delete(`/api/${path}/:id`, (req, res) => res.json({ message: `${name} deleted.` }));
}

createPlaceholderEndpoints('quotations', 'Quotation');
createPlaceholderEndpoints('servicetickets', 'Service Ticket');
createPlaceholderEndpoints('warrantytickets', 'Warranty Ticket');
createPlaceholderEndpoints('chatlogs', 'Chat Log');
createPlaceholderEndpoints('financialtransactions', 'Financial Transaction');
createPlaceholderEndpoints('payroll', 'Payroll Record');
createPlaceholderEndpoints('inventory', 'Inventory');


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

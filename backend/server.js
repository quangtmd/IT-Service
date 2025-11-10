
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import { fileURLToPath } from 'url';
import path from 'path';
import https from 'https';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for data URLs

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Static assets and Frontend serving ---
// This assumes the frontend is built into a 'dist' folder in the project root
// On Render, this would be '../dist' relative to the 'backend' folder.
const frontendDistPath = path.join(__dirname, '../dist');
app.use(express.static(frontendDistPath));


// --- Helper Functions ---
const parseJsonFields = (items, fields) => {
  if (!items) return;
  const processItem = (item) => {
    for (const field of fields) {
      if (item[field] && typeof item[field] === 'string') {
        try {
          item[field] = JSON.parse(item[field]);
        } catch (e) {
          console.error(`Could not parse JSON for field ${field}:`, item[field]);
        }
      }
    }
    return item;
  };
  if (Array.isArray(items)) {
    items.forEach(processItem);
  } else {
    processItem(items);
  }
};

const API_PREFIX = '/api';

// --- API Endpoints ---

// Health Check Endpoint to verify DB connection
app.get(`${API_PREFIX}/health`, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.status(200).json({ status: 'ok', message: 'Backend is running and connected to the database.' });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({
      status: 'error',
      message: 'Backend is running but could not connect to the database.',
      // In production, avoid sending detailed error messages to the client.
      error: process.env.NODE_ENV === 'production' ? 'Database connection error' : err.message
    });
  }
});


// Server Info
app.get(`${API_PREFIX}/server-info`, (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        https.get('https://api.ipify.org', ipRes => {
            let data = '';
            ipRes.on('data', chunk => data += chunk);
            ipRes.on('end', () => res.json({ outboundIp: data }));
        }).on('error', (err) => {
            res.status(500).json({ outboundIp: 'Error fetching IP' });
        });
    } else {
        res.json({ outboundIp: 'Not available in dev' });
    }
});


// Users
app.get(`${API_PREFIX}/users`, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM `users`');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post(`${API_PREFIX}/users/login`, async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM `users` WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Email không tồn tại.' });
        }
        // NOTE: In a real app, hash passwords! This is simplified.
        if (rows[0].password !== password) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
        }
        const { password: _, ...user } = rows[0];
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post(`${API_PREFIX}/users`, async (req, res) => {
    try {
        const user = req.body;
        const id = `user-${Date.now()}`;
        const newUser = { id, ...user };
        // NOTE: Hashing password should be done here
        await pool.query('INSERT INTO `users` SET ?', [newUser]);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put(`${API_PREFIX}/users/:id`, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        await pool.query('UPDATE `users` SET ? WHERE id = ?', [updates, id]);
        res.json({ message: 'User updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete(`${API_PREFIX}/users/:id`, async (req, res) => {
    try {
        await pool.query('DELETE FROM `users` WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Products
app.get(`${API_PREFIX}/products`, async (req, res) => {
    try {
        let query = 'SELECT * FROM `products` WHERE 1=1';
        const params = [];
        if (req.query.is_featured === 'true') {
            query += ' AND is_featured = ?';
            params.push(true);
        }
        if (req.query.mainCategory) {
            query += ' AND mainCategory = ?';
            params.push(req.query.mainCategory);
        }
        if (req.query.subCategory) {
            query += ' AND subCategory = ?';
            params.push(req.query.subCategory);
        }
        if (req.query.tags) {
            query += ' AND JSON_CONTAINS(tags, ?)';
            params.push(JSON.stringify(req.query.tags));
        }
        if (req.query.q) {
            query += ' AND `name` LIKE ?';
            params.push(`%${req.query.q}%`);
        }
        
        const [countResult] = await pool.query(query.replace('*', 'COUNT(*) as total'), params);
        const totalProducts = countResult[0].total;

        const limit = parseInt(req.query.limit) || 12;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        const [rows] = await pool.query(query, params);
        parseJsonFields(rows, ['imageUrls', 'specifications', 'tags']);
        res.json({ products: rows, totalProducts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get(`${API_PREFIX}/products/:id`, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM `products` WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        parseJsonFields(rows[0], ['imageUrls', 'specifications', 'tags']);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post(`${API_PREFIX}/products`, async (req, res) => {
    try {
        const product = req.body;
        const id = `prod-${Date.now()}`;
        const newProduct = { ...product, id,
            imageUrls: JSON.stringify(product.imageUrls || []),
            specifications: JSON.stringify(product.specifications || {}),
            tags: JSON.stringify(product.tags || [])
        };
        await pool.query('INSERT INTO `products` SET ?', [newProduct]);
        res.status(201).json({ id, ...product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put(`${API_PREFIX}/products/:id`, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        ['imageUrls', 'specifications', 'tags'].forEach(field => {
            if (updates[field]) updates[field] = JSON.stringify(updates[field]);
        });
        await pool.query('UPDATE `products` SET ? WHERE id = ?', [updates, id]);
        res.json({ message: 'Product updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete(`${API_PREFIX}/products/:id`, async (req, res) => {
    try {
        await pool.query('DELETE FROM `products` WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Generic CRUD factory
const createCrudEndpoints = (app, resource, table, jsonFields = []) => {
    app.get(`${API_PREFIX}/${resource}`, async (req, res) => {
        try {
            const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
            if (jsonFields.length) parseJsonFields(rows, jsonFields);
            res.json(rows);
        } catch (err) { res.status(500).json({ message: err.message }); }
    });
    app.get(`${API_PREFIX}/${resource}/:id`, async (req, res) => {
        try {
            const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE id = ?`, [req.params.id]);
            if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
            if (jsonFields.length) parseJsonFields(rows[0], jsonFields);
            res.json(rows[0]);
        } catch (err) { res.status(500).json({ message: err.message }); }
    });
    app.post(`${API_PREFIX}/${resource}`, async (req, res) => {
        try {
            const item = req.body;
            const id = `${resource.slice(0, 4)}-${Date.now()}`;
            const newItem = { ...item, id };
            jsonFields.forEach(field => {
                if (newItem[field]) newItem[field] = JSON.stringify(newItem[field]);
            });
            await pool.query(`INSERT INTO \`${table}\` SET ?`, [newItem]);
            res.status(201).json({ id, ...item });
        } catch (err) { res.status(500).json({ message: err.message }); }
    });
    app.put(`${API_PREFIX}/${resource}/:id`, async (req, res) => {
        try {
            const updates = req.body;
            jsonFields.forEach(field => {
                if (updates[field]) updates[field] = JSON.stringify(updates[field]);
            });
            await pool.query(`UPDATE \`${table}\` SET ? WHERE id = ?`, [updates, req.params.id]);
            res.json({ message: 'Updated' });
        } catch (err) { res.status(500).json({ message: err.message }); }
    });
    app.delete(`${API_PREFIX}/${resource}/:id`, async (req, res) => {
        try {
            await pool.query(`DELETE FROM \`${table}\` WHERE id = ?`, [req.params.id]);
            res.status(204).send();
        } catch (err) { res.status(500).json({ message: err.message }); }
    });
};

// Create CRUD for simple models
createCrudEndpoints(app, 'articles', 'articles');
createCrudEndpoints(app, 'chatlogs', 'chatlogs', ['messages']);
createCrudEndpoints(app, 'media', 'media');
createCrudEndpoints(app, 'financials/transactions', 'financial_transactions');
createCrudEndpoints(app, 'debts', 'debts');
createCrudEndpoints(app, 'inventory', 'inventory'); // Assuming read-only for now
createCrudEndpoints(app, 'quotations', 'quotations', ['customerInfo', 'items']);
createCrudEndpoints(app, 'returns', 'returns');
createCrudEndpoints(app, 'suppliers', 'suppliers', ['contactInfo']);
createCrudEndpoints(app, 'warranty-claims', 'warranty_claims');
createCrudEndpoints(app, 'service-tickets', 'service_tickets', ['customer_info', 'details']);

// Custom Order Endpoints
createCrudEndpoints(app, 'orders', 'orders', ['customerInfo', 'items', 'paymentInfo']);
app.get(`${API_PREFIX}/orders/customer/:customerId`, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM `orders` WHERE userId = ?', [req.params.customerId]);
        parseJsonFields(rows, ['customerInfo', 'items', 'paymentInfo']);
        res.json(rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
app.patch(`${API_PREFIX}/orders/:id/status`, async (req, res) => {
    try {
        await pool.query('UPDATE `orders` SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
        res.json({ message: 'Order status updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// Payroll
app.get(`${API_PREFIX}/financials/payroll`, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM `payroll_records`');
        res.json(rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
app.post(`${API_PREFIX}/financials/payroll`, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const records = req.body;
        for (const record of records) {
             // Upsert logic
            await connection.query('INSERT INTO `payroll_records` SET ? ON DUPLICATE KEY UPDATE ?', [record, record]);
        }
        await connection.commit();
        res.status(201).json({ message: 'Payroll saved' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        connection.release();
    }
});

// --- Frontend Catch-all ---
// This handler serves the `index.html` for any request that doesn't match an API route.
// It's essential for client-side routing (React Router) to work correctly in a single-server setup.
app.get('*', (req, res) => {
  // Check if the request is for an API endpoint that was missed. If so, return a 404.
  if (req.originalUrl.startsWith(API_PREFIX)) {
    return res.status(404).json({ message: 'API endpoint not found.' });
  }
  // Otherwise, serve the main frontend file.
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3001;

// --- New Server Start Function ---
const startServer = async () => {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Kết nối cơ sở dữ liệu thành công.');

    // Start the server if DB connection is successful
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Không thể kết nối tới cơ sở dữ liệu. Server không được khởi động.');
    console.error(err);
    process.exit(1); // Exit with an error code, so Render knows the deployment failed
  }
};

startServer();

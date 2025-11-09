import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for media uploads

// --- API Endpoints ---
const apiRouter = express.Router();

async function query(sql, params) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
}

// GET /api/server-info
apiRouter.get('/server-info', (req, res) => {
    res.json({
        outboundIp: process.env.RENDER_EXTERNAL_IP || 'Not available',
        message: "This IP is provided by the Render environment. Use it to whitelist database connections."
    });
});

// USERS
apiRouter.get('/users', async (req, res) => res.json(await query('SELECT id, username, email, role, staffRole, imageUrl, phone, address, joinDate, status, position, isLocked, dateOfBirth, origin, loyaltyPoints, debtStatus, assignedStaffId FROM Users')));
apiRouter.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });
    }
    const users = await query('SELECT * FROM Users WHERE email = ? AND password = ?', [email, password]);
    if (users.length > 0) {
        const { password, ...user } = users[0];
        res.json(user);
    } else {
        res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }
});
apiRouter.post('/users', async (req, res) => {
    const user = { ...req.body, id: `user-${Date.now()}` };
    await query('INSERT INTO Users SET ?', [user]);
    const { password, ...userToReturn } = user;
    res.status(201).json(userToReturn);
});
apiRouter.put('/users/:id', async (req, res) => {
    const { password, ...updates } = req.body; // Never update password this way
    await query('UPDATE Users SET ? WHERE id = ?', [updates, req.params.id]);
    res.json({ message: 'User updated' });
});
apiRouter.delete('/users/:id', async (req, res) => {
    await query('DELETE FROM Users WHERE id = ?', [req.params.id]);
    res.status(204).send();
});


// PRODUCTS
apiRouter.get('/products', async (req, res) => {
    let baseQuery = 'SELECT * FROM Products';
    let countQuery = 'SELECT COUNT(*) as total FROM Products';
    const whereClauses = [];
    let params = [];
    let countParams = [];

    if (req.query.is_featured === 'true') {
        whereClauses.push('is_featured = ?');
        params.push(1);
        countParams.push(1);
    }
    if (req.query.mainCategory) {
        whereClauses.push('mainCategory = ?');
        params.push(req.query.mainCategory);
        countParams.push(req.query.mainCategory);
    }
     if (req.query.subCategory) {
        whereClauses.push('subCategory = ?');
        params.push(req.query.subCategory);
        countParams.push(req.query.subCategory);
    }
    if (req.query.q) {
        whereClauses.push('name LIKE ?');
        params.push(`%${req.query.q}%`);
        countParams.push(`%${req.query.q}%`);
    }
     if (req.query.tags) {
        whereClauses.push('JSON_CONTAINS(tags, ?)');
        params.push(`"${req.query.tags}"`);
        countParams.push(`"${req.query.tags}"`);
    }

    if (whereClauses.length > 0) {
        const whereString = ' WHERE ' + whereClauses.join(' AND ');
        baseQuery += whereString;
        countQuery += whereString;
    }

    const [totalResult] = await query(countQuery, countParams);
    const totalProducts = totalResult[0].total;
    
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    baseQuery += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const products = await query(baseQuery, params);
    
    res.json({
        products: products.map(p => ({
            ...p,
            tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
            specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications,
            imageUrls: typeof p.imageUrls === 'string' ? JSON.parse(p.imageUrls) : p.imageUrls,
        })),
        totalProducts: totalProducts
    });
});
apiRouter.get('/products/:id', async (req, res) => {
    const products = await query('SELECT * FROM Products WHERE id = ?', [req.params.id]);
    if (products.length === 0) return res.status(404).json({ message: 'Product not found'});
    const p = products[0];
     res.json({
        ...p,
        tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
        specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications,
        imageUrls: typeof p.imageUrls === 'string' ? JSON.parse(p.imageUrls) : p.imageUrls,
    });
});
apiRouter.post('/products', async (req, res) => {
    const product = { 
      ...req.body,
      id: `prod-${Date.now()}`,
      tags: JSON.stringify(req.body.tags || []),
      specifications: JSON.stringify(req.body.specifications || {}),
      imageUrls: JSON.stringify(req.body.imageUrls || [])
    };
    await query('INSERT INTO Products SET ?', [product]);
    res.status(201).json(req.body);
});
apiRouter.put('/products/:id', async (req, res) => {
    const product = { 
      ...req.body,
      tags: JSON.stringify(req.body.tags || []),
      specifications: JSON.stringify(req.body.specifications || {}),
      imageUrls: JSON.stringify(req.body.imageUrls || [])
    };
    await query('UPDATE Products SET ? WHERE id = ?', [product, req.params.id]);
    res.json({ message: 'Product updated' });
});
apiRouter.delete('/products/:id', async (req, res) => {
    await query('DELETE FROM Products WHERE id = ?', [req.params.id]);
    res.status(204).send();
});

// ARTICLES
apiRouter.get('/articles', async (req, res) => res.json(await query('SELECT * FROM Articles ORDER BY date DESC')));
apiRouter.get('/articles/:id', async (req, res) => {
     const articles = await query('SELECT * FROM Articles WHERE id = ?', [req.params.id]);
     if (articles.length > 0) res.json(articles[0]);
     else res.status(404).json({message: 'Article not found'});
});
apiRouter.post('/articles', async (req, res) => {
    const article = { ...req.body, id: `art-${Date.now()}` };
    await query('INSERT INTO Articles SET ?', [article]);
    res.status(201).json(article);
});
apiRouter.put('/articles/:id', async (req, res) => {
    await query('UPDATE Articles SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ message: 'Article updated' });
});
apiRouter.delete('/articles/:id', async (req, res) => {
    await query('DELETE FROM Articles WHERE id = ?', [req.params.id]);
    res.status(204).send();
});

// ORDERS
apiRouter.get('/orders', async (req, res) => {
    const orders = await query('SELECT * FROM Orders ORDER BY orderDate DESC');
    res.json(orders.map(o => ({
        ...o,
        customerInfo: JSON.parse(o.customerInfo),
        items: JSON.parse(o.items),
        paymentInfo: JSON.parse(o.paymentInfo)
    })));
});
apiRouter.get('/orders/customer/:customerId', async (req, res) => {
    const orders = await query('SELECT * FROM Orders WHERE userId = ? ORDER BY orderDate DESC', [req.params.customerId]);
     res.json(orders.map(o => ({
        ...o,
        customerInfo: JSON.parse(o.customerInfo),
        items: JSON.parse(o.items),
        paymentInfo: JSON.parse(o.paymentInfo)
    })));
});
apiRouter.post('/orders', async (req, res) => {
    const order = {
        ...req.body,
        customerInfo: JSON.stringify(req.body.customerInfo),
        items: JSON.stringify(req.body.items),
        paymentInfo: JSON.stringify(req.body.paymentInfo)
    };
    await query('INSERT INTO Orders SET ?', [order]);
    res.status(201).json(req.body);
});
apiRouter.put('/orders/:id', async (req, res) => {
    const order = {
        ...req.body,
        customerInfo: JSON.stringify(req.body.customerInfo),
        items: JSON.stringify(req.body.items),
        paymentInfo: JSON.stringify(req.body.paymentInfo)
    };
    await query('UPDATE Orders SET ? WHERE id = ?', [order, req.params.id]);
    res.json(req.body);
});
apiRouter.delete('/orders/:id', async (req, res) => {
    await query('DELETE FROM Orders WHERE id = ?', [req.params.id]);
    res.status(204).send();
});

// CHATLOGS
apiRouter.get('/chatlogs', async (req, res) => {
    const logs = await query('SELECT * FROM ChatLogs ORDER BY startTime DESC');
    res.json(logs.map(l => ({...l, messages: JSON.parse(l.messages)})));
});
apiRouter.post('/chatlogs', async (req, res) => {
    const log = { ...req.body, messages: JSON.stringify(req.body.messages) };
    await query('INSERT INTO ChatLogs SET ? ON DUPLICATE KEY UPDATE messages = VALUES(messages), startTime = VALUES(startTime)', [log]);
    res.status(201).json(req.body);
});

// MEDIA
apiRouter.get('/media', async (req, res) => res.json(await query('SELECT * FROM Media ORDER BY uploadedAt DESC')));
apiRouter.post('/media', async (req, res) => {
    const item = { ...req.body, id: `media-${Date.now()}` };
    await query('INSERT INTO Media SET ?', [item]);
    res.status(201).json(item);
});
apiRouter.delete('/media/:id', async (req, res) => {
    await query('DELETE FROM Media WHERE id = ?', [req.params.id]);
    res.status(204).send();
});

// FINANCIALS
apiRouter.get('/financials/transactions', async (req, res) => res.json(await query('SELECT * FROM FinancialTransactions ORDER BY date DESC')));
apiRouter.post('/financials/transactions', async (req, res) => {
    const item = { ...req.body, id: `trans-${Date.now()}` };
    await query('INSERT INTO FinancialTransactions SET ?', [item]);
    res.status(201).json(item);
});
apiRouter.put('/financials/transactions/:id', async (req, res) => {
    await query('UPDATE FinancialTransactions SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ message: 'Transaction updated' });
});
apiRouter.delete('/financials/transactions/:id', async (req, res) => {
    await query('DELETE FROM FinancialTransactions WHERE id = ?', [req.params.id]);
    res.status(204).send();
});
apiRouter.get('/financials/payroll', async (req, res) => res.json(await query('SELECT * FROM PayrollRecords')));
apiRouter.post('/financials/payroll', async (req, res) => {
    const records = req.body;
    for (const record of records) {
        await query('INSERT INTO PayrollRecords SET ? ON DUPLICATE KEY UPDATE baseSalary=VALUES(baseSalary), bonus=VALUES(bonus), deduction=VALUES(deduction), finalSalary=VALUES(finalSalary), status=VALUES(status), notes=VALUES(notes)', [record]);
    }
    res.status(201).json({ message: 'Payroll saved' });
});

// SERVICE TICKETS
apiRouter.get('/service-tickets', async (req, res) => {
    const tickets = await query('SELECT * FROM ServiceTickets ORDER BY createdAt DESC');
    res.json(tickets.map(t => ({...t, customer_info: JSON.parse(t.customer_info)})));
});
apiRouter.post('/service-tickets', async (req, res) => {
    const ticket = { ...req.body, id: `st-${Date.now()}`, ticket_code: `ST-${String(Date.now()).slice(-6)}`, customer_info: JSON.stringify(req.body.customer_info) };
    await query('INSERT INTO ServiceTickets SET ?', [ticket]);
    const { customer_info, ...rest } = ticket;
    res.status(201).json({ ...rest, customer_info: req.body.customer_info });
});
apiRouter.put('/service-tickets/:id', async (req, res) => {
    const ticket = { ...req.body, customer_info: JSON.stringify(req.body.customer_info) };
    await query('UPDATE ServiceTickets SET ? WHERE id = ?', [ticket, req.params.id]);
    res.json({ message: 'Ticket updated' });
});
apiRouter.delete('/service-tickets/:id', async (req, res) => {
    await query('DELETE FROM ServiceTickets WHERE id = ?', [req.params.id]);
    res.status(204).send();
});

// WARRANTY TICKETS
apiRouter.get('/warranty-tickets', async (req, res) => res.json(await query('SELECT * FROM WarrantyTickets ORDER BY createdAt DESC')));
apiRouter.post('/warranty-tickets', async (req, res) => {
    const ticket = { ...req.body, id: `wt-${Date.now()}`};
    await query('INSERT INTO WarrantyTickets SET ?', [ticket]);
    res.status(201).json(ticket);
});
apiRouter.put('/warranty-tickets/:id', async (req, res) => {
    await query('UPDATE WarrantyTickets SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ message: 'Warranty Ticket updated' });
});
apiRouter.delete('/warranty-tickets/:id', async (req, res) => {
    await query('DELETE FROM WarrantyTickets WHERE id = ?', [req.params.id]);
    res.status(204).send();
});

// INVENTORY
apiRouter.get('/inventory', async (req, res) => res.json(await query('SELECT * FROM Inventory')));

// QUOTATIONS
apiRouter.get('/quotations', async (req, res) => {
    const quotes = await query('SELECT * FROM Quotations ORDER BY creation_date DESC');
    res.json(quotes.map(q => ({...q, items: JSON.parse(q.items)})));
});
apiRouter.post('/quotations', async (req, res) => {
    const quote = { ...req.body, items: JSON.stringify(req.body.items || []) };
    await query('INSERT INTO Quotations SET ?', [quote]);
    res.status(201).json(req.body);
});
apiRouter.put('/quotations/:id', async (req, res) => {
    const quote = { ...req.body, items: JSON.stringify(req.body.items || []) };
    await query('UPDATE Quotations SET ? WHERE id = ?', [quote, req.params.id]);
    res.json({ message: 'Quotation updated' });
});
apiRouter.delete('/quotations/:id', async (req, res) => {
    await query('DELETE FROM Quotations WHERE id = ?', [req.params.id]);
    res.status(204).send();
});

// RETURNS
apiRouter.get('/returns', async (req, res) => res.json(await query('SELECT * FROM Returns ORDER BY createdAt DESC')));
apiRouter.post('/returns', async (req, res) => {
    const item = { ...req.body, id: `ret-${Date.now()}`, createdAt: new Date().toISOString() };
    await query('INSERT INTO Returns SET ?', [item]);
    res.status(201).json(item);
});
apiRouter.put('/returns/:id', async (req, res) => {
    await query('UPDATE Returns SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ message: 'Return updated' });
});
apiRouter.delete('/returns/:id', async (req, res) => {
    await query('DELETE FROM Returns WHERE id = ?', [req.params.id]);
    res.status(204).send();
});

// SUPPLIERS
apiRouter.get('/suppliers', async (req, res) => {
    const suppliers = await query('SELECT * FROM Suppliers');
    res.json(suppliers.map(s => ({...s, contactInfo: JSON.parse(s.contactInfo)})));
});
apiRouter.post('/suppliers', async (req, res) => {
    const item = { ...req.body, id: `sup-${Date.now()}`, contactInfo: JSON.stringify(req.body.contactInfo || {}) };
    await query('INSERT INTO Suppliers SET ?', [item]);
    res.status(201).json({ ...req.body, id: item.id });
});
apiRouter.put('/suppliers/:id', async (req, res) => {
    const item = { ...req.body, contactInfo: JSON.stringify(req.body.contactInfo || {}) };
    await query('UPDATE Suppliers SET ? WHERE id = ?', [item, req.params.id]);
    res.json({ message: 'Supplier updated' });
});
apiRouter.delete('/suppliers/:id', async (req, res) => {
    await query('DELETE FROM Suppliers WHERE id = ?', [req.params.id]);
    res.status(204).send();
});

// CORRECT MIDDLEWARE ORDER TO FIX 404 ERRORS
// 1. Mount the API router to handle all /api requests first.
app.use('/api', apiRouter);

// 2. Serve static files for the frontend.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticFilesPath = path.resolve(__dirname, '..', 'dist');

console.log(`[Static Files] Server __dirname: ${__dirname}`);
console.log(`[Static Files] Resolved Project Root: ${path.resolve(__dirname, '..')}`);
console.log(`[Static Files] Attempting to serve static files from: ${staticFilesPath}`);

app.use(express.static(staticFilesPath));

// 3. Fallback for Single Page Application routing. This MUST be the last route.
// It catches any request that didn't match an API route or a static file, and serves the main HTML file.
app.get('*', (req, res) => {
  const indexPath = path.resolve(staticFilesPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`Error sending file ${indexPath} :`, err);
      if (!res.headersSent) {
        res.status(404).send("Could not find the application entry point.");
      }
    }
  });
});

// --- Server Start ---
app.listen(PORT, async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
    console.log('✅ Kết nối tới database MySQL thành công!`);
  } catch (error) {
    console.error('❌ Không thể kết nối tới database MySQL:', error);
  }
});

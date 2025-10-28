
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 10000;

// =================================================================
// 1. MIDDLEWARE SETUP
// =================================================================
app.use(cors()); 
app.use(express.json()); 

// =================================================================
// 2. MYSQL DATABASE CONNECTION SETUP
// =================================================================
const dbPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: 'Aa0908225224', // DIAGNOSTIC: Hardcoded password (Corrected)
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testDbConnection = async () => {
  try {
    const connection = await dbPool.getConnection();
    console.log("Successfully connected to the MySQL database.");
    connection.release();
  } catch (error) {
    console.error("Error connecting to the MySQL database:", error);
    // process.exit(1); // Temporarily disabled for diagnostics
  }
};

// =================================================================
// 3. API ENDPOINTS
// =================================================================

app.get('/', (req, res) => {
  res.send('IT Service Backend is running!');
});

app.post('/api/chat-logs', async (req, res) => {
  const { sessionId, userName, userPhone, startTime, messages } = req.body;
  if (!sessionId || !userName || !userPhone || !startTime || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  let connection;
  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();
    const [result] = await connection.execute(
      'INSERT INTO chat_logs (session_id, user_name, user_phone, start_time, full_log) VALUES (?, ?, ?, ?, ?)',
      [sessionId, userName, userPhone, startTime, JSON.stringify(messages)]
    );
    await connection.commit();
    res.status(201).json({ message: 'Chat log saved successfully', chatLogId: result.insertId });
  } catch (error) {
    console.error('Error saving chat log:', error);
    if (connection) await connection.rollback();
    res.status(500).json({ error: 'Failed to save chat log.' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/orders', async (req, res) => {
  const { customerName, customerPhone, customerAddress, customerEmail, notes, totalAmount, items } = req.body;
  if (!customerName || !customerPhone || !customerAddress || totalAmount === undefined || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  let connection;
  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (customer_name, customer_phone, customer_address, customer_email, notes, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customerName, customerPhone, customerAddress, customerEmail || null, notes || null, totalAmount, 'Pending']
    );
    const orderId = orderResult.insertId;
    const orderItemsValues = items.map(item => [
      orderId,
      item.productId,
      item.productName,
      item.quantity,
      item.price
    ]);
    await connection.query(
      'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES ?',
      [orderItemsValues]
    );
    await connection.commit();
    res.status(201).json({ message: 'Order placed successfully', orderId: orderId });
  } catch (error) {
    console.error('Error placing order:', error);
    if (connection) await connection.rollback();
    res.status(500).json({ error: 'Failed to place order.' });
  } finally {
    if (connection) connection.release();
  }
});

// =================================================================
// 4. START THE SERVER
// =================================================================
const startServer = async () => {
  await testDbConnection();
  app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
  });
};

startServer();

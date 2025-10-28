
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 10000;

// =================================================================
// 1. MIDDLEWARE SETUP
// =================================================================
// Enable CORS for all routes and from any origin for now.
// In a production environment, you should restrict this to your frontend's domain.
app.use(cors()); 
app.use(express.json()); // To parse JSON bodies from requests

// =================================================================
// 2. MYSQL DATABASE CONNECTION SETUP
// =================================================================
// Create a connection pool to manage connections efficiently.
const dbPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Async function to test the database connection on startup.
const testDbConnection = async () => {
  try {
    const connection = await dbPool.getConnection();
    console.log("Successfully connected to the MySQL database.");
    connection.release();
  } catch (error) {
    console.error("Error connecting to the MySQL database:", error);
    // Exit the process if the database connection fails, as the app is useless without it.
    process.exit(1); 
  }
};

// =================================================================
// 3. API ENDPOINTS
// =================================================================

// Simple root endpoint to check if the server is running.
app.get('/', (req, res) => {
  res.send('IT Service Backend is running!');
});

/**
 * @api {post} /api/chat-logs Save a new chat log
 * @apiName PostChatLog
 * @apiGroup Chat
 *
 * @apiBody {String} sessionId       A unique ID for the chat session.
 * @apiBody {String} userName        The name of the user.
 * @apiBody {String} userPhone       The phone number of the user.
 * @apiBody {String} startTime       The start time of the chat in ISO 8601 format.
 * @apiBody {Object[]} messages      An array of message objects.
 * @apiBody {String} messages.id     A unique ID for the message.
 * @apiBody {String} messages.text   The content of the message.
 * @apiBody {String} messages.sender Who sent the message ('user', 'bot', 'system').
 * @apiBody {String} messages.timestamp The time the message was sent in ISO 8601 format.
 *
 * @apiSuccess {String} message Confirmation message.
 * @apiSuccess {Number} chatLogId The ID of the newly created chat log record.
 */
app.post('/api/chat-logs', async (req, res) => {
  const { sessionId, userName, userPhone, startTime, messages } = req.body;

  // Basic validation
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


/**
 * @api {post} /api/orders Save a new order
 * @apiName PostOrder
 * @apiGroup Orders
 *
 * @apiBody {String} customerName        The name of the customer.
 * @apiBody {String} customerPhone       The phone number of the customer.
 * @apiBody {String} customerAddress     The shipping address.
 * @apiBody {String} [customerEmail]     The email of the customer (optional).
 * @apiBody {String} [notes]             Any notes for the order (optional).
 * @apiBody {Number} totalAmount         The total amount of the order.
 * @apiBody {Object[]} items             An array of items in the order.
 * @apiBody {String} items.productId     The ID of the product.
 * @apiBody {String} items.productName   The name of the product.
 * @apiBody {Number} items.quantity      The quantity of the product.
 * @apiBody {Number} items.price         The price of a single unit of the product.
 *
 * @apiSuccess {String} message Confirmation message.
 * @apiSuccess {Number} orderId The ID of the newly created order.
 */
app.post('/api/orders', async (req, res) => {
  const { customerName, customerPhone, customerAddress, customerEmail, notes, totalAmount, items } = req.body;

  // Basic validation
  if (!customerName || !customerPhone || !customerAddress || totalAmount === undefined || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  let connection;
  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    // 1. Insert into the `orders` table
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (customer_name, customer_phone, customer_address, customer_email, notes, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customerName, customerPhone, customerAddress, customerEmail || null, notes || null, totalAmount, 'Pending']
    );
    const orderId = orderResult.insertId;

    // 2. Insert into the `order_items` table
    const orderItemsValues = items.map(item => [
      orderId,
      item.productId,
      item.productName,
      item.quantity,
      item.price
    ]);

    // Note: The `mysql2` library automatically handles turning cái array of arrays into the correct format for a multi-row insert.
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

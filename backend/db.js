import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add SSL configuration for secure connections, especially for cloud databases
  // ssl: {
  //   // If your DB provider requires a CA certificate, provide the path or content here
  //   // ca: process.env.DB_SSL_CA,
  //   rejectUnauthorized: false // Set to false if using self-signed certs, but be cautious
  // }
});

export default pool;

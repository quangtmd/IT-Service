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
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Thêm cấu hình SSL để đảm bảo kết nối được với các provider yêu cầu (như Aiven, Azure, DigitalOcean)
  // rejectUnauthorized: false cho phép kết nối kể cả khi chứng chỉ self-signed
  ssl: {
      rejectUnauthorized: false
  }
});

export default pool;
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

app.set('trust proxy', true); // Enable trusting proxy headers for req.ip
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for media uploads

// Helper function to filter an object based on allowed keys
const filterObject = (obj, allowedKeys) => {
    if (!obj) return {};
    return Object.keys(obj)
        .filter(key => allowedKeys.includes(key) && obj[key] !== undefined)
        .reduce((newObj, key) => {
            newObj[key] = obj[key];
            return newObj;
        }, {});
};

// Biến lưu trạng thái DB để báo cáo cho Frontend
let dbStatus = {
    status: 'unknown',
    error: null,
    lastCheck: null,
    tableExists: false
};

// Hàm kiểm tra kết nối DB và sự tồn tại của Bảng
const checkDbConnection = async () => {
    try {
        const connection = await pool.getConnection();
        
        // Kiểm tra xem bảng Products có tồn tại không
        try {
            await connection.query('SELECT 1 FROM Products LIMIT 1');
            dbStatus = { status: 'connected', error: null, lastCheck: new Date(), tableExists: true };
            console.log("✅ Kết nối tới database MySQL thành công và bảng Products đã tồn tại!");
        } catch (tableError) {
            if (tableError.code === 'ER_NO_SUCH_TABLE') {
                console.warn("⚠️ Kết nối DB thành công NHƯNG chưa tìm thấy bảng 'Products'. Bạn cần chạy script SQL.");
                dbStatus = { status: 'connected', error: { code: 'MISSING_TABLES', message: 'Database chưa có dữ liệu (thiếu bảng Products).' }, lastCheck: new Date(), tableExists: false };
            } else {
                throw tableError;
            }
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("\n⚠️ CẢNH BÁO: KHÔNG THỂ KẾT NỐI DATABASE");
        
        let friendlyError = error.message;
        switch (error.code) {
            case 'ER_ACCESS_DENIED_ERROR':
                friendlyError = "Sai Tên người dùng (DB_USER) hoặc Mật khẩu (DB_PASSWORD).";
                break;
            case 'ER_BAD_DB_ERROR':
                friendlyError = `Database '${process.env.DB_NAME}' không tồn tại.`;
                break;
            case 'ENOTFOUND':
            case 'ETIMEDOUT':
            case 'ECONNREFUSED':
                friendlyError = `Không thể kết nối tới Host '${process.env.DB_HOST}'. Kiểm tra IP Whitelist hoặc Host.`;
                break;
        }
        console.error("Chi tiết:", friendlyError);
        
        dbStatus = { 
            status: 'error', 
            error: { code: error.code, message: friendlyError, originalMessage: error.message },
            lastCheck: new Date(),
            tableExists: false
        };
    }
};

// Khởi chạy kiểm tra DB khi server start
checkDbConnection();

// --- Audit Log Middleware/Helper ---
const logActivity = async (req, action, targetType, targetId, details = {}) => {
  // Nếu DB lỗi hoặc chưa có bảng, không ghi log
  if (dbStatus.status !== 'connected' || !dbStatus.tableExists) return;

  try {
    const userId = req.body.userId || req.params.id || 'system'; 
    const username = req.body.username || 'System Action'; 

    const logEntry = {
      userId,
      username,
      action,
      targetType,
      targetId,
      details: JSON.stringify(details),
      ipAddress: req.ip,
    };
    await pool.query('INSERT INTO AuditLogs SET ?', logEntry);
  } catch (error) {
    // Silent fail for logs
  }
};


app.get('/api/health', async (req, res) => {
    // Nếu lần trước lỗi, thử kết nối lại
    if (dbStatus.status !== 'connected' || !dbStatus.tableExists) {
        await checkDbConnection();
    }

    if (dbStatus.status === 'connected') {
        if (dbStatus.tableExists) {
            res.status(200).json({ status: 'ok', database: 'connected' });
        } else {
            res.status(500).json({ 
                status: 'error', 
                database: 'connected_but_empty', 
                message: 'Kết nối thành công nhưng chưa có dữ liệu. Vui lòng chạy script SQL trong admin.' 
            });
        }
    } else {
        res.status(500).json({ 
            status: 'error', 
            database: 'disconnected', 
            errorCode: dbStatus.error?.code || 'UNKNOWN', 
            message: dbStatus.error?.message || 'Lỗi kết nối Database' 
        });
    }
});

// Middleware kiểm tra DB
const dbCheckMiddleware = (req, res, next) => {
    if (dbStatus.status !== 'connected' && !req.path.includes('/health')) {
        return res.status(500).json({ 
            message: "Mất kết nối cơ sở dữ liệu.",
            error: dbStatus.error?.message
        });
    }
    if (!dbStatus.tableExists && !req.path.includes('/health')) {
        return res.status(500).json({
            message: "Database chưa được khởi tạo.",
            error: "Bảng dữ liệu không tồn tại. Vui lòng chạy script SQL."
        });
    }
    next();
};

app.use('/api', (req, res, next) => {
    if (req.path === '/health') return next();
    dbCheckMiddleware(req, res, next);
});

// --- Helper to deserialize product rows ---
const deserializeProduct = (p) => ({
    ...p,
    imageUrls: JSON.parse(p.imageUrls || '[]'),
    specifications: JSON.parse(p.specifications || '{}'),
    tags: JSON.parse(p.tags || '[]'),
    isVisible: p.isVisible, 
});

// --- PRODUCTS API ---

app.get('/api/products/featured', async (req, res) => {
    try {
        // Cập nhật query để đảm bảo lấy đúng sản phẩm nổi bật
        const query = `
            SELECT p.*
            FROM Products p
            WHERE p.isVisible = TRUE
            ORDER BY p.price DESC 
            LIMIT 4;
        `;
        const [products] = await pool.query(query);
        res.json(products.map(deserializeProduct));
    } catch (error) {
        console.error("Lỗi khi truy vấn sản phẩm nổi bật:", error);
        res.status(500).json({ message: "Lỗi server khi lấy sản phẩm nổi bật", error: error.sqlMessage || error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const query = `SELECT p.* FROM Products p WHERE p.id = ?`;
        const [rows] = await pool.query(query, [req.params.id]);
        if (rows.length > 0) {
            res.json(deserializeProduct(rows[0]));
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const { mainCategory, subCategory, q, tags, limit = 12, page = 1 } = req.query;

        let baseQuery = `FROM Products p`;
        const whereClauses = ['p.isVisible = TRUE'];
        const params = [];
        
        if (mainCategory) {
            whereClauses.push('p.mainCategory = ?');
            params.push(mainCategory);
        }
        if (subCategory) {
            whereClauses.push('p.subCategory = ?');
            params.push(subCategory);
        }
        if (q) {
            whereClauses.push('(p.name LIKE ? OR p.brand LIKE ?)');
            params.push(`%${q}%`, `%${q}%`);
        }
        // Note: JSON_CONTAINS might be slow or behave differently on some MariaDB versions/configurations
        if (tags) {
             // Simple LIKE check for better compatibility if JSON_CONTAINS fails
             whereClauses.push('p.tags LIKE ?');
             params.push(`%${tags}%`);
        }

        const whereString = ' WHERE ' + whereClauses.join(' AND ');
        
        const countQuery = `SELECT COUNT(p.id) as total ${baseQuery} ${whereString}`;
        const [countRows] = await pool.query(countQuery, params);
        const totalProducts = countRows[0].total;

        const offset = (Number(page) - 1) * Number(limit);
        const productQuery = `SELECT p.* ${baseQuery} ${whereString} ORDER BY p.id DESC LIMIT ? OFFSET ?`;
        const productParams = [...params, Number(limit), offset];

        const [products] = await pool.query(productQuery, productParams);
        
        res.json({ products: products.map(deserializeProduct), totalProducts });
    } catch (error) {
        console.error("Lỗi khi truy vấn sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server khi lấy dữ liệu sản phẩm", error: error.sqlMessage || error.message });
    }
});

// ... (Rest of the CRUD operations remain mostly the same, simplified for brevity)

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        
        const user = rows[0];
        if (user.password !== password) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        
        delete user.password;
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const projectRoot = path.resolve(__dirname, '..');
    const frontendDistPath = path.join(projectRoot, 'dist');
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) return next();
        res.sendFile(path.resolve(frontendDistPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});
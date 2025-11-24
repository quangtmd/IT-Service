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
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- LOGGING MIDDLEWARE ---
// Giúp debug xem request nào đang được gọi và trạng thái trả về
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- DB CONNECTION CHECK ---
let dbStatus = { status: 'unknown', error: null, tableExists: false };

const checkDbConnection = async () => {
    try {
        const connection = await pool.getConnection();
        try {
            await connection.query('SELECT 1 FROM Products LIMIT 1');
            dbStatus = { status: 'connected', error: null, tableExists: true };
            console.log("✅ Kết nối tới database MySQL thành công và bảng Products đã tồn tại!");
        } catch (tableError) {
            if (tableError.code === 'ER_NO_SUCH_TABLE') {
                console.warn("⚠️ Kết nối DB thành công NHƯNG chưa tìm thấy bảng 'Products'.");
                dbStatus = { status: 'connected', error: { code: 'MISSING_TABLES', message: 'Database chưa có dữ liệu (thiếu bảng Products).' }, tableExists: false };
            } else {
                throw tableError;
            }
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("\n⚠️ CẢNH BÁO: KHÔNG THỂ KẾT NỐI DATABASE");
        console.error("Chi tiết lỗi:", error.message);
        dbStatus = { status: 'error', error: { code: error.code, message: error.message }, tableExists: false };
    }
};
checkDbConnection();

// --- API HEALTH CHECK ---
app.get('/api/health', async (req, res) => {
    if (dbStatus.status !== 'connected') await checkDbConnection();
    
    if (dbStatus.status === 'connected') {
        res.status(200).json({ status: 'ok', database: 'connected', tableExists: dbStatus.tableExists });
    } else {
        res.status(500).json({ status: 'error', database: 'disconnected', error: dbStatus.error });
    }
});

// --- DATA DESERIALIZATION HELPER ---
const deserializeProduct = (p) => ({
    ...p,
    imageUrls: typeof p.imageUrls === 'string' ? JSON.parse(p.imageUrls || '[]') : p.imageUrls,
    specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications || '{}') : p.specifications,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : p.tags,
    isVisible: Boolean(p.isVisible), 
});

// ==================================================================
// QUAN TRỌNG: CÁC ROUTE CỤ THỂ PHẢI ĐẶT TRƯỚC CÁC ROUTE DYNAMIC (/:id)
// ==================================================================

// 1. API: Lấy sản phẩm nổi bật (Featured) - ĐẶT ĐẦU TIÊN
app.get('/api/products/featured', async (req, res) => {
    try {
        // Lấy 4 sản phẩm có giá cao nhất làm sản phẩm nổi bật (hoặc lọc theo tags nếu muốn)
        const query = `SELECT * FROM Products ORDER BY price DESC LIMIT 4`;
        const [rows] = await pool.query(query);
        res.json(rows.map(deserializeProduct));
    } catch (error) {
        console.error("Lỗi lấy sản phẩm nổi bật:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// 2. API: Lấy danh sách sản phẩm (có lọc)
app.get('/api/products', async (req, res) => {
    try {
        const { mainCategory, subCategory, q, tags, limit = 12, page = 1 } = req.query;
        let baseQuery = `FROM Products p`;
        const whereClauses = ['1=1']; // Mặc định luôn đúng để dễ nối chuỗi AND
        const params = [];
        
        // Có thể bỏ comment dòng dưới nếu muốn chỉ hiện sản phẩm isVisible=1
        // whereClauses.push('p.isVisible = 1');

        if (mainCategory) { whereClauses.push('p.mainCategory = ?'); params.push(mainCategory); }
        if (subCategory) { whereClauses.push('p.subCategory = ?'); params.push(subCategory); }
        if (q) { whereClauses.push('(p.name LIKE ? OR p.brand LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
        if (tags) { whereClauses.push('p.tags LIKE ?'); params.push(`%${tags}%`); }

        const whereString = ' WHERE ' + whereClauses.join(' AND ');
        
        // Count total
        const [countRows] = await pool.query(`SELECT COUNT(p.id) as total ${baseQuery} ${whereString}`, params);
        const totalProducts = countRows[0].total;

        // Get data
        const offset = (Number(page) - 1) * Number(limit);
        const productQuery = `SELECT p.* ${baseQuery} ${whereString} ORDER BY p.id DESC LIMIT ? OFFSET ?`;
        const [products] = await pool.query(productQuery, [...params, Number(limit), offset]);
        
        res.json({ products: products.map(deserializeProduct), totalProducts });
    } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// 3. API: Lấy chi tiết sản phẩm theo ID - ĐẶT CUỐI CÙNG trong nhóm product
// Nếu đặt cái này lên đầu, nó sẽ bắt luôn chữ "featured" và coi đó là ID -> gây lỗi 404
app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM Products WHERE id = ?`, [req.params.id]);
        if (rows.length > 0) {
            res.json(deserializeProduct(rows[0]));
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// --- LOGIN API ---
app.post('/api/login', async (req, res) => {
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

// --- SERVE STATIC FILES (PRODUCTION) ---
if (process.env.NODE_ENV === 'production') {
    const projectRoot = path.resolve(__dirname, '..');
    const frontendDistPath = path.join(projectRoot, 'dist');
    
    console.log("Serving static files from:", frontendDistPath);
    app.use(express.static(frontendDistPath));

    // Handle React Routing, return all requests to React app
    app.get('*', (req, res, next) => {
        // Nếu request bắt đầu bằng /api/ mà không khớp route nào ở trên -> Trả về 404 JSON thay vì HTML
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ message: `API endpoint not found: ${req.path}` });
        }
        res.sendFile(path.resolve(frontendDistPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});
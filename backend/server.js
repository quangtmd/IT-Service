import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

(async () => {
    try {
        pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        console.log("✅ Kết nối tới database MySQL thành công!");
        connection.release();
    } catch (error) {
        console.error("\n\n❌ LỖI KẾT NỐI DATABASE NGHIÊM TRỌNG ❌");
        console.error("------------------------------------------------------------------");
        
        switch (error.code) {
            case 'ER_ACCESS_DENIED_ERROR':
                console.error("👉 NGUYÊN NHÂN: Sai Tên người dùng (DB_USER) hoặc Mật khẩu (DB_PASSWORD).");
                console.error("   HƯỚNG DẪN: Vui lòng kiểm tra lại các biến môi trường DB_USER và DB_PASSWORD trên Render.");
                break;
            case 'ER_BAD_DB_ERROR':
                console.error(`👉 NGUYÊN NHÂN: Tên database '${process.env.DB_NAME}' không tồn tại.`);
                console.error("   HƯỚNG DẪN: Kiểm tra lại biến môi trường DB_NAME và đảm bảo database này đã được tạo trên máy chủ MySQL của bạn.");
                break;
            case 'ENOTFOUND':
            case 'ETIMEDOUT':
            case 'ECONNREFUSED':
                console.error(`👉 NGUYÊN NHÂN: Không thể kết nối tới Host ('${process.env.DB_HOST}').`);
                console.error("   Lý do phổ biến nhất là do IP của server Render chưa được cho phép (whitelisted) trên Hostinger (hoặc nhà cung cấp database của bạn).");
                console.error("   HƯỚNG DẪN:");
                console.error("   1. Vào trang quản lý database trên Hostinger.");
                console.error("   2. Tìm mục 'Remote MySQL'.");
                console.error("   3. Thêm địa chỉ IP của Render vào danh sách cho phép. Bạn có thể tìm IP này trong tab 'Networking' của service backend trên Render.");
                console.error("   4. Nếu vẫn không được, hãy kiểm tra lại biến môi trường DB_HOST.");
                break;
            default:
                console.error("👉 NGUYÊN NHÂN: Một lỗi không xác định đã xảy ra.");
                console.error("   CHI TIẾT LỖI:", error.message);
                console.error("   HƯỚNG DẪN: Kiểm tra lại toàn bộ các biến môi trường (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).");
        }
        
        console.error("------------------------------------------------------------------");
        console.error("Backend không thể khởi động do lỗi kết nối database.");
        process.exit(1); // Exit the process
    }
})();


app.get('/api/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        // Check for a critical table
        await connection.query("SELECT 1 FROM Products LIMIT 1;");
        connection.release();
        res.status(200).json({ status: 'ok', database: 'connected' });
    } catch (error) {
        let errorCode = 'UNKNOWN_DB_ERROR';
        let errorMessage = 'Lỗi không xác định khi truy vấn database.';

        switch (error.code) {
            case 'ER_ACCESS_DENIED_ERROR':
                errorCode = 'ER_ACCESS_DENIED_ERROR';
                errorMessage = 'Sai tên người dùng hoặc mật khẩu database.';
                break;
            case 'ER_BAD_DB_ERROR':
                errorCode = 'ER_BAD_DB_ERROR';
                errorMessage = `Database '${process.env.DB_NAME}' không tồn tại.`;
                break;
            case 'ENOTFOUND':
            case 'ETIMEDOUT':
            case 'ECONNREFUSED':
                errorCode = 'ETIMEDOUT';
                errorMessage = `Không thể kết nối tới host '${process.env.DB_HOST}'. Rất có thể IP của Render chưa được whitelist.`;
                break;
            case 'ER_NO_SUCH_TABLE':
                errorCode = 'MISSING_TABLES';
                errorMessage = `Kết nối database thành công nhưng không tìm thấy bảng 'Products'. Vui lòng chạy SQL để tạo bảng.`;
                break;
        }
        
        console.error("Lỗi health check:", error);
        res.status(500).json({ status: 'error', database: 'disconnected', errorCode, message: errorMessage });
    }
});

// GET FEATURED PRODUCTS - Dedicated endpoint
app.get('/api/products/featured', async (req, res) => {
    try {
        const query = `
            SELECT * FROM Products
            WHERE is_published = TRUE AND is_featured = TRUE
            ORDER BY RAND()
            LIMIT 4;
        `;
        const [products] = await pool.query(query);
        res.json(products); // Return the array directly
    } catch (error) {
        console.error("Lỗi khi truy vấn sản phẩm nổi bật:", error);
        res.status(500).json({ message: "Lỗi server khi lấy sản phẩm nổi bật", error: error.sqlMessage || error.message });
    }
});


// GET ALL PRODUCTS (with filtering and pagination)
app.get('/api/products', async (req, res) => {
    try {
        const { mainCategory, subCategory, brand, status, tags, q, limit = 12, page = 1 } = req.query;

        let baseQuery = `
            SELECT p.*, c.name as categoryName, c.slug as categorySlug, mc.name as mainCategoryName, mc.slug as mainCategorySlug
            FROM Products p
            LEFT JOIN ProductCategories c ON p.category_id = c.id
            LEFT JOIN ProductCategories mc ON c.parent_category_id = mc.id
        `;
        let countQuery = `
            SELECT COUNT(p.id) as total
            FROM Products p
            LEFT JOIN ProductCategories c ON p.category_id = c.id
            LEFT JOIN ProductCategories mc ON c.parent_category_id = mc.id
        `;
        
        const whereClauses = ['p.is_published = TRUE'];
        const params = [];
        
        if (mainCategory) {
            whereClauses.push('mc.slug = ?');
            params.push(mainCategory);
        }
        if (subCategory) {
            whereClauses.push('c.slug = ?');
            params.push(subCategory);
        }
         if (q) {
            whereClauses.push('p.name LIKE ?');
            params.push(`%${q}%`);
        }

        if (whereClauses.length > 0) {
            const whereString = ' WHERE ' + whereClauses.join(' AND ');
            baseQuery += whereString;
            countQuery += whereString;
        }
        
        const [countRows] = await pool.query(countQuery, params);
        const totalProducts = countRows[0].total;
        
        const offset = (Number(page) - 1) * Number(limit);
        baseQuery += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), offset);

        const [products] = await pool.query(baseQuery, params);
        
        res.json({ products, totalProducts });
    } catch (error) {
        console.error("Lỗi khi truy vấn sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server khi lấy dữ liệu sản phẩm", error: error.sqlMessage || error.message });
    }
});

// GET SINGLE PRODUCT
app.get('/api/products/:id', async (req, res) => {
    try {
        const [product] = await pool.query('SELECT * FROM Products WHERE id = ?', [req.params.id]);
        if (product.length > 0) {
            res.json(product[0]);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        console.error(`Lỗi khi truy vấn sản phẩm ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

// GET ALL ARTICLES
app.get('/api/articles', async (req, res) => {
     try {
        const [articles] = await pool.query('SELECT * FROM Articles ORDER BY date DESC');
        res.json(articles);
    } catch (error) {
        console.error("Lỗi khi truy vấn bài viết:", error);
        res.status(500).json({ message: "Lỗi server khi lấy bài viết", error: error.sqlMessage || error.message });
    }
});

// GET SINGLE ARTICLE
app.get('/api/articles/:id', async (req, res) => {
    try {
        const [article] = await pool.query('SELECT * FROM Articles WHERE id = ?', [req.params.id]);
        if (article.length > 0) {
            res.json(article[0]);
        } else {
            res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }
    } catch (error) {
        console.error(`Lỗi khi truy vấn bài viết ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});


// GET ALL ORDERS
app.get('/api/orders', async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM Orders ORDER BY orderDate DESC');
        res.json(orders);
    } catch (error) {
        console.error("Lỗi khi truy vấn đơn hàng:", error);
        res.status(500).json({ message: "Lỗi server khi lấy đơn hàng", error: error.sqlMessage || error.message });
    }
});

// CREATE NEW ORDER
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        
        // Reconstruct order object to ensure data integrity
        const newOrder = {
            id: orderData.id,
            customerInfo: JSON.stringify(orderData.customerInfo),
            items: JSON.stringify(orderData.items.map(item => ({
                productId: item.id || item.productId,
                productName: item.name || item.productName,
                quantity: item.quantity,
                price: item.price
            }))),
            totalAmount: orderData.totalAmount,
            orderDate: orderData.orderDate,
            status: orderData.status,
            paymentInfo: JSON.stringify(orderData.paymentInfo),
        };

        await pool.query('INSERT INTO Orders SET ?', newOrder);
        res.status(201).json(orderData);
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi không mong muốn khi tạo đơn hàng.", error: error.sqlMessage || error.message });
    }
});

// Add a catch-all for the root to guide users who land here by mistake
app.get('/', (req, res) => {
    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Backend Server - IQ Technology</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5; color: #333; }
                .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px; margin: 20px; }
                h1 { color: #ef4444; }
                p { line-height: 1.6; }
                code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>👋 Xin chào! Đây là Máy chủ Backend.</h1>
                <p>Dịch vụ này đang hoạt động và sẵn sàng xử lý các yêu cầu API từ ứng dụng web.</p>
                <p>Có vẻ như bạn đã truy cập trực tiếp vào địa chỉ URL của backend. Để xem trang web, vui lòng sử dụng địa chỉ URL của dịch vụ <strong>Frontend (Static Site)</strong> trên Render.</p>
                <p>URL của frontend thường có tên là <code>it-service-frontend</code> hoặc tương tự.</p>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});
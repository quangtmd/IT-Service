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

// --- PRODUCTS API ---

app.get('/api/products/featured', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*,
                c.name as subCategory,
                mc.name as mainCategory
            FROM Products p
            LEFT JOIN ProductCategories c ON p.category_id = c.id
            LEFT JOIN ProductCategories mc ON c.parent_category_id = mc.id
            WHERE p.is_published = TRUE AND p.is_featured = TRUE
            ORDER BY RAND()
            LIMIT 4;
        `;
        const [products] = await pool.query(query);
         const deserializedProducts = products.map(p => ({
            ...p,
            imageUrls: JSON.parse(p.imageUrls || '[]'),
            specifications: JSON.parse(p.specifications || '{}'),
            tags: JSON.parse(p.tags || '[]'),
            isVisible: p.is_published,
        }));
        res.json(deserializedProducts);
    } catch (error) {
        console.error("Lỗi khi truy vấn sản phẩm nổi bật:", error);
        res.status(500).json({ message: "Lỗi server khi lấy sản phẩm nổi bật", error: error.sqlMessage || error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*, 
                c.name as subCategory, 
                mc.name as mainCategory 
            FROM Products p
            LEFT JOIN ProductCategories c ON p.category_id = c.id
            LEFT JOIN ProductCategories mc ON c.parent_category_id = mc.id
            WHERE p.id = ?
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        const product = rows[0];
        if (product) {
            // Deserialize JSON fields
            product.imageUrls = JSON.parse(product.imageUrls || '[]');
            product.specifications = JSON.parse(product.specifications || '{}');
            product.tags = JSON.parse(product.tags || '[]');
            product.isVisible = product.is_published;
            res.json(product);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        console.error(`Lỗi khi truy vấn sản phẩm ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const { mainCategory, subCategory, brand, status, tags, q, limit = 12, page = 1 } = req.query;

        let baseQuery = `
            SELECT 
                p.*, 
                c.name as subCategory, 
                mc.name as mainCategory 
            FROM Products p
        `;
        let countQuery = `SELECT COUNT(p.id) as total FROM Products p`;
        
        const joins = [];
        joins.push('LEFT JOIN ProductCategories c ON p.category_id = c.id');
        joins.push('LEFT JOIN ProductCategories mc ON c.parent_category_id = mc.id');
        
        const joinString = joins.join(' ');
        baseQuery += ` ${joinString}`;
        countQuery += ` ${joinString}`;
        
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
            whereClauses.push('(p.name LIKE ? OR p.brand LIKE ?)');
            params.push(`%${q}%`, `%${q}%`);
        }
        if (tags) {
            whereClauses.push('JSON_CONTAINS(p.tags, ?)');
            params.push(JSON.stringify(tags));
        }

        if (whereClauses.length > 0) {
            const whereString = ' WHERE ' + whereClauses.join(' AND ');
            baseQuery += whereString;
            countQuery += whereString;
        }
        
        const [countRows] = await pool.query(countQuery, params);
        const totalProducts = countRows[0].total;
        
        const offset = (Number(page) - 1) * Number(limit);
        baseQuery += ` ORDER BY p.id DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), offset);

        const [products] = await pool.query(baseQuery, params);
        
        const deserializedProducts = products.map(p => ({
            ...p,
            imageUrls: JSON.parse(p.imageUrls || '[]'),
            specifications: JSON.parse(p.specifications || '{}'),
            tags: JSON.parse(p.tags || '[]'),
            isVisible: p.is_published,
        }));
        
        res.json({ products: deserializedProducts, totalProducts });
    } catch (error) {
        console.error("Lỗi khi truy vấn sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server khi lấy dữ liệu sản phẩm", error: error.sqlMessage || error.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { mainCategory, subCategory, isVisible, category, ...productData } = req.body;

        let category_id = null;
        if (mainCategory && subCategory) {
            const [mainCatRows] = await pool.query(
                'SELECT id FROM ProductCategories WHERE name = ? AND parent_category_id IS NULL', 
                [mainCategory]
            );
            if (mainCatRows.length > 0) {
                const mainCatId = mainCatRows[0].id;
                const [subCatRows] = await pool.query(
                    'SELECT id FROM ProductCategories WHERE name = ? AND parent_category_id = ?', 
                    [subCategory, mainCatId]
                );
                if (subCatRows.length > 0) {
                    category_id = subCatRows[0].id;
                }
            }
        }
        
        const productToInsert = {
            ...productData,
            id: productData.id || `prod-${Date.now()}`,
            imageUrls: JSON.stringify(productData.imageUrls || []),
            specifications: JSON.stringify(productData.specifications || {}),
            tags: JSON.stringify(productData.tags || []),
            is_published: isVisible,
            category_id: category_id,
        };

        await pool.query('INSERT INTO Products SET ?', productToInsert);
        
        const responseProduct = { ...req.body, id: productToInsert.id };
        res.status(201).json(responseProduct);
    } catch (error) {
        console.error("Lỗi khi tạo sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server", error: error.sqlMessage || error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mainCategory, subCategory, isVisible, category, ...productData } = req.body;
        
        const updatedProductFields = {
            ...productData,
            imageUrls: JSON.stringify(productData.imageUrls || []),
            specifications: JSON.stringify(productData.specifications || {}),
            tags: JSON.stringify(productData.tags || []),
            is_published: isVisible,
        };
        
        if (mainCategory && subCategory) {
            let category_id = null;
            const [mainCatRows] = await pool.query(
                'SELECT id FROM ProductCategories WHERE name = ? AND parent_category_id IS NULL', 
                [mainCategory]
            );
            if (mainCatRows.length > 0) {
                const mainCatId = mainCatRows[0].id;
                const [subCatRows] = await pool.query(
                    'SELECT id FROM ProductCategories WHERE name = ? AND parent_category_id = ?', 
                    [subCategory, mainCatId]
                );
                if (subCatRows.length > 0) {
                    category_id = subCatRows[0].id;
                }
            }
            updatedProductFields.category_id = category_id;
        }
        
        delete updatedProductFields.id;
        
        const [result] = await pool.query('UPDATE Products SET ? WHERE id = ?', [updatedProductFields, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
        }
        res.json({ id, ...req.body });
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server", error: error.sqlMessage || error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM Products WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
        }
        res.status(204).send(); // No content
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server", error: error.sqlMessage || error.message });
    }
});


// --- ARTICLES API ---
app.get('/api/articles', async (req, res) => {
     try {
        const [articles] = await pool.query('SELECT * FROM Articles ORDER BY date DESC');
        res.json(articles);
    } catch (error) {
        console.error("Lỗi khi truy vấn bài viết:", error);
        res.status(500).json({ message: "Lỗi server khi lấy bài viết", error: error.sqlMessage || error.message });
    }
});

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

app.post('/api/articles', async (req, res) => {
    try {
        const article = { ...req.body, id: `article-${Date.now()}` };
        await pool.query('INSERT INTO Articles SET ?', article);
        res.status(201).json(article);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

app.put('/api/articles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const article = req.body;
        delete article.id;
        await pool.query('UPDATE Articles SET ? WHERE id = ?', [article, id]);
        res.json({ id, ...article });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

app.delete('/api/articles/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Articles WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});


// --- ORDERS API ---
app.get('/api/orders', async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM Orders ORDER BY orderDate DESC');
        // Deserialize JSON fields
        const deserializedOrders = orders.map(o => ({
            ...o,
            customerInfo: JSON.parse(o.customerInfo || '{}'),
            items: JSON.parse(o.items || '[]'),
            paymentInfo: JSON.parse(o.paymentInfo || '{}'),
            shippingInfo: JSON.parse(o.shippingInfo || '{}')
        }));
        res.json(deserializedOrders);
    } catch (error) {
        console.error("Lỗi khi truy vấn đơn hàng:", error);
        res.status(500).json({ message: "Lỗi server khi lấy đơn hàng", error: error.sqlMessage || error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = {
            id: orderData.id,
            customerInfo: orderData.customerInfo, // Pass as object
            items: orderData.items, // Pass as array
            totalAmount: orderData.totalAmount,
            orderDate: orderData.orderDate,
            status: orderData.status,
            paymentInfo: orderData.paymentInfo, // Pass as object
            shippingInfo: orderData.shippingInfo || {}, // Pass as object
        };

        // The mysql2 driver will automatically stringify the JSON fields
        await pool.query('INSERT INTO Orders SET ?', newOrder);
        res.status(201).json(orderData);
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi không mong muốn khi tạo đơn hàng.", error: error.sqlMessage || error.message });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Trạng thái mới là bắt buộc.' });
        }
        const [result] = await pool.query('UPDATE Orders SET status = ? WHERE id = ?', [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }
        res.json({ message: 'Cập nhật trạng thái thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});


// --- CATCH-ALL ROOT ---
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
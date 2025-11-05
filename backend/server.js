import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for media uploads

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
            product.imageUrls = JSON.parse(product.imageUrls || '[]'),
            product.specifications = JSON.parse(product.specifications || '{}'),
            product.tags = JSON.parse(product.tags || '[]'),
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
            const [mainCatRows] = await pool.query('SELECT id FROM ProductCategories WHERE name = ? AND parent_category_id IS NULL', [mainCategory]);
            if (mainCatRows.length > 0) {
                const mainCatId = mainCatRows[0].id;
                const [subCatRows] = await pool.query('SELECT id FROM ProductCategories WHERE name = ? AND parent_category_id = ?', [subCategory, mainCatId]);
                if (subCatRows.length > 0) {
                    category_id = subCatRows[0].id;
                }
            }
        }
        
        // Build a clean, sanitized object for DB insertion to prevent type errors and unknown column errors.
        const productToDb = {
            id: productData.id || `prod-${Date.now()}`,
            name: productData.name,
            price: Number(productData.price) || 0,
            originalPrice: (productData.originalPrice && Number(productData.originalPrice)) ? Number(productData.originalPrice) : null,
            imageUrls: JSON.stringify(productData.imageUrls || []),
            description: productData.description || null,
            shortDescription: productData.shortDescription || null,
            specifications: JSON.stringify(productData.specifications || {}),
            stock: Number(productData.stock) || 0,
            status: productData.status || null,
            rating: (productData.rating && Number(productData.rating)) ? Number(productData.rating) : null,
            reviews: (productData.reviews && Number(productData.reviews)) ? Number(productData.reviews) : null,
            brand: productData.brand || null,
            tags: JSON.stringify(productData.tags || []),
            brandLogoUrl: productData.brandLogoUrl || null,
            seoMetaTitle: productData.seoMetaTitle || null,
            seoMetaDescription: productData.seoMetaDescription || null,
            slug: productData.slug || null,
            is_published: isVisible === undefined ? true : Boolean(isVisible),
            category_id: category_id,
            is_featured: Boolean(productData.is_featured),
        };

        await pool.query('INSERT INTO Products SET ?', productToDb);
        
        const responseProduct = { ...req.body, id: productToDb.id };
        res.status(201).json(responseProduct);
    } catch (error) {
        console.error("Lỗi khi tạo sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server khi tạo sản phẩm", error: error.sqlMessage || error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mainCategory, subCategory, isVisible, category, ...productData } = req.body;
        
        let category_id = productData.category_id; // Keep existing if not changed
        if (mainCategory && subCategory) {
            const [mainCatRows] = await pool.query('SELECT id FROM ProductCategories WHERE name = ? AND parent_category_id IS NULL', [mainCategory]);
            if (mainCatRows.length > 0) {
                const mainCatId = mainCatRows[0].id;
                const [subCatRows] = await pool.query('SELECT id FROM ProductCategories WHERE name = ? AND parent_category_id = ?', [subCategory, mainCatId]);
                if (subCatRows.length > 0) {
                    category_id = subCatRows[0].id;
                }
            }
        }
        
        // Build a clean, sanitized object for DB update.
        const fieldsToUpdate = {
            name: productData.name,
            price: Number(productData.price) || 0,
            originalPrice: (productData.originalPrice && Number(productData.originalPrice)) ? Number(productData.originalPrice) : null,
            imageUrls: JSON.stringify(productData.imageUrls || []),
            description: productData.description || null,
            shortDescription: productData.shortDescription || null,
            specifications: JSON.stringify(productData.specifications || {}),
            stock: Number(productData.stock) || 0,
            status: productData.status || null,
            rating: (productData.rating && Number(productData.rating)) ? Number(productData.rating) : null,
            reviews: (productData.reviews && Number(productData.reviews)) ? Number(productData.reviews) : null,
            brand: productData.brand || null,
            tags: JSON.stringify(productData.tags || []),
            brandLogoUrl: productData.brandLogoUrl || null,
            seoMetaTitle: productData.seoMetaTitle || null,
            seoMetaDescription: productData.seoMetaDescription || null,
            slug: productData.slug || null,
            is_published: isVisible === undefined ? true : Boolean(isVisible),
            category_id: category_id,
            is_featured: Boolean(productData.is_featured),
        };
        
        const [result] = await pool.query('UPDATE Products SET ? WHERE id = ?', [fieldsToUpdate, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
        }
        res.json({ id, ...req.body });
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật sản phẩm", error: error.sqlMessage || error.message });
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
        const newOrderForDb = {
            id: orderData.id,
            customerInfo: JSON.stringify(orderData.customerInfo),
            items: JSON.stringify(orderData.items),
            totalAmount: orderData.totalAmount,
            orderDate: orderData.orderDate,
            status: orderData.status,
            paymentInfo: JSON.stringify(orderData.paymentInfo),
            shippingInfo: JSON.stringify(orderData.shippingInfo || {}),
        };

        await pool.query('INSERT INTO Orders SET ?', newOrderForDb);
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

// --- CHAT LOGS API ---
app.get('/api/chatlogs', async (req, res) => {
    try {
        const [logs] = await pool.query('SELECT * FROM ChatLogSessions ORDER BY startTime DESC LIMIT 50');
        const deserialized = logs.map(log => ({ ...log, messages: JSON.parse(log.messages || '[]') }));
        res.json(deserialized);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy lịch sử chat', error: error.message });
    }
});

app.post('/api/chatlogs', async (req, res) => {
    try {
        const session = req.body;
        const query = `
            INSERT INTO ChatLogSessions (id, userName, userPhone, startTime, messages)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE messages = VALUES(messages);
        `;
        await pool.query(query, [session.id, session.userName, session.userPhone, session.startTime, JSON.stringify(session.messages)]);
        res.status(200).json({ message: 'Đã lưu lịch sử chat' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lưu lịch sử chat', error: error.message });
    }
});

// --- MEDIA LIBRARY API ---
app.get('/api/media', async (req, res) => {
    try {
        const [items] = await pool.query('SELECT * FROM MediaItems ORDER BY uploadedAt DESC');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy media', error: error.message });
    }
});

app.post('/api/media', async (req, res) => {
    try {
        const item = { ...req.body, id: `media-${Date.now()}` };
        await pool.query('INSERT INTO MediaItems SET ?', item);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi thêm media', error: error.message });
    }
});

app.delete('/api/media/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM MediaItems WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi xóa media', error: error.message });
    }
});

// --- FINANCIALS API ---
app.get('/api/financials/transactions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM FinancialTransactions ORDER BY date DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi server', error: error.message }); }
});

app.post('/api/financials/transactions', async (req, res) => {
    try {
        const data = { ...req.body, id: `trans-${Date.now()}` };
        await pool.query('INSERT INTO FinancialTransactions SET ?', data);
        res.status(201).json(data);
    } catch (error) { res.status(500).json({ message: 'Lỗi server', error: error.message }); }
});

app.put('/api/financials/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        delete data.id;
        await pool.query('UPDATE FinancialTransactions SET ? WHERE id = ?', [data, id]);
        res.json({ id, ...data });
    } catch (error) { res.status(500).json({ message: 'Lỗi server', error: error.message }); }
});

app.delete('/api/financials/transactions/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM FinancialTransactions WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) { res.status(500).json({ message: 'Lỗi server', error: error.message }); }
});

// --- PAYROLL API ---
app.get('/api/financials/payroll', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM PayrollRecords');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Lỗi server', error: error.message }); }
});

app.post('/api/financials/payroll', async (req, res) => {
    try {
        const records = req.body;
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            for (const record of records) {
                const query = `
                    INSERT INTO PayrollRecords (id, employeeId, employeeName, payPeriod, baseSalary, bonus, deduction, finalSalary, notes, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE baseSalary=VALUES(baseSalary), bonus=VALUES(bonus), deduction=VALUES(deduction), finalSalary=VALUES(finalSalary), notes=VALUES(notes), status=VALUES(status);
                `;
                await connection.query(query, [record.id, record.employeeId, record.employeeName, record.payPeriod, record.baseSalary, record.bonus, record.deduction, record.finalSalary, record.notes, record.status]);
            }
            await connection.commit();
            res.status(200).json({ message: "Đã cập nhật bảng lương" });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) { res.status(500).json({ message: 'Lỗi server khi lưu bảng lương', error: error.message }); }
});


// --- CATCH-ALL ROOT ---
app.get('/', (req, res) => {
    // Get the host from the request headers
    const host = req.get('host');
    // For Render, we should respect the X-Forwarded-Proto header to show https correctly
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const fullUrl = `${protocol}://${host}`;

    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Backend Server - IQ Technology</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f0f2f5; color: #333; }
                .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 700px; margin: 20px; }
                h1 { color: #16a34a; }
                p { line-height: 1.6; }
                code { background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 1.1em; color: #1e293b; }
                .success { border: 2px solid #16a34a; }
                .info-box { text-align: left; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container success">
                <h1>✅ Backend Server Đang Hoạt Động!</h1>
                <p>Dịch vụ này đang chạy và sẵn sàng xử lý các yêu cầu API từ ứng dụng frontend.</p>
                <div class="info-box">
                    <p><strong>URL Backend hiện tại của bạn là:</strong></p>
                    <p><code>${fullUrl}</code></p>
                    <hr style="margin: 15px 0; border: 0; border-top: 1px solid #e2e8f0;">
                    <p>Đây chính là giá trị bạn cần đặt cho biến môi trường <code>VITE_BACKEND_API_BASE_URL</code> trong dịch vụ <strong>frontend</strong> trên Render.</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});
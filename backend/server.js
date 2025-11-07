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
            WHERE p.is_featured = TRUE
            ORDER BY RAND()
            LIMIT 4;
        `;
        const [products] = await pool.query(query);
         const deserializedProducts = products.map(p => ({
            ...p,
            imageUrls: JSON.parse(p.imageUrls || '[]'),
            specifications: JSON.parse(p.specifications || '{}'),
            tags: JSON.parse(p.tags || '[]'),
            // isVisible: p.is_published, // Removed temporarily
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
            // product.isVisible = product.is_published; // Removed temporarily
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
        
        const whereClauses = []; // Removed 'p.is_published = TRUE'
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
            // isVisible: p.is_published, // Removed temporarily
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
            // is_published: isVisible === undefined ? true : Boolean(isVisible), // Removed temporarily
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
            // is_published: isVisible === undefined ? true : Boolean(isVisible), // Removed temporarily
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
    }<ctrl63>
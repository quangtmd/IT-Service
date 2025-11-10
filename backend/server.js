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

// --- Helper to deserialize product rows ---
const deserializeProduct = (p) => ({
    ...p,
    imageUrls: JSON.parse(p.imageUrls || '[]'),
    specifications: JSON.parse(p.specifications || '{}'),
    tags: JSON.parse(p.tags || '[]'),
    isVisible: p.isVisible, // Use isVisible directly
});

// --- PRODUCTS API ---

app.get('/api/products/featured', async (req, res) => {
    try {
        const query = `
            SELECT p.*
            FROM Products p
            WHERE JSON_CONTAINS(p.tags, '"Nổi bật"') AND p.isVisible = TRUE
            ORDER BY RAND()
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
        const query = `
            SELECT p.*
            FROM Products p
            WHERE p.id = ?
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        if (rows.length > 0) {
            res.json(deserializeProduct(rows[0]));
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
        if (tags) {
            whereClauses.push('JSON_CONTAINS(p.tags, ?)');
            params.push(JSON.stringify(tags));
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

app.post('/api/products', async (req, res) => {
    try {
        const { isVisible, ...productData } = req.body;

        const productToDb = {
            id: productData.id || `prod-${Date.now()}`,
            name: productData.name,
            mainCategory: productData.mainCategory,
            subCategory: productData.subCategory,
            price: Number(productData.price) || 0,
            originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
            imageUrls: JSON.stringify(productData.imageUrls || []),
            description: productData.description || null,
            shortDescription: productData.shortDescription || null,
            specifications: JSON.stringify(productData.specifications || {}),
            stock: Number(productData.stock) || 0,
            status: productData.status || 'Mới',
            brand: productData.brand || null,
            tags: JSON.stringify(productData.tags || []),
            isVisible: isVisible === undefined ? true : Boolean(isVisible)
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
        const { isVisible, ...productData } = req.body;
        
        const fieldsToUpdate = {
            name: productData.name,
            mainCategory: productData.mainCategory,
            subCategory: productData.subCategory,
            price: Number(productData.price) || 0,
            originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
            imageUrls: JSON.stringify(productData.imageUrls || []),
            description: productData.description || null,
            shortDescription: productData.shortDescription || null,
            specifications: JSON.stringify(productData.specifications || {}),
            stock: Number(productData.stock) || 0,
            status: productData.status || null,
            brand: productData.brand || null,
            tags: JSON.stringify(productData.tags || []),
            isVisible: isVisible === undefined ? true : Boolean(isVisible),
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
        res.status(204).send();
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
        const [rows] = await pool.query('SELECT * FROM Articles WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
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
        const article = { ...req.body, id: req.body.id || `article-${Date.now()}` };
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
        res.status(500).json({ message: "Lỗi server khi lấy dữ liệu đơn hàng", error: error.sqlMessage || error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = req.body;
        await pool.query('INSERT INTO Orders SET ?', {
            id: newOrder.id,
            userId: newOrder.userId || null,
            customerInfo: JSON.stringify(newOrder.customerInfo),
            items: JSON.stringify(newOrder.items),
            totalAmount: newOrder.totalAmount,
            orderDate: newOrder.orderDate,
            status: newOrder.status,
            shippingInfo: JSON.stringify(newOrder.shippingInfo || {}),
            paymentInfo: JSON.stringify(newOrder.paymentInfo),
        });
        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        res.status(500).json({ message: "Lỗi server khi tạo đơn hàng", error: error.sqlMessage || error.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Serialize JSON fields before updating
        const updatesForDb = {
            ...updates,
            customerInfo: JSON.stringify(updates.customerInfo || {}),
            items: JSON.stringify(updates.items || []),
            paymentInfo: JSON.stringify(updates.paymentInfo || {}),
            shippingInfo: JSON.stringify(updates.shippingInfo || {}),
        };
        // remove id from updates object
        delete updatesForDb.id;

        const [result] = await pool.query('UPDATE Orders SET ? WHERE id = ?', [updatesForDb, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng để cập nhật' });
        }
        res.json({ id, ...req.body }); // Return original updates object
    } catch (error) {
        console.error(`Lỗi khi cập nhật đơn hàng ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const [result] = await pool.query('UPDATE Orders SET status = ? WHERE id = ?', [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng để cập nhật' });
        }
        res.json({ id, status });
    } catch (error) {
        console.error(`Lỗi khi cập nhật trạng thái đơn hàng ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM Orders WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng để xóa' });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Lỗi khi xóa đơn hàng:", error);
        res.status(500).json({ message: "Lỗi server", error: error.sqlMessage || error.message });
    }
});


// --- AUTH & USERS API ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });
        }
        const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }
        const user = rows[0];
        // In a real app, compare hashed passwords. Here we do a plain text comparison.
        if (user.password !== password) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }
        // Remove password before sending user data to client
        delete user.password;
        res.json(user);
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT u.id, u.username, u.email, u.password, u.role, u.staffRole, u.imageUrl, u.isLocked, 
                   u.phone, u.address, u.status, u.dateOfBirth, u.origin, u.loyaltyPoints, u.debtStatus, u.assignedStaffId,
                   e.position, e.joinDate
            FROM Users u
            LEFT JOIN Employees e ON u.id = e.userId
        `);
        res.json(users);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const userColumns = ['username', 'email', 'password', 'role', 'staffRole', 'imageUrl', 'isLocked', 'phone', 'address', 'status', 'dateOfBirth', 'origin', 'loyaltyPoints', 'debtStatus', 'assignedStaffId'];
        const userData = { ...req.body, id: `user-${Date.now()}` };
        const userForDb = filterObject(userData, [...userColumns, 'id']);
        if (!userForDb.password) userForDb.password = 'password123'; // Default password

        await connection.query('INSERT INTO Users SET ?', userForDb);

        if (userForDb.role === 'staff' || userForDb.role === 'admin') {
            const employeeColumns = ['position', 'joinDate', 'salary'];
            const employeeData = filterObject(req.body, employeeColumns);
            if (Object.keys(employeeData).length > 0) {
                await connection.query('INSERT INTO Employees SET ?', { userId: userForDb.id, ...employeeData });
            }
        }
        
        await connection.commit();
        delete userForDb.password;
        res.status(201).json(userForDb);

    } catch (error) {
        await connection.rollback();
        console.error("Lỗi khi tạo người dùng:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo người dùng', error: error.message });
    } finally {
        connection.release();
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [userRows] = await connection.query('SELECT role FROM Users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            throw new Error('Không tìm thấy người dùng');
        }
        const userRole = userRows[0].role;

        const userColumns = ['username', 'password', 'role', 'staffRole', 'imageUrl', 'isLocked', 'phone', 'address', 'status', 'dateOfBirth', 'origin', 'loyaltyPoints', 'debtStatus', 'assignedStaffId'];
        const userUpdates = filterObject(req.body, userColumns);

        if (Object.keys(userUpdates).length > 0) {
            await connection.query('UPDATE Users SET ? WHERE id = ?', [userUpdates, id]);
        }

        if (userRole === 'staff' || userRole === 'admin') {
            const employeeColumns = ['position', 'joinDate', 'salary'];
            const employeeUpdates = filterObject(req.body, employeeColumns);
            if (Object.keys(employeeUpdates).length > 0) {
                const [empRows] = await connection.query('SELECT userId FROM Employees WHERE userId = ?', [id]);
                if (empRows.length > 0) {
                    await connection.query('UPDATE Employees SET ? WHERE userId = ?', [employeeUpdates, id]);
                } else {
                    await connection.query('INSERT INTO Employees SET ?', { userId: id, ...employeeUpdates });
                }
            }
        }
        
        await connection.commit();
        res.json({ id, ...req.body });

    } catch (error) {
        await connection.rollback();
        console.error("Lỗi khi cập nhật người dùng:", error);
        if (error.message === 'Không tìm thấy người dùng') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Lỗi server khi cập nhật người dùng', error: error.message });
    } finally {
        connection.release();
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM Users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.get('/api/users/:id/orders', async (req, res) => {
    try {
        const { id } = req.params;
        const [orders] = await pool.query('SELECT * FROM Orders WHERE userId = ? ORDER BY orderDate DESC', [id]);
        const deserializedOrders = orders.map(o => ({
            ...o,
            customerInfo: JSON.parse(o.customerInfo || '{}'),
            items: JSON.parse(o.items || '[]'),
            paymentInfo: JSON.parse(o.paymentInfo || '{}'),
            shippingInfo: JSON.parse(o.shippingInfo || '{}')
        }));
        res.json(deserializedOrders);
    } catch (error) {
        console.error(`Lỗi khi lấy đơn hàng cho user ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});


// --- MEDIA ITEMS API ---
app.get('/api/media', async (req, res) => {
    try {
        const [mediaItems] = await pool.query('SELECT * FROM MediaLibrary ORDER BY uploadedAt DESC');
        res.json(mediaItems);
    } catch (error) {
        console.error("Lỗi khi truy vấn media items:", error);
        res.status(500).json({ message: "Lỗi server khi lấy media items", error: error.sqlMessage || error.message });
    }
});

app.post('/api/media', async (req, res) => {
    try {
        const mediaItem = { ...req.body, id: `media-${Date.now()}`, uploadedAt: new Date() };
        await pool.query('INSERT INTO MediaLibrary SET ?', mediaItem);
        res.status(201).json(mediaItem);
    } catch (error) {
        console.error("Lỗi khi thêm media item:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

app.delete('/api/media/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM MediaLibrary WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        console.error("Lỗi khi xóa media item:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});


// --- CHAT LOGS API ---
app.get('/api/chatlogs', async (req, res) => {
    try {
        const [chatlogs] = await pool.query('SELECT * FROM ChatLogSessions ORDER BY startTime DESC');
        const deserializedLogs = chatlogs.map(log => ({
            ...log,
            messages: JSON.parse(log.messages || '[]')
        }));
        res.json(deserializedLogs);
    } catch (error) {
        console.error("Lỗi khi truy vấn chat logs:", error);
        res.status(500).json({ message: "Lỗi server khi lấy chat logs", error: error.sqlMessage || error.message });
    }
});

app.post('/api/chatlogs', async (req, res) => {
    try {
        const newChatLog = req.body;
        await pool.query('INSERT INTO ChatLogSessions SET ? ON DUPLICATE KEY UPDATE messages = VALUES(messages)', {
            id: newChatLog.id,
            userName: newChatLog.userName,
            userPhone: newChatLog.userPhone,
            startTime: newChatLog.startTime,
            messages: JSON.stringify(newChatLog.messages || []),
        });
        res.status(201).json(newChatLog);
    } catch (error) {
        console.error("Lỗi khi lưu chat log:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});


// --- FINANCIALS API ---
app.get('/api/financials/transactions', async (req, res) => {
    try {
        const [transactions] = await pool.query('SELECT * FROM FinancialTransactions ORDER BY transactionDate DESC');
        res.json(transactions);
    } catch (error) {
        console.error("Lỗi khi truy vấn giao dịch tài chính:", error);
        res.status(500).json({ message: "Lỗi server khi lấy giao dịch tài chính", error: error.sqlMessage || error.message });
    }
});

app.post('/api/financials/transactions', async (req, res) => {
    try {
        const newTransaction = { ...req.body, id: `trans-${Date.now()}` };
        await pool.query('INSERT INTO FinancialTransactions SET ?', newTransaction);
        res.status(201).json(newTransaction);
    } catch (error) {
        console.error("Lỗi khi thêm giao dịch tài chính:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

app.put('/api/financials/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        delete updates.id;
        await pool.query('UPDATE FinancialTransactions SET ? WHERE id = ?', [updates, id]);
        res.json({ id, ...updates });
    } catch (error) {
        console.error("Lỗi khi cập nhật giao dịch tài chính:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

app.delete('/api/financials/transactions/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM FinancialTransactions WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        console.error("Lỗi khi xóa giao dịch tài chính:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

app.get('/api/financials/payroll', async (req, res) => {
    try {
        const [payrollRecords] = await pool.query('SELECT * FROM PayrollRecords ORDER BY payPeriod DESC, employeeName ASC');
        res.json(payrollRecords);
    } catch (error) {
        console.error("Lỗi khi truy vấn hồ sơ lương:", error);
        res.status(500).json({ message: "Lỗi server khi lấy hồ sơ lương", error: error.sqlMessage || error.message });
    }
});

app.post('/api/financials/payroll', async (req, res) => {
    try {
        const records = req.body;
        if (!Array.isArray(records)) {
            return res.status(400).json({ message: "Yêu cầu phải là một mảng các bản ghi lương." });
        }
        
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            for (const record of records) {
                const payrollRecordForDb = {
                    id: record.id,
                    employeeId: record.employeeId,
                    employeeName: record.employeeName,
                    payPeriod: record.payPeriod,
                    baseSalary: record.baseSalary || 0,
                    bonus: record.bonus || 0,
                    deduction: record.deduction || 0,
                    finalSalary: record.finalSalary || 0,
                    notes: record.notes || '',
                    status: record.status || 'Chưa thanh toán'
                };
                
                await connection.query(
                    `INSERT INTO PayrollRecords (id, employeeId, employeeName, payPeriod, baseSalary, bonus, deduction, finalSalary, notes, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                     employeeName = VALUES(employeeName), baseSalary = VALUES(baseSalary), bonus = VALUES(bonus),
                     deduction = VALUES(deduction), finalSalary = VALUES(finalSalary), notes = VALUES(notes), status = VALUES(status)`,
                    Object.values(payrollRecordForDb)
                );
            }
            await connection.commit();
            res.status(200).json({ message: "Hồ sơ lương đã được lưu thành công." });
        } catch (innerError) {
            await connection.rollback();
            throw innerError;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Lỗi khi lưu hồ sơ lương:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

// --- NEW APIs ---

// Quotations
app.get('/api/quotations', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Quotations ORDER BY creation_date DESC');
        res.json(rows.map(r => ({...r, items: JSON.parse(r.items || '[]'), customerInfo: JSON.parse(r.customerInfo || '{}')})));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.post('/api/quotations', async (req, res) => {
    try {
        const quote = { ...req.body, items: JSON.stringify(req.body.items || []), customerInfo: JSON.stringify(req.body.customerInfo || {}) };
        await pool.query('INSERT INTO Quotations SET ?', quote);
        res.status(201).json(req.body);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.put('/api/quotations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body, items: JSON.stringify(req.body.items || []), customerInfo: JSON.stringify(req.body.customerInfo || {}) };
        delete updates.id;
        await pool.query('UPDATE Quotations SET ? WHERE id = ?', [updates, id]);
        res.json(req.body);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.delete('/api/quotations/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Quotations WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Return Tickets
app.get('/api/returns', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Returns ORDER BY createdAt DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.post('/api/returns', async (req, res) => {
    try {
        const ticket = { ...req.body, id: `ret-${Date.now()}`, createdAt: new Date() };
        await pool.query('INSERT INTO Returns SET ?', ticket);
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.put('/api/returns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        delete updates.id;
        delete updates.createdAt;
        await pool.query('UPDATE Returns SET ? WHERE id = ?', [updates, id]);
        res.json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.delete('/api/returns/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Returns WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Suppliers
app.get('/api/suppliers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Suppliers ORDER BY name ASC');
        res.json(rows.map(s => ({...s, contactInfo: JSON.parse(s.contactInfo || '{}')})));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.post('/api/suppliers', async (req, res) => {
    try {
        const supplier = { ...req.body, id: `sup-${Date.now()}`, contactInfo: JSON.stringify(req.body.contactInfo || {}) };
        await pool.query('INSERT INTO Suppliers SET ?', supplier);
        res.status(201).json({ ...req.body, id: supplier.id });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.put('/api/suppliers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body, contactInfo: JSON.stringify(req.body.contactInfo || {}) };
        delete updates.id;
        await pool.query('UPDATE Suppliers SET ? WHERE id = ?', [updates, id]);
        res.json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.delete('/api/suppliers/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Suppliers WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});


// Service Tickets
app.get('/api/service-tickets', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ServiceTickets ORDER BY createdAt DESC');
        res.json(rows.map(t => ({...t, customer_info: JSON.parse(t.customer_info || '{}')})));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.post('/api/service-tickets', async (req, res) => {
    try {
        const ticket = { ...req.body, id: `st-${Date.now()}`, ticket_code: `ST-${Date.now()}`, createdAt: new Date(), customer_info: JSON.stringify(req.body.customer_info || {}) };
        await pool.query('INSERT INTO ServiceTickets SET ?', ticket);
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.put('/api/service-tickets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body, customer_info: JSON.stringify(req.body.customer_info || {}) };
        delete updates.id;
        delete updates.createdAt;
        delete updates.ticket_code;
        await pool.query('UPDATE ServiceTickets SET ? WHERE id = ?', [updates, id]);
        res.json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.delete('/api/service-tickets/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM ServiceTickets WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Inventory
app.get('/api/inventory', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT i.quantity, p.name as product_name, w.name as warehouse_name, i.productId as product_id, i.warehouseId as warehouse_id
            FROM Inventory i
            JOIN Products p ON i.productId = p.id
            JOIN Warehouses w ON i.warehouseId = w.id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Warranty Claims
app.get('/api/warranty-claims', async (req, res) => {
    try {
// Fix: Changed createdAt to created_at to match database schema and type definition.
        const [rows] = await pool.query('SELECT * FROM WarrantyTickets ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Fix: Added POST, PUT, and DELETE endpoints for warranty claims.
app.post('/api/warranty-claims', async (req, res) => {
    try {
        const claimData = { 
            ...req.body, 
            id: `wc-${Date.now()}`,
            claim_code: `BH-${Date.now()}`,
            created_at: new Date()
        };
        await pool.query('INSERT INTO WarrantyTickets SET ?', claimData);
        res.status(201).json(claimData);
    } catch (error) {
        console.error("Error creating warranty claim:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.put('/api/warranty-claims/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        delete updates.id;
        delete updates.created_at;
        delete updates.claim_code;
        const [result] = await pool.query('UPDATE WarrantyTickets SET ? WHERE id = ?', [updates, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu bảo hành' });
        }
        res.json({ id, ...req.body });
    } catch (error) {
        console.error("Error updating warranty claim:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

app.delete('/api/warranty-claims/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM WarrantyTickets WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu bảo hành' });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting warranty claim:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});


// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const projectRoot = path.resolve(__dirname, '..');
    const frontendDistPath = path.join(projectRoot, 'dist');
    
    console.log(`[Static Files] Server __dirname: ${__dirname}`);
    console.log(`[Static Files] Resolved Project Root: ${projectRoot}`);
    console.log(`[Static Files] Attempting to serve static files from: ${frontendDistPath}`);

    app.use(express.static(frontendDistPath));

    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) {
            return next();
        }
        const indexPath = path.resolve(frontendDistPath, 'index.html');
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error(`Error sending file ${indexPath}:`, err);
                res.status(500).send("Không thể tải ứng dụng frontend. Chi tiết: " + err.message);
            }
        });
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});

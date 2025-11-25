import express from 'express';
import cors from 'cors';
import pool from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- SEED DATA FUNCTION ---
const seedDatabase = async (connection) => {
    console.log("🌱 Đang kiểm tra dữ liệu mẫu...");
    try {
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM Products');
        if (rows[0].count > 0) {
            console.log("👌 Database đã có dữ liệu, bỏ qua seeding.");
            return;
        }

        console.log("⚠️ Database trống. Đang tự động thêm dữ liệu mẫu...");

        // Seed Users
        await connection.query(`
            INSERT IGNORE INTO \`Users\` (\`id\`, \`username\`, \`email\`, \`password\`, \`role\`, \`staffRole\`, \`status\`, \`isLocked\`, \`phone\`, \`address\`) VALUES
            ('staff001', 'Lê Hùng', 'hung.le@iqtechnology.com.vn', 'password123', 'staff', 'Trưởng nhóm Kỹ thuật', 'Đang hoạt động', 0, '0911855055', 'Văn phòng IQ Tech'),
            ('staff002', 'Nguyễn Thị Lan', 'lan.nguyen@iqtechnology.com.vn', 'password123', 'staff', 'Quản lý Bán hàng', 'Đang hoạt động', 0, '0911855056', 'Văn phòng IQ Tech'),
            ('user001', 'Duy Quang', 'quang.tran@iqtechnology.com.vn', 'password123', 'admin', 'Nhân viên Toàn quyền', 'Đang hoạt động', 0, '0911855055', 'Văn phòng IQ Tech');
        `);

        // Seed Products (Data from your previous SQL script)
        await connection.query(`
            INSERT IGNORE INTO \`Products\` (\`id\`, \`name\`, \`mainCategory\`, \`subCategory\`, \`price\`, \`originalPrice\`, \`stock\`, \`brand\`, \`tags\`, \`imageUrls\`, \`specifications\`, \`purchasePrice\`, \`wholesalePrice\`, \`productCode\`, \`supplierId\`, \`unit\`, \`isVisible\`) VALUES
            ('CPU001', 'CPU Intel Core i9-14900K', 'Linh kiện máy tính', 'CPU (Vi xử lý Intel, AMD)', 15990000, 17500000, 15, 'Intel', '["Nổi bật", "Gaming", "Mới"]', '["https://hanoicomputercdn.com/media/product/84214_cpu_intel_core_i9_14900k_1.png"]', '{}', 14500000, 15000000, 'CPU-INT-14900K', 'SUP001', 'Cái', 1),
            ('VGA001', 'VGA GIGABYTE GeForce RTX 4070 Ti SUPER', 'Linh kiện máy tính', 'VGA (Card màn hình)', 25490000, 27000000, 10, 'GIGABYTE', '["Nổi bật", "Gaming"]', '["https://hanoicomputercdn.com/media/product/85223_vga_gigabyte_geforce_rtx_4070_ti_super_gaming_oc_16gb_gddr6x_1.png"]', '{}', 23000000, 24000000, 'VGA-GIGA-4070TIS', 'SUP002', 'Cái', 1),
            ('RAM001', 'RAM Kingston Fury Beast RGB 32GB (2x16GB) DDR5 6000MHz', 'Linh kiện máy tính', 'RAM (DDR4, DDR5…)', 3290000, 3500000, 30, 'Kingston', '["Bán chạy"]', '["https://hanoicomputercdn.com/media/product/78396_ram_kingston_fury_beast_rgb_32gb_2x16gb_ddr5_bus_6000mhz_kf560c36bbeak2_32_1.png"]', '{}', 2800000, 3000000, 'RAM-KING-D532GB6000', 'SUP003', 'Bộ', 1),
            ('SSD001', 'Ổ cứng SSD Samsung 990 PRO 2TB NVMe PCIe 4.0', 'Linh kiện máy tính', 'Ổ cứng HDD / SSD (SATA, NVMe)', 4490000, 5000000, 25, 'Samsung', '["Bán chạy", "Tốc độ cao"]', '["https://hanoicomputercdn.com/media/product/77353_ssd_samsung_990_pro_2tb_pcie_gen4_x4_nvme_2_0_v_nand_m_2_mz_v9p2t0bw_1.png"]', '{}', 3900000, 4200000, 'SSD-SS-990P2TB', 'SUP001', 'Cái', 1),
            ('MAIN001', 'Mainboard ASUS ROG STRIX Z790-E GAMING WIFI II', 'Linh kiện máy tính', 'Bo mạch chủ (Mainboard)', 16490000, NULL, 8, 'ASUS', '["Gaming", "High-end"]', '["https://hanoicomputercdn.com/media/product/84128_mainboard_asus_rog_strix_z790_e_gaming_wifi_ii_ddr5_1.png"]', '{}', 15000000, 15500000, 'MAIN-ASUS-Z790E2', 'SUP002', 'Cái', 1),
            ('PSU001', 'Nguồn Cooler Master MWE Gold V2 850W - 80 Plus Gold', 'Linh kiện máy tính', 'Nguồn máy tính (PSU)', 2890000, 3200000, 18, 'Cooler Master', '["Bán chạy"]', '["https://hanoicomputercdn.com/media/product/64757_mwe_850_gold_v2_full_modular__1_.png"]', '{}', 2500000, 2700000, 'PSU-CM-850GV2', 'SUP003', 'Cái', 1),
            ('CASE001', 'Vỏ case NZXT H6 Flow RGB Black', 'Linh kiện máy tính', 'Vỏ máy (Case)', 3290000, NULL, 12, 'NZXT', '["Mới", "Đẹp"]', '["https://hanoicomputercdn.com/media/product/84705_vo_case_nzxt_h6_flow_rgb_black_1.png"]', '{}', 2900000, 3100000, 'CASE-NZXT-H6FRGB', 'SUP004', 'Cái', 1),
            ('LCD001', 'Màn hình LG UltraGear 27GR93U-B 4K 144Hz', 'Thiết bị ngoại vi', 'Màn hình (LCD, LED, 2K, 4K, Gaming…)', 13990000, 15500000, 20, 'LG', '["Gaming", "4K"]', '["https://hanoicomputercdn.com/media/product/83281_lg_27gr93u_b_1.png"]', '{}', 12500000, 13000000, 'LCD-LG-27GR93U', 'SUP001', 'Cái', 1),
            ('LAP001', 'Laptop Gaming Acer Predator Helios Neo 16', 'Laptop', 'Laptop Gaming', 37990000, 42000000, 7, 'Acer', '["Nổi bật", "Gaming"]', '["https://hanoicomputercdn.com/media/product/85429_laptop_gaming_acer_predator_helios_neo_16_phn16_72_9154_nh_qlxsv_002__1_.png"]', '{}', 35000000, 36000000, 'LAP-ACER-HELNEO16', 'SUP005', 'Cái', 1),
            ('PCGM001', 'PC GAMING IQ EAGLE', 'Máy tính để bàn (PC)', 'Máy tính Gaming', 28990000, 32000000, 5, 'IQ Technology', '["Bán chạy", "Nổi bật"]', '["https://hanoicomputercdn.com/media/product/85055_pc_gaming_hacom_thor_1.png"]', '{}', 26000000, 27500000, 'PCGM-IQ-EAGLE', NULL, 'Bộ', 1),
            ('PCGM002', 'PC GAMING STREAMER PRO', 'Máy tính để bàn (PC)', 'Máy tính Gaming', 48500000, 55000000, 3, 'IQ Technology', '["Nổi bật", "High-end"]', '["https://hanoicomputercdn.com/media/product/85461_pc_gaming_hacom_ghost_1.png"]', '{}', 45000000, 46500000, 'PCGM-IQ-STREAMER', NULL, 'Bộ', 1),
            ('CPU002', 'CPU AMD Ryzen 7 7800X3D', 'Linh kiện máy tính', 'CPU (Vi xử lý Intel, AMD)', 10490000, 11500000, 18, 'AMD', '["Gaming", "3D V-Cache"]', '["https://hanoicomputercdn.com/media/product/80267_cpu_amd_ryzen_7_7800x3d_1.png"]', '{}', 9500000, 10000000, 'CPU-AMD-7800X3D', 'SUP002', 'Cái', 1);
        `);

        console.log("✅ Đã thêm dữ liệu mẫu thành công!");
    } catch (error) {
        console.error("❌ Lỗi khi thêm dữ liệu mẫu:", error);
    }
};

// --- DB CONNECTION CHECK ---
let dbStatus = { status: 'unknown', error: null, tableExists: false };

const checkDbConnection = async () => {
    try {
        const connection = await pool.getConnection();
        try {
            // Try simple query
            await connection.query('SELECT 1');
            
            // Check if tables exist, specifically Products
            try {
                await connection.query('SELECT 1 FROM Products LIMIT 1');
                dbStatus = { status: 'connected', error: null, tableExists: true };
                console.log("✅ Kết nối tới database MySQL thành công và bảng Products đã tồn tại!");
                
                // Run Seeding
                await seedDatabase(connection);

            } catch (tableError) {
                if (tableError.code === 'ER_NO_SUCH_TABLE') {
                    console.warn("⚠️ Kết nối DB thành công NHƯNG chưa tìm thấy bảng 'Products'.");
                    dbStatus = { status: 'connected', error: { code: 'MISSING_TABLES', message: 'Database chưa có dữ liệu (thiếu bảng Products).' }, tableExists: false };
                } else {
                    throw tableError;
                }
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

// --- HELPERS ---
const deserializeProduct = (p) => ({
    ...p,
    imageUrls: typeof p.imageUrls === 'string' ? JSON.parse(p.imageUrls || '[]') : p.imageUrls,
    specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications || '{}') : p.specifications,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : p.tags,
    isVisible: Boolean(p.isVisible), 
    price: Number(p.price),
    stock: Number(p.stock),
});

const deserializeOrder = (o) => ({
    ...o,
    customerInfo: typeof o.customerInfo === 'string' ? JSON.parse(o.customerInfo || '{}') : o.customerInfo,
    items: typeof o.items === 'string' ? JSON.parse(o.items || '[]') : o.items,
    paymentInfo: typeof o.paymentInfo === 'string' ? JSON.parse(o.paymentInfo || '{}') : o.paymentInfo,
    shippingInfo: typeof o.shippingInfo === 'string' ? JSON.parse(o.shippingInfo || '{}') : o.shippingInfo,
    totalAmount: Number(o.totalAmount),
});

const deserializeUser = (u) => {
    const { password, ...userWithoutPassword } = u;
    return userWithoutPassword;
};

// --- API ROUTES ---

app.get('/api/health', async (req, res) => {
    if (dbStatus.status !== 'connected') await checkDbConnection();
    if (dbStatus.status === 'connected') {
        res.status(200).json({ status: 'ok', database: 'connected', tableExists: dbStatus.tableExists });
    } else {
        res.status(500).json({ status: 'error', database: 'disconnected', error: dbStatus.error });
    }
});

// === USERS ===
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Users');
        res.json(rows.map(deserializeUser));
    } catch (error) {
        console.error("Lỗi lấy danh sách users:", error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const user = req.body;
        const id = user.id || `user-${crypto.randomUUID()}`;
        const query = `INSERT INTO Users (id, username, email, password, role, staffRole, phone, address, imageUrl, status, joinDate, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(query, [
            id, user.username, user.email, user.password, user.role, user.staffRole, 
            user.phone, user.address, user.imageUrl, user.status, user.joinDate, user.position
        ]);
        const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [id]);
        res.json(deserializeUser(rows[0]));
    } catch (error) {
        console.error("Lỗi tạo user:", error);
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const updates = req.body;
        const id = req.params.id;
        
        const fields = Object.keys(updates).filter(k => k !== 'id');
        if (fields.length === 0) return res.json({ message: "No updates" });

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => updates[f]);
        
        await pool.query(`UPDATE Users SET ${setClause} WHERE id = ?`, [...values, id]);
        
        const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [id]);
        res.json(deserializeUser(rows[0]));
    } catch (error) {
        console.error("Lỗi cập nhật user:", error);
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error("Lỗi xóa user:", error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/users/login', async (req, res) => {
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

// === PRODUCTS ===

// 1. Featured Products (IMPORTANT: Must be defined BEFORE /:id)
app.get('/api/products/featured', async (req, res) => {
    try {
        // Lấy 4 sản phẩm có giá cao nhất làm sản phẩm nổi bật (hoặc logic khác tùy ý)
        const query = `SELECT * FROM Products ORDER BY price DESC LIMIT 4`;
        const [rows] = await pool.query(query);
        res.json(rows.map(deserializeProduct));
    } catch (error) {
        console.error("Lỗi lấy sản phẩm nổi bật:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// 2. Products List
app.get('/api/products', async (req, res) => {
    try {
        const { mainCategory, subCategory, q, tags, limit = 1000, page = 1, is_featured } = req.query;
        let baseQuery = `FROM Products p`;
        const whereClauses = ['1=1'];
        const params = [];
        
        if (mainCategory) { whereClauses.push('p.mainCategory = ?'); params.push(mainCategory); }
        if (subCategory) { whereClauses.push('p.subCategory = ?'); params.push(subCategory); }
        if (q) { whereClauses.push('(p.name LIKE ? OR p.brand LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
        if (tags) { whereClauses.push('p.tags LIKE ?'); params.push(`%${tags}%`); }
        
        // Handle is_featured query for the generic list
        if (is_featured === 'true') {
             // Logic for featured if needed in general query, currently fallback to ordering by price
             // Note: Usually frontend calls /api/products/featured for this specifically.
        }

        const whereString = ' WHERE ' + whereClauses.join(' AND ');
        
        const [countRows] = await pool.query(`SELECT COUNT(p.id) as total ${baseQuery} ${whereString}`, params);
        const totalProducts = countRows[0].total;

        const offset = (Number(page) - 1) * Number(limit);
        const productQuery = `SELECT p.* ${baseQuery} ${whereString} ORDER BY p.id DESC LIMIT ? OFFSET ?`;
        const [products] = await pool.query(productQuery, [...params, Number(limit), offset]);
        
        res.json({ products: products.map(deserializeProduct), totalProducts });
    } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// 3. Product Detail (Dynamic ID)
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

// === ORDERS ===

app.get('/api/orders', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Orders ORDER BY orderDate DESC');
        res.json(rows.map(deserializeOrder));
    } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng:", error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/orders/customer/:customerId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Orders WHERE userId = ? ORDER BY orderDate DESC', [req.params.customerId]);
        res.json(rows.map(deserializeOrder));
    } catch (error) {
        console.error("Lỗi lấy đơn hàng của customer:", error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const order = req.body;
        const id = order.id || `order-${Date.now()}`;
        
        const customerInfo = JSON.stringify(order.customerInfo);
        const items = JSON.stringify(order.items);
        const paymentInfo = JSON.stringify(order.paymentInfo);
        const shippingInfo = JSON.stringify(order.shippingInfo || {});

        const query = `INSERT INTO Orders (id, userId, creatorId, customerInfo, items, subtotal, totalAmount, paidAmount, cost, profit, status, paymentInfo, shippingInfo, orderDate, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await pool.query(query, [
            id, order.userId, order.creatorId, customerInfo, items, 
            order.subtotal, order.totalAmount, order.paidAmount, order.cost, order.profit,
            order.status, paymentInfo, shippingInfo, order.orderDate, order.notes
        ]);
        
        const [rows] = await pool.query('SELECT * FROM Orders WHERE id = ?', [id]);
        res.json(deserializeOrder(rows[0]));
    } catch (error) {
        console.error("Lỗi tạo đơn hàng:", error);
        res.status(500).json({ message: error.message });
    }
});

// === FINANCIALS (Payroll, Transactions) ===

// Get Transactions
app.get('/api/financials/transactions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM FinancialTransactions ORDER BY transactionDate DESC');
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy giao dịch:", error);
        res.status(500).json({ message: error.message });
    }
});

// Add Transaction
app.post('/api/financials/transactions', async (req, res) => {
    try {
        const t = req.body;
        const id = t.id || `trans-${Date.now()}`;
        const query = `INSERT INTO FinancialTransactions (id, type, category, amount, description, transactionDate, relatedEntity, invoiceNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(query, [id, t.type, t.category, t.amount, t.description, t.date || t.transactionDate, t.relatedEntity, t.invoiceNumber]);
        
        const [rows] = await pool.query('SELECT * FROM FinancialTransactions WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        console.error("Lỗi thêm giao dịch:", error);
        res.status(500).json({ message: error.message });
    }
});

// Get Payroll
app.get('/api/financials/payroll', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM PayrollRecords');
        res.json(rows);
    } catch (error) {
        console.error("Lỗi lấy bảng lương:", error);
        res.status(500).json({ message: error.message });
    }
});

// Save Payroll (Batch Insert/Update)
app.post('/api/financials/payroll', async (req, res) => {
    try {
        const records = req.body; // Expecting an array
        if (!Array.isArray(records)) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ (phải là mảng)." });
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            for (const r of records) {
                // Check if exists
                const [existing] = await connection.query('SELECT id FROM PayrollRecords WHERE id = ?', [r.id]);
                if (existing.length > 0) {
                    await connection.query(`UPDATE PayrollRecords SET employeeId=?, employeeName=?, payPeriod=?, baseSalary=?, bonus=?, deduction=?, finalSalary=?, status=?, notes=? WHERE id=?`, 
                    [r.employeeId, r.employeeName, r.payPeriod, r.baseSalary, r.bonus, r.deduction, r.finalSalary, r.status, r.notes, r.id]);
                } else {
                    await connection.query(`INSERT INTO PayrollRecords (id, employeeId, employeeName, payPeriod, baseSalary, bonus, deduction, finalSalary, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [r.id, r.employeeId, r.employeeName, r.payPeriod, r.baseSalary, r.bonus, r.deduction, r.finalSalary, r.status, r.notes]);
                }
            }
            await connection.commit();
            res.json({ message: "Lưu bảng lương thành công" });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Lỗi lưu bảng lương:", error);
        res.status(500).json({ message: error.message });
    }
});

// === ARTICLES ===
app.get('/api/articles', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Articles ORDER BY date DESC');
        // Parse JSON tags
        const articles = rows.map(a => ({
            ...a,
            tags: typeof a.tags === 'string' ? JSON.parse(a.tags) : a.tags
        }));
        res.json(articles);
    } catch (error) {
        console.error("Lỗi lấy bài viết:", error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/articles', async (req, res) => {
    try {
        const a = req.body;
        const id = a.id || `art-${Date.now()}`;
        const tags = JSON.stringify(a.tags || []);
        await pool.query(`INSERT INTO Articles (id, title, summary, content, author, category, imageUrl, date, tags, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, a.title, a.summary, a.content, a.author, a.category, a.imageUrl, a.date, tags, a.slug]);
        const [rows] = await pool.query('SELECT * FROM Articles WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        console.error("Lỗi thêm bài viết:", error);
        res.status(500).json({ message: error.message });
    }
});

// --- SERVE STATIC FILES (PRODUCTION) ---
if (process.env.NODE_ENV === 'production') {
    const projectRoot = path.resolve(__dirname, '..');
    const frontendDistPath = path.join(projectRoot, 'dist');
    
    app.use(express.static(frontendDistPath));

    // Handle React Routing, return all requests to React app
    app.get('*', (req, res) => {
        // If request starts with /api/ and hasn't been handled, return 404 JSON
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ message: `API endpoint not found: ${req.path}` });
        }
        res.sendFile(path.resolve(frontendDistPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});
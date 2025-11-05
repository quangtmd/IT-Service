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
            whereClauses.push('(p.name LIKE ? OR p.brand LIKE ? OR c.name LIKE ? OR mc.name LIKE ?)');
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        if (brand) {
            whereClauses.push('p.brand = ?');
            params.push(brand);
        }
        if (status) {
            whereClauses.push('p.status = ?');
            params.push(status);
        }
        if (tags) {
            whereClauses.push('JSON_CONTAINS(p.tags, JSON_QUOTE(?))');
            params.push(tags);
        }

        if (whereClauses.length > 0) {
            const whereString = ` WHERE ${whereClauses.join(' AND ')}`;
            baseQuery += whereString;
            countQuery += whereString;
        }

        const [countRows] = await pool.query(countQuery, params);
        const totalProducts = countRows[0].total;

        const offset = (page - 1) * limit;
        baseQuery += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

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
        console.error("Lỗi khi truy vấn danh sách sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server khi lấy sản phẩm", error: error.sqlMessage || error.message });
    }
});


app.post('/api/products', async (req, res) => {
    try {
        const p = req.body;
        const newId = `prod-${Date.now()}`;
        const query = `
            INSERT INTO Products (id, name, price, originalPrice, imageUrls, description, shortDescription, specifications, stock, brand, tags, is_published, is_featured, category_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT id FROM ProductCategories WHERE name = ? LIMIT 1))
        `;
        const params = [
            newId, p.name, p.price, p.originalPrice || null,
            JSON.stringify(p.imageUrls || []), p.description, p.shortDescription,
            JSON.stringify(p.specifications || {}), p.stock, p.brand,
            JSON.stringify(p.tags || []), p.isVisible, p.is_featured || false,
            p.subCategory
        ];

        await pool.query(query, params);
        const [newProduct] = await pool.query('SELECT * FROM Products WHERE id = ?', [newId]);
        res.status(201).json(newProduct[0]);
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const p = req.body;
        const query = `
            UPDATE Products SET 
                name = ?, price = ?, originalPrice = ?, imageUrls = ?, description = ?, shortDescription = ?, 
                specifications = ?, stock = ?, brand = ?, tags = ?, is_published = ?, is_featured = ?,
                category_id = (SELECT id FROM ProductCategories WHERE name = ? LIMIT 1)
            WHERE id = ?
        `;
        const params = [
            p.name, p.price, p.originalPrice || null, JSON.stringify(p.imageUrls || []),
            p.description, p.shortDescription, JSON.stringify(p.specifications || {}),
            p.stock, p.brand, JSON.stringify(p.tags || []), p.isVisible, p.is_featured || false,
            p.subCategory, id
        ];

        await pool.query(query, params);
        const [updatedProduct] = await pool.query('SELECT * FROM Products WHERE id = ?', [id]);
        res.json(updatedProduct[0]);
    } catch (error) {
        console.error(`Lỗi khi cập nhật sản phẩm ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Products WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        console.error(`Lỗi khi xóa sản phẩm ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});


// --- ORDERS API ---

app.get('/api/orders', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Orders ORDER BY orderDate DESC');
        const orders = rows.map(order => ({
            ...order,
            customerInfo: JSON.parse(order.customerInfo),
            items: JSON.parse(order.items),
            paymentInfo: JSON.parse(order.paymentInfo),
            shippingInfo: JSON.parse(order.shippingInfo || '{}'),
        }));
        res.json(orders);
    } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy đơn hàng', error: error.sqlMessage || error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const order = req.body;
        const query = `
            INSERT INTO Orders (id, customerInfo, items, totalAmount, orderDate, status, paymentInfo, shippingInfo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        // Although the DB can auto-stringify, it's safer to do it explicitly
        const params = [
            order.id,
            JSON.stringify(order.customerInfo),
            JSON.stringify(order.items),
            order.totalAmount,
            new Date(order.orderDate),
            order.status,
            JSON.stringify(order.paymentInfo),
            JSON.stringify(order.shippingInfo || {}),
        ];

        await pool.query(query, params);
        res.status(201).json(order);
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng', error: error.sqlMessage || error.message });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await pool.query('UPDATE Orders SET status = ? WHERE id = ?', [status, id]);
        res.status(200).json({ message: 'Trạng thái đơn hàng đã được cập nhật.' });
    } catch (error) {
        console.error(`Lỗi khi cập nhật trạng thái đơn hàng ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Lỗi server', error: error.sqlMessage || error.message });
    }
});


// --- ARTICLES API ---
app.get('/api/articles', async (req, res) => {
    try {
        const [articles] = await pool.query('SELECT * FROM Articles ORDER BY date DESC');
        res.json(articles);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
});
app.get('/api/articles/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Articles WHERE id = ?', [req.params.id]);
        if (rows[0]) res.json(rows[0]);
        else res.status(404).json({ message: 'Không tìm thấy bài viết' });
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
});
app.post('/api/articles', async (req, res) => {
    try {
        const a = req.body;
        const newId = `art-${Date.now()}`;
        const query = 'INSERT INTO Articles (id, title, summary, imageUrl, author, date, category, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await pool.query(query, [newId, a.title, a.summary, a.imageUrl, a.author, new Date(a.date), a.category, a.content]);
        res.status(201).json({ ...a, id: newId });
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
});
app.put('/api/articles/:id', async (req, res) => {
    try {
        const a = req.body;
        const query = 'UPDATE Articles SET title=?, summary=?, imageUrl=?, author=?, category=?, content=? WHERE id=?';
        await pool.query(query, [a.title, a.summary, a.imageUrl, a.author, a.category, a.content, req.params.id]);
        res.json(a);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
});
app.delete('/api/articles/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Articles WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
});

// --- CHAT LOGS API ---
app.get('/api/chatlogs', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ChatLogSessions ORDER BY startTime DESC');
        const logs = rows.map(log => ({ ...log, messages: JSON.parse(log.messages || '[]') }));
        res.json(logs);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
});
app.post('/api/chatlogs', async (req, res) => {
    try {
        const session = req.body;
        const query = `
            INSERT INTO ChatLogSessions (id, userName, userPhone, startTime, messages, isRead) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            messages = VALUES(messages), isRead = VALUES(isRead)
        `;
        await pool.query(query, [session.id, session.userName, session.userPhone, new Date(session.startTime), JSON.stringify(session.messages), session.isRead]);
        res.status(201).send();
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
});

// --- MEDIA LIBRARY API ---
app.get('/api/media', async (req, res) => {
    try {
        const [items] = await pool.query('SELECT * FROM MediaItems ORDER BY uploadedAt DESC');
        res.json(items);
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
});
app.post('/api/media', async (req, res) => {
    try {
        const item = req.body;
        const newId = `media-${Date.now()}`;
        const query = 'INSERT INTO MediaItems (id, url, name, type, uploadedAt) VALUES (?, ?, ?, ?, ?)';
        await pool.query(query, [newId, item.url, item.name, item.type, new Date(item.uploadedAt)]);
        res.status(201).json({ ...item, id: newId });
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
});
app.delete('/api/media/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM MediaItems WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
});

// --- FINANCIALS API ---
app.get('/api/financials/transactions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM FinancialTransactions ORDER BY date DESC');
        res.json(rows);
    } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
});

app.post('/api/financials/transactions', async (req, res) => {
    try {
        const t = req.body;
        const newId = `trans-${Date.now()}`;
        const q = 'INSERT INTO FinancialTransactions (id, date, amount, type, category, description, relatedEntity, invoiceNumber) VALUES (?,?,?,?,?,?,?,?)';
        await pool.query(q, [newId, new Date(t.date), t.amount, t.type, t.category, t.description, t.relatedEntity, t.invoiceNumber]);
        res.status(201).json({ ...t, id: newId });
    } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
});

app.put('/api/financials/transactions/:id', async (req, res) => {
    try {
        const t = req.body;
        const q = 'UPDATE FinancialTransactions SET date=?, amount=?, type=?, category=?, description=?, relatedEntity=?, invoiceNumber=? WHERE id=?';
        await pool.query(q, [new Date(t.date), t.amount, t.type, t.category, t.description, t.relatedEntity, t.invoiceNumber, req.params.id]);
        res.json(t);
    } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
});

app.delete('/api/financials/transactions/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM FinancialTransactions WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
});


app.get('/api/financials/payroll', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM PayrollRecords');
        res.json(rows);
    } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
});

app.post('/api/financials/payroll', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const records = req.body;
        for (const r of records) {
            const query = `
                INSERT INTO PayrollRecords (id, employeeId, employeeName, payPeriod, baseSalary, bonus, deduction, finalSalary, notes, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                baseSalary=VALUES(baseSalary), bonus=VALUES(bonus), deduction=VALUES(deduction), finalSalary=VALUES(finalSalary), notes=VALUES(notes), status=VALUES(status)
            `;
            await connection.query(query, [r.id, r.employeeId, r.employeeName, r.payPeriod, r.baseSalary, r.bonus, r.deduction, r.finalSalary, r.notes, r.status]);
        }
        await connection.commit();
        res.status(201).send();
    } catch (e) {
        await connection.rollback();
        res.status(500).json({ message: 'Lỗi server' });
    } finally {
        connection.release();
    }
});

// --- FINANCIAL DASHBOARD API ---
app.get('/api/financial-dashboard', async (req, res) => {
    try {
        // This is a simplified example. A real implementation would be more complex.
        const [transactions] = await pool.query('SELECT * FROM FinancialTransactions');
        const [products] = await pool.query('SELECT id, price, stock FROM Products');

        const totalCash = 100000000; // Placeholder
        const revenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        
        const expenseByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        const data = {
            financialStatus: { totalCash, revenue, expense, profit: revenue - expense, inventoryValue },
            receivables: { total: 50000000, overdue: 12000000 },
            payables: { total: 25000000, overdue: 5000000 },
            revenueExpenseChart: [
                { label: 'T1', revenue: 150, expense: 80, profit: 70 },
                { label: 'T2', revenue: 180, expense: 100, profit: 80 },
            ].map(d => ({...d, revenue: d.revenue * 1000000, expense: d.expense * 1000000, profit: d.profit * 1000000 })),
            expensePieChart: Object.entries(expenseByCategory).map(([name, value]) => ({name, value})),
            lowStockItems: products.filter(p => p.stock < 10).length,
            pendingOrders: 5,
        };
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy dữ liệu dashboard."});
    }
});

app.get('/', (req, res) => {
    res.send('IQ Technology Backend is running!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
```
</change>
<change>
<file>components/admin/QuotationManagementView.tsx</file>
<description>Hoàn thiện chức năng quản lý báo giá với đầy đủ các thao tác Thêm, Sửa, Xoá. Quan trọng nhất, bổ sung tính năng "Xem" để mở chi tiết báo giá và nút "In Báo giá", cho phép in ra một phiên bản báo giá chuyên nghiệp, được định dạng sẵn cho khổ giấy A4.</description>
<content><![CDATA[import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Quotation, QuotationStatus, Product, User, OrderItem, CheckoutFormData } from '../../types';
import Button from '../ui/Button';
import { getQuotations, addQuotation, updateQuotation, deleteQuotation, getProducts } from '../../services/localDataService';
import { useAuth } from '../../contexts/AuthContext';
import * as Constants from '../../constants';

const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
        case 'Bản nháp': return 'bg-gray-100 text-gray-800';
        case 'Đã gửi': return 'bg-blue-100 text-blue-800';
        case 'Đã chấp nhận': return 'bg-green-100 text-green-800';
        case 'Đã hết hạn': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const QuotationManagementView: React.FC = () => {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
    const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);


    const loadQuotations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getQuotations();
            setQuotations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu báo giá.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadQuotations();
    }, [loadQuotations]);

    const filteredQuotations = useMemo(() =>
        quotations.filter(q =>
            q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()),
    [quotations, searchTerm]);

    const handleSave = async (data: Omit<Quotation, 'id'> & { id?: string }) => {
        try {
            if (data.id) {
                await updateQuotation(data.id, data);
            } else {
                await addQuotation(data);
            }
            loadQuotations();
        } catch (error) {
            alert("Lỗi khi lưu báo giá.");
        } finally {
            setIsFormModalOpen(false);
            setEditingQuotation(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa báo giá này?')) {
            try {
                await deleteQuotation(id);
                loadQuotations();
            } catch (error) {
                alert("Lỗi khi xóa báo giá.");
            }
        }
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex justify-between items-center">
                <h3 className="admin-card-title">Quản lý Báo Giá ({filteredQuotations.length})</h3>
                <Button onClick={() => { setEditingQuotation(null); setIsFormModalOpen(true); }} size="sm" leftIcon={<i className="fas fa-plus"></i>}>
                    Tạo Báo giá
                </Button>
            </div>
            <div className="admin-card-body">
                 <input type="text" placeholder="Tìm báo giá..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="admin-form-group w-full max-w-md mb-4"/>
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead><tr><th>Mã BG</th><th>Khách hàng</th><th>Ngày tạo</th><th>Tổng tiền</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                        <tbody>
                            {isLoading ? ( <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
                            ) : error ? ( <tr><td colSpan={6} className="text-center py-4 text-red-500">{error}</td></tr>
                            ) : filteredQuotations.length > 0 ? ( filteredQuotations.map(q => (
                                <tr key={q.id}>
                                    <td><span className="font-mono text-xs bg-gray-100 p-1 rounded">#{q.id.slice(-6)}</span></td>
                                    <td>{q.customerInfo.fullName}</td>
                                    <td>{new Date(q.creationDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="font-semibold">{q.totalAmount.toLocaleString('vi-VN')}₫</td>
                                    <td><span className={`status-badge ${getStatusColor(q.status)}`}>{q.status}</span></td>
                                    <td>
                                        <div className="flex gap-2">
                                            <Button onClick={() => setViewingQuotation(q)} size="sm" variant="outline"><i className="fas fa-eye"></i></Button>
                                            <Button onClick={() => { setEditingQuotation(q); setIsFormModalOpen(true); }} size="sm" variant="outline"><i className="fas fa-edit"></i></Button>
                                            <Button onClick={() => handleDelete(q.id)} size="sm" variant="ghost" className="text-red-500"><i className="fas fa-trash"></i></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                            ) : ( <tr><td colSpan={6} className="text-center py-4 text-textMuted">Không có báo giá nào.</td></tr> )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            {isFormModalOpen && <QuotationFormModal quotation={editingQuotation} onSave={handleSave} onClose={() => { setIsFormModalOpen(false); setEditingQuotation(null); }} />}
            {viewingQuotation && <QuotationDetailModal quotation={viewingQuotation} onClose={() => setViewingQuotation(null)} />}
        </div>
    );
};

// --- Modal Form ---
interface QuotationFormModalProps {
    quotation: Quotation | null;
    onSave: (data: Omit<Quotation, 'id'> & { id?: string }) => void;
    onClose: () => void;
}

const QuotationFormModal: React.FC<QuotationFormModalProps> = ({ quotation, onSave, onClose }) => {
    const { users, addUser } = useAuth();
    const [formData, setFormData] = useState<Partial<Quotation>>(quotation || {
        customerInfo: { fullName: '', phone: '', email: '', address: '' },
        items: [], totalAmount: 0, creationDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Bản nháp', notes: ''
    });
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => { getProducts('limit=10000').then(data => setAllProducts(data.products)) }, []);

    const customerOptions = useMemo(() => users.filter(u => u.role === 'customer'), [users]);

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, customerInfo: { ...p.customerInfo!, [name]: value } }));
    };
    
    const handleSelectExistingCustomer = (email: string) => {
        const customer = users.find(u => u.email === email);
        if(customer) {
            setFormData(p => ({...p, customerInfo: {
                fullName: customer.username,
                email: customer.email,
                phone: customer.phone || '',
                address: customer.address || '',
                notes: ''
            }}));
        }
    }

    const handleItemChange = (index: number, field: 'quantity' | 'price', value: number) => {
        const newItems = [...(formData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(p => ({ ...p, items: newItems as OrderItem[] }));
    };

    const addItem = (product: Product) => {
        const newItems = [...(formData.items || [])];
        const existing = newItems.find(i => i.productId === product.id);
        if (existing) {
            existing.quantity++;
        } else {
            newItems.push({ productId: product.id, productName: product.name, quantity: 1, price: product.price });
        }
        setFormData(p => ({ ...p, items: newItems as OrderItem[] }));
        setProductSearch('');
    };
    
    const removeItem = (index: number) => {
        const newItems = (formData.items || []).filter((_, i) => i !== index);
        setFormData(p => ({...p, items: newItems as OrderItem[]}));
    }

    useEffect(() => {
        const total = (formData.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setFormData(p => ({ ...p, totalAmount: total }));
    }, [formData.items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isNewCustomer = !customerOptions.some(c => c.email === formData.customerInfo?.email);
        if (isNewCustomer && formData.customerInfo?.email) {
            await addUser({
                username: formData.customerInfo.fullName,
                email: formData.customerInfo.email,
                phone: formData.customerInfo.phone,
                address: formData.customerInfo.address,
                role: 'customer'
            });
        }
        onSave(formData as Quotation);
    };

    const searchedProducts = useMemo(() => {
        if (!productSearch) return [];
        return allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5);
    }, [productSearch, allProducts]);

    return (
        <div className="admin-modal-overlay">
            <form onSubmit={handleSubmit} className="admin-modal-panel max-w-4xl">
                <div className="admin-modal-header"><h4 className="admin-modal-title">{formData.id ? 'Sửa Báo giá' : 'Tạo Báo giá Mới'}</h4><button type="button" onClick={onClose}>&times;</button></div>
                <div className="admin-modal-body grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h5 className="admin-form-subsection-title">Thông tin khách hàng</h5>
                         <div className="admin-form-group"><label>Tìm khách hàng cũ</label>
                            <select onChange={e => handleSelectExistingCustomer(e.target.value)} className="mb-2">
                                <option value="">-- Chọn hoặc tạo mới --</option>
                                {customerOptions.map(c => <option key={c.id} value={c.email}>{c.username} - {c.email}</option>)}
                            </select>
                        </div>
                        <div className="admin-form-group"><label>Họ tên *</label><input type="text" name="fullName" value={formData.customerInfo?.fullName || ''} onChange={handleCustomerChange} required /></div>
                        <div className="admin-form-group"><label>Email *</label><input type="email" name="email" value={formData.customerInfo?.email || ''} onChange={handleCustomerChange} required /></div>
                        <div className="admin-form-group"><label>Điện thoại *</label><input type="tel" name="phone" value={formData.customerInfo?.phone || ''} onChange={handleCustomerChange} required /></div>
                        <div className="admin-form-group"><label>Địa chỉ</label><input type="text" name="address" value={formData.customerInfo?.address || ''} onChange={handleCustomerChange} /></div>
                    </div>
                     <div>
                        <h5 className="admin-form-subsection-title">Thông tin báo giá</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="admin-form-group"><label>Ngày tạo</label><input type="date" value={(formData.creationDate || '').split('T')[0]} onChange={e => setFormData(p=>({...p, creationDate: e.target.value}))}/></div>
                            <div className="admin-form-group"><label>Ngày hết hạn</label><input type="date" value={(formData.expiryDate || '').split('T')[0]} onChange={e => setFormData(p=>({...p, expiryDate: e.target.value}))}/></div>
                            <div className="admin-form-group col-span-2"><label>Trạng thái</label>
                                <select value={formData.status} onChange={e => setFormData(p=>({...p, status: e.target.value as QuotationStatus}))}>
                                    <option value="Bản nháp">Bản nháp</option><option value="Đã gửi">Đã gửi</option><option value="Đã chấp nhận">Đã chấp nhận</option><option value="Đã hết hạn">Đã hết hạn</option>
                                </select>
                            </div>
                        </div>
                         <div className="admin-form-group"><label>Ghi chú</label><textarea rows={3} value={formData.notes || ''} onChange={e => setFormData(p => ({...p, notes: e.target.value}))}></textarea></div>
                    </div>
                     <div className="md:col-span-2">
                        <h5 className="admin-form-subsection-title">Sản phẩm</h5>
                        <div className="relative admin-form-group">
                            <label>Tìm sản phẩm</label>
                            <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Nhập tên sản phẩm..."/>
                            {searchedProducts.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto">
                                    {searchedProducts.map(p => <li key={p.id} onClick={() => addItem(p)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{p.name} <span className="text-gray-500">(Tồn: {p.stock})</span></li>)}
                                </ul>
                            )}
                        </div>
                        <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
                            {(formData.items || []).map((item, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <span className="flex-grow text-sm">{item.productName}</span>
                                    <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-16 p-1 text-center"/>
                                    <input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} className="w-28 p-1"/>
                                    <Button type="button" size="sm" variant="ghost" className="text-red-500" onClick={() => removeItem(index)}>&times;</Button>
                                </div>
                            ))}
                        </div>
                        <div className="text-right font-bold mt-4">Tổng cộng: {formData.totalAmount?.toLocaleString('vi-VN')}₫</div>
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                    <Button type="submit">Lưu Báo giá</Button>
                </div>
            </form>
        </div>
    );
};


// --- Detail & Print Modal ---
interface QuotationDetailModalProps {
    quotation: Quotation;
    onClose: () => void;
}
const QuotationDetailModal: React.FC<QuotationDetailModalProps> = ({ quotation, onClose }) => {
    const handlePrint = () => window.print();

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-panel max-w-4xl" id="printable-area">
                <div className="admin-modal-header no-print">
                    <h4 className="admin-modal-title">Chi tiết Báo giá #{quotation.id.slice(-6)}</h4>
                    <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <div className="admin-modal-body bg-white">
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex justify-between items-start pb-4 border-b">
                            <div>
                                <h1 className="text-2xl font-bold text-primary">{Constants.COMPANY_NAME}</h1>
                                <p className="text-xs">{Constants.COMPANY_ADDRESS}</p>
                                <p className="text-xs">SĐT: {Constants.COMPANY_PHONE} | Email: {Constants.COMPANY_EMAIL}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-bold text-gray-700 uppercase">Báo Giá</h2>
                                <p className="text-sm">Mã số: <span className="font-mono">#{quotation.id.slice(-6)}</span></p>
                                <p className="text-sm">Ngày: {new Date(quotation.creationDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <h5 className="font-semibold text-gray-500 text-sm mb-1">Gửi đến:</h5>
                                <p className="font-bold text-lg">{quotation.customerInfo.fullName}</p>
                                <p className="text-sm">{quotation.customerInfo.address}</p>
                                <p className="text-sm">SĐT: {quotation.customerInfo.phone}</p>
                                <p className="text-sm">Email: {quotation.customerInfo.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm">Trạng thái: <span className={`font-semibold ${getStatusColor(quotation.status)} px-2 py-1 rounded-full text-xs`}>{quotation.status}</span></p>
                                <p className="text-sm">Hiệu lực đến: {new Date(quotation.expiryDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                        {/* Items Table */}
                        <div className="mt-6">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 text-sm font-semibold">Sản phẩm</th>
                                        <th className="p-2 text-sm font-semibold text-right">Đơn giá</th>
                                        <th className="p-2 text-sm font-semibold text-center">Số lượng</th>
                                        <th className="p-2 text-sm font-semibold text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotation.items.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-2">{item.productName}</td>
                                            <td className="p-2 text-right">{item.price.toLocaleString('vi-VN')}₫</td>
                                            <td className="p-2 text-center">{item.quantity}</td>
                                            <td className="p-2 text-right font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Total */}
                        <div className="flex justify-end mt-4">
                            <div className="w-full max-w-xs">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Tổng cộng:</span>
                                    <span>{quotation.totalAmount.toLocaleString('vi-VN')}₫</span>
                                </div>
                            </div>
                        </div>
                         {/* Notes */}
                        {quotation.notes && <div className="mt-6 text-sm text-gray-600 border-t pt-4"><strong>Ghi chú:</strong> {quotation.notes}</div>}
                    </div>
                </div>
                <div className="admin-modal-footer no-print">
                    <Button type="button" variant="outline" onClick={onClose}>Đóng</Button>
                    <Button type="button" variant="primary" onClick={handlePrint} leftIcon={<i className="fas fa-print"></i>}>In Báo giá</Button>
                </div>
            </div>
        </div>
    );
};

export default QuotationManagementView;
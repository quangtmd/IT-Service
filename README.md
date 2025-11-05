<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it to the web.

View your app in AI Studio: https://ai.studio/apps/drive/1NczgJ-ti9VqQ8LwMkqhxBrhnvi-qRD0E

## 1. Run Locally

This project consists of two main parts: a **Frontend** (React app) and a **Backend** (Node.js API server). You must run both simultaneously for the application to work correctly.

**Prerequisites:**
- Node.js
- A local MySQL database server installed and running. (e.g., via [XAMPP](https://www.apachefriends.org/index.html), [WAMP](https://www.wampserver.com/en/), [MAMP](https://www.mamp.info/en/mamp-mac/), or a direct install).

---

### Step 1: Database Setup (Important!)

For local development, using a local database is strongly recommended to avoid network and IP whitelisting issues with remote databases.

1.  **Start your local MySQL server.**
2.  **Create a new database.** You can use a tool like phpMyAdmin or a command-line client. Name it `iq_technology_db`.
    ```sql
    CREATE DATABASE iq_technology_db;
    ```
3.  **Create the tables.** Run the following SQL commands in your newly created database to set up the necessary structure.
    ```sql
    CREATE TABLE ProductCategories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        parent_id INT,
        FOREIGN KEY (parent_id) REFERENCES ProductCategories(id)
    );
    
    CREATE TABLE Products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id INT,
        price DECIMAL(12, 0) NOT NULL,
        originalPrice DECIMAL(12, 0),
        imageUrls JSON,
        description TEXT,
        shortDescription TEXT,
        specifications JSON,
        stock INT NOT NULL,
        status VARCHAR(50),
        rating FLOAT,
        reviews INT,
        brand VARCHAR(255),
        tags JSON,
        brandLogoUrl VARCHAR(255),
        is_published BOOLEAN DEFAULT TRUE,
        seoMetaTitle VARCHAR(255),
        seoMetaDescription TEXT,
        slug VARCHAR(255) UNIQUE,
        FOREIGN KEY (category_id) REFERENCES ProductCategories(id)
    );

    CREATE TABLE Orders (
        id VARCHAR(255) PRIMARY KEY, customerInfo JSON NOT NULL, items JSON NOT NULL,
        totalAmount DECIMAL(12, 0) NOT NULL, orderDate DATETIME NOT NULL,
        status VARCHAR(50) NOT NULL, shippingInfo JSON, paymentInfo JSON NOT NULL
    );

    CREATE TABLE Articles (
        id VARCHAR(255) PRIMARY KEY, title VARCHAR(255) NOT NULL, summary TEXT,
        imageUrl TEXT, author VARCHAR(255), date DATETIME NOT NULL, category VARCHAR(255),
        content TEXT, isAIGenerated BOOLEAN DEFAULT FALSE, imageSearchQuery VARCHAR(255)
    );

    CREATE TABLE MediaItems (
        id VARCHAR(255) PRIMARY KEY, url LONGTEXT NOT NULL, name VARCHAR(255),
        type VARCHAR(100), uploadedAt DATETIME NOT NULL
    );
    ```

---

### Step 2: Backend Setup

The backend server connects to your local MySQL database and provides APIs for the frontend.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create an environment file.** Copy the example file to create your own local configuration.
    ```bash
    cp .env.example .env
    ```
3.  **Configure your database connection.** Open the newly created `.env` file and update the credentials to match your local MySQL setup. (For default XAMPP/MAMP/WAMP, the user is often `root` with an empty password).

4.  **Install backend dependencies:**
    ```bash
    npm install
    ```

5.  **Start the backend server:**
    ```bash
    npm start
    ```
    The server will start on `http://localhost:3001`. **Keep this terminal window open.** If it connects to the database successfully, you will see a `✅ Kết nối tới database MySQL thành công!` message. If it fails, it will print a detailed error and stop.

---

### Step 3: Frontend Setup

In a **new, separate terminal window**, set up and run the React frontend.

1.  **Navigate to the project root directory** (if you are in the `backend` directory, run `cd ..`).

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```
3.  **Set your Environment Variables:**
    Create a file named `.env` in the project root (if it doesn't exist) and add your Gemini API key. The backend URL for local development is handled automatically by the proxy.
    ```
    # .env file in the project's root directory
    VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
4.  **Run the frontend app:**
    ```bash
    npm run dev
    ```
The application will now be accessible in your browser (usually at `http://localhost:3000`) and should be able to communicate with your local backend API.

---

## 2. Deploy to Render (Recommended Method)

This project contains two parts (**frontend** and **backend**) in one repository (a "monorepo"). The best way to deploy it is by using the included `render.yaml` blueprint file.

### Hướng Dẫn Triển Khai Chi Tiết:

1.  **Fork repository này** về tài khoản GitHub của bạn.

2.  **Chuẩn bị Database từ xa (Remote Database).**
    *   Tạo một database MySQL trên một nhà cung cấp dịch vụ cloud (ví dụ: Hostinger, Aiven, PlanetScale).
    *   **QUAN TRỌNG:** Truy cập vào công cụ quản lý database của bạn (ví dụ: phpMyAdmin trên Hostinger), vào tab "SQL", và **chạy các câu lệnh `CREATE TABLE`** được cung cấp trong phần **"Step 1: Database Setup"** ở trên. Bước này là bắt buộc để ứng dụng hoạt động.

3.  Vào trang [**Blueprints** trên Render Dashboard](https://dashboard.render.com/blueprints).

4.  Nhấp vào nút **"New Blueprint Instance"**.

    <img width="1011" alt="Render-New-Blueprint" src="https://github.com/user-attachments/assets/81c4e7fa-9b93-4e4f-b648-5254d3cd2c05">

5.  **Kết nối tài khoản GitHub của bạn** và chọn repository `IT-Service` bạn vừa fork. Render sẽ tự động phát hiện và đọc tệp `render.yaml`.

6.  **Đặt tên cho nhóm dịch vụ của bạn** (ví dụ: `it-service-app`) và nhấp vào **"Update Existing Resources"** hoặc **"Apply"**.

    <img width="1011" alt="Render-Apply-Blueprint" src="https://github.com/user-attachments/assets/d16715f2-9594-4d1a-be29-d655f41441a1">

7.  **Cấu hình Biến Môi trường (QUAN TRỌNG):** Render sẽ yêu cầu bạn nhập các khóa bí mật. Đây là bước quan trọng nhất.
    *   Đi đến tab **"Environment"** của Blueprint.
    *   Tạo một **"Environment Group"** mới hoặc thêm các biến trực tiếp.
    *   **BẮT BUỘC** phải thêm các khóa sau với giá trị tương ứng:
        *   `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Nhập thông tin kết nối đến cơ sở dữ liệu **REMOTE** của bạn (đã tạo ở bước 2).
        *   `VITE_GEMINI_API_KEY`: Nhập khóa API Google Gemini của bạn.

    <img width="1011" alt="Render-Env-Vars" src="https://github.com/user-attachments/assets/94b41982-f673-455b-b9f0-2f643e1d1628">


8.  Sau khi thêm các biến môi trường, nhấp vào **"Manual Deploy" > "Deploy latest commit"** ở góc trên cùng bên phải để bắt đầu quá trình triển khai.

---

## 3. Troubleshooting (Xử lý sự cố)

#### Lỗi: "Lỗi server khi lấy dữ liệu sản phẩm" trên website

Lỗi này có nghĩa là frontend đã kết nối được với backend, nhưng backend gặp lỗi khi truy vấn database.

1.  **Kiểm tra Logs của Backend Service.** Truy cập Render Dashboard, tìm service có tên `it-service-backend` và vào tab "Logs".
2.  Bạn sẽ thấy một lỗi SQL, thường là `Table 'your_db_name.Products' doesn't exist` hoặc `Unknown column 'some_column' in 'where clause'`.
3.  **CÁCH SỬA:** Lỗi này xảy ra vì bạn chưa tạo các bảng trong database từ xa, hoặc cấu trúc bảng (schema) không khớp với code. Hãy thực hiện lại **Bước 2 của phần Hướng Dẫn Triển Khai** ở trên (chạy các câu lệnh `CREATE TABLE` trên database của Hostinger/nhà cung cấp khác) để đảm bảo schema là mới nhất.
4.  Sau khi đã tạo/cập nhật bảng, hãy triển khai lại backend service trên Render.

#### Lỗi: "Lỗi mạng hoặc server không phản hồi" trên website

Lỗi này xảy ra khi frontend không thể kết nối với backend.

1.  **Kiểm tra Logs của Backend Service.** Truy cập Render Dashboard, tìm service `it-service-backend` và vào "Logs".
2.  Tìm lỗi `❌ LỖI KẾT NỐI DATABASE` ở phần đầu của logs.
3.  **CÁCH SỬA:**
    *   **Kiểm tra biến môi trường:** Vào phần "Environment" trên Render và đảm bảo các biến `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` hoàn toàn chính xác.
    *   **Kiểm tra IP Whitelisting:** Đảm bảo rằng nhà cung cấp database của bạn đã cho phép (whitelisted) các địa chỉ IP của Render kết nối vào. Tham khảo [tài liệu IP của Render](https://render.com/docs/static-outbound-ip-addresses). Đối với gói miễn phí, bạn có thể cần cho phép tất cả các IP (`0.0.0.0/0`).
4.  Sau khi sửa, hãy triển khai lại backend service.
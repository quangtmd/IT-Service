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
3.  **Import the tables.** Use the `CREATE TABLE` SQL statements found in the comments at the top of the `backend/server.js` file to create the necessary tables (`Products`, `Orders`, `Articles`, `MediaItems`) inside your new database.

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

2.  Vào trang [**Blueprints** trên Render Dashboard](https://dashboard.render.com/blueprints).

3.  Nhấp vào nút **"New Blueprint Instance"**.

    <img width="1011" alt="Render-New-Blueprint" src="https://github.com/user-attachments/assets/81c4e7fa-9b93-4e4f-b648-5254d3cd2c05">

4.  **Kết nối tài khoản GitHub của bạn** và chọn repository `IT-Service` bạn vừa fork. Render sẽ tự động phát hiện và đọc tệp `render.yaml`.

5.  **Đặt tên cho nhóm dịch vụ của bạn** (ví dụ: `it-service-app`) và nhấp vào **"Update Existing Resources"** hoặc **"Apply"**.

    <img width="1011" alt="Render-Apply-Blueprint" src="https://github.com/user-attachments/assets/d16715f2-9594-4d1a-be29-d655f41441a1">

6.  **Cấu hình Biến Môi trường (QUAN TRỌNG):** Render sẽ yêu cầu bạn nhập các khóa bí mật. Đây là bước quan trọng nhất.
    *   Đi đến tab **"Environment"** của Blueprint.
    *   Tạo một **"Environment Group"** mới hoặc thêm các biến trực tiếp.
    *   **BẮT BUỘC** phải thêm các khóa sau với giá trị tương ứng:
        *   `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Nhập thông tin kết nối đến cơ sở dữ liệu **REMOTE** của bạn (ví dụ: từ Hostinger, Aiven, v.v.).
        *   `VITE_GEMINI_API_KEY`: Nhập khóa API Google Gemini của bạn.

    <img width="1011" alt="Render-Env-Vars" src="https://github.com/user-attachments/assets/94b41982-f673-455b-b9f0-2f643e1d1628">


7.  Sau khi thêm các biến môi trường, nhấp vào **"Manual Deploy" > "Deploy latest commit"** ở góc trên cùng bên phải để bắt đầu quá trình triển khai.

---

## 3. Troubleshooting (Xử lý sự cố)

#### Lỗi: "Lỗi mạng hoặc server không phản hồi" trên website

Lỗi này xảy ra khi frontend không thể kết nối với backend. Đây là cách khắc phục:

**Nếu chạy ở máy local:**
1.  **Backend server có đang chạy không?** Đảm bảo bạn có một cửa sổ terminal đang mở trong thư mục `backend` và đã chạy lệnh `npm start`.
2.  **Backend đã kết nối database thành công chưa?** Kiểm tra terminal của backend. Nếu bạn thấy lỗi `❌ LỖI KẾT NỐI DATABASE`, điều đó có nghĩa là thông tin trong file `backend/.env` của bạn không chính xác hoặc server MySQL local của bạn chưa chạy. Hãy kiểm tra lại **Bước 1 và 2** của phần cài đặt local.

**Nếu đã triển khai trên Render:**
1.  **Kiểm tra Logs của Backend Service.** Truy cập Render Dashboard, tìm service có tên `it-service-backend` (hoặc tên tương tự) và nhấp vào tab "Logs".
2.  Tìm lỗi `❌ LỖI KẾT NỐI DATABASE` ở phần đầu của logs. Nếu bạn thấy lỗi này, có nghĩa là các **Biến Môi trường (Environment Variables) trên Render của bạn đã bị cài đặt sai hoặc thiếu.**
3.  **CÁCH SỬA:** Quay lại phần "Environment" của Blueprint trên Render. **Xác minh lại rằng bạn đã thêm ĐẦY ĐỦ và CHÍNH XÁC** tất cả các biến `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. Giá trị phải khớp hoàn toàn với thông tin database từ nhà cung cấp của bạn (ví dụ: Hostinger).
4.  Sau khi cập nhật biến môi trường, hãy triển khai lại bằng cách nhấp vào "Manual Deploy" > "Deploy latest commit".

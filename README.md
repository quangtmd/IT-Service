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
    The server will start on `http://localhost:3001`. **Keep this terminal window open.** If it connects to the database successfully, you will see a confirmation message.

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

**⚠️ LỖI BẠN ĐANG GẶP ("Missing script: start"):** Lỗi này xảy ra vì bạn đang cố gắng triển khai toàn bộ dự án như một "Web Service" duy nhất. Render đang chạy lệnh `npm start` ở thư mục gốc, nơi không có script này. Để khắc phục, bạn **PHẢI** sử dụng phương pháp **"Blueprint"** bên dưới để Render có thể tự động tạo 2 dịch vụ riêng biệt cho frontend và backend.

### Hướng Dẫn Triển Khai Chi Tiết:

1.  **Fork repository này** về tài khoản GitHub của bạn.

2.  Vào trang [**Blueprints** trên Render Dashboard](https://dashboard.render.com/blueprints).

3.  Nhấp vào nút **"New Blueprint Instance"**.

    <img width="1011" alt="Render-New-Blueprint" src="https://github.com/user-attachments/assets/81c4e7fa-9b93-4e4f-b648-5254d3cd2c05">

4.  **Kết nối tài khoản GitHub của bạn** và chọn repository `IT-Service` bạn vừa fork. Render sẽ tự động phát hiện và đọc tệp `render.yaml`.

5.  **Đặt tên cho nhóm dịch vụ của bạn** (ví dụ: `it-service-app`) và nhấp vào **"Update Existing Resources"** hoặc **"Apply"**.

    <img width="1011" alt="Render-Apply-Blueprint" src="https://github.com/user-attachments/assets/d16715f2-9594-4d1a-be29-d655f41441a1">

6.  **Cấu hình Biến Môi trường:** Render sẽ yêu cầu bạn nhập các khóa bí mật.
    *   Đi đến tab **"Environment"** của Blueprint.
    *   Tạo một **"Environment Group"** mới hoặc thêm các biến trực tiếp.
    *   Thêm các khóa sau với giá trị tương ứng:
        *   `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Nhập thông tin kết nối đến cơ sở dữ liệu **REMOTE** của bạn (ví dụ: từ Hostinger, Aiven, v.v.).
        *   `VITE_GEMINI_API_KEY`: Nhập khóa API Google Gemini của bạn.

    <img width="1011" alt="Render-Env-Vars" src="https://github.com/user-attachments/assets/94b41982-f673-455b-b9f0-2f643e1d1628">


7.  Sau khi thêm các biến môi trường, nhấp vào **"Manual Deploy" > "Deploy latest commit"** ở góc trên cùng bên phải để bắt đầu quá trình triển khai.

Render sẽ tạo hai dịch vụ (`it-service-backend` và `it-service-frontend`), xây dựng và triển khai chúng. Frontend sẽ được tự động cấu hình để giao tiếp với backend. Quá trình này sẽ giải quyết hoàn toàn lỗi bạn đang gặp phải.
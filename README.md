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
        parent_category_id INT NULL
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
        is_featured BOOLEAN DEFAULT FALSE,
        seoMetaTitle VARCHAR(255),
        seoMetaDescription TEXT,
        slug VARCHAR(255) UNIQUE,
        FOREIGN KEY (category_id) REFERENCES ProductCategories(id)
    );

    CREATE TABLE Orders (
        id VARCHAR(255) PRIMARY KEY,
        customerInfo JSON NOT NULL,
        items JSON NOT NULL,
        totalAmount DECIMAL(12, 0) NOT NULL,
        orderDate DATETIME NOT NULL,
        status VARCHAR(50) NOT NULL,
        shippingInfo JSON,
        paymentInfo JSON NOT NULL
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

    CREATE TABLE ChatLogSessions (
        id VARCHAR(255) PRIMARY KEY,
        userName VARCHAR(255) NOT NULL,
        userPhone VARCHAR(255) NOT NULL,
        startTime DATETIME NOT NULL,
        messages JSON
    );

    CREATE TABLE FinancialTransactions (
        id VARCHAR(255) PRIMARY KEY,
        date DATE NOT NULL,
        amount DECIMAL(12, 0) NOT NULL,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(255) NOT NULL,
        description TEXT,
        relatedEntity VARCHAR(255),
        invoiceNumber VARCHAR(255)
    );

    CREATE TABLE PayrollRecords (
        id VARCHAR(255) PRIMARY KEY,
        employeeId VARCHAR(255) NOT NULL,
        employeeName VARCHAR(255) NOT NULL,
        payPeriod VARCHAR(7) NOT NULL,
        baseSalary DECIMAL(12, 0) DEFAULT 0,
        bonus DECIMAL(12, 0) DEFAULT 0,
        deduction DECIMAL(12, 0) DEFAULT 0,
        finalSalary DECIMAL(12, 0) NOT NULL,
        notes TEXT,
        status VARCHAR(50) NOT NULL
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

## 2. Deploy to Render (Manual Method)

This manual method is more reliable than using a Blueprint. We will create two separate services: a **Web Service** for the backend and a **Static Site** for the frontend.

### Step 1: Database Setup on Remote Server

1.  **Create a remote MySQL database** on a cloud provider (e.g., Hostinger, Aiven, PlanetScale).
2.  **IMPORTANT:** Access your remote database management tool (like phpMyAdmin) and **run the SQL commands** from the **"Run Locally > Step 1: Database Setup"** section above. This creates the required tables.
3.  Keep your remote database credentials (Host, User, Password, Database Name) ready.

---

### Step 2: Deploy the Backend (Web Service)

1.  Go to your [Render Dashboard](https://dashboard.render.com/) and click **"New +"** > **"Web Service"**.
2.  Connect your GitHub account and select your `IT-Service` repository.
3.  Configure the service:
    -   **Name:** `it-service-backend` (use this exact name for consistency)
    -   **Root Directory:** `backend`
    -   **Runtime:** `Node`
    -   **Build Command:** `npm install`
    -   **Start Command:** `npm start`
    -   **Plan:** `Free` (or a paid plan if needed)
4.  Scroll to **"Advanced"** and go to the **"Environment"** tab.
5.  Add the following **Environment Variables** using your remote database credentials:
    -   `DB_HOST`
    -   `DB_USER`
    -   `DB_PASSWORD`
    -   `DB_NAME`
6.  Click **"Create Web Service"**.
7.  Once deployed, **copy the URL** of your backend service (e.g., `https://it-service-backend-xxxx.onrender.com`).

---

### Step 3: Deploy the Frontend (Static Site)

1.  Go back to the [Render Dashboard](https://dashboard.render.com/) and click **"New +"** > **"Static Site"**.
2.  Select the same GitHub repository.
3.  Configure the service:
    -   **Name:** `it-service-frontend`
    -   **Root Directory:** (leave blank)
    -   **Build Command:** `npm install && npm run build`
    -   **Publish Directory:** `dist`
4.  Go to **"Advanced"** > **"Environment"**.
5.  Add the following **Environment Variables**:
    -   **Key:** `VITE_GEMINI_API_KEY`, **Value:** (Your Google Gemini API Key)
    -   **Key:** `VITE_BACKEND_API_BASE_URL`, **Value:** **Paste the backend URL you copied.**
6.  Click **"Create Static Site"**.

---

### Step 4: Access Your Application

**QUAN TRỌNG:** Sau khi triển khai xong, bạn sẽ có hai (2) URL: một cho backend và một cho frontend.

-   URL của `it-service-backend`: (ví dụ: `https://it-service-backend-xxxx.onrender.com`) - Đây chỉ là API. Truy cập vào đây sẽ chỉ thấy một trang chào mừng.
-   URL của `it-service-frontend`: (ví dụ: `https://it-service-frontend.onrender.com`) - **ĐÂY LÀ URL CỦA TRANG WEB CỦA BẠN.**

**Bạn phải sử dụng URL của frontend để xem và sử dụng ứng dụng của mình.**

---

## 3. Troubleshooting (Xử lý sự cố)

### Lỗi: "Lỗi Kết Nối Đến Máy Chủ (Backend)" trên website

This is the most common deployment error. It means the backend service on Render is crashing, usually because it cannot connect to your remote database.

1.  **Go to your Render Dashboard**, find the `it-service-backend` service, and click on the **"Logs"** tab.
2.  Look for a detailed error message in red. The backend is now programmed to tell you the **exact reason** for the failure.

#### If the log says `ETIMEDOUT`, `ENOTFOUND`, or mentions IP addresses:

This is an **IP Whitelisting problem**. Your database provider (Hostinger) is blocking Render.
<br/>
<img width="900" alt="Hostinger Remote MySQL" src="https://github.com/user-attachments/assets/70ff379d-d6a0-4bd4-a3f2-8959fc9332e1" />

**How to Fix:**
1.  On Render, go to your `it-service-backend` service and click the **"Networking"** tab.
2.  Find and copy the **"Static Outbound IP Address"**.
3.  Log in to your **Hostinger hPanel**.
4.  Go to **Databases** -> **Remote MySQL**.
5.  Under **"Host"**, paste the Render IP address you copied.
6.  Under **"Database"**, select the database you are using.
7.  Click **"Create"**.
8.  Go back to your `it-service-backend` service on Render and click **"Manual Deploy"** -> **"Deploy latest commit"**.

#### If the log says `ER_ACCESS_DENIED_ERROR`:

Your `DB_USER` or `DB_PASSWORD` is wrong.
**How to Fix:** Go to the **"Environment"** tab of your `it-service-backend` service on Render and carefully re-enter your database username and password.

#### If the log says `ER_BAD_DB_ERROR`:

Your `DB_NAME` is wrong.
**How to Fix:** Go to the **"Environment"** tab of your `it-service-backend` service on Render and correct the database name.

#### If the log says `ER_NO_SUCH_TABLE`:

The backend connected successfully, but you forgot to create the tables.
**How to Fix:** Go to your remote database (e.g., via phpMyAdmin) and run the SQL commands from **Step 1 of the "Run Locally" guide**.
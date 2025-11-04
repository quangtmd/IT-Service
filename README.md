<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1NczgJ-ti9VqQ8LwMkqhxBrhnvi-qRD0E

## Run Locally

This project consists of two main parts: a **Frontend** (React app) and a **Backend** (Node.js API server). You'll need to run both simultaneously for the application to work correctly.

**Prerequisites:**
- Node.js
- A running MySQL database instance. The required `CREATE TABLE` statements are included in `backend/server.js`.

### 1. Backend Setup

The backend server connects to your MySQL database and provides APIs for the frontend.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Database (Optional):**
    The database credentials are pre-configured in `backend/server.js` with fallback values. If you need to use different credentials (e.g., for your local database), you can set the following environment variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

4.  **Start the backend server:**
    ```bash
    npm start
    ```
    The server will start, usually on `http://localhost:3001`.

### 2. Frontend Setup

In a **new terminal window**, set up and run the React frontend.

1.  **Navigate to the project root directory** (if you are in the `backend` directory, run `cd ..`).

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```
3.  **Set your Environment Variables:**
    Create a file named `.env.local` in the project root and add your Gemini API key and the backend URL:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    VITE_BACKEND_API_BASE_URL=http://localhost:3001
    ```
4.  **Run the frontend app:**
    ```bash
    npm run dev
    ```
The application will be accessible in your browser, usually at `http://localhost:3000`.

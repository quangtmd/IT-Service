<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it to the web.

View your app in AI Studio: https://ai.studio/apps/drive/1NczgJ-ti9VqQ8LwMkqhxBrhnvi-qRD0E

## 1. Run Locally

This project consists of two main parts: a **Frontend** (React app) and a **Backend** (Node.js API server). You'll need to run both simultaneously for the application to work correctly.

**Prerequisites:**
- Node.js
- A running MySQL database instance. The required `CREATE TABLE` statements are included in `backend/server.js`.

### Backend Setup

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
    The database credentials are pre-configured in `backend/server.js`. To use different credentials, you can set the following environment variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

4.  **Start the backend server:**
    ```bash
    npm start
    ```
    The server will start, usually on `http://localhost:3001`.

### Frontend Setup

In a **new terminal window**, set up and run the React frontend.

1.  **Navigate to the project root directory** (if you are in the `backend` directory, run `cd ..`).

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```
3.  **Set your Environment Variables:**
    Create a file named `.env` in the project root and add your Gemini API key and the backend URL using the `VITE_` prefix:
    ```
    VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
    VITE_BACKEND_API_BASE_URL=http://localhost:3001
    ```
4.  **Run the frontend app:**
    ```bash
    npm run dev
    ```
The application will be accessible in your browser, usually at `http://localhost:3000`.

---

## 2. Deploy to Render (Recommended)

This project includes a `render.yaml` blueprint file, which allows you to deploy both the frontend and backend services with a single click, preventing common configuration errors.

1.  **Fork this repository** to your own GitHub account.
2.  Go to the [**Render Blueprint Dashboard**](https://dashboard.render.com/blueprints) and click **New Blueprint Instance**.
3.  Connect the repository you just forked. Render will automatically detect the `render.yaml` file.
4.  Render will prompt you to provide values for the secret environment variables (`DB_HOST`, `DB_USER`, etc., and `VITE_GEMINI_API_KEY`). Enter your credentials for your deployed MySQL database and your Gemini API key.
5.  Click **Apply**. Render will build and deploy both the frontend and backend, automatically linking them together.
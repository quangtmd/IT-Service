document.addEventListener('DOMContentLoaded', () => {
    const onLoginPage = document.getElementById('login-form');
    const onDashboardPage = document.querySelector('.dashboard-container');

    // Check if user is logged in
    if (sessionStorage.getItem('isAdminAuthenticated') !== 'true') {
        // If on a page other than login, and not authenticated, redirect to login
        if (!onLoginPage) {
            window.location.href = 'login.html';
            return; // Stop further execution
        }
    } else {
        // If authenticated and on login page, redirect to dashboard
        if (onLoginPage) {
            window.location.href = 'dashboard.html';
            return; // Stop further execution
        }
    }

    // Event Listeners
    if (onLoginPage) {
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', handleLogin);
    }

    if (onDashboardPage) {
        const logoutButton = document.getElementById('logout-button');
        logoutButton.addEventListener('click', handleLogout);
        // We will call functions to fetch data here later
        // fetchOrders();
        // fetchChatLogs();
    }
});

function handleLogin(event) {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;
    const errorMessage = document.getElementById('error-message');

    // --- IMPORTANT: Hardcoded credentials for now ---
    // In a real application, this should be a call to a secure backend endpoint.
    if (username === 'admin' && password === 'admin123') { 
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        window.location.href = 'dashboard.html';
    } else {
        errorMessage.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng.';
        errorMessage.style.display = 'block';
    }
}

function handleLogout() {
    sessionStorage.removeItem('isAdminAuthenticated');
    window.location.href = 'login.html';
}

// Placeholder functions for fetching data
// We will implement these in the next steps.
function fetchOrders() {
    console.log('Fetching orders...');
    // Logic to fetch from backend API endpoint for orders
}

function fetchChatLogs() {
    console.log('Fetching chat logs...');
    // Logic to fetch from backend API endpoint for chat logs
}

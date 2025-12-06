import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ChatbotProvider } from './contexts/ChatbotContext'; // Import the new provider
import ErrorBoundary from './ErrorBoundary'; // Import the ErrorBoundary

function renderApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Fatal Error: Could not find root element to mount to. Ensure a div with id='root' exists in your HTML.");
    // Optionally, display a message to the user on the page itself
    document.body.innerHTML = '<div style="padding: 20px; text-align: center; font-family: sans-serif; color: red;"><h1>Application Error</h1><p>Could not find the main application container. Please check the console for more details.</p></div>';
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary fallbackMessage="Ứng dụng gặp sự cố. Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ.">
        <AuthProvider>
          <CartProvider>
            <ChatbotProvider>
              <App />
            </ChatbotProvider>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  // DOMContentLoaded has already fired
  renderApp();
}
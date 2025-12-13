
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { CartProvider } from './contexts/CartContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ChatbotProvider } from './contexts/ChatbotContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import ErrorBoundary from './ErrorBoundary.tsx';
import './index.css';

function renderApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Fatal Error: Could not find root element to mount to.");
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary fallbackMessage="Ứng dụng gặp sự cố. Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ.">
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <CartProvider>
                <ChatbotProvider>
                  <App />
                </ChatbotProvider>
              </CartProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// Fix: Add a triple-slash directive to include Vite client types. This resolves the error 'Property 'env' does not exist on type 'ImportMeta'' by making TypeScript aware of Vite's environment variables.
/// <reference types="vite/client" />
import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Constants from './constants'; 

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error("ErrorBoundary caught an error (getDerivedStateFromError):", error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error (componentDidCatch):", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      console.log("ErrorBoundary rendering fallback UI. Error:", this.state.error?.message);
      
      let displayMessage = this.props.fallbackMessage || "Có lỗi xảy ra với ứng dụng.";
      const errorName = this.state.error?.name || "UnknownError";
      const errorMessage = this.state.error?.message || "No error message available";

      if (errorMessage.includes(Constants.API_KEY_ERROR_MESSAGE.split(' (')[0])) {
          displayMessage = Constants.API_KEY_ERROR_MESSAGE + " Hãy kiểm tra cấu hình môi trường của bạn hoặc liên hệ quản trị viên.";
      } else if (errorMessage.toLowerCase().includes('process is not defined')) {
          displayMessage = "Lỗi cấu hình môi trường: Biến 'process' không được định nghĩa. Điều này thường xảy ra khi API Key hoặc các biến môi trường khác không được thiết lập đúng cách cho ứng dụng phía client. " + Constants.API_KEY_ERROR_MESSAGE;
      }

      // Extremely simplified fallback UI
      return (
        <div style={{
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#FFD2D2', // Light red
          color: '#D8000C', // Dark red
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          fontFamily: 'Arial, sans-serif',
          zIndex: 999999
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '15px' }}>Application Error!</h1>
          <p style={{ fontSize: '16px', lineHeight: '1.6', textAlign: 'center', maxWidth: '600px' }}>
            {displayMessage}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
                marginTop: '20px',
                padding: '10px 20px',
                fontSize: '16px',
                color: 'white',
                backgroundColor: '#D8000C',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
          {/* Fix: Use Vite's `import.meta.env.DEV` which is a build-time constant
              and avoids runtime ReferenceError for 'process'. */}
          {(import.meta.env.DEV || window.location.hostname === 'localhost') && this.state.error && (
            <div style={{ marginTop: '20px', textAlign: 'left', background: '#f0f0f0', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', maxWidth: '80%', maxHeight: '30vh', overflow: 'auto' }}>
              <p style={{ fontWeight: 'bold', color: '#333', margin: '0 0 5px 0' }}>Error Details (Dev):</p>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#333', fontSize: '12px', margin: 0 }}>
                {`${errorName}: ${errorMessage}\n\nStack:\n${this.state.error.stack}`}
                {this.state.errorInfo && `\n\nComponent Stack:\n${this.state.errorInfo.componentStack}`}
              </pre>
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
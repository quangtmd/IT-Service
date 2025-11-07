import React, { ErrorInfo, ReactNode } from 'react';
import * as Constants from './constants';

interface Props extends React.PropsWithChildren { // Fix: Added extends React.PropsWithChildren
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<Props, State> {
  // Fix: Moved state initialization to constructor to resolve TypeScript errors related to `this.props`.
  // This ensures `props` are properly handled by React's constructor chain before state is set.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    // We only store the safe, serializable message string.
    const safeErrorMessage = `${error.name}: ${error.message}`;
    return { hasError: true, errorMessage: safeErrorMessage };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo.componentStack);
  }

  render() {
    // Fix: Access props and state directly from 'this' to resolve TypeScript errors.
    if (this.state.hasError) {
      const displayMessage = this.state.errorMessage || this.props.fallbackMessage || "Có lỗi xảy ra với ứng dụng.";

      return (
        <div style={{
          position: 'fixed', top: '1rem', left: '1rem', right: '1rem', 
          backgroundColor: '#fee2e2', color: '#b91c1c', 
          padding: '1rem', borderRadius: '0.5rem',
          border: '1px solid #fca5a5',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <i className="fas fa-exclamation-triangle text-2xl"></i>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Lỗi Ứng Dụng</h1>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.5', margin: '0.25rem 0 0 0' }}>
              {displayMessage}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
                marginLeft: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#b91c1c',
                backgroundColor: 'transparent', border: '1px solid #fca5a5', borderRadius: '0.375rem', cursor: 'pointer'
            }}
          >
            Tải lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
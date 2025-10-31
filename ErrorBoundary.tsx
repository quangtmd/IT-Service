import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Switched from constructor to class property for state initialization.
  // This is a more modern syntax that can resolve linter confusion about 'this' context,
  // which was causing errors on `this.state` and `this.props`.
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    const safeErrorMessage = `${error.name}: ${error.message}`;
    return { hasError: true, errorMessage: safeErrorMessage };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo.componentStack);
  }

  public render() {
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

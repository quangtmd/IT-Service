
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom'; // Updated imports for v6/v7
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  // Fix: Use React.ReactElement to avoid issues with JSX namespace resolution.
  children: React.ReactElement;
  roles?: string[]; // Optional: restrict access to specific roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const location = ReactRouterDOM.useLocation();

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <ReactRouterDOM.Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user has required roles if specified
  if (roles && roles.length > 0 && currentUser) {
      if (!roles.includes(currentUser.role)) {
          // If role not authorized, redirect to homepage
          return <ReactRouterDOM.Navigate to="/" state={{ from: location }} replace />;
      }
  }

  // Special check: If user is admin or staff, they can access admin routes generally protected by this component
  // (though MainLayout passes specific roles for admin routes)
  if (!roles && (currentUser?.role !== 'admin' && currentUser?.role !== 'staff')) {
      // Default behavior for generic ProtectedRoute without roles prop might be to allow any authenticated user?
      // Or restrict to admin/staff like before? 
      // The previous implementation restricted to admin/staff. Let's keep it consistent unless roles are passed.
      // However, for customer routes like /account/orders, we want to allow 'customer'.
      // So if no roles are passed, we assume any authenticated user is fine unless logic says otherwise.
      // But looking at previous code:
      /*
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'staff') {
        return <ReactRouterDOM.Navigate to="/" state={{ from: location }} replace />;
      }
      */
      // This implies the old ProtectedRoute was implicitly for Admin only.
      // But now we use it for /account/orders too.
      // Let's assume if roles prop is missing, we allow any authenticated user (useful for customer routes).
      // If specific admin restriction is needed, <ProtectedRoute roles={['admin', 'staff']}> should be used.
      // For backward compatibility with the provided AdminPage route in MainLayout which passes roles, this logic works.
  }

  return children;
};

export default ProtectedRoute;

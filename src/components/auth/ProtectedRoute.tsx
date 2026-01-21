
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom'; // Updated imports for v6/v7
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  roles?: UserRole[];
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

  // Check role if roles are provided
  if (roles && currentUser && !roles.includes(currentUser.role)) {
      return <ReactRouterDOM.Navigate to="/" replace />;
  }

  // Check if the user has admin or staff role for accessing admin routes
  // This component is now used within an <AdminPage /> route, so this check ensures only authorized roles see the content.
  if (location.pathname.startsWith('/admin') && currentUser?.role !== 'admin' && currentUser?.role !== 'staff') {
    // If not admin or staff, redirect to a "not authorized" page or homepage
    return <ReactRouterDOM.Navigate to="/" state={{ from: location }} replace />;
  }

  return children; // If authenticated and authorized, render the children (AdminPage)
};

export default ProtectedRoute;
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom'; // Updated imports for v6/v7
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  // Fix: Use React.ReactElement to avoid issues with JSX namespace resolution.
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const location = useLocation();

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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user has admin or staff role for accessing admin routes
  // This component is now used within an <AdminPage /> route, so this check ensures only authorized roles see the content.
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'staff') {
    // If not admin or staff, redirect to a "not authorized" page or homepage
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children; // If authenticated and authorized, render the children (AdminPage)
};

export default ProtectedRoute;
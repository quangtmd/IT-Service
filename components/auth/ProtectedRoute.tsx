import React from 'react';
// Fix: Use named imports for react-router-dom hooks and components
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  // Fix: Use React.ReactElement to avoid issues with JSX namespace resolution.
  children: React.ReactElement;
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  // Fix: Use useLocation directly
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
    // Fix: Use Navigate directly
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if the user has one of the required roles.
  if (roles && currentUser && !roles.includes(currentUser.role)) {
    // If user does not have the required role, redirect to homepage or a 'not authorized' page.
    // Fix: Use Navigate directly
    return <Navigate to="/" state={{ from: location }} replace />;
  }


  return children; // If authenticated and authorized, render the children
};

export default ProtectedRoute;
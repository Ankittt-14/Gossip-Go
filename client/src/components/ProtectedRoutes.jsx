import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.userReducer);

  // Don't show loading spinner - just check auth
  if (loading && !isAuthenticated) { // simplified check, or just loading
    return <div>Loading...</div>; // Or a proper spinner component
  }

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;
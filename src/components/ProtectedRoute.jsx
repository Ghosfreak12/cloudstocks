/**
 * CloudStocks: A Real-Time Stock Market Dashboard on AWS
 * Author: Rishal Khatri
 *
 * Protected Route Component
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading indicator while checking authentication status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-blue-600 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-700 rounded mb-3"></div>
          <div className="h-3 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 
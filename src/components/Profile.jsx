/**
 * CloudStocks: A Real-Time Stock Market Dashboard on AWS
 * Author: Rishal Khatri
 *
 * User Profile Component
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const result = await logout();
      if (result.success) {
        navigate('/login');
      } else {
        console.error('Failed to log out:', result.error);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-blue-600 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-700 rounded mb-3"></div>
          <div className="h-3 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Not Signed In</h2>
          <p className="text-gray-300 mb-6">Please sign in to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-800 rounded-lg shadow-md">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold mb-6">
          {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-1">{user.name || user.username}</h2>
        <p className="text-gray-400 mb-6">@{user.username}</p>
        
        <div className="w-full max-w-md space-y-4 mb-8">
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-sm uppercase text-gray-400 mb-1">Email</h3>
            <p className="text-white font-medium">{user.email || 'Not provided'}</p>
          </div>
          
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-sm uppercase text-gray-400 mb-1">Account Type</h3>
            <p className="text-white font-medium">Standard User</p>
          </div>
          
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-sm uppercase text-gray-400 mb-1">Member Since</h3>
            <p className="text-white font-medium">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
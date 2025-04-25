/**
 * CloudStocks: A Real-Time Stock Market Dashboard on AWS
 * Author: Rishal Khatri
 *
 * Authentication Context Provider for Amazon Cognito
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, isAuthenticated, signIn, signOut } from '../services/auth-service';

// Create the authentication context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the authenticated user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if user is authenticated
        const isAuth = await isAuthenticated();
        
        if (isAuth) {
          // Get the current authenticated user
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Failed to load user information');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Handle user login
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn(username, password);
      
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Handle user logout
  const logout = async () => {
    setLoading(true);
    
    try {
      await signOut();
      setUser(null);
      return { success: true };
    } catch (err) {
      setError('Logout failed');
      return { success: false, error: 'Logout failed' };
    } finally {
      setLoading(false);
    }
  };

  // Value provided by the context
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
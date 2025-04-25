/**
 * CloudStocks: A Real-Time Stock Market Dashboard on AWS
 * Author: Rishal Khatri
 *
 * Authentication Service using Amazon Cognito
 */

import { Amplify, Auth } from 'aws-amplify';

// Cognito configuration
// IMPORTANT: Replace these values with your actual Cognito User Pool details
// - User Pool ID: Find in Cognito Console -> User Pools -> [Your Pool] -> User pool overview
// - App Client ID: Find in Cognito Console -> User Pools -> [Your Pool] -> App integration -> App clients and analytics
const COGNITO_CONFIG = {
  region: 'us-east-1', // Update this to your Cognito region if different
  userPoolId: 'us-east-1_AP1byd3lv', // Using the first User Pool ID from screenshot
  userPoolWebClientId: '59mjp1re7nch4l7ulttr9471n8', // The App Client ID
  authenticationFlowType: 'USER_PASSWORD_AUTH'
};

// Initialize Amplify Auth
Amplify.configure({
  Auth: {
    ...COGNITO_CONFIG,
    mandatorySignIn: true,
  }
});

/**
 * Sign in with username and password
 * @param {string} username - The username (email)
 * @param {string} password - The password
 * @returns {Promise<Object>} - User data or error
 */
export const signIn = async (username, password) => {
  try {
    const user = await Auth.signIn(username, password);
    return {
      success: true,
      user: {
        username: user.username,
        email: user.attributes?.email,
        name: user.attributes?.name
      }
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign in'
    };
  }
};

/**
 * Sign up a new user
 * @param {string} username - The username (email)
 * @param {string} password - The password
 * @param {string} email - The email address
 * @param {string} name - The user's full name
 * @returns {Promise<Object>} - Success status or error
 */
export const signUp = async (username, password, email, name) => {
  try {
    const { user } = await Auth.signUp({
      username,
      password,
      attributes: {
        email,
        name
      }
    });
    
    return {
      success: true,
      username: user.username
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign up'
    };
  }
};

/**
 * Confirm sign up with verification code
 * @param {string} username - The username (email)
 * @param {string} code - The verification code
 * @returns {Promise<Object>} - Success status or error
 */
export const confirmSignUp = async (username, code) => {
  try {
    await Auth.confirmSignUp(username, code);
    return {
      success: true
    };
  } catch (error) {
    console.error('Error confirming sign up:', error);
    return {
      success: false,
      error: error.message || 'Failed to confirm sign up'
    };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<Object>} - Success status or error
 */
export const signOut = async () => {
  try {
    await Auth.signOut();
    return {
      success: true
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign out'
    };
  }
};

/**
 * Get the current authenticated user
 * @returns {Promise<Object>} - User data or null
 */
export const getCurrentUser = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return {
      username: user.username,
      email: user.attributes?.email,
      name: user.attributes?.name
    };
  } catch (error) {
    console.log('No authenticated user found');
    return null;
  }
};

/**
 * Check if a user is authenticated
 * @returns {Promise<boolean>} - True if authenticated, false otherwise
 */
export const isAuthenticated = async () => {
  try {
    await Auth.currentAuthenticatedUser();
    return true;
  } catch {
    return false;
  }
};

/**
 * Request a password reset for a user
 * @param {string} username - The username (email)
 * @returns {Promise<Object>} - Success status or error
 */
export const forgotPassword = async (username) => {
  try {
    await Auth.forgotPassword(username);
    return {
      success: true
    };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return {
      success: false,
      error: error.message || 'Failed to request password reset'
    };
  }
};

/**
 * Complete the password reset process with verification code
 * @param {string} username - The username (email)
 * @param {string} code - The verification code
 * @param {string} newPassword - The new password
 * @returns {Promise<Object>} - Success status or error
 */
export const forgotPasswordSubmit = async (username, code, newPassword) => {
  try {
    await Auth.forgotPasswordSubmit(username, code, newPassword);
    return {
      success: true
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      error: error.message || 'Failed to reset password'
    };
  }
}; 
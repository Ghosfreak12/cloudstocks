/**
 * API Security Layer - Secure Data Access
 * 
 * This layer provides a clear separation between data fetching and business logic,
 * enhancing security by isolating direct API calls from the rest of the application.
 */

import { fetchStockData as fetchStockServiceData, searchStockSymbols as searchStockServiceSymbols } from './stock-service';

/**
 * Secure stock data fetching
 */
export const fetchStockData = async (symbol, range) => {
  // Validate parameters at the API layer
  if (!symbol || !symbol.trim()) {
    return { 
      noData: true, 
      error: 'Symbol parameter is required' 
    };
  }
  
  try {
    // Call the underlying service
    return await fetchStockServiceData(symbol, range);
  } catch (error) {
    console.error('Security layer error in fetchStockData:', error);
    return { 
      noData: true, 
      error: 'Failed to fetch stock data. Please try again later.' 
    };
  }
};

/**
 * Secure stock symbol search
 */
export const searchStockSymbols = async (keyword) => {
  // Early return for invalid queries
  if (!keyword || keyword.trim().length < 2) {
    return [];
  }
  
  try {
    // Call the underlying service
    return await searchStockServiceSymbols(keyword);
  } catch (error) {
    console.error('Security layer error in searchStockSymbols:', error);
    return [];
  }
}; 
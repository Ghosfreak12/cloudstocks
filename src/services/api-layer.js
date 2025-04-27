/**
 * API Layer - Secure Data Access Layer
 * 
 * Implements [SEC 5] Create network layers
 * This layer provides a clear separation between data fetching and business logic,
 * enhancing security by isolating direct API calls from the rest of the application.
 */

import { fetchStockData as fetchStockServiceData, searchStockSymbols as searchStockServiceSymbols } from './stock-service';

// API request tracking for throttling
const apiRequestTracker = {
  requests: {},
  maxRequestsPerMinute: 5, // Alpha Vantage free tier limit
  resetInterval: 60000, // 1 minute in milliseconds
  
  // Track a request for a specific endpoint
  trackRequest(endpoint) {
    const now = Date.now();
    
    // Initialize tracking for this endpoint if it doesn't exist
    if (!this.requests[endpoint]) {
      this.requests[endpoint] = [];
    }
    
    // Clean up old requests (older than the reset interval)
    this.requests[endpoint] = this.requests[endpoint].filter(
      timestamp => now - timestamp < this.resetInterval
    );
    
    // Add the current request
    this.requests[endpoint].push(now);
  },
  
  // Check if a request should be throttled
  shouldThrottle(endpoint) {
    // Initialize if needed
    if (!this.requests[endpoint]) {
      this.requests[endpoint] = [];
    }
    
    // Clean up old requests
    const now = Date.now();
    this.requests[endpoint] = this.requests[endpoint].filter(
      timestamp => now - timestamp < this.resetInterval
    );
    
    // Check if we've hit the limit
    return this.requests[endpoint].length >= this.maxRequestsPerMinute;
  }
};

/**
 * Secure stock data fetching with throttling
 * Implements [COST 9] Implement a throttle to manage demand
 */
export const fetchStockData = async (symbol, range) => {
  // Validate parameters at the API layer
  if (!symbol || !symbol.trim()) {
    return { 
      noData: true, 
      error: 'Symbol parameter is required' 
    };
  }
  
  // Check if we should throttle this request
  const endpoint = `fetchStockData:${symbol}`;
  if (apiRequestTracker.shouldThrottle(endpoint)) {
    console.warn(`Throttling request for ${symbol} - too many requests in the last minute`);
    return { 
      noData: true, 
      error: 'API rate limit reached. Please try again later.' 
    };
  }
  
  // Track this request
  apiRequestTracker.trackRequest(endpoint);
  
  try {
    // Call the underlying service
    return await fetchStockServiceData(symbol, range);
  } catch (error) {
    console.error('API layer error in fetchStockData:', error);
    return { 
      noData: true, 
      error: 'Failed to fetch stock data. Please try again later.' 
    };
  }
};

/**
 * Secure stock symbol search with throttling
 * Implements [COST 9] Implement a throttle to manage demand
 */
export const searchStockSymbols = async (keyword) => {
  // Early return for invalid queries
  if (!keyword || keyword.trim().length < 2) {
    return [];
  }
  
  // Check if we should throttle this request
  const endpoint = 'searchStockSymbols';
  if (apiRequestTracker.shouldThrottle(endpoint)) {
    console.warn(`Throttling search request - too many requests in the last minute`);
    // Return empty results rather than error for a better UX
    return [];
  }
  
  // Track this request
  apiRequestTracker.trackRequest(endpoint);
  
  try {
    // Call the underlying service
    return await searchStockServiceSymbols(keyword);
  } catch (error) {
    console.error('API layer error in searchStockSymbols:', error);
    return [];
  }
}; 
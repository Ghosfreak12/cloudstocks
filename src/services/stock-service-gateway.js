/**
 * Stock Service Gateway - Business Logic Layer
 * 
 * This layer handles the business logic, data transformation, and error handling.
 * It sits between the UI components and the API layer.
 */

import { fetchStockData as fetchApiStockData, searchStockSymbols as searchApiStockSymbols } from './api-security-layer';

/**
 * Prepares stock data for UI consumption
 * - Formats dates and numbers
 * - Handles errors gracefully
 * - Transforms API response into UI-ready format
 */
export const fetchStockData = async (symbol, range) => {
  try {
    console.log(`Gateway: fetching data for ${symbol} with range ${range}`);
    
    // Call the API layer 
    const data = await fetchApiStockData(symbol, range);
    
    // If the API returned an error, pass it along
    if (data.noData || data.error) {
      console.log('Gateway: API layer returned an error:', data.error);
      return data;
    }
    
    // Perform additional data validation and transformation
    if (!data.t || data.t.length === 0) {
      console.log('Gateway: API returned no time data points');
      return { 
        noData: true, 
        error: 'No price data available for this symbol and range' 
      };
    }
    
    // Additional business logic could be added here:
    // - Calculate additional metrics (e.g., moving averages)
    // - Apply business-specific transformations
    // - Handle data caching if needed
    
    // Return the validated and possibly enriched data
    return data;
  } catch (error) {
    console.error('Gateway error in fetchStockData:', error);
    return { 
      noData: true, 
      error: 'Failed to process stock data' 
    };
  }
};

/**
 * Prepares stock symbol search results for UI consumption
 */
export const searchStockSymbols = async (keyword) => {
  try {
    console.log(`Gateway: searching for "${keyword}"`);
    
    // Input validation (additional to what API layer does)
    if (!keyword || keyword.trim().length < 2) {
      return [];
    }
    
    // Call the secure API layer
    const results = await searchApiStockSymbols(keyword);
    
    // Sort the results for better UI experience (most relevant first)
    return results.sort((a, b) => {
      // Exact matches first
      const aExact = a.symbol === keyword.toUpperCase();
      const bExact = b.symbol === keyword.toUpperCase();
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then sort by symbol starting with the keyword
      const aStartsWith = a.symbol.startsWith(keyword.toUpperCase());
      const bStartsWith = b.symbol.startsWith(keyword.toUpperCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Otherwise sort alphabetically
      return a.symbol.localeCompare(b.symbol);
    });
  } catch (error) {
    console.error('Gateway error in searchStockSymbols:', error);
    return [];
  }
}; 
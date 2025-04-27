/**
 * Stock Data Service
 * Works with Alpha Vantage API for real stock data
 */

// Configuration - update these values
const CONFIG = {
  // Alpha Vantage API key and URL
  ALPHA_VANTAGE_API_KEY: 'Y40XKL904QT19YSB', // Replace with your Alpha Vantage API key
  ALPHA_VANTAGE_API_URL: 'https://www.alphavantage.co/query',
  
  // Feature flags
  USE_MOCK_DATA: true // Set to true to use mock data instead of API
};

// Import functions from alpha-vantage-service.js
import * as alphaVantageService from './alpha-vantage-service.js';
// Import dedicated mock data service
import { MOCK_STOCKS, generateMockHistoricalData, searchMockStocks } from './mock-data.js';

// =====================================================
// LOCAL IMPLEMENTATION WITH MOCK DATA
// =====================================================

/**
 * Local implementation of fetchStockData
 */
const fetchStockDataLocal = async (symbol, range) => {
  // Add a small delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    // Handle uppercase/lowercase
    const normalizedSymbol = symbol.toUpperCase();
    console.log(`Fetching local mock data for ${normalizedSymbol} with range ${range}`);
    
    // Generate historical data using our dedicated mock data service
    const result = generateMockHistoricalData(normalizedSymbol, range);
    
    // Check if we got valid mock data
    if (!result) {
      console.error(`Failed to generate mock data for ${normalizedSymbol}`);
      return { 
        noData: true, 
        error: `Stock ${normalizedSymbol} not found or could not generate data` 
      };
    }
    
    console.log(`Successfully generated mock data for ${normalizedSymbol} with ${result.t.length} data points`);
    return result;
  } catch (error) {
    console.error('Error generating mock stock data:', error);
    return { noData: true, error: error.message };
  }
};

/**
 * Local implementation of searchStockSymbols
 */
const searchStockSymbolsLocal = async (keyword) => {
  // Small delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (!keyword || keyword.length < 2) return [];
  
  try {
    console.log(`Searching locally for stocks matching: ${keyword}`);
    
    // Use our dedicated mock search function
    const results = searchMockStocks(keyword);
    console.log(`Found ${results.length} matching stocks for "${keyword}"`);
    
    return results;
  } catch (error) {
    console.error('Error searching stocks locally:', error);
    return [];
  }
};

// =====================================================
// EXPORTED FUNCTIONS
// =====================================================

/**
 * Fetch stock data
 */
export const fetchStockData = async (symbol, range) => {
  // Validate input parameters
  if (!symbol) {
    console.error('Symbol parameter is required');
    return { 
      noData: true, 
      error: 'Symbol parameter is required' 
    };
  }
  
  // Normalize symbol
  const normalizedSymbol = symbol.toUpperCase();
  console.log(`Fetching data for ${normalizedSymbol} with range ${range || 'default'}`);
  
  // Set default range if not provided
  const normalizedRange = range ? range.toUpperCase() : '1M';
  
  // Always use mock data if configured
  if (CONFIG.USE_MOCK_DATA) {
    console.log('Using MOCK stock data mode (by configuration)');
    return fetchStockDataLocal(normalizedSymbol, normalizedRange);
  }
  
  // Try Alpha Vantage API first
  try {
    console.log('Using Alpha Vantage stock data API');
    const alphaVantageData = await alphaVantageService.fetchStockData(normalizedSymbol, normalizedRange);
    
    // If we got valid data, return it
    if (!alphaVantageData.noData && !alphaVantageData.error) {
      return alphaVantageData;
    }
    
    console.warn('Alpha Vantage API failed, falling back to mock data:', alphaVantageData.error);
  } catch (error) {
    console.error('Error with Alpha Vantage API, falling back to mock data:', error);
  }
  
  // Use mock data as final fallback
  console.log('Using MOCK stock data mode (as final fallback)');
  return fetchStockDataLocal(normalizedSymbol, normalizedRange);
};

/**
 * Search for stock symbols
 */
export const searchStockSymbols = async (keyword) => {
  if (!keyword || keyword.length < 2) return [];
  
  try {
    if (CONFIG.USE_MOCK_DATA) {
      return searchStockSymbolsLocal(keyword);
    }
    
    console.log('Using Alpha Vantage stock search API');
    const alphaVantageResults = await alphaVantageService.searchStockSymbols(keyword);
    
    // If the Alpha Vantage API returns valid results, use them
    if (alphaVantageResults && alphaVantageResults.length > 0) {
      return alphaVantageResults;
    }
    
    console.log('Alpha Vantage search returned no results, falling back to mock data');
    
    // Fall back to local search
    console.log('Using MOCK stock search mode (as fallback)');
    return searchStockSymbolsLocal(keyword);
    
  } catch (error) {
    console.error('Error in searchStockSymbols, falling back to mock data:', error);
    
    // Final fallback to local
    console.log('Using MOCK stock search mode (as final fallback)');
    return searchStockSymbolsLocal(keyword);
  }
}; 
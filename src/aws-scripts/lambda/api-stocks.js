// Base API URL for your API Gateway endpoint
const API_BASE_URL = 'https://9lp8pvu206.execute-api.us-east-1.amazonaws.com/prod';

/**
 * Fetch stock data from the API
 * @param {string} symbol - Stock symbol
 * @param {string} range - Time range (1D, 5D, 1M, etc.)
 */
export const fetchStockData = async (symbol, range) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/stock-data?symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(range.toLowerCase())}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return { 
        noData: true, 
        error: errorData.error || 'Failed to fetch stock data' 
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return { 
      noData: true, 
      error: 'Failed to fetch stock data. Please try again.' 
    };
  }
};

/**
 * Search for stock symbols
 * @param {string} keyword - Search term
 */
export const searchStockSymbols = async (keyword) => {
  if (!keyword || keyword.length < 2) return [];
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/search-stocks?keyword=${encodeURIComponent(keyword)}`
    );
    
    if (!response.ok) {
      console.error('Error searching stocks:', response.statusText);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}; 
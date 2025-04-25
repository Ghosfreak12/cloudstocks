/**
 * Alpha Vantage API Service
 * Handles all interactions with the Alpha Vantage API
 */

// Configuration
const ALPHA_VANTAGE_CONFIG = {
  API_KEY: 'Y40XKL904QT19YSB', // Replace with your Alpha Vantage API key
  BASE_URL: 'https://www.alphavantage.co/query',
  SEARCH_URL: 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH'
};

/**
 * Get appropriate time series function and parameters based on range
 * @param {string} range - Time range (1D, 5D, 1M, 1Y, 5Y, etc.)
 * @returns {Object} - Parameters for Alpha Vantage API
 */
function getTimeSeriesParams(range) {
  switch (range) {
    case '1D':
      return { 
        timeFunction: 'TIME_SERIES_INTRADAY', 
        outputSize: 'compact',
        interval: '5min'
      };
    case '5D':
      return { 
        timeFunction: 'TIME_SERIES_INTRADAY', 
        outputSize: 'full',
        interval: '30min'
      };
    case '1M':
      return { 
        timeFunction: 'TIME_SERIES_DAILY',
        outputSize: 'compact',
        interval: null
      };
    case '3M':
    case '6M':
      return { 
        timeFunction: 'TIME_SERIES_DAILY',
        outputSize: 'full',
        interval: null
      };
    case '1Y':
    case '2Y':
      return { 
        timeFunction: 'TIME_SERIES_WEEKLY',
        outputSize: 'full',
        interval: null
      };
    case '5Y':
    default:
      return { 
        timeFunction: 'TIME_SERIES_MONTHLY',
        outputSize: 'full',
        interval: null
      };
  }
}

/**
 * Get the appropriate time series key from the Alpha Vantage response
 * @param {string} timeFunction - The time series function used
 * @param {string|null} interval - The interval for intraday data
 * @returns {string} - The key to access time series data in the API response
 */
function getTimeSeriesKey(timeFunction, interval) {
  switch (timeFunction) {
    case 'TIME_SERIES_INTRADAY':
      return `Time Series (${interval})`;
    case 'TIME_SERIES_DAILY':
      return 'Time Series (Daily)';
    case 'TIME_SERIES_WEEKLY':
      return 'Weekly Time Series';
    case 'TIME_SERIES_MONTHLY':
      return 'Monthly Time Series';
    default:
      return 'Time Series (Daily)';
  }
}

/**
 * Format time series data for our application
 * @param {Object} timeSeries - Time series data from Alpha Vantage
 * @param {string} symbol - Stock symbol
 * @returns {Object} - Formatted data for our dashboard
 */
function formatTimeSeriesData(timeSeries, symbol) {
  try {
    // Convert the time series object into an array of data points
    const formattedData = Object.entries(timeSeries).map(([timestamp, values]) => {
      // Different time series have slightly different field names
      const open = parseFloat(values['1. open'] || values.open);
      const high = parseFloat(values['2. high'] || values.high);
      const low = parseFloat(values['3. low'] || values.low);
      const close = parseFloat(values['4. close'] || values.close);
      const volume = parseInt(values['5. volume'] || values.volume, 10);
      
      return {
        date: new Date(timestamp).getTime(),
        open,
        high,
        low,
        close,
        volume
      };
    });
    
    // Sort data by date (oldest to newest)
    formattedData.sort((a, b) => a.date - b.date);
    
    // Only return the last 100 data points if there are more
    const limitedData = formattedData.length > 100 
      ? formattedData.slice(-100) 
      : formattedData;
    
    return {
      symbol,
      data: limitedData
    };
  } catch (error) {
    console.error('Error formatting time series data:', error);
    return {
      noData: true,
      error: 'Failed to process stock data'
    };
  }
}

/**
 * Format search results data
 * @param {Array} matches - Search matches from Alpha Vantage
 * @returns {Array} - Formatted search results for our application
 */
function formatSearchResults(matches) {
  return matches.map(item => ({
    symbol: item['1. symbol'],
    name: item['2. name'],
    type: item['3. type'],
    region: item['4. region']
  }));
}

/**
 * Get historical time series data for a stock
 * @param {string} symbol - Stock symbol
 * @param {string} range - Time range (1D, 5D, 1M, 1Y, 5Y, etc.)
 * @returns {Promise<Object>} - Stock data or error
 */
export const fetchStockData = async (symbol, range) => {
  if (!symbol) {
    return { 
      noData: true, 
      error: 'Symbol parameter is required' 
    };
  }

  try {
    console.log(`Fetching Alpha Vantage data for ${symbol} with range ${range}`);
    
    // Determine function and interval based on the range
    const { timeFunction, outputSize, interval } = getTimeSeriesParams(range);
    
    // Build API URL
    const url = `${ALPHA_VANTAGE_CONFIG.BASE_URL}?function=${timeFunction}&symbol=${symbol}&outputsize=${outputSize}${interval ? '&interval=' + interval : ''}&apikey=${ALPHA_VANTAGE_CONFIG.API_KEY}`;
    
    // Fetch data from Alpha Vantage
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check for Alpha Vantage error messages
    if (data['Error Message']) {
      return { 
        noData: true, 
        error: data['Error Message'] 
      };
    }
    
    if (data['Note']) {
      console.warn('Alpha Vantage API limit message:', data['Note']);
    }
    
    // Get the time series data based on the function used
    const timeSeriesKey = getTimeSeriesKey(timeFunction, interval);
    const timeSeries = data[timeSeriesKey];
    
    if (!timeSeries) {
      console.error('No time series data found in response', data);
      return { 
        noData: true, 
        error: 'No data available for this symbol and timeframe' 
      };
    }
    
    // Format the data for our app
    return formatTimeSeriesData(timeSeries, symbol);
    
  } catch (error) {
    console.error('Error fetching stock data from Alpha Vantage:', error);
    return { 
      noData: true, 
      error: 'Failed to fetch stock data. Please try again.' 
    };
  }
};

/**
 * Search for stock symbols
 * @param {string} keyword - Search term
 * @returns {Promise<Array>} - Search results
 */
export const searchStockSymbols = async (keyword) => {
  if (!keyword || keyword.length < 1) {
    return [];
  }
  
  try {
    console.log(`Searching Alpha Vantage for "${keyword}"`);
    
    // Build search URL
    const url = `${ALPHA_VANTAGE_CONFIG.SEARCH_URL}&keywords=${encodeURIComponent(keyword)}&apikey=${ALPHA_VANTAGE_CONFIG.API_KEY}`;
    
    // Fetch search results
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Search request failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if we have matches
    if (!data.bestMatches || !Array.isArray(data.bestMatches)) {
      console.warn('No matches found or unexpected response format', data);
      return [];
    }
    
    // Format and return search results
    return formatSearchResults(data.bestMatches);
    
  } catch (error) {
    console.error('Error searching stock symbols:', error);
    return [];
  }
}; 
/**
 * Stock Data Service
 * Works with Alpha Vantage API for real stock data
 */

// Configuration - update these values
const CONFIG = {
  // Alpha Vantage API key and URL
  ALPHA_VANTAGE_API_KEY: 'demo', // Replace with your Alpha Vantage API key
  ALPHA_VANTAGE_API_URL: 'https://www.alphavantage.co/query',
  
  // Feature flags
  USE_MOCK_DATA: false // Try API first, but we'll still fall back to mock data if needed
};

// Import functions from alpha-vantage-service.js
import * as alphaVantageService from './alpha-vantage-service.js';

// =====================================================
// LOCAL IMPLEMENTATION WITH MOCK DATA
// =====================================================

// Mock stock database
const MOCK_STOCKS = {
  'AAPL': {
    name: 'Apple Inc.',
    price: 185.92,
    change: 1.78,
    changePercent: 0.97,
    high52Week: 199.62,
    low52Week: 141.39,
    marketCap: '2.87T',
    volume: 48521400,
    avgVolume: 56395400
  },
  'MSFT': {
    name: 'Microsoft Corporation',
    price: 415.43,
    change: 2.42,
    changePercent: 0.59,
    high52Week: 430.82,
    low52Week: 310.10,
    marketCap: '3.09T',
    volume: 19246000,
    avgVolume: 21340200
  },
  'GOOGL': {
    name: 'Alphabet Inc.',
    price: 164.58,
    change: -0.72,
    changePercent: -0.43,
    high52Week: 178.77,
    low52Week: 115.36,
    marketCap: '2.01T',
    volume: 18564300,
    avgVolume: 19875500
  },
  'AMZN': {
    name: 'Amazon.com, Inc.',
    price: 177.23,
    change: 0.83,
    changePercent: 0.47,
    high52Week: 185.10,
    low52Week: 115.48,
    marketCap: '1.84T',
    volume: 31427600,
    avgVolume: 34892700
  },
  'META': {
    name: 'Meta Platforms, Inc.',
    price: 471.92,
    change: 3.21,
    changePercent: 0.68,
    high52Week: 531.49,
    low52Week: 258.04,
    marketCap: '1.19T',
    volume: 12845700,
    avgVolume: 14562300
  },
  'TSLA': {
    name: 'Tesla, Inc.',
    price: 248.42,
    change: -3.78,
    changePercent: -1.50,
    high52Week: 299.29,
    low52Week: 138.80,
    marketCap: '792.43B',
    volume: 98562400,
    avgVolume: 106234500
  },
  'NVDA': {
    name: 'NVIDIA Corporation',
    price: 118.71,
    change: 2.13,
    changePercent: 1.83,
    high52Week: 140.76,
    low52Week: 41.04,
    marketCap: '2.93T',
    volume: 134621800,
    avgVolume: 141235600
  }
};

// List of all stocks for search
const ALL_STOCKS = Object.entries(MOCK_STOCKS).map(([symbol, data]) => ({
  symbol,
  name: data.name
}));

/**
 * Generate mock historical data for a given stock
 */
function generateHistoricalData(symbol, range) {
  if (!MOCK_STOCKS[symbol]) {
    return { noData: true, error: `Stock symbol ${symbol} not found` };
  }

  const stockData = MOCK_STOCKS[symbol];
  const currentPrice = stockData.price;
  const volatility = 0.02; // 2% volatility
  const timestamps = [];
  const prices = [];
  
  // Determine data points and interval based on range
  let dataPoints = 30;
  let intervalMinutes = 15;
  
  switch (range.toUpperCase()) {
    case '1D':
      dataPoints = 39; // 1 day (6.5 hours) with 10-minute intervals
      intervalMinutes = 10;
      break;
    case '5D':
      dataPoints = 32; // 5 days with 48-minute intervals
      intervalMinutes = 48;
      break;
    case '1M':
      dataPoints = 22; // 1 month (22 trading days)
      intervalMinutes = 24 * 60; // 1 day
      break;
    case '1Y':
      dataPoints = 52; // 1 year (52 weeks)
      intervalMinutes = 7 * 24 * 60; // 1 week
      break;
    case '5Y':
      dataPoints = 60; // 5 years (60 months)
      intervalMinutes = 30 * 24 * 60; // 1 month
      break;
    case '10Y':
      dataPoints = 120; // 10 years (120 months)
      intervalMinutes = 30 * 24 * 60; // 1 month
      break;
    case 'MAX':
      dataPoints = 180; // 15 years (180 months)
      intervalMinutes = 30 * 24 * 60; // 1 month
      break;
  }
  
  // Generate price data
  let lastPrice = currentPrice;
  const now = new Date();
  
  // For longer timeframes, create more significant price history
  const priceMultiplier = range === '5Y' || range === '10Y' || range === 'MAX' ? 
    (currentPrice > stockData.low52Week * 1.3 ? 0.4 : 1.4) : 1;
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    // Create timestamps going back in time
    const timestamp = new Date(now);
    timestamp.setMinutes(now.getMinutes() - (i * intervalMinutes));
    
    // For longer timeframes, adjust starting point to be lower/higher 
    let adjustedPrice = currentPrice;
    if (range === '5Y' || range === '10Y' || range === 'MAX') {
      const progressFactor = i / dataPoints; // 1 at the start, 0 at the end
      adjustedPrice = currentPrice * (priceMultiplier * progressFactor + (1 - progressFactor));
    }
    
    // Add some randomness
    const drift = (dataPoints - i) / dataPoints; // Higher for older data
    const change = (Math.random() - 0.5) * volatility * drift;
    
    // For the first point, use the adjusted starting price
    if (i === dataPoints - 1) {
      lastPrice = adjustedPrice;
    } else {
      lastPrice = lastPrice * (1 + change);
    }
    
    timestamps.push(Math.floor(timestamp.getTime() / 1000));
    prices.push(parseFloat(lastPrice.toFixed(2)));
  }

  // For the final data point, use the actual current price
  prices[prices.length - 1] = currentPrice;
  
  return {
    t: timestamps,
    c: prices,
    o: prices.map(p => p * (1 + (Math.random() - 0.5) * 0.005)),
    h: prices.map(p => p * (1 + Math.random() * 0.01)),
    l: prices.map(p => p * (1 - Math.random() * 0.01)),
    v: Array(prices.length).fill(0).map(() => Math.floor(Math.random() * stockData.avgVolume)),
    currentPrice: stockData.price,
    change: stockData.change,
    changePercent: stockData.changePercent,
    companyName: stockData.name
  };
}

/**
 * Local implementation of fetchStockData
 */
const fetchStockDataLocal = async (symbol, range) => {
  // Add a small delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    console.log(`Fetching local mock data for ${symbol} with range ${range}`);
    
    // Handle uppercase/lowercase
    const normalizedSymbol = symbol.toUpperCase();
    
    if (!MOCK_STOCKS[normalizedSymbol]) {
      return { 
        noData: true, 
        error: `Stock symbol ${normalizedSymbol} not found` 
      };
    }
    
    // Generate historical data
    return generateHistoricalData(normalizedSymbol, range);
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
    const lowercasedKeyword = keyword.toLowerCase();
    
    // Filter the list based on the keyword
    return ALL_STOCKS.filter(stock => 
      stock.symbol.toLowerCase().includes(lowercasedKeyword) || 
      stock.name.toLowerCase().includes(lowercasedKeyword)
    );
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
  // Always try the Alpha Vantage API first
  if (!CONFIG.USE_MOCK_DATA) {
    try {
      console.log('Using Alpha Vantage stock data API');
      const alphaVantageData = await alphaVantageService.fetchStockData(symbol, range);
      
      // If we got valid data, return it
      if (!alphaVantageData.noData && !alphaVantageData.error) {
        return alphaVantageData;
      }
      
      console.warn('Alpha Vantage API failed, falling back to mock data:', alphaVantageData.error);
    } catch (error) {
      console.error('Error with Alpha Vantage API, falling back to mock data:', error);
    }
  }
  
  // Use mock data as fallback or if configured to do so
  console.log('Using MOCK stock data mode');
  return fetchStockDataLocal(symbol, range);
};

/**
 * Search stock symbols
 */
export const searchStockSymbols = async (keyword) => {
  // Always try the Alpha Vantage API first
  if (!CONFIG.USE_MOCK_DATA) {
    try {
      console.log('Using Alpha Vantage stock search API');
      const alphaVantageResults = await alphaVantageService.searchStockSymbols(keyword);
      
      // If we got valid results, return them
      if (alphaVantageResults && alphaVantageResults.length > 0) {
        return alphaVantageResults;
      }
      
      console.warn('Alpha Vantage search returned no results, falling back to mock data');
    } catch (error) {
      console.error('Error with Alpha Vantage search API, falling back to mock data:', error);
    }
  }
  
  // Use mock data as fallback or if configured to do so
  console.log('Using MOCK stock search mode');
  return searchStockSymbolsLocal(keyword);
}; 
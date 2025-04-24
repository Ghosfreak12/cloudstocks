/**
 * Stock Data Service
 * Works both locally (with mock data) and with AWS API Gateway
 */

// Configuration - update these values
const CONFIG = {
  // AWS API Gateway URL (if using AWS)
  API_URL: 'https://9lp8pvu206.execute-api.us-east-1.amazonaws.com/prod',
  
  // Feature flag to force local mode even in production
  FORCE_LOCAL_MODE: false
};

// Environment detection
const isLocalDevelopment = () => {
  return CONFIG.FORCE_LOCAL_MODE || 
         process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost';
};

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
// AWS IMPLEMENTATION
// =====================================================

/**
 * AWS implementation of fetchStockData
 */
const fetchStockDataAWS = async (symbol, range) => {
  try {
    const response = await fetch(
      `${CONFIG.API_URL}/stock-data?symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(range.toLowerCase())}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return { 
        noData: true, 
        error: errorData.error || 'Failed to fetch stock data' 
      };
    }
    
    const responseData = await response.json();
    
    // Handle API Gateway Lambda proxy response format
    if (responseData.body && (responseData.statusCode || responseData.headers)) {
      try {
        // If body is a JSON string, parse it
        return typeof responseData.body === 'string' 
          ? JSON.parse(responseData.body) 
          : responseData.body;
      } catch (err) {
        console.error('Error parsing Lambda response body:', err);
        return responseData.body;
      }
    }
    
    // If it's already the expected format, return as is
    return responseData;
  } catch (error) {
    console.error('Error fetching stock data from AWS:', error);
    return { 
      noData: true, 
      error: 'Failed to fetch stock data. Please try again.' 
    };
  }
};

/**
 * AWS implementation of searchStockSymbols
 */
const searchStockSymbolsAWS = async (keyword) => {
  if (!keyword || keyword.length < 2) return [];
  
  try {
    const response = await fetch(
      `${CONFIG.API_URL}/stock-data/search-stocks?query=${encodeURIComponent(keyword)}`
    );
    
    if (!response.ok) {
      console.error('Error searching stocks:', response.statusText);
      return [];
    }
    
    const responseData = await response.json();
    
    // Handle API Gateway Lambda proxy response format
    if (responseData.body && (responseData.statusCode || responseData.headers)) {
      try {
        // If body is a JSON string, parse it
        return typeof responseData.body === 'string' 
          ? JSON.parse(responseData.body) 
          : responseData.body;
      } catch (err) {
        console.error('Error parsing Lambda response body:', err);
        return [];
      }
    }
    
    // If it's already the expected format, return as is
    return responseData;
  } catch (error) {
    console.error('Error searching stocks from AWS:', error);
    return [];
  }
};

// =====================================================
// EXPORTED FUNCTIONS
// =====================================================

/**
 * Fetch stock data - with fallback to local mode if AWS fails
 */
export const fetchStockData = async (symbol, range) => {
  // Use local implementation if in development mode or forced local mode
  if (isLocalDevelopment()) {
    console.log('Using LOCAL stock data mode');
    return fetchStockDataLocal(symbol, range);
  }
  
  // Otherwise try AWS implementation with fallback to local
  try {
    console.log('Using AWS stock data mode');
    const awsResult = await fetchStockDataAWS(symbol, range);
    
    // If AWS returns an error, fallback to local mode
    if (awsResult.error) {
      console.log('AWS returned error, falling back to local mode');
      return fetchStockDataLocal(symbol, range);
    }
    
    return awsResult;
  } catch (error) {
    console.error('Error with AWS, falling back to local mode:', error);
    return fetchStockDataLocal(symbol, range);
  }
};

/**
 * Search stock symbols - with fallback to local mode if AWS fails
 */
export const searchStockSymbols = async (keyword) => {
  // Use local implementation if in development mode or forced local mode
  if (isLocalDevelopment()) {
    console.log('Using LOCAL stock search mode');
    return searchStockSymbolsLocal(keyword);
  }
  
  // Otherwise try AWS implementation with fallback to local
  try {
    console.log('Using AWS stock search mode');
    const awsResult = await searchStockSymbolsAWS(keyword);
    
    // If AWS returns empty or fails, fallback to local mode
    if (!awsResult || awsResult.length === 0 || awsResult.error) {
      console.log('AWS returned no results, falling back to local mode');
      return searchStockSymbolsLocal(keyword);
    }
    
    return awsResult;
  } catch (error) {
    console.error('Error with AWS, falling back to local mode:', error);
    return searchStockSymbolsLocal(keyword);
  }
}; 
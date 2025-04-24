/**
 * Alpha Vantage Stock Data Service
 * Uses Alpha Vantage API for stock market data
 */

// Configuration
const CONFIG = {
  API_KEY: 'Y40XKL904QT19YSB',
  BASE_URL: 'https://www.alphavantage.co/query'
};

/**
 * Fetch stock data for a given symbol and time interval
 * @param {string} symbol - Stock symbol (e.g., AAPL, MSFT)
 * @param {string} range - Time range (1D, 5D, 1M, etc.)
 * @returns {Promise<Object>} Stock data in the format expected by the app
 */
export const fetchStockData = async (symbol, range) => {
  if (!symbol) {
    return { 
      noData: true, 
      error: 'Symbol parameter is required' 
    };
  }

  // Convert range to Alpha Vantage format
  const { function: timeSeries, outputsize, interval } = convertRangeToParams(range);
  
  try {
    console.log(`Fetching data from Alpha Vantage for ${symbol} with range ${range}`);
    
    const url = `${CONFIG.BASE_URL}?function=${timeSeries}&symbol=${symbol}&apikey=${CONFIG.API_KEY}${interval ? `&interval=${interval}` : ''}${outputsize ? `&outputsize=${outputsize}` : ''}`;
    
    console.log(`API URL: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for API error messages
    if (data['Error Message']) {
      return {
        noData: true,
        error: data['Error Message']
      };
    }
    
    if (data['Note']) {
      console.warn('Alpha Vantage API limit reached:', data['Note']);
      
      // If we hit API limits, fall back to mock data
      console.log('Falling back to mock data due to API limits');
      return getMockDataForRange(symbol, range);
    }
    
    // Transform data to the format expected by the app
    return transformAlphaVantageData(data, symbol, range);
  } catch (error) {
    console.error('Error fetching stock data from Alpha Vantage:', error);
    
    // If there's an error, fall back to mock data
    console.log('Falling back to mock data due to error');
    return getMockDataForRange(symbol, range);
  }
};

/**
 * Search for stock symbols
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} List of matching stocks
 */
export const searchStockSymbols = async (keyword) => {
  if (!keyword || keyword.length < 2) return [];
  
  try {
    console.log(`Searching Alpha Vantage for: ${keyword}`);
    
    const url = `${CONFIG.BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keyword)}&apikey=${CONFIG.API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for API error messages
    if (data['Error Message']) {
      console.error('Alpha Vantage API error:', data['Error Message']);
      return getMockSearchResults(keyword);
    }
    
    if (data['Note']) {
      console.warn('Alpha Vantage API limit reached:', data['Note']);
      return getMockSearchResults(keyword);
    }
    
    if (!data.bestMatches) {
      return getMockSearchResults(keyword);
    }
    
    // Transform search results to the format expected by the app
    return data.bestMatches.map(match => ({
      symbol: match['1. symbol'],
      name: match['2. name']
    }));
  } catch (error) {
    console.error('Error searching stocks from Alpha Vantage:', error);
    return getMockSearchResults(keyword);
  }
};

/**
 * Convert app range format to Alpha Vantage parameters
 */
function convertRangeToParams(range) {
  switch (range.toUpperCase()) {
    case '1D':
      return { 
        function: 'TIME_SERIES_INTRADAY', 
        interval: '5min',
        outputsize: 'full' 
      };
    case '5D':
      return { 
        function: 'TIME_SERIES_INTRADAY', 
        interval: '60min',
        outputsize: 'full'
      };
    case '1M':
      return { 
        function: 'TIME_SERIES_DAILY', 
        outputsize: 'full' 
      };
    case '1Y':
      return { 
        function: 'TIME_SERIES_DAILY', 
        outputsize: 'full'
      };
    case '5Y':
      return { 
        function: 'TIME_SERIES_WEEKLY',
        outputsize: 'full'
      };
    case '10Y':
      return { 
        function: 'TIME_SERIES_WEEKLY',
        outputsize: 'full'
      };
    case 'MAX':
      return { 
        function: 'TIME_SERIES_MONTHLY',
        outputsize: 'full'
      };
    default:
      return { 
        function: 'TIME_SERIES_DAILY', 
        outputsize: 'compact' 
      };
  }
}

/**
 * Transform Alpha Vantage data to the format expected by the app
 */
function transformAlphaVantageData(data, symbol, range) {
  // Identify the time series based on the function used
  let timeSeries;
  let timeKey;
  
  if (data['Time Series (5min)']) {
    timeSeries = data['Time Series (5min)'];
    timeKey = 'Time Series (5min)';
  } else if (data['Time Series (60min)']) {
    timeSeries = data['Time Series (60min)'];
    timeKey = 'Time Series (60min)';
  } else if (data['Time Series (Daily)']) {
    timeSeries = data['Time Series (Daily)'];
    timeKey = 'Time Series (Daily)';
  } else if (data['Weekly Time Series']) {
    timeSeries = data['Weekly Time Series'];
    timeKey = 'Weekly Time Series';
  } else if (data['Monthly Time Series']) {
    timeSeries = data['Monthly Time Series'];
    timeKey = 'Monthly Time Series';
  } else {
    // No time series found
    console.error('No time series found in data:', Object.keys(data));
    return {
      noData: true,
      error: 'No data available for this symbol and range.'
    };
  }
  
  // Get dates in order (most recent first)
  let dates = Object.keys(timeSeries).sort((a, b) => new Date(b) - new Date(a));
  
  // Filter the data based on the selected range
  const now = new Date();
  
  // Filter dates based on the selected range
  if (dates.length > 0) {
    switch (range.toUpperCase()) {
      case '1D': {
        // Get today's data only
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        dates = dates.filter(date => new Date(date) >= today);
        break;
      }
      case '5D': {
        // Get last 5 days of data
        const fiveDaysAgo = new Date(now);
        fiveDaysAgo.setDate(now.getDate() - 5);
        dates = dates.filter(date => new Date(date) >= fiveDaysAgo);
        break;
      }
      case '1M': {
        // Get last month of data
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        dates = dates.filter(date => new Date(date) >= oneMonthAgo);
        break;
      }
      case '1Y': {
        // Get last year of data
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        dates = dates.filter(date => new Date(date) >= oneYearAgo);
        break;
      }
      case '5Y': {
        // Get last 5 years of data
        const fiveYearsAgo = new Date(now);
        fiveYearsAgo.setFullYear(now.getFullYear() - 5);
        dates = dates.filter(date => new Date(date) >= fiveYearsAgo);
        break;
      }
      case '10Y': {
        // Get last 10 years of data
        const tenYearsAgo = new Date(now);
        tenYearsAgo.setFullYear(now.getFullYear() - 10);
        dates = dates.filter(date => new Date(date) >= tenYearsAgo);
        break;
      }
      // For MAX, use all available data
    }
    
    console.log(`Filtered data for ${range} range: ${dates.length} data points`);
  }
  
  if (dates.length === 0) {
    return {
      noData: true,
      error: 'No price data available for this symbol and range.'
    };
  }
  
  // Extract time and price data
  const timestamps = dates.map(date => Math.floor(new Date(date).getTime() / 1000));
  const closes = dates.map(date => parseFloat(timeSeries[date]['4. close']));
  const opens = dates.map(date => parseFloat(timeSeries[date]['1. open']));
  const highs = dates.map(date => parseFloat(timeSeries[date]['2. high']));
  const lows = dates.map(date => parseFloat(timeSeries[date]['3. low']));
  const volumes = dates.map(date => parseInt(timeSeries[date]['5. volume']));
  
  // Get the latest price for current price
  const currentPrice = closes[0];
  
  // Calculate change and change percent
  const previousClose = closes[1] || closes[0];
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  
  // Get metadata
  const metaData = data['Meta Data'] || {};
  let companyName = metaData['2. Symbol'] || symbol;
  
  return {
    t: timestamps,
    c: closes,
    o: opens,
    h: highs,
    l: lows,
    v: volumes,
    currentPrice,
    change,
    changePercent,
    companyName
  };
}

// Mock data functions for fallback
function getMockDataForRange(symbol, range) {
  // Create a simple mock data structure
  const now = new Date();
  const dataPoints = getDataPointsForRange(range);
  const timestamps = [];
  const closes = [];
  
  // Generate some random data
  let basePrice = 100 + Math.random() * 200; // Random price between 100 and 300
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = new Date(now);
    const intervalMinutes = getIntervalForRange(range);
    timestamp.setMinutes(now.getMinutes() - (i * intervalMinutes));
    
    timestamps.push(Math.floor(timestamp.getTime() / 1000));
    
    // Add some random movement
    basePrice = basePrice * (1 + (Math.random() - 0.5) * 0.02);
    closes.push(parseFloat(basePrice.toFixed(2)));
  }
  
  // Generate other data from closes
  const opens = closes.map(c => c * (1 + (Math.random() - 0.5) * 0.01));
  const highs = closes.map(c => c * (1 + Math.random() * 0.01));
  const lows = closes.map(c => c * (1 - Math.random() * 0.01));
  const volumes = closes.map(() => Math.floor(Math.random() * 1000000));
  
  // Calculate change and change percent
  const currentPrice = closes[0];
  const previousClose = closes[1] || closes[0];
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  
  return {
    t: timestamps,
    c: closes,
    o: opens,
    h: highs,
    l: lows,
    v: volumes,
    currentPrice,
    change,
    changePercent,
    companyName: symbol
  };
}

function getDataPointsForRange(range) {
  switch(range.toUpperCase()) {
    case '1D': return 78; // 6.5 hours (13 * 6)
    case '5D': return 39; // 5 days with hourly data
    case '1M': return 22; // ~22 trading days
    case '1Y': return 252; // ~252 trading days in a year
    case '5Y': return 260; // Weekly data for 5 years
    case '10Y': return 520; // Weekly data for 10 years
    case 'MAX': return 600; // Monthly data for 50 years
    default: return 100;
  }
}

function getIntervalForRange(range) {
  switch(range.toUpperCase()) {
    case '1D': return 5; // 5 min intervals
    case '5D': return 60; // 1 hour intervals
    case '1M': return 24 * 60; // 1 day intervals
    case '1Y': return 24 * 60; // 1 day intervals
    case '5Y': 
    case '10Y': return 7 * 24 * 60; // 1 week intervals
    case 'MAX': return 30 * 24 * 60; // 1 month intervals
    default: return 24 * 60; // 1 day intervals
  }
}

function getMockSearchResults(keyword) {
  const mockStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'TSM', name: 'Taiwan Semiconductor Manufacturing' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' }
  ];
  
  if (!keyword) return [];
  
  const lowercaseKeyword = keyword.toLowerCase();
  return mockStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(lowercaseKeyword) || 
    stock.name.toLowerCase().includes(lowercaseKeyword)
  );
}
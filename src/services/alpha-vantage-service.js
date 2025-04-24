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
      return {
        noData: true,
        error: 'API call frequency limit reached. Please try again later.'
      };
    }
    
    // Transform data to the format expected by the app
    return transformAlphaVantageData(data, symbol, range);
  } catch (error) {
    console.error('Error fetching stock data from Alpha Vantage:', error);
    return { 
      noData: true, 
      error: error.message || 'Failed to fetch stock data. Please try again.' 
    };
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
      return [];
    }
    
    if (data['Note']) {
      console.warn('Alpha Vantage API limit reached:', data['Note']);
      return [];
    }
    
    if (!data.bestMatches) {
      return [];
    }
    
    // Transform search results to the format expected by the app
    return data.bestMatches.map(match => ({
      symbol: match['1. symbol'],
      name: match['2. name']
    }));
  } catch (error) {
    console.error('Error searching stocks from Alpha Vantage:', error);
    return [];
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
        outputsize: 'compact' 
      };
    case '5D':
      return { 
        function: 'TIME_SERIES_INTRADAY', 
        interval: '60min',
        outputsize: 'full'  // Use full output size to get more data points
      };
    case '1M':
      return { 
        function: 'TIME_SERIES_DAILY', 
        outputsize: 'compact' 
      };
    case '1Y':
      return { 
        function: 'TIME_SERIES_WEEKLY' 
      };
    case '5Y':
    case '10Y':
    case 'MAX':
      return { 
        function: 'TIME_SERIES_MONTHLY' 
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
    return {
      noData: true,
      error: 'No data available for this symbol and range.'
    };
  }
  
  // Get dates in order (most recent first)
  let dates = Object.keys(timeSeries).sort((a, b) => new Date(b) - new Date(a));
  
  // For 5D range, filter to get only the last 5 days of data
  if (range.toUpperCase() === '5D' && dates.length > 0) {
    const now = new Date();
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(now.getDate() - 5);
    
    // Filter dates to only include those within the last 5 days
    dates = dates.filter(date => {
      const dateObj = new Date(date);
      return dateObj >= fiveDaysAgo;
    });
    
    console.log(`Filtered data for 5D range: ${dates.length} data points`);
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
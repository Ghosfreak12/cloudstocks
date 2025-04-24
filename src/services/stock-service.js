/**
 * Stock Data Service
 * Works with Finnhub API for real stock data
 */

// Configuration - update these values
const CONFIG = {
  // Finnhub API key and URL
  FINNHUB_API_KEY: 'd018h2pr01qile5u3ur0d018h2pr01qile5u3urg',
  FINNHUB_API_URL: 'https://finnhub.io/api/v1',
  
  // Feature flags
  USE_MOCK_DATA: false
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
// FINNHUB API IMPLEMENTATION
// =====================================================

/**
 * Convert a range parameter to Finnhub parameters (resolution and from/to dates)
 */
const getRangeParameters = (range) => {
  const now = Math.floor(Date.now() / 1000);
  let resolution = 'D';
  let from = now;
  
  switch (range.toUpperCase()) {
    case '1D':
      resolution = '5';
      // For 1D, go back 2 days to ensure we get enough data points
      // (Finnhub might not have very recent data during market closed hours)
      from = now - (2 * 24 * 60 * 60); 
      break;
    case '5D':
      resolution = '15';
      from = now - (5 * 24 * 60 * 60); // 5 days back
      break;
    case '1M':
      resolution = 'D';
      from = now - (30 * 24 * 60 * 60); // 30 days back
      break;
    case '1Y':
      resolution = 'W';
      from = now - (365 * 24 * 60 * 60); // 1 year back
      break;
    case '5Y':
      resolution = 'M';
      from = now - (5 * 365 * 24 * 60 * 60); // 5 years back
      break;
    case '10Y':
      resolution = 'M';
      from = now - (10 * 365 * 24 * 60 * 60); // 10 years back
      break;
    case 'MAX':
      resolution = 'M';
      from = now - (20 * 365 * 24 * 60 * 60); // 20 years back (max)
      break;
    default:
      resolution = 'D';
      from = now - (30 * 24 * 60 * 60); // Default to 1 month
  }
  
  return { resolution, from, to: now };
};

/**
 * Fetch stock data from Finnhub API
 */
const fetchStockDataFinnhub = async (symbol, range) => {
  try {
    // Ensure we have a valid, non-empty symbol
    if (!symbol) {
      return { 
        noData: true, 
        error: 'Symbol parameter is required' 
      };
    }

    // Clean and encode parameters properly
    const encodedSymbol = encodeURIComponent(symbol.trim().toUpperCase());
    
    // Get range parameters
    const { resolution, from, to } = getRangeParameters(range);
    
    console.log(`Fetching Finnhub data for ${encodedSymbol} with range ${range} (resolution: ${resolution}, from: ${from}, to: ${to})`);
    
    // Fetch quote data first (current price, change, etc.)
    const quoteResponse = await fetch(
      `${CONFIG.FINNHUB_API_URL}/quote?symbol=${encodedSymbol}&token=${CONFIG.FINNHUB_API_KEY}`
    );
    
    if (!quoteResponse.ok) {
      throw new Error(`Failed to fetch quote data: ${quoteResponse.statusText}`);
    }
    
    const quoteData = await quoteResponse.json();
    
    // Check if we got a valid response
    if (quoteData.error) {
      return { 
        noData: true, 
        error: quoteData.error 
      };
    }
    
    // Fetch company profile for name
    const profileResponse = await fetch(
      `${CONFIG.FINNHUB_API_URL}/stock/profile2?symbol=${encodedSymbol}&token=${CONFIG.FINNHUB_API_KEY}`
    );
    
    let companyName = encodedSymbol;
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      companyName = profileData.name || encodedSymbol;
    }
    
    // Fetch historical data
    const historyUrl = `${CONFIG.FINNHUB_API_URL}/stock/candle?symbol=${encodedSymbol}&resolution=${resolution}&from=${from}&to=${to}&token=${CONFIG.FINNHUB_API_KEY}`;
    console.log(`Fetching historical data from: ${historyUrl}`);
    
    const historyResponse = await fetch(historyUrl);
    
    if (!historyResponse.ok) {
      throw new Error(`Failed to fetch historical data: ${historyResponse.statusText}`);
    }
    
    const historyData = await historyResponse.json();
    console.log(`History data response status: ${historyData.s}, data points: ${historyData.t ? historyData.t.length : 0}`);
    
    // Check if we got valid history
    if (historyData.s === 'no_data') {
      console.error('No historical data returned for query:', { symbol, range, resolution, from, to });
      return { 
        noData: true, 
        error: 'No historical data available for this symbol and timeframe' 
      };
    }
    
    // Ensure the data has enough points for charting
    if (!historyData.t || historyData.t.length < 2) {
      console.error('Not enough data points for charting:', { symbol, range, dataPoints: historyData.t ? historyData.t.length : 0 });
      return {
        noData: true,
        error: 'Not enough data points available for this timeframe'
      };
    }

    // For 1D specifically, ensure we have minute-level data
    if (range.toUpperCase() === '1D' && historyData.t.length < 10) {
      console.log('Insufficient 1D data points, falling back to 5D data with higher resolution');
      // Fall back to 5D with 5-minute resolution
      const fallbackFrom = from - (3 * 24 * 60 * 60); // Go back 5 days total
      
      const fallbackHistoryUrl = `${CONFIG.FINNHUB_API_URL}/stock/candle?symbol=${encodedSymbol}&resolution=5&from=${fallbackFrom}&to=${to}&token=${CONFIG.FINNHUB_API_KEY}`;
      const fallbackResponse = await fetch(fallbackHistoryUrl);
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.s === 'ok' && fallbackData.t && fallbackData.t.length >= 10) {
          console.log(`Using fallback data with ${fallbackData.t.length} data points`);
          historyData = fallbackData;
        }
      }
    }
    
    // Format the response to match our app's expected format
    return {
      t: historyData.t,
      o: historyData.o,
      h: historyData.h,
      l: historyData.l,
      c: historyData.c,
      v: historyData.v,
      currentPrice: quoteData.c,
      change: quoteData.d,
      changePercent: quoteData.dp,
      companyName
    };
  } catch (error) {
    console.error('Error fetching stock data from Finnhub:', error);
    return { 
      noData: true, 
      error: 'Failed to fetch stock data. Please try again.' 
    };
  }
};

/**
 * Search stock symbols using Finnhub API
 */
const searchStockSymbolsFinnhub = async (keyword) => {
  if (!keyword || keyword.length < 2) return [];
  
  try {
    // Clean and encode the keyword properly
    const encodedKeyword = encodeURIComponent(keyword.trim().toLowerCase());
    
    console.log(`Searching Finnhub stocks with query: ${encodedKeyword}`);
    
    const response = await fetch(
      `${CONFIG.FINNHUB_API_URL}/search?q=${encodedKeyword}&token=${CONFIG.FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Error searching stocks:', response.statusText);
      return [];
    }
    
    const data = await response.json();
    
    // Format the response to match our app's expected format
    if (data.result && Array.isArray(data.result)) {
      return data.result
        .filter(item => item.type === 'Common Stock' && !item.symbol.includes('.'))
        .map(item => ({
          symbol: item.symbol,
          name: item.description
        }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching stocks from Finnhub:', error);
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
  // Use mock data if configured to do so
  if (CONFIG.USE_MOCK_DATA) {
    console.log('Using MOCK stock data mode');
    return fetchStockDataLocal(symbol, range);
  }
  
  // Otherwise use Finnhub implementation
  console.log('Using Finnhub stock data API');
  return fetchStockDataFinnhub(symbol, range);
};

/**
 * Search stock symbols
 */
export const searchStockSymbols = async (keyword) => {
  // Use mock data if configured to do so
  if (CONFIG.USE_MOCK_DATA) {
    console.log('Using MOCK stock search mode');
    return searchStockSymbolsLocal(keyword);
  }
  
  // Otherwise use Finnhub implementation
  console.log('Using Finnhub stock search API');
  return searchStockSymbolsFinnhub(keyword);
}; 
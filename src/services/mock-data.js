/**
 * Mock Stock Data Service
 * Provides reliable mock data for stocks
 */

// Mock stock database with realistic data (used as fallback)
const fallbackStocks = {
  'AAPL': {
    name: 'Apple Inc.',
    price: 209.28,
    change: 0.86,
    changePercent: 0.41,
    high52Week: 215.15,
    low52Week: 164.08,
    marketCap: '3.87T',
    volume: 38222258,
    avgVolume: 59874300
  },
  'MSFT': {
    name: 'Microsoft Corporation',
    price: 391.85,
    change: 4.51,
    changePercent: 1.16,
    high52Week: 403.65,
    low52Week: 342.13,
    marketCap: '3.13T',
    volume: 18973165,
    avgVolume: 22965400
  },
  'GOOGL': {
    name: 'Alphabet Inc.',
    price: 161.96,
    change: 2.72,
    changePercent: 1.71,
    high52Week: 170.25,
    low52Week: 132.47,
    marketCap: '1.87T',
    volume: 56033995,
    avgVolume: 21487600
  },
  'AMZN': {
    name: 'Amazon.com, Inc.',
    price: 188.99,
    change: 2.38,
    changePercent: 1.28,
    high52Week: 195.10,
    low52Week: 136.29,
    marketCap: '1.96T',
    volume: 36414330,
    avgVolume: 37219800
  },
  'META': {
    name: 'Meta Platforms, Inc.',
    price: 547.27,
    change: 14.13,
    changePercent: 2.65,
    high52Week: 565.23,
    low52Week: 297.65,
    marketCap: '1.45T',
    volume: 17098921,
    avgVolume: 15894300
  },
  'TSLA': {
    name: 'Tesla, Inc.',
    price: 284.95,
    change: 25.41,
    changePercent: 9.79,
    high52Week: 333.92,
    low52Week: 162.34,
    marketCap: '931.25B',
    volume: 167560688,
    avgVolume: 112876900
  },
  'NVDA': {
    name: 'NVIDIA Corporation',
    price: 111.01,
    change: 4.52,
    changePercent: 4.25,
    high52Week: 119.67,
    low52Week: 53.29,
    marketCap: '3.64T',
    volume: 251064672,
    avgVolume: 156432100
  },
  'INTC': {
    name: 'Intel Corporation',
    price: 20.05,
    change: -1.45,
    changePercent: -6.72,
    high52Week: 47.82,
    low52Week: 19.38,
    marketCap: '125.67B',
    volume: 147711174,
    avgVolume: 45932100
  },
  'AMD': {
    name: 'Advanced Micro Devices, Inc.',
    price: 96.65,
    change: 2.16,
    changePercent: 2.29,
    high52Week: 127.94,
    low52Week: 74.30,
    marketCap: '294.36B',
    volume: 28575343,
    avgVolume: 67987600
  },
  'WMT': {
    name: 'Walmart Inc.',
    price: 95.09,
    change: -0.79,
    changePercent: -0.82,
    high52Week: 102.34,
    low52Week: 82.15,
    marketCap: '399.22B',
    volume: 15317220,
    avgVolume: 17842100
  },
  'JPM': {
    name: 'JPMorgan Chase & Co.',
    price: 243.55,
    change: -1.24,
    changePercent: -0.51,
    high52Week: 251.47,
    low52Week: 184.12,
    marketCap: '708.13B',
    volume: 8588564,
    avgVolume: 10233200
  },
  'DIS': {
    name: 'The Walt Disney Company',
    price: 90.28,
    change: 0.25,
    changePercent: 0.28,
    high52Week: 106.78,
    low52Week: 78.52,
    marketCap: '164.91B',
    volume: 7749630,
    avgVolume: 8987420
  },
  'XOM': {
    name: 'Exxon Mobil Corporation',
    price: 108.57,
    change: -0.075,
    changePercent: -0.07,
    high52Week: 123.45,
    low52Week: 96.32,
    marketCap: '436.78B',
    volume: 11245793,
    avgVolume: 12456500
  },
  'BRK.B': {
    name: 'Berkshire Hathaway Inc.',
    price: 530.96,
    change: -0.66,
    changePercent: -0.12,
    high52Week: 545.67,
    low52Week: 475.23,
    marketCap: '782.36B',
    volume: 2742786,
    avgVolume: 3190231
  },
  'NFLX': {
    name: 'Netflix, Inc.',
    price: 601.53,
    change: 4.58,
    changePercent: 0.42,
    high52Week: 678.45,
    low52Week: 512.13,
    marketCap: '266.23B',
    volume: 3950008,
    avgVolume: 4532122
  },
  'UBER': {
    name: 'Uber Technologies, Inc.',
    price: 77.75,
    change: -0.39,
    changePercent: -0.50,
    high52Week: 85.67,
    low52Week: 43.76,
    marketCap: '160.89B',
    volume: 20047759,
    avgVolume: 21233245
  }
};

// Cached stocks data to avoid frequent API calls
let cachedStocks = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Get mock stocks data with AWS API fetch and local fallback
 */
export async function getMockStocks() {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (cachedStocks && (now - lastFetchTime < CACHE_DURATION)) {
    console.log('Using cached AWS data (from previous successful fetch)');
    return cachedStocks;
  }
  
  try {
    console.log('Attempting to fetch stocks from AWS API Gateway...');
    const response = await fetch('https://0mv93o2bei.execute-api.us-east-1.amazonaws.com/mockstocks');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const stocksArray = await response.json();
    console.log('SUCCESS: Fetched fresh data from AWS API Gateway');
    
    // Transform from array into object keyed by symbol
    const stocksObject = {};
    for (const stock of stocksArray) {
      stocksObject[stock.symbol] = stock;
    }
    
    // Update cache
    cachedStocks = stocksObject;
    lastFetchTime = now;
    
    return stocksObject;
  } catch (error) {
    console.error('FAILED: Could not fetch from AWS API Gateway:', error);
    
    // If we have cached data, use it even if it's expired
    if (cachedStocks) {
      console.log('Using cached data as fallback (API call failed)');
      return cachedStocks;
    }
    
    // Throw error if no data available (forcing a failure to confirm AWS dependency)
    throw new Error('No stock data available - AWS API Gateway is down and no cache is available');
  }
}

/**
 * For backward compatibility - this will be helpful during transition
 * WARNING: This is deprecated, use getMockStocks() instead
 */
export const MOCK_STOCKS = fallbackStocks;

/**
 * Generate historical data points for a given stock (fixed version)
 */
export async function generateMockHistoricalData(symbol, range = '1M') {
  // Get the latest stocks data
  const stocks = await getMockStocks();
  
  if (!stocks[symbol]) {
    console.error(`Mock data: Symbol ${symbol} not found`);
    return null;
  }

  const stock = stocks[symbol];
  const now = new Date();
  const currentPrice = stock.price;

  // Configure data points and intervals based on range
  let dataPoints;
  let intervalType = 'day';
  let intervalValue = 1;
  
  // Match specific pattern of Apple's stock app time intervals
  switch (range.toUpperCase()) {
    case '1D': 
      dataPoints = 78; 
      intervalType = 'minute'; 
      intervalValue = 5; 
      break;
    case '1W': 
      dataPoints = 38; 
      intervalType = 'hour'; 
      intervalValue = 4; 
      break;
    case '1M': 
      dataPoints = 22; 
      break;
    case '3M':
      dataPoints = 63;
      break;
    case '6M':
      dataPoints = 126;
      break;
    case 'YTD': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const daysElapsed = Math.floor((now - startOfYear) / (24 * 3600 * 1000));
      dataPoints = Math.floor(daysElapsed * (252 / 365));
      break;
    }
    case '1Y':
      dataPoints = 252;
      break;
    case '2Y': 
      // For 2Y view, match the pattern in the image with 6-month intervals
      dataPoints = 24; 
      intervalType = 'month';
      intervalValue = 1;
      break;
    case '5Y':
      // For 5Y, use fewer points with year increments like in Apple's stock app
      dataPoints = 10;
      intervalType = 'quarter';
      intervalValue = 2;
      break;
    case '10Y':
      // For 10Y, use yearly increments
      dataPoints = 11; // 10 years + current
      intervalType = 'year';
      intervalValue = 1;
      break;
    default:
      dataPoints = 22; // Default to 1M view
      break;
  }

  const timestamps = [];
  const closes = [];
  const opens = [];
  const highs = [];
  const lows = [];
  const volumes = [];

  // Use stock-specific volatility factors
  const getVolatilityFactor = (stockSymbol) => {
    const factors = {
      'AAPL': 0.015,
      'MSFT': 0.014,
      'GOOGL': 0.018,
      'AMZN': 0.020,
      'META': 0.022,
      'TSLA': 0.030,
      'NVDA': 0.025,
      'INTC': 0.020,
      'AMD': 0.023,
      'WMT': 0.010,
      'JPM': 0.012,
      'DIS': 0.016,
      'XOM': 0.013,
      'BRK.B': 0.008,
      'NFLX': 0.024,
      'UBER': 0.027
    };
    return factors[stockSymbol] || 0.015;
  };

  const baseVolatility = getVolatilityFactor(symbol);
  
  // Different multipliers for different time ranges
  const rangeMultiplier = {
    '1D': 0.6, 
    '1W': 0.7, 
    '1M': 1.0, 
    '3M': 1.1, 
    '6M': 1.2, 
    '1Y': 1.3, 
    '2Y': 1.4, 
    '5Y': 1.5, 
    '10Y': 1.6, 
    'MAX': 1.7
  }[range.toUpperCase()] || 1.0;
  
  const volatility = baseVolatility * rangeMultiplier;

  // Historical trends for long-term charts using actual patterns for AAPL
  // Apple-specific patterns matching their actual stock history
  const getStartPrice = (stockSymbol, rangeVal) => {
    if (stockSymbol === 'AAPL') {
      switch(rangeVal) {
        case '2Y': return currentPrice * 0.83; // 2-year pattern matching the image
        case '5Y': return currentPrice * 0.36; // 5-year Apple growth
        case '10Y': return currentPrice * 0.17; // 10-year Apple growth
        default: return currentPrice * 0.9;
      }
    }
    
    // Other stocks follow their own patterns
    const growthFactors = {
      'MSFT': { '2Y': 0.75, '5Y': 0.4, '10Y': 0.2 },
      'GOOGL': { '2Y': 0.7, '5Y': 0.45, '10Y': 0.25 },
      'AMZN': { '2Y': 0.65, '5Y': 0.3, '10Y': 0.15 },
      'META': { '2Y': 0.5, '5Y': 0.3, '10Y': 0.2 },
      'TSLA': { '2Y': 0.3, '5Y': 0.1, '10Y': 0.05 },
      'NVDA': { '2Y': 0.3, '5Y': 0.15, '10Y': 0.05 }
    };
    
    const defaultFactors = { '2Y': 0.7, '5Y': 0.4, '10Y': 0.25, 'MAX': 0.2 };
    const stockFactors = growthFactors[stockSymbol] || defaultFactors;
    return currentPrice * (stockFactors[rangeVal] || defaultFactors[rangeVal] || 0.9);
  };

  // Get starting price based on range and stock
  let price = getStartPrice(symbol, range);
  
  // Create specific patterns based on range - make 2Y match the image pattern
  let trend = 0;
  let trendPeriod = Math.floor(dataPoints / 3);
  
  // Apple 2Y Pattern from image: up, plateau with dip, up sharply, down, up
  const applePatterns = {
    '2Y': [0.01, 0.012, 0.015, 0.008, -0.002, -0.01, -0.015, 0.005, 0.01, 0.02, 0.025, 0.03, 
           0.02, 0.015, -0.01, -0.02, -0.025, -0.03, -0.015, -0.01, 0.01, 0.02, 0.015, 0.01]
  };
  
  // Generate data points
  for (let i = dataPoints - 1; i >= 0; i--) {
    // Calculate timestamp based on interval type
    const ts = new Date(now);
    
    if (intervalType === 'minute') {
      ts.setMinutes(ts.getMinutes() - i * intervalValue);
    } else if (intervalType === 'hour') {
      ts.setHours(ts.getHours() - i * intervalValue);
    } else if (intervalType === 'day') {
      ts.setDate(ts.getDate() - i * intervalValue);
    } else if (intervalType === 'week') {
      ts.setDate(ts.getDate() - i * 7 * intervalValue);
    } else if (intervalType === 'month') {
      ts.setMonth(ts.getMonth() - i * intervalValue);
    } else if (intervalType === 'quarter') {
      ts.setMonth(ts.getMonth() - i * 3 * intervalValue);
    } else if (intervalType === 'year') {
      ts.setFullYear(ts.getFullYear() - i * intervalValue);
    }
    
    timestamps.push(Math.floor(ts.getTime() / 1000));

    // Use pattern for AAPL 2Y to match the image
    if (symbol === 'AAPL' && range === '2Y' && applePatterns['2Y'][dataPoints - 1 - i]) {
      trend = applePatterns['2Y'][dataPoints - 1 - i];
    } else {
      // For other cases, generate trend based on trendPeriod
      if (i % trendPeriod === 0) {
        trend = (Math.random() - 0.5) * 0.01;
      }
    }
    
    // Add randomness but preserve the general trend
    const randomFactor = (Math.random() - 0.5) * volatility * 0.5;
    const drift = trend + randomFactor;
    price = Math.max(price * (1 + drift), 0.1);
    
    closes.push(parseFloat(price.toFixed(2)));
    
    // More realistic open/high/low calculations
    const dailyVolatility = volatility * (0.7 + Math.random() * 0.6);
    const open = price * (1 + (Math.random() - 0.5) * dailyVolatility);
    opens.push(parseFloat(open.toFixed(2)));
    
    const highLowRange = dailyVolatility * (1 + Math.random());
    const high = Math.max(price, open) * (1 + Math.random() * highLowRange);
    highs.push(parseFloat(high.toFixed(2)));
    
    const low = Math.min(price, open) * (1 - Math.random() * highLowRange);
    lows.push(parseFloat(low.toFixed(2)));
    
    // Volume correlates with volatility
    const priceChange = Math.abs(price - (closes[closes.length - 2] || price));
    const volatilityFactor = 1 + (priceChange / price) * 20;
    const volumeBase = stock.avgVolume || 10000000;
    const volMultiplier = 0.5 + Math.random() * volatilityFactor;
    volumes.push(Math.floor(volumeBase * volMultiplier));
  }

  // Make sure the last data point matches current price
  closes[closes.length - 1] = currentPrice;
  opens[opens.length - 1] = parseFloat((currentPrice * (1 - volatility / 2)).toFixed(2));
  highs[highs.length - 1] = parseFloat(Math.max(currentPrice, opens[opens.length - 1] * 1.01).toFixed(2));
  lows[closes.length - 1] = parseFloat(Math.min(currentPrice, opens[opens.length - 1] * 0.99).toFixed(2));
  volumes[volumes.length - 1] = stock.volume || Math.floor(stock.avgVolume * 0.9);

  return {
    symbol,
    companyName: stock.name,
    currentPrice: stock.price,
    change: stock.change,
    changePercent: stock.changePercent,
    t: timestamps,
    c: closes,
    o: opens,
    h: highs,
    l: lows,
    v: volumes
  };
}

/**
 * Search for stocks by keyword 
 */
export async function searchMockStocks(keyword) {
  if (typeof keyword !== 'string' || keyword.trim().length < 1) {
    return [];
  }

  const searchTerm = keyword.trim().toLowerCase();
  
  // Get the latest stocks data
  const stocks = await getMockStocks();

  return Object.entries(stocks)
    .filter(([symbol, data]) => {
      const symbolMatch = symbol.toLowerCase().includes(searchTerm);
      const nameMatch = data.name.toLowerCase().includes(searchTerm);
      return symbolMatch || nameMatch;
    })
    .map(([symbol, data]) => ({
      symbol,
      name: data.name
    }));
}
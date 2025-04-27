/**
 * Mock Stock Data Service
 * Provides reliable mock data for stocks
 */

// Mock stock database with realistic data (updated April 26, 2025)
export const MOCK_STOCKS = {
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

/**
 * Generate historical data points for a given stock (fixed version)
 */
export function generateMockHistoricalData(symbol, range = '1M') {
  if (!MOCK_STOCKS[symbol]) {
    console.error(`Mock data: Symbol ${symbol} not found`);
    return null;
  }

  const stock = MOCK_STOCKS[symbol];
  const now = new Date();
  const currentPrice = stock.price;

  let dataPoints = 22; // Default
  let intervalType = 'day';
  let intervalValue = 1;

  switch (range.toUpperCase()) {
    case '1D': dataPoints = 78; intervalType = 'minute'; intervalValue = 5; break;
    case '1W': dataPoints = 38; intervalType = 'hour'; intervalValue = 2; break;
    case '1M': dataPoints = 22; break;
    case '3M': dataPoints = 63; break;
    case '6M': dataPoints = 126; break;
    case 'YTD': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const daysElapsed = Math.floor((now - startOfYear) / (24 * 3600 * 1000));
      dataPoints = Math.floor(daysElapsed * (252 / 365));
      break;
    }
    case '1Y': dataPoints = 252; break;
    case '2Y': dataPoints = 504; intervalValue = 2; break;
    case '5Y': dataPoints = 260; intervalType = 'week'; break;
    case '10Y': dataPoints = 520; intervalType = 'week'; break;
    case 'MAX': dataPoints = 600; intervalType = 'month'; break;
  }

  const timestamps = [];
  const closes = [];
  const opens = [];
  const highs = [];
  const lows = [];
  const volumes = [];

  const baseVolatility = stock.symbol === 'TSLA' ? 0.03 : 0.02;
  const rangeMultiplier = {
    '1D': 0.6, '1W': 0.7, '1M': 1.0, '3M': 1.1, '6M': 1.2, '1Y': 1.3, '2Y': 1.4, '5Y': 1.5, '10Y': 1.6, 'MAX': 1.7
  }[range.toUpperCase()] || 1.0;
  const volatility = baseVolatility * rangeMultiplier;

  let price = range.match(/Y|MAX/) ? currentPrice * 0.7 : currentPrice; // Start lower for long-term charts
  for (let i = dataPoints - 1; i >= 0; i--) {
    const ts = new Date(now);
    if (intervalType === 'minute') ts.setMinutes(ts.getMinutes() - i * intervalValue);
    if (intervalType === 'hour') ts.setHours(ts.getHours() - i * intervalValue);
    if (intervalType === 'day') ts.setDate(ts.getDate() - i * intervalValue);
    if (intervalType === 'week') ts.setDate(ts.getDate() - i * 7 * intervalValue);
    if (intervalType === 'month') ts.setMonth(ts.getMonth() - i * intervalValue);

    timestamps.push(Math.floor(ts.getTime() / 1000));

    const drift = (Math.random() - 0.5) * volatility;
    price = Math.max(price * (1 + drift), 1);

    closes.push(parseFloat(price.toFixed(2)));

    const open = price * (1 + (Math.random() - 0.5) * 0.01);
    opens.push(parseFloat(open.toFixed(2)));

    const high = Math.max(price, open) * (1 + Math.random() * 0.02);
    highs.push(parseFloat(high.toFixed(2)));

    const low = Math.min(price, open) * (1 - Math.random() * 0.02);
    lows.push(parseFloat(low.toFixed(2)));

    const volMultiplier = 0.8 + Math.random() * 0.5; // Add more volume randomness
    volumes.push(Math.floor(stock.avgVolume * volMultiplier));
  }

  closes[closes.length - 1] = currentPrice; // Last close = current price
  opens[opens.length - 1] = currentPrice * (1 + (Math.random() - 0.5) * 0.01);
  highs[highs.length - 1] = Math.max(closes[closes.length - 1], opens[opens.length - 1]) * (1 + Math.random() * 0.01);
  lows[lows.length - 1] = Math.min(closes[closes.length - 1], opens[opens.length - 1]) * (1 - Math.random() * 0.01);

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
export function searchMockStocks(keyword) {
  if (typeof keyword !== 'string' || keyword.trim().length < 1) {
    return [];
  }

  const searchTerm = keyword.trim().toLowerCase();

  return Object.entries(MOCK_STOCKS)
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
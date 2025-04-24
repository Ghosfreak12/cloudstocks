const AWS = require('aws-sdk');
const config = require('./aws-config');

// Configure AWS
AWS.config.update({
  region: config.REGION
});

// Initialize AWS services
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Stock data to load
const STOCKS = {
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

// Time ranges to generate
const RANGES = ['1d', '5d', '1m', '1y', '5y', '10y', 'max'];

// Generate historical data
function generateHistoricalData(symbol, range) {
  const stockData = STOCKS[symbol];
  const currentPrice = stockData.price;
  const volatility = 0.02;
  const timestamps = [];
  const prices = [];
  
  let dataPoints = 30;
  let intervalMinutes = 15;
  
  switch (range) {
    case '1d': dataPoints = 39; intervalMinutes = 10; break;
    case '5d': dataPoints = 32; intervalMinutes = 48; break;
    case '1m': dataPoints = 22; intervalMinutes = 24 * 60; break;
    case '1y': dataPoints = 52; intervalMinutes = 7 * 24 * 60; break;
    case '5y': dataPoints = 60; intervalMinutes = 30 * 24 * 60; break;
    case '10y': dataPoints = 120; intervalMinutes = 30 * 24 * 60; break;
    case 'max': dataPoints = 180; intervalMinutes = 30 * 24 * 60; break;
  }
  
  let lastPrice = currentPrice;
  const now = new Date();
  
  const priceMultiplier = range === '5y' || range === '10y' || range === 'max' ? 
    (currentPrice > stockData.low52Week * 1.3 ? 0.4 : 1.4) : 1;
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = new Date(now);
    timestamp.setMinutes(now.getMinutes() - (i * intervalMinutes));
    
    let adjustedPrice = currentPrice;
    if (range === '5y' || range === '10y' || range === 'max') {
      const progressFactor = i / dataPoints;
      adjustedPrice = currentPrice * (priceMultiplier * progressFactor + (1 - progressFactor));
    }
    
    const drift = (dataPoints - i) / dataPoints;
    const change = (Math.random() - 0.5) * volatility * drift;
    
    if (i === dataPoints - 1) {
      lastPrice = adjustedPrice;
    } else {
      lastPrice = lastPrice * (1 + change);
    }
    
    timestamps.push(Math.floor(timestamp.getTime() / 1000));
    prices.push(parseFloat(lastPrice.toFixed(2)));
  }

  prices[prices.length - 1] = currentPrice;
  
  return {
    t: timestamps,
    c: prices,
    o: prices.map(p => p * (1 + (Math.random() - 0.5) * 0.005)),
    h: prices.map(p => p * (1 + Math.random() * 0.01)),
    l: prices.map(p => p * (1 - Math.random() * 0.01)),
    v: Array(prices.length).fill(0).map(() => Math.floor(Math.random() * stockData.avgVolume))
  };
}

// Load stock data to DynamoDB
async function loadStocksToDynamoDB() {
  console.log('Loading stock data to DynamoDB...');
  
  try {
    for (const [symbol, stockData] of Object.entries(STOCKS)) {
      const params = {
        TableName: config.STOCK_TABLE,
        Item: {
          symbol,
          ...stockData
        }
      };
      
      await dynamoDB.put(params).promise();
      console.log(`Loaded data for ${symbol}`);
    }
    
    console.log('All stock data loaded to DynamoDB successfully!');
  } catch (error) {
    console.error('Error loading data to DynamoDB:', error);
    throw error;
  }
}

// Load historical data to S3
async function loadHistoricalDataToS3() {
  console.log('Loading historical data to S3...');
  
  try {
    for (const symbol of Object.keys(STOCKS)) {
      for (const range of RANGES) {
        const data = generateHistoricalData(symbol, range);
        
        const params = {
          Bucket: config.HISTORICAL_BUCKET,
          Key: `${symbol}/${range}.json`,
          Body: JSON.stringify(data),
          ContentType: 'application/json'
        };
        
        await s3.putObject(params).promise();
        console.log(`Loaded historical data for ${symbol} - ${range}`);
      }
    }
    
    console.log('All historical data loaded to S3 successfully!');
  } catch (error) {
    console.error('Error loading data to S3:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await loadStocksToDynamoDB();
    await loadHistoricalDataToS3();
    console.log('Data loading completed successfully!');
  } catch (error) {
    console.error('Data loading failed:', error);
    process.exit(1);
  }
}

// Run the script
main(); 
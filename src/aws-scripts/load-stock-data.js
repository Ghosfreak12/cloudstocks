const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if present
require('dotenv').config();

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Initialize AWS services
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Table and bucket names
const STOCK_TABLE = process.env.DYNAMODB_STOCK_TABLE || 'stock-data';
const HISTORICAL_BUCKET = process.env.S3_HISTORICAL_BUCKET || 'stock-historical-data';

// Sample stock data to load
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

/**
 * Generate historical data for a stock
 */
function generateHistoricalData(symbol, range) {
  const stockData = STOCKS[symbol];
  const currentPrice = stockData.price;
  const volatility = 0.02;
  const timestamps = [];
  const prices = [];
  
  // Determine data points and interval based on range
  let dataPoints = 30;
  let intervalMinutes = 15;
  
  switch (range) {
    case '1d':
      dataPoints = 39;
      intervalMinutes = 10;
      break;
    case '5d':
      dataPoints = 32;
      intervalMinutes = 48;
      break;
    case '1m':
      dataPoints = 22;
      intervalMinutes = 24 * 60;
      break;
    case '1y':
      dataPoints = 52;
      intervalMinutes = 7 * 24 * 60;
      break;
    case '5y':
      dataPoints = 60;
      intervalMinutes = 30 * 24 * 60;
      break;
    case '10y':
      dataPoints = 120;
      intervalMinutes = 30 * 24 * 60;
      break;
    case 'max':
      dataPoints = 180;
      intervalMinutes = 30 * 24 * 60;
      break;
  }
  
  // Generate price data
  let lastPrice = currentPrice;
  const now = new Date();
  
  // For longer timeframes, create more significant price history
  const priceMultiplier = range === '5y' || range === '10y' || range === 'max' ? 
    (currentPrice > stockData.low52Week * 1.3 ? 0.4 : 1.4) : 1;
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    // Create timestamps going back in time
    const timestamp = new Date(now);
    timestamp.setMinutes(now.getMinutes() - (i * intervalMinutes));
    
    // For longer timeframes, adjust starting point to be lower/higher
    let adjustedPrice = currentPrice;
    if (range === '5y' || range === '10y' || range === 'max') {
      const progressFactor = i / dataPoints;
      adjustedPrice = currentPrice * (priceMultiplier * progressFactor + (1 - progressFactor));
    }
    
    // Add some randomness
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

  // For the final data point, use the actual current price
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

/**
 * Load stock basic information into DynamoDB
 */
async function loadStocksToDynamoDB() {
  console.log('Loading stock data to DynamoDB...');
  
  try {
    // First check if table exists, if not create it
    const dynamoClient = new AWS.DynamoDB();
    try {
      await dynamoClient.describeTable({ TableName: STOCK_TABLE }).promise();
      console.log(`Table ${STOCK_TABLE} already exists.`);
    } catch (error) {
      if (error.code === 'ResourceNotFoundException') {
        console.log(`Creating table ${STOCK_TABLE}...`);
        const params = {
          TableName: STOCK_TABLE,
          KeySchema: [{ AttributeName: 'symbol', KeyType: 'HASH' }],
          AttributeDefinitions: [{ AttributeName: 'symbol', AttributeType: 'S' }],
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        };
        await dynamoClient.createTable(params).promise();
        console.log(`Waiting for table ${STOCK_TABLE} to be created...`);
        await dynamoClient.waitFor('tableExists', { TableName: STOCK_TABLE }).promise();
        console.log(`Table ${STOCK_TABLE} created.`);
      } else {
        throw error;
      }
    }
    
    // Now load the stock data
    for (const [symbol, data] of Object.entries(STOCKS)) {
      const params = {
        TableName: STOCK_TABLE,
        Item: {
          symbol,
          ...data
        }
      };
      
      await dynamoDB.put(params).promise();
      console.log(`Added ${symbol} to DynamoDB.`);
    }
    
    console.log('Successfully loaded stock data to DynamoDB.');
  } catch (error) {
    console.error('Error loading data to DynamoDB:', error);
  }
}

/**
 * Load historical data into S3
 */
async function loadHistoricalDataToS3() {
  console.log('Loading historical data to S3...');
  
  try {
    // Check if bucket exists, if not create it
    try {
      await s3.headBucket({ Bucket: HISTORICAL_BUCKET }).promise();
      console.log(`Bucket ${HISTORICAL_BUCKET} already exists.`);
    } catch (error) {
      if (error.statusCode === 404) {
        console.log(`Creating bucket ${HISTORICAL_BUCKET}...`);
        await s3.createBucket({ Bucket: HISTORICAL_BUCKET }).promise();
        console.log(`Bucket ${HISTORICAL_BUCKET} created.`);
      } else {
        throw error;
      }
    }
    
    // Generate and upload historical data for each stock and time range
    for (const symbol of Object.keys(STOCKS)) {
      for (const range of RANGES) {
        const data = generateHistoricalData(symbol, range);
        const params = {
          Bucket: HISTORICAL_BUCKET,
          Key: `${symbol}/${range}.json`,
          Body: JSON.stringify(data),
          ContentType: 'application/json'
        };
        
        await s3.putObject(params).promise();
        console.log(`Uploaded ${symbol}/${range}.json to S3.`);
      }
    }
    
    console.log('Successfully loaded historical data to S3.');
  } catch (error) {
    console.error('Error loading data to S3:', error);
  }
}

/**
 * Main function to run the data loading process
 */
async function main() {
  try {
    await loadStocksToDynamoDB();
    await loadHistoricalDataToS3();
    console.log('Data loading completed successfully!');
  } catch (error) {
    console.error('Error in data loading process:', error);
  }
}

// Run the main function
main(); 
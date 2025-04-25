const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Set AWS region
AWS.config.update({ region: 'us-east-1' });

// Initialize AWS services
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Table and bucket names
const STOCK_TABLE = 'stock-data';
const HISTORICAL_BUCKET = 'cloudstocks-historical-data';

// Sample stock data
const STOCKS = [
  {
    symbol: 'AAPL',
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
  {
    symbol: 'MSFT',
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
  {
    symbol: 'GOOGL',
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
  {
    symbol: 'AMZN',
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
  {
    symbol: 'META',
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
  {
    symbol: 'TSLA',
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
  {
    symbol: 'NVDA',
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
];

// Function to generate historical data
function generateHistoricalData(symbol, range, basePrice) {
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
  let lastPrice = basePrice;
  const now = new Date();
  
  // For longer timeframes, create more significant price history
  const priceMultiplier = range === '5Y' || range === '10Y' || range === 'MAX' ? 
    (basePrice > 100 ? 0.4 : 1.4) : 1;
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    // Create timestamps going back in time
    const timestamp = new Date(now);
    timestamp.setMinutes(now.getMinutes() - (i * intervalMinutes));
    
    // For longer timeframes, adjust starting point to be lower/higher 
    let adjustedPrice = basePrice;
    if (range === '5Y' || range === '10Y' || range === 'MAX') {
      const progressFactor = i / dataPoints; // 1 at the start, 0 at the end
      adjustedPrice = basePrice * (priceMultiplier * progressFactor + (1 - progressFactor));
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
  prices[prices.length - 1] = basePrice;
  
  return {
    symbol,
    timestamps,
    prices
  };
}

// Function to check if stock table exists
async function checkStockTable() {
  try {
    const result = await dynamoDB.scan({ TableName: STOCK_TABLE, Limit: 1 }).promise();
    console.log(`Found ${result.Count} items in DynamoDB table`);
    return result.Count > 0;
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      console.error(`Table ${STOCK_TABLE} does not exist. Please create it first.`);
      return false;
    }
    console.error('Error checking DynamoDB table:', error);
    return false;
  }
}

// Function to check if S3 bucket exists
async function checkS3Bucket() {
  try {
    await s3.headBucket({ Bucket: HISTORICAL_BUCKET }).promise();
    console.log(`S3 bucket ${HISTORICAL_BUCKET} exists`);
    return true;
  } catch (error) {
    if (error.code === 'NotFound' || error.code === 'NoSuchBucket') {
      console.error(`Bucket ${HISTORICAL_BUCKET} does not exist. Please create it first.`);
      return false;
    }
    console.error('Error checking S3 bucket:', error);
    return false;
  }
}

// Function to load stock data to DynamoDB
async function loadStocksToDynamoDB() {
  console.log(`Loading ${STOCKS.length} stocks to DynamoDB...`);
  
  for (const stock of STOCKS) {
    try {
      await dynamoDB.put({
        TableName: STOCK_TABLE,
        Item: stock
      }).promise();
      console.log(`Added stock ${stock.symbol} to DynamoDB`);
    } catch (error) {
      console.error(`Error adding stock ${stock.symbol} to DynamoDB:`, error);
    }
  }
}

// Function to load historical data to S3
async function loadHistoricalDataToS3() {
  console.log('Generating and uploading historical data to S3...');
  
  const ranges = ['1d', '5d', '1m', '1y', '5y', '10y', 'max'];
  
  for (const stock of STOCKS) {
    for (const range of ranges) {
      try {
        const historicalData = generateHistoricalData(stock.symbol, range, stock.price);
        
        await s3.putObject({
          Bucket: HISTORICAL_BUCKET,
          Key: `${stock.symbol}/${range}.json`,
          Body: JSON.stringify(historicalData),
          ContentType: 'application/json'
        }).promise();
        
        console.log(`Uploaded historical data for ${stock.symbol} (${range}) to S3`);
      } catch (error) {
        console.error(`Error uploading historical data for ${stock.symbol} (${range}) to S3:`, error);
      }
    }
  }
}

// Main function
async function main() {
  console.log('Checking DynamoDB and S3...');
  
  const tableHasData = await checkStockTable();
  const bucketExists = await checkS3Bucket();
  
  if (!bucketExists) {
    console.error('S3 bucket does not exist. Please create it first.');
    return;
  }
  
  if (!tableHasData) {
    console.log('DynamoDB table is empty or does not exist. Loading sample data...');
    await loadStocksToDynamoDB();
    await loadHistoricalDataToS3();
  } else {
    console.log('DynamoDB table already contains data. Skipping data load.');
    
    // Ask the user if they want to load the data anyway
    if (process.argv.includes('--force')) {
      console.log('Force flag detected. Loading sample data anyway...');
      await loadStocksToDynamoDB();
      await loadHistoricalDataToS3();
    }
  }
  
  console.log('Done!');
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
}); 
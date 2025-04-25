/**
 * Lambda function for retrieving stock data
 * Enhanced version with better error handling and logging
 */
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Table and bucket names
const STOCK_TABLE = process.env.STOCK_TABLE || 'stock-data';
const HISTORICAL_BUCKET = process.env.HISTORICAL_BUCKET || 'cloudstocks-historical-data';

// Utility function for logging
const log = (level, message, data) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data && { data })
  };
  console.log(JSON.stringify(logEntry));
};

// Utility function for standardized responses
const createResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
};

// Main handler function
exports.handler = async (event) => {
  // Special handling for permission testing
  if (event.testType === 'permissions') {
    return await testPermissions(event);
  }

  log('info', 'Lambda invocation started', { event });
  
  try {
    // Extract query parameters with fallbacks
    const queryParams = event.queryStringParameters || {};
    log('debug', 'Extracted query parameters', { queryParams });
    
    // Get symbol with case-insensitive matching
    const symbol = queryParams.symbol || queryParams.Symbol;
    
    // Get range with case-insensitive matching and default
    const range = (queryParams.range || queryParams.Range || '1m').toLowerCase();
    
    log('info', 'Processing request', { symbol, range });
    
    // Validate parameters
    if (!symbol) {
      log('warn', 'Missing required parameter: symbol');
      return createResponse(400, { 
        error: 'Symbol parameter is required',
        receivedParams: queryParams
      });
    }
    
    // Get stock info from DynamoDB
    log('debug', `Querying DynamoDB for symbol: ${symbol.toUpperCase()}`);
    let stockResult;
    try {
      stockResult = await dynamoDB.get({
        TableName: STOCK_TABLE,
        Key: { symbol: symbol.toUpperCase() }
      }).promise();
      
      log('debug', 'DynamoDB query result', { 
        hasData: !!stockResult.Item,
        itemKeys: stockResult.Item ? Object.keys(stockResult.Item) : null
      });
    } catch (dbError) {
      log('error', 'DynamoDB query failed', { error: dbError.message, stack: dbError.stack });
      return createResponse(500, { 
        error: 'Failed to retrieve stock data from database',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
    if (!stockResult.Item) {
      log('warn', `Stock symbol not found: ${symbol}`);
      return createResponse(404, { 
        noData: true, 
        error: `Stock symbol ${symbol} not found`
      });
    }
    
    // Get historical data from S3
    log('debug', `Fetching historical data from S3: ${symbol.toUpperCase()}/${range}.json`);
    let s3Result;
    try {
      s3Result = await s3.getObject({
        Bucket: HISTORICAL_BUCKET,
        Key: `${symbol.toUpperCase()}/${range}.json`
      }).promise();
      
      log('debug', 'S3 getObject result', { 
        contentLength: s3Result.ContentLength,
        contentType: s3Result.ContentType
      });
    } catch (s3Error) {
      log('error', 'S3 getObject failed', { error: s3Error.message, stack: s3Error.stack });
      
      if (s3Error.code === 'NoSuchKey') {
        return createResponse(404, { 
          noData: true, 
          error: `Historical data for ${symbol} with range ${range} not found`
        });
      }
      
      return createResponse(500, { 
        error: 'Failed to retrieve historical data',
        details: process.env.NODE_ENV === 'development' ? s3Error.message : undefined
      });
    }
    
    let historicalData;
    try {
      historicalData = JSON.parse(s3Result.Body.toString());
      log('debug', 'Parsed historical data', { 
        dataPoints: historicalData.timestamps ? historicalData.timestamps.length : 0
      });
    } catch (parseError) {
      log('error', 'Failed to parse historical data', { error: parseError.message });
      return createResponse(500, { 
        error: 'Invalid historical data format',
        details: process.env.NODE_ENV === 'development' ? parseError.message : undefined
      });
    }
    
    // Combine the data
    const responseData = {
      ...historicalData,
      currentPrice: stockResult.Item.price,
      change: stockResult.Item.change,
      changePercent: stockResult.Item.changePercent,
      companyName: stockResult.Item.name
    };
    
    log('info', 'Successfully processed request', { 
      symbol, 
      range,
      responseSize: JSON.stringify(responseData).length
    });
    
    return createResponse(200, responseData);
  } catch (error) {
    log('error', 'Unhandled exception in Lambda handler', { 
      error: error.message,
      stack: error.stack
    });
    
    return createResponse(500, { 
      error: 'Failed to fetch stock data. Please try again.',
      errorId: Date.now().toString(36)
    });
  }
};

// Function to test permissions (used by the verification script)
async function testPermissions(event) {
  const results = { success: true, tests: {} };
  
  // Test DynamoDB access if requested
  if (event.testDynamoDB) {
    try {
      const tableName = event.tableName || STOCK_TABLE;
      const dbResult = await dynamoDB.scan({ 
        TableName: tableName,
        Limit: 1 
      }).promise();
      
      results.tests.dynamoDB = { 
        success: true,
        itemCount: dbResult.Count
      };
    } catch (error) {
      results.success = false;
      results.tests.dynamoDB = { 
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }
  
  // Test S3 access if requested
  if (event.testS3) {
    try {
      const bucketName = event.bucketName || HISTORICAL_BUCKET;
      const s3Result = await s3.listObjectsV2({ 
        Bucket: bucketName,
        MaxKeys: 1
      }).promise();
      
      results.tests.s3 = { 
        success: true,
        objectCount: s3Result.Contents.length
      };
    } catch (error) {
      results.success = false;
      results.tests.s3 = { 
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }
  
  return createResponse(200, results);
} 
/**
 * Lambda function for searching stock symbols
 * Enhanced version with better error handling and logging
 */
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Table name
const STOCK_TABLE = process.env.STOCK_TABLE || 'stock-data';

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
  log('info', 'Lambda invocation started', { event });
  
  try {
    // Extract query parameters - support multiple parameter names
    const queryParams = event.queryStringParameters || {};
    log('debug', 'Extracted query parameters', { queryParams });
    
    // Look for keyword in multiple possible parameters
    const keyword = queryParams.query || 
                    queryParams.keyword || 
                    queryParams.q || 
                    queryParams.search || 
                    '';
    
    log('info', 'Processing search request', { keyword });
    
    // Return empty results for short or missing keywords
    if (!keyword || keyword.length < 2) {
      log('info', 'Search keyword too short, returning empty results');
      return createResponse(200, []);
    }
    
    // Query DynamoDB
    log('debug', `Searching for stocks matching: "${keyword}"`);
    let result;
    try {
      const params = {
        TableName: STOCK_TABLE,
        FilterExpression: "contains(#symbol, :keyword) OR contains(#name, :keyword)",
        ExpressionAttributeNames: {
          "#symbol": "symbol",
          "#name": "name"
        },
        ExpressionAttributeValues: {
          ":keyword": keyword.toUpperCase()
        }
      };
      
      result = await dynamoDB.scan(params).promise();
      
      log('debug', 'DynamoDB scan result', { 
        itemCount: result.Items.length,
        scannedCount: result.ScannedCount
      });
    } catch (dbError) {
      log('error', 'DynamoDB scan failed', { error: dbError.message, stack: dbError.stack });
      return createResponse(500, { 
        error: 'Failed to search stocks',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
    // Map results to required format
    const searchResults = result.Items.map(item => ({
      symbol: item.symbol,
      name: item.name
    }));
    
    log('info', 'Successfully processed search request', { 
      keyword, 
      resultsCount: searchResults.length
    });
    
    return createResponse(200, searchResults);
  } catch (error) {
    log('error', 'Unhandled exception in Lambda handler', { 
      error: error.message,
      stack: error.stack
    });
    
    return createResponse(500, { 
      error: 'Failed to search stocks. Please try again.',
      errorId: Date.now().toString(36)
    });
  }
}; 
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

const lambda = new AWS.Lambda();

// Test the getStockData Lambda function
async function testGetStockData() {
  console.log('\n--- Testing getStockData Lambda function ---');
  
  const payload = {
    queryStringParameters: {
      symbol: 'AAPL',
      range: '1m'
    }
  };
  
  try {
    const params = {
      FunctionName: 'getStockData',
      Payload: JSON.stringify(payload)
    };
    
    const response = await lambda.invoke(params).promise();
    console.log('Response StatusCode:', response.StatusCode);
    console.log('Response Payload:', response.Payload);
    
    // Parse the payload if it's valid JSON
    try {
      const parsedPayload = JSON.parse(response.Payload);
      console.log('Parsed Response:', JSON.stringify(parsedPayload, null, 2));
    } catch (e) {
      console.log('Could not parse Lambda response as JSON');
    }
    
    return response;
  } catch (error) {
    console.error('Error calling Lambda:', error);
  }
}

// Test the searchStocks Lambda function
async function testSearchStocks() {
  console.log('\n--- Testing searchStocks Lambda function ---');
  
  const payload = {
    queryStringParameters: {
      query: 'AAPL'
    }
  };
  
  try {
    const params = {
      FunctionName: 'searchStocks',
      Payload: JSON.stringify(payload)
    };
    
    const response = await lambda.invoke(params).promise();
    console.log('Response StatusCode:', response.StatusCode);
    console.log('Response Payload:', response.Payload);
    
    // Parse the payload if it's valid JSON
    try {
      const parsedPayload = JSON.parse(response.Payload);
      console.log('Parsed Response:', JSON.stringify(parsedPayload, null, 2));
    } catch (e) {
      console.log('Could not parse Lambda response as JSON');
    }
    
    return response;
  } catch (error) {
    console.error('Error calling Lambda:', error);
  }
}

// Run the tests
async function runTests() {
  await testSearchStocks();
  await testGetStockData();
}

// Save the payload for debugging/testing via AWS console
const fs = require('fs');
fs.writeFileSync(
  'payload.txt', 
  JSON.stringify({ queryStringParameters: { symbol: 'AAPL', range: '1m' } }, null, 2)
);

runTests(); 
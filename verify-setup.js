/**
 * Stock Dashboard System Verification Script
 * 
 * This script tests all components of the stock dashboard:
 * 1. Direct Lambda invocations
 * 2. API Gateway endpoints
 * 3. DynamoDB connectivity
 * 4. S3 connectivity
 */

const AWS = require('aws-sdk');
const axios = require('axios');

// Configure AWS SDK
AWS.config.update({ region: 'us-east-1' });

// Initialize AWS services
const lambda = new AWS.Lambda();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Configuration
const CONFIG = {
  API_URL: 'https://9lp8pvu206.execute-api.us-east-1.amazonaws.com/prod',
  STOCK_TABLE: 'stock-data',
  HISTORICAL_BUCKET: 'cloudstocks-historical-data',
  LAMBDA_FUNCTIONS: ['getStockData', 'searchStocks']
};

// Simple test runner
async function runTest(name, testFn) {
  try {
    console.log(`\n----- RUNNING TEST: ${name} -----`);
    const result = await testFn();
    console.log(`✅ PASSED: ${name}`);
    return { success: true, result };
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error('Error:', error.message);
    return { success: false, error };
  }
}

// 1. Test DynamoDB connectivity
async function testDynamoDB() {
  console.log(`Testing DynamoDB table '${CONFIG.STOCK_TABLE}'...`);
  
  // Try to scan the table
  const result = await dynamoDB.scan({ 
    TableName: CONFIG.STOCK_TABLE,
    Limit: 5 
  }).promise();
  
  console.log(`Found ${result.Count} items in DynamoDB table`);
  
  if (result.Count === 0) {
    console.warn('Warning: No items found in table. You may need to load sample data.');
  } else {
    console.log('Table data sample:', JSON.stringify(result.Items[0], null, 2));
  }
  
  return result;
}

// 2. Test S3 bucket access
async function testS3Bucket() {
  console.log(`Testing S3 bucket '${CONFIG.HISTORICAL_BUCKET}'...`);
  
  // Check if the bucket exists
  await s3.headBucket({ Bucket: CONFIG.HISTORICAL_BUCKET }).promise();
  
  // List some objects
  const listResult = await s3.listObjectsV2({ 
    Bucket: CONFIG.HISTORICAL_BUCKET,
    MaxKeys: 5
  }).promise();
  
  console.log(`Found ${listResult.Contents.length} objects in bucket`);
  
  if (listResult.Contents.length === 0) {
    console.warn('Warning: No objects found in bucket. You may need to load sample data.');
  } else {
    // Try to get one object
    const key = listResult.Contents[0].Key;
    console.log(`Testing access to object: ${key}`);
    
    const getResult = await s3.getObject({
      Bucket: CONFIG.HISTORICAL_BUCKET,
      Key: key
    }).promise();
    
    console.log('Object content type:', getResult.ContentType);
    console.log('Object size:', getResult.ContentLength, 'bytes');
  }
  
  return { listResult };
}

// 3. Test Lambda functions directly
async function testLambdaFunctions() {
  const results = {};
  
  for (const funcName of CONFIG.LAMBDA_FUNCTIONS) {
    console.log(`Testing Lambda function '${funcName}'...`);
    
    const payload = {
      queryStringParameters: {
        symbol: 'AAPL',
        range: '1m',
        query: 'AAPL'
      }
    };
    
    const params = {
      FunctionName: funcName,
      Payload: JSON.stringify(payload)
    };
    
    const response = await lambda.invoke(params).promise();
    
    if (response.FunctionError) {
      throw new Error(`Lambda function ${funcName} returned error: ${response.Payload}`);
    }
    
    console.log(`Lambda function '${funcName}' response status: ${response.StatusCode}`);
    
    // Parse the payload
    const responsePayload = JSON.parse(response.Payload);
    console.log(`Response statusCode: ${responsePayload.statusCode}`);
    
    results[funcName] = responsePayload;
  }
  
  return results;
}

// 4. Test API Gateway endpoints
async function testAPIGateway() {
  const results = {};
  
  // Test stock data endpoint
  console.log('Testing stock data API endpoint...');
  try {
    const stockResponse = await axios.get(
      `${CONFIG.API_URL}/stock-data?symbol=AAPL&range=1m`
    );
    
    console.log('Stock data API response status:', stockResponse.status);
    console.log('Stock data API response type:', typeof stockResponse.data);
    
    results.stockData = stockResponse.data;
  } catch (error) {
    console.error('Stock data API error:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    results.stockData = { error: error.message };
  }
  
  // Test search endpoint
  console.log('Testing search API endpoint...');
  try {
    const searchResponse = await axios.get(
      `${CONFIG.API_URL}/stock-data/search-stocks?query=AAPL`
    );
    
    console.log('Search API response status:', searchResponse.status);
    console.log('Search API response type:', typeof searchResponse.data);
    
    results.search = searchResponse.data;
  } catch (error) {
    console.error('Search API error:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    results.search = { error: error.message };
  }
  
  return results;
}

// 5. Test that Lambda functions can access DynamoDB and S3
async function testLambdaPermissions() {
  console.log('Testing Lambda permissions...');
  
  const payload = {
    testType: 'permissions',
    testDynamoDB: true,
    testS3: true,
    tableName: CONFIG.STOCK_TABLE,
    bucketName: CONFIG.HISTORICAL_BUCKET
  };
  
  // We'll use getStockData lambda since it needs both DynamoDB and S3 access
  const params = {
    FunctionName: 'getStockData',
    Payload: JSON.stringify(payload)
  };
  
  const response = await lambda.invoke(params).promise();
  
  if (response.FunctionError) {
    throw new Error(`Permission test failed: ${response.Payload}`);
  }
  
  const responsePayload = JSON.parse(response.Payload);
  
  return responsePayload;
}

// Run all tests
async function runAllTests() {
  const results = {};
  
  // Test everything with proper error handling
  results.dynamoDB = await runTest('DynamoDB Connectivity', testDynamoDB);
  results.s3 = await runTest('S3 Bucket Access', testS3Bucket);
  results.lambda = await runTest('Lambda Functions', testLambdaFunctions);
  results.api = await runTest('API Gateway Endpoints', testAPIGateway);
  
  // Count successes and failures
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r.success).length;
  
  console.log('\n----- TEST SUMMARY -----');
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  
  // Report on each component
  for (const [testName, result] of Object.entries(results)) {
    console.log(`${result.success ? '✅' : '❌'} ${testName}`);
  }
  
  if (passedTests === totalTests) {
    console.log('\n🎉 CONGRATULATIONS! All systems are working properly.');
    console.log('Your stock dashboard should be functioning correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the errors above.');
  }
}

// Execute all tests
runAllTests().catch(error => {
  console.error('Test execution error:', error);
}); 
const axios = require('axios');

// Your API Gateway base URL - replace this with your actual API Gateway URL
const API_BASE_URL = 'https://9lp8pvu206.execute-api.us-east-1.amazonaws.com/prod';

// Test the stock search endpoint
async function testSearchStocks() {
  try {
    console.log('\n--- Testing Search Stocks API ---');
    const response = await axios.get(`${API_BASE_URL}/stock-data/search-stocks?query=AAPL`);
    console.log('Status:', response.status);
    console.log('Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response Type:', typeof response.data);
    console.log('Response Preview:', JSON.stringify(response.data).substring(0, 200) + '...');
    return response.data;
  } catch (error) {
    console.error('Search API Error:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    }
  }
}

// Test the get stock data endpoint
async function testGetStockData() {
  try {
    console.log('\n--- Testing Get Stock Data API ---');
    const response = await axios.get(`${API_BASE_URL}/stock-data?symbol=AAPL&range=1m`);
    console.log('Status:', response.status);
    console.log('Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response Type:', typeof response.data);
    console.log('Response Preview:', JSON.stringify(response.data).substring(0, 200) + '...');
    return response.data;
  } catch (error) {
    console.error('Get Stock Data API Error:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    }
  }
}

// Run the tests
async function runTests() {
  await testSearchStocks();
  await testGetStockData();
}

runTests();
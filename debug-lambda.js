const AWS = require('aws-sdk');

// Simple Lambda function that logs and returns the event
exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  
  try {
    // Return the structure of the event for debugging
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Debug information',
        event: event,
        queryStringParameters: event.queryStringParameters,
        path: event.path,
        httpMethod: event.httpMethod,
        headers: event.headers
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Internal error' })
    };
  }
}; 
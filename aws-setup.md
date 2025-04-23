# AWS Integration Setup Guide for Stock Dashboard

This guide explains how to set up optional AWS integration for the Stock Dashboard application.

## Overview

The application works in two modes:
- **Local Mode**: Uses mock data (default in development)
- **AWS Mode**: Connects to AWS services (default in production)

You can run the application entirely with mock data without setting up AWS. This guide is for those who want to add AWS integration.

## AWS Services Used

1. **Amazon DynamoDB**
   - Used for storing basic stock information (current price, company name, etc.)
   - Pay only for what you use (read/write capacity units)

2. **Amazon S3**
   - Used for storing historical stock data
   - Very low-cost storage solution (fractions of a cent per GB)

3. **AWS Lambda**
   - Serverless functions to handle data retrieval
   - Acts as middleware between frontend and AWS data stores

4. **Amazon API Gateway**
   - Provides REST API endpoints for the frontend to access data
   - Manages CORS and request/response handling

## Setup Instructions

### 1. Create AWS Account and Setup IAM

1. Create an AWS account if you don't have one at [aws.amazon.com](https://aws.amazon.com/)
2. Create an IAM user with programmatic access
3. Attach policies: AmazonDynamoDBFullAccess, AmazonS3FullAccess, AWSLambdaFullAccess, AmazonAPIGatewayAdministrator

### 2. Set Up DynamoDB Table

1. Go to DynamoDB in AWS Console
2. Create a new table named `stock-data`
3. Use `symbol` as the partition key (type: String)
4. Configure capacity as needed (on-demand is simplest)

### 3. Set Up S3 Bucket

1. Go to S3 in AWS Console
2. Create a new bucket with a unique name (e.g., "your-name-stock-historical-data")
3. Block all public access (Lambda will access it privately)

### 4. Create Lambda Functions

#### Stock Data Retrieval Function

1. Create a new Lambda function named `getStockData`
2. Use Node.js runtime (14.x or newer)
3. Create a new role with permissions for DynamoDB and S3
4. Use this code:

```javascript
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Table and bucket names
const STOCK_TABLE = process.env.STOCK_TABLE || 'stock-data';
const HISTORICAL_BUCKET = process.env.HISTORICAL_BUCKET || 'your-bucket-name-here';

exports.handler = async (event) => {
    try {
        // Get symbol and range from querystring parameters
        const symbol = event.queryStringParameters?.symbol;
        const range = event.queryStringParameters?.range || '1m';
        
        if (!symbol) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Symbol parameter is required' })
            };
        }
        
        // Get stock info from DynamoDB
        const stockResult = await dynamoDB.get({
            TableName: STOCK_TABLE,
            Key: { symbol: symbol.toUpperCase() }
        }).promise();
        
        if (!stockResult.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    noData: true, 
                    error: `Stock symbol ${symbol} not found` 
                })
            };
        }
        
        // Get historical data from S3
        const s3Result = await s3.getObject({
            Bucket: HISTORICAL_BUCKET,
            Key: `${symbol.toUpperCase()}/${range.toLowerCase()}.json`
        }).promise();
        
        const historicalData = JSON.parse(s3Result.Body.toString());
        
        // Combine the data
        const responseData = {
            ...historicalData,
            currentPrice: stockResult.Item.price,
            change: stockResult.Item.change,
            changePercent: stockResult.Item.changePercent,
            companyName: stockResult.Item.name
        };
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(responseData)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Failed to fetch stock data. Please try again.' 
            })
        };
    }
};
```

5. Add environment variables:
   - STOCK_TABLE: stock-data
   - HISTORICAL_BUCKET: your-bucket-name-here

#### Stock Search Function

1. Create a new Lambda function named `searchStocks`
2. Use Node.js runtime (14.x or newer)
3. Create a new role with permissions for DynamoDB
4. Use this code:

```javascript
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Table name
const STOCK_TABLE = process.env.STOCK_TABLE || 'stock-data';

exports.handler = async (event) => {
    try {
        const keyword = event.queryStringParameters?.keyword;
        
        if (!keyword || keyword.length < 2) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([])
            };
        }
        
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
        
        const result = await dynamoDB.scan(params).promise();
        
        const searchResults = result.Items.map(item => ({
            symbol: item.symbol,
            name: item.name
        }));
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchResults)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Failed to search stocks.' })
        };
    }
};
```

5. Add environment variables:
   - STOCK_TABLE: stock-data

### 5. Create API Gateway

1. Go to API Gateway in AWS Console
2. Create a new REST API
3. Create two resources:
   - /stock-data (GET method)
   - /search-stocks (GET method)
4. Connect each resource to its respective Lambda function
5. Enable CORS for each method
6. Deploy the API to a stage (e.g., "prod")
7. Note the API Gateway URL

### 6. Load Data to AWS

Create a data loading script to populate your DynamoDB table and S3 bucket:

```javascript
// See the GitHub repository for the full sample script
// src/aws-scripts/load-stock-data.js
```

Run the script to load sample data:

```bash
node src/aws-scripts/load-stock-data.js
```

### 7. Update Frontend Configuration

Update the AWS API URL in your frontend code:

```javascript
// In src/services/stock-service.js
const CONFIG = {
  API_URL: 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod',
  FORCE_LOCAL_MODE: false
};
```

## Troubleshooting

### Common Issues

- **CORS errors**: Make sure CORS is enabled in API Gateway
- **Lambda timeouts**: Check Lambda execution time limits
- **"Symbol not found"**: Verify DynamoDB has the requested stock data
- **S3 access denied**: Check Lambda role permissions

### Debugging

- View CloudWatch logs for Lambda functions
- Use the API Gateway test feature to test endpoints
- Check network responses in browser developer tools

## Cost Optimization

- Use DynamoDB on-demand capacity
- Consider S3 Infrequent Access class for historical data
- Set up API Gateway usage plans to prevent abuse
- Monitor costs in AWS Cost Explorer 
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Table and bucket names
const STOCK_TABLE = process.env.STOCK_TABLE || 'stock-data';
const HISTORICAL_BUCKET = process.env.HISTORICAL_BUCKET || 'cloudstocks-historical-data';

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
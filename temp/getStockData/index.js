const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Table and bucket names
const STOCK_TABLE = process.env.STOCK_TABLE || 'stock-data';
const HISTORICAL_BUCKET = process.env.HISTORICAL_BUCKET || 'cloudstocks-historical-data';

exports.handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));
        
        // Get symbol and range from querystring parameters, support both casing variants
        const queryParams = event.queryStringParameters || {};
        
        // Try to find symbol parameter with case-insensitive matching
        const symbol = queryParams.symbol || queryParams.Symbol;
        
        // Try to find range parameter with case-insensitive matching
        const range = queryParams.range || queryParams.Range || '1m';
        
        console.log(`Requested stock data for: Symbol=${symbol}, Range=${range}`);
        
        if (!symbol) {
            console.log('Error: Symbol parameter is missing');
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
        console.log(`Querying DynamoDB for symbol: ${symbol.toUpperCase()}`);
        const stockResult = await dynamoDB.get({
            TableName: STOCK_TABLE,
            Key: { symbol: symbol.toUpperCase() }
        }).promise();
        
        if (!stockResult.Item) {
            console.log(`Error: Stock symbol ${symbol} not found in DynamoDB`);
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
        console.log(`Fetching historical data from S3: ${symbol.toUpperCase()}/${range.toLowerCase()}.json`);
        const s3Result = await s3.getObject({
            Bucket: HISTORICAL_BUCKET,
            Key: `${symbol.toUpperCase()}/${range.toLowerCase()}.json`
        }).promise();
        
        console.log('Successfully retrieved data from S3');
        
        const historicalData = JSON.parse(s3Result.Body.toString());
        
        // Combine the data
        const responseData = {
            ...historicalData,
            currentPrice: stockResult.Item.price,
            change: stockResult.Item.change,
            changePercent: stockResult.Item.changePercent,
            companyName: stockResult.Item.name
        };
        
        console.log('Returning combined response data');
        
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
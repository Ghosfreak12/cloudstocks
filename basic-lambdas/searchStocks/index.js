const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Table name
const STOCK_TABLE = process.env.STOCK_TABLE || 'stock-data';

exports.handler = async (event) => {
    try {
        console.log('Event:', JSON.stringify(event));
        
        const keyword = event.queryStringParameters?.keyword;
        console.log('Search keyword:', keyword);
        
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
        
        console.log('DynamoDB params:', JSON.stringify(params));
        const result = await dynamoDB.scan(params).promise();
        console.log('DynamoDB result:', JSON.stringify(result));
        
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
            body: JSON.stringify({ 
                error: 'Failed to search stocks.',
                details: error.message
            })
        };
    }
}; 
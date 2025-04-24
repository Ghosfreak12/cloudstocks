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
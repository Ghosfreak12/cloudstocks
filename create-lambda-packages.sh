#!/bin/bash

echo "Creating Lambda deployment packages with dependencies..."

# Create temporary directories for each Lambda function
mkdir -p tmp-lambda/getStockData
mkdir -p tmp-lambda/searchStocks

# Copy AWS SDK node_modules to each function directory
echo "Copying AWS SDK to function directories..."
cp -r lambda-base/node_modules tmp-lambda/getStockData/
cp -r lambda-base/node_modules tmp-lambda/searchStocks/

# Copy Lambda function code to each directory
echo "Copying Lambda function code..."
cp lambda-get-stock-data.js tmp-lambda/getStockData/index.js
cp lambda-search-stocks.js tmp-lambda/searchStocks/index.js

# Create the ZIP packages
echo "Creating getStockData ZIP package..."
cd tmp-lambda/getStockData
zip -r ../../getStockData-fixed.zip .
cd ../..

echo "Creating searchStocks ZIP package..."
cd tmp-lambda/searchStocks
zip -r ../../searchStocks-fixed.zip .
cd ../..

# Update Lambda functions
echo "Updating Lambda functions..."
aws lambda update-function-code --function-name getStockData --zip-file fileb://getStockData-fixed.zip --publish
aws lambda update-function-code --function-name searchStocks --zip-file fileb://searchStocks-fixed.zip --publish

# Create a new deployment for API Gateway
echo "Creating new API Gateway deployment..."
aws apigateway create-deployment --rest-api-id 9lp8pvu206 --stage-name prod

echo "Deployment completed. You can test the API now."

# Clean up temporary directory
rm -rf tmp-lambda 
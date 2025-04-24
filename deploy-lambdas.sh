#!/bin/bash

echo "Creating deployment packages for Lambda functions..."

# Create getStockData package
mkdir -p temp/getStockData
cp lambda-get-stock-data.js temp/getStockData/index.js
cd temp/getStockData
zip -r ../../getStockData-new.zip .
cd ../..

# Create searchStocks package
mkdir -p temp/searchStocks
cp lambda-search-stocks.js temp/searchStocks/index.js
cd temp/searchStocks
zip -r ../../searchStocks-new.zip .
cd ../..

# Deploy the functions
echo "Deploying getStockData function..."
aws lambda update-function-code --function-name getStockData --zip-file fileb://getStockData-new.zip --publish

echo "Deploying searchStocks function..."
aws lambda update-function-code --function-name searchStocks --zip-file fileb://searchStocks-new.zip --publish

# Create a new deployment for API Gateway
echo "Creating new API Gateway deployment..."
aws apigateway create-deployment --rest-api-id 9lp8pvu206 --stage-name prod

echo "Done! Lambda functions and API Gateway updated." 
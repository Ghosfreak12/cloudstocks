#!/bin/bash

# Exit on any error
set -e

echo "=== Stock Dashboard Deployment Script ==="
echo "This script will deploy the stable Lambda functions"

# Create deployment directory
DEPLOY_DIR="stable-deployment"
mkdir -p $DEPLOY_DIR
mkdir -p $DEPLOY_DIR/getStockData
mkdir -p $DEPLOY_DIR/searchStocks

# Install AWS SDK
echo "=== Installing AWS SDK ==="
cd $DEPLOY_DIR
npm init -y
npm install aws-sdk
cd ..

# Copy Lambda functions
echo "=== Preparing Lambda packages ==="
cp stable-get-stock-data.js $DEPLOY_DIR/getStockData/index.js
cp stable-search-stocks.js $DEPLOY_DIR/searchStocks/index.js

# Copy node_modules to Lambda directories
cp -r $DEPLOY_DIR/node_modules $DEPLOY_DIR/getStockData/
cp -r $DEPLOY_DIR/node_modules $DEPLOY_DIR/searchStocks/

# Create deployment packages
echo "=== Creating deployment packages ==="
cd $DEPLOY_DIR/getStockData
zip -r ../../getStockData-stable.zip .
cd ../../$DEPLOY_DIR/searchStocks
zip -r ../../searchStocks-stable.zip .
cd ../..

echo "=== Deploying Lambda functions ==="
echo "Deploying getStockData..."
aws lambda update-function-code \
  --function-name getStockData \
  --zip-file fileb://getStockData-stable.zip \
  --publish

echo "Deploying searchStocks..."
aws lambda update-function-code \
  --function-name searchStocks \
  --zip-file fileb://searchStocks-stable.zip \
  --publish

echo "=== Creating new API Gateway deployment ==="
aws apigateway create-deployment \
  --rest-api-id 9lp8pvu206 \
  --stage-name prod

echo "=== Setting Content Handling for integrations ==="
aws apigateway update-integration-response \
  --rest-api-id 9lp8pvu206 \
  --resource-id d0qlu4 \
  --http-method GET \
  --status-code 200 \
  --patch-operations op=replace,path=/contentHandling,value=CONVERT_TO_TEXT

# Clean up
echo "=== Cleaning up temporary files ==="
rm -rf $DEPLOY_DIR

echo "=== Deployment complete! ==="
echo "Run 'node verify-setup.js' to verify your setup" 
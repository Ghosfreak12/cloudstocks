#!/bin/bash

echo "Fixing API Gateway configuration..."

# Update integration response settings for all endpoints
echo "Setting contentHandling to CONVERT_TO_TEXT for stock-data endpoint..."
aws apigateway update-integration-response \
  --rest-api-id 9lp8pvu206 \
  --resource-id d0qlu4 \
  --http-method GET \
  --status-code 200 \
  --patch-operations op=replace,path=/contentHandling,value=CONVERT_TO_TEXT

echo "Setting contentHandling to CONVERT_TO_TEXT for search-stocks endpoint..."
aws apigateway update-integration-response \
  --rest-api-id 9lp8pvu206 \
  --resource-id jk2l43 \
  --http-method GET \
  --status-code 200 \
  --patch-operations op=replace,path=/contentHandling,value=CONVERT_TO_TEXT

echo "Creating a new deployment..."
aws apigateway create-deployment \
  --rest-api-id 9lp8pvu206 \
  --stage-name prod

echo "Done!" 
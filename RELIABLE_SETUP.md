# Stock Dashboard: Reliable Setup Guide

This guide provides a streamlined, reliable approach to setting up and deploying your Stock Dashboard application. It addresses common issues and provides a more robust implementation.

## Overview

The stock dashboard system consists of several components:

1. **Frontend**: React-based web application showing stock data
2. **AWS DynamoDB**: Stores stock information (current prices, metadata)
3. **AWS S3**: Stores historical stock data
4. **AWS Lambda Functions**: Backend code for retrieving and searching data
5. **AWS API Gateway**: HTTP endpoints to access Lambda functions

## Files in this Reliable Setup

- `verify-setup.js`: Tests all components of the system
- `stable-get-stock-data.js`: Robust Lambda function for retrieving stock data
- `stable-search-stocks.js`: Robust Lambda function for searching stocks
- `deploy-stable.sh`: Simplified deployment script
- `load-sample-data.js`: Script to load sample data into DynamoDB and S3

## Step 1: Verify Current Setup

Before making changes, run the verification script to identify potential issues:

```bash
npm install aws-sdk axios  # Install dependencies if needed
node verify-setup.js
```

This will check:
- DynamoDB table accessibility
- S3 bucket accessibility
- Lambda function execution
- API Gateway connectivity

## Step 2: Load Sample Data (If Needed)

If the verification shows no data in DynamoDB or S3, load sample data:

```bash
node load-sample-data.js
# To force loading data even if some exists
node load-sample-data.js --force
```

## Step 3: Deploy Robust Lambda Functions

The enhanced Lambda functions include:
- Better error handling
- Detailed logging
- Support for multiple parameter formats
- Consistent response formatting

Deploy them with:

```bash
chmod +x deploy-stable.sh
./deploy-stable.sh
```

## Step 4: Verify the New Setup

After deployment, run the verification script again to confirm everything is working:

```bash
node verify-setup.js
```

## Understanding the Robust Implementation

### Enhanced Lambda Functions

The robust Lambda functions include:

1. **Structured Logging**: JSON-formatted logs with timestamps and severity levels
2. **Error Handling**: Try/catch blocks around each AWS service call
3. **Input Validation**: More thorough checking of query parameters
4. **Response Standardization**: Consistent response format
5. **Permissions Testing**: Built-in capability to verify AWS service access

### API Gateway Configuration

The deployment script includes setting the Content-Handling property to CONVERT_TO_TEXT, which ensures that the Lambda response body is correctly passed through to the client without additional wrapping.

## Common Issues and Solutions

### Empty API Response

**Problem**: API returns empty results or `{}`
**Solution**: Make sure your integration response has contentHandling set to CONVERT_TO_TEXT

### "Cannot find module 'aws-sdk'"

**Problem**: Lambda function fails with module not found
**Solution**: The deployment script bundles aws-sdk with the Lambda package

### "Access Denied" for DynamoDB or S3

**Problem**: Lambda has insufficient permissions
**Solution**: Check IAM role attached to Lambda functions, ensure it has appropriate policies

### Local Development Mode

Your frontend will automatically fall back to local mode if the API calls fail. To force local mode, set `CONFIG.FORCE_LOCAL_MODE = true` in `src/services/stock-service.js`.

## Maintenance

### Updating Lambda Functions

If you need to modify the Lambda functions, edit the stable-*.js files and redeploy using the deploy-stable.sh script.

### Adding More Stock Data

Edit the STOCKS array in load-sample-data.js with additional stocks and run the script with the --force flag.

## Conclusion

This reliable setup approach addresses common issues with AWS Lambda and API Gateway integration. By using structured logging, proper error handling, and a verification script, you can more easily identify and resolve issues with your stock dashboard application.

Remember to run the verification script regularly to ensure all components of your system are working correctly. 
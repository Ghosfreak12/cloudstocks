# Stock Dashboard

A responsive, dark-mode stock dashboard application that works both locally and with AWS cloud services.

## Features

- 📈 Real-time stock data visualization
- 🔍 Stock symbol search
- 📱 Responsive design with dark mode
- ⏱️ Multiple time ranges (1D, 5D, 1M, 1Y, 5Y, 10Y, MAX)
- 🌐 Works both locally and with AWS integration

## Quick Start

### Running Locally

```bash
# Install dependencies
npm install

# Start development server (uses mock data)
npm run dev
```

The application will automatically use local mock data when running in development mode.

### Running with AWS Integration

The application can connect to your AWS backend when deployed to production.

1. Update the API Gateway URL in `src/services/stock-service.js`:

```javascript
const CONFIG = {
  // AWS API Gateway URL (if using AWS)
  API_URL: 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod',
  
  // Feature flag to force local mode even in production
  FORCE_LOCAL_MODE: false
};
```

2. Build and deploy to your preferred hosting (S3, Netlify, Vercel, etc.):

```bash
npm run build
```

## Implementation Details

### Automatic Environment Detection

The application automatically detects the environment:

- In **development mode** (localhost): Uses mock data
- In **production mode**: Uses AWS API

You can force local mode in production by setting `FORCE_LOCAL_MODE: true` in the config.

### Project Structure

- `src/services/stock-service.js` - Unified service that works locally and with AWS
- `src/pages/Dashboard.jsx` - Main dashboard component
- `src/components/SymbolSearch.jsx` - Search component for stocks

## AWS Setup (Optional)

If you want to use the AWS backend:

1. Create DynamoDB table for stock data
2. Create S3 bucket for historical data
3. Create Lambda functions for data access
4. Create API Gateway endpoints
5. Update the API URL in the config

Detailed AWS setup instructions can be found in `aws-setup.md`

## Customization

### Local Mode in Production

To force local mode even in production (useful for demos):

```javascript
// In src/services/stock-service.js
const CONFIG = {
  API_URL: '...',
  FORCE_LOCAL_MODE: true // Set this to true
};
```

### Adding More Stocks

To add more mock stocks, edit the `MOCK_STOCKS` object in `src/services/stock-service.js`.

## License

MIT 
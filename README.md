# Stock Market Dashboard

A React-based dashboard for tracking and visualizing stock market data.

## Features

- Search for stocks by symbol or name
- View real-time and historical stock data
- Interactive charts with multiple time ranges
- AWS mock data support for development and testing

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your Alpha Vantage API key:
   ```
   VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```
4. Start the development server: `npm start`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Data Sources

The application uses data sources in the following priority:

1. **Alpha Vantage API**: Primary data source for real-time stock data
2. **AWS Mock Data**: Used as fallback when the API is unavailable

## Configuration

You can configure the data source in `src/services/stock-service.js`:

```javascript
const CONFIG = {
  // Set to true to always use mock data instead of the API
  USE_MOCK_DATA: true
};
```

## Getting an API Key

1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Register for a free API key
3. Add it to your `.env` file

## Security Note

Never share your API keys or commit them to public repositories.

# Stock Market Dashboard

A React-based dashboard for tracking and visualizing stock market data.

## Features

- Search for stocks by symbol or name
- View real-time and historical stock data
- Interactive charts for visualizing price trends
- Configurable time ranges (daily, weekly, monthly, etc.)
- Mock data support for development and testing
- API request throttling (AWS Well-Architected [COST 9])

## Technologies Used

- React.js
- Recharts (for data visualization)
- Alpha Vantage API (for stock market data)
- Axios (for API requests)
- CSS for styling

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Create a `.env` file in the root directory and add your Alpha Vantage API key:
   ```
   REACT_APP_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Using the Dashboard

1. Use the search bar to find a stock by symbol or company name
2. Select a stock from the search results to view its chart
3. Use the time range selector to change the data timeframe (daily, weekly, monthly, etc.)

## Data Source Configuration

The application uses three data sources in the following priority:

1. **Alpha Vantage API**: Used when available and API calls have not reached their limit
2. **Mock Data**: Used as a fallback when the API is unavailable

You can configure the data source in `src/services/stock-service.js` by modifying the `CONFIG` object:

```javascript
const CONFIG = {
  // Alpha Vantage API key and URL
  ALPHA_VANTAGE_API_KEY: 'your_api_key_here',
  ALPHA_VANTAGE_API_URL: 'https://www.alphavantage.co/query',
  
  // Set to true to always use mock data instead of the API
  USE_MOCK_DATA: true
};
```

## AWS Well-Architected Framework Implementation

This project implements key principles from the AWS Well-Architected Framework:

### Security Pillar

**[SEC 3] Share resources securely with a third party**

The application implements secure resource sharing:

1. API keys are stored in environment variables for secure management
2. Sensitive configuration is kept out of source code
3. Environment variables are accessed at runtime
4. Default fallbacks prevent application failures

Benefits:
- Prevents exposing sensitive information
- Follows security best practices for API key management
- Enables secure deployment across environments
- Simplifies security auditing

### Cost Optimization Pillar

**[COST 9] Implement a buffer or throttle to manage demand**

The application implements request throttling in the API layer:

- Limits API requests to 5 per minute (Alpha Vantage free tier limit)
- Tracks request timestamps to implement a rolling window limit
- Returns graceful fallbacks when rate limits are reached
- Provides clear error messages to users when throttling occurs

Benefits:
- Prevents exceeding API rate limits and potential charges
- Ensures consistent application behavior under load
- Improves reliability by avoiding API provider blocks/bans
- Protects backend resources from excessive requests

## Obtaining an API Key

To use the Alpha Vantage API with this application:

1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Register for a free API key
3. Add the key to your `.env` file as described above

## API Key Security

For secure API key management:

1. Create a `.env` file in the root directory with your API keys:
   ```
   VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```
2. The `.env` file is included in `.gitignore` to prevent accidentally committing sensitive information

**Never share your API keys or commit them to public repositories.**

## License

This project is licensed under the MIT License. 
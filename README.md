# Stock Market Dashboard

A React-based dashboard for tracking and visualizing stock market data.

## Features

- Search for stocks by symbol or name
- View real-time and historical stock data
- Interactive charts for visualizing price trends
- Configurable time ranges (daily, weekly, monthly, etc.)

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

## Obtaining an API Key

To use this application, you'll need an Alpha Vantage API key:

1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Register for a free API key
3. Add the key to your `.env` file as described above

## License

This project is licensed under the MIT License. 
/**
 * Dashboard Component
 * Main dashboard for displaying stock data
 */
import React, { useState } from 'react';
import SearchBar from './SearchBar';
import StockChart from './StockChart';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedRange, setSelectedRange] = useState('1d'); // Default to daily data

  // Handle stock symbol selection
  const handleSymbolSelect = (symbol) => {
    setSelectedSymbol(symbol);
  };

  // Handle range selection
  const handleRangeChange = (e) => {
    setSelectedRange(e.target.value);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Stock Market Dashboard</h1>
        <SearchBar onSymbolSelect={handleSymbolSelect} />
      </header>

      <main className="dashboard-content">
        {!selectedSymbol ? (
          <div className="welcome-message">
            <h2>Welcome to the Stock Dashboard</h2>
            <p>Search for a stock symbol above to view its data</p>
          </div>
        ) : (
          <>
            <div className="chart-controls">
              <div className="range-selector">
                <label htmlFor="range-select">Time Range:</label>
                <select 
                  id="range-select" 
                  value={selectedRange} 
                  onChange={handleRangeChange}
                >
                  <option value="1d">Daily</option>
                  <option value="1w">Weekly</option>
                  <option value="1m">Monthly</option>
                  <option value="3m">3 Months</option>
                  <option value="1y">1 Year</option>
                </select>
              </div>
            </div>
            
            <div className="chart-container">
              <StockChart 
                symbol={selectedSymbol} 
                range={selectedRange}
              />
            </div>
          </>
        )}
      </main>

      <footer className="dashboard-footer">
        <p>Data provided by Alpha Vantage</p>
      </footer>
    </div>
  );
};

export default Dashboard; 
/**
 * StockChart Component
 * Displays stock price data in a chart
 */
import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { fetchStockData } from '../services/stock-service.js';

const StockChart = ({ symbol, range }) => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data when symbol or range changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!symbol) {
          setStockData(null);
          setLoading(false);
          return;
        }
        
        const data = await fetchStockData(symbol, range);
        
        // Check if we got valid data back
        if (data.noData || data.error) {
          setError(data.error || 'No data available for this symbol');
          setStockData(null);
        } else {
          setStockData(data);
        }
        
      } catch (err) {
        console.error('Error loading stock data:', err);
        setError('Failed to load stock data. Please try again.');
        setStockData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [symbol, range]);

  // Render loading state
  if (loading) {
    return <div className="loading">Loading stock data...</div>;
  }

  // Render error state
  if (error) {
    return <div className="error">{error}</div>;
  }

  // Render empty state
  if (!stockData) {
    return <div className="empty-state">No stock data to display</div>;
  }

  // Render chart
  return (
    <div className="stock-chart">
      <h2>{stockData.symbol} Stock Price</h2>
      <div className="chart-container">
        {/* D3 chart will be rendered here */}
        {stockData.data.length > 0 ? (
          <D3StockChart data={stockData.data} />
        ) : (
          <div className="empty-chart">No data points available</div>
        )}
      </div>
    </div>
  );
};

/**
 * D3 Stock Chart Component
 * Renders a stock price chart using D3
 */
const D3StockChart = ({ data }) => {
  const chartRef = React.useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear any existing chart
    d3.select(chartRef.current).selectAll('*').remove();

    // Chart dimensions
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (time)
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)))
      .range([0, width]);

    // Y scale (price)
    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.low) * 0.95, // Add some padding
        d3.max(data, d => d.high) * 1.05
      ])
      .range([height, 0]);

    // Line generator for closing prices
    const line = d3.line()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.close));

    // Draw axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    // Draw line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    // Optional: Add dots for data points
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(new Date(d.date)))
      .attr('cy', d => y(d.close))
      .attr('r', 3)
      .attr('fill', 'steelblue');

  }, [data]);

  return <div ref={chartRef}></div>;
};

export default StockChart; 
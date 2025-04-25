/**
 * CloudStocks: A Real-Time Stock Market Dashboard on AWS
 * Author: Rishal Khatri
 *
 * Objective:
 * CloudStocks provides real-time and historical stock data through a serverless AWS architecture.
 * It is designed to support 100 users with <500ms latency, deployed by the end of the semester.
 *
 * SMART Goals:
 * - Specific: Real-time & historical stock dashboard on AWS.
 * - Measurable: <500ms latency for 100 users.
 * - Achievable: Serverless AWS architecture.
 * - Relevant: Course-aligned AWS solution.
 * - Time-bound: Complete by semester end.
 *
 * AWS Well-Architected Integration Notes:
 * - [SEC 2] Secure API Gateway V2 with IAM Identity Center (for real use).
 * - [REL 3] Lambda, API Gateway, and DynamoDB across two regions (planned).
 * - [PERF 3] Optimized DynamoDB <500ms latency (planned).
 * - [COST 9] Serverless architecture for cost-efficiency.
 * - [OPS 8] CloudWatch alerts for latency issues (future integration).
 */

import React, { useEffect, useState } from 'react'
import { fetchStockData, searchStockSymbols } from '../services/simplified-service'
import SymbolSearch from '../components/SymbolSearch'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ReferenceLine, Area, ComposedChart
} from 'recharts'

// Updated time range options to include 5Y and 10Y
const RANGES = ['1D', '5D', '1M', '1Y', '5Y', '10Y', 'MAX']

// Helper function for date formatting based on the selected range
const formatDate = (timestamp, range) => {
  const date = new Date(timestamp * 1000);
  
  switch(range) {
    case '1D':
    case '5D':
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case '1M':
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    case '1Y':
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    case '5Y':
    case '10Y':
    case 'MAX':
      return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
    default:
      return date.toLocaleDateString();
  }
};

// Format currency with proper commas and decimal places
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-gray-800 p-3 border border-gray-700 rounded shadow-md">
        <p className="font-semibold text-gray-200">{label}</p>
        <p className="text-blue-400 font-bold">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [symbol, setSymbol] = useState('AAPL')
  const [range, setRange] = useState('1M')
  const [stockData, setStockData] = useState([])
  const [stockInfo, setStockInfo] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Function to handle symbol selection
  const handleSelectSymbol = (newSymbol) => {
    if (newSymbol && newSymbol.trim() !== '') {
      setSymbol(newSymbol.trim().toUpperCase())
      setError(null)
    }
  }

  // Function to handle range selection
  const handleSelectRange = (newRange) => {
    if (newRange && RANGES.includes(newRange)) {
      setRange(newRange)
      setError(null)
    }
  }

  // Fetch stock data whenever symbol or range changes
  useEffect(() => {
    // Ensure symbol is not empty or just whitespace
    const trimmedSymbol = symbol?.trim()
    if (!trimmedSymbol) {
      setError('Symbol parameter is required')
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)
    
    console.log(`Starting data fetch for ${trimmedSymbol} with range ${range}`)
    
    const fetchData = async () => {
      try {
        console.log(`Fetching data for ${trimmedSymbol} with range ${range}`)
        const data = await fetchStockData(trimmedSymbol, range)
        
        // Don't update state if component unmounted
        if (!isMounted) return
        
        console.log('Received data:', data)
        
        if (data.noData || data.error) {
          console.error('Error in data response:', data.error)
          setError(data.error || 'No data available for this symbol and range.')
          setStockData([])
          setStockInfo(null)
          return
        }
        
        // Verify we have data to display
        if (!data.t || data.t.length === 0) {
          setError('No price data available for this symbol and range.')
          setStockData([])
          return
        }
        
        // Format data for the chart - simple and safe
        const formatted = []
        for (let i = 0; i < data.t.length; i++) {
          formatted.push({
            time: formatDate(data.t[i], range),
            timestamp: data.t[i],
            price: data.c[i] || 0,
            open: data.o[i] || 0,
            high: data.h[i] || 0,
            low: data.l[i] || 0,
            volume: data.v[i] || 0
          })
        }

        console.log(`Formatted ${formatted.length} data points`)
        setStockData(formatted)
        
        // Set stock info with proper fallbacks for all values
        setStockInfo({
          price: data.currentPrice || 0,
          change: data.change || 0,
          changePercent: data.changePercent || 0,
          name: data.companyName || trimmedSymbol
        })
      } catch (err) {
        if (isMounted) {
          console.error('Error in fetchData:', err)
          setError('Failed to fetch stock data. Please try again.')
          setStockData([])
          setStockInfo(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false // Prevent state updates if component unmounts
    }
  }, [symbol, range])

  // Calculate min and max price for chart scaling
  const minPrice = stockData.length > 0 ? Math.min(...stockData.map(d => d.price)) * 0.995 : 0;
  const maxPrice = stockData.length > 0 ? Math.max(...stockData.map(d => d.price)) * 1.005 : 0;
  const priceChange = stockInfo?.change || 0;
  const lineColor = priceChange >= 0 ? '#22c55e' : '#ef4444';
  const gradientStart = priceChange >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
  const gradientEnd = 'rgba(18, 24, 38, 0)';

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto bg-gray-900 min-h-screen text-gray-200">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-blue-700 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-100">Stock Dashboard</h1>
        </div>
        
        <div className="bg-gray-800 shadow-sm rounded-lg p-4 mb-6 border border-gray-700">
          <SymbolSearch onSelect={handleSelectSymbol} />
        </div>
        
        <div className="bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-700">
          <h2 className="text-sm uppercase text-gray-400 mb-2 font-medium">Time Range</h2>
          <div className="flex gap-2 flex-wrap">
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => handleSelectRange(r)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  r === range 
                    ? 'bg-blue-700 text-white font-medium shadow-sm' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading && (
        <div className="flex justify-center items-center h-40 bg-gray-800 rounded-lg shadow-sm mb-6 border border-gray-700">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 bg-blue-800 rounded-full mb-2"></div>
            <div className="h-4 w-32 bg-gray-700 rounded mb-1"></div>
            <div className="h-3 w-24 bg-gray-700 rounded"></div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-6 py-5 rounded-lg shadow-sm mb-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {!loading && !error && stockInfo && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm mb-6 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">{stockInfo.name} <span className="text-gray-400">({symbol})</span></h2>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-bold">{formatCurrency(stockInfo.price)}</span>
                <div className={`flex items-center text-lg font-medium ${stockInfo.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stockInfo.change >= 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                    </svg>
                  )}
                  {stockInfo.change >= 0 ? '+' : ''}{stockInfo.change.toFixed(2)} ({stockInfo.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap md:justify-end items-center gap-4">
              <div className="bg-gray-700 rounded-lg px-4 py-2">
                <div className="text-sm text-gray-400">Range: {range}</div>
                <div className="text-sm font-medium">
                  {stockData.length > 0 && formatDate(stockData[0].timestamp, range)} - {stockData.length > 0 && formatDate(stockData[stockData.length-1].timestamp, range)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!loading && !error && stockData.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm p-4 md:p-6">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={stockData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradientStart} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={gradientEnd} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#374151" strokeDasharray="5 5" />
              <XAxis 
                dataKey="time" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                domain={[minPrice, maxPrice]} 
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                padding={{ top: 10, bottom: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={stockInfo?.price} stroke="#6b7280" strokeDasharray="3 3" />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={lineColor}
                fillOpacity={1}
                fill="url(#colorPrice)" 
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={lineColor} 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 6, stroke: '#1f2937', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
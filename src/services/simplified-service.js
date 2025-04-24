/**
 * Simplified Stock Service
 * Uses Alpha Vantage for real market data
 */

import { fetchStockData as fetchAlphaVantageData, searchStockSymbols as searchAlphaVantageSymbols } from './alpha-vantage-service';

/**
 * Simplified fetchStockData - uses Alpha Vantage API
 */
export const fetchStockData = async (symbol, range) => {
  console.log('Using Alpha Vantage stock data service');
  return fetchAlphaVantageData(symbol, range);
};

/**
 * Simplified searchStockSymbols - uses Alpha Vantage API
 */
export const searchStockSymbols = async (keyword) => {
  console.log('Using Alpha Vantage stock search service');
  return searchAlphaVantageSymbols(keyword);
}; 
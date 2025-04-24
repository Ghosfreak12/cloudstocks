/**
 * Simplified Stock Service
 * Uses mock data implementation only
 */

import { fetchStockData as fetchMockData, searchStockSymbols as searchMockSymbols } from './mock-stock-service';

/**
 * Simplified fetchStockData - uses only mock implementation
 */
export const fetchStockData = async (symbol, range) => {
  console.log('Using simplified mock-only stock data service');
  return fetchMockData(symbol, range);
};

/**
 * Simplified searchStockSymbols - uses only mock implementation
 */
export const searchStockSymbols = async (keyword) => {
  console.log('Using simplified mock-only stock search service');
  return searchMockSymbols(keyword);
}; 
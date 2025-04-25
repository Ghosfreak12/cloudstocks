/**
 * CloudStocks: A Real-Time Stock Market Dashboard on AWS
 * Author: Rishal Khatri
 *
 * Simplified Stock Service
 * Acts as a bridge to the actual stock service implementation
 */

import { fetchStockData as fetchStockDataImpl, searchStockSymbols as searchStockSymbolsImpl } from './stock-service';

/**
 * Simplified fetchStockData - delegates to implementation
 */
export const fetchStockData = async (symbol, range) => {
  return fetchStockDataImpl(symbol, range);
};

/**
 * Simplified searchStockSymbols - delegates to implementation
 */
export const searchStockSymbols = async (keyword) => {
  return searchStockSymbolsImpl(keyword);
}; 
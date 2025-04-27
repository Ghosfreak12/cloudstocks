/**
 * Simplified Stock Data Service
 * 
 * This service is the entry point for UI components,
 * connecting them to the layered architecture underneath.
 * 
 * Architecture layers:
 * 1. UI Components (React components)
 * 2. Simplified Service (this file - public API for UI)
 * 3. Business Logic Layer (stock-service-gateway.js)
 * 4. Security/Network Layer (api-security-layer.js)
 * 5. Data Access Layer (stock-service.js)
 */

import { fetchStockData as fetchGatewayStockData, searchStockSymbols as searchGatewayStockSymbols } from './stock-service-gateway';

/**
 * Fetch stock data for a given symbol and time range
 * This is the simplified public API for UI components
 */
export const fetchStockData = async (symbol, range) => {
  return fetchGatewayStockData(symbol, range);
};

/**
 * Search for stock symbols by keyword
 * This is the simplified public API for UI components
 */
export const searchStockSymbols = async (keyword) => {
  return searchGatewayStockSymbols(keyword);
}; 
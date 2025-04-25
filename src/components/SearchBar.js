/**
 * SearchBar Component
 * Allows users to search for stocks by symbol or name
 */
import React, { useState, useEffect, useRef } from 'react';
import { searchStockSymbols } from '../services/stock-service.js';

const SearchBar = ({ onSymbolSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchBarRef = useRef(null);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    // Set a timeout to avoid making too many API calls while typing
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };
  
  // Search for stock symbols
  const performSearch = async (term) => {
    if (term.length < 2) return;
    
    try {
      setLoading(true);
      const results = await searchStockSymbols(term);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle selecting a result
  const handleResultSelect = (symbol) => {
    onSymbolSelect(symbol);
    setSearchTerm(symbol);
    setShowResults(false);
  };

  // Handle clicks outside the search bar to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-bar-container" ref={searchBarRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search for a stock (e.g., AAPL, MSFT)..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowResults(searchTerm.length >= 2)}
        />
        {loading && <div className="search-loader"></div>}
      </div>
      
      {showResults && (
        <div className="search-results">
          {searchResults.length === 0 ? (
            <div className="no-results">No matching stocks found</div>
          ) : (
            <ul>
              {searchResults.map((result, index) => (
                <li
                  key={index}
                  onClick={() => handleResultSelect(result.symbol)}
                  className="search-result-item"
                >
                  <span className="result-symbol">{result.symbol}</span>
                  <span className="result-name">{result.name}</span>
                  <span className="result-region">{result.region}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 
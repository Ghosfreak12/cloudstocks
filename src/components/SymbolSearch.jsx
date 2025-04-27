import React, { useState, useEffect } from 'react'
import { searchStockSymbols } from '../services/simplified-service'
import debounce from 'lodash.debounce'

export default function SymbolSearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const debouncedSearch = debounce(async (q) => {
    if (q.length < 2) return setResults([])
    setIsLoading(true)
    setError(null)
    
    try {
      const symbols = await searchStockSymbols(q)
      setResults(symbols)
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, 300)

  useEffect(() => {
    debouncedSearch(query)
    return debouncedSearch.cancel
  }, [query])

  return (
    <div className="relative w-full">
      <input
        className="bg-gray-700 border-gray-600 text-gray-200 px-3 py-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search symbol"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isLoading}
      />
      
      {isLoading && (
        <div className="mt-2 text-gray-400">
          Loading...
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-red-400 p-2 border border-red-700 rounded bg-red-900">
          {error.includes('API rate limit') ? (
            <div>
              <p>{error}</p>
              <p className="text-sm mt-1">Consider switching to a different API provider with higher rate limits.</p>
            </div>
          ) : (
            error
          )}
        </div>
      )}
      
      {results.length > 0 && !error && (
        <ul className="absolute bg-gray-800 border border-gray-700 mt-1 w-full z-10 max-h-48 overflow-auto rounded shadow-lg">
          {results.map(r => (
            <li
              key={r.symbol}
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-gray-200"
              onClick={() => {
                onSelect(r.symbol)
                setQuery(r.symbol)
                setResults([])
              }}
            >
              {r.symbol} — {r.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
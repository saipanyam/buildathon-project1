import React, { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface CompactSearchInterfaceProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isSearching: boolean;
  hasResults: boolean;
  totalResults: number;
}

const CompactSearchInterface: React.FC<CompactSearchInterfaceProps> = ({ 
  onSearch, 
  onClear, 
  isSearching, 
  hasResults,
  totalResults
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsExpanded(false);
    onClear();
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    onSearch(term);
    setIsExpanded(false);
  };

  return (
    <div className="flex items-center justify-between">
      {/* Left side - Results count */}
      <div className="text-sm text-gray-400">
        {totalResults} visual {totalResults === 1 ? 'memory' : 'memories'}
        {hasResults && <span className="ml-2 text-red-400">• Search active</span>}
      </div>

      {/* Right side - Compact search */}
      <div className="relative">
        {!isExpanded ? (
          /* Compact Search Button */
          <div className="flex items-center gap-2">
            {hasResults && (
              <button
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded"
              >
                Clear search
              </button>
            )}
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 rounded-lg transition-all text-gray-300 hover:text-white"
              title="Search within results"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search</span>
            </button>
          </div>
        ) : (
          /* Expanded Search Form */
          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-600 rounded-lg p-2">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in results..."
                className="w-64 px-3 py-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
                disabled={isSearching}
                autoFocus
              />
              
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="flex items-center justify-center w-8 h-8 bg-red-600 hover:bg-red-700 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Quick Search Suggestions - Only when expanded */}
        {isExpanded && (
          <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg z-10 w-72">
            <p className="text-xs text-gray-400 mb-2">Quick searches:</p>
            <div className="flex flex-wrap gap-1">
              {[
                'buttons', 'forms', 'error', 'login', 
                'dashboard', 'chart', 'table', 'menu'
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => handleQuickSearch(term)}
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactSearchInterface;
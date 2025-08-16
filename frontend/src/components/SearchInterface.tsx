import React, { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isSearching: boolean;
  hasResults: boolean;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ 
  onSearch, 
  onClear, 
  isSearching, 
  hasResults 
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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && query.trim()) {
      // If expanding and there's a query, auto-search
      setTimeout(() => onSearch(query.trim()), 100);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-red-500" />
          Search Visual Memories
        </h2>
        
        {hasResults && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Search
          </button>
        )}
      </div>

      <div className="relative">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          {/* Search Input - Expandable */}
          <div className={`relative flex-1 transition-all duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
          }`}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by text content, visual elements, or descriptions..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              disabled={isSearching}
            />
            
            {/* Search suggestions/tips */}
            {isExpanded && !query && (
              <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-gray-800 border border-gray-600 rounded-lg text-xs text-gray-400">
                <p className="mb-1">💡 <strong>Search tips:</strong></p>
                <ul className="space-y-1 ml-4">
                  <li>• "login button" - Find UI elements</li>
                  <li>• "error message" - Search for text content</li>
                  <li>• "red" - Find by visual characteristics</li>
                  <li>• "dashboard" - Search by content type</li>
                </ul>
              </div>
            )}
          </div>

          {/* Search Button - Always visible */}
          <button
            type={isExpanded ? "submit" : "button"}
            onClick={isExpanded ? undefined : toggleExpanded}
            disabled={isSearching || (isExpanded && !query.trim())}
            className={`relative flex items-center justify-center transition-all duration-300 ${
              isExpanded 
                ? 'px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg'
                : 'w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full'
            } disabled:opacity-50 disabled:cursor-not-allowed group`}
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className={`transition-all ${isExpanded ? 'w-5 h-5 mr-2' : 'w-6 h-6'}`} />
                {isExpanded && <span className="font-medium">Search</span>}
              </>
            )}
            
            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Click to search
              </div>
            )}
          </button>

          {/* Collapse button when expanded */}
          {isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-3 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>

        {/* Search Status */}
        {isSearching && (
          <div className="mt-4 flex items-center gap-2 text-sm text-yellow-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Searching through visual memories...
          </div>
        )}
      </div>

      {/* Quick Search Options */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Quick searches:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'buttons', 'text fields', 'error messages', 'navigation', 
              'forms', 'charts', 'icons', 'screenshots'
            ].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  onSearch(term);
                  setIsExpanded(false);
                }}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;
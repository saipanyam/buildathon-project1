import React from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSearch, isSearching }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        {/* Netflix-style glowing background effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 group-focus-within:opacity-40 transition duration-500" />
        
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder='Search your visual memories: "error message", "blue button", "dashboard"...'
            className="w-full px-8 py-4 pl-14 pr-32 text-lg bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all shadow-2xl"
            disabled={isSearching}
          />
          
          {/* Search icon with animated background */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <div className="relative">
              <div className="absolute -inset-1 bg-red-500 rounded-full blur opacity-30 animate-pulse" />
              <Search className="relative w-5 h-5 text-red-500" />
            </div>
          </div>
          
          {/* Enhanced search button */}
          <button
            type="submit"
            disabled={isSearching || !value.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full font-bold hover:from-red-700 hover:to-red-600 focus:ring-2 focus:ring-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-red-500/25 transform hover:scale-105 active:scale-95"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          Search through your extracted visual memories using natural language
        </p>
      </div>
    </div>
  );
};

export default SearchBar;
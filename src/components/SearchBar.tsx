import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full px-4 md:px-0">
      <div className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-10 md:h-12 px-10 md:px-12 bg-black/40 backdrop-blur-md rounded-full border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm md:text-base"
          placeholder="アニメを検索..."
        />
        <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4 md:w-5 md:h-5" />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        )}
      </div>
    </form>
  );
};
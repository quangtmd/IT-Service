
import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
  initialTerm?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Tìm kiếm...", className = "", initialTerm = "" }) => {
  const [term, setTerm] = useState(initialTerm);

  useEffect(() => {
    setTerm(initialTerm);
  }, [initialTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(term);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center w-full ${className}`}>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="flex-grow p-3 bg-white border border-borderStrong text-textBase rounded-l-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm placeholder-textSubtle"
      />
      <button
        type="submit"
        className="bg-primary text-white p-3 rounded-r-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        aria-label="Tìm kiếm"
      >
        <i className="fas fa-search"></i>
      </button>
    </form>
  );
};

export default SearchBar;

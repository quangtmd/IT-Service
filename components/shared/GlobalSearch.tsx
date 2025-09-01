import React, { useState } from 'react';

interface GlobalSearchProps {
  onSearch: (searchTerm: string) => void;
  className?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSearch, className = "" }) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      onSearch(term.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center w-full max-w-xl mx-auto ${className}`}>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Tìm kiếm sản phẩm, dịch vụ, bài viết..."
        className="flex-grow px-4 py-2.5 bg-neutral-700 bg-opacity-50 border border-neutral-600 text-neutral-100 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm placeholder-neutral-400 text-sm"
      />
      <button
        type="submit"
        className="bg-primary text-white px-4 py-2.5 rounded-r-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        aria-label="Search"
      >
        <i className="fas fa-search"></i>
      </button>
    </form>
  );
};

export default GlobalSearch;
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import * as Constants from '../../constants';

interface HeaderSearchBarProps {
    className?: string;
    variant?: 'default' | 'glass';
}

const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({ className = '', variant = 'default' }) => {
    const navigate = ReactRouterDOM.useNavigate();
    const location = ReactRouterDOM.useLocation();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isFocused, setIsFocused] = useState(false);

    // Sync state with URL query params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        // Only update if we are on the shop page to avoid clearing search term on other pages
        if (location.pathname.startsWith('/shop')) {
            setSearchTerm(params.get('q') || '');
            setSelectedCategory(params.get('mainCategory') || 'all');
        } else {
            setSearchTerm('');
            setSelectedCategory('all');
        }
    }, [location.search, location.pathname]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
            params.set('q', searchTerm.trim());
        }
        if (selectedCategory !== 'all') {
            params.set('mainCategory', selectedCategory);
        }
        navigate(`/shop?${params.toString()}`);
    };

    const containerClasses = variant === 'glass' 
        ? `flex w-full rounded-full overflow-hidden transition-all duration-300 border ${isFocused ? 'bg-white/10 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-white/5 border-white/10 hover:border-white/30'}`
        : "flex w-full bg-white rounded-md overflow-hidden shadow-sm h-11 border border-transparent focus-within:border-primary";

    const selectClasses = variant === 'glass'
        ? "h-full pl-4 pr-8 text-sm text-gray-300 bg-transparent border-r border-white/10 focus:outline-none appearance-none hover:text-white transition-colors cursor-pointer"
        : "h-full pl-4 pr-8 text-sm text-gray-700 bg-gray-100 border-r border-gray-300 focus:outline-none appearance-none hover:bg-gray-200 transition-colors";

    const inputClasses = variant === 'glass'
        ? "flex-grow p-2 pl-4 text-sm text-white placeholder-gray-400 bg-transparent focus:outline-none"
        : "flex-grow p-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset";

    const buttonClasses = variant === 'glass'
        ? `px-5 transition-colors focus:outline-none flex items-center justify-center ${isFocused ? 'bg-cyan-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`
        : "bg-primary text-white px-5 hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary";

    return (
        <form 
            onSubmit={handleSearch} 
            className={`${containerClasses} ${className} h-10 md:h-11 relative`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        >
            <div className="relative h-full">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={selectClasses}
                    aria-label="Chọn danh mục"
                    style={{ maxWidth: '160px' }}
                >
                    <option value="all" className="text-black">Tất cả</option>
                    {Constants.PRODUCT_CATEGORIES_HIERARCHY.filter(cat => cat.slug !== 'pc_xay_dung').map(cat => (
                        <option key={cat.slug} value={cat.slug} className="text-black">{cat.name}</option>
                    ))}
                </select>
                <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${variant === 'glass' ? 'text-gray-400' : 'text-gray-700'}`}>
                    <i className="fas fa-chevron-down text-[10px]"></i>
                </div>
            </div>
            
            <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className={inputClasses}
            />
            
            <button type="submit" className={buttonClasses} aria-label="Tìm kiếm">
                <i className="fas fa-search"></i>
            </button>
        </form>
    );
};

export default HeaderSearchBar;
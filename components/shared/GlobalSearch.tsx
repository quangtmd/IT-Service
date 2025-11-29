
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Constants from '../../constants';

const HeaderSearchBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
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

    return (
        <form 
            onSubmit={handleSearch} 
            className={`flex w-full relative group transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}
        >
            {/* Animated Border Glow */}
            <div className={`absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-lg opacity-30 blur-[2px] group-hover:opacity-70 transition-opacity duration-500 ${isFocused ? 'opacity-100 blur-[4px]' : ''}`}></div>

            <div className="relative flex w-full bg-slate-900 rounded-lg items-center overflow-hidden border border-cyan-500/30">
                
                {/* Category Select (Styled) */}
                <div className="relative h-full border-r border-white/10 bg-slate-800/50">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-full pl-3 pr-8 text-xs font-bold text-gray-300 bg-transparent focus:outline-none appearance-none cursor-pointer hover:text-white transition-colors uppercase tracking-wide font-mono"
                        aria-label="Chọn danh mục"
                    >
                        <option value="all" className="bg-slate-900 text-gray-300">ALL</option>
                        {Constants.PRODUCT_CATEGORIES_HIERARCHY.filter(cat => cat.slug !== 'pc_xay_dung').map(cat => (
                            <option key={cat.slug} value={cat.slug} className="bg-slate-900 text-gray-300">{cat.name}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cyan-500">
                        <i className="fas fa-caret-down text-xs"></i>
                    </div>
                </div>

                {/* Search Input */}
                <div className="flex-grow relative">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="TÌM KIẾM SẢN PHẨM..."
                        className="w-full p-2.5 pl-4 bg-transparent text-sm font-medium text-white placeholder-gray-500 focus:outline-none font-mono"
                    />
                    {/* Blinking Cursor Effect if empty and focused (simulated) */}
                    {isFocused && !searchTerm && (
                         <span className="absolute top-1/2 left-4 -translate-y-1/2 w-2 h-4 bg-cyan-500/50 animate-pulse pointer-events-none"></span>
                    )}
                </div>

                {/* Search Button */}
                <button 
                    type="submit" 
                    className="px-5 h-full bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-400 hover:text-cyan-200 transition-all duration-300 border-l border-white/10 flex items-center justify-center group/btn" 
                    aria-label="Tìm kiếm"
                >
                    <i className="fas fa-search text-sm group-hover/btn:scale-110 group-hover/btn:text-white transition-transform"></i>
                </button>
            </div>
        </form>
    );
};

export default HeaderSearchBar;

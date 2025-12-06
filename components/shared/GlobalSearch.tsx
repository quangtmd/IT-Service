import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import * as Constants from '../../constants';

const HeaderSearchBar: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const location = ReactRouterDOM.useLocation();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

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

    return (
        <form onSubmit={handleSearch} className="flex w-full bg-white rounded-md overflow-hidden shadow-sm h-11">
            <div className="relative">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-full pl-4 pr-8 text-sm text-gray-700 bg-gray-100 border-r border-gray-300 focus:outline-none appearance-none hover:bg-gray-200 transition-colors"
                    aria-label="Chọn danh mục"
                >
                    <option value="all">Tất cả danh mục</option>
                    {Constants.PRODUCT_CATEGORIES_HIERARCHY.filter(cat => cat.slug !== 'pc_xay_dung').map(cat => (
                        <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <i className="fas fa-chevron-down text-xs"></i>
                </div>
            </div>
            <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên sản phẩm, mã sản phẩm, từ khóa cần tìm..."
                className="flex-grow p-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
            />
            <button type="submit" className="bg-primary text-white px-5 hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary" aria-label="Tìm kiếm">
                <i className="fas fa-search"></i>
            </button>
        </form>
    );
};

export default HeaderSearchBar;
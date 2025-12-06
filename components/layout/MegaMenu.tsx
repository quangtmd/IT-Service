import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Constants from '../../constants';
import { MainCategoryInfo } from '../../types';

const MegaMenu: React.FC = () => {
  const categories = Constants.PRODUCT_CATEGORIES_HIERARCHY.filter(cat => cat.slug !== 'pc_xay_dung');
  // Set the first category as active by default to avoid a blank panel on initial hover
  const [activeCategory, setActiveCategory] = useState<MainCategoryInfo | null>(categories[0] || null);
  const location = useLocation();
  const isActive = location.pathname.startsWith('/shop') || location.pathname.startsWith('/product');

  if (categories.length === 0) {
    return (
       <Link
        to="/shop"
        className="nav-link-item"
      >
        <i className="fas fa-store mr-2"></i>
        <span>Sản phẩm</span>
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        to="/shop"
        className={`nav-link-item ${isActive ? 'active' : ''}`}
        onMouseEnter={() => setActiveCategory(categories[0])} 
      >
        <i className="fas fa-store mr-2"></i>
        <span>Sản phẩm</span>
        <i className="fas fa-chevron-down text-xs ml-2 transition-transform duration-200 group-hover:rotate-180"></i>
      </Link>
      
      {/* Mega Menu Panel */}
      <div className="mega-menu-panel absolute top-full left-1/2 -translate-x-1/2 mt-2 w-auto min-w-[700px] bg-white rounded-lg shadow-2xl hidden group-hover:block transition-all duration-300 ease-in-out z-50">
        <div className="flex">
          {/* Left Panel: Main Categories */}
          <div className="w-1/3 bg-gray-50/50 rounded-l-lg border-r border-gray-200 p-4">
            <ul className="space-y-1">
              {categories.map(category => (
                <li key={category.slug}>
                  <Link
                    to={`/shop?mainCategory=${category.slug}`}
                    className={`flex items-center w-full text-left p-3 rounded-md text-sm font-medium transition-colors ${activeCategory?.slug === category.slug ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-200/50'}`}
                    onMouseEnter={() => setActiveCategory(category)}
                  >
                    <i className={`${category.icon || 'fas fa-tag'} w-6 text-center mr-3 text-primary/80`}></i>
                    <span className="flex-grow">{category.name}</span>
                    <i className="fas fa-chevron-right text-xs text-gray-400"></i>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Panel: Sub-Categories */}
          <div className="w-2/3 p-6">
            {activeCategory ? (
              <div>
                <h3 className="text-lg font-semibold text-textBase mb-4 border-b border-gray-200 pb-2">
                  {activeCategory.name}
                </h3>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {activeCategory.subCategories.map(subCategory => (
                    <li key={subCategory.slug}>
                      <Link
                        to={`/shop?mainCategory=${activeCategory.slug}&subCategory=${subCategory.slug}`}
                        className="text-sm text-textMuted hover:text-primary transition-colors block p-1"
                      >
                        {subCategory.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
                <div className="flex items-center justify-center h-full text-textMuted">
                    <p>Rê chuột qua một danh mục để xem chi tiết.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
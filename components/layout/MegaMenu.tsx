
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
    <div className="group relative h-full flex items-center">
      <Link
        to="/shop"
        className={`nav-link-item ${isActive ? 'active' : ''}`}
        onMouseEnter={() => setActiveCategory(categories[0])} 
      >
        <i className="fas fa-store mr-2"></i>
        <span>Sản phẩm</span>
        <i className="fas fa-chevron-down text-xs ml-2 transition-transform duration-200 group-hover:rotate-180"></i>
      </Link>
      
      {/* Mega Menu Panel - Centered relative to parent link */}
      <div className="mega-menu-panel absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[800px] bg-bgBase rounded-b-lg shadow-2xl hidden group-hover:block transition-all duration-300 ease-in-out z-[60] border border-borderDefault">
        <div className="flex">
          {/* Left Panel: Main Categories */}
          <div className="w-1/3 bg-bgMuted rounded-bl-lg border-r border-borderDefault p-4">
            <ul className="space-y-1">
              {categories.map(category => (
                <li key={category.slug}>
                  <Link
                    to={`/shop?mainCategory=${category.slug}`}
                    className={`flex items-center w-full text-left p-3 rounded-md text-sm font-medium transition-colors ${activeCategory?.slug === category.slug ? 'bg-primary/10 text-primary' : 'text-textBase hover:bg-gray-200/50 dark:hover:bg-slate-600/50'}`}
                    onMouseEnter={() => setActiveCategory(category)}
                  >
                    <i className={`${category.icon || 'fas fa-tag'} w-6 text-center mr-3 text-primary/80`}></i>
                    <span className="flex-grow">{category.name}</span>
                    <i className="fas fa-chevron-right text-xs text-textSubtle"></i>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Panel: Sub-Categories */}
          <div className="w-2/3 p-6 bg-bgBase rounded-br-lg">
            {activeCategory ? (
              <div>
                <h3 className="text-lg font-semibold text-textBase mb-4 border-b border-borderDefault pb-2 flex items-center">
                  <i className={`${activeCategory.icon} mr-2 text-primary`}></i>
                  {activeCategory.name}
                </h3>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {activeCategory.subCategories.map(subCategory => (
                    <li key={subCategory.slug}>
                      <Link
                        to={`/shop?mainCategory=${activeCategory.slug}&subCategory=${subCategory.slug}`}
                        className="text-sm text-textMuted hover:text-primary transition-colors block p-1 hover:translate-x-1 duration-200"
                      >
                        {subCategory.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-borderDefault">
                    <Link to={`/shop?mainCategory=${activeCategory.slug}`} className="text-primary text-sm font-medium hover:underline">
                        Xem tất cả sản phẩm thuộc {activeCategory.name} <i className="fas fa-arrow-right ml-1"></i>
                    </Link>
                </div>
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

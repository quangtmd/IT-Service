
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Constants from '../../constants';
import { MainCategoryInfo } from '../../types';

const MegaMenu: React.FC = () => {
  const categories = Constants.PRODUCT_CATEGORIES_HIERARCHY.filter(cat => cat.slug !== 'pc_xay_dung');
  const [activeCategory, setActiveCategory] = useState<MainCategoryInfo | null>(categories[0] || null);
  const location = useLocation();
  const isActive = location.pathname.startsWith('/shop') || location.pathname.startsWith('/product');

  if (categories.length === 0) {
    return (
       <Link
        to="/shop"
        className="relative h-full px-6 flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-cyan-300 transition-colors"
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
        className={`relative h-full px-6 flex items-center text-xs font-bold uppercase tracking-widest transition-all duration-300 
            ${isActive ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-300'}
        `}
        onMouseEnter={() => setActiveCategory(categories[0])} 
      >
         {/* Active/Hover Indicator */}
         <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_10px_cyan] transform transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100 ${isActive ? 'scale-x-100' : ''}`}></span>

        <i className="fas fa-layer-group mr-2 text-sm group-hover:animate-pulse"></i>
        <span>Sản phẩm</span>
        <i className="fas fa-chevron-down text-[9px] ml-1.5 opacity-70 transition-transform duration-300 group-hover:rotate-180 group-hover:text-cyan-400"></i>
      </Link>
      
      {/* Mega Menu Panel */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[1px] w-[900px] hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 perspective-1000">
        
        {/* Main Container */}
        <div className="w-full bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 shadow-[0_10px_50px_rgba(0,0,0,0.8)] rounded-b-xl overflow-hidden flex relative">
            
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

            {/* Left Sidebar: Categories */}
            <div className="w-1/3 bg-black/40 border-r border-white/5 p-2">
                <ul className="space-y-1">
                {categories.map(category => (
                    <li key={category.slug}>
                    <Link
                        to={`/shop?mainCategory=${category.slug}`}
                        className={`flex items-center w-full text-left p-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 border border-transparent
                            ${activeCategory?.slug === category.slug 
                                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                        `}
                        onMouseEnter={() => setActiveCategory(category)}
                    >
                        <div className={`w-6 text-center mr-3 text-base ${activeCategory?.slug === category.slug ? 'text-cyan-400' : 'text-gray-600'}`}>
                             <i className={`${category.icon || 'fas fa-cube'}`}></i>
                        </div>
                        <span className="flex-grow">{category.name}</span>
                        {activeCategory?.slug === category.slug && <i className="fas fa-caret-right text-cyan-500 animate-pulse"></i>}
                    </Link>
                    </li>
                ))}
                </ul>
            </div>

            {/* Right Content Area: Sub-Categories */}
            <div className="w-2/3 p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] relative">
                {/* Tech Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                
                {activeCategory ? (
                <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center mb-6 border-b border-white/10 pb-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 mr-4 shadow-lg">
                            <i className={`${activeCategory.icon} text-2xl text-cyan-400`}></i>
                        </div>
                        <div>
                             <h3 className="text-xl font-black text-white uppercase tracking-tight">{activeCategory.name}</h3>
                             <p className="text-[10px] text-cyan-500/70 font-mono mt-0.5">CATEGORY_ID: {activeCategory.slug.toUpperCase()}</p>
                        </div>
                    </div>

                    <ul className="grid grid-cols-2 gap-4 flex-grow content-start">
                    {activeCategory.subCategories.map(subCategory => (
                        <li key={subCategory.slug}>
                        <Link
                            to={`/shop?mainCategory=${activeCategory.slug}&subCategory=${subCategory.slug}`}
                            className="group/item flex items-center text-sm text-gray-400 hover:text-white transition-colors p-2 rounded hover:bg-white/5 border border-transparent hover:border-white/10"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-700 mr-3 group-hover/item:bg-cyan-400 transition-colors shadow-[0_0_5px_rgba(6,182,212,0)] group-hover/item:shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                            {subCategory.name}
                        </Link>
                        </li>
                    ))}
                    </ul>
                    
                    <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
                        <Link to={`/shop?mainCategory=${activeCategory.slug}`} className="inline-flex items-center text-xs font-bold text-cyan-400 hover:text-white transition-colors uppercase tracking-widest group/link">
                            Xem toàn bộ <i className="fas fa-arrow-right ml-2 transform group-hover/link:translate-x-1 transition-transform"></i>
                        </Link>
                    </div>
                </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                        <i className="fas fa-mouse-pointer text-4xl mb-4 opacity-50 animate-bounce"></i>
                        <p className="text-xs font-mono uppercase">Select a Module to Initialize</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;

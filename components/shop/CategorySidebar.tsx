
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Link is compatible with v6/v7
import * as Constants from '../../constants.tsx';
import Button from '../ui/Button';

interface CategorySidebarProps {
  onCategorySelect: (mainCategorySlug: string | null, subCategorySlug: string | null) => void;
  currentMainCategorySlug: string | null;
  currentSubCategorySlug: string | null;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  onCategorySelect,
  currentMainCategorySlug,
  currentSubCategorySlug
}) => {
  const [expandedMainCategory, setExpandedMainCategory] = useState<string | null>(currentMainCategorySlug);

  const handleMainCategoryClick = (slug: string) => {
    setExpandedMainCategory(prev => (prev === slug ? null : slug)); 
    onCategorySelect(slug, null); 
  };

  const handleSubCategoryClick = (mainSlug: string, subSlug: string) => {
    setExpandedMainCategory(mainSlug); 
    onCategorySelect(mainSlug, subSlug);
  };

  const handleAllProductsClick = () => {
    setExpandedMainCategory(null);
    onCategorySelect(null, null);
  };

  return (
    <div className="bg-bgBase rounded-lg shadow-md border border-borderDefault h-full flex flex-col">
      <div className="bg-primary text-white p-3 flex items-center rounded-t-lg">
        <i className="fas fa-bars mr-3 text-xl"></i>
        <h2 className="text-lg font-semibold">DANH MỤC SẢN PHẨM</h2>
      </div>
      <nav className="flex-grow p-3 space-y-1 overflow-y-auto">
        <button
            onClick={handleAllProductsClick}
            className={`w-full flex items-center py-2 px-3 rounded-md text-sm transition-colors duration-150
                        ${!currentMainCategorySlug ? 'bg-primary/10 text-primary font-semibold' : 'text-textMuted hover:bg-gray-100 hover:text-primary'}`}
        >
            <i className="fas fa-th-large mr-3 w-5 text-center"></i>
            Tất cả sản phẩm
        </button>

        {Constants.PRODUCT_CATEGORIES_HIERARCHY.filter(cat => cat.name !== "PC Xây Dựng").map((mainCat) => (
          <div key={mainCat.slug}>
            <button
              onClick={() => handleMainCategoryClick(mainCat.slug)}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-md text-sm transition-colors duration-150
                          ${currentMainCategorySlug === mainCat.slug && !currentSubCategorySlug ? 'bg-primary/10 text-primary font-semibold' : 'text-textMuted hover:bg-gray-100 hover:text-primary'}`}
            >
              <div className="flex items-center">
                <i className={`${mainCat.icon || 'fas fa-folder'} mr-3 w-5 text-center text-base ${currentMainCategorySlug === mainCat.slug ? 'text-primary' : 'text-textSubtle'}`}></i>
                {mainCat.name}
              </div>
              {mainCat.subCategories.length > 0 && (
                <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${expandedMainCategory === mainCat.slug ? 'rotate-180' : ''}`}></i>
              )}
            </button>
            {expandedMainCategory === mainCat.slug && mainCat.subCategories.length > 0 && (
              <ul className="pl-6 mt-1 space-y-0.5 border-l-2 border-gray-200 ml-2.5">
                {mainCat.subCategories.map((subCat) => (
                  <li key={subCat.slug}>
                    <button
                      onClick={() => handleSubCategoryClick(mainCat.slug, subCat.slug)}
                      className={`w-full text-left py-1.5 px-2 rounded-md text-xs transition-colors duration-150
                                  ${currentSubCategorySlug === subCat.slug && currentMainCategorySlug === mainCat.slug ? 'text-primary font-semibold bg-primary/5' : 'text-textMuted hover:text-primary hover:bg-primary/5'}`}
                    >
                      {subCat.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
         <div className="pt-2 mt-2 border-t border-borderDefault">
            <Link
                to="/shop?promo=true" 
                className="w-full flex items-center py-2 px-3 rounded-md text-sm transition-colors duration-150 text-textMuted hover:bg-gray-100 hover:text-primary"
            >
                <i className="fas fa-tags mr-3 w-5 text-center text-primary"></i>
                Tin Khuyến mãi
            </Link>
        </div>
      </nav>
      <div className="p-3 border-t border-borderDefault">
        <Button variant="primary" className="w-full">
          <i className="fas fa-fire mr-2"></i> SẢN PHẨM BÁN CHẠY
        </Button>
      </div>
    </div>
  );
};

export default CategorySidebar;

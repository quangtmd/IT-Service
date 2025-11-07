
import React from 'react';
import { Link } from 'react-router-dom';
import * as Constants from '../../constants.tsx';
import Button from '../ui/Button';

interface CategorySidebarProps {
  currentMainCategorySlug: string | null;
  currentSubCategorySlug: string | null;
  isCollapsed: boolean;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  currentMainCategorySlug,
  currentSubCategorySlug,
  isCollapsed
}) => {
  return (
    <div className={`bg-bgBase rounded-lg shadow-md border border-borderDefault h-full flex flex-col overflow-hidden ${isCollapsed ? 'is-collapsed' : ''}`}>
      <div className="bg-primary text-white p-4 flex items-center rounded-t-lg"> {/* Increased padding for header */}
        <i className="fas fa-bars mr-3 text-xl"></i>
        <h2 className="text-lg font-bold sidebar-header-text">DANH MỤC SẢN PHẨM</h2> {/* Bold font */}
      </div>
      <nav className="flex-grow p-3 space-y-1 overflow-y-auto">
        <Link
            to="/shop"
            className={`w-full flex items-center py-2 px-3 rounded-md text-sm transition-colors duration-150
                        ${!currentMainCategorySlug && !currentSubCategorySlug ? 'bg-primary/10 text-primary font-semibold' : 'text-textMuted hover:bg-gray-100 hover:text-primary'}`}
        >
            <i className="fas fa-th-large mr-3 w-5 text-center"></i>
            <span className="sidebar-item-label">Tất cả sản phẩm</span>
        </Link>

        {Constants.PRODUCT_CATEGORIES_HIERARCHY.filter(cat => cat.name !== "PC Xây Dựng").map((mainCat) => (
          <div key={mainCat.slug} className="group relative">
            <Link
              to={`/shop?mainCategory=${mainCat.slug}`}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-md text-sm transition-colors duration-150
                          ${currentMainCategorySlug === mainCat.slug && !currentSubCategorySlug ? 'bg-primary/10 text-primary font-semibold' : 'text-textMuted hover:bg-gray-100 hover:text-primary'}`}
            >
              <div className="flex items-center">
                <i className={`${mainCat.icon || 'fas fa-folder'} mr-3 w-5 text-center text-base ${currentMainCategorySlug === mainCat.slug ? 'text-primary' : 'text-textSubtle'}`}></i>
                <span className="sidebar-item-label">{mainCat.name}</span>
              </div>
              {mainCat.subCategories.length > 0 && (
                <i className={`fas fa-chevron-right text-xs transition-transform duration-200 lg:group-hover:translate-x-1`}></i>
              )}
            </Link>
            
            {/* Flyout Panel for Desktop */}
            {mainCat.subCategories.length > 0 && (
              <div className="flyout-panel absolute left-full top-0 w-64 bg-white rounded-r-lg shadow-lg border border-gray-200 p-4 hidden lg:group-hover:block z-20">
                <h4 className="font-bold text-primary mb-2 text-base">{mainCat.name}</h4>
                <ul className="space-y-1">
                  {mainCat.subCategories.map(subCat => (
                    <li key={subCat.slug}>
                      <Link to={`/shop?mainCategory=${mainCat.slug}&subCategory=${subCat.slug}`} className={`block text-sm p-1.5 rounded-md ${currentSubCategorySlug === subCat.slug ? 'text-primary font-semibold' : 'text-textMuted hover:text-primary'}`}>
                        {subCat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
         <div className="pt-2 mt-2 border-t border-borderDefault">
            <Link
                to="/shop?tags=Khuyến%20mãi"
                className="w-full flex items-center py-2 px-3 rounded-md text-sm transition-colors duration-150 text-textMuted hover:bg-gray-100 hover:text-primary"
            >
                <i className="fas fa-tags mr-3 w-5 text-center text-primary"></i>
                <span className="sidebar-item-label">Tin Khuyến mãi</span>
            </Link>
        </div>
      </nav>
       <div className="p-4 border-t border-borderDefault"> {/* Increased padding for footer */}
        <Link to="/shop?tags=Bán%20chạy">
            <Button variant="primary" className="w-full !py-3 !text-base"> {/* Larger button */}
              <i className="fas fa-fire mr-2"></i> <span className="sidebar-footer-button-text">SẢN PHẨM BÁN CHẠY</span>
            </Button>
        </Link>
      </div>
    </div>
  );
};

export default CategorySidebar;
    
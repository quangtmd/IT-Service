import React from 'react';
import { Link } from 'react-router-dom';
import * as Constants from '../../constants';
import Button from '../ui/Button';

interface CategorySidebarProps {
  currentMainCategorySlug: string | null;
  currentSubCategorySlug: string | null;
  isCollapsed?: boolean; 
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  currentMainCategorySlug,
  currentSubCategorySlug,
  isCollapsed = false,
}) => {
  return (
    <div className={`bg-bgBase rounded-lg shadow-md border border-borderDefault h-full flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-full'}`}>
      
      <div className={`bg-primary text-white flex items-center transition-all duration-300 ${isCollapsed ? 'p-3 justify-center' : 'p-4'}`}>
        <i className="fas fa-bars text-xl"></i>
        {!isCollapsed && <h2 className="text-lg font-bold ml-3 whitespace-nowrap">DANH MỤC</h2>}
      </div>
      
      <nav className={`flex-grow p-2 space-y-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'scrollbar-hide' : ''}`}>
        <Link
            to="/shop"
            className={`flex items-center rounded-md transition-colors duration-150 group relative
                        ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2'}
                        ${!currentMainCategorySlug && !currentSubCategorySlug ? 'bg-primary/10 text-primary font-semibold' : 'text-textMuted hover:bg-gray-100 hover:text-primary'}`}
            title={isCollapsed ? "Tất cả sản phẩm" : ""}
        >
            <i className="fas fa-th-large text-lg"></i>
            {!isCollapsed && <span className="ml-3 text-sm truncate">Tất cả sản phẩm</span>}
            
            {isCollapsed && (
                <div className="absolute left-full ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    Tất cả sản phẩm
                </div>
            )}
        </Link>

        {Constants.PRODUCT_CATEGORIES_HIERARCHY.filter(cat => cat.name !== "PC Xây Dựng").map((mainCat) => (
          <div key={mainCat.slug} className="group relative">
            <Link
              to={`/shop?mainCategory=${mainCat.slug}`}
              className={`flex items-center rounded-md transition-colors duration-150 relative
                          ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2'}
                          ${currentMainCategorySlug === mainCat.slug && !currentSubCategorySlug ? 'bg-primary/10 text-primary font-semibold' : 'text-textMuted hover:bg-gray-100 hover:text-primary'}`}
            >
              <div className="flex items-center">
                <i className={`${mainCat.icon || 'fas fa-folder'} text-lg ${currentMainCategorySlug === mainCat.slug ? 'text-primary' : 'text-textSubtle'}`}></i>
                {!isCollapsed && <span className="ml-3 text-sm truncate">{mainCat.name}</span>}
              </div>
              
              {!isCollapsed && mainCat.subCategories.length > 0 && (
                <i className={`fas fa-chevron-right text-xs transition-transform duration-200 ${currentMainCategorySlug === mainCat.slug ? 'rotate-90' : ''}`}></i>
              )}

              {isCollapsed && (
                <div className="absolute left-full ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    {mainCat.name}
                </div>
              )}
            </Link>
            
            {mainCat.subCategories.length > 0 && (
              <div className={`absolute left-full top-0 w-56 bg-white rounded-r-lg shadow-xl border border-gray-200 p-3 hidden group-hover:block z-50 ml-1`}>
                <h4 className="font-bold text-primary mb-2 text-sm border-b pb-1">{mainCat.name}</h4>
                <ul className="space-y-1">
                  {mainCat.subCategories.map(subCat => (
                    <li key={subCat.slug}>
                      <Link to={`/shop?mainCategory=${mainCat.slug}&subCategory=${subCat.slug}`} className={`block text-sm p-1.5 rounded-md hover:bg-gray-50 ${currentSubCategorySlug === subCat.slug ? 'text-primary font-semibold' : 'text-textMuted hover:text-primary'}`}>
                        {subCat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        
         <div className={`border-t border-borderDefault mt-2 pt-2 ${isCollapsed ? 'mx-1' : ''}`}>
            <Link
                to="/shop?tags=Khuyến%20mãi"
                className={`flex items-center rounded-md transition-colors duration-150 group relative
                            ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2'}
                            text-textMuted hover:bg-gray-100 hover:text-primary`}
            >
                <i className="fas fa-tags text-lg text-red-500"></i>
                {!isCollapsed && <span className="ml-3 text-sm truncate">Tin Khuyến mãi</span>}
                {isCollapsed && <div className="absolute left-full ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 z-50">Khuyến mãi</div>}
            </Link>
        </div>
      </nav>
      
       <div className={`p-2 border-t border-borderDefault bg-gray-50 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <Link to="/shop?tags=Bán%20chạy" className="block w-full">
            {isCollapsed ? (
                 <Button variant="primary" size="sm" className="w-10 h-10 !p-0 rounded-full flex items-center justify-center shadow-md" title="Bán chạy">
                    <i className="fas fa-fire"></i>
                 </Button>
            ) : (
                <Button variant="primary" className="w-full !py-2.5 !text-sm shadow-sm">
                    <i className="fas fa-fire mr-2"></i> BÁN CHẠY
                </Button>
            )}
        </Link>
      </div>
    </div>
  );
};

export default CategorySidebar;

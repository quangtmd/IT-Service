import React, { useState, useEffect } from 'react';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../ui/Button';
import { MainCategoryInfo, ProductCategory } from '../../types';
import { getProductCategories } from '../../services/localDataService';

interface CategorySidebarProps {
  currentMainCategoryId: number | null;
  currentSubCategoryId: number | null;
  isCollapsed: boolean;
}

const categoryIcons: Record<string, string> = {
    'Linh Kiện Máy Tính': 'fas fa-microchip',
    'Máy Tính Xách Tay': 'fas fa-laptop',
    'Máy Tính Để Bàn, All-in-one, Server': 'fas fa-desktop',
    'Màn Hình Máy Tính': 'fas fa-tv',
    'Máy In, Scan, Vật Tư Máy In': 'fas fa-print',
    'Phím Chuột, Gaming Gear': 'fas fa-keyboard',
    'Loa, Tai nghe, Webcam, Hội nghị': 'fas fa-headphones-alt',
    'Phụ Kiện Công Nghệ, Phần mềm': 'fas fa-plug',
    'Thiết Bị Mạng, Bộ Lưu Điện (UPS)': 'fas fa-network-wired',
    'Máy Chiếu, Camera, TBVP': 'fas fa-video',
    'Apple Center': 'fab fa-apple',
    'Thiết bị ngoại vi': 'fas fa-keyboard', // Fallback for old name
    'PC Xây Dựng': 'fas fa-tools', // Fallback
};

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  currentMainCategoryId,
  currentSubCategoryId,
  isCollapsed
}) => {
  const [categories, setCategories] = useState<MainCategoryInfo[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allCats: ProductCategory[] = await getProductCategories();
        const mainCats: MainCategoryInfo[] = allCats
          .filter(c => c.parentCategoryId === null)
          .map(mc => ({
            ...mc,
            icon: categoryIcons[mc.name] || 'fas fa-tag',
            subCategories: allCats.filter(sc => sc.parentCategoryId === mc.id)
          }));
        setCategories(mainCats);
      } catch (error) {
        console.error("Failed to fetch product categories for sidebar:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className={`bg-bgBase rounded-lg shadow-md border border-borderDefault h-full flex flex-col overflow-hidden ${isCollapsed ? 'is-collapsed' : ''}`}>
      <div className="bg-primary text-white p-3 flex items-center rounded-t-lg">
        <i className="fas fa-bars mr-3 text-xl"></i>
        <h2 className="text-lg font-semibold sidebar-header-text">DANH MỤC SẢN PHẨM</h2>
      </div>
      <nav className="flex-grow p-3 space-y-1 overflow-y-auto">
        <ReactRouterDOM.Link
            to="/shop"
            className={`w-full flex items-center py-2 px-3 rounded-md text-sm transition-colors duration-150
                        ${!currentMainCategoryId ? 'bg-primary/10 text-primary font-semibold' : 'text-textMuted hover:bg-gray-100 hover:text-primary'}`}
        >
            <i className="fas fa-th-large mr-3 w-5 text-center"></i>
            <span className="sidebar-item-label">Tất cả sản phẩm</span>
        </ReactRouterDOM.Link>

        {categories.map((mainCat) => (
          <div key={mainCat.id} className="group relative">
            <ReactRouterDOM.Link
              to={`/shop?categoryId=${mainCat.id}`}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-md text-sm transition-colors duration-150
                          ${currentMainCategoryId === mainCat.id && !currentSubCategoryId ? 'bg-primary/10 text-primary font-semibold' : 'text-textMuted hover:bg-gray-100 hover:text-primary'}`}
            >
              <div className="flex items-center">
                <i className={`${mainCat.icon || 'fas fa-folder'} mr-3 w-5 text-center text-base ${currentMainCategoryId === mainCat.id ? 'text-primary' : 'text-textSubtle'}`}></i>
                <span className="sidebar-item-label">{mainCat.name}</span>
              </div>
              {mainCat.subCategories.length > 0 && (
                <i className={`fas fa-chevron-right text-xs transition-transform duration-200 lg:group-hover:translate-x-1`}></i>
              )}
            </ReactRouterDOM.Link>
            
            {/* Flyout Panel for Desktop */}
            {mainCat.subCategories.length > 0 && (
              <div className="flyout-panel absolute left-full top-0 w-64 bg-white rounded-r-lg shadow-lg border border-gray-200 p-4 hidden lg:group-hover:block z-20">
                <h4 className="font-bold text-primary mb-2 text-base">{mainCat.name}</h4>
                <ul className="space-y-1">
                  {mainCat.subCategories.map(subCat => (
                    <li key={subCat.id}>
                      <ReactRouterDOM.Link to={`/shop?categoryId=${subCat.id}`} className={`block text-sm p-1.5 rounded-md ${currentSubCategoryId === subCat.id ? 'text-primary font-semibold' : 'text-textMuted hover:text-primary'}`}>
                        {subCat.name}
                      </ReactRouterDOM.Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </nav>
       <div className="p-3 border-t border-borderDefault">
        <ReactRouterDOM.Link to="/shop?featured=true">
            <Button variant="primary" className="w-full">
              <i className="fas fa-fire mr-2"></i> <span className="sidebar-footer-button-text">SẢN PHẨM BÁN CHẠY</span>
            </Button>
        </ReactRouterDOM.Link>
      </div>
    </div>
  );
};

export default CategorySidebar;
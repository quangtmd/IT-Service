
import React, { useMemo } from 'react';
import * as Constants from '../../constants.tsx'; 

interface ProductFilterProps {
  brands: string[];
  statuses: Array<'Mới' | 'Cũ' | 'Like new'>;
  onFilterChange: (filterType: string, value: string | null) => void; // Allow null for clearing
  currentFilters: Record<string, string | null>; // Accept null for currentFilters
}

const ProductFilter: React.FC<ProductFilterProps> = ({ brands, statuses, onFilterChange, currentFilters }) => {
  
  const isActive = (type: keyof typeof currentFilters, value: string | undefined | null) => { // value can be undefined/null for "all"
    return currentFilters[type] === value || (!currentFilters[type] && !value);
  }

  const selectedMainCategory = useMemo(() => {
    if (!currentFilters.mainCategory) return null;
    return Constants.PRODUCT_CATEGORIES_HIERARCHY.find(mc => mc.slug === currentFilters.mainCategory) || null;
  }, [currentFilters.mainCategory]);

  return (
    <div className="bg-bgBase p-6 rounded-lg shadow-md border border-borderDefault">
      <h3 className="text-xl font-semibold mb-4 text-textBase">Bộ lọc sản phẩm</h3>
      
      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2 text-textMuted">Danh mục chính</h4>
        <ul className="space-y-1">
          <li>
            <button 
              onClick={() => onFilterChange('mainCategory', null)} // Pass null for "All"
              className={`w-full text-left py-1 px-2 rounded transition-colors text-sm ${isActive('mainCategory', null) ? 'text-primary bg-primary/10 font-semibold' : 'text-textMuted hover:text-primary hover:bg-primary/5'}`}
            >
              Tất cả danh mục chính
            </button>
          </li>
          {Constants.PRODUCT_CATEGORIES_HIERARCHY.filter(mc => mc.slug !== 'pc_xay_dung').map(mainCat => (
            <li key={mainCat.slug}>
              <button 
                onClick={() => onFilterChange('mainCategory', mainCat.slug)}
                className={`w-full text-left py-1 px-2 rounded transition-colors text-sm ${isActive('mainCategory', mainCat.slug) ? 'text-primary bg-primary/10 font-semibold' : 'text-textMuted hover:text-primary hover:bg-primary/5'}`}
              >
                {mainCat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* SubCategory Filter */}
      {selectedMainCategory && selectedMainCategory.subCategories.length > 0 && (
        <div className="mb-6 pl-2 border-l-2 border-primary/20">
          <h4 className="font-semibold mb-2 text-textMuted ml-2">Danh mục con của "{selectedMainCategory.name}"</h4>
          <ul className="space-y-1">
            <li>
              <button 
                onClick={() => onFilterChange('subCategory', null)} 
                className={`w-full text-left py-1 px-2 rounded transition-colors text-sm ${isActive('subCategory', null) ? 'text-primary bg-primary/10 font-semibold' : 'text-textMuted hover:text-primary hover:bg-primary/5'}`}
              >
                Tất cả trong "{selectedMainCategory.name}"
              </button>
            </li>
            {selectedMainCategory.subCategories.map(subCat => (
              <li key={subCat.slug}>
                <button 
                  onClick={() => onFilterChange('subCategory', subCat.slug)}
                  className={`w-full text-left py-1 px-2 rounded transition-colors text-sm ${isActive('subCategory', subCat.slug) ? 'text-primary bg-primary/10 font-semibold' : 'text-textMuted hover:text-primary hover:bg-primary/5'}`}
                >
                  {subCat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-textMuted">Hãng sản xuất</h4>
          <ul className="space-y-1">
             <li>
              <button 
                onClick={() => onFilterChange('brand', null)}
                className={`w-full text-left py-1 px-2 rounded transition-colors text-sm ${isActive('brand', null) ? 'text-primary bg-primary/10 font-semibold' : 'text-textMuted hover:text-primary hover:bg-primary/5'}`}
              >
                Tất cả hãng
              </button>
            </li>
            {brands.map(brand => (
              <li key={brand}>
                <button 
                  onClick={() => onFilterChange('brand', brand)}
                  className={`w-full text-left py-1 px-2 rounded transition-colors text-sm ${isActive('brand', brand) ? 'text-primary bg-primary/10 font-semibold' : 'text-textMuted hover:text-primary hover:bg-primary/5'}`}
                >
                  {brand}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Filter */}
       {statuses.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-textMuted">Tình trạng</h4>
          <ul className="space-y-1">
            <li>
              <button 
                onClick={() => onFilterChange('status', null)}
                className={`w-full text-left py-1 px-2 rounded transition-colors text-sm ${isActive('status', null) ? 'text-primary bg-primary/10 font-semibold' : 'text-textMuted hover:text-primary hover:bg-primary/5'}`}
              >
                Tất cả tình trạng
              </button>
            </li>
            {statuses.map(status => (
              <li key={status}>
                 <button 
                  onClick={() => onFilterChange('status', status)}
                  className={`w-full text-left py-1 px-2 rounded transition-colors text-sm ${isActive('status', status) ? 'text-primary bg-primary/10 font-semibold' : 'text-textMuted hover:text-primary hover:bg-primary/5'}`}
                >
                  {status}
                </button>
              </li>
            ))}
          </ul>
        </div>
       )}
        {/* Price Filter Placeholder */}
        <div className="mt-6">
            <h4 className="font-semibold mb-2 text-textMuted">Khoảng giá</h4>
            <p className="text-sm text-textSubtle">(Sắp có)</p>
        </div>
    </div>
  );
};

export default ProductFilter;

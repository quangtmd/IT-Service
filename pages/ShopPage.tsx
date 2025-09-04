
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/shop/ProductCard';
import { MOCK_PRODUCTS } from '../data/mockData';
import { Product, MainCategoryInfo } from '../types';
import SearchBar from '../components/shared/SearchBar';
import Pagination from '../components/shared/Pagination';
import * as Constants from '../constants.tsx';
import ProductCarouselSection from '../components/shop/ProductCarouselSection';
import CategorySidebar from '../components/shop/CategorySidebar'; // Import the new sidebar

const PRODUCTS_PER_PAGE = 12; // Adjusted for new layout

const ProductCategoryNav: React.FC<{
  categories: MainCategoryInfo[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}> = ({ categories, activeSlug, onSelect }) => {
  return (
    <nav className="shop-category-nav scrollbar-hide overflow-x-auto whitespace-nowrap">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 ${!activeSlug ? 'active' : ''}`}
      >
        Tất cả sản phẩm
      </button>
      {categories.map(cat => (
        <button
          key={cat.slug}
          onClick={() => onSelect(cat.slug)}
          className={`shrink-0 ${activeSlug === cat.slug ? 'active' : ''}`}
        >
          {cat.name}
        </button>
      ))}
    </nav>
  );
};

const ShopPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const hasFilters = location.search && location.search.length > 1;

  // --- START: STATE AND LOGIC FOR FILTERED VIEW ---
  const [allProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [currentFilters, setCurrentFilters] = useState({
    mainCategory: null as string | null,
    subCategory: null as string | null,
    brand: null as string | null,
    status: null as string | null,
    q: '',
    tags: null as string | null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const handleScroll = useCallback(() => {
    // Check if on desktop and if scrolled past the header
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsed(window.scrollY > 160);
    } else {
      // Always keep it expanded on mobile/tablet
      setIsSidebarCollapsed(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setCurrentFilters({
      mainCategory: queryParams.get('mainCategory') || null,
      subCategory: queryParams.get('subCategory') || null,
      brand: queryParams.get('brand') || null,
      status: queryParams.get('status') || null,
      q: queryParams.get('q') || '',
      tags: queryParams.get('tags') || null,
    });
    setCurrentPage(1);
  }, [queryParams]);

  const handleFilterChange = (filterType: string, value: string | null) => {
    const newParams = new URLSearchParams(location.search);
    
    if (value) {
        newParams.set(filterType, value);
    } else {
        newParams.delete(filterType);
    }

    if (filterType === 'mainCategory') {
        newParams.delete('subCategory');
    }

    navigate(`/shop?${newParams.toString()}`);
  };
  
  const handleSearch = (term: string) => {
    const newParams = new URLSearchParams(location.search);
    if (term) {
      newParams.set('q', term);
    } else {
      newParams.delete('q');
    }
    navigate(`/shop?${newParams.toString()}`);
  };

  const filteredProducts = useMemo(() => {
    let products = allProducts.filter(p => p.mainCategory !== "PC Xây Dựng"); 
    
    if (currentFilters.mainCategory) {
      const mainCat = Constants.PRODUCT_CATEGORIES_HIERARCHY.find(mc => mc.slug === currentFilters.mainCategory);
      if (mainCat) {
        products = products.filter(p => p.mainCategory === mainCat.name);
        if (currentFilters.subCategory) {
          const subCat = mainCat.subCategories.find(sc => sc.slug === currentFilters.subCategory);
          if (subCat) {
            products = products.filter(p => p.subCategory === subCat.name);
          }
        }
      }
    }

    if (currentFilters.brand) {
      products = products.filter(p => p.brand === currentFilters.brand);
    }

    if (currentFilters.status) {
      products = products.filter(p => p.status === currentFilters.status);
    }

    if (currentFilters.q) {
      const lowerSearchTerm = currentFilters.q.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(lowerSearchTerm) ||
        (p.brand && p.brand.toLowerCase().includes(lowerSearchTerm)) ||
        p.description.toLowerCase().includes(lowerSearchTerm) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
      );
    }

    if (currentFilters.tags) {
        const tagsToFilter = currentFilters.tags.toLowerCase().split(',');
        products = products.filter(p => 
            p.tags && p.tags.some(tag => tagsToFilter.includes(tag.toLowerCase()))
        );
    }

    return products;
  }, [allProducts, currentFilters]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const getCurrentCategoryName = () => {
    if (currentFilters.tags) return `Sản phẩm có tag "${currentFilters.tags}"`;

    let name = "Tất cả sản phẩm";
    if (currentFilters.mainCategory) {
      const mainCat = Constants.PRODUCT_CATEGORIES_HIERARCHY.find(mc => mc.slug === currentFilters.mainCategory);
      if (mainCat) {
        name = mainCat.name;
        if (currentFilters.subCategory) {
          const subCat = mainCat.subCategories.find(sc => sc.slug === currentFilters.subCategory);
          if (subCat) name += ` > ${subCat.name}`;
        }
      }
    }
    if (currentFilters.brand) name += ` (Hãng: ${currentFilters.brand})`;
    if (currentFilters.status) name += ` (Tình trạng: ${currentFilters.status})`;
    if (currentFilters.q) name = `Kết quả cho "${currentFilters.q}"` + (currentFilters.mainCategory || currentFilters.brand || currentFilters.status ? ` trong ${name}` : ``);
    
    return name;
  };

  // --- END: LOGIC FOR FILTERED VIEW ---

  const renderMainContent = () => {
    if(hasFilters) {
        return (
            <main className="flex-grow w-full lg:w-3/4">
                <ProductCategoryNav
                    categories={Constants.PRODUCT_CATEGORIES_HIERARCHY.filter(cat => cat.name !== "PC Xây Dựng")}
                    activeSlug={currentFilters.mainCategory}
                    onSelect={(slug) => handleFilterChange('mainCategory', slug)}
                />
                <div className="flex justify-between items-center mb-6 px-1">
                  <h1 className="text-2xl font-bold text-textBase">{getCurrentCategoryName()}</h1>
                  <span className="text-sm text-textMuted">{filteredProducts.length} sản phẩm</span>
                </div>
                {filteredProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                    {paginatedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    </div>
                    {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                    )}
                </>
                ) : (
                <div className="text-center py-12 bg-bgBase rounded-lg border border-borderDefault">
                    <i className="fas fa-search text-5xl text-textSubtle mb-4"></i>
                    <h3 className="text-xl font-semibold text-textBase mb-2">Không tìm thấy sản phẩm</h3>
                    <p className="text-textMuted">Vui lòng thử lại với bộ lọc hoặc từ khóa khác.</p>
                </div>
                )}
            </main>
        )
    }

    return (
        <main className="flex-grow w-full lg:w-3/4">
            {Constants.PRODUCT_CATEGORIES_HIERARCHY
            .filter(cat => cat.slug !== 'pc_xay_dung' && allProducts.some(p => p.mainCategory === cat.name))
            .map(category => (
                <ProductCarouselSection
                key={category.slug}
                title={category.name}
                products={allProducts.filter(p => p.mainCategory === category.name)}
                viewAllLink={`/shop?mainCategory=${category.slug}`}
                subCategories={category.subCategories}
                />
            ))}
        </main>
    )
  }


  // --- CONDITIONAL RENDERING ---
  return (
    <div className="bg-bgCanvas">
      <div className="container mx-auto px-4 py-8">
        {hasFilters && (
            <div className="mb-6">
                <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm sản phẩm..." initialTerm={currentFilters.q} className="max-w-3xl mx-auto" />
            </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className={`shop-sidebar w-full lg:max-w-[280px] flex-shrink-0 lg:sticky lg:top-[170px] ${isSidebarCollapsed ? 'is-collapsed-parent' : ''}`}>
            <CategorySidebar 
              currentMainCategorySlug={currentFilters.mainCategory}
              currentSubCategorySlug={currentFilters.subCategory}
              isCollapsed={isSidebarCollapsed}
            />
          </aside>
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
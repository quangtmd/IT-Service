

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import ProductCard from '../components/shop/ProductCard';
import { Product, MainCategoryInfo } from '../types';
import SearchBar from '../components/shared/SearchBar';
import Pagination from '../components/shared/Pagination';
import * as Constants from '../constants';
import CategorySidebar from '../components/shop/CategorySidebar';
import { getProducts } from '../services/localDataService';
import BackendConnectionError from '../components/shared/BackendConnectionError'; // Cập nhật đường dẫn
import SkeletonProductCard from '../components/shop/SkeletonProductCard';
import ShopBanner from '../components/shop/ShopBanner'; // New import
import ShopProductSection from '../components/shop/ShopProductSection'; // New import

const PRODUCTS_PER_PAGE = 12;

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
  const location = ReactRouterDOM.useLocation();
  const navigate = ReactRouterDOM.useNavigate();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    mainCategory: null as string | null,
    subCategory: null as string | null,
    brand: null as string | null,
    status: null as string | null,
    q: '',
    tags: null as string | null,
  });

  const currentPage = parseInt(queryParams.get('page') || '1', 10);

   useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Pass the entire search string from the URL to the service
        const searchParams = new URLSearchParams(location.search);
        if (!searchParams.has('limit')) {
            searchParams.set('limit', String(PRODUCTS_PER_PAGE));
        }
        
        const { products, totalProducts } = await getProducts(searchParams.toString());
        setDisplayedProducts(products);
        setTotalProducts(totalProducts);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu sản phẩm.');
        console.error("Lỗi khi tải sản phẩm từ API:", err);
        setDisplayedProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only load products if there are active filters or a search term, 
    // otherwise the page will display sections.
    const hasActiveFilters = Array.from(queryParams.keys()).some(key => 
      key !== 'page' && key !== 'limit' && queryParams.get(key)
    );
    
    if (hasActiveFilters) {
        loadProducts();
    } else {
        setIsLoading(false); // Not loading filtered products, will show sections
        setDisplayedProducts([]);
        setTotalProducts(0);
    }
  }, [location.search, queryParams]);


  const handleScroll = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsed(window.scrollY > 160);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
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
    newParams.set('page', '1'); // Reset to first page on filter change
    navigate(`/shop?${newParams.toString()}`);
  };
  
  const handleSearch = (term: string) => {
    const newParams = new URLSearchParams(location.search);
    if (term) newParams.set('q', term);
    else newParams.delete('q');
    newParams.set('page', '1'); // Reset to first page on search
    navigate(`/shop?${newParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('page', String(newPage));
    navigate(`/shop?${newParams.toString()}`);
  };

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

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
  
  const hasActiveFiltersExcludingPage = useMemo(() => {
    const params = new URLSearchParams(location.search);
    for (const [key, value] of params.entries()) {
      if (key !== 'page' && key !== 'limit' && value) {
        return true;
      }
    }
    return false;
  }, [location.search]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
            <SkeletonProductCard key={index} />
          ))}
        </div>
      );
    }
    if (error) {
        return <BackendConnectionError error={error} />;
    }
    
    if (hasActiveFiltersExcludingPage) {
        // Show filtered products if filters are active
        return (
            <main className="flex-grow w-full min-w-0">
                <div className="flex justify-between items-center mb-6 px-1">
                <h1 className="text-2xl font-bold text-textBase">{getCurrentCategoryName()}</h1>
                <span className="text-sm text-textMuted">{totalProducts} sản phẩm</span>
                </div>
                {displayedProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                    {displayedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    </div>
                    {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
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
        );
    } else {
        // Show default sections if no filters are active
        return (
            <div className="space-y-10">
                <ShopBanner />
                <ShopProductSection 
                    title="SẢN PHẨM BÁN CHẠY" 
                    linkToAll="/shop?tags=Bán%20chạy" 
                    fetchType="featured" 
                    limit={4} 
                />
                <ShopProductSection 
                    title="MÁY TÍNH XÁCH TAY" 
                    linkToAll="/shop?mainCategory=laptop" 
                    fetchParams="mainCategory=laptop" 
                    limit={4} 
                />
                <ShopProductSection 
                    title="LINH KIỆN MÁY TÍNH" 
                    linkToAll="/shop?mainCategory=linh_kien_may_tinh" 
                    fetchParams="mainCategory=linh_kien_may_tinh" 
                    limit={4} 
                />
                {/* You can add more sections here */}
            </div>
        );
    }
  }

  return (
    <div className="bg-bgCanvas">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
            <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm sản phẩm, thương hiệu, linh kiện..." initialTerm={currentFilters.q} className="max-w-3xl mx-auto" />
        </div>
        <div className="shop-layout-container">
          <aside className="shop-sidebar">
            <CategorySidebar 
              currentMainCategorySlug={currentFilters.mainCategory}
              currentSubCategorySlug={currentFilters.subCategory}
              isCollapsed={isSidebarCollapsed}
            />
          </aside>
          <div className="shop-main-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;

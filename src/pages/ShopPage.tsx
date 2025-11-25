
import React, { useState, useMemo, useEffect } from 'react';
// Fix: Use named imports for react-router-dom hooks
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/shop/ProductCard';
import { Product } from '../types';
import SearchBar from '../components/shared/SearchBar';
import Pagination from '../components/shared/Pagination';
import * as Constants from '../constants.tsx';
import CategorySidebar from '../components/shop/CategorySidebar';
import { getProducts } from '../services/localDataService';
import BackendConnectionError from '../components/shared/BackendConnectionError'; // Cập nhật đường dẫn
import SkeletonProductCard from '../components/shop/SkeletonProductCard';
import ShopBanner from '../components/shop/ShopBanner'; // New import
import ShopProductSection from '../components/shop/ShopProductSection'; // New import

const PRODUCTS_PER_PAGE = 12;

const ShopPage: React.FC = () => {
  // Fix: Use hooks directly
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
                <div className="flex justify-between items-center mb-4 px-1">
                    <h1 className="text-lg md:text-2xl font-bold text-textBase truncate pr-2" title={getCurrentCategoryName()}>{getCurrentCategoryName()}</h1>
                    <span className="text-xs md:text-sm text-textMuted whitespace-nowrap">{totalProducts} SP</span>
                </div>
                {displayedProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
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
            <div className="space-y-8 md:space-y-10">
                <ShopBanner />
                <ShopProductSection 
                    title="BÁN CHẠY" 
                    linkToAll="/shop?tags=Bán%20chạy" 
                    fetchType="featured" 
                    limit={4} 
                />
                <ShopProductSection 
                    title="LAPTOP" 
                    linkToAll="/shop?mainCategory=laptop" 
                    fetchParams="mainCategory=laptop" 
                    limit={4} 
                />
                <ShopProductSection 
                    title="LINH KIỆN" 
                    linkToAll="/shop?mainCategory=linh_kien_may_tinh" 
                    fetchParams="mainCategory=linh_kien_may_tinh" 
                    limit={4} 
                />
            </div>
        );
    }
  }

  return (
    <div className="bg-bgCanvas min-h-screen">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Search Bar */}
        <div className="mb-6">
            <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm sản phẩm..." initialTerm={currentFilters.q} className="max-w-3xl mx-auto shadow-sm" />
        </div>

        {/* Mobile Horizontal Category Scroll - Only visible on Mobile */}
        <div className="lg:hidden mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 flex gap-2">
            <button 
                onClick={() => handleFilterChange('mainCategory', null)} 
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors ${!currentFilters.mainCategory ? 'bg-primary text-white border-primary' : 'bg-white text-textMuted border-borderDefault'}`}
            >
                Tất cả
            </button>
            {Constants.PRODUCT_CATEGORIES_HIERARCHY.map(cat => (
                <button
                    key={cat.slug}
                    onClick={() => handleFilterChange('mainCategory', cat.slug)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${currentFilters.mainCategory === cat.slug ? 'bg-primary text-white border-primary' : 'bg-white text-textMuted border-borderDefault'}`}
                >
                    {cat.icon && <i className={cat.icon}></i>} {cat.name}
                </button>
            ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative">
          {/* Desktop Sidebar - Hidden on Mobile - STICKY POSITIONING */}
          {/* We use sticky positioning here to make the sidebar follow the scroll, fixing the layout issue */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-[180px] h-fit self-start z-10">
            <CategorySidebar 
              currentMainCategorySlug={currentFilters.mainCategory}
              currentSubCategorySlug={currentFilters.subCategory}
            />
          </aside>
          
          {/* Main Content Area */}
          <div className="flex-grow min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;

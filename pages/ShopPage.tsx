
import React, { useState, useMemo, useEffect, useCallback } from 'react';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import ProductCard from '../components/shop/ProductCard';
import { Product, ProductCategory } from '../types';
import SearchBar from '../components/shared/SearchBar';
import Pagination from '../components/shared/Pagination';
import CategorySidebar from '../components/shop/CategorySidebar';
import { getFilteredProducts, getProductCategories } from '../services/localDataService';
import PageTitleBannerIts from '../components/services_page_its/PageTitleBannerIts';
import ProductCarouselSection from '../components/shop/ProductCarouselSection';

const PRODUCTS_PER_PAGE = 12;

const ProductCategoryNav: React.FC<{
  categories: ProductCategory[];
  activeId: number | null;
  onSelect: (id: number | null) => void;
}> = ({ categories, activeId, onSelect }) => {
  return (
    <nav className="shop-category-nav scrollbar-hide overflow-x-auto whitespace-nowrap">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 ${!activeId ? 'active' : ''}`}
      >
        Tất cả sản phẩm
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`shrink-0 ${activeId === cat.id ? 'active' : ''}`}
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
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const currentFilters = useMemo(() => ({
    categoryId: queryParams.get('categoryId') || null,
    brand: queryParams.get('brand') || null,
    q: queryParams.get('q') || '',
  }), [queryParams]);

  const currentPage = parseInt(queryParams.get('page') || '1', 10);
  const hasSearchParams = location.search.length > 1 && location.search !== '?';

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const allCats = await getProductCategories();
            setCategories(allCats.filter(c => c.parentCategoryId === null)); // Only top-level cats for the nav
        } catch (err) {
            console.error("Failed to fetch categories for Shop Page", err);
        }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!hasSearchParams) {
        setIsLoading(false);
        setError(null);
        setDisplayedProducts([]);
        setTotalProducts(0);
        return;
    }; 

    const loadAndFilterProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { products, totalProducts } = await getFilteredProducts(currentFilters, currentPage, PRODUCTS_PER_PAGE);
        setDisplayedProducts(products);
        setTotalProducts(totalProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu sản phẩm.');
        setDisplayedProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAndFilterProducts();
  }, [location.search, hasSearchParams, currentFilters, currentPage]);


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

  const handleFilterChange = (filterType: string, value: string | number | null) => {
    const newParams = new URLSearchParams(location.search);
    if (value) {
        newParams.set(filterType, String(value));
    } else {
        newParams.delete(filterType);
    }
    newParams.set('page', '1');
    navigate(`/shop?${newParams.toString()}`);
  };
  
  const handleSearch = (term: string) => {
    const newParams = new URLSearchParams(location.search);
    if (term) newParams.set('q', term);
    else newParams.delete('q');
    newParams.set('page', '1');
    navigate(`/shop?${newParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('page', String(newPage));
    navigate(`/shop?${newParams.toString()}`);
  };

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const getCurrentCategoryName = () => {
    if (currentFilters.q) return `Kết quả cho "${currentFilters.q}"`;
    let name = "Tất cả sản phẩm";
    if (currentFilters.categoryId) {
      const cat = categories.find(c => c.id === parseInt(currentFilters.categoryId!));
      if(cat) name = cat.name;
    }
    if (currentFilters.brand) name += ` (Hãng: ${currentFilters.brand})`;
    return name;
  };
  
  const currentCategoryId = currentFilters.categoryId ? parseInt(currentFilters.categoryId) : null;

  const renderFilteredContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-20 w-full flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Đang tải sản phẩm...</p>
        </div>
      );
    }
    if (error) {
      return <div className="text-center py-20 w-full flex-grow text-red-500 bg-red-50 p-4 rounded-lg"><strong>Lỗi:</strong> {error}</div>;
    }
    return (
        <main className="flex-grow w-full min-w-0">
            <ProductCategoryNav
                categories={categories}
                activeId={currentCategoryId}
                onSelect={(id) => handleFilterChange('categoryId', id)}
            />
            <div className="flex justify-between items-center mb-6 px-1">
              <h1 className="text-2xl font-bold text-textBase">{getCurrentCategoryName()}</h1>
              <span className="text-sm text-textMuted">{totalProducts} sản phẩm</span>
            </div>
            {displayedProducts.length > 0 ? (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                {displayedProducts.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
                {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
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
  };
  
  const renderCarouselContent = () => (
      <div className="space-y-12">
        <ProductCarouselSection title="Sản phẩm mới nhất" viewAllLink="/shop?sort=newest" />
        {/* FIX: Replaced unsupported 'isFeatured' prop with 'filterTag' to align with component's logic. */}
        <ProductCarouselSection title="Sản phẩm nổi bật" filterTag="Bán chạy" viewAllLink="/shop?featured=true" />
      </div>
  );

  return (
    <div className="bg-bgCanvas">
      <PageTitleBannerIts title="Cửa Hàng Sản Phẩm" breadcrumbs={[{ label: "Trang chủ", path: "/home" }, { label: "Sản phẩm" }]} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
            <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm sản phẩm, thương hiệu..." initialTerm={currentFilters.q} className="max-w-3xl mx-auto" />
        </div>
        <div className="shop-layout-container">
          <aside className="shop-sidebar">
            <CategorySidebar 
              currentMainCategoryId={currentCategoryId}
              currentSubCategoryId={null} // Simplified, can be enhanced later
              isCollapsed={isSidebarCollapsed}
            />
          </aside>
          <div className="shop-main-content">
            {hasSearchParams ? renderFilteredContent() : renderCarouselContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
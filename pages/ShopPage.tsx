
import React, { useState, useMemo, useEffect, useCallback } from 'react';
// FIX: Update react-router-dom from v5 to v6. Replaced useHistory with useNavigate.
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/shop/ProductCard';
import { Product } from '../types';
import SearchBar from '../components/shared/SearchBar';
import Pagination from '../components/shared/Pagination';
import * as Constants from '../constants.tsx';
import CategorySidebar from '../components/shop/CategorySidebar';
import { getFilteredProducts } from '../services/localDataService';
import PageTitleBannerIts from '../components/services_page_its/PageTitleBannerIts';
import ProductCarouselSection from '../components/shop/ProductCarouselSection';

const PRODUCTS_PER_PAGE = 12;

const ProductCategoryNav: React.FC<{
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}> = ({ activeSlug, onSelect }) => {
  const categories = Constants.PRODUCT_CATEGORIES_HIERARCHY.filter(cat => cat.name !== "PC Xây Dựng");
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
  // FIX: Use useNavigate hook for react-router-dom v6
  const navigate = useNavigate();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const currentFilters = useMemo(() => ({
    mainCategory: queryParams.get('mainCategory') || null,
    subCategory: queryParams.get('subCategory') || null,
    brand: queryParams.get('brand') || null,
    status: queryParams.get('status') || null,
    q: queryParams.get('q') || '',
    tags: queryParams.get('tags') || null,
  }), [queryParams]);

  const currentPage = parseInt(queryParams.get('page') || '1', 10);
  const hasSearchParams = location.search.length > 1 && location.search !== '?';


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
    newParams.set('page', '1');
    // FIX: Use navigate for navigation in v6
    navigate(`/shop?${newParams.toString()}`);
  };
  
  const handleSearch = (term: string) => {
    const newParams = new URLSearchParams(location.search);
    if (term) newParams.set('q', term);
    else newParams.delete('q');
    newParams.set('page', '1');
    // FIX: Use navigate for navigation in v6
    navigate(`/shop?${newParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('page', String(newPage));
    // FIX: Use navigate for navigation in v6
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
    if (currentFilters.q) name = `Kết quả cho "${currentFilters.q}"`;
    return name;
  };

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
                activeSlug={currentFilters.mainCategory}
                onSelect={(slug) => handleFilterChange('mainCategory', slug)}
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
        <ProductCarouselSection title="Linh Kiện PC Bán Chạy" filterTag="Bán chạy" viewAllLink="/shop?tags=Bán%20chạy" />
        <ProductCarouselSection title="Laptop Nổi Bật" mainCategory="Laptop" viewAllLink="/shop?mainCategory=laptop" />
        <ProductCarouselSection title="PC Gaming Cấu Hình Khủng" mainCategory="Máy tính để bàn (PC)" subCategory="Máy tính Gaming" viewAllLink="/shop?mainCategory=may_tinh_de_ban&subCategory=pc_gaming" />
        <ProductCarouselSection title="Thiết Bị Ngoại Vi" mainCategory="Thiết bị ngoại vi" viewAllLink="/shop?mainCategory=thiet_bi_ngoai_vi"/>
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
              currentMainCategorySlug={currentFilters.mainCategory}
              currentSubCategorySlug={currentFilters.subCategory}
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

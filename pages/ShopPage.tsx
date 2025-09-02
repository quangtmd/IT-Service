
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Updated imports for v6/v7
import ProductCard from '../components/shop/ProductCard';
import { MOCK_PRODUCTS } from '../data/mockData';
import { Product, MainCategoryInfo } from '../types';
import SearchBar from '../components/shared/SearchBar';
import Pagination from '../components/shared/Pagination';
import * as Constants from '../constants.tsx';
import ProductFilter from '../components/shop/ProductFilter.tsx'; 

const PRODUCTS_PER_PAGE = 16;

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
  const [allProducts] = useState<Product[]>(MOCK_PRODUCTS);

  const [currentFilters, setCurrentFilters] = useState({
    mainCategory: null as string | null,
    subCategory: null as string | null,
    brand: null as string | null,
    status: null as string | null,
    q: ''
  });
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const navigate = useNavigate(); // Changed from useHistory

  const uniqueBrands = useMemo(() => {
    const brands = allProducts
      .map(p => p.brand)
      .filter((brand): brand is string => typeof brand === 'string' && brand.trim() !== '');
    return [...new Set(brands)].sort();
  }, [allProducts]);

  const uniqueStatuses: Array<'Mới' | 'Cũ' | 'Like new'> = useMemo(() => {
    const statuses = allProducts
      .map(p => p.status)
      .filter((status): status is 'Mới' | 'Cũ' | 'Like new' => !!status);
    return [...new Set(statuses)];
  }, [allProducts]);


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setCurrentFilters({
      mainCategory: queryParams.get('mainCategory') || null,
      subCategory: queryParams.get('subCategory') || null,
      brand: queryParams.get('brand') || null,
      status: queryParams.get('status') || null,
      q: queryParams.get('q') || ''
    });
    setCurrentPage(1);
  }, [location.search]);

  const handleFilterChange = (filterType: string, value: string | null) => {
    const queryParams = new URLSearchParams(); 

    const newFilters = { ...currentFilters, [filterType]: value };

    if (filterType === 'mainCategory') {
      newFilters.subCategory = null;
    }

    if (newFilters.q) queryParams.set('q', newFilters.q);
    if (newFilters.mainCategory) queryParams.set('mainCategory', newFilters.mainCategory);
    if (newFilters.subCategory) queryParams.set('subCategory', newFilters.subCategory);
    if (newFilters.brand) queryParams.set('brand', newFilters.brand);
    if (newFilters.status) queryParams.set('status', newFilters.status);
    
    navigate(`/shop?${queryParams.toString()}`); // Changed from history.push
  };
  
  const handleSearch = (term: string) => {
    const queryParams = new URLSearchParams();
    if (term) queryParams.set('q', term);
    if (currentFilters.mainCategory) queryParams.set('mainCategory', currentFilters.mainCategory);
    if (currentFilters.subCategory) queryParams.set('subCategory', currentFilters.subCategory);
    if (currentFilters.brand) queryParams.set('brand', currentFilters.brand);
    if (currentFilters.status) queryParams.set('status', currentFilters.status);
    navigate(`/shop?${queryParams.toString()}`); // Changed from history.push
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
    return products;
  }, [allProducts, currentFilters]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const getCurrentCategoryName = () => {
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


  return (
    <div className="bg-bgCanvas min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm sản phẩm..." initialTerm={currentFilters.q} className="max-w-3xl mx-auto" />
        </div>
      
        <div className="shop-layout-container">
          <aside className="shop-sidebar">
            <ProductFilter
              brands={uniqueBrands}
              statuses={uniqueStatuses}
              onFilterChange={handleFilterChange}
              currentFilters={{
                  mainCategory: currentFilters.mainCategory || null,
                  subCategory: currentFilters.subCategory || null,
                  brand: currentFilters.brand || null,
                  status: currentFilters.status || null,
                  q: currentFilters.q
              }}
            />
            <div className="shop-sidebar-section mt-6">
              <h3 className="shop-sidebar-title">Sản phẩm xem nhiều</h3>
              <ul className="space-y-1">
              {MOCK_PRODUCTS.slice(0, 5).map(p => (
                  <li key={p.id}><Link to={`/product/${p.id}`} className="text-sm text-textMuted hover:text-primary line-clamp-1">{p.name}</Link></li>
              ))}
              </ul>
            </div>
            <div className="shop-sidebar-section mt-6">
              <img src="https://picsum.photos/seed/shopad1/300/250?text=Quảng+Cáo" alt="Placeholder Ad" className="w-full rounded-md shadow"/>
            </div>
          </aside>
          <main className="shop-main-content">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {paginatedProducts.map(product => (
                      <ProductCard key={product.id} product={product} context="detail-view" />
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
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
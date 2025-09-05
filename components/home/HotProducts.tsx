
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import ProductCard from '../shop/ProductCard';
import Button from '../ui/Button';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import * as Constants from '../../constants.tsx';
import { MOCK_PRODUCTS } from '../../data/mockData';

const HotProducts: React.FC = () => {
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      const baseUrl = process.env.BACKEND_API_BASE_URL;

      const loadMockData = () => {
        console.warn("Falling back to mock data for featured products.");
        const featured = MOCK_PRODUCTS.filter(p => 
            (p.tags && p.tags.includes('Bán chạy')) || 
            (p.originalPrice && p.price < p.originalPrice)
        ).slice(0, 4);
        // Ensure we always show 4 products if possible
        setHotProducts(featured.length > 0 ? featured : MOCK_PRODUCTS.slice(0, 4));
      };

      if (!baseUrl) {
          loadMockData();
          setIsLoading(false);
          return;
      }
      
      try {
        const response = await fetch(`${baseUrl}/api/products/featured`);
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }
        const data: Product[] = await response.json();
        setHotProducts(data);
      } catch (err) {
        // Don't set a user-facing error, just log it and fallback.
        console.error("Lỗi khi fetch sản phẩm nổi bật:", err);
        loadMockData();
      } finally {
        setIsLoading(false);
      }
    };
    fetchHotProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="home-section bg-bgMuted">
        <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-textMuted">Đang tải sản phẩm nổi bật...</p>
        </div>
      </section>
    );
  }

  // Error state is now handled by fallback, so we don't need a separate error display.

  if (hotProducts.length === 0) {
    return (
      <section className="home-section bg-bgMuted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="home-section-title text-4xl md:text-5xl font-extrabold mb-6">Sản Phẩm Nổi Bật</h2>
          <p className="home-section-subtitle mb-8">Hiện chưa có sản phẩm nổi bật nào. Vui lòng quay lại sau!</p>
          <Link to="/shop">
            <Button size="lg" variant="primary">Khám phá tất cả sản phẩm</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="home-section bg-bgMuted">
      <div className="container mx-auto px-4">
        <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
             <h2 className="home-section-title text-4xl md:text-5xl font-extrabold mb-4">Sản Phẩm Nổi Bật</h2>
             <p className="home-section-subtitle">
                Khám phá các linh kiện PC đang được ưa chuộng nhất và những ưu đãi đặc biệt từ chúng tôi.
             </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {hotProducts.map((product, index) => (
            <div
              key={product.id}
              className={`animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`} 
              style={{ animationDelay: `${index * 100 + 200}ms` }} 
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className={`text-center mt-12 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`} style={{animationDelay: '0.5s'}}>
          <Link to="/shop">
            <Button size="lg" variant="primary" className="px-10 py-3.5 text-base shadow-lg hover:shadow-primary/40">
                Xem Tất Cả Sản Phẩm
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HotProducts;

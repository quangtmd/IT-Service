
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import ProductCard from '../shop/ProductCard';
import Button from '../ui/Button';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import { getFeaturedProducts } from '../../services/localDataService';
import BackendConnectionError from '../shared/BackendConnectionError';

const HotProducts: React.FC = () => {
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHotProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const featured = await getFeaturedProducts();
        setHotProducts(featured);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải sản phẩm nổi bật.");
        console.error("Lỗi khi tải sản phẩm nổi bật từ API:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHotProducts();
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
  
  if (error) {
    return (
        <section className="home-section bg-bgMuted">
            <div className="container mx-auto px-4">
                <BackendConnectionError error={error} />
            </div>
        </section>
    );
  }


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

import React, { useState, useEffect } from 'react';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { Product } from '../../types';
import ProductCard from '../shop/ProductCard';
import Button from '../ui/Button';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import { getFeaturedProducts } from '../../services/localDataService';

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
        setError("Không thể tải sản phẩm nổi bật.");
        console.error("Lỗi khi tải sản phẩm nổi bật từ Local Storage:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHotProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="home-section bg-primary">
        <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-red-100">Đang tải sản phẩm nổi bật...</p>
        </div>
      </section>
    );
  }
  
  if (error) {
     return (
      <section className="home-section bg-primary">
        <div className="container mx-auto px-4 text-center text-white bg-red-800/50 p-4 rounded-lg">
           <p>{error}</p>
        </div>
      </section>
    );
  }


  if (hotProducts.length === 0) {
    return (
      <section className="home-section bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="home-section-title text-4xl md:text-5xl font-extrabold mb-6 !text-white">Sản Phẩm Nổi Bật</h2>
          <p className="home-section-subtitle mb-8 !text-red-100">Hiện chưa có sản phẩm nổi bật nào. Vui lòng quay lại sau!</p>
          <ReactRouterDOM.Link to="/shop">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">Khám phá tất cả sản phẩm</Button>
          </ReactRouterDOM.Link>
        </div>
      </section>
    );
  }

  return (
    <section className="home-section bg-primary">
      <div className="container mx-auto px-4">
        <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
             <h2 className="home-section-title text-4xl md:text-5xl font-extrabold mb-4 !text-white">Sản Phẩm Nổi Bật</h2>
             <p className="home-section-subtitle !text-red-100">
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
          <ReactRouterDOM.Link to="/shop">
            <Button size="lg" variant="outline" className="px-10 py-3.5 text-base shadow-lg border-white text-white hover:bg-white hover:text-primary">
                Xem Tất Cả Sản Phẩm
            </Button>
          </ReactRouterDOM.Link>
        </div>
      </div>
    </section>
  );
};

export default HotProducts;
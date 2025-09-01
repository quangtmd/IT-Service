
import React from 'react';
import { Link } from 'react-router-dom'; // Link is compatible with v6/v7
import { MOCK_PRODUCTS } from '../../data/mockData';
import ProductCard from '../shop/ProductCard';
import Button from '../ui/Button';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const HotProducts: React.FC = () => {
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  let hotProducts = MOCK_PRODUCTS.filter(p => p.originalPrice && p.mainCategory !== "PC Xây Dựng").slice(0, 4); 
  if (hotProducts.length < 4 && MOCK_PRODUCTS.length > hotProducts.length) {
    const additionalNeeded = Math.max(0, 4 - hotProducts.length);
    const otherProducts = MOCK_PRODUCTS.filter(p => !p.originalPrice && p.mainCategory !== "PC Xây Dựng" && !hotProducts.find(hp => hp.id === p.id));
    hotProducts.push(...otherProducts.slice(0, additionalNeeded));
  }
   if (hotProducts.length === 0 && MOCK_PRODUCTS.length > 0) {
    hotProducts = MOCK_PRODUCTS.filter(p => p.mainCategory !== "PC Xây Dựng").slice(0,4);
  }


  if (hotProducts.length === 0) {
    return (
      <section className="home-section bg-bgMuted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="home-section-title mb-4">Sản Phẩm Nổi Bật</h2>
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
        <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''} flex justify-center items-center`}>
            <img src="https://picsum.photos/seed/hotProductsIcon/40/40?text=🔥" alt="" className="w-8 h-8 mr-3 object-contain hidden sm:block" />
            <div>
                <h2 className="home-section-title text-4xl md:text-5xl font-extrabold mb-6">Sản Phẩm Nổi Bật</h2>
                <p className="home-section-subtitle mt-3">
                Khám phá các linh kiện PC đang được ưa chuộng nhất và những ưu đãi đặc biệt từ chúng tôi.
                </p>
            </div>
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

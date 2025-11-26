
import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import { Product } from '../../../types';
import { getFeaturedProducts } from '../../../services/localDataService';
import CyberProductCard from '../../ui/CyberProductCard';
import Button from '../../ui/Button';
import { Canvas } from '@react-three/fiber';
import DigitalGridBackground from '../three/DigitalGridBackground';

const HomeHotProductsIts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    // Simulate network delay for smoother feeling loading state or fetching real data
    const loadProducts = async () => {
      try {
        const featured = await getFeaturedProducts();
        setProducts(featured.slice(0, 8)); // Show up to 8 items for a fuller grid
      } catch (error) {
        console.error("Failed to load featured products", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (products.length === 0 && !isLoading) return null;

  return (
    <section className="relative py-28 bg-[#020617] overflow-hidden">
       {/* 3D Background Scene - Lower opacity for readability */}
       <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
         <Canvas dpr={[1, 2]} performance={{ min: 0.5 }}>
            <Suspense fallback={null}>
                <DigitalGridBackground />
            </Suspense>
         </Canvas>
       </div>
       
       {/* Ambient Lighting Effects */}
       <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
       <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

       <div className="container mx-auto px-4 relative z-20">
          {/* Section Header */}
          <div ref={titleRef} className={`text-center mb-20 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 text-xs font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Bộ Sưu Tập
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white font-sans leading-tight">
                CÔNG NGHỆ <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 filter drop-shadow-lg">TIÊN PHONG</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                Tuyển tập những linh kiện và thiết bị hiệu năng cao, được tuyển chọn kỹ lưỡng để nâng tầm trải nghiệm kỹ thuật số của bạn.
            </p>
          </div>

          {/* Product Grid */}
          {isLoading ? (
             <div className="flex justify-center items-center h-96">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>
                    </div>
                </div>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {products.map((product, index) => (
                    <div 
                        key={product.id} 
                        className={`animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <CyberProductCard product={product} />
                    </div>
                ))}
            </div>
          )}
          
          {/* Footer Action */}
          <div className="mt-20 text-center animate-on-scroll fade-in-up is-visible" style={{animationDelay: '0.4s'}}>
             <Link to="/shop">
                <Button variant="primary" size="lg" className="bg-transparent border-2 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 px-10 py-4 tracking-widest font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300">
                    XEM TẤT CẢ SẢN PHẨM
                </Button>
             </Link>
          </div>
       </div>
    </section>
  );
};

export default HomeHotProductsIts;

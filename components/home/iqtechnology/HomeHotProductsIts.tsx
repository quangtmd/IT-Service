
import React, { useState, useEffect, useCallback, Suspense } from 'react';
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
    const loadProducts = async () => {
      try {
        const featured = await getFeaturedProducts();
        setProducts(featured.slice(0, 4)); // Limit to 4 items for this section
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
    <section className="relative py-24 bg-[#020617] overflow-hidden">
       {/* 3D Background Scene */}
       <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
         <Canvas>
            <Suspense fallback={null}>
                <DigitalGridBackground />
            </Suspense>
         </Canvas>
       </div>
       
       {/* Top Gradient Overlay */}
       <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#020617] to-transparent z-10 pointer-events-none"></div>

       <div className="container mx-auto px-4 relative z-20">
          <div ref={titleRef} className={`text-center mb-16 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                SẢN PHẨM NỔI BẬT
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-white font-sans">
                CÔNG NGHỆ <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">TIÊN PHONG</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Tuyển tập những linh kiện và thiết bị hiệu năng cao được săn đón nhất hiện nay.
            </p>
          </div>

          {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product, index) => (
                    <div 
                        key={product.id} 
                        className={`animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''} h-full`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <CyberProductCard product={product} />
                    </div>
                ))}
            </div>
          )}
          
          <div className="mt-12 text-center animate-on-scroll fade-in-up is-visible" style={{animationDelay: '0.4s'}}>
             <Link to="/shop">
                <Button variant="outline" size="lg" className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 hover:text-white px-8 py-4 tracking-wider font-bold">
                    XEM TẤT CẢ SẢN PHẨM
                </Button>
             </Link>
          </div>
       </div>
    </section>
  );
};

export default HomeHotProductsIts;


import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import { Canvas } from '@react-three/fiber';
import TechShapes from '../three/TechShapes';
import { useTheme } from '../../../contexts/ThemeContext';

const HomeHero3D: React.FC = () => {
  const { theme } = useTheme();

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-bgCanvas">
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas className="w-full h-full">
          <Suspense fallback={null}>
            <TechShapes />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient Overlay for readability */}
      <div className={`absolute inset-0 z-10 pointer-events-none bg-gradient-to-b ${theme === 'dark' ? 'from-transparent via-slate-900/50 to-slate-900' : 'from-transparent via-white/30 to-white'}`}></div>
      
      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="container mx-auto px-4 text-center pointer-events-auto">
          <div className="animate-on-scroll fade-in-up is-visible backdrop-blur-sm bg-white/10 dark:bg-black/30 p-8 rounded-2xl border border-white/20 shadow-2xl inline-block max-w-4xl">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary border border-primary/50 text-sm font-bold tracking-wider mb-6 animate-pulse">
              CÔNG NGHỆ CỦA TƯƠNG LAI
            </span>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-red-500 to-yellow-500 drop-shadow-sm">
                IQ TECHNOLOGY
              </span>
              <br />
              <span className={`text-4xl md:text-6xl ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Giải Pháp IT Toàn Diện
              </span>
            </h1>
            
            <p className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Chúng tôi mang đến sức mạnh công nghệ để nâng tầm doanh nghiệp của bạn. Từ linh kiện PC cao cấp đến các giải pháp phần mềm đột phá.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/shop">
                <Button 
                  size="lg" 
                  variant="primary" 
                  className="px-8 py-4 text-lg font-bold shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
                >
                  <i className="fas fa-shopping-cart mr-2"></i> Mua Sắm Ngay
                </Button>
              </Link>
              <Link to="/services">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={`px-8 py-4 text-lg font-bold border-2 backdrop-blur-md hover:scale-105 transition-all duration-300 ${theme === 'dark' ? 'text-white border-white hover:bg-white hover:text-black' : 'text-gray-800 border-gray-800 hover:bg-gray-800 hover:text-white'}`}
                >
                  Dịch Vụ IT <i className="fas fa-arrow-right ml-2"></i>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero3D;


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
      <div className="absolute inset-0 z-0 bg-black">
        <Canvas className="w-full h-full">
          <Suspense fallback={null}>
            <TechShapes />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient Overlay for readability */}
      <div className={`absolute inset-0 z-10 pointer-events-none bg-gradient-to-b ${theme === 'dark' ? 'from-transparent via-slate-900/10 to-slate-900' : 'from-transparent via-white/10 to-white'}`}></div>
      
      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="container mx-auto px-4 text-center pointer-events-auto">
          <div className="animate-on-scroll fade-in-up is-visible backdrop-blur-md bg-black/40 p-8 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,243,255,0.1)] inline-block max-w-4xl">
            <div className="mb-6 flex justify-center">
               <span className="inline-flex items-center py-1 px-3 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 text-sm font-bold tracking-widest uppercase animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2 animate-ping"></span>
                  Công nghệ tương lai
               </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                IQ TECHNOLOGY
              </span>
              <br />
              <span className="text-4xl md:text-6xl text-gray-100">
                Giải Pháp IT Toàn Diện
              </span>
            </h1>
            
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-gray-300">
              Chúng tôi mang đến sức mạnh công nghệ để nâng tầm doanh nghiệp của bạn. Từ linh kiện PC cao cấp đến các giải pháp phần mềm đột phá.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/shop">
                <Button 
                  size="lg" 
                  className="px-8 py-4 text-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300 border-none"
                >
                  <i className="fas fa-microchip mr-2"></i> Mua Linh Kiện
                </Button>
              </Link>
              <Link to="/services">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-4 text-lg font-bold border-2 border-white/30 text-white hover:bg-white hover:text-black backdrop-blur-sm hover:border-white transition-all duration-300"
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


import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import { Canvas } from '@react-three/fiber';
import DigitalGridBackground from '../three/DigitalGridBackground'; 
import { useTheme } from '../../../contexts/ThemeContext';
import HeroLEDBoard from './HeroLEDBoard';

const HomeHero3D: React.FC = () => {
  const { theme } = useTheme();

  return (
    <section className="relative w-full h-[90vh] min-h-[600px] overflow-hidden bg-black">
      {/* 3D Background Layer - Digital Moving Grid */}
      <div className="absolute inset-0 z-0">
        <Canvas className="w-full h-full" dpr={[1, 2]}>
          <Suspense fallback={null}>
            <DigitalGridBackground />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient Overlay for text readability - Adjusted to be clearer on the right side */}
      <div className={`absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-black/80 via-black/40 to-transparent`}></div>
      
      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex items-center pointer-events-none">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Main Text */}
            <div className="lg:col-span-7 animate-on-scroll fade-in-up is-visible text-center lg:text-left">
              <div className="mb-6 lg:mb-8 flex justify-center lg:justify-start">
                 <span className="inline-flex items-center py-1.5 px-4 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-xs font-bold tracking-[0.2em] uppercase animate-pulse backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 mr-3 animate-ping"></span>
                    Hệ Thống Thông Minh
                 </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-none tracking-tight text-white drop-shadow-2xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-500 filter drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                  IQ TECHNOLOGY
                </span>
                <br />
                <span className="text-3xl sm:text-5xl md:text-6xl text-gray-200 font-bold mt-4 block tracking-normal">
                  Kỷ Nguyên Số Hóa
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl mb-10 lg:mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-gray-300 font-light lg:border-l-4 border-cyan-500 lg:pl-6 bg-gradient-to-r from-black/60 to-transparent backdrop-blur-sm p-4 rounded-r-xl">
                Giải pháp IT toàn diện, bảo mật tối đa và hiệu năng vượt trội cho doanh nghiệp của bạn.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start items-center w-full sm:w-auto px-4 sm:px-0">
                <Link to="/shop" className="w-full sm:w-auto group">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-10 py-4 text-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_30px_rgba(8,145,178,0.4)] hover:shadow-[0_0_50px_rgba(8,145,178,0.7)] hover:scale-105 transition-all duration-300 border-none ring-1 ring-cyan-400/50 relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center"><i className="fas fa-server mr-3"></i> Mua Sắm</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                  </Button>
                </Link>
                <Link to="/services" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto px-10 py-4 text-lg font-bold border-2 border-cyan-500/30 text-cyan-100 hover:bg-cyan-900/40 hover:text-white backdrop-blur-md hover:border-cyan-400 transition-all duration-300 shadow-lg"
                  >
                    Dịch Vụ <i className="fas fa-arrow-right ml-3"></i>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: LED Board */}
            <div className="lg:col-span-5 hidden lg:flex justify-center lg:justify-end items-center animate-on-scroll slide-in-right is-visible" style={{animationDelay: '0.5s'}}>
               <HeroLEDBoard />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero3D;


import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import { Canvas } from '@react-three/fiber';
import ServerTechScene from '../three/ServerTechScene'; 
import { useTheme } from '../../../contexts/ThemeContext';
import HeroLEDBoard from './HeroLEDBoard';

const HomeHero3D: React.FC = () => {
  const { theme } = useTheme();

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-bgCanvas">
      {/* 3D Background Layer - Server Room Simulation */}
      <div className="absolute inset-0 z-0 bg-black">
        <Canvas className="w-full h-full">
          <Suspense fallback={null}>
            <ServerTechScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient Overlay for text readability - Reduced opacity for better visibility of racks */}
      <div className={`absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-black/80 via-black/40 to-transparent`}></div>
      
      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex items-center pointer-events-none">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Main Text */}
            <div className="lg:col-span-7 animate-on-scroll fade-in-up is-visible text-center lg:text-left">
              <div className="mb-4 lg:mb-6 flex justify-center lg:justify-start">
                 <span className="inline-flex items-center py-1 px-3 rounded-full bg-cyan-900/50 text-cyan-300 border border-cyan-500/50 text-xs font-bold tracking-widest uppercase animate-pulse backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 animate-ping"></span>
                    Hệ Thống Thông Minh
                 </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 lg:mb-6 leading-tight tracking-tight text-white drop-shadow-xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                  IQ TECHNOLOGY
                </span>
                <br />
                <span className="text-2xl sm:text-4xl md:text-6xl text-gray-100 font-bold mt-2 block">
                  Kỷ Nguyên Số Hóa
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl mb-8 lg:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed text-gray-300 font-light lg:border-l-4 border-cyan-500 lg:pl-6 bg-black/30 lg:bg-black/20 backdrop-blur-sm p-3 rounded-lg lg:rounded-r-lg">
                Giải pháp IT toàn diện, bảo mật tối đa và hiệu năng vượt trội cho doanh nghiệp của bạn.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center w-full sm:w-auto px-4 sm:px-0">
                <Link to="/shop" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-8 py-3.5 text-base font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.6)] hover:scale-105 transition-all duration-300 border-none ring-2 ring-cyan-400/20"
                  >
                    <i className="fas fa-server mr-2"></i> Mua Sắm
                  </Button>
                </Link>
                <Link to="/services" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto px-8 py-3.5 text-base font-bold border-2 border-cyan-400/50 text-cyan-100 hover:bg-cyan-900/50 hover:text-white backdrop-blur-md hover:border-cyan-400 transition-all duration-300"
                  >
                    Dịch Vụ <i className="fas fa-arrow-right ml-2"></i>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: LED Board (Hidden on mobile/tablet, shown on desktop) */}
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

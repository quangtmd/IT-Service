
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
      {/* Static Background Fallback - Ensures screen isn't pitch black if 3D fails */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=1920&auto=format&fit=crop')" }}
      ></div>

      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0 bg-black/80">
        <Canvas className="w-full h-full" dpr={[1, 2]}>
          <Suspense fallback={null}>
            <ServerTechScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient Overlay for text readability - Reduced opacity for better visibility of racks */}
      <div className={`absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-black/70 via-black/30 to-transparent`}></div>
      
      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex items-center pointer-events-none">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Main Text */}
            <div className="lg:col-span-7 animate-on-scroll fade-in-up is-visible">
              <div className="mb-6 flex justify-start">
                 <span className="inline-flex items-center py-1.5 px-4 rounded-full bg-cyan-900/50 text-cyan-300 border border-cyan-500/50 text-sm font-bold tracking-widest uppercase animate-pulse backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 mr-3 animate-ping"></span>
                    Hệ Thống Quản Trị Thông Minh
                 </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white drop-shadow-xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                  IQ TECHNOLOGY
                </span>
                <br />
                <span className="text-4xl md:text-6xl text-gray-100 font-bold">
                  Kỷ Nguyên Dữ Liệu Số
                </span>
              </h1>
              
              <p className="text-lg md:text-xl mb-10 max-w-2xl leading-relaxed text-gray-200 font-light border-l-4 border-cyan-500 pl-6 bg-black/20 backdrop-blur-sm p-4 rounded-r-lg">
                Vận hành doanh nghiệp của bạn với sức mạnh của hạ tầng máy chủ tiên tiến. Giải pháp IT toàn diện, bảo mật tối đa và hiệu năng vượt trội.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-start items-center sm:items-start">
                <Link to="/shop">
                  <Button 
                    size="lg" 
                    className="px-8 py-4 text-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] hover:scale-105 transition-all duration-300 border-none ring-2 ring-cyan-400/20"
                  >
                    <i className="fas fa-server mr-3"></i> Xây Dựng Hạ Tầng
                  </Button>
                </Link>
                <Link to="/services">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="px-8 py-4 text-lg font-bold border-2 border-cyan-400/50 text-cyan-100 hover:bg-cyan-900/50 hover:text-white backdrop-blur-md hover:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                  >
                    Dịch Vụ IT <i className="fas fa-arrow-right ml-2"></i>
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

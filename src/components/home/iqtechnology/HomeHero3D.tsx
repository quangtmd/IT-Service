
import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import { Canvas } from '@react-three/fiber';
import ServerTechScene from '../three/ServerTechScene'; 
import HeroLEDBoard from './HeroLEDBoard';

const HomeHero3D: React.FC = () => {
  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-[#020617] flex items-center">
      
      {/* 3D Scene Background (Absolute) */}
      <div className="absolute inset-0 z-0">
        <Canvas className="w-full h-full" shadows dpr={[1, 2]} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <ServerTechScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Decorative Gradients for Text Readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#020617] via-[#020617]/60 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#020617] via-transparent to-transparent pointer-events-none"></div>

      {/* Content Overlay */}
      <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 animate-fade-in-up">
                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    Future Ready Hardware
                 </div>

                 <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                    BUILD YOUR <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 text-glow">
                        DREAM MACHINE
                    </span>
                 </h1>

                 <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg font-light">
                    Trải nghiệm hiệu năng đỉnh cao với linh kiện PC chính hãng và dịch vụ Build PC chuyên nghiệp từ IQ Technology.
                 </p>

                 <div className="flex flex-wrap gap-4">
                    <Link to="/pc-builder">
                        <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-[0_0_20px_rgba(8,145,178,0.5)] px-8 py-4 text-base font-bold uppercase tracking-wide">
                            <i className="fas fa-tools mr-2"></i> Build PC Ngay
                        </Button>
                    </Link>
                    <Link to="/services">
                        <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-base font-bold uppercase tracking-wide backdrop-blur-md">
                            Dịch vụ IT
                        </Button>
                    </Link>
                 </div>

                 {/* Stats */}
                 <div className="mt-12 flex gap-8 border-t border-white/10 pt-6">
                    <div>
                        <p className="text-3xl font-bold text-white">5K+</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Khách hàng</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">100%</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Chính hãng</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">24/7</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Hỗ trợ</p>
                    </div>
                 </div>
            </div>

            {/* Right Content - LED Board & Space for 3D */}
            <div className="lg:col-span-6 hidden lg:flex justify-end items-center relative pointer-events-none">
                 {/* The 3D model is behind this, but we can place the HUD here */}
                 <div className="absolute top-0 right-0 pointer-events-auto transform translate-y-12">
                     <HeroLEDBoard />
                 </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero3D;

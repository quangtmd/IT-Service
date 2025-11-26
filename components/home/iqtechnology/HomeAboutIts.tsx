
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { SiteSettings } from '../../../types';
import MovingBorderButton from '../../ui/MovingBorderButton';
import { Canvas } from '@react-three/fiber';
import FloatingElements from '../three/FloatingElements';

const HomeAboutIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const aboutConfig = settings.homepageAbout;

  const loadSettings = useCallback(() => {
    const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    if (storedSettingsRaw) {
      setSettings(JSON.parse(storedSettingsRaw));
    }
  }, []);

  useEffect(() => {
    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => window.removeEventListener('siteSettingsUpdated', loadSettings);
  }, [loadSettings]);

  if (!aboutConfig.enabled) return null;

  return (
    <section ref={sectionRef} className={`py-28 bg-[#020617] text-white relative overflow-hidden animate-on-scroll fade-in-up ${isSectionVisible ? 'is-visible' : ''}`}>
      {/* 3D Background Scene */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Canvas>
            <Suspense fallback={null}>
                <FloatingElements />
            </Suspense>
        </Canvas>
      </div>
      
      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617] z-0 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="max-w-5xl mx-auto">
             {/* Decorative Line */}
             <div className="w-1 h-20 bg-gradient-to-b from-transparent via-cyan-500 to-transparent mx-auto mb-8 opacity-50"></div>

             {aboutConfig.preTitle && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    {aboutConfig.preTitle}
                </div>
             )}

             <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight drop-shadow-2xl">
                {aboutConfig.title}
             </h2>

             <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed font-light max-w-3xl mx-auto text-shadow-sm">
                {aboutConfig.description}
             </p>

             <div className="flex flex-col sm:flex-row justify-center gap-6 items-center mb-12">
                {aboutConfig.features.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center p-6 backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors duration-300 w-full sm:w-64 group">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-300 text-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform">
                            <i className={item.icon || 'fas fa-star'}></i>
                        </div>
                        <h4 className="font-bold text-white uppercase tracking-wide text-sm mb-2">{item.title}</h4>
                        <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
                    </div>
                ))}
             </div>

             <div className="mt-4">
                <Link to={aboutConfig.buttonLink || '/about'}>
                    <MovingBorderButton>
                        {aboutConfig.buttonText || "KHÁM PHÁ THÊM"}
                    </MovingBorderButton>
                </Link>
             </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAboutIts;

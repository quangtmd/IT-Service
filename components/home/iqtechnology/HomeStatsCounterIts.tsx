
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { SiteSettings, HomepageStatItem } from '../../../types';
import SpotlightCard from '../../ui/SpotlightCard';
import { Canvas } from '@react-three/fiber';
import PulsingCoreScene from '../three/PulsingCoreScene';

const StatDisplayItem: React.FC<{ stat: HomepageStatItem; index: number }> = ({ stat, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2, triggerOnce: true });
  
  return (
    <div 
      ref={ref}
      className={`animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
        <SpotlightCard 
            className="flex flex-col items-center justify-center text-center h-full !p-8 bg-white/5 border-white/10 backdrop-blur-md transition-all duration-500 
                       hover:-translate-y-3 hover:bg-white/10 hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] group cursor-default relative z-10"
            spotlightColor="rgba(139, 92, 246, 0.2)"
        >
            <div className="mb-5 p-5 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)] 
                            group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] group-hover:bg-purple-500/30 transition-all duration-500 group-hover:rotate-[360deg]">
               <i className={`${stat.iconClass || 'fas fa-chart-line'} text-3xl text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-cyan-400 group-hover:to-white`}></i>
            </div>
            <h3 className="text-5xl font-black text-white mb-2 tracking-tighter drop-shadow-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all">
                {stat.count}
            </h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] group-hover:text-cyan-300 transition-colors">{stat.label}</p>
        </SpotlightCard>
    </div>
  );
};

const HomeStatsCounterIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const statsConfig = settings.homepageStatsCounter;

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
  
  if (!statsConfig.enabled || !statsConfig.stats || statsConfig.stats.length === 0) return null;

  const sortedStats = [...statsConfig.stats].sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="py-24 bg-[#020617] text-white relative border-t border-white/5 overflow-hidden">
         {/* 3D Background Scene */}
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
            <Canvas>
                <Suspense fallback={null}>
                    <PulsingCoreScene />
                </Suspense>
            </Canvas>
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#020617]/60 z-0 pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
            <div ref={titleRef} className={`text-center mb-16 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight font-sans drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    CHỈ SỐ HIỆU SUẤT
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
                    Phân tích thời gian thực và thành tựu được hỗ trợ bởi công nghệ tiên tiến.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedStats.map((stat, index) => (
                <StatDisplayItem key={stat.id || index} stat={stat} index={index} />
            ))}
            </div>
        </div>
    </section>
  );
};

export default HomeStatsCounterIts;

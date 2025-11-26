
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
        <SpotlightCard className="flex flex-col items-center justify-center text-center h-full !p-8 bg-white/5 border-white/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <div className="mb-4 p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:scale-110 transition-transform duration-300">
               <i className={`${stat.iconClass || 'fas fa-chart-line'} text-3xl text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-cyan-400`}></i>
            </div>
            <h3 className="text-5xl font-bold text-white mb-2 tracking-tighter">{stat.count}</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
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
    <section className="py-20 bg-[#020617] text-white relative border-t border-white/5 overflow-hidden">
         {/* 3D Background Scene */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <Canvas>
                <Suspense fallback={null}>
                    <PulsingCoreScene />
                </Suspense>
            </Canvas>
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <div ref={titleRef} className={`text-center mb-16 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    CHỈ SỐ HIỆU SUẤT
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
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

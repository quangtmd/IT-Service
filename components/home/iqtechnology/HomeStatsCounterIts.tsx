
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageStatItem } from '../../../types';
import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

const StatDisplayItem: React.FC<{ stat: HomepageStatItem; index: number }> = ({ stat, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2, triggerOnce: true });
  
  return (
    <div 
      ref={ref}
      className={`relative text-center p-6 animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} flex flex-col items-center group transition-all duration-300
                 bg-white/5 backdrop-blur-md rounded-2xl border-2 border-white/10 shadow-lg hover:border-cyan-400/50 hover:shadow-cyan-500/20 hover:-translate-y-2`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none rounded-2xl"></div>
        
        <div className="mb-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            <div className="w-16 h-16 flex items-center justify-center text-white bg-black/20 rounded-full shadow-inner border-2 border-white/10">
               <i className={`${stat.iconClass || 'fas fa-star'} text-3xl text-cyan-300`}></i>
            </div>
        </div>
        <div className="text-left sm:text-center">
            <h3 className="text-5xl font-bold mb-1 text-white group-hover:text-cyan-300 transition-colors drop-shadow-md">{stat.count}</h3>
            <p className="text-gray-300 text-sm font-medium">{stat.label}</p>
        </div>
    </div>
  );
};

const HomeStatsCounterIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const statsConfig = settings.homepageStatsCounter;

  const loadSettings = useCallback(() => {
    const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    if (storedSettingsRaw) {
      setSettings(JSON.parse(storedSettingsRaw));
    } else {
      setSettings(Constants.INITIAL_SITE_SETTINGS);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadSettings);
    };
  }, [loadSettings]);
  
  if (!statsConfig.enabled || !statsConfig.stats || statsConfig.stats.length === 0) return null;

  const sortedStats = [...statsConfig.stats].sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="py-12 md:py-20 bg-[#0B1120] text-white relative">
        <div className="absolute inset-0 z-0">
            <Canvas>
                <Suspense fallback={null}>
                    <Sparkles count={300} scale={20} size={1} speed={0.2} color="#00f3ff" opacity={0.5} />
                </Suspense>
            </Canvas>
        </div>
        <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sortedStats.map((stat: HomepageStatItem, index) => (
                <StatDisplayItem key={stat.id || index} stat={stat} index={index} />
            ))}
            </div>
        </div>
    </section>
  );
};

export default HomeStatsCounterIts;


import React, { useState, useEffect, useCallback } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageStatItem } from '../../../types';

const StatDisplayItem: React.FC<{ stat: HomepageStatItem; index: number }> = ({ stat, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2, triggerOnce: true });
  
  return (
    <div 
      key={stat.id || index} 
      ref={ref}
      className={`text-center p-6 animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} group relative`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="absolute inset-y-4 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block hidden last:hidden"></div>
      
      <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-900/20 transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
         <i className={`${stat.iconClass || 'fas fa-star'} text-3xl text-gray-400 group-hover:text-cyan-400 transition-colors`}></i>
      </div>
      
      <div className="relative">
        <h3 className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-cyan-400 transition-all">
            {stat.count}
        </h3>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
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
    <section className="py-12 relative z-20 -mt-10 mb-10">
      <div className="container mx-auto px-4">
        {/* Glass Container */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-4 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {sortedStats.map((stat: HomepageStatItem, index) => (
                <div key={stat.id || index} className={`${index < sortedStats.length - 1 ? 'lg:border-r border-white/5' : ''}`}>
                    <StatDisplayItem stat={stat} index={index} />
                </div>
            ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default HomeStatsCounterIts;

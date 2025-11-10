import React, { useState, useEffect, useCallback } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { SiteSettings, HomepageStatItem } from '../../../types';

// New sub-component to handle individual stat item's intersection observation
const StatDisplayItem: React.FC<{ stat: HomepageStatItem; index: number }> = ({ stat, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2, triggerOnce: true });
  
  return (
    <div 
      key={stat.id || index} 
      ref={ref}
      className={`text-center p-4 animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} flex items-center sm:flex-col lg:flex-row group`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="mb-0 sm:mb-5 lg:mb-0 mr-5 lg:mr-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-white bg-white/30 rounded-full p-3.5 shadow-lg border-2 border-white/50">
           <i className={`${stat.iconClass || 'fas fa-star'} text-3xl sm:text-4xl`}></i>
        </div>
      </div>
      <div className="text-left sm:text-center lg:text-left">
        <h3 className="text-4xl sm:text-5xl font-bold mb-1 group-hover:text-yellow-300 transition-colors">{stat.count}</h3>
        <p className="text-red-100 text-sm sm:text-base font-medium">{stat.label}</p>
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
    <section className="py-12 md:py-20 bg-gradient-to-r from-primary to-red-600 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {sortedStats.map((stat: HomepageStatItem, index) => (
            <StatDisplayItem key={stat.id || index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeStatsCounterIts;

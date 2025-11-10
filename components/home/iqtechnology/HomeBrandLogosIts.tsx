import React, { useState, useEffect, useCallback } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { SiteSettings, HomepageBrandLogo } from '../../../types';

const HomeBrandLogosIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  
  const brandLogosConfig = settings.homepageBrandLogos;

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

  if (!brandLogosConfig.enabled || !brandLogosConfig.logos || brandLogosConfig.logos.length === 0) return null;
  
  const sortedLogos = [...brandLogosConfig.logos].sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <div ref={ref} className={`py-12 md:py-20 bg-bgMuted animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-10 md:gap-x-20 lg:gap-x-24">
          {sortedLogos.map((brand: HomepageBrandLogo, index) => (
            <div 
              key={brand.id || index} 
              className="opacity-60 hover:opacity-100 transition-all duration-300 filter grayscale hover:grayscale-0 transform hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }} 
            >
              <img src={brand.logoUrl || `https://picsum.photos/seed/defaultBrand${index}/180/80?grayscale&text=${brand.name || 'Brand'}`} alt={brand.name} className="h-10 md:h-12 object-contain" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeBrandLogosIts;

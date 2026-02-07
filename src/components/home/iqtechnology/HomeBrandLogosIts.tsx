
import React, { useState, useEffect, useCallback } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
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
    <div ref={ref} className={`py-12 animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}>
      <div className="container mx-auto px-4">
        <p className="text-center text-gray-500 text-xs uppercase tracking-[0.3em] mb-8 font-mono">Trusted Partners & Brands</p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-10 md:gap-x-20 lg:gap-x-24 opacity-70">
          {sortedLogos.map((brand: HomepageBrandLogo, index) => (
            <div 
              key={brand.id || index} 
              className="transition-all duration-300 filter grayscale brightness-200 hover:grayscale-0 hover:brightness-100 transform hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ animationDelay: `${index * 100}ms` }} 
            >
              <img src={brand.logoUrl || `https://picsum.photos/seed/defaultBrand${index}/180/80?grayscale&text=${brand.name || 'Brand'}`} alt={brand.name} className="h-8 md:h-10 object-contain opacity-60 hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeBrandLogosIts;

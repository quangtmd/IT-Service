import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import * as Constants from '../../constants.tsx';
import { SiteSettings, HomepageBannerSettings } from '../../types';

const HeroBanner: React.FC = () => {
  const [banners, setBanners] = useState<HomepageBannerSettings[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadBanners = useCallback(() => {
    const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    const siteSettings: SiteSettings = storedSettingsRaw ? JSON.parse(storedSettingsRaw) : Constants.INITIAL_SITE_SETTINGS;
    
    const bannerData = (siteSettings.homepageBanners && Array.isArray(siteSettings.homepageBanners) && siteSettings.homepageBanners.length > 0)
      ? siteSettings.homepageBanners
      : Constants.INITIAL_SITE_SETTINGS.homepageBanners;
      
    const activeBanners = bannerData.filter(b => b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    setBanners(activeBanners.length > 0 ? activeBanners : bannerData.slice(0, 1));
  }, []);

  useEffect(() => {
    loadBanners();
    window.addEventListener('siteSettingsUpdated', loadBanners);
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadBanners);
    };
  }, [loadBanners]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
    }, 7000); // Cycle every 7 seconds
    return () => clearInterval(timer);
  }, [banners]);

  if (banners.length === 0) {
    return <div className="relative text-white py-20 px-4 md:py-32 bg-gray-900 min-h-[500px] flex items-center justify-center"><p>Loading Banner...</p></div>;
  }
  
  const currentBanner = banners[currentIndex];
  
  const bannerSlides = banners.map((banner, index) => (
      <div
          key={banner.id}
          className="banner-bg-slide"
          style={{
              backgroundImage: `url('${banner.backgroundImageUrl}')`,
              opacity: index === currentIndex ? 1 : 0,
          }}
      />
  ));

  return (
    <div className="relative text-white py-20 px-4 md:py-32 bg-black overflow-hidden min-h-[500px] flex items-center">
      {bannerSlides}
      <div className="absolute inset-0 bg-black opacity-50 z-[2]"></div>

      <div className="container mx-auto text-center relative z-[3]">
        {/* Key forces re-render which can help re-trigger animations if needed, but primarily ensures clean state change */}
        <div key={currentIndex}> 
            {currentBanner.preTitle && (
              <span className="block text-sm font-semibold text-primary uppercase tracking-wider mb-4 drop-shadow-sm">
                {currentBanner.preTitle}
              </span>
            )}
            <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg"
                dangerouslySetInnerHTML={{ __html: currentBanner.title }}
            ></h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl mx-auto drop-shadow-md">
              {currentBanner.subtitle}
            </p>
            <div className="space-x-0 space-y-4 sm:space-y-0 sm:space-x-4">
              {currentBanner.primaryButtonLink && currentBanner.primaryButtonText && (
                  <Link to={currentBanner.primaryButtonLink}>
                    <Button size="lg" variant="primary" className="w-full sm:w-auto">
                      {currentBanner.primaryButtonText}
                    </Button>
                  </Link>
              )}
              {currentBanner.secondaryButtonLink && currentBanner.secondaryButtonText && (
                  <Link to={currentBanner.secondaryButtonLink}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary"
                    >
                      {currentBanner.secondaryButtonText}
                    </Button>
                  </Link>
              )}
            </div>
        </div>
      </div>
      
       {/* Slideshow Dots */}
      {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[4] flex space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-primary scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
      )}
    </div>
  );
};

export default HeroBanner;
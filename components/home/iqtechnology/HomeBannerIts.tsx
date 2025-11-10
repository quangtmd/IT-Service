import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../../ui/Button';
import * as Constants from '../../../constants';
import { SiteSettings, HomepageBannerSettings } from '../../../types';

const HomeBannerIts: React.FC = () => {
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
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(timer);
  }, [banners]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (banners.length === 0) {
    return <div className="h-[90vh] min-h-[600px] bg-gray-800 flex items-center justify-center"><p className="text-white">Loading Banners...</p></div>;
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative text-white h-[90vh] min-h-[600px] max-h-[800px] flex items-center overflow-hidden">
      {/* Background Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id || index}
          className="banner-bg-slide"
          style={{
            backgroundImage: `url('${banner.backgroundImageUrl}')`,
            opacity: index === currentIndex ? 1 : 0,
            zIndex: 1,
          }}
        ></div>
      ))}
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      {/* Decorative Elements */}
      {currentBanner.decorTopLeftImageUrl && <img src={currentBanner.decorTopLeftImageUrl} alt="" className="absolute top-0 left-0 w-1/4 max-w-xs opacity-50 z-20 pointer-events-none" />}
      {currentBanner.decorBottomRightImageUrl && <img src={currentBanner.decorBottomRightImageUrl} alt="" className="absolute bottom-0 right-0 w-1/3 max-w-md opacity-50 z-20 pointer-events-none" />}

      {/* Text Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full h-full flex items-center text-left">
        <div className="max-w-2xl">
          <div key={currentIndex} className="animate-on-scroll fade-in-up is-visible">
            {currentBanner.preTitle && (
              <span className="block text-sm font-semibold text-primary uppercase tracking-wider mb-4 drop-shadow-sm">
                {currentBanner.preTitle}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-condensed font-bold mb-6 leading-tight text-white drop-shadow-md"
                dangerouslySetInnerHTML={{ __html: currentBanner.title }}>
            </h1>
            <p className="text-lg text-gray-200 mb-10 drop-shadow-sm">
              {currentBanner.subtitle}
            </p>
            <div className="space-y-3 sm:space-y-0 sm:space-x-4">
              {currentBanner.primaryButtonLink && currentBanner.primaryButtonText && (
                <ReactRouterDOM.Link to={currentBanner.primaryButtonLink}>
                  <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 py-3.5 text-base shadow-lg hover:shadow-primary/40 transform hover:scale-105">
                    {currentBanner.primaryButtonText} <i className="fas fa-arrow-right ml-2 text-sm"></i>
                  </Button>
                </ReactRouterDOM.Link>
              )}
              {currentBanner.secondaryButtonLink && currentBanner.secondaryButtonText && (
                <ReactRouterDOM.Link to={currentBanner.secondaryButtonLink}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-8 py-3.5 text-base shadow-md border-white text-white hover:bg-white hover:text-primary transform hover:scale-105"
                  >
                    {currentBanner.secondaryButtonText}
                  </Button>
                </ReactRouterDOM.Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Slideshow Dots */}
      {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-primary scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
      )}
    </section>
  );
};

export default HomeBannerIts;

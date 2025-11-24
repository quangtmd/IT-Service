
import React, { useState, useEffect, useCallback } from 'react';
// Fix: Use named import for Link
import { Link } from 'react-router-dom';
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
    }, 6000); // Increased duration for better readability

    return () => clearInterval(timer);
  }, [banners]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (banners.length === 0) {
    return <div className="h-[90vh] min-h-[600px] bg-gray-900 flex items-center justify-center"><p className="text-white animate-pulse">Loading Experiences...</p></div>;
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative text-white h-[85vh] min-h-[600px] max-h-[900px] flex items-center overflow-hidden bg-black">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 z-10 opacity-20" 
           style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.4\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}>
      </div>

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
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div key={currentIndex} className="animate-on-scroll fade-in-up is-visible">
                {currentBanner.preTitle && (
                  <span className="inline-block text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-yellow-400 uppercase tracking-[0.2em] mb-4 animate-pulse">
                    {currentBanner.preTitle}
                  </span>
                )}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] text-white drop-shadow-lg font-condensed tracking-tight">
                    <span className="block text-gradient">{currentBanner.title.split(' ').slice(0,2).join(' ')}</span>
                    <span className="block">{currentBanner.title.split(' ').slice(2).join(' ')}</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed border-l-4 border-primary pl-6">
                  {currentBanner.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                  {currentBanner.primaryButtonLink && currentBanner.primaryButtonText && (
                    // Fix: Use Link directly
                    <Link to={currentBanner.primaryButtonLink}>
                      <Button size="lg" variant="primary" className="w-full sm:w-auto px-10 py-4 text-lg font-bold shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-105 transition-all duration-300 border border-primary">
                        {currentBanner.primaryButtonText} <i className="fas fa-arrow-right ml-3"></i>
                      </Button>
                    </Link>
                  )}
                  {currentBanner.secondaryButtonLink && currentBanner.secondaryButtonText && (
                    // Fix: Use Link directly
                    <Link to={currentBanner.secondaryButtonLink}>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto px-10 py-4 text-lg font-bold border-2 border-white/30 text-white hover:bg-white hover:text-black hover:border-white backdrop-blur-sm transition-all duration-300"
                      >
                        {currentBanner.secondaryButtonText}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            {/* Right: Image or Decor */}
            <div className="hidden lg:flex lg:col-span-5 justify-center items-center relative">
                {currentBanner.rightColumnImageUrl && (
                    <div className="relative animate-float">
                        {/* Glow effect behind image */}
                        <div className="absolute inset-0 bg-primary rounded-full filter blur-[100px] opacity-30"></div>
                        <img 
                            src={currentBanner.rightColumnImageUrl} 
                            alt={currentBanner.imageAltText || currentBanner.title}
                            className="relative z-10 max-w-full w-auto max-h-[500px] drop-shadow-2xl transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500"
                        />
                        {/* Decorative floating elements */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Slideshow Dots */}
      {banners.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex space-x-4 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${currentIndex === index ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white'}`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
      )}
    </section>
  );
};

export default HomeBannerIts;

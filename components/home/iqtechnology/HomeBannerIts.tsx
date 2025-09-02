
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Link is compatible with v6/v7
import Button from '../../ui/Button';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageBannerSettings } from '../../../types';

const HomeBannerIts: React.FC = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [activeBanner, setActiveBanner] = useState<HomepageBannerSettings | null>(null);
  const [startTextAnimation, setStartTextAnimation] = useState(false);

  const loadSettings = useCallback(() => {
    const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    let currentSiteSettings = Constants.INITIAL_SITE_SETTINGS; 

    if (storedSettingsRaw) {
      try {
        const parsedSettings = JSON.parse(storedSettingsRaw) as Partial<SiteSettings>;
        currentSiteSettings = { ...Constants.INITIAL_SITE_SETTINGS, ...parsedSettings };

        if (!Array.isArray(currentSiteSettings.homepageBanners) || currentSiteSettings.homepageBanners.length === 0) {
            currentSiteSettings.homepageBanners = Constants.INITIAL_SITE_SETTINGS.homepageBanners;
        }
        currentSiteSettings.homepageBanners = currentSiteSettings.homepageBanners.filter(b => typeof b === 'object' && b !== null);
        if (currentSiteSettings.homepageBanners.length === 0) { 
             currentSiteSettings.homepageBanners = Constants.INITIAL_SITE_SETTINGS.homepageBanners;
        }

      } catch (e) {
        console.error("Error parsing site settings from localStorage in HomeBannerIts:", e);
        currentSiteSettings = Constants.INITIAL_SITE_SETTINGS;
      }
    }
    setSiteSettings(currentSiteSettings);

    const bannersToSearch = Array.isArray(currentSiteSettings.homepageBanners)
      ? currentSiteSettings.homepageBanners
      : Constants.INITIAL_SITE_SETTINGS.homepageBanners;

    const firstActiveBanner = bannersToSearch.find(b => b.isActive === true);
    
    let defaultBannerToShow = Constants.INITIAL_SITE_SETTINGS.homepageBanners[0]; 
    if (bannersToSearch.length > 0) {
        defaultBannerToShow = bannersToSearch[0];
    }
    
    setActiveBanner(firstActiveBanner || defaultBannerToShow);

  }, []);

  useEffect(() => {
    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadSettings);
    };
  }, [loadSettings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartTextAnimation(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  if (!activeBanner) {
    return <div className="home-section bg-gray-100 flex items-center justify-center min-h-[400px]"><p>Banner is loading or not configured.</p></div>;
  }

  const bannerConfig = activeBanner;

  return (
    <section
      className="relative text-white h-[90vh] min-h-[600px] max-h-[800px] flex items-center justify-center text-center overflow-hidden"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center animate-ken-burns"
        style={{ backgroundImage: `url('${bannerConfig.backgroundImageUrl || 'https://picsum.photos/seed/heroBg/1920/1080'}')` }}
      ></div>
      <div className="absolute inset-0 bg-black/60 z-10"></div>

      <div className={`container mx-auto px-4 relative z-20 animate-on-scroll ${startTextAnimation ? 'fade-in-up is-visible' : 'fade-in-up'}`}>
        {bannerConfig.preTitle && (
          <span className="block text-sm font-semibold text-primary uppercase tracking-wider mb-4 drop-shadow-sm">
            {bannerConfig.preTitle}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-condensed font-bold mb-6 leading-tight text-white drop-shadow-md" style={{ animationDelay: '0.1s' }}>
          <span dangerouslySetInnerHTML={{ __html: bannerConfig.title.replace(siteSettings.companyName, `<span class="text-primary">${siteSettings.companyName}</span>`) || 'Your Trusted Tech Partner' }} />
        </h1>
        <p className="text-lg text-gray-200 mb-10 max-w-3xl mx-auto drop-shadow-sm" style={{ animationDelay: '0.2s' }}>
          {bannerConfig.subtitle || 'Default subtitle describing the service.'}
        </p>
        <div className="space-y-3 sm:space-y-0 sm:space-x-4" style={{ animationDelay: '0.3s' }}>
          {bannerConfig.primaryButtonLink && bannerConfig.primaryButtonText && (
            <Link to={bannerConfig.primaryButtonLink}>
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 py-3.5 text-base shadow-lg hover:shadow-primary/40 transform hover:scale-105">
                {bannerConfig.primaryButtonText} <i className="fas fa-arrow-right ml-2 text-sm"></i>
              </Button>
            </Link>
          )}
          {bannerConfig.secondaryButtonLink && bannerConfig.secondaryButtonText && (
            <Link to={bannerConfig.secondaryButtonLink}>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-3.5 text-base shadow-md border-white text-white hover:bg-white hover:text-primary transform hover:scale-105"
              >
                {bannerConfig.secondaryButtonText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeBannerIts;

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Link is compatible with v6/v7
import Button from '../../ui/Button';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings } from '../../../types';

const HomeCallToActionIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });

  const ctaConfig = settings.homepageCallToAction;

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

  if (!ctaConfig.enabled) return null;

  const sectionStyle = ctaConfig.backgroundImageUrl
    ? { backgroundImage: `url('${ctaConfig.backgroundImageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <section
        ref={ref}
        className={`py-20 md:py-28 ${!ctaConfig.backgroundImageUrl && 'bg-primary'} text-white animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} relative overflow-hidden`}
        style={sectionStyle}
    >
      {!ctaConfig.backgroundImageUrl && <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')", backgroundSize: 'auto'}}></div>}
      {!ctaConfig.backgroundImageUrl && <div className="absolute inset-0 bg-gradient-to-br from-primary via-red-600 to-secondary opacity-90"></div>}
      {ctaConfig.backgroundImageUrl && <div className="absolute inset-0 bg-black/50"></div>} 

      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold mb-6 leading-tight drop-shadow-md">
          {ctaConfig.title || "Default CTA Title"}
        </h2>
        <p className={`text-lg ${ctaConfig.backgroundImageUrl ? 'text-gray-100' : 'text-red-100'} mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-sm`}>
          {ctaConfig.description || "Default CTA description."}
        </p>
        {ctaConfig.buttonLink && ctaConfig.buttonText && (
          <Link to={ctaConfig.buttonLink}>
            <Button
              variant="primary"
              size="lg"
              className="px-10 py-4 text-lg shadow-xl hover:shadow-primary/50 transform hover:scale-105 transition-all bg-white text-primary hover:bg-gray-50"
            >
              {ctaConfig.buttonText} <i className="fas fa-rocket ml-2"></i>
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default HomeCallToActionIts;

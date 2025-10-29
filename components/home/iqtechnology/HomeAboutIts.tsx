import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Link is compatible with v6/v7
import Button from '../../ui/Button';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageAboutFeature } from '../../../types';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';

const HomeAboutIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const aboutConfig = settings.homepageAbout;

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

  if (!aboutConfig.enabled) return null;

  return (
    <section ref={ref} className={`bg-bgBase animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Image Column */}
          <div className="lg:w-1/2">
            <div className="relative">
              <img
                src={aboutConfig.imageUrl || "https://picsum.photos/seed/professionalOfficeV2/600/520"}
                alt={aboutConfig.imageAltText || "Our Professional Team"}
                className="rounded-xl shadow-2xl w-full object-cover border-4 border-white"
              />
              {aboutConfig.imageDetailUrl && (
                <img
                  src={aboutConfig.imageDetailUrl}
                  alt={aboutConfig.imageDetailAltText || "Detail Image"}
                  className="absolute -bottom-8 -right-8 w-40 h-40 rounded-lg shadow-xl border-4 border-white object-cover hidden md:block transform transition-all duration-300 hover:scale-105"
                />
              )}
            </div>
          </div>
          {/* Text Content Column */}
          <div className="lg:w-1/2">
            <div>
                {aboutConfig.preTitle && (
                  <span className="home-section-pretitle">
                    <img src={settings.siteLogoUrl || ''} onError={(e) => (e.currentTarget.style.display = 'none')} alt={`${settings.companyName} logo`} className="inline h-6 mr-2 object-contain" />
                    {aboutConfig.preTitle}
                  </span>
                )}
                <h2 className="home-section-title text-left text-4xl md:text-5xl font-extrabold">
                    {aboutConfig.title || "Default About Us Title"}
                </h2>
                <p className="text-textMuted mt-4 mb-8 leading-relaxed">
                    {aboutConfig.description || "Default about us description."}
                </p>

                {aboutConfig.features && aboutConfig.features.length > 0 && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                        {aboutConfig.features.map((item: HomepageAboutFeature) => (
                        <li key={item.id} className="flex items-start">
                            <div className="flex-shrink-0 modern-card-icon-wrapper !w-12 !h-12 !p-3 !mr-4 bg-primary/10">
                                <i className={`${item.icon || 'fas fa-star'} text-primary !text-xl`}></i>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-textBase">{item.title}</h4>
                                <p className="text-textMuted text-sm mt-1 leading-relaxed">{item.description}</p>
                            </div>
                        </li>
                        ))}
                    </ul>
                )}
                
                {aboutConfig.buttonLink && aboutConfig.buttonText && (
                    <div>
                        <Link to={aboutConfig.buttonLink}>
                        <Button variant="primary" size="lg" className="px-8 py-3.5 text-base shadow-md hover:shadow-primary/30">
                            {aboutConfig.buttonText} <i className="fas fa-arrow-right ml-2 text-sm"></i>
                        </Button>
                        </Link>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAboutIts;
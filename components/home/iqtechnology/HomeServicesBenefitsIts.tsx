
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Link is compatible with v6/v7
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageServiceBenefit } from '../../../types';

const ServiceBenefitCard: React.FC<{ item: HomepageServiceBenefit; index: number }> = ({ item, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <div
        ref={ref}
        className={`modern-card p-6 md:p-8 group animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} flex flex-col text-center items-center`}
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <i className={`${item.iconClass || 'fas fa-check-circle'} text-4xl text-primary mb-4 group-hover:scale-110 transition-transform duration-300`}></i>
        <h3 className="modern-card-title mb-3">
          <Link to={item.link || '#'} className="line-clamp-2">{item.title}</Link>
        </h3>
        <p className="modern-card-description mb-5 line-clamp-3">
          {item.description}
        </p>
        <Link to={item.link || '#'} className="modern-card-link mt-auto">
          Tìm hiểu thêm <i className="fas fa-arrow-right text-xs ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
        </Link>
    </div>
  );
};

const HomeServicesBenefitsIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const servicesBenefitsConfig = settings.homepageServicesBenefits;

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

  if (!servicesBenefitsConfig.enabled) return null;

  const sortedBenefits = [...servicesBenefitsConfig.benefits].sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="home-section bg-bgCanvas">
      <div className="container mx-auto px-4">
        <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
          <div className="inline-block bg-bgBase p-4 md:p-6 rounded-lg shadow-md border border-borderDefault mb-4">
            {servicesBenefitsConfig.preTitle && (
              <span className="home-section-pretitle text-primary">
                {servicesBenefitsConfig.sectionTitleIconUrl &&
                  <img
                    src={servicesBenefitsConfig.sectionTitleIconUrl}
                    alt=""
                    className="h-6 w-6 mr-2 object-contain flex-shrink-0"
                  />
                }
                {settings.siteLogoUrl &&
                  <img
                    src={settings.siteLogoUrl}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                    alt={`${settings.companyName} logo`}
                    className="inline h-6 w-6 mr-2 object-contain flex-shrink-0"
                  />
                }
                {servicesBenefitsConfig.preTitle}
              </span>
            )}
            <h2 className="home-section-title text-4xl md:text-5xl font-extrabold leading-tight !mb-0">
              {servicesBenefitsConfig.title || "Core Service Benefits"}
            </h2>
          </div>
        </div>
        {sortedBenefits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedBenefits.map((item, index) => (
                <ServiceBenefitCard key={item.id} item={item} index={index} />
            ))}
            </div>
        ) : (
            <p className="text-center text-textMuted">Service benefits information is being updated.</p>
        )}
      </div>
    </section>
  );
};

export default HomeServicesBenefitsIts;

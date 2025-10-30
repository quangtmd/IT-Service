import React, { useState, useEffect, useCallback } from 'react';
// FIX: Using wildcard import for react-router-dom to handle potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageServiceBenefit } from '../../../types';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';

const ServiceBenefitCard: React.FC<{ item: HomepageServiceBenefit; index: number }> = ({ item, index }) => {
  return (
    <div
        className="modern-card p-6 md:p-8 group flex flex-col text-center items-center relative h-full"
    >
        <div className="modern-card-icon-wrapper">
          <i className={`${item.iconClass || 'fas fa-check-circle'} modern-card-icon`}></i>
        </div>
        <h3 className="modern-card-title mb-3">
          <ReactRouterDOM.Link to={item.link || '#'} className="line-clamp-2">{item.title}</ReactRouterDOM.Link>
        </h3>
        <p className="modern-card-description mb-5 line-clamp-3 flex-grow">
          {item.description}
        </p>
        <div className="mt-auto">
            <ReactRouterDOM.Link to={item.link || '#'} className="modern-card-link">
            Tìm hiểu thêm <i className="fas fa-arrow-right text-xs ml-1"></i>
            </ReactRouterDOM.Link>
        </div>
    </div>
  );
};

const HomeServicesBenefitsIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
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
    <section ref={ref} className={`bg-bgCanvas animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="home-section-title-area">
          {servicesBenefitsConfig.preTitle && (
            <span className="home-section-pretitle">
              {servicesBenefitsConfig.sectionTitleIconUrl &&
                <img
                  src={servicesBenefitsConfig.sectionTitleIconUrl}
                  alt=""
                  className="h-6 w-6 mr-2 object-contain flex-shrink-0"
                />
              }
              {servicesBenefitsConfig.preTitle}
            </span>
          )}
          <h2 className="home-section-title text-4xl md:text-5xl font-extrabold leading-tight">
            {servicesBenefitsConfig.title || "Core Service Benefits"}
          </h2>
        </div>
        {sortedBenefits.length > 0 ? (
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {sortedBenefits.map((item, index) => (
                <div key={item.id} className="w-[85vw] max-w-sm sm:w-auto flex-shrink-0">
                    <ServiceBenefitCard item={item} index={index} />
                </div>
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
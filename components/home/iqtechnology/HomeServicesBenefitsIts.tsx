
import React, { useState, useEffect, useCallback } from 'react';
// Fix: Use named import for Link
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageServiceBenefit } from '../../../types';

const ServiceBenefitCard: React.FC<{ item: HomepageServiceBenefit; index: number }> = ({ item, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <div
        ref={ref}
        className={`modern-card p-8 group animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} flex flex-col text-center items-center relative h-full overflow-hidden dark:bg-gray-800 dark:border-gray-700`}
        style={{ animationDelay: `${index * 100}ms` }}
    >
        {/* Background Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>

        <div className="modern-card-icon-wrapper relative z-10 bg-white dark:bg-slate-700 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <i className={`${item.iconClass || 'fas fa-check-circle'} text-3xl text-primary`}></i>
        </div>
        
        <h3 className="text-xl font-bold mb-3 relative z-10 text-textBase dark:text-white group-hover:text-primary transition-colors">
          {/* Fix: Use Link directly */}
          <Link to={item.link || '#'} className="line-clamp-2">{item.title}</Link>
        </h3>
        
        <p className="text-textMuted dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-grow relative z-10 leading-relaxed">
          {item.description}
        </p>
        
        <div className="mt-auto relative z-10 w-full">
            {/* Fix: Use Link directly */}
            <Link to={item.link || '#'} className="inline-flex items-center justify-center w-full py-2.5 rounded-lg border border-borderDefault dark:border-gray-600 text-textBase dark:text-white font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm">
              Tìm hiểu thêm <i className="fas fa-arrow-right text-xs ml-2 transform group-hover:translate-x-1 transition-transform"></i>
            </Link>
        </div>
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
    <section className="home-section bg-bgCanvas dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
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
          <h2 className="home-section-title text-4xl md:text-5xl font-extrabold leading-tight dark:text-white">
            {servicesBenefitsConfig.title || "Core Service Benefits"}
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
        </div>
        
        {sortedBenefits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedBenefits.map((item, index) => (
                <div key={item.id} className="h-full">
                    <ServiceBenefitCard item={item} index={index} />
                </div>
            ))}
            </div>
        ) : (
            <p className="text-center text-textMuted dark:text-gray-400">Service benefits information is being updated.</p>
        )}
      </div>
    </section>
  );
};

export default HomeServicesBenefitsIts;

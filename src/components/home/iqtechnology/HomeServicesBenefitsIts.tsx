
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageServiceBenefit } from '../../../types';
import SpotlightCard from '../../ui/SpotlightCard';

const ServiceBenefitCard: React.FC<{ item: HomepageServiceBenefit; index: number }> = ({ item, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <div
        ref={ref}
        className={`h-full animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <SpotlightCard className="h-full flex flex-col items-start p-6 bg-gray-900/80 border-gray-800 hover:border-cyan-500/50 transition-all duration-300 group" spotlightColor="rgba(6, 182, 212, 0.15)">
            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mb-5 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-300">
                <i className={`${item.iconClass || 'fas fa-check-circle'} text-2xl text-gray-400 group-hover:text-cyan-400`}></i>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                <Link to={item.link || '#'} className="line-clamp-2">{item.title}</Link>
            </h3>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow border-l-2 border-gray-700 pl-3 group-hover:border-cyan-500/50 transition-colors">
                {item.description}
            </p>
            
            <div className="mt-auto w-full">
                <Link to={item.link || '#'} className="inline-flex items-center text-sm font-semibold text-cyan-500 hover:text-cyan-300 transition-colors group/link">
                    KHÁM PHÁ <i className="fas fa-arrow-right ml-2 transform group-hover/link:translate-x-1 transition-transform"></i>
                </Link>
            </div>
        </SpotlightCard>
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
    <section className="py-20 bg-transparent relative">
       {/* Background decorative glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl max-h-[500px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={titleRef} className={`text-center mb-16 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
          {servicesBenefitsConfig.preTitle && (
            <span className="inline-block py-1 px-3 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4">
              {servicesBenefitsConfig.preTitle}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {servicesBenefitsConfig.title || "Lợi Ích Dịch Vụ"}
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
        </div>

        {sortedBenefits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedBenefits.map((item, index) => (
                    <ServiceBenefitCard key={item.id} item={item} index={index} />
                ))}
            </div>
        ) : (
            <p className="text-center text-gray-500">Service benefits information is being updated.</p>
        )}
      </div>
    </section>
  );
};

export default HomeServicesBenefitsIts;


import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageServiceBenefit } from '../../../types';
import TiltCard from '../../ui/TiltCard';
import { Canvas } from '@react-three/fiber';
import CloudNetworkScene from '../three/CloudNetworkScene'; // New complex 3D scene

const ServiceBenefitCard: React.FC<{ item: HomepageServiceBenefit; index: number }> = ({ item, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <div
        ref={ref}
        className={`animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} h-full relative z-10`}
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <TiltCard className="h-full">
            <div className="modern-card p-8 group flex flex-col text-center items-center relative h-full overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/5 backdrop-blur-lg border border-white/10 hover:border-primary/50">
                {/* Background Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="modern-card-icon-wrapper relative z-10 bg-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300 translate-z-10 border border-white/20 backdrop-blur-md text-primary">
                    <i className={`${item.iconClass || 'fas fa-check-circle'} text-3xl`}></i>
                </div>
                
                <h3 className="text-xl font-bold mb-3 relative z-10 text-white group-hover:text-primary transition-colors translate-z-10">
                    <Link to={item.link || '#'} className="line-clamp-2">{item.title}</Link>
                </h3>
                
                <p className="text-gray-200 text-sm mb-6 line-clamp-3 flex-grow relative z-10 leading-relaxed translate-z-10 font-light">
                    {item.description}
                </p>
                
                <div className="mt-auto relative z-10 w-full translate-z-10">
                    <Link to={item.link || '#'} className="inline-flex items-center justify-center w-full py-2.5 rounded-lg border border-white/20 text-white font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm backdrop-blur-sm">
                    Tìm hiểu thêm <i className="fas fa-arrow-right text-xs ml-2 transform group-hover:translate-x-1 transition-transform"></i>
                    </Link>
                </div>
            </div>
        </TiltCard>
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
    <section className="home-section bg-[#050a14] relative overflow-hidden">
      
      {/* 3D Detailed Background - Cloud Network */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <Canvas>
            <Suspense fallback={null}>
                <CloudNetworkScene />
            </Suspense>
        </Canvas>
      </div>

      {/* Gradient Overlay to ensure text is readable - Made lighter */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050a14]/80 via-transparent to-[#050a14]/80 pointer-events-none z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
          {servicesBenefitsConfig.preTitle && (
            <span className="home-section-pretitle bg-white/10 backdrop-blur-sm text-cyan-300 border border-white/10 shadow-lg">
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
          <h2 className="home-section-title text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-lg">
            {servicesBenefitsConfig.title || "Core Service Benefits"}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-600 mx-auto mt-4 rounded-full shadow-lg"></div>
        </div>
        
        {sortedBenefits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedBenefits.map((item, index) => (
                <ServiceBenefitCard key={item.id} item={item} index={index} />
            ))}
            </div>
        ) : (
            <p className="text-center text-gray-400">Service benefits information is being updated.</p>
        )}
      </div>
    </section>
  );
};

export default HomeServicesBenefitsIts;

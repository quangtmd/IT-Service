
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageServiceBenefit } from '../../../types';
import TiltCard from '../../ui/TiltCard';
import { Canvas } from '@react-three/fiber';
import CloudNetworkScene from '../three/CloudNetworkScene';

const ServiceBenefitCard: React.FC<{ item: HomepageServiceBenefit; index: number }> = ({ item, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <div
        ref={ref}
        className={`animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} h-full relative z-10`}
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <TiltCard className="h-full">
            {/* Glassmorphism Card Styling */}
            <div className="modern-card p-8 group flex flex-col text-center items-center relative h-full overflow-hidden bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 rounded-2xl">
                {/* Subtle internal gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-30 pointer-events-none"></div>
                
                {/* Hover glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-400/40 transition-all duration-500 group-hover:scale-150"></div>

                <div className="modern-card-icon-wrapper relative z-10 bg-white/10 backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform duration-300 text-cyan-400 border border-white/20 p-4 rounded-full mb-5">
                    <i className={`${item.iconClass || 'fas fa-check-circle'} text-3xl`}></i>
                </div>
                
                <h3 className="text-xl font-bold mb-3 relative z-10 text-white group-hover:text-cyan-300 transition-colors drop-shadow-md">
                    <Link to={item.link || '#'} className="line-clamp-2">{item.title}</Link>
                </h3>
                
                <p className="text-gray-300 text-sm mb-6 line-clamp-3 flex-grow relative z-10 leading-relaxed drop-shadow-sm font-light">
                    {item.description}
                </p>
                
                <div className="mt-auto relative z-10 w-full">
                    <Link to={item.link || '#'} className="inline-flex items-center justify-center w-full py-2.5 rounded-lg border border-white/20 bg-white/5 text-white font-semibold hover:bg-cyan-600 hover:border-cyan-600 hover:text-white transition-all duration-300 shadow-lg backdrop-blur-sm">
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
    <section className="home-section relative overflow-hidden min-h-[800px]">
      {/* 3D Background Layer - Shared Cloud Network Scene */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e293b] z-0">
        <Canvas>
            <Suspense fallback={null}>
                <CloudNetworkScene />
            </Suspense>
        </Canvas>
      </div>

      {/* Content Layer */}
      <div className="container mx-auto px-4 relative z-10 pt-10">
        <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
          {servicesBenefitsConfig.preTitle && (
            <span className="home-section-pretitle bg-white/5 backdrop-blur-md border border-cyan-500/30 text-cyan-300">
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
          <h2 className="home-section-title text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-lg mt-4">
            {servicesBenefitsConfig.title || "Core Service Benefits"}
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
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

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageAboutFeature } from '../../../types';
import { Canvas } from '@react-three/fiber';
import TechShapes from '../three/TechShapes';

const HomeAboutIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

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
    <section ref={sectionRef} className={`home-section bg-[#0B1120] text-white animate-on-scroll fade-in-up ${isSectionVisible ? 'is-visible' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* 3D Scene Column (Replacing Image) */}
          <div className="lg:w-1/2 h-[400px] lg:h-[500px] w-full relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
            <div className={`absolute inset-0 animate-on-scroll ${isSectionVisible ? 'slide-in-left is-visible' : 'slide-in-left'}`} style={{animationDelay:'0.1s'}}>
               <Canvas className="w-full h-full">
                  <Suspense fallback={null}>
                     <TechShapes />
                  </Suspense>
               </Canvas>
               {/* Overlay for depth */}
               <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0B1120] to-transparent opacity-20"></div>
            </div>
          </div>

          {/* Text Content Column */}
          <div className="lg:w-1/2">
            <div className={`animate-on-scroll ${isSectionVisible ? 'fade-in-up is-visible' : 'fade-in-up'}`} style={{animationDelay:'0.2s'}}>
                {aboutConfig.preTitle && (
                  <span className="inline-flex items-center py-1 px-3 rounded-full bg-blue-900/50 text-blue-300 border border-blue-500/30 text-xs font-bold tracking-widest uppercase mb-4">
                    <img src={settings.siteLogoUrl || ''} onError={(e) => (e.currentTarget.style.display = 'none')} alt={`${settings.companyName} logo`} className="inline h-4 mr-2 object-contain" />
                    {aboutConfig.preTitle}
                  </span>
                )}
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    {aboutConfig.title || "Default About Us Title"}
                </h2>
                <p className="text-gray-300 mt-4 mb-8 leading-relaxed text-lg">
                    {aboutConfig.description || "Default about us description."}
                </p>

                {aboutConfig.features && aboutConfig.features.length > 0 && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                        {aboutConfig.features.map((item: HomepageAboutFeature, index) => (
                        <li key={item.id || index} className={`flex items-start p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors animate-on-scroll ${isSectionVisible ? 'fade-in-up is-visible' : 'fade-in-up'}`} style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mr-4">
                                <i className={`${item.icon || 'fas fa-star'} text-lg`}></i>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                                <p className="text-gray-400 text-sm mt-1 leading-relaxed">{item.description}</p>
                            </div>
                        </li>
                        ))}
                    </ul>
                )}
                
                {aboutConfig.buttonLink && aboutConfig.buttonText && (
                    <div className={`animate-on-scroll ${isSectionVisible ? 'fade-in-up is-visible' : 'fade-in-up'}`} style={{ animationDelay: '0.5s' }}>
                        <Link to={aboutConfig.buttonLink}>
                        <Button variant="primary" size="lg" className="px-8 py-3.5 text-base shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] transition-all border border-blue-500">
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
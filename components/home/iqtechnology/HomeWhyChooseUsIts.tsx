
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { SiteSettings, HomepageWhyChooseUsFeature } from '../../../types';
import { Canvas } from '@react-three/fiber';
import FloatingElements from '../three/FloatingElements';

const HomeWhyChooseUsIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const whyChooseUsConfig = settings.homepageWhyChooseUs;

  const loadSettings = useCallback(() => {
    const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    if (storedSettingsRaw) {
      setSettings(JSON.parse(storedSettingsRaw));
    }
  }, []);

  useEffect(() => {
    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadSettings);
    };
  }, [loadSettings]);

  if (!whyChooseUsConfig.enabled) return null;

  return (
    <section ref={sectionRef} className={`home-section bg-[#020617] text-white py-24 animate-on-scroll fade-in-up ${isSectionVisible ? 'is-visible' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          
          {/* Left Column: Content */}
          <div className="lg:w-1/2 order-2 lg:order-1">
            <div className={`animate-on-scroll ${isSectionVisible ? 'fade-in-up is-visible' : 'fade-in-up'}`} style={{animationDelay:'0.2s'}}>
              {whyChooseUsConfig.preTitle && (
                <span className="inline-flex items-center py-1 px-3 rounded-full bg-white/5 text-indigo-300 border border-indigo-500/30 text-xs font-bold tracking-widest uppercase mb-4">
                   {whyChooseUsConfig.sectionTitleIconUrl && <img src={whyChooseUsConfig.sectionTitleIconUrl} alt="" className="w-4 h-4 mr-2 object-contain" />}
                   {whyChooseUsConfig.preTitle}
                </span>
              )}
              <h2 className="home-section-title text-left text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                {whyChooseUsConfig.title || "Tại Sao Chọn Chúng Tôi?"}
              </h2>
              <p className="text-gray-400 mb-10 leading-relaxed text-lg font-light border-l-4 border-indigo-500 pl-6">
                {whyChooseUsConfig.description || "Mô tả mặc định giải thích lý do tại sao chọn chúng tôi."}
              </p>

              {whyChooseUsConfig.features && whyChooseUsConfig.features.length > 0 && (
                <ul className="space-y-6 mb-10">
                  {whyChooseUsConfig.features.map((item: HomepageWhyChooseUsFeature, index) => (
                    <li key={item.id || index} className={`flex items-start p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all hover:-translate-y-1 animate-on-scroll ${isSectionVisible ? 'fade-in-up is-visible' : 'fade-in-up'} hover:border-indigo-500/30 hover:shadow-lg`} style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-5 shadow-lg shadow-indigo-500/20">
                        <i className={`${item.iconClass || 'fas fa-star'} text-white text-xl`}></i>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {whyChooseUsConfig.contactButtonLink && whyChooseUsConfig.contactButtonText && (
                 <div className={`animate-on-scroll ${isSectionVisible ? 'fade-in-up is-visible' : ''}`} style={{animationDelay:'0.5s'}}>
                  <Link to={whyChooseUsConfig.contactButtonLink}>
                    <Button variant="primary" size="lg" className="px-10 py-4 text-base font-bold shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_rgba(79,70,229,0.8)] bg-indigo-600 hover:bg-indigo-500 border-none transition-all rounded-full">
                        {whyChooseUsConfig.contactButtonText} <i className="fas fa-arrow-right ml-2 text-sm"></i>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 3D Scene */}
          <div className="lg:w-1/2 order-1 lg:order-2 h-[500px] w-full relative">
            <div className={`absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 backdrop-blur-sm animate-on-scroll ${isSectionVisible ? 'slide-in-right is-visible' : 'slide-in-right'}`} style={{animationDelay:'0.1s'}}>
               {/* 3D Canvas */}
               <Canvas className="w-full h-full">
                  <Suspense fallback={null}>
                     <FloatingElements />
                  </Suspense>
               </Canvas>
               
               {/* Experience Badge Overlay */}
               {whyChooseUsConfig.experienceStatNumber && whyChooseUsConfig.experienceStatLabel && (
                 <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-xl p-6 shadow-2xl rounded-2xl border border-white/20 transform transition-all duration-300 hover:scale-105 hover:bg-black/80">
                   <div className="text-center">
                      <div className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 text-5xl font-black mb-1">{whyChooseUsConfig.experienceStatNumber}</div>
                      <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">{whyChooseUsConfig.experienceStatLabel}</p>
                   </div>
                 </div>
              )}
            </div>
             {/* Glow effect behind */}
            <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl -z-10 rounded-full opacity-50 pointer-events-none"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeWhyChooseUsIts;

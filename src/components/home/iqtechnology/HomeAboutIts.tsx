
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageAboutFeature } from '../../../types';

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
    <section ref={sectionRef} className={`py-10 bg-transparent relative overflow-hidden animate-on-scroll fade-in-up ${isSectionVisible ? 'is-visible' : ''}`}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Image Column - Tech Frame Style */}
          <div className="lg:w-1/2 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-gray-900/50 backdrop-blur-sm">
                <img
                    src={aboutConfig.imageUrl || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1770&auto=format&fit=crop"}
                    alt={aboutConfig.imageAltText || "About IQ Tech"}
                    className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                {/* HUD Elements */}
                <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-cyan-500 opacity-50"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-cyan-500 opacity-50"></div>
                <div className="absolute bottom-6 left-6 text-cyan-400 font-mono text-xs">
                    SYSTEM_ID: IQ-2024<br/>
                    STATUS: OPTIMIZED
                </div>
            </div>
          </div>

          {/* Text Content Column */}
          <div className="lg:w-1/2">
             <div className="mb-4">
                <span className="text-cyan-500 font-mono text-xs uppercase tracking-[0.2em] border-b border-cyan-500/50 pb-1">
                    [ Về Chúng Tôi ]
                </span>
             </div>
             
             <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {aboutConfig.title || "IQ Technology"}
                </span>
             </h2>
             
             <p className="text-gray-400 text-lg mb-8 leading-relaxed font-light">
                {aboutConfig.description}
             </p>

            {aboutConfig.features && aboutConfig.features.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {aboutConfig.features.map((item: HomepageAboutFeature, index) => (
                    <div key={item.id || index} className="flex items-start p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors">
                        <div className="flex-shrink-0 mr-3 mt-1 text-cyan-400">
                            <i className={`${item.icon || 'fas fa-check'} text-xl`}></i>
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-white">{item.title}</h4>
                            <p className="text-gray-500 text-xs mt-1">{item.description}</p>
                        </div>
                    </div>
                    ))}
                </div>
            )}
            
            {aboutConfig.buttonLink && aboutConfig.buttonText && (
                <Link to={aboutConfig.buttonLink}>
                    <Button variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white px-8 py-3 uppercase tracking-wider text-sm font-bold">
                        {aboutConfig.buttonText}
                    </Button>
                </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAboutIts;

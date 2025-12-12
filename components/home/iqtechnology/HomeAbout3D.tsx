
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { SiteSettings, HomepageAboutFeature } from '../../../types';
import { Canvas } from '@react-three/fiber';
import AboutScene from '../three/AboutScene';

const HomeAbout3D: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.2, triggerOnce: true });

  const aboutConfig = settings.homepageAbout;

  const loadSettings = useCallback(() => {
    const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    setSettings(storedSettingsRaw ? JSON.parse(storedSettingsRaw) : Constants.INITIAL_SITE_SETTINGS);
  }, []);

  useEffect(() => {
    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => window.removeEventListener('siteSettingsUpdated', loadSettings);
  }, [loadSettings]);

  if (!aboutConfig.enabled) return null;

  return (
    <section ref={sectionRef} className="relative home-section bg-gray-900 text-white overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-80">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <AboutScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className={`flex flex-col items-center text-center animate-on-scroll fade-in-up ${isSectionVisible ? 'is-visible' : ''}`}>
            
          {/* Glassmorphism Panel */}
          <div className="w-full max-w-4xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
            {aboutConfig.preTitle && (
              <span className="home-section-pretitle !text-red-400">
                {aboutConfig.preTitle}
              </span>
            )}
            <h2 className="home-section-title !text-white text-3xl md:text-5xl font-extrabold leading-tight">
                {aboutConfig.title}
            </h2>
            <p className="text-gray-300 mt-4 mb-8 leading-relaxed max-w-2xl mx-auto">
                {aboutConfig.description}
            </p>

            {aboutConfig.features && aboutConfig.features.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-left">
                    {aboutConfig.features.map((item: HomepageAboutFeature, index) => (
                    <div key={item.id || index} className="flex items-start">
                        <div className="flex-shrink-0 bg-red-500/20 text-red-300 rounded-lg p-3 mr-4">
                            <i className={`${item.icon || 'fas fa-star'} text-xl`}></i>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                            <p className="text-gray-400 text-sm mt-1 leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                    ))}
                </div>
            )}
            
            {aboutConfig.buttonLink && aboutConfig.buttonText && (
                <div>
                    <Link to={aboutConfig.buttonLink}>
                    <Button variant="primary" size="lg" className="px-8 py-3 text-base shadow-lg hover:shadow-primary/40">
                        {aboutConfig.buttonText} <i className="fas fa-arrow-right ml-2 text-sm"></i>
                    </Button>
                    </Link>
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAbout3D;

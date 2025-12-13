import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver.ts';
import * as Constants from '../../../constants.tsx';
import { SiteSettings } from '../../../types.ts';
import { Canvas } from '@react-three/fiber';
import PulsingCoreScene from '../three/PulsingCoreScene.tsx';

const HomeCallToActionIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });

  const ctaConfig = settings.homepageCallToAction;

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

  if (!ctaConfig.enabled) return null;

  return (
    <section
        ref={ref}
        className={`py-20 md:py-28 text-white animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} relative overflow-hidden bg-black`}
    >
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas>
            <Suspense fallback={null}>
                <PulsingCoreScene />
            </Suspense>
        </Canvas>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold mb-6 leading-tight drop-shadow-md">
          {ctaConfig.title || "Default CTA Title"}
        </h2>
        <p className={`text-lg text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-sm`}>
          {ctaConfig.description || "Default CTA description."}
        </p>
        {ctaConfig.buttonLink && ctaConfig.buttonText && (
          <Link to={ctaConfig.buttonLink}>
            <Button
              variant="primary"
              size="lg"
              className="px-10 py-4 text-lg shadow-xl hover:shadow-primary/50 transform hover:scale-105 transition-all bg-white text-primary hover:bg-gray-50"
            >
              {ctaConfig.buttonText} <i className="fas fa-rocket ml-2"></i>
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default HomeCallToActionIts;

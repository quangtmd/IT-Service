
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Button';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { SiteSettings } from '../../../types';
import { Canvas } from '@react-three/fiber';
import PulsingCoreScene from '../three/PulsingCoreScene';

const HomeCallToActionIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });

  const ctaConfig = settings.homepageCallToAction;

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

  if (!ctaConfig.enabled) return null;

  return (
    <section
        ref={ref}
        className={`py-28 md:py-36 text-white animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} relative overflow-hidden bg-black`}
    >
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-70 pointer-events-none">
        <Canvas>
            <Suspense fallback={null}>
                <PulsingCoreScene />
            </Suspense>
        </Canvas>
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight drop-shadow-2xl tracking-tight">
          {ctaConfig.title || "Sẵn Sàng Nâng Cấp?"}
        </h2>
        <p className={`text-lg md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-sm font-light`}>
          {ctaConfig.description || "Liên hệ ngay hôm nay để bắt đầu hành trình chuyển đổi số của bạn."}
        </p>
        {ctaConfig.buttonLink && ctaConfig.buttonText && (
          <Link to={ctaConfig.buttonLink}>
            <Button
              variant="primary"
              size="lg"
              className="px-12 py-5 text-lg font-bold shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:shadow-[0_0_50px_rgba(239,68,68,0.8)] transform hover:scale-105 transition-all bg-red-600 hover:bg-red-500 text-white rounded-full tracking-wider border-none"
            >
              {ctaConfig.buttonText} <i className="fas fa-rocket ml-3 animate-bounce-horizontal"></i>
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default HomeCallToActionIts;

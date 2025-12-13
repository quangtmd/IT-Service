
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings } from '../../../types';
import { Canvas } from '@react-three/fiber';
import ProcessScene from '../three/ProcessScene';

const HomeProcessIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const processConfig = settings.homepageProcess;

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

  if (!processConfig.enabled || !processConfig.steps || processConfig.steps.length === 0) return null;

  const sortedSteps = [...processConfig.steps].sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="relative bg-[#0B1120] text-white h-[100vh] min-h-[800px]">
      <div className="absolute inset-0 w-full h-full">
        <div ref={titleRef} className={`absolute top-0 left-0 right-0 z-20 pt-20 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
           <div className="home-section-title-area !mb-0">
              {processConfig.preTitle && (
                <span className="home-section-pretitle bg-black/40 backdrop-blur-md border border-primary/30 text-primary">
                  {processConfig.sectionTitleIconUrl && <img src={processConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
                  {processConfig.preTitle}
                </span>
              )}
              <h2 className="home-section-title text-4xl md:text-5xl font-extrabold text-white">
                {processConfig.title || "Quy Trình Của Chúng Tôi"}
              </h2>
            </div>
        </div>
        
        <Canvas className="w-full h-full">
          <Suspense fallback={null}>
            <ProcessScene steps={sortedSteps} />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
};

export default HomeProcessIts;

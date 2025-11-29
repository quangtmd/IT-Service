
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
    <section className="relative bg-[#0B1120] text-white h-[100vh] min-h-[800px] overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        {/* Text Overlay */}
        <div ref={titleRef} className={`absolute top-0 left-0 right-0 z-20 pt-24 text-center pointer-events-none animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
           <div className="container mx-auto px-4">
              {processConfig.preTitle && (
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-red-500/30 bg-red-900/20 text-red-400 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
                  {processConfig.sectionTitleIconUrl && <img src={processConfig.sectionTitleIconUrl} alt="" className="w-4 h-4 mr-2 object-contain" />}
                  {processConfig.preTitle}
                </div>
              )}
              <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl tracking-tight mb-4">
                {processConfig.title || "QUY TRÌNH LÀM VIỆC"}
              </h2>
              <p className="text-gray-400 text-lg font-light">Quy trình tối ưu hóa hiệu suất và chất lượng.</p>
            </div>
        </div>
        
        {/* 3D Scene */}
        <Canvas className="w-full h-full" camera={{ position: [0, 0, 8], fov: 50 }}>
          <Suspense fallback={null}>
            <ProcessScene steps={sortedSteps} />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
};

export default HomeProcessIts;

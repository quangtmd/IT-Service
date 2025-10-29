import React, { useState, useEffect, useCallback } from 'react';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageProcessStep } from '../../../types';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';

const ProcessStepCard: React.FC<{ step: HomepageProcessStep; index: number; isEven: boolean }> = ({ step, index, isEven }) => {

  return (
    <div className={`flex items-center gap-8 lg:gap-16 ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
        <div className="w-full lg:w-1/2">
             <div className={`process-step-card-its p-6 group ${isEven ? 'align-right' : ''}`}>
                <div className="process-step-number">
                    {step.stepNumber || `0${index+1}`}
                </div>
                <div className="pl-16">
                    <h4 className="text-2xl font-semibold font-condensed text-textBase mb-2.5 group-hover:text-primary transition-colors">{step.title}</h4>
                    <p className="text-textMuted text-base leading-relaxed">{step.description}</p>
                </div>
            </div>
        </div>
        <div className="hidden lg:flex w-1/2 items-center justify-center">
             <img src={`https://picsum.photos/seed/${step.imageUrlSeed || `defaultStepImg${index}`}/450/300`} alt={step.title} className="w-full h-full object-cover rounded-xl shadow-lg border-4 border-white" />
        </div>
    </div>
  );
};

const HomeProcessIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
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
    <section ref={ref} className={`bg-bgMuted relative overflow-hidden animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}>
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-full w-px bg-gray-300/70 hidden lg:block" style={{height: '70%'}}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="home-section-title-area">
          {processConfig.preTitle && (
            <span className="home-section-pretitle">
              {processConfig.sectionTitleIconUrl && <img src={processConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
              {processConfig.preTitle}
            </span>
          )}
          <h2 className="home-section-title text-4xl md:text-5xl font-extrabold">
            {processConfig.title || "Default Process Title"}
          </h2>
        </div>
        {sortedSteps.length > 0 ? (
            <div className="space-y-16 lg:space-y-4">
            {sortedSteps.map((step, index) => (
                <ProcessStepCard key={step.id || index} step={step} index={index} isEven={index % 2 !== 0}/>
            ))}
            </div>
        ) : (
            <p className="text-center text-textMuted">Process steps are being updated.</p>
        )}
      </div>
    </section>
  );
};

export default HomeProcessIts;
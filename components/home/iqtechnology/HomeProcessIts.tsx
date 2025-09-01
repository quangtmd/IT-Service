
import React, { useState, useEffect, useCallback } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageProcessStep } from '../../../types';

const ProcessStepCard: React.FC<{ step: HomepageProcessStep; index: number; isEven: boolean }> = ({ step, index, isEven }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2, triggerOnce: true });

  return (
    <div ref={ref} className={`flex items-center gap-8 ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
        <div className={`w-full lg:w-1/2 animate-on-scroll ${isVisible ? (isEven ? 'slide-in-left is-visible' : 'slide-in-right is-visible') : (isEven ? 'slide-in-left' : 'slide-in-right')} `}>
             <div className="p-6 bg-white rounded-xl shadow-xl border border-gray-200 relative group hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-1">
                <span className="absolute -top-5 -left-5 bg-primary text-white text-3xl font-bold w-16 h-16 flex items-center justify-center rounded-full shadow-lg border-4 border-white">
                {step.stepNumber || `0${index+1}`}
                </span>
                <div className="pl-12">
                    <h4 className="text-2xl font-semibold text-textBase mb-2.5 group-hover:text-primary transition-colors">{step.title}</h4>
                    <p className="text-textMuted text-base leading-relaxed">{step.description}</p>
                </div>
            </div>
        </div>
        <div className={`hidden lg:block w-1/2 animate-on-scroll ${isVisible ? (isEven ? 'slide-in-right is-visible' : 'slide-in-left is-visible') : (isEven ? 'slide-in-right' : 'slide-in-left')}`}>
             <img src={`https://picsum.photos/seed/${step.imageUrlSeed || `defaultStepImg${index}`}/500/350`} alt={step.title} className="w-full h-full object-cover rounded-xl shadow-lg" />
        </div>
    </div>
  );
};

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
    <section className="py-16 md:py-24 bg-bgCanvas relative overflow-hidden">
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-[90%] w-px bg-gray-300 hidden lg:block"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={titleRef} className={`text-center mb-12 md:mb-16 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
          {processConfig.preTitle && (
            <span className="inline-flex items-center text-sm font-semibold text-primary mb-3">
              <img src={settings.siteLogoUrl || ''} onError={(e) => (e.currentTarget.style.display = 'none')} alt={`${settings.companyName} logo`} className="inline h-6 mr-2 object-contain" /> 
              {processConfig.preTitle}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-textBase leading-tight">
            {processConfig.title || "Default Process Title"}
          </h2>
        </div>
        {sortedSteps.length > 0 ? (
            <div className="space-y-12 lg:space-y-4">
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

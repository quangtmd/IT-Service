import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom'; // Link is compatible with v6/v7
import Button from '../../ui/Button';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageWhyChooseUsFeature } from '../../../types';

const HomeWhyChooseUsIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const whyChooseUsConfig = settings.homepageWhyChooseUs;

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

  if (!whyChooseUsConfig.enabled) return null;

  return (
    <section ref={sectionRef} className={`home-section bg-bgBase animate-on-scroll fade-in-up ${isSectionVisible ? 'is-visible' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="lg:w-1/2 order-2 lg:order-1">
            <div className={`animate-on-scroll ${isSectionVisible ? 'fade-in-up is-visible' : 'fade-in-up'}`} style={{animationDelay:'0.2s'}}>
              {whyChooseUsConfig.preTitle && (
                <span className="home-section-pretitle">
                   {whyChooseUsConfig.sectionTitleIconUrl && <img src={whyChooseUsConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
                   {whyChooseUsConfig.preTitle}
                </span>
              )}
              <h2 className="home-section-title text-left text-4xl md:text-5xl font-extrabold">
                {whyChooseUsConfig.title || "Tại Sao Chọn Chúng Tôi?"}
              </h2>
              <p className="text-textMuted mb-8 leading-relaxed">
                {whyChooseUsConfig.description || "Mô tả mặc định giải thích lý do tại sao chọn chúng tôi."}
              </p>

              {whyChooseUsConfig.features && whyChooseUsConfig.features.length > 0 && (
                <ul className="space-y-6 mb-10">
                  {whyChooseUsConfig.features.map((item: HomepageWhyChooseUsFeature, index) => (
                    <li key={item.id || index} className={`flex items-start animate-on-scroll ${isSectionVisible ? 'fade-in-up is-visible' : 'fade-in-up'}`} style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                      <div className="flex-shrink-0 modern-card-icon-wrapper !w-12 !h-12 !p-3 !mr-4 bg-primary/10">
                        <i className={`${item.iconClass || 'fas fa-star'} text-primary !text-xl`}></i>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-textBase">{item.title}</h4>
                        <p className="text-textMuted text-sm mt-1 leading-relaxed">{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {whyChooseUsConfig.contactButtonLink && whyChooseUsConfig.contactButtonText && (
                 <div className={`animate-on-scroll ${isSectionVisible ? 'fade-in-up is-visible' : ''}`} style={{animationDelay:'0.5s'}}>
                  <ReactRouterDOM.Link to={whyChooseUsConfig.contactButtonLink}>
                    <Button variant="primary" size="lg" className="px-8 py-3.5 text-base shadow-md hover:shadow-primary/30">
                        {whyChooseUsConfig.contactButtonText} <i className="fas fa-arrow-right ml-2 text-sm"></i>
                    </Button>
                  </ReactRouterDOM.Link>
                </div>
              )}
            </div>
          </div>
          <div className="lg:w-1/2 order-1 lg:order-2">
            <div className={`relative animate-on-scroll ${isSectionVisible ? 'slide-in-right is-visible' : 'slide-in-right'}`} style={{animationDelay:'0.1s'}}>
              <img
                src={whyChooseUsConfig.mainImageUrl || "https://picsum.photos/seed/itProfessionalsV2/600/720"}
                alt="Why Choose Our IT Professionals"
                className="rounded-xl shadow-2xl w-full object-cover border-4 border-white"
              />
              {whyChooseUsConfig.experienceStatNumber && whyChooseUsConfig.experienceStatLabel && (
                 <div className="absolute bottom-8 left-8 bg-white p-6 shadow-2xl rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-primary/30">
                   <div className="text-center">
                      <div className="text-primary text-5xl font-bold mb-1">{whyChooseUsConfig.experienceStatNumber}</div>
                      <p className="text-sm text-textMuted font-medium">{whyChooseUsConfig.experienceStatLabel}</p>
                   </div>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeWhyChooseUsIts;
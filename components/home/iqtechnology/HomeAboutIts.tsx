
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { SiteSettings } from '../../../types';
import MovingBorderButton from '../../ui/MovingBorderButton';

const HomeAboutIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const aboutConfig = settings.homepageAbout;

  const loadSettings = useCallback(() => {
    const storedSettingsRaw = localStorage.getItem(Constants.SITE_CONFIG_STORAGE_KEY);
    if (storedSettingsRaw) {
      setSettings(JSON.parse(storedSettingsRaw));
    }
  }, []);

  useEffect(() => {
    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => window.removeEventListener('siteSettingsUpdated', loadSettings);
  }, [loadSettings]);

  if (!aboutConfig.enabled) return null;

  return (
    <section ref={sectionRef} className={`py-28 bg-[#020617] text-white relative overflow-hidden animate-on-scroll fade-in-up ${isSectionVisible ? 'is-visible' : ''}`}>
      {/* Refracting Glass Background Effect */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-30">
          <div className="w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/30 via-blue-500/10 to-cyan-500/30 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
             {/* Decorative Line */}
             <div className="w-1 h-20 bg-gradient-to-b from-transparent via-cyan-500 to-transparent mx-auto mb-8 opacity-50"></div>

             <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 mb-8 leading-[1.1] uppercase tracking-tight">
                BIẾN Ý TƯỞNG <br/> THÀNH <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">HIỆN THỰC</span>
             </h2>

             <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed font-light">
                {aboutConfig.description || "Tại IQ Technology, chúng tôi chuyển hóa những thách thức phức tạp thành các giải pháp tinh tế thông qua sự hội tụ của công nghệ tiên tiến và thiết kế tầm nhìn. Mọi dự án là một lăng kính của những khả năng đang chờ được khám phá."}
             </p>

             <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
                {aboutConfig.features.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center p-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-cyan-400 text-xl">
                            <i className={item.icon || 'fas fa-star'}></i>
                        </div>
                        <h4 className="font-bold text-white uppercase tracking-wide text-sm">{item.title}</h4>
                    </div>
                ))}
             </div>

             <div className="mt-12">
                <Link to={aboutConfig.buttonLink || '/about'}>
                    <MovingBorderButton>
                        {aboutConfig.buttonText || "KHÁM PHÁ THÊM"}
                    </MovingBorderButton>
                </Link>
             </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAboutIts;

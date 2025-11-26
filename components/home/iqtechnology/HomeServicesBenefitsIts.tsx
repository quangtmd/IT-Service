
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { SiteSettings, HomepageServiceBenefit } from '../../../types';
import NeonGradientCard from '../../ui/NeonGradientCard';
import MovingBorderButton from '../../ui/MovingBorderButton';

const ServiceBenefitCard: React.FC<{ item: HomepageServiceBenefit; index: number }> = ({ item, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <div
        ref={ref}
        className={`animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} h-full`}
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <NeonGradientCard className="h-full flex flex-col">
             {/* Image Area */}
             <div className="relative h-48 mb-6 overflow-hidden rounded-lg flex-shrink-0 group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10"></div>
                <img 
                    src={item.bgImageUrlSeed ? `https://source.unsplash.com/seed/${item.bgImageUrlSeed}/500/300` : (item.link ? `https://source.unsplash.com/500x300/?tech,${index}` : `https://source.unsplash.com/500x300/?cyber,future,${index}`)} 
                    alt={item.title} 
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                />
                {/* Tech Icon overlay */}
                <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-md p-2 rounded-md border border-white/10">
                     <i className={`${item.iconClass || 'fas fa-microchip'} text-cyan-400 text-xl`}></i>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-cyan-300 transition-colors">
                    {item.title}
                </h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                    {item.description}
                </p>

                {/* Tags (Mocked for style matching) */}
                <div className="flex flex-wrap gap-2 mb-6">
                     <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-purple-300 font-mono uppercase tracking-wider">Lõi</span>
                     <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-blue-300 font-mono uppercase tracking-wider">Hệ Thống</span>
                </div>

                <Link to={item.link || '/services'} className="mt-auto">
                    <MovingBorderButton className="w-full group">
                        KHÁM PHÁ <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </MovingBorderButton>
                </Link>
            </div>
        </NeonGradientCard>
    </div>
  );
};

const HomeServicesBenefitsIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const servicesBenefitsConfig = settings.homepageServicesBenefits;

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

  if (!servicesBenefitsConfig.enabled) return null;

  const sortedBenefits = [...servicesBenefitsConfig.benefits].sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="py-24 bg-[#020617] text-white relative overflow-hidden">
       {/* Background Pattern */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={titleRef} className={`text-center mb-16 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-bold tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              {servicesBenefitsConfig.preTitle || "DỊCH VỤ CỐT LÕI"}
           </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight font-sans">
            {servicesBenefitsConfig.title || "Giải Pháp Dịch Vụ"}
          </h2>
        </div>
        
        {sortedBenefits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedBenefits.map((item, index) => (
                <ServiceBenefitCard key={item.id} item={item} index={index} />
            ))}
            </div>
        ) : (
            <p className="text-center text-gray-500">Đang cập nhật dịch vụ...</p>
        )}
      </div>
    </section>
  );
};

export default HomeServicesBenefitsIts;

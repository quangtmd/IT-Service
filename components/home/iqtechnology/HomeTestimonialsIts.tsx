
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageTestimonialItem } from '../../../types';
import { Canvas } from '@react-three/fiber';
import CyberShape from '../three/CyberShape';
import TiltCard from '../../ui/TiltCard';

interface TestimonialCardProps {
  testimonial: HomepageTestimonialItem;
  index: number;
}

const TestimonialCardIts: React.FC<TestimonialCardProps> = ({ testimonial, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  return (
    <div 
        ref={ref} 
        className={`animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} h-full`}
        style={{ animationDelay: `${index * 100}ms` }}
    >
      <TiltCard className="h-full">
        <div className="relative p-8 flex flex-col h-full bg-slate-900/60 backdrop-blur-lg rounded-2xl border-2 border-white/5 shadow-2xl hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300">
          <i className="fas fa-quote-right absolute top-8 right-8 text-6xl text-white/5"></i>
          
          <div className="flex items-center mb-6 relative z-10">
              <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg">
                 <img src={testimonial.avatarUrl || `https://picsum.photos/seed/avatarModern${index}/100/100`} alt={testimonial.name} className="w-full h-full rounded-full object-cover border-2 border-black" />
              </div>
              <div className="ml-4 text-left">
                  <h5 className="text-lg font-bold text-white">{testimonial.name}</h5>
                  <span className="text-xs text-cyan-400 font-mono uppercase tracking-wider">{testimonial.role || 'Khách hàng'}</span>
              </div>
          </div>
        
          <blockquote className="text-gray-300 italic mb-6 leading-relaxed flex-grow text-base text-left relative z-10 font-light">
            <p>"{testimonial.quote}"</p>
          </blockquote>

          <div className="mt-auto text-left text-yellow-500 relative z-10 text-sm">
              <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i>
          </div>
        </div>
      </TiltCard>
    </div>
  );
};

const HomeTestimonialsIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  
  const testimonialsConfig = settings.homepageTestimonials;

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

  if (!testimonialsConfig.enabled || !testimonialsConfig.testimonials || testimonialsConfig.testimonials.length === 0) return null;
  
  const sortedTestimonials = [...testimonialsConfig.testimonials].sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="home-section relative bg-[#0B1120] text-white overflow-hidden py-28">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
            <Canvas>
                <Suspense fallback={null}>
                    <CyberShape />
                </Suspense>
            </Canvas>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-[#0B1120] z-0 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''} text-center mb-20`}>
          {testimonialsConfig.preTitle && (
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-300 text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
              {testimonialsConfig.sectionTitleIconUrl && <img src={testimonialsConfig.sectionTitleIconUrl} alt="" className="w-4 h-4 mr-2 object-contain" />}
              {testimonialsConfig.preTitle}
            </span>
          )}
          <h2 className="home-section-title text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            {testimonialsConfig.title || "Khách Hàng Nói Gì Về Chúng Tôi"}
          </h2>
           <p className="home-section-subtitle text-gray-400 text-lg font-light">
            Lắng nghe trực tiếp từ những người đã trải nghiệm dịch vụ và sự hỗ trợ hàng đầu của chúng tôi.
          </p>
        </div>
        
        {sortedTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedTestimonials.slice(0,3).map((testimonial, index) => (
                <TestimonialCardIts key={testimonial.id} testimonial={testimonial} index={index} />
            ))}
            </div>
        ): (
            <p className="text-center text-textMuted">Các đánh giá đang được cập nhật.</p>
        )}
      </div>
    </section>
  );
};

export default HomeTestimonialsIts;

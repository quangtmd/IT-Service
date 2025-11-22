
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
        <div className="relative p-6 md:p-8 flex flex-col h-full bg-slate-800/40 backdrop-blur-lg rounded-2xl border-2 border-white/10 shadow-2xl hover:border-primary/70 hover:shadow-primary/20 transition-all duration-300">
          <i className="fas fa-quote-right absolute top-6 right-6 text-5xl text-white/5"></i>
          
          <div className="flex items-center mb-4 relative z-10">
              <img src={testimonial.avatarUrl || `https://picsum.photos/seed/avatarModern${index}/100/100`} alt={testimonial.name} className="w-14 h-14 rounded-full shadow-lg border-2 border-white/20 object-cover" />
              <div className="ml-4 text-left">
                  <h5 className="text-md font-bold text-white">{testimonial.name}</h5>
                  <span className="text-xs text-primary font-medium">{testimonial.role || 'Khách hàng'}</span>
              </div>
          </div>
        
          <blockquote className="text-gray-300 italic mb-4 leading-relaxed flex-grow text-md text-left relative z-10">
            <p>"{testimonial.quote}"</p>
          </blockquote>

          <div className="mt-auto text-left text-yellow-400 relative z-10">
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

  if (!testimonialsConfig.enabled || !testimonialsConfig.testimonials || testimonialsConfig.testimonials.length === 0) return null;
  
  const sortedTestimonials = [...testimonialsConfig.testimonials].sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="home-section relative bg-[#0B1120] text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-50">
            <Canvas>
                <Suspense fallback={null}>
                    <CyberShape />
                </Suspense>
            </Canvas>
        </div>
      <div className="container mx-auto px-4 relative z-10">
        <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
          {testimonialsConfig.preTitle && (
            <span className="home-section-pretitle bg-black/40 backdrop-blur-md border border-primary/30 text-primary">
              {testimonialsConfig.sectionTitleIconUrl && <img src={testimonialsConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
              {testimonialsConfig.preTitle}
            </span>
          )}
          <h2 className="home-section-title text-4xl md:text-5xl font-extrabold text-white">
            {testimonialsConfig.title || "Khách Hàng Nói Gì Về Chúng Tôi"}
          </h2>
           <p className="home-section-subtitle text-gray-300">
            Lắng nghe trực tiếp từ những người đã trải nghiệm dịch vụ và sự hỗ trợ hàng đầu của chúng tôi.
          </p>
        </div>
        
        {sortedTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedTestimonials.slice(0,3).map((testimonial, index) => ( // Show up to 3 testimonials
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

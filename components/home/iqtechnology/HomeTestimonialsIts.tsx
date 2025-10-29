import React, { useState, useEffect, useCallback } from 'react';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageTestimonialItem } from '../../../types';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';

interface TestimonialCardProps {
  testimonial: HomepageTestimonialItem;
  index: number;
}

const TestimonialCardIts: React.FC<TestimonialCardProps> = ({ testimonial, index }) => {
  return (
    <div 
        className="testimonial-card-its p-6 md:p-8 flex flex-col"
    >
        <i className="fas fa-quote-right quote-icon"></i>
        <div className="flex items-center mb-4">
            <img src={testimonial.avatarUrl || `https://picsum.photos/seed/avatarModern${index}/100/100`} alt={testimonial.name} className="w-14 h-14 rounded-full shadow-lg border-2 border-white object-cover" />
            <div className="ml-4 text-left">
                <h5 className="text-md font-bold text-textBase">{testimonial.name}</h5>
                <span className="text-xs text-primary font-medium">{testimonial.role || 'Valued Customer'}</span>
            </div>
        </div>
      
        <blockquote className="text-textMuted italic mb-4 leading-relaxed flex-grow text-md text-left">
          <p>"{testimonial.quote}"</p>
        </blockquote>

        <div className="mt-auto text-left text-yellow-400">
            <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i>
        </div>
    </div>
  );
};

const HomeTestimonialsIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
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
    <section ref={ref} className={`bg-bgCanvas animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="home-section-title-area">
          {testimonialsConfig.preTitle && (
            <span className="home-section-pretitle">
              {testimonialsConfig.sectionTitleIconUrl && <img src={testimonialsConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
              {testimonialsConfig.preTitle}
            </span>
          )}
          <h2 className="home-section-title text-4xl md:text-5xl font-extrabold">
            {testimonialsConfig.title || "What Our Clients Say"}
          </h2>
           <p className="home-section-subtitle">
            Hear directly from those who've experienced our top-notch services and support.
          </p>
        </div>
        
        {sortedTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedTestimonials.slice(0,3).map((testimonial, index) => ( // Show up to 3 testimonials
                <TestimonialCardIts key={testimonial.id} testimonial={testimonial} index={index} />
            ))}
            </div>
        ): (
            <p className="text-center text-textMuted">Testimonials are being updated.</p>
        )}
      </div>
    </section>
  );
};

export default HomeTestimonialsIts;
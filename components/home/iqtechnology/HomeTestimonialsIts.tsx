

import React, { useState, useEffect, useCallback } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
import { SiteSettings, HomepageTestimonialItem } from '../../../types';

interface TestimonialCardProps {
  testimonial: HomepageTestimonialItem;
  index: number;
}

const TestimonialCardIts: React.FC<TestimonialCardProps> = ({ testimonial, index }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  return (
    <div 
        ref={ref} 
        className={`modern-card p-6 md:p-8 animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} flex flex-col items-center text-center`}
        style={{ animationDelay: `${index * 150}ms` }}
    >
      <img src={testimonial.avatarUrl || `https://picsum.photos/seed/avatarModern${index}/100/100`} alt={testimonial.name} className="w-20 h-20 rounded-full mb-5 shadow-lg border-4 border-white object-cover" />
      <div className="text-yellow-400 mb-4 text-lg">
            <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i>
      </div>
      <p className="text-textMuted italic mb-6 leading-relaxed flex-grow text-md">"{testimonial.quote}"</p>
      <div className="mt-auto">
        <h5 className="text-lg font-semibold text-textBase">{testimonial.name}</h5>
        <span className="text-sm text-primary font-medium">{testimonial.role || 'Valued Customer'}</span>
      </div>
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
    <section className="home-section bg-bgCanvas"> {/* Changed to bgCanvas for lighter feel */}
      <div className="container mx-auto px-4">
        <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
          <div className="inline-block bg-bgBase p-4 md:p-6 rounded-lg shadow-md border border-borderDefault mb-4">
            {testimonialsConfig.preTitle && (
              <span className="home-section-pretitle text-primary">
                {testimonialsConfig.sectionTitleIconUrl && <img src={testimonialsConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
                 <img src={settings.siteLogoUrl || ''} onError={(e) => (e.currentTarget.style.display = 'none')} alt={`${settings.companyName} logo`} className="inline h-6 mr-2 object-contain" /> 
                {testimonialsConfig.preTitle}
              </span>
            )}
            <h2 className="home-section-title text-4xl md:text-5xl font-extrabold !mb-0">
              {testimonialsConfig.title || "What Our Clients Say"}
            </h2>
          </div>
           <p className="home-section-subtitle mt-3">
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

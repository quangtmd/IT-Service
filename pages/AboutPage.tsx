

import React, { useState, useEffect, useCallback } from 'react';
import { SITE_CONFIG_STORAGE_KEY, INITIAL_SITE_SETTINGS } from '../constants';
import { SiteSettings, TeamMember, StoreImage } from '../types';
import Markdown from 'react-markdown';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

const AboutPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [contentRef, isContentVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [teamRef, isTeamVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const [storeRef, isStoreVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });


  const loadSettings = useCallback(() => {
    const storedSettings = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      setSettings(INITIAL_SITE_SETTINGS);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => {
      window.removeEventListener('siteSettingsUpdated', loadSettings);
    };
  }, [loadSettings]);

  return (
    <div className="bg-bgCanvas">
      <div className="py-16 md:py-24 bg-primary text-white text-center">
        <div className="container mx-auto px-4 animate-on-scroll fade-in-up is-visible">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{settings.aboutPageTitle}</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-red-100">
            {settings.aboutPageSubtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 text-textBase">
        <section ref={contentRef} className={`mb-12 md:mb-16 animate-on-scroll fade-in-up ${isContentVisible ? 'is-visible' : ''}`}>
          <h2 className="text-3xl font-semibold text-textBase mb-6 text-center">Câu Chuyện Của {settings.companyName}</h2>
          <div className="prose prose-lg max-w-3xl mx-auto text-textMuted leading-relaxed bg-bgBase p-6 sm:p-8 rounded-lg shadow-lg border border-borderDefault">
            <Markdown>{settings.ourStoryContentMarkdown || "Nội dung câu chuyện của chúng tôi đang được cập nhật..."}</Markdown>
          </div>
        </section>

        <section ref={contentRef} className={`mb-12 md:mb-16 grid md:grid-cols-2 gap-8 items-center animate-on-scroll fade-in-up ${isContentVisible ? 'is-visible' : ''}`} style={{animationDelay: '0.2s'}}>
          <div className="order-2 md:order-1 bg-bgBase p-6 sm:p-8 rounded-lg shadow-lg border border-borderDefault">
            <h2 className="text-3xl font-semibold text-textBase mb-6">Sứ Mệnh & Tầm Nhìn</h2>
            <div className="text-textMuted space-y-6 prose prose-headings:text-primary prose-strong:text-textBase">
              <div>
                <h3 className="text-xl font-semibold mb-2">Sứ mệnh:</h3>
                <Markdown>{settings.missionStatementMarkdown || "Sứ mệnh của chúng tôi đang được cập nhật..."}</Markdown>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Tầm nhìn:</h3>
                <Markdown>{settings.visionStatementMarkdown || "Tầm nhìn của chúng tôi đang được cập nhật..."}</Markdown>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img 
                src={settings.storeImages && settings.storeImages.length > 0 && settings.storeImages[0].url ? settings.storeImages[0].url : "https://picsum.photos/seed/about_mission_vision/600/400"} 
                alt="Hình ảnh Sứ mệnh và Tầm nhìn" 
                className="rounded-lg shadow-xl w-full h-auto object-cover border-2 border-borderDefault"
            />
          </div>
        </section>

        {settings.teamMembers && settings.teamMembers.length > 0 && (
          <section ref={teamRef} className={`mb-12 md:mb-16 text-center animate-on-scroll fade-in-up ${isTeamVisible ? 'is-visible' : ''}`} style={{animationDelay: '0.4s'}}>
            <h2 className="text-3xl font-semibold text-textBase mb-10">Đội Ngũ Của Chúng Tôi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {settings.teamMembers.map((member: TeamMember) => (
                <div key={member.id} className="bg-bgBase p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-borderDefault transform hover:-translate-y-1">
                  <img 
                    src={member.imageUrl || `https://picsum.photos/seed/team_${member.id}/200/200`} 
                    alt={member.name} 
                    className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-primary/20 object-cover" 
                  />
                  <h3 className="text-xl font-semibold text-textBase mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-textMuted italic leading-relaxed">"{member.quote}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {settings.storeImages && settings.storeImages.length > 0 && (
          <section ref={storeRef} className={`text-center animate-on-scroll fade-in-up ${isStoreVisible ? 'is-visible' : ''}`} style={{animationDelay: '0.6s'}}>
            <h2 className="text-3xl font-semibold text-textBase mb-10">Hình Ảnh Cửa Hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settings.storeImages.map((image: StoreImage) => (
                <figure key={image.id} className="bg-bgBase p-3 rounded-lg shadow-lg border border-borderDefault">
                  <img 
                    src={image.url || `https://picsum.photos/seed/store_${image.id}/600/350`} 
                    alt={image.caption || "Hình ảnh cửa hàng"} 
                    className="rounded-md shadow w-full h-auto object-cover"
                  />
                  {image.caption && <figcaption className="text-sm text-textMuted mt-3 italic">{image.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AboutPage;

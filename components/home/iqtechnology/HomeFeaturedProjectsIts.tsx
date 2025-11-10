import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom'; // Link is compatible with v6/v7
import Button from '../../ui/Button';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants';
import { MOCK_SERVICES } from '../../../data/mockData';
import { SiteSettings, Service } from '../../../types';

interface ProjectItemProps {
  item: Service;
  index: number;
}

const ProjectCardIts: React.FC<ProjectItemProps> = ({ item, index }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const placeholderImg = item.imageUrl || `https://picsum.photos/seed/modernService${item.id.replace(/\D/g,'') || index}/500/350`;

    return (
        <div
            ref={ref}
            className={`modern-card group animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} flex flex-col relative`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <ReactRouterDOM.Link to={`/service/${item.slug || item.id}`} className="block aspect-video overflow-hidden rounded-t-lg">
                <img src={placeholderImg} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </ReactRouterDOM.Link>
            <div className="p-6 flex flex-col flex-grow relative z-10"> {/* Ensure content is above pseudo-element */}
                <div className="flex items-center mb-3 text-primary">
                    <i className={`${item.icon || 'fas fa-cogs'} text-xl mr-3 opacity-80`}></i>
                </div>
                <h3 className="modern-card-title mb-3">
                     <ReactRouterDOM.Link to={`/service/${item.slug || item.id}`} className="line-clamp-2">{item.name}</ReactRouterDOM.Link>
                </h3>
                <p className="modern-card-description mb-5 line-clamp-3 flex-grow">{item.description}</p>
                <div className="mt-auto">
                    <ReactRouterDOM.Link
                        to={`/service/${item.slug || item.id}`}
                        className="modern-card-link self-start"
                    >
                        Chi tiết dịch vụ <i className="fas fa-arrow-right text-xs ml-1"></i>
                    </ReactRouterDOM.Link>
                </div>
            </div>
        </div>
    );
}


const HomeFeaturedProjectsIts: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(Constants.INITIAL_SITE_SETTINGS);
  const [titleRef, isTitleVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const projectsConfig = settings.homepageFeaturedProjects;

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

  if (!projectsConfig.enabled) return null;

  const featuredItems = projectsConfig.featuredServiceIds
    .map(id => MOCK_SERVICES.find(service => service.id === id))
    .filter(Boolean) as Service[];

  return (
    <section className="home-section bg-bgCanvas">
      <div className="container mx-auto px-4">
        <div ref={titleRef} className={`home-section-title-area animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`}>
            {projectsConfig.preTitle && (
              <span className="home-section-pretitle">
                {projectsConfig.sectionTitleIconUrl && <img src={projectsConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
                {projectsConfig.preTitle}
              </span>
            )}
            <h2 className="home-section-title text-4xl md:text-5xl font-extrabold">
              {projectsConfig.title || "Các Dịch Vụ Chính Của Chúng Tôi"}
            </h2>
            <p className="home-section-subtitle">
              Khám phá loạt dịch vụ CNTT chuyên nghiệp của chúng tôi được thiết kế để nâng tầm doanh nghiệp của bạn.
            </p>
        </div>

        {featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredItems.slice(0,3).map((item, index) => ( 
                    <ProjectCardIts key={item.id} item={item} index={index} />
                ))}
            </div>
        ) : (
            <p className="text-center text-textMuted">Các dịch vụ nổi bật đang được cập nhật.</p>
        )}

        {projectsConfig.buttonLink && projectsConfig.buttonText && featuredItems.length > 0 && (
            <div className={`text-center mt-12 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`} style={{animationDelay: '0.3s'}}>
                <ReactRouterDOM.Link to={projectsConfig.buttonLink}>
                <Button variant="primary" size="lg" className="px-10 py-3.5 text-base shadow-lg hover:shadow-primary/40">
                    {projectsConfig.buttonText} <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </Button>
                </ReactRouterDOM.Link>
            </div>
        )}
      </div>
    </section>
  );
};

export default HomeFeaturedProjectsIts;
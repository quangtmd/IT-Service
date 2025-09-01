
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Link is compatible with v6/v7
import Button from '../../ui/Button';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import * as Constants from '../../../constants.tsx';
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
            className={`modern-card group animate-on-scroll fade-in-up ${isVisible ? 'is-visible' : ''} flex flex-col`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <Link to={`/service/${item.slug || item.id}`} className="block aspect-video overflow-hidden rounded-t-xl">
                <img src={placeholderImg} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <div className="p-6 flex flex-col flex-grow">
                 <div className="flex items-center mb-3 text-primary">
                    <i className={`${item.icon || 'fas fa-cogs'} text-xl mr-3 opacity-80`}></i>
                    <span className="text-sm font-semibold uppercase tracking-wider">{item.name.split(' ')[0]} Service</span>
                </div>
                <h3 className="text-xl font-semibold text-textBase mb-3 group-hover:text-primary transition-colors">
                    <Link to={`/service/${item.slug || item.id}`} className="line-clamp-2">{item.name}</Link>
                </h3>
                <p className="text-sm text-textMuted mb-5 line-clamp-3 flex-grow">{item.description}</p>
                <Link
                    to={`/service/${item.slug || item.id}`}
                    className="modern-card-link mt-auto self-start"
                >
                    Chi tiết dịch vụ <i className="fas fa-arrow-right text-xs ml-1"></i>
                </Link>
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
            <div className="inline-block bg-bgBase p-4 md:p-6 rounded-lg shadow-md border border-borderDefault mb-4">
              {projectsConfig.preTitle && (
                <span className="home-section-pretitle text-primary">
                  {projectsConfig.sectionTitleIconUrl && <img src={projectsConfig.sectionTitleIconUrl} alt="" className="w-7 h-7 mr-2 object-contain" />}
                  <img src={settings.siteLogoUrl || ''} onError={(e) => (e.currentTarget.style.display = 'none')} alt={`${settings.companyName} logo`} className="inline h-6 mr-2 object-contain" />
                  {projectsConfig.preTitle}
                </span>
              )}
              <h2 className="home-section-title text-4xl md:text-5xl font-extrabold !mb-0">
                {projectsConfig.title || "Our Key Services"}
              </h2>
            </div>
            <p className="home-section-subtitle mt-3">
              Explore our range of expert IT services designed to elevate your business.
            </p>
        </div>

        {featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredItems.slice(0,3).map((item, index) => ( 
                    <ProjectCardIts key={item.id} item={item} index={index} />
                ))}
            </div>
        ) : (
            <p className="text-center text-textMuted">Featured services are being updated.</p>
        )}

        {projectsConfig.buttonLink && projectsConfig.buttonText && featuredItems.length > 0 && (
            <div className={`text-center mt-12 animate-on-scroll fade-in-up ${isTitleVisible ? 'is-visible' : ''}`} style={{animationDelay: '0.3s'}}>
                <Link to={projectsConfig.buttonLink}>
                <Button variant="primary" size="lg" className="px-10 py-3.5 text-base shadow-lg hover:shadow-primary/40">
                    {projectsConfig.buttonText} <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </Button>
                </Link>
            </div>
        )}
      </div>
    </section>
  );
};

export default HomeFeaturedProjectsIts;
